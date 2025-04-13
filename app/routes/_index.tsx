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
  Badge,
  ButtonGroup,
  Popover,
  ActionList,
  Toast,
  Scrollable
} from '@shopify/polaris';
import { useState, useEffect } from 'react';

// Sample showcase items - in a real app, these would come from a database or API
const showcaseItems = [
  {
    id: '1',
    mode: 'moodboard',
    storeUrl: 'allbirds.com',
    vibePrompt: 'Sustainable, earthy, and minimal with soft textures and natural tones. The color palette features muted greens, beiges, and sky blues. Appeals to eco-conscious millennials seeking comfort with purpose. #E5E5E0',
    imageUrl: 'https://picsum.photos/id/27/800/600'
  },
  {
    id: '2',
    mode: 'city',
    storeUrl: 'glossier.com',
    vibePrompt: 'A clean, pastel-colored district where glass buildings reflect soft pink skies. Wide promenades lined with minimalist boutiques. Young professionals stroll with confidence between beauty salons and cafés. #FFCBDB',
    imageUrl: 'https://picsum.photos/id/28/800/600'
  },
  {
    id: '3',
    mode: 'cover',
    storeUrl: 'nike.com',
    vibePrompt: 'Bold sports lifestyle magazine with dynamic typography and high-contrast action photography. Combines urban street style with performance athletics. Would fit in the activewear or fitness genre. #FF0000',
    imageUrl: 'https://picsum.photos/id/29/800/600'
  },
  {
    id: '4',
    mode: 'moodboard',
    storeUrl: 'apple.com',
    vibePrompt: 'Sleek, premium and minimalist with focus on clean lines and sophisticated typography. The color palette is monochromatic with hints of silver and space gray. Appeals to design-conscious professionals. #F5F5F7',
    imageUrl: 'https://picsum.photos/id/30/800/600'
  }
];

