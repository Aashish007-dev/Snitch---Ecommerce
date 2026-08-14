import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useProduct } from '../hook/useProduct'

/* ── helpers ──────────────────────────────────────────────────── */
const fmt = (amount, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

/* ── Skeleton ─────────────────────────────────────────────────── */
const SkeletonDetail = () => (
    <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 animate-pulse">
        <div className="space-y-3">
            <div className="aspect-[3/4] bg-[#ede8e0] rounded-sm" />
            <div className="grid grid-cols-4 gap-2">
                {[1,2,3,4].map(n => <div key={n} className="aspect-square bg-[#ede8e0] rounded-sm" />)}
            </div>
        </div>
        <div className="space-y-6 pt-4">
            <div className="h-3 w-1/3 bg-[#ede8e0] rounded" />
            <div className="h-8 w-3/4 bg-[#e8e3db] rounded" />
            <div className="h-6 w-1/4 bg-[#ede8e0] rounded" />
            <div className="space-y-2">
                <div className="h-4 w-full bg-[#f0ece4] rounded" />
                <div className="h-4 w-5/6 bg-[#f0ece4] rounded" />
                <div className="h-4 w-4/6 bg-[#f0ece4] rounded" />
            </div>
            <div className="flex gap-3 pt-4">
                <div className="h-14 flex-1 bg-[#ede8e0] rounded-sm" />
                <div className="h-14 flex-1 bg-[#e8e3db] rounded-sm" />
            </div>
        </div>
    </div>
)

/* ── Main Component ───────────────────────────────────────────── */
const ProductDetail = () => {
    const { productId } = useParams()
    const navigate = useNavigate()
    const { handleGetProductById } = useProduct()

    const [product, setProduct]   = useState(null)
    const [loading, setLoading]   = useState(true)
    const [activeImg, setActiveImg] = useState(0)
    const [zoomed, setZoomed]     = useState(false)
    const [zoomPos, setZoomPos]   = useState({ x: 50, y: 50 })

    useEffect(() => {
        setLoading(true)
        setActiveImg(0)
        handleGetProductById(productId)
            .then(data => { setProduct(data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [productId])

    /* mouse-zoom on main image */
    const handleMouseMove = e => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setZoomPos({ x, y })
    }

    const images = product?.images ?? []

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            <div className="min-h-screen bg-[#fbf9f6]" style={{ fontFamily: "'Inter', sans-serif" }}>

                {/* ── Sticky Nav ── */}
                <header className="sticky top-0 z-50 flex items-center justify-between px-10 h-16 border-b border-[#ede8e0] bg-[rgba(251,249,246,0.92)] backdrop-blur-md">
                    <span
                        className="text-[#C9A96E] tracking-[0.38em] uppercase cursor-pointer select-none"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15 }}
                        onClick={() => navigate('/')}
                    >
                        Snitch.
                    </span>

                    <nav className="flex items-center gap-8">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-[#7A6E63] hover:text-[#C9A96E] transition-colors duration-200"
                        >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back to Shop
                        </button>
                    </nav>
                </header>

                {/* ── Breadcrumb ── */}
                {!loading && product && (
                    <div className="max-w-6xl mx-auto px-6 pt-6">
                        <p className="text-[11px] text-[#B5ADA3] tracking-wide">
                            <span className="hover:text-[#C9A96E] cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
                            <span className="mx-2">›</span>
                            <span className="text-[#7A6E63]">{product.title}</span>
                        </p>
                    </div>
                )}

                {/* ── Content ── */}
                {loading ? (
                    <SkeletonDetail />
                ) : !product ? (
                    /* not found */
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <p className="text-5xl mb-5">🔍</p>
                        <p className="text-3xl text-[#1b1c1a] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
                            Product not found
                        </p>
                        <p className="text-sm text-[#B5ADA3] mb-8">This product may have been removed or doesn't exist.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-[#1b1c1a] text-[#fbf9f6] text-[11px] tracking-[0.22em] uppercase hover:bg-[#C9A96E] hover:text-[#1b1c1a] transition-all duration-200"
                        >
                            Browse Shop
                        </button>
                    </div>
                ) : (
                    <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                        {/* ── LEFT: Gallery ── */}
                        <div className="flex flex-row gap-3 lg:sticky lg:top-24">

                            {/* Vertical thumbnail strip — left side */}
                            {images.length > 1 && (
                                <div className="flex flex-col gap-2 w-16 flex-shrink-0">
                                    {images.map((img, i) => (
                                        <button
                                            key={img._id}
                                            onClick={() => setActiveImg(i)}
                                            className={[
                                                'aspect-square w-full overflow-hidden rounded-sm border-2 transition-all duration-200',
                                                i === activeImg
                                                    ? 'border-[#C9A96E] shadow-[0_0_0_1px_#C9A96E]'
                                                    : 'border-transparent hover:border-[#d0c5b5]',
                                            ].join(' ')}
                                        >
                                            <img
                                                src={img.url}
                                                alt={`View ${i + 1}`}
                                                className="w-full h-full object-cover object-top"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Main image with zoom — right side */}
                            <div
                                className="relative overflow-hidden aspect-[3/4] bg-[#f5f3f0] cursor-crosshair select-none rounded-sm flex-1"
                                onMouseEnter={() => setZoomed(true)}
                                onMouseLeave={() => setZoomed(false)}
                                onMouseMove={handleMouseMove}
                            >
                                {images.length > 0 ? (
                                    <img
                                        src={images[activeImg].url}
                                        alt={product.title}
                                        className="w-full h-full object-cover object-top transition-transform duration-300"
                                        style={{
                                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                            transform: zoomed ? 'scale(1.75)' : 'scale(1)',
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full grid place-items-center">
                                        <span className="text-5xl opacity-20">🖼</span>
                                    </div>
                                )}

                                {/* image counter badge */}
                                {images.length > 1 && (
                                    <span className="absolute bottom-3 right-3 text-[10px] tracking-widest uppercase text-white bg-[rgba(27,24,20,0.55)] backdrop-blur px-3 py-1 rounded-full">
                                        {activeImg + 1} / {images.length}
                                    </span>
                                )}

                                {/* zoom hint */}
                                {!zoomed && images.length > 0 && (
                                    <span className="absolute top-3 left-3 text-[9px] tracking-[0.18em] uppercase text-[#B5ADA3] bg-[rgba(251,249,246,0.80)] backdrop-blur px-2 py-1 rounded-full opacity-80">
                                        Hover to zoom
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ── RIGHT: Info Panel ── */}
                        <div className="flex flex-col gap-8 pt-2">

                            {/* Tag line */}
                            <p className="text-[10px] tracking-[0.28em] uppercase text-[#C9A96E]">
                                New Arrival
                            </p>

                            {/* Title */}
                            <div>
                                <h1
                                    className="text-[2.4rem] leading-[1.1] text-[#1b1c1a] font-light mb-3"
                                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                >
                                    {product.title}
                                </h1>

                                {/* Price */}
                                <div className="flex items-baseline gap-3">
                                    <span
                                        className="text-3xl text-[#1b1c1a] font-medium"
                                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                    >
                                        {fmt(product.price?.amount, product.price?.currency)}
                                    </span>
                                    <span className="text-[11px] text-[#B5ADA3] tracking-[0.15em] uppercase">
                                        {product.price?.currency} · Incl. of all taxes
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-[#ede8e0]" />

                            {/* Description */}
                            <div>
                                <p className="text-[10px] tracking-[0.2em] uppercase text-[#7A6E63] mb-3">
                                    About this product
                                </p>
                                <p className="text-[14px] text-[#4a4844] leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-[#ede8e0]" />

                            {/* Divider */}
                            <div className="h-px bg-[#ede8e0]" />

                            {/* ── CTA Buttons ── */}
                            <div className="flex flex-col gap-3">
                                {/* Add to Cart */}
                                <button
                                    id="pd-add-to-cart"
                                    className="group w-full py-4 flex items-center justify-center gap-3 border border-[#1b1c1a] text-[#1b1c1a] text-[11px] tracking-[0.28em] uppercase hover:bg-[#1b1c1a] hover:text-[#fbf9f6] transition-all duration-300"
                                >
                                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                                    </svg>
                                    Add to Cart
                                </button>

                                {/* Buy Now */}
                                <button
                                    id="pd-buy-now"
                                    className="w-full py-4 flex items-center justify-center gap-3 bg-[#1b1c1a] text-[#fbf9f6] text-[11px] tracking-[0.28em] uppercase hover:bg-[#C9A96E] hover:text-[#1b1c1a] transition-all duration-300"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                    </svg>
                                    Buy Now
                                </button>
                            </div>

                            {/* Trust badges */}
                            <div className="grid grid-cols-3 gap-3 pt-1">
                                {[
                                    { icon: '🚚', label: 'Free delivery', sub: 'On orders ₹999+' },
                                    { icon: '↩', label: 'Easy returns', sub: '7-day window' },
                                    { icon: '🔒', label: 'Secure payment', sub: '100% protected' },
                                ].map(({ icon, label, sub }) => (
                                    <div key={label} className="flex flex-col items-center text-center p-3 border border-[#ede8e0] rounded-sm gap-1">
                                        <span className="text-xl">{icon}</span>
                                        <p className="text-[10px] font-medium text-[#1b1c1a] tracking-wide">{label}</p>
                                        <p className="text-[9px] text-[#B5ADA3] tracking-wide">{sub}</p>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </main>
                )}
            </div>
        </>
    )
}

export default ProductDetail
