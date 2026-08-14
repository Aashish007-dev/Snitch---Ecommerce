import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useProduct } from '../hook/useProduct'
import { useNavigate } from 'react-router'

/* ─── helpers ──────────────────────────────────────────────────── */
const fmt = (amount, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

/* ─── Product Card ─────────────────────────────────────────────── */
const ProductCard = ({ product }) => {
    const [imgIdx, setImgIdx] = useState(0)
    const [hovered, setHovered] = useState(false)
    const images = product.images ?? []
    const navigate = useNavigate();

    useEffect(() => {
        if (!hovered || images.length <= 1) return
        const id = setInterval(() => setImgIdx(i => (i + 1) % images.length), 1300)
        return () => clearInterval(id)
    }, [hovered, images.length])

    return (
        <article
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setImgIdx(0) }}
            style={{
                background: '#fff',
                border: '1px solid #ede8e0',
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'box-shadow 0.35s ease, transform 0.35s ease',
                boxShadow: hovered ? '0 24px 56px rgba(27,24,20,0.12)' : '0 2px 12px rgba(27,24,20,0.05)',
                transform: hovered ? 'translateY(-5px)' : 'none',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Image */}
            <div onClick={() => navigate(`/product/${product._id}`)} style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: '#f5f3f0' }}>
                {images.length > 0 ? (
                    <>
                        <img
                            key={imgIdx}
                            src={images[imgIdx].url}
                            alt={product.title}
                            style={{
                                width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top',
                                transition: 'transform 0.6s ease',
                                transform: hovered ? 'scale(1.06)' : 'scale(1)',
                            }}
                        />

                        {/* dot nav */}
                        {images.length > 1 && (
                            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
                                {images.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={e => { e.stopPropagation(); setImgIdx(i) }}
                                        style={{
                                            width: i === imgIdx ? 18 : 6, height: 6, borderRadius: 3,
                                            border: 'none', padding: 0, cursor: 'pointer',
                                            background: i === imgIdx ? '#C9A96E' : 'rgba(255,255,255,0.75)',
                                            transition: 'width 0.3s ease, background 0.3s ease',
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* wishlist pill placeholder */}
                        <button
                            style={{
                                position: 'absolute', top: 10, right: 10,
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)',
                                border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center',
                                opacity: hovered ? 1 : 0, transition: 'opacity 0.25s',
                                fontSize: 14,
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            🤍
                        </button>
                    </>
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                        <span style={{ fontSize: 36, opacity: 0.18 }}>🖼</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div onClick={() => navigate(`/product/${product._id}`)} style={{ padding: '16px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 400, color: '#1b1c1a', margin: 0, lineHeight: 1.3 }}>
                    {product.title}
                </h2>
                <p style={{ fontSize: 12, color: '#7A6E63', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: '#1b1c1a' }}>
                        {fmt(product.price?.amount, product.price?.currency)}
                    </span>
                    <button
                        style={{
                            padding: '7px 16px', background: '#1b1c1a', color: '#fbf9f6',
                            border: 'none', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
                            cursor: 'pointer', borderRadius: 1, fontFamily: "'Inter', sans-serif",
                            transition: 'background 0.2s, color 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#C9A96E'; e.currentTarget.style.color = '#1b1c1a' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#1b1c1a'; e.currentTarget.style.color = '#fbf9f6' }}
                    >
                        Add to Bag
                    </button>
                </div>
            </div>
        </article>
    )
}

/* ─── Skeleton ─────────────────────────────────────────────────── */
const Skeleton = () => (
    <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ aspectRatio: '3/4', background: 'linear-gradient(90deg,#f5f3f0 25%,#ede8e0 50%,#f5f3f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s infinite' }} />
        <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={{ height: 14, width: '80%', background: '#f0ece4', borderRadius: 4 }} />
            <div style={{ height: 10, width: '65%', background: '#f5f3f0', borderRadius: 4 }} />
            <div style={{ height: 10, width: '50%', background: '#f5f3f0', borderRadius: 4 }} />
        </div>
    </div>
)

/* ─── Home Page ────────────────────────────────────────────────── */
const Home = () => {
    const products = useSelector(state => state.product.products)
    const user     = useSelector(state => state.auth.user)
    const authLoading = useSelector(state => state.auth.loading)
    const { handleGetAllProduct } = useProduct()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [search, setSearch]   = useState('')
    const [heroImg, setHeroImg] = useState(0)

    useEffect(() => {
        ;(async () => {
            setLoading(true)
            await handleGetAllProduct()
            setLoading(false)
        })()
    }, [])

    /* hero image slideshow from first product */
    const heroImages = products?.[0]?.images?.map(i => i.url) ?? []
    useEffect(() => {
        if (heroImages.length <= 1) return
        const id = setInterval(() => setHeroImg(i => (i + 1) % heroImages.length), 3500)
        return () => clearInterval(id)
    }, [heroImages.length])

    const filtered = (products ?? []).filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
            <style>{`
                @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
                @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
                @keyframes heroPan { 0% { transform:scale(1.08) translateX(0); } 100% { transform:scale(1.08) translateX(-1.5%); } }
                ::placeholder { color: #c5bdb3 !important; }
                * { box-sizing: border-box; }
            `}</style>

            <div style={{ minHeight: '100vh', background: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}>

                {/* ══ NAV ══════════════════════════════════════════ */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 100,
                    background: 'rgba(251,249,246,0.92)', backdropFilter: 'blur(14px)',
                    borderBottom: '1px solid #ede8e0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 48px', height: 68,
                }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, letterSpacing: '0.38em', textTransform: 'uppercase', color: '#C9A96E' }}>
                        Snitch.
                    </span>

                    <nav style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1b1c1a', fontWeight: 500, borderBottom: '1px solid #C9A96E', paddingBottom: 2 }}>
                            Shop
                        </span>

                        {!authLoading && (
                            user ? (
                                <>
                                    {user.role === 'seller' && (
                                        <button
                                            onClick={() => navigate('/seller/dashboard')}
                                            style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A6E63', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#C9A96E'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#7A6E63'}
                                        >
                                            My Store
                                        </button>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1b1c1a', display: 'grid', placeItems: 'center' }}>
                                            <span style={{ fontSize: 12, color: '#C9A96E', fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
                                                {user.fullname?.charAt(0)?.toUpperCase() ?? '?'}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 11, color: '#7A6E63', letterSpacing: '0.05em' }}>
                                            {user.fullname?.split(' ')[0]}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <button
                                    onClick={() => navigate('/login')}
                                    style={{
                                        padding: '9px 24px', background: '#1b1c1a', color: '#fbf9f6',
                                        border: 'none', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
                                        cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                                        transition: 'background 0.2s, color 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#C9A96E'; e.currentTarget.style.color = '#1b1c1a' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#1b1c1a'; e.currentTarget.style.color = '#fbf9f6' }}
                                >
                                    Sign In
                                </button>
                            )
                        )}
                    </nav>
                </header>

                {/* ══ HERO ═════════════════════════════════════════ */}
                <section style={{ position: 'relative', height: 'min(72vh, 640px)', overflow: 'hidden', background: '#1b1c1a' }}>
                    {heroImages.length > 0 ? (
                        <img
                            key={heroImg}
                            src={heroImages[heroImg]}
                            alt="Hero"
                            style={{
                                position: 'absolute', inset: 0, width: '100%', height: '100%',
                                objectFit: 'cover', objectPosition: 'top',
                                animation: 'heroPan 8s linear infinite alternate',
                                filter: 'brightness(0.55)',
                            }}
                        />
                    ) : (
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1b1c1a 0%, #2d2b28 100%)' }} />
                    )}
                    {/* gradient overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(27,24,20,0.80) 0%, rgba(27,24,20,0.15) 55%, transparent 100%)' }} />

                    {/* hero copy */}
                    <div style={{ position: 'absolute', bottom: 64, left: 64, zIndex: 10 }}>
                        <p style={{ fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A96E', margin: '0 0 14px' }}>
                            New Arrivals · 2026
                        </p>
                        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(44px, 6vw, 80px)', fontWeight: 300, color: '#fbf9f6', margin: '0 0 20px', lineHeight: 1.05 }}>
                            Wear Your<br /><em>Story.</em>
                        </h1>
                        <button
                            onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                padding: '14px 36px', background: 'transparent', color: '#fbf9f6',
                                border: '1px solid rgba(255,255,255,0.45)', fontSize: 10, letterSpacing: '0.28em',
                                textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                                transition: 'background 0.25s, border-color 0.25s, color 0.25s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#C9A96E'; e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.color = '#1b1c1a' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'; e.currentTarget.style.color = '#fbf9f6' }}
                        >
                            Explore Collection
                        </button>
                    </div>

                    {/* hero image dots */}
                    {heroImages.length > 1 && (
                        <div style={{ position: 'absolute', bottom: 24, right: 64, display: 'flex', gap: 6 }}>
                            {heroImages.map((_, i) => (
                                <button key={i} onClick={() => setHeroImg(i)} style={{ width: i === heroImg ? 20 : 6, height: 6, borderRadius: 3, border: 'none', padding: 0, cursor: 'pointer', background: i === heroImg ? '#C9A96E' : 'rgba(255,255,255,0.4)', transition: 'width 0.35s, background 0.35s' }} />
                            ))}
                        </div>
                    )}
                </section>

                {/* ══ MARQUEE STRIP ════════════════════════════════ */}
                <div style={{ background: '#1b1c1a', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
                    <div style={{ display: 'inline-block', animation: 'marquee 18s linear infinite' }}>
                        {['New Collection', 'Free Shipping ₹999+', 'Easy Returns', 'Sustainable Fashion', 'New Collection', 'Free Shipping ₹999+', 'Easy Returns', 'Sustainable Fashion'].map((t, i) => (
                            <span key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7A6E63', marginRight: 48 }}>
                                {t} <span style={{ color: '#C9A96E', marginRight: 48 }}>·</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* ══ PRODUCTS SECTION ═════════════════════════════ */}
                <main id="products-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 40px 100px' }}>

                    {/* section header */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
                        <div>
                            <p style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C9A96E', margin: '0 0 8px' }}>
                                Curated for you
                            </p>
                            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: '#1b1c1a', margin: 0, lineHeight: 1.1 }}>
                                The Collection
                            </h2>
                        </div>

                        {/* search */}
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', color: '#B5ADA3', fontSize: 13, pointerEvents: 'none' }}>🔍</span>
                            <input
                                id="home-search"
                                type="text"
                                placeholder="Search styles…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    paddingLeft: 22, paddingBottom: 8, background: 'transparent',
                                    border: 'none', borderBottom: '1px solid #d0c5b5',
                                    outline: 'none', fontSize: 13, color: '#1b1c1a',
                                    fontFamily: "'Inter', sans-serif", minWidth: 200,
                                    transition: 'border-color 0.25s',
                                }}
                                onFocus={e => e.target.style.borderBottomColor = '#C9A96E'}
                                onBlur={e => e.target.style.borderBottomColor = '#d0c5b5'}
                            />
                        </div>
                    </div>

                    {/* divider */}
                    <div style={{ height: 1, background: '#ede8e0', marginBottom: 48 }} />

                    {/* result label */}
                    {!loading && (
                        <p style={{ fontSize: 11, color: '#B5ADA3', marginBottom: 28 }}>
                            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}{search ? ` for "${search}"` : ''}
                        </p>
                    )}

                    {/* grid */}
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
                            {[1,2,3,4].map(n => <Skeleton key={n} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 0', animation: 'fadeUp 0.5s ease both' }}>
                            <p style={{ fontSize: 48, marginBottom: 16 }}>🛍</p>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#1b1c1a', margin: '0 0 8px' }}>
                                {search ? 'No matches found' : 'Nothing here yet'}
                            </p>
                            <p style={{ fontSize: 13, color: '#B5ADA3' }}>
                                {search ? `No products matching "${search}"` : 'Check back soon for new arrivals.'}
                            </p>
                            {search && (
                                <button onClick={() => setSearch('')} style={{ marginTop: 24, padding: '12px 28px', background: '#1b1c1a', color: '#fbf9f6', border: 'none', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#C9A96E'; e.currentTarget.style.color = '#1b1c1a' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#1b1c1a'; e.currentTarget.style.color = '#fbf9f6' }}>
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
                            {filtered.map((product, i) => (
                                <div key={product._id} style={{ animation: `fadeUp 0.45s ease ${i * 0.06}s both` }}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* ══ FOOTER ═══════════════════════════════════════ */}
                <footer style={{ background: '#1b1c1a', padding: '56px 48px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40 }}>
                        <div>
                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, letterSpacing: '0.38em', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 12 }}>
                                Snitch.
                            </span>
                            <p style={{ fontSize: 12, color: '#7A6E63', maxWidth: 240, lineHeight: 1.7, margin: 0 }}>
                                Premium fashion for every story. Crafted with care, delivered with love.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
                            {[['Shop', ['New Arrivals', 'Men', 'Women', 'Accessories']], ['Help', ['Returns', 'Sizing Guide', 'Contact Us']]].map(([heading, links]) => (
                                <div key={heading}>
                                    <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 16 }}>{heading}</p>
                                    {links.map(l => (
                                        <p key={l} style={{ fontSize: 12, color: '#7A6E63', marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#fbf9f6'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#7A6E63'}>{l}</p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ maxWidth: 1200, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: 11, color: '#4a4844', margin: 0 }}>© 2026 Snitch. All rights reserved.</p>
                        <p style={{ fontSize: 11, color: '#4a4844', margin: 0 }}>Made with ♥ in India</p>
                    </div>
                </footer>

            </div>
        </>
    )
}

export default Home
