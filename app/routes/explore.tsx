import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { 
  Page, 
  LegacyCard, 
  Text, 
  LegacyStack, 
  Frame, 
  Badge, 
  Pagination,
  Select,
  Button,
  Modal,
  ButtonGroup,
  Toast
} from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

type VibeResult = {
  _id: string;
  storeUrl: string;
  mode: string;
  vibePrompt: string;
  imageUrl: string;
  createdAt: string;
  seoId?: string;
};

type LoaderData = {
  vibes: VibeResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('mode') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 12;
  
  // In production, you'd call your API endpoint
  const apiUrl = `${url.origin}/api/explore-vibes?mode=${mode}&page=${page}&limit=${limit}`;
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Failed to load vibes');
    }
    
    return json(await response.json());
  } catch (error) {
    console.error("Error loading vibes:", error);
    return json({ vibes: [], pagination: { total: 0, page: 1, limit, pages: 0 } });
  }
}

export default function ExploreVibes() {
  const { vibes, pagination } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentMode = searchParams.get('mode') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [selectedVibe, setSelectedVibe] = useState<VibeResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Handle keyboard navigation
  useEffect(() => {
    if (!selectedVibe) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigatePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateNext();
      } else if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, vibes]);

  // Navigation functions
  const navigateNext = () => {
    if (selectedIndex < vibes.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setSelectedVibe(vibes[selectedIndex + 1]);
    }
  };

  const navigatePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setSelectedVibe(vibes[selectedIndex - 1]);
    }
  };

  // Touch event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;

    // Require at least 50px swipe
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left, go next
        navigateNext();
      } else {
        // Swipe right, go previous
        navigatePrevious();
      }
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const handleModeChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('mode', value);
    } else {
      params.delete('mode');
    }
    params.set('page', '1'); // Reset to first page when changing filter
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const handleVibeClick = (vibe: VibeResult, index: number) => {
    setSelectedVibe(vibe);
    setSelectedIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedVibe(null);
    setSelectedIndex(-1);
  };

  const handleShareLink = useCallback(() => {
    if (!selectedVibe) return;
    
    // Use SEO ID for sharing
    const shareUrl = selectedVibe.seoId
      ? `${window.location.origin}/vibe/${selectedVibe.seoId}`
      : `${window.location.origin}/vibe/${selectedVibe._id}`;
      
    navigator.clipboard.writeText(shareUrl);
    setToastMessage('Link copied to clipboard!');
    setShowToast(true);
  }, [selectedVibe]);

  const handleShareTwitter = useCallback(() => {
    if (!selectedVibe) return;
    
    const text = selectedVibe.mode === "city" 
      ? `Check out this AI-generated cityscape for our #shopify store!` 
      : selectedVibe.mode === "cover" 
        ? `Check out this AI-generated magazine cover for our #shopify store!` 
        : `Check out this AI-generated moodboard for our #shopify store!`;
    
    // Use SEO ID for sharing
    const shareUrl = selectedVibe.seoId
      ? `${window.location.origin}/vibe/${selectedVibe.seoId}`
      : `${window.location.origin}/vibe/${selectedVibe._id}`;
      
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, '_blank');
  }, [selectedVibe]);

  const handleShareFacebook = useCallback(() => {
    if (!selectedVibe) return;
    
    // Use SEO ID for sharing
    const shareUrl = selectedVibe.seoId
      ? `${window.location.origin}/vibe/${selectedVibe.seoId}`
      : `${window.location.origin}/vibe/${selectedVibe._id}`;
      
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }, [selectedVibe]);

  const handleSharePinterest = useCallback(() => {
    if (!selectedVibe) return;
    
    // Use SEO ID for sharing
    const shareUrl = selectedVibe.seoId
      ? `${window.location.origin}/vibe/${selectedVibe.seoId}`
      : `${window.location.origin}/vibe/${selectedVibe._id}`;
      
    const encodedUrl = encodeURIComponent(shareUrl);
    const media = encodeURIComponent(selectedVibe.imageUrl);
    const description = encodeURIComponent(`${selectedVibe.mode} vibe for ${selectedVibe.storeUrl}`);
    window.open(`https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${media}&description=${description}`, '_blank');
  }, [selectedVibe]);

  const handleShareEmail = useCallback(() => {
    if (!selectedVibe) return;
    
    // Use SEO ID for sharing
    const shareUrl = selectedVibe.seoId
      ? `${window.location.origin}/vibe/${selectedVibe.seoId}`
      : `${window.location.origin}/vibe/${selectedVibe._id}`;
      
    const subject = encodeURIComponent(`Store Vibe Generator: ${selectedVibe.storeUrl} ${selectedVibe.mode}`);
    const body = encodeURIComponent(
      `Check out this store vibe I found:\n\n` +
      `Store: ${selectedVibe.storeUrl}\n` +
      `Type: ${selectedVibe.mode}\n\n` +
      `${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }, [selectedVibe]);

  const modeOptions = [
    { label: 'All Vibes', value: '' },
    { label: '🧵 Moodboard', value: 'moodboard' },
    { label: '🏙 Store as a City', value: 'city' },
    { label: '🎭 Magazine/Album Cover', value: 'cover' }
  ];

  return (
    <Frame>
      <Page
        title="Explore Store Vibes"
        subtitle="Discover AI-generated brand vibes for various Shopify stores"
      >
        {/* Toast notification */}
        {showToast && (
          <Toast content={toastMessage} onDismiss={() => setShowToast(false)} />
        )}
        
        {/* Modal for viewing full vibe */}
        {selectedVibe && (
          <Modal
            open={selectedVibe !== null}
            onClose={handleCloseModal}
            title={
              <>
                <span className="modal-title">{selectedVibe.storeUrl}</span>
                <Badge tone="success" progress="complete">
                  {
                    selectedVibe.mode === "city" 
                      ? "🏙 Store as a City" 
                      : selectedVibe.mode === "cover" 
                        ? "🎭 Magazine/Album Cover" 
                        : "🧵 Moodboard"
                  }
                </Badge>
              </>
            }
            size="large"
          >
            <Modal.Section>
              <div 
                style={{ maxWidth: '100%', margin: '0 auto' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Navigation buttons */}
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: 0, 
                  right: 0, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0 16px', 
                  pointerEvents: 'none', 
                  zIndex: 1,
                  transform: 'translateY(-50%)'
                }}>
                  <style>
                    {`
                      button.nav-button {
                        pointer-events: auto;
                        background-color: rgba(255, 255, 255, 0.8);
                        border-radius: 50%;
                        min-width: 40px;
                        width: 40px;
                        height: 40px;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        backdrop-filter: blur(4px);
                        border: none;
                        cursor: pointer;
                        transition: background-color 0.2s;
                      }
                      button.nav-button:hover {
                        background-color: rgba(255, 255, 255, 0.9);
                      }
                    `}
                  </style>
                  {selectedIndex > 0 && (
                    <button
                      onClick={navigatePrevious}
                      className="nav-button"
                      aria-label="Previous vibe"
                    >
                      <span style={{ fontSize: '24px' }}>←</span>
                    </button>
                  )}
                  {selectedIndex < vibes.length - 1 && (
                    <button
                      onClick={navigateNext}
                      className="nav-button"
                      aria-label="Next vibe"
                    >
                      <span style={{ fontSize: '24px' }}>→</span>
                    </button>
                  )}
                </div>

                <div style={{ 
                  width: '100%', 
                  maxHeight: '50vh', 
                  overflow: 'hidden', 
                  borderRadius: '8px', 
                  marginBottom: '16px' 
                }}>
                  <img
                    src={selectedVibe.imageUrl}
                    alt={`Vibe for ${selectedVibe.storeUrl}`}
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      objectFit: 'contain',
                      cursor: 'zoom-in' 
                    }}
                    onClick={() => window.open(selectedVibe.imageUrl, '_blank')}
                  />
                </div>
                <div style={{ 
                  maxHeight: '30vh', 
                  overflowY: 'auto', 
                  padding: '16px', 
                  borderRadius: '4px',
                  backgroundColor: 'var(--p-surface-subdued)',
                  marginBottom: '16px'
                }}>
                  <div className="markdown-content" style={{ lineHeight: '1.6' }}>
                    <ReactMarkdown>{selectedVibe.vibePrompt}</ReactMarkdown>
                  </div>
                </div>

                {/* Share section */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text variant="headingSm" as="h3">Share this vibe</Text>
                  </div>
                  <ButtonGroup>
                    <Button onClick={handleShareLink}>Copy Link</Button>
                    <Button onClick={handleShareTwitter}>X</Button>
                    <Button onClick={handleShareFacebook}>Facebook</Button>
                    <Button onClick={handleSharePinterest}>Pinterest</Button>
                    <Button onClick={handleShareEmail}>Email</Button>
                  </ButtonGroup>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--p-text-subdued)', marginBottom: '8px' }}>
                  Generated on {new Date(selectedVibe.createdAt).toLocaleDateString()} at {new Date(selectedVibe.createdAt).toLocaleTimeString()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <Button onClick={handleCloseModal}>Close</Button>
                  <Button 
                    variant="primary"
                    url={selectedVibe.seoId 
                      ? `/vibe/${selectedVibe.seoId}` 
                      : `/vibe/${selectedVibe._id}`}
                  >
                    View Permanent Page
                  </Button>
                  <Button 
                    onClick={() => window.open(selectedVibe.imageUrl, '_blank')}
                  >
                    View Full Image
                  </Button>
                </div>
              </div>
            </Modal.Section>
          </Modal>
        )}

        <LegacyCard>
          <LegacyCard.Section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="modeFilter" style={{ marginRight: '8px', fontWeight: 'medium' }}>
                Filter by type:
              </label>
              <Select
                id="modeFilter"
                label="Vibe Type"
                options={modeOptions}
                value={currentMode}
                onChange={handleModeChange}
                labelHidden
              />
            </div>
          </LegacyCard.Section>

          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {vibes.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
                <Text variant="headingMd" as="h2">No vibes found</Text>
                <div style={{ marginTop: '8px' }}>
                  <Text variant="bodyMd" as="p">Try a different filter or check back later</Text>
                </div>
              </div>
            ) : (
              vibes.map((vibe: VibeResult, index: number) => (
                <div 
                  key={vibe._id}
                  style={{ 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--p-border-subdued)',
                    background: 'white',
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
                  onClick={() => handleVibeClick(vibe, index)}
                >
                  <div 
                    style={{ height: '200px', overflow: 'hidden', cursor: 'pointer' }}
                  >
                    <img
                      src={vibe.imageUrl}
                      alt={`Vibe for ${vibe.storeUrl}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <Badge tone="success" progress="complete">
                        {
                          vibe.mode === "city" 
                            ? "🏙 Store as a City" 
                            : vibe.mode === "cover" 
                              ? "🎭 Magazine/Album Cover" 
                              : "🧵 Moodboard"
                        }
                      </Badge>
                      <span style={{ color: 'var(--p-text-subdued)', fontSize: '12px' }}>{vibe.storeUrl}</span>
                    </div>
                    <div 
                      style={{ maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '12px', cursor: 'pointer' }}
                    >
                      <Text variant="bodyMd" as="p">
                        {vibe.vibePrompt.substring(0, 120)}...
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--p-text-subdued)' }}>
                        {new Date(vibe.createdAt).toLocaleDateString()}
                      </div>
                      <Button
                        size="slim"
                        url={vibe.seoId 
                          ? `/vibe/${vibe.seoId}` 
                          : `/vibe/${vibe._id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {pagination.pages > 1 && (
            <LegacyCard.Section>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  hasPrevious={currentPage > 1}
                  onPrevious={() => handlePageChange(currentPage - 1)}
                  hasNext={currentPage < pagination.pages}
                  onNext={() => handlePageChange(currentPage + 1)}
                />
              </div>
            </LegacyCard.Section>
          )}
        </LegacyCard>
      </Page>
    </Frame>
  );
}
