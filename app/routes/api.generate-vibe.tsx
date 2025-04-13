//ai.generate-vibe

import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { OpenAI } from "openai";
import { v2 as cloudinary } from 'cloudinary';
import { connectToDatabase, getClientIp } from '~/utils/db.server';
import { checkRateLimit } from '~/utils/rate-limiter';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to capture screenshot of store homepage using Browserless
async function captureStoreScreenshot(storeUrl: string): Promise<Buffer> {
  try {
    // Make sure URL has proper format
    let normalizedUrl = storeUrl;
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    console.log(`Attempting to capture screenshot for: ${normalizedUrl}`);
    
    const apiUrl = `https://production-sfo.browserless.io/screenshot?token=${process.env.BROWSERLESS_API_KEY}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        url: normalizedUrl,
        options: {
          type: 'png',
          fullPage: false
        },
        gotoOptions: { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        },
        bestAttempt: true
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Browserless error response: ${errorText}`);
      throw new Error(`Screenshot service responded with ${response.status}: ${response.statusText}. Details: ${errorText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error capturing screenshot:", error);
    throw error;
  }
}

// Function to generate landscape prompt from screenshot using OpenAI
async function generateVibePrompt(screenshot: Buffer, mode: string): Promise<string> {
  let promptBase;
  
  switch (mode) {
    case "city":
      promptBase = `Imagine this store as a physical city. Describe the atmosphere, architecture, and the kind of people you'd see there. Be poetic but vivid. End the description with a dominant hex color.`;
      break;
    case "cover":
      promptBase = `Imagine this store had a magazine cover or album artwork. Describe the visual style, typography, imagery, and overall aesthetic it would have. Include what genre of magazine or music it would be. End with a dominant hex color.`;
      break;
    default: // moodboard
      promptBase = `Describe this store as a visual brand moodboard. Include design elements like color palette, texture, tone, and shopper archetype. End with a dominant hex color.`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: promptBase },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${screenshot.toString("base64")}`,
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  });

  return response.choices[0].message.content || "Visual summary unavailable.";
}

// Function to upload image to Cloudinary
async function uploadToCloudinary(imageUrl: string, storeUrl: string, mode: string): Promise<string> {
  try {
    // Create a "clean" store URL for the resource name (remove https://, www., etc)
    const cleanStoreUrl = storeUrl.replace(/^(https?:\/\/)?(www\.)?/i, '').replace(/[^\w-]/g, '-');
    
    // Generate a timestamp for uniqueness
    const timestamp = Date.now();
    
    // Upload the image
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'store-vibes',
      public_id: `${cleanStoreUrl}-${mode}-${timestamp}`,
      tags: [mode, cleanStoreUrl],
      resource_type: 'image'
    });
    
    console.log(`Image uploaded to Cloudinary: ${result.secure_url}`);
    
    // Return the secure URL
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    // Return the original URL if upload fails
    return imageUrl;
  }
}

// Function to save vibe data to MongoDB
async function saveVibeToDatabase(data: {
  storeUrl: string;
  mode: string;
  vibePrompt: string;
  imageUrl: string;
  ipAddress?: string;
}, db: any) {
  try {
    const collection = db.collection("vibeResults");
    
    const result = await collection.insertOne({
      ...data,
      createdAt: new Date(),
      isPublic: true, // You can set this based on user preference in the future
    });
    
    console.log(`Vibe data saved to MongoDB with ID: ${result.insertedId}`);
    return result.insertedId;
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    // We don't throw here to prevent the API from failing if DB save fails
    return null;
  }
}

// Function to generate image using DALL-E 3
async function generateImage(vibePrompt: string, mode: string, storeUrl: string): Promise<string> {
  // Extract color if present in the text
  let colorMatch = vibePrompt.match(/#[0-9A-F]{6}/i);
  let dominantColor = colorMatch ? colorMatch[0] : "";
  
  let dallEPrompt;
  
  switch (mode) {
    case "city":
      dallEPrompt = `Create a stunning, vibrant cityscape inspired by this description: ${vibePrompt}. 
      Make it visually striking with dramatic lighting, interesting perspective, and atmospheric elements.
      Include distinctive architectural elements, creative urban details, and a sense of life and movement.
      The image should feel cinematic and emotionally evocative, as if from an award-winning animated film.
      Use ${dominantColor || "the color palette mentioned"} as inspiration but enhance with complementary tones.`;
      break;
      
    case "cover":
      dallEPrompt = `Design a bold, eye-catching magazine cover or album artwork based on: ${vibePrompt}.
      Create something that would stand out on a newsstand or streaming platform.
      Use striking typography, innovative composition, and artistic visual elements.
      The design should be trendy yet timeless, with high contrast and visual impact.
      Incorporate ${dominantColor || "the color palette mentioned"} but amplify with interesting visual textures and gradients.
      Make it worthy of a prestigious design award - avoid generic or simplistic imagery.`;
      break;
      
    default: // moodboard
      dallEPrompt = `Create a rich, visually compelling brand mood board based on: ${vibePrompt}.
      Include diverse design elements arranged in an interesting composition - fabric textures, color swatches, typography samples, 
      material finishes, inspirational imagery, and creative directional elements.
      Make it appear as a professionally designed collage with depth, shadow effects, and layered elements.
      Use ${dominantColor || "the color palette mentioned"} as a foundation but enhance with complementary accent colors.
      The image should feel curated, aspirational, and worthy of a design portfolio.`;
  }

  // Generate image with DALL-E
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: dallEPrompt,
    n: 1,
    size: "1024x1024",
    style: "vivid"
  });

  const tempImageUrl = response.data[0].url || "https://example.com/fallback-image.jpg";
  
  // Upload to Cloudinary and get permanent URL
  const permanentImageUrl = await uploadToCloudinary(tempImageUrl, storeUrl, mode);
  
  // Return the Cloudinary URL
  return permanentImageUrl;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { db, client } = await connectToDatabase();
    
    // Get client IP address
    const ipAddress = getClientIp(request);
    
    // Check rate limit (10 generations per day)
    const rateLimit = await checkRateLimit(
      ipAddress,
      'generate-vibe',
      { 
        limit: 10, 
        window: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      },
      client
    );
    
    // If rate limit exceeded, return error
    if (!rateLimit.allowed) {
      return json({ 
        error: "Rate limit exceeded. Please try again later.",
        // Keep the rateLimitInfo in the response for internal/debugging purposes,
        // but don't display it in the UI
        rateLimitInfo: {
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt
        }
      }, { status: 429 });
    }
    
    const { storeUrl, mode = "moodboard" } = await request.json();

    // 1. Capture screenshot of the store
    const screenshot = await captureStoreScreenshot(storeUrl);

    // 2. Generate vibe prompt
    const vibePrompt = await generateVibePrompt(screenshot, mode);

    // 3. Generate image and save to Cloudinary
    const imageUrl = await generateImage(vibePrompt, mode, storeUrl);

    // 4. Save everything to MongoDB
    const dbId = await saveVibeToDatabase({
      storeUrl,
      mode,
      vibePrompt,
      imageUrl,
      ipAddress // Store the IP address for analytics
    }, db);

    return json({
      vibePrompt,
      imageUrl,
      storeUrl,
      mode,
      dbId,
      // Include rate limit info but don't display it in the UI
      // This is available for debugging and potential future admin features
      rateLimitInfo: {
        remaining: rateLimit.remaining - 1,
        resetAt: rateLimit.resetAt
      }
    });
  } catch (error) {
    console.error("Error generating store vibe:", error);
    return json(
      { error: "Failed to generate store vibe", details: (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 