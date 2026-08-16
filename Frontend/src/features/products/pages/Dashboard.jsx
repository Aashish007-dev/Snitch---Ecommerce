import React, { useEffect, useState } from 'react';
import { useProduct } from '../hook/useProduct';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

/* ─── tiny helpers ─────────────────────────────────────────────── */
const fmt = (amount, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
};

/* ─── Product Card ─────────────────────────────────────────────── */
const ProductCard = ({ product }) => {
    const [imgIdx, setImgIdx] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [imgHovered, setImgHovered] = useState(false);
    const images = product.images ?? [];

    useEffect(() => {
        if (!hovered || images.length <= 1) return;
        const id = setInterval(() => setImgIdx(i => (i + 1) % images.length), 1200);
        return () => clearInterval(id);
    }, [hovered, images.length]);

    return (
        <article
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setImgIdx(0); }}
            style={{
                background: '#fff',
                border: '1px solid #ede8e0',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'box-shadow 0.35s ease, transform 0.35s ease',
                boxShadow: hovered ? '0 20px 50px rgba(27,24,20,0.10)' : '0 2px 12px rgba(27,24,20,0.05)',
                transform: hovered ? 'translateY(-4px)' : 'none',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Image */}
            <div
                style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: '#f5f3f0' }}
                onMouseEnter={() => setImgHovered(true)}
                onMouseLeave={() => setImgHovered(false)}
            >
                {images.length > 0 ? (
                    <>
                        <img
                            key={imgIdx}
                            src={images[imgIdx].url}
                            alt={product.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'top',
                                transition: 'transform 0.55s ease',
                                transform: imgHovered ? 'scale(1.05)' : 'scale(1)',
                            }}
                        />
                        {images.length > 1 && (
                            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
                                {images.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setImgIdx(i)}
                                        style={{
                                            width: i === imgIdx ? 18 : 6,
                                            height: 6,
                                            borderRadius: 3,
                                            border: 'none',
                                            background: i === imgIdx ? '#C9A96E' : 'rgba(255,255,255,0.7)',
                                            cursor: 'pointer',
                                            padding: 0,
                                            transition: 'width 0.3s ease, background 0.3s ease',
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                        <span style={{ fontSize: 36, opacity: 0.2 }}>🖼</span>
                    </div>
                )}
                {images.length > 1 && (
                    <span style={{
                        position: 'absolute', top: 10, right: 10,
                        background: 'rgba(27,24,20,0.55)', backdropFilter: 'blur(6px)',
                        color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 99,
                        fontFamily: "'Inter', sans-serif", letterSpacing: '0.06em',
                    }}>
                        {images.length} photos
                    </span>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A96E', margin: 0 }}>
                    {timeAgo(product.createdAt)}
                </p>
                <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 20,
                    fontWeight: 400,
                    color: '#1b1c1a',
                    margin: 0,
                    lineHeight: 1.25,
                }}>
                    {product.title}
                </h2>
                <p style={{
                    fontSize: 12,
                    color: '#7A6E63',
                    margin: 0,
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}>
                    {product.description}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #ede8e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, color: '#1b1c1a' }}>
                        {fmt(product.price?.amount, product.price?.currency)}
                    </span>
                    <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B5ADA3' }}>
                        {product.price?.currency}
                    </span>
                </div>
            </div>
        </article>
    );
};

/* ─── Stat Pill ────────────────────────────────────────────────── */
const StatPill = ({ label, value }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '20px 32px', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B5ADA3' }}>{label}</span>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#fbf9f6', fontWeight: 400 }}>{value}</span>
    </div>
);

/* ─── Skeleton Card ────────────────────────────────────────────── */
const SkeletonCard = () => (
    <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ aspectRatio: '3/4', background: 'linear-gradient(90deg,#f5f3f0 25%,#ede8e0 50%,#f5f3f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s infinite' }} />
        <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ height: 8, width: '40%', background: '#f0ece4', borderRadius: 4 }} />
            <div style={{ height: 14, width: '85%', background: '#f0ece4', borderRadius: 4 }} />
            <div style={{ height: 10, width: '70%', background: '#f5f3f0', borderRadius: 4 }} />
            <div style={{ height: 10, width: '55%', background: '#f5f3f0', borderRadius: 4 }} />
        </div>
    </div>
);

