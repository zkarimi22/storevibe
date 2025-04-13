import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { connectToDatabase } from '~/utils/db.server';
import { isValidSeoId } from '~/utils/seo-utils';

/**
 * This route handles SEO-friendly URLs in the format /v/allbirds-2a2da9
 * and redirects to the actual vibe page
 */
export async function loader({ params }: LoaderFunctionArgs) {
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
    
    // Redirect to the vibe detail page using the MongoDB _id
    return redirect(`/vibe/${vibe._id}`);
  } catch (error) {
    console.error("Error finding vibe by SEO ID:", error);
    return redirect('/explore');
  }
} 