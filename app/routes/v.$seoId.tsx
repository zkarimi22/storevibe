import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { isValidSeoId } from '~/utils/seo-utils';

/**
 * This route now redirects to the main vibe/:seoId route
 */
export async function loader({ params }: LoaderFunctionArgs) {
  try {
    const { seoId } = params;
    
    if (!seoId || !isValidSeoId(seoId)) {
      return redirect('/explore');
    }
    
    // Permanent redirect to the new route
    return redirect(`/vibe/${seoId}`, {
      status: 301 // Permanent redirect
    });
  } catch (error) {
    console.error("Error in redirect:", error);
    return redirect('/explore');
  }
} 