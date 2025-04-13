//index


import type { MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import ReactMarkdown from 'react-markdown';

export const meta: MetaFunction = () => {
  return [
    { title: "Store Vibe Generator" },
    { name: "description", content: "Generate an AI moodboard, cityscape, or magazine/album cover based on your Shopify store." },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const storeUrl = formData.get("storeUrl") as string;
  const mode = formData.get("mode") as string || "moodboard";

  try {
    const url = new URL(request.url);
    const apiUrl = `${url.origin}/api/generate-vibe`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storeUrl, mode }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate store vibe");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return { error: "Failed to generate store vibe" };
  }
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Store Vibe Generator
          </h1>
          <p className="text-gray-600 mb-8">
            Enter your Shopify store URL to generate a unique vibe — as a brand moodboard, a poetic cityscape, or a stylish magazine/album cover.
          </p>
        </div>

        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="storeUrl" className="block text-sm font-medium text-gray-700">
              Shopify Store URL
            </label>
            <div className="mt-1">
              <input
                type="url"
                name="storeUrl"
                id="storeUrl"
                required
                placeholder="https://your-store.myshopify.com"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
              Vibe Style
            </label>
            <select
              name="mode"
              id="mode"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              defaultValue="moodboard"
            >
              <option value="moodboard">🧵 Moodboard</option>
              <option value="city">🏙 Store as a City</option>
              <option value="cover">🎭 Magazine/Album Cover</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? "Generating..." : "Generate Store Vibe"}
          </button>
        </Form>

        {actionData?.error && (
          <div className="mt-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">{actionData.error}</p>
            </div>
          </div>
        )}

        {actionData?.vibePrompt && !actionData.error && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Store Vibe
              </h2>

              <p className="text-sm text-gray-500 mb-2 italic">
                Style: {
                  actionData.mode === "city" 
                    ? "🏙 Store as a City" 
                    : actionData.mode === "cover" 
                      ? "🎭 Magazine/Album Cover" 
                      : "🧵 Moodboard"
                }
              </p>

              <div className="text-lg text-gray-700 mb-4 prose max-w-none">
                <ReactMarkdown>{actionData.vibePrompt}</ReactMarkdown>
              </div>

              {actionData.imageUrl && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Generated Image</h3>
                  <img
                    src={actionData.imageUrl}
                    alt="Generated store vibe visualization"
                    className="w-full rounded-lg mb-4"
                  />
                </div>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Share your store vibe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
