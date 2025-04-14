import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { connectToDatabase } from '~/utils/db.server';
import { isValidSeoId } from '~/utils/seo-utils';

/**
 * This route handles SEO-friendly URLs in the format /v/allbirds-2a2da9
 * and redirects to the actual vibe page
 */
export async function loader({ params, request }: LoaderFunctionArgs) {
  try {
    const { seoId } = params;
    
    if (!seoId || !isValidSeoId(seoId)) {
      return redirect('/explore');
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection("vibeResults");
    
    // Find the vibe using the SEO ID
    const vibe = await collection.findOne({ seoId });
    
    if (!vibe) {
      return redirect('/explore');
    }

    // Check if the request is from a social media crawler/bot
    const userAgent = request.headers.get('user-agent') || '';
    const isSocialCrawler = /facebookexternalhit|Twitterbot|Pinterest|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Discordbot|Snapchat|Instagram|vkShare|W3C_Validator|redditbot|Applebot/i.test(userAgent);
    
    // Log detected social crawler for debugging
    if (isSocialCrawler) {
      console.log(`Social media crawler detected: ${userAgent}`);
      return json({ vibe });
    }
    
    // For regular users, redirect to the vibe detail page using the MongoDB _id
    return redirect(`/vibe/${vibe._id}`);
  } catch (error) {
    console.error("Error finding vibe by SEO ID:", error);
    return redirect('/explore');
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  // If we don't have data (e.g., for error cases), return minimal meta tags
  if (!data || !data.vibe) {
    return [
      { title: "Vibe not found | Store Vibe Generator" },
      { name: "description", content: "The requested vibe could not be found." }
    ];
  }

  const { vibe } = data;
  const mode = vibe.mode === "city" 
    ? "City Visualization" 
    : vibe.mode === "cover" 
      ? "Magazine/Album Cover"
      : "Moodboard";

  return [
    { title: `${mode} for ${vibe.storeUrl} | Store Vibe Generator` },
    { name: "description", content: vibe.vibePrompt.substring(0, 160) },
    // Primary Meta Tags
    { name: "keywords", content: `Shopify, AI, ${vibe.mode}, store vibe, ecommerce, brand identity, ${vibe.storeUrl}` },
    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${process.env.PUBLIC_URL || 'https://storevibe.com'}/v/${vibe.seoId}` },
    { property: "og:title", content: `${mode} for ${vibe.storeUrl} | Store Vibe Generator` },
    { property: "og:description", content: vibe.vibePrompt.substring(0, 160) },
    { property: "og:image", content: vibe.imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: `${mode} for ${vibe.storeUrl} | Store Vibe Generator` },
    { name: "twitter:description", content: vibe.vibePrompt.substring(0, 160) },
    { name: "twitter:image", content: vibe.imageUrl },
    // Additional meta tags for better sharing
    { property: "og:site_name", content: "Store Vibe Generator" },
    { property: "og:ttl", content: "2419200" }, // 28 days cache for Facebook
  ];
}; 