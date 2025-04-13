//index

import type { MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import ReactMarkdown from 'react-markdown';
import {
  Page,
  LegacyCard,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
  Text,
  LegacyStack,
  Frame,
  Divider,
  Badge
} from '@shopify/polaris';

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

  const modeOptions = [
    { label: '🧵 Moodboard', value: 'moodboard' },
    { label: '🏙 Store as a City', value: 'city' },
    { label: '🎭 Magazine/Album Cover', value: 'cover' }
  ];

  return (
    <Frame>
      <Page
        title="Store Vibe Generator"
        subtitle="Generate an AI-powered brand vibe from your Shopify store."
        titleMetadata={
          <Badge tone="info">Beta</Badge>
        }
      >
        <LegacyCard sectioned>
          <Text variant="bodyMd" as="p">
            Enter your Shopify store URL to generate a unique vibe — as a brand moodboard, a poetic cityscape, or a stylish magazine/album cover.
          </Text>
          
          <div style={{ marginTop: '20px' }}>
            <Form method="post">
              <FormLayout>
                <div>
                  <label htmlFor="storeUrl" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'medium', color: 'var(--p-text)' }}>
                    Shopify Store URL <span style={{ color: 'var(--p-text-critical)' }}>*</span>
                  </label>
                  <input
                    type="url"
                    name="storeUrl"
                    id="storeUrl"
                    placeholder="https://your-store.myshopify.com"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--p-border-subdued)',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: '#202223',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 2px #5c6ac4';
                      e.target.style.borderColor = '#5c6ac4';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = 'var(--p-border-subdued)';
                    }}
                  />
                </div>
                
                <div>
                  <label htmlFor="mode" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'medium', color: 'var(--p-text)' }}>
                    Vibe Style
                  </label>
                  <select
                    name="mode"
                    id="mode"
                    defaultValue="moodboard"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--p-border-subdued)',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: '#202223',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 2px #5c6ac4';
                      e.target.style.borderColor = '#5c6ac4';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = 'var(--p-border-subdued)';
                    }}
                  >
                    <option value="moodboard">🧵 Moodboard</option>
                    <option value="city">🏙 Store as a City</option>
                    <option value="cover">🎭 Magazine/Album Cover</option>
                  </select>
                </div>
                
                <Button 
                  variant="primary"
                  submit
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  {isSubmitting ? "Generating..." : "Generate Store Vibe"}
                </Button>
              </FormLayout>
            </Form>
          </div>
        </LegacyCard>

        {actionData?.error && (
          <div style={{ marginTop: '20px' }}>
            <Banner tone="critical">
              <p>{actionData.error}</p>
            </Banner>
          </div>
        )}

        {actionData?.vibePrompt && !actionData.error && (
          <div style={{ marginTop: '20px' }}>
            <LegacyCard sectioned>
              <LegacyCard.Section title="Your Store Vibe">
                <Badge tone="success" progress="complete">
                  {
                    actionData.mode === "city" 
                      ? "🏙 Store as a City" 
                      : actionData.mode === "cover" 
                        ? "🎭 Magazine/Album Cover" 
                        : "🧵 Moodboard"
                  }
                </Badge>
                
                <div style={{ margin: '16px 0', borderBottom: '1px solid var(--p-border-subdued)' }}></div>
                
                <div style={{ marginTop: '16px', marginBottom: '20px', lineHeight: '1.6' }}>
                  <ReactMarkdown>{actionData.vibePrompt}</ReactMarkdown>
                </div>

                {actionData.imageUrl && (
                  <LegacyStack vertical>
                    <Text variant="headingMd" as="h3">Generated Image</Text>
                    <div style={{ 
                      border: '1px solid var(--p-border-subdued)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '16px'
                    }}>
                      <img
                        src={actionData.imageUrl}
                        alt="Generated store vibe visualization"
                        style={{ width: '100%', display: 'block' }}
                      />
                    </div>
                  </LegacyStack>
                )}

                <LegacyStack distribution="trailing">
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                    variant="primary"
                  >
                    Share your store vibe
                  </Button>
                </LegacyStack>
              </LegacyCard.Section>
            </LegacyCard>
          </div>
        )}
      </Page>
    </Frame>
  );
}
