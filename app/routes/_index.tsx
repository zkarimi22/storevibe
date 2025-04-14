//index

import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
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
import React from 'react';
import { connectToDatabase } from '~/utils/db.server';
import { Link } from '@remix-run/react';

// Remove hardcoded showcase items
// const showcaseItems = [ ... ]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("vibeResults");
    
    // Get 4 most recent public vibes
    const showcaseItems = await collection
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .toArray();
    
    return json({ showcaseItems });
  } catch (error) {
    console.error("Error fetching showcase items:", error);
    return json({ showcaseItems: [] });
  }
};

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

// Add animations to tailwind.css or include them inline here
const gradientAnimations = `
@keyframes start-header-gradient-1 {
  0% {
    opacity: 0;
    transform: translate(-30%, 10%) rotate(-30deg) scale(0.8);
    background: #79DFFF;
    filter: blur(204px);
  }
  20% {
    opacity: 0.3;
    transform: translate(-27%, 7%) rotate(-30deg) scale(0.9);
    background: #79DFFF;
    filter: blur(204px);
  }
  50% {
    opacity: 0.8;
    transform: translate(-20%, 0%) rotate(-30deg) scale(1.05);
    background: #6A9DFF;
    filter: blur(204px);
  }
  100% {
    opacity: 1;
    transform: translate(-10%, -10%) rotate(-30deg) scale(1);
    background: #79DFFF;
    filter: blur(204px);
  }
}

@keyframes start-header-gradient-2 {
  0% {
    opacity: 0;
    transform: translate(-85%, -65%) rotate(80deg) scaleX(0.65) scale(0.8);
    background: linear-gradient(45deg, #79DFFF, #84C6C5);
    filter: blur(204px);
  }
  20% {
    opacity: 0.3;
    transform: translate(-82%, -68%) rotate(80deg) scaleX(0.65) scale(0.85);
    background: linear-gradient(45deg, #79DFFF, #84C6C5);
    filter: blur(204px);
  }
  50% {
    opacity: 0.8;
    transform: translate(-75%, -75%) rotate(80deg) scaleX(0.65) scale(1.05);
    background: linear-gradient(45deg, #F686BD, #A254FF);
    filter: blur(204px);
  }
  100% {
    opacity: 1;
    transform: translate(-65%, -85%) rotate(80deg) scaleX(0.65) scale(1);
    background: linear-gradient(45deg, #79DFFF, #84C6C5);
    filter: blur(204px);
  }
}

@keyframes start-header-gradient-3 {
  0% {
    opacity: 0;
    transform: translate(-20%, -35%) rotate(-50deg) scaleY(0.65) scale(0.8);
    background: #1CAA86;
    filter: blur(228px);
  }
  20% {
    opacity: 0.3;
    transform: translate(-17%, -32%) rotate(-50deg) scaleY(0.65) scale(0.85);
    background: #1CAA86;
    filter: blur(228px);
  }
  50% {
    opacity: 0.8;
    transform: translate(-10%, -25%) rotate(-50deg) scaleY(0.65) scale(1.05);
    background: #30D397;
    filter: blur(228px);
  }
  100% {
    opacity: 1;
    transform: translate(0%, -15%) rotate(-50deg) scaleY(0.65) scale(1);
    background: #1CAA86;
    filter: blur(228px);
  }
}

@keyframes pulse-gradient {
  0% {
    transform: scale(1) translate(0, 0);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05) translate(-1%, -1%);
    opacity: 1;
  }
  100% {
    transform: scale(1) translate(0, 0);
    opacity: 0.8;
  }
}

@keyframes color-shift {
  0%, 5% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}
`;