export const meta: MetaFunction = () => {
  return [
    { title: "Store Vibe Generator | AI Moodboards for Shopify Stores" },
    { name: "description", content: "Transform your Shopify store into AI-generated moodboards, cityscapes, or magazine covers. Visualize your brand's unique vibe with just one click." },
    // Primary Meta Tags
    { name: "keywords", content: "Shopify, AI, moodboard, store vibe, ecommerce, brand identity, marketing tool" },
    { name: "author", content: "Store Vibe Generator" },
    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://storevibe.zkarimi.com" },
    { property: "og:title", content: "Store Vibe Generator | AI Moodboards for Shopify Stores" },
    { property: "og:description", content: "Transform your Shopify store into AI-generated moodboards, cityscapes, or magazine covers. Visualize your brand's unique vibe with just one click." },
    { property: "og:image", content: "https://storevibe.zkarimi.com/og-image.png" },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: "https://storevibe.zkarimi.com/" },
    { name: "twitter:title", content: "Store Vibe Generator | AI Moodboards for Shopify Stores" },
    { name: "twitter:description", content: "Transform your Shopify store into AI-generated moodboards, cityscapes, or magazine covers. Visualize your brand's unique vibe with just one click." },
    { name: "twitter:image", content: "https://storevibe.zkarimi.com/og-image.png" },
    // Additional SEO
    { name: "robots", content: "index, follow" },
    { name: "language", content: "English" },
    { name: "revisit-after", content: "7 days" },
    // Add canonical URL to prevent duplicate content issues
    { tagName: "link", rel: "canonical", href: "https://storevibe.zkarimi.com/" },
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

    const data = await response.json();
    return data; // This now includes the dbId from the API
  } catch (error) {
    console.error("Error:", error);
    return { error: "Failed to generate store vibe" };
  }
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [popoverActive, setPopoverActive] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showShowcase, setShowShowcase] = useState(true);

  const togglePopoverActive = () => setPopoverActive(!popoverActive);
  
  const handleCopyToClipboard = () => {
    // Use SEO ID if available, otherwise use MongoDB ID, and fallback to window.location.href
    const shareUrl = actionData?.seoId 
      ? `${window.location.origin}/v/${actionData.seoId}`
      : actionData?.dbId 
        ? `${window.location.origin}/vibe/${actionData.dbId}`
        : window.location.href;
      
    navigator.clipboard.writeText(shareUrl);
    setToastMessage("Link copied to clipboard!");
    setShowToast(true);
    setPopoverActive(false);
  };

  const handleShareOnTwitter = () => {
    // Use SEO ID if available, otherwise use MongoDB ID, and fallback to window.location.href
    const shareUrl = actionData?.seoId 
      ? `${window.location.origin}/v/${actionData.seoId}`
      : actionData?.dbId 
        ? `${window.location.origin}/vibe/${actionData.dbId}`
        : window.location.href;
      
    const text = actionData?.mode === "city" 
      ? "Check out this AI-generated cityscape of my store!" 
      : actionData?.mode === "cover" 
        ? "Check out this AI-generated magazine cover for my store!" 
        : "Check out this AI-generated moodboard for my store!";
    
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, '_blank');
    setPopoverActive(false);
  };

  const handleShareOnFacebook = () => {
    // Use SEO ID if available, otherwise use MongoDB ID, and fallback to window.location.href
    const shareUrl = actionData?.seoId 
      ? `${window.location.origin}/v/${actionData.seoId}`
      : actionData?.dbId 
        ? `${window.location.origin}/vibe/${actionData.dbId}`
        : window.location.href;
      
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setPopoverActive(false);
  };

  const handleDownloadImage = () => {
    if (actionData?.imageUrl) {
      const link = document.createElement('a');
      link.href = actionData.imageUrl;
      link.download = `store-vibe-${actionData.mode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setPopoverActive(false);
    }
  };

  const modeOptions = [
    { label: '🧵 Moodboard', value: 'moodboard' },
    { label: '🏙 Store as a City', value: 'city' },
    { label: '🎭 Magazine/Album Cover', value: 'cover' }
  ];

  // Hide showcase when results are shown
  useEffect(() => {
    if (actionData?.vibePrompt && !actionData.error) {
      setShowShowcase(false);
    }
  }, [actionData]);

  return (
    <Frame>
      <Page
        title="Store Vibe Generator"
        subtitle="Generate an AI-powered brand vibe from your Shopify store."
        titleMetadata={
          <Badge tone="info">Beta</Badge>
        }
        primaryAction={{
          content: "Explore All Vibes",
          url: "/explore",
          accessibilityLabel: "Explore all generated vibes"
        }}
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
                    defaultValue="cover"
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
                  <ButtonGroup>
                    {(actionData.dbId || actionData.seoId) && (
                      <Button
                        url={actionData.seoId 
                          ? `/v/${actionData.seoId}` 
                          : `/vibe/${actionData.dbId}`}
                        variant="secondary"
                      >
                        View Permanent Page
                      </Button>
                    )}
                    <div>
                      <Popover
                        active={popoverActive}
                        activator={
                          <Button
                            onClick={togglePopoverActive}
                            variant="primary"
                          >
                            Share this vibe 🚀
                          </Button>
                        }
                        onClose={togglePopoverActive}
                      >
                        <ActionList
                          actionRole="menuitem"
                          items={[
                            {
                              content: 'Copy link',
                              onAction: handleCopyToClipboard,
                            },
                            {
                              content: 'Share on X',
                              onAction: handleShareOnTwitter,
                            },
                            {
                              content: 'Share on Facebook',
                              onAction: handleShareOnFacebook,
                            },
                            ...(actionData?.imageUrl ? [{
                              content: 'Download image',
                              onAction: handleDownloadImage,
                            }] : []),
                          ]}
                        />
                      </Popover>
                      {showToast && (
                        <Toast content={toastMessage} onDismiss={() => setShowToast(false)} />
                      )}
                    </div>
                  </ButtonGroup>
                </LegacyStack>
              </LegacyCard.Section>
            </LegacyCard>
          </div>
        )}

         {/* Showcase Slider */}
        {showShowcase && (
          <div style={{  marginBottom: '40px', paddingTop: '20px', backgroundColor: 'var(--p-surface-subdued)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 16px' }}>
              <Text variant="headingMd" as="h2">Explore Generated Vibes</Text>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="plain"
                  onClick={() => setShowShowcase(false)}
                >
                  Hide examples
                </Button>
                <Button
                  url="/explore"
                  variant="plain"
                >
                  See all →
                </Button>
              </div>
            </div>
            <Scrollable style={{ height: 'auto' }} horizontal>
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                padding: '8px 4px 16px 4px'
              }}>
                {showcaseItems.map((item) => (
                  <div 
                    key={item.id} 
                    style={{ 
                      width: '280px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--p-border-subdued)',
                      background: 'white',
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ height: '160px', overflow: 'hidden' }}>
                      <img
                        src={item.imageUrl}
                        alt={`${item.mode} example for ${item.storeUrl}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <Badge tone="success" progress="complete">
                          {
                            item.mode === "city" 
                              ? "🏙 Store as a City" 
                              : item.mode === "cover" 
                                ? "🎭 Magazine/Album Cover" 
                                : "🧵 Moodboard"
                          }
                        </Badge>
                        <span style={{ color: 'var(--p-text-subdued)', fontSize: '12px' }}>{item.storeUrl}</span>
                      </div>
                      <div style={{ maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Text variant="bodyMd" as="p">{item.vibePrompt.substring(0, 90)}...</Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Scrollable>
          </div>
        )}

        
      </Page>
    </Frame>
  );
}
