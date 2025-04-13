import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import puppeteer from "puppeteer";
import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to capture screenshot of store homepage
async function captureStoreScreenshot(storeUrl: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(storeUrl, { waitUntil: "networkidle2" });
    const screenshot = await page.screenshot({ type: "png" });
    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
}

// Function to generate landscape prompt from screenshot using OpenAI
async function generateVibePrompt(screenshot: Buffer, mode: string): Promise<string> {
  const promptBase =
    mode === "city"
      ? `Imagine this store as a physical city. Describe the atmosphere, architecture, and the kind of people you'd see there. Be poetic but vivid. End the description with a dominant hex color.`
      : `Describe this store as a visual brand moodboard. Include design elements like color palette, texture, tone, and shopper archetype. End with a dominant hex color.`

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


// Function to generate image using DALL-E 3
async function generateImage(vibePrompt: string, mode: string): Promise<string> {
  const dallEPrompt =
    mode === "city"
      ? `Create a visual representation of a city based on this description: ${vibePrompt}`
      : `Generate a stylized brand mood board image based on this description: ${vibePrompt}`;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: dallEPrompt,
    n: 1,
    size: "1024x1024",
  });

  return response.data[0].url || "https://example.com/fallback-image.jpg";
}


export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { storeUrl, mode = "moodboard" } = await request.json();

    // 1. Capture screenshot of the store
    const screenshot = await captureStoreScreenshot(storeUrl);

    // 2. Generate vibe prompt based on screenshot
    const vibePrompt = await generateVibePrompt(screenshot, mode);

    // 3. Generate image using the prompt
    const imageUrl = await generateImage(vibePrompt, mode);

    return json({
      vibePrompt,
      imageUrl,
      storeUrl,
      mode
    });
  } catch (error) {
    console.error("Error generating store vibe:", error);
    return json(
      { error: "Failed to generate store vibe", details: (error as Error).message },
      { status: 500 }
    );
  }
} 