export default function Index() {
  const { showcaseItems } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [popoverActive, setPopoverActive] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showShowcase, setShowShowcase] = useState(true);
  const formRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const togglePopoverActive = () => setPopoverActive(!popoverActive);
  
  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Add a slight delay to focus the input after scrolling
    setTimeout(() => {
      inputRef.current?.focus();
    }, 800);
  };
  
  const handleCopyToClipboard = () => {
    // Always use seoId for sharing
    const shareUrl = actionData?.seoId 
      ? `${window.location.origin}/vibe/${actionData.seoId}`
      : window.location.href;
      
    navigator.clipboard.writeText(shareUrl);
    setToastMessage("Link copied to clipboard!");
    setShowToast(true);
    setPopoverActive(false);
  };

  const handleShareOnTwitter = () => {
    const text = actionData?.mode === "city" 
      ? "Check out this AI-generated cityscape for our #shopify store!" 
      : actionData?.mode === "cover" 
        ? "Check out this AI-generated magazine cover for our #shopify store!" 
        : "Check out this AI-generated moodboard for our #shopify store!";
    
    // Always use seoId for sharing
    const shareUrl = actionData?.seoId 
      ? `${window.location.origin}/vibe/${actionData.seoId}`
      : window.location.href;
      
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, '_blank');
    setPopoverActive(false);
  };

  const handleShareOnFacebook = () => {
    // Always use seoId for sharing
    const shareUrl = actionData?.seoId 
      ? `${window.location.origin}/vibe/${actionData.seoId}`
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
      <style dangerouslySetInnerHTML={{ __html: gradientAnimations }} />

      {/* Hero section with animated gradient */}
      <div className="relative mb-8" style={{ height: '500px', overflow: 'hidden', marginBottom: '2rem' }}>
        {/* Gradient background */}
        <div className="absolute top-0 w-full h-full overflow-hidden" style={{ 
          animation: 'color-shift 30s infinite ease-in-out',
          background: '#5FD5B6',
          backgroundSize: '400% 400%',
          backgroundImage: 'linear-gradient(135deg, #5FD5B6, #4E95D6, #8C6AD1, #6CAEFF)',
          animationTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
        }}>
          <div className="will-change-transform w-[1518px] h-[1342px] translate-x-[-20%] translate-y-[0px] rotate-[-30deg] top-1/2 left-1/2 origin-center absolute rounded-full bg-[#79DFFF] mix-blend-normal blur-[204px] opacity-0 animate-[start-header-gradient-1_3s_cubic-bezier(0.22,0.61,0.36,1)_forwards,pulse-gradient_12s_ease-in-out_3s_infinite]"></div>
          <div className="will-change-transform w-[1060px] h-[1060px] scale-x-[0.65] translate-x-[-75%] translate-y-[-75%] rotate-[80deg] top-1/2 left-1/2 origin-center absolute rounded-full bg-gradient-to-b from-[#79DFFF] to-[#84C6C5] mix-blend-normal blur-[204px] opacity-0 animate-[start-header-gradient-2_3.5s_cubic-bezier(0.22,0.61,0.36,1)_0.3s_forwards,pulse-gradient_15s_ease-in-out_3.8s_infinite]"></div>
          <div className="will-change-transform w-[1242px] h-[1242px] top-[50%] left-[50%] translate-x-[-10%] translate-y-[-25%] scale-y-[0.65] rotate-[-50deg] origin-center absolute rounded-full bg-[#1CAA86] mix-blend-normal blur-[228px] opacity-0 animate-[start-header-gradient-3_4s_cubic-bezier(0.22,0.61,0.36,1)_0.6s_forwards,pulse-gradient_18s_ease-in-out_4.6s_infinite]"></div>
          <div className="absolute bottom-0 w-full h-[400px] bg-gradient-to-t from-white to-transparent"></div>
        </div>
        
        {/* Hero content */}
        <div className="relative h-full flex flex-col items-start justify-center px-6 md:px-12 lg:px-16 max-w-7xl mx-auto w-full">
          <div className="text-left">
            <h1 className="text-5xl tracking-tight text-black sm:text-6xl md:text-7xl mb-4" 
                style={{ 
                  textShadow: '0 2px 10px rgba(255,255,255,0.3)',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: '400'
                }}>
              Ready to visualize <br/>your store's vibe?
            </h1>
            <p className="mt-3 text-xl text-black text-opacity-90 max-w-xl"
               style={{ 
                 textShadow: '0 1px 4px rgba(255,255,255,0.25)',
                 fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                 fontWeight: '400',
                 lineHeight: '1.4'
               }}>
              Get a beautiful AI-powered mood board based entirely on your Shopify store.
            </p>
            <div className="mt-6 flex space-x-4">
              <Button
                onClick={handleScrollToForm}
                variant="primary"
                size="large"
              >
                Get Started
              </Button>

              <Button
                url="/explore"
                variant="primary"
                size="large"
              >
                Explore All Vibes
              </Button>
              <div className="inline-flex">
                <Badge tone="info">Beta</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div ref={formRef}>
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
                      ref={inputRef}
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
                    <ButtonGroup>
                      {(actionData.dbId || actionData.seoId) && (
                        <Button
                          url={actionData.seoId 
                            ? `/vibe/${actionData.seoId}` 
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
          {showShowcase && showcaseItems.length > 0 && (
            <div style={{ marginBottom: '40px', paddingTop: '20px', backgroundColor: 'var(--p-surface-subdued)', borderRadius: '8px' }}>
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
                      key={item._id} 
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
                      <Link 
                        to={item.seoId ? `/vibe/${item.seoId}` : `/vibe/${item._id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
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
                                  ? "🏙 City" 
                                  : item.mode === "cover" 
                                    ? "🎭 M/Album" 
                                    : "🧵 M"
                              }
                            </Badge>
                            <span style={{ color: 'var(--p-text-subdued)', fontSize: '12px' }}>{item.storeUrl}</span>
                          </div>
                          <div style={{ maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Text variant="bodyMd" as="p">{item.vibePrompt.substring(0, 90)}...</Text>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </Scrollable>
            </div>
          )}
        </div>
      </div>
    </Frame>
  );
}
