import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { ObjectId } from 'mongodb';
import ReactMarkdown from 'react-markdown';
import {
  Page,
  LegacyCard,
  Text,
  LegacyStack,
  Frame,
  Badge,
  Button,
  Popover,
  ActionList,
  Toast,
  Banner,
  Divider,
  Scrollable
} from '@shopify/polaris';
import { useState } from 'react';
import { connectToDatabase } from '~/utils/db.server';

// Define TypeScript interfaces for our data
interface VibeData {
  _id: string;
  storeUrl: string;
  mode: string;
  vibePrompt: string;
  imageUrl: string;
  createdAt: string;
  isPublic: boolean;
  seoId?: string;
}

interface LoaderData {
  vibe: VibeData | null;
  relatedVibes: VibeData[];
  error: string | null;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  // Type assertion to match our actual data structure
  const typedData = data as LoaderData | undefined;
  
  if (!typedData || typedData.error || !typedData.vibe) {
    return [
      { title: "Vibe not found | Store Vibe Generator" },
      { name: "description", content: "The requested vibe could not be found." }
    ];
  }

  const { vibe } = typedData;
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
    { property: "og:url", content: vibe.seoId 
      ? `${process.env.PUBLIC_URL || 'https://storevibe.com'}/v/${vibe.seoId}`
      : `${process.env.PUBLIC_URL || 'https://storevibe.com'}/vibe/${vibe._id}` },
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

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    const id = params.id;
    
    if (!id || !ObjectId.isValid(id)) {
      return json({ error: "Invalid ID format", vibe: null, relatedVibes: [] }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection("vibeResults");
    
    const vibe = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!vibe) {
      return json({ error: "Vibe not found", vibe: null, relatedVibes: [] }, { status: 404 });
    }
    
    // Fetch related vibes of the same mode, excluding the current one
    const relatedVibes = await collection.find({
      mode: vibe.mode,
      _id: { $ne: new ObjectId(id) },
      isPublic: true
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();
    
    return json({ vibe, relatedVibes, error: null });
  } catch (error) {
    console.error("Error fetching vibe:", error);
    return json({ error: "Failed to fetch vibe", vibe: null, relatedVibes: [] }, { status: 500 });
  }
}

export default function VibeDetail() {
  const { vibe, relatedVibes, error } = useLoaderData<typeof loader>() as LoaderData;
  const [popoverActive, setPopoverActive] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const togglePopoverActive = () => setPopoverActive(!popoverActive);
  
  const handleCopyToClipboard = () => {
    if (!vibe) return;
    
    // Use SEO ID if available, otherwise use MongoDB ID
    const shareUrl = vibe.seoId
      ? `${window.location.origin}/v/${vibe.seoId}`
      : window.location.href;
      
    navigator.clipboard.writeText(shareUrl);
    setToastMessage("Link copied to clipboard!");
    setShowToast(true);
    setPopoverActive(false);
  };

  const handleShareOnTwitter = () => {
    if (!vibe) return;
    
    const text = vibe.mode === "city" 
      ? `Check out this AI-generated cityscape for our #shopify store!` 
      : vibe.mode === "cover" 
        ? `Check out this AI-generated magazine cover for our #shopify store!` 
        : `Check out this AI-generated moodboard for our #shopify store!`;
    
    // Use SEO ID if available, otherwise use MongoDB ID
    const shareUrl = vibe.seoId
      ? `${window.location.origin}/v/${vibe.seoId}`
      : window.location.href;
    
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, '_blank');
    setPopoverActive(false);
  };

  const handleShareOnFacebook = () => {
    if (!vibe) return;
    
    // Use SEO ID if available, otherwise use MongoDB ID
    const shareUrl = vibe.seoId
      ? `${window.location.origin}/v/${vibe.seoId}`
      : window.location.href;
      
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setPopoverActive(false);
  };

  const handleDownloadImage = () => {
    if (vibe?.imageUrl) {
      const link = document.createElement('a');
      link.href = vibe.imageUrl;
      link.download = `store-vibe-${vibe.mode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setPopoverActive(false);
    }
  };

  if (error || !vibe) {
    return (
      <Frame>
        <Page title="Vibe Not Found">
          <Banner tone="critical">
            <p>{error || "Vibe not found"}</p>
          </Banner>
          <div style={{ marginTop: '20px' }}>
            <Button url="/">Return to Home</Button>
          </div>
        </Page>
      </Frame>
    );
  }

  return (
    <Frame>
      <Page
        title={`Store Vibe for ${vibe.storeUrl}`}
        backAction={{ content: 'Home', url: '/' }}
        secondaryActions={[
          {
            content: 'Explore All Vibes',
            url: '/explore',
            accessibilityLabel: 'View all vibes in the gallery'
          }
        ]}
        titleMetadata={
          <Badge tone="info">
            {vibe.mode === "city" 
              ? "🏙 City" 
              : vibe.mode === "cover" 
                ? "🎭 Cover" 
                : "🧵 Moodboard"}
          </Badge>
        }
      >
        <LegacyCard sectioned>
          <div style={{ marginBottom: '16px' }}>
            <Text variant="headingMd" as="h2">
              {vibe.mode === "city" 
                ? "City Visualization" 
                : vibe.mode === "cover" 
                  ? "Magazine/Album Cover"
                  : "Brand Moodboard"}
            </Text>
            <Divider />
          </div>
          
          <div style={{ marginTop: '16px', marginBottom: '20px', lineHeight: '1.6' }}>
            <ReactMarkdown>{vibe.vibePrompt}</ReactMarkdown>
          </div>

          {vibe.imageUrl && (
            <LegacyStack vertical>
              <Text variant="headingMd" as="h3">Generated Image</Text>
              <div style={{ 
                border: '1px solid var(--p-border-subdued)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
                <img
                  src={vibe.imageUrl}
                  alt={`Generated ${vibe.mode} for ${vibe.storeUrl}`}
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
            </LegacyStack>
          )}

          <LegacyStack distribution="trailing">
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
                    ...(vibe.imageUrl ? [{
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
          </LegacyStack>
        </LegacyCard>
        
        {/* Related Vibes Section */}
        {relatedVibes.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <LegacyCard>
              <LegacyCard.Section title="Other Similar Vibes">
                <Scrollable style={{ height: 'auto' }} horizontal>
                  <div style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    padding: '8px 4px 16px 4px'
                  }}>
                    {relatedVibes.map((relatedVibe) => (
                      <Link 
                        key={relatedVibe._id.toString()} 
                        to={`/vibe/${relatedVibe._id.toString()}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div 
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
                              src={relatedVibe.imageUrl}
                              alt={`${relatedVibe.mode} example for ${relatedVibe.storeUrl}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <Badge tone="success" progress="complete">
                                {relatedVibe.storeUrl.substring(0, 20) + (relatedVibe.storeUrl.length > 20 ? '...' : '')}
                              </Badge>
                            </div>
                            <div style={{ maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <Text variant="bodyMd" as="p">
                                {relatedVibe.vibePrompt.substring(0, 80)}...
                              </Text>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Scrollable>
              </LegacyCard.Section>
            </LegacyCard>
          </div>
        )}
      </Page>
    </Frame>
  );
} 