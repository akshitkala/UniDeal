'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { timeAgo } from '@/lib/utils/time';

const CONDITION_STYLES: Record<string, { bg: string; color: string }> = {
  'new':      { bg: '#dcfce7', color: '#16a34a' },
  'like new': { bg: '#dcfce7', color: '#16a34a' }, // Matched to image
  'good':     { bg: '#fef9c3', color: '#ca8a04' },
  'used':     { bg: '#ffedd5', color: '#ea580c' },
  'damaged':  { bg: '#fee2e2', color: '#dc2626' },
};

const TagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#16a34a" : "none"} stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      background: bg, color,
      padding: '4px 12px', borderRadius: 6,
      fontSize: 12, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {label}
    </span>
  );
}



export default function ListingPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${slug}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setListing(data.listing);
        setSaved(data.listing?.isSaved ?? false);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <Skeleton />;
  if (!listing) return <NotFound />;

  const images: string[] = listing.images ?? [];
  const condition = listing.condition?.toLowerCase() ?? '';
  const conditionStyle = CONDITION_STYLES[condition] || { bg: '#f3f4f6', color: '#6b7280' };

  const isOwner = user && (
    user.uid === listing.seller?.uid ||
    user.uid === listing.seller?.firebaseUid
  );

  // Get whatsapp number — try listing.sellerWhatsapp first (most direct), then seller profile fields
  const rawNumber = listing.sellerWhatsapp || listing.seller?.whatsapp || listing.seller?.phone || '';
  const whatsappNumber = rawNumber.replace(/\D/g, ''); // strip non-digits

  // Build URL only if we have a valid number
  const whatsappUrl = whatsappNumber.length >= 10
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in your listing "${listing.title}" on UniDeal.`)}`
    : null;

  async function toggleSave() {
    if (!user) { router.push('/login'); return; }
    setSaving(true);
    const res = await fetch(`/api/listings/${listing.slug}/save`, {
      method: saved ? 'DELETE' : 'POST',
      credentials: 'include',
    });
    if (res.ok) setSaved(!saved);
    setSaving(false);
  }

  async function deleteOwn() {
    if (!confirm('Delete this listing?')) return;
    await fetch(`/api/listings/${listing.slug}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    router.push('/dashboard');
  }

  const cardStyle: React.CSSProperties = {
    background: 'white',
    border: '1.5px solid #edf2f7',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
  };

  const btnStyle = (bg: string, color = 'white'): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 10, width: '100%', padding: '16px 0',
    background: bg, color,
    borderRadius: 14, fontWeight: 700, fontSize: 16,
    border: bg === 'white' ? '2px solid #16a34a' : 'none',
    cursor: 'pointer', textDecoration: 'none',
    boxSizing: 'border-box' as const,
    marginBottom: 12,
    transition: 'transform 0.1s ease',
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>

      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#16a34a', fontSize: 13, fontWeight: 700,
          marginBottom: 24, padding: 0,
        }}
      >
        ← Back to listings
      </button>

      {/* Main Content Area (Single Column) */}
      <div className="listing-container" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        maxWidth: 800,
        margin: '0 auto',
      }}>

        {/* ── IMAGES ── */}
        <div style={{ width: '100%' }}>
          {/* Main image */}
          <div style={{
            borderRadius: 24, overflow: 'hidden',
            background: '#f8fafc', aspectRatio: '4/3',
            marginBottom: 16, border: '1.5px solid #edf2f7',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 16, left: 16,
              background: 'white', color: '#16a34a',
              padding: '4px 12px', borderRadius: 99,
              fontSize: 11, fontWeight: 800,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              Main View
            </div>

            {images.length > 0 ? (
              <img
                src={images[selectedImage]}
                alt={listing.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 20 }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#cbd5e1', fontSize: 48,
              }}>
                📦
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setSelectedImage(i)}
                style={{
                  width: 100, height: 100, borderRadius: 16,
                  overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                  border: selectedImage === i
                    ? '3px solid #16a34a'
                    : '1.5px solid #edf2f7',
                  background: '#f8fafc', padding: 6,
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── HEADER INFO ── */}
        <div style={{ width: '100%' }}>
          <h1 style={{
            fontSize: '2.25rem', fontWeight: 800,
            color: '#0f172a', margin: '0 0 12px', lineHeight: 1.2,
          }}>
            {listing.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Badge label={listing.condition} bg={conditionStyle.bg} color={conditionStyle.color} />
            <span style={{ color: '#94a3b8', fontSize: 18 }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 14, fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Posted {timeAgo(listing.createdAt)}
            </div>
          </div>
        </div>

        {/* ── PRICE & ACTION CARD ── */}
        <div style={{...cardStyle, width: '100%', boxSizing: 'border-box'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>Asking Price</p>
              <p style={{ margin: 0, fontSize: '2.8rem', fontWeight: 900, color: '#16a34a' }}>
                ₹{listing.price?.toLocaleString('en-IN')}
              </p>
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: '#f0fdf4', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#16a34a',
            }}>
              <TagIcon />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {isOwner ? (
              <>
                <button
                  onClick={() => router.push(`/dashboard?edit=${listing.slug}`)}
                  style={btnStyle('#0f172a')}
                >
                  ✏️ Edit Listing
                </button>
                <button onClick={deleteOwn} style={btnStyle('white', '#ef4444')}>
                  🗑 Delete
                </button>
              </>
            ) : (
              <>
                {user ? (
                  whatsappUrl ? (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={btnStyle('#16a34a')}>
                      💬 Contact on WhatsApp
                    </a>
                  ) : (
                    <div style={{
                      padding: '14px 16px', borderRadius: 12,
                      background: '#fef9c3', border: '1.5px solid #fef08a',
                      fontSize: 13, color: '#854d0e', textAlign: 'center', lineHeight: 1.5,
                      gridColumn: '1 / -1',
                    }}>
                      📞 Seller hasn't added a contact number yet.<br />
                      <span style={{ fontSize: 12, color: '#a16207' }}>
                        Ask them to update their profile.
                      </span>
                    </div>
                  )
                ) : (
                  <a href="/login" style={btnStyle('#16a34a')}>
                    Sign in to Contact Seller
                  </a>
                )}

                {user && !isOwner && !whatsappUrl ? null : (
                  <button onClick={toggleSave} disabled={saving} style={btnStyle('white', '#16a34a')}>
                    <HeartIcon filled={saved} /> {saved ? 'Saved' : 'Save'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── DESCRIPTION ── */}
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
            About this listing
          </h2>
          <p style={{
            fontSize: 16, color: '#475569', lineHeight: 1.8,
            margin: 0, whiteSpace: 'pre-wrap', fontWeight: 500,
          }}>
            {listing.description || 'No description provided.'}
          </p>
        </div>

        {/* ── SELLER & SAFETY (Side by Side on Desktop, Stacked on Mobile) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
          width: '100%'
        }}>
          {/* Seller Card */}
          <div style={{
            ...cardStyle, margin: 0,
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#f0fdf4', flexShrink: 0,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 900,
                fontSize: 20, color: '#16a34a', border: '1.5px solid #dcfce7',
                position: 'relative',
              }}>
                {listing.seller?.photoUrl
                  ? <img src={listing.seller.photoUrl} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                  : listing.seller?.name?.[0]?.toUpperCase() ?? '?'
                }
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#16a34a', border: '2px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                  {listing.seller?.name ?? 'Unknown'}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Verified Student
                </p>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>

          {/* Safety Tips */}
          <div style={{
            background: '#f0fdf4', border: '1.5px solid #dcfce7',
            borderRadius: 24, padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: '#166534' }}>
              <ShieldIcon />
              <p style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>Safety Tips</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Meet in a public campus area (e.g., Library).',
                'Inspect the item thoroughly before paying.',
                'Never pay in advance to strangers.',
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: '#166534', fontWeight: 500 }}>
                  <span>•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <div style={{ borderRadius: 24, background: '#f1f5f9', aspectRatio: '4/3', marginBottom: 16 }} />
      <div style={{ height: 40, background: '#f1f5f9', borderRadius: 8, marginBottom: 12, width: '60%' }} />
      <div style={{ height: 200, background: '#f1f5f9', borderRadius: 24, marginBottom: 20 }} />
      <div style={{ height: 100, background: '#f1f5f9', borderRadius: 24 }} />
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <p style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</p>
      <h2 style={{ marginBottom: 12, color: '#0f172a', fontWeight: 800 }}>Listing not found</h2>
      <a href="/" style={{
        color: 'white', background: '#16a34a',
        padding: '12px 32px', borderRadius: 14,
        textDecoration: 'none', fontWeight: 800,
      }}>
        ← Back to home
      </a>
    </div>
  );
}