/* ─── Dashboard Page ───────────────────────────────────────────── */
const Dashboard = () => {
    const { handleGetSellerProduct } = useProduct();
    const navigate = useNavigate();
    const sellerProducts = useSelector((state) => state.product.sellerProducts);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        (async () => {
            setLoading(true);
            await handleGetSellerProduct();
            setLoading(false);
        })();
    }, []);

    const filtered = (sellerProducts ?? []).filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    const totalValue = (sellerProducts ?? []).reduce((s, p) => s + (p.price?.amount ?? 0), 0);

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />
            <style>{`
                @keyframes shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div style={{ minHeight: '100vh', background: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}>

                {/* ── Hero strip ── */}
                <div style={{ background: '#1b1c1a', padding: '52px 40px 40px' }}>
                    <p style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C9A96E', margin: '0 0 10px' }}>
                        Seller portal
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 300, color: '#fbf9f6', margin: '0 0 32px', lineHeight: 1.1 }}>
                        Your <em>Collection</em>
                    </h1>
                    <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4 }}>
                        <StatPill label="Total Products" value={loading ? '—' : (sellerProducts?.length ?? 0)} />
                        <StatPill label="Catalogue Value" value={loading ? '—' : fmt(totalValue)} />
                        <div style={{ padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B5ADA3' }}>Status</span>
                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#C9A96E', fontWeight: 400 }}>Live</span>
                        </div>
                    </div>
                </div>

                {/* ── Toolbar ── */}
                <div style={{ padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottom: '1px solid #ede8e0', background: '#fbf9f6', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', maxWidth: 320, width: '100%' }}>
                        <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', color: '#B5ADA3', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
                        <input
                            id="dashboard-search"
                            type="text"
                            placeholder="Search products…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: 24, paddingBottom: 8, background: 'transparent', border: 'none', borderBottom: '1px solid #d0c5b5', outline: 'none', fontSize: 13, color: '#1b1c1a', fontFamily: "'Inter', sans-serif" }}
                            onFocus={e => e.target.style.borderBottomColor = '#C9A96E'}
                            onBlur={e => e.target.style.borderBottomColor = '#d0c5b5'}
                        />
                    </div>
                    <p style={{ fontSize: 11, color: '#B5ADA3', margin: 0, whiteSpace: 'nowrap' }}>
                        {loading ? 'Loading…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
                    </p>
                    <button
                        id="dashboard-add-product-btn"
                        onClick={() => navigate('/seller/create-product')}
                        style={{ padding: '12px 28px', background: '#1b1c1a', color: '#fbf9f6', border: 'none', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.25s, color 0.25s', whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif" }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#C9A96E'; e.currentTarget.style.color = '#1b1c1a'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#1b1c1a'; e.currentTarget.style.color = '#fbf9f6'; }}
                    >
                        + Add Product
                    </button>
                </div>

                {/* ── Grid ── */}
                <main style={{ padding: '40px 40px 80px' }}>
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
                            {[1, 2, 3, 4].map(n => <SkeletonCard key={n} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', paddingTop: 80, animation: 'fadeUp 0.5s ease both' }}>
                            <p style={{ fontSize: 48, marginBottom: 16 }}>🛍</p>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#1b1c1a', margin: '0 0 8px' }}>
                                {search ? 'No results found' : 'Your collection is empty'}
                            </p>
                            <p style={{ fontSize: 13, color: '#B5ADA3', marginBottom: 32 }}>
                                {search ? `No products matching "${search}"` : 'Start by listing your first product.'}
                            </p>
                            {!search && (
                                <button
                                    onClick={() => navigate('/seller/create-product')}
                                    style={{ padding: '14px 36px', background: '#1b1c1a', color: '#fbf9f6', border: 'none', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#C9A96E'; e.currentTarget.style.color = '#1b1c1a'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#1b1c1a'; e.currentTarget.style.color = '#fbf9f6'; }}
                                >
                                    + List First Product
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
                            {filtered.map((product, i) => (
                                <div onClick={() => navigate(`/seller/product/${product._id}`)} key={product._id} style={{ animation: `fadeUp 0.45s ease ${i * 0.07}s both`, cursor: 'pointer' }}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default Dashboard;
