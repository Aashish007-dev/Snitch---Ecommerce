import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { useCart } from '../hook/useCart'

/* ── Currency Formatter ────────────────────────────────────────── */
const fmt = (amount, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
    }).format(amount || 0)

/* ── Delivery Date Estimator ───────────────────────────────────── */
const getDeliveryDateRange = () => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() + 3)
    const end = new Date(today)
    end.setDate(today.getDate() + 5)

    const opt = { day: 'numeric', month: 'short' }
    return `${start.toLocaleDateString('en-US', opt)} - ${end.toLocaleDateString('en-US', opt)}`
}

const Cart = () => {
    const navigate = useNavigate()
    const {
        handleGetCart,
        handleIncrementCartItem,
        handleDecrementCartItem,
        handleRemoveCartItem
    } = useCart()

    const cartItems = useSelector(state => state.cart.items || [])
    const user = useSelector(state => state.auth.user)

    const [loading, setLoading] = useState(true)
    const [couponCode, setCouponCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [couponError, setCouponError] = useState('')
    const [couponSuccess, setCouponSuccess] = useState('')
    const [savedForLater, setSavedForLater] = useState([])
    const [toastMessage, setToastMessage] = useState('')
    const [checkoutProcessing, setCheckoutProcessing] = useState(false)

    useEffect(() => {
        setLoading(true)
        handleGetCart()
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const showToast = (msg) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(''), 3000)
    }

    /* ── Helper to resolve item details from populated or nested structure ── */
    const resolveCartItem = (item) => {
        const product = item.product || {}
        const variantId = (typeof item.variant === 'object' && item.variant?._id)
            ? item.variant._id
            : item.variant

        let matchedVariant = null
        if (variantId && Array.isArray(product.variants)) {
            matchedVariant = product.variants.find(v => v._id === variantId)
        } else if (typeof item.variant === 'object' && item.variant?._id) {
            matchedVariant = item.variant
        }

        // Image fallback: variant image -> product first image -> empty placeholder
        const image = matchedVariant?.images?.[0]?.url ||
                      product.images?.[0]?.url ||
                      product.images?.[0] ||
                      ''

        // Cart stored price (when added to cart) vs Live catalog price
        const cartPrice = item.price?.amount
        const livePrice = matchedVariant?.price?.amount ?? product.price?.amount

        // Active unit price: live price if available, otherwise cart stored price
        const unitPrice = livePrice ?? cartPrice ?? 0

        const currency = item.price?.currency ??
                         matchedVariant?.price?.currency ??
                         product.price?.currency ??
                         'INR'

        // Stock fallback
        const stock = matchedVariant?.stock ?? product.stock ?? 20

        // Attributes (e.g. Color: Navy Blue, Size: L)
        const attributes = matchedVariant?.attributes || {}

        const quantity = item.quantity || 1

        // Detect price fluctuations
        const hasPriceChanged = typeof cartPrice === 'number' && typeof livePrice === 'number' && cartPrice !== livePrice
        const isPriceDrop = hasPriceChanged && livePrice < cartPrice
        const isPriceIncrease = hasPriceChanged && livePrice > cartPrice
        const priceDifference = hasPriceChanged ? Math.abs(livePrice - cartPrice) : 0

        return {
            id: item._id,
            productId: product._id,
            variantId: variantId || matchedVariant?._id,
            title: product.title || 'Snitch Apparel',
            description: product.description || '',
            image,
            unitPrice,
            cartPrice,
            livePrice,
            hasPriceChanged,
            isPriceDrop,
            isPriceIncrease,
            priceDifference,
            currency,
            stock,
            attributes,
            quantity,
            lineTotal: unitPrice * quantity,
            matchedVariant
        }
    }

    const parsedItems = cartItems.map(resolveCartItem)
    const totalItemsCount = parsedItems.reduce((acc, item) => acc + item.quantity, 0)
    const subtotal = parsedItems.reduce((acc, item) => acc + item.lineTotal, 0)

    // Free delivery threshold is ₹999
    const freeDeliveryThreshold = 999
    const isFreeShipping = subtotal >= freeDeliveryThreshold
    const amountNeededForFreeShipping = Math.max(0, freeDeliveryThreshold - subtotal)
    const progressPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100)
    const shippingFee = (subtotal === 0 || isFreeShipping || appliedCoupon?.type === 'FREESHIP') ? 0 : 99

    // Calculate discount
    let discountAmount = 0
    if (appliedCoupon) {
        if (appliedCoupon.code === 'SNITCH10') {
            discountAmount = Math.round(subtotal * 0.10)
        } else if (appliedCoupon.code === 'FIRST500') {
            if (subtotal >= 1500) {
                discountAmount = 500
            }
        }
    }

    const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee)

    /* ── Coupon Handler ── */
    const handleApplyCoupon = (codeToApply) => {
        const code = (codeToApply || couponCode).trim().toUpperCase()
        setCouponError('')
        setCouponSuccess('')

        if (!code) {
            setCouponError('Please enter a coupon code')
            return
        }

        if (code === 'SNITCH10') {
            setAppliedCoupon({ code: 'SNITCH10', discount: '10%', desc: '10% off on your entire cart' })
            setCouponSuccess('10% discount applied successfully!')
            setCouponCode('')
        } else if (code === 'FIRST500') {
            if (subtotal < 1500) {
                setCouponError('Minimum order value of ₹1,500 required for FIRST500')
                return
            }
            setAppliedCoupon({ code: 'FIRST500', discount: '₹500', desc: 'Flat ₹500 discount on your order' })
            setCouponSuccess('₹500 discount applied successfully!')
            setCouponCode('')
        } else if (code === 'FREESHIP') {
            setAppliedCoupon({ code: 'FREESHIP', type: 'FREESHIP', discount: 'Free Shipping', desc: 'Free standard shipping unlocked' })
            setCouponSuccess('Free standard shipping applied!')
            setCouponCode('')
        } else {
            setCouponError('Invalid coupon code. Try SNITCH10 or FIRST500')
        }
    }

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null)
        setCouponSuccess('')
        setCouponError('')
        showToast('Coupon code removed')
    }

    /* ── Quantity Controls ── */
    const handleIncrement = (item) => {
        if (item.quantity >= item.stock) {
            showToast(`Maximum stock limit reached (${item.stock} available)`)
            return
        }
        handleIncrementCartItem({ productId: item.productId, variantId: item.variantId })
    }

    const handleDecrement = (item) => {
        if (item.quantity <= 1) return
        handleDecrementCartItem({ productId: item.productId, variantId: item.variantId })
    }

    const handleRemove = (item) => {
        handleRemoveCartItem({ productId: item.productId, variantId: item.variantId })
        showToast(`Removed "${item.title}" from bag`)
    }

    /* ── Move to Wishlist / Save for Later ── */
    const handleSaveForLater = (item) => {
        setSavedForLater(prev => [...prev, item])
        handleRemoveCartItem({ productId: item.productId, variantId: item.variantId })
        showToast(`Moved "${item.title}" to Saved for Later`)
    }

    const handleMoveBackToCart = (savedItem) => {
        setSavedForLater(prev => prev.filter(i => i.id !== savedItem.id))
        handleIncrementCartItem({ productId: savedItem.productId, variantId: savedItem.variantId })
        showToast(`Moved "${savedItem.title}" back to Bag`)
    }

    const handleProceedToCheckout = () => {
        setCheckoutProcessing(true)
        setTimeout(() => {
            setCheckoutProcessing(false)
            showToast('Order placed successfully! Thank you for shopping with Snitch.')
        }, 1500)
    }

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .cart-item-card {
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .cart-item-card:hover {
                    box-shadow: 0 10px 30px rgba(27,24,20,0.04);
                }
            `}</style>

            <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] flex flex-col justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>

                {/* ── Toast Notification ── */}
                {toastMessage && (
                    <div className="fixed bottom-6 right-6 z-50 bg-[#1b1c1a] text-[#fbf9f6] px-5 py-3.5 rounded-sm shadow-2xl flex items-center gap-3 border border-[#C9A96E]/40 text-xs tracking-wide animate-bounce">
                        <span className="text-[#C9A96E]">✦</span>
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* ── Main Container ── */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 flex-1 w-full">

                    {/* Breadcrumbs & Title */}
                    <div className="mb-8">
                        <nav className="flex items-center gap-2 text-[11px] text-[#B5ADA3] tracking-wider uppercase mb-2">
                            <span onClick={() => navigate('/')} className="hover:text-[#C9A96E] cursor-pointer transition-colors">Home</span>
                            <span>›</span>
                            <span className="text-[#1b1c1a] font-medium">Shopping Bag ({totalItemsCount})</span>
                        </nav>
                        <h1
                            className="text-3xl sm:text-4xl text-[#1b1c1a] font-light tracking-tight"
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                            Your Shopping Bag
                        </h1>
                    </div>

                    {loading ? (
                        /* Skeleton Loader */
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
                            <div className="lg:col-span-8 space-y-4">
                                {[1, 2].map(n => (
                                    <div key={n} className="bg-white border border-[#ede8e0] p-6 rounded-sm flex gap-4 h-40">
                                        <div className="w-24 bg-[#f0ece4] rounded-sm" />
                                        <div className="flex-1 space-y-3 pt-2">
                                            <div className="h-4 bg-[#f0ece4] w-2/3 rounded" />
                                            <div className="h-3 bg-[#f5f3f0] w-1/3 rounded" />
                                            <div className="h-4 bg-[#f0ece4] w-1/4 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="lg:col-span-4">
                                <div className="bg-white border border-[#ede8e0] p-6 rounded-sm h-80 bg-[#faf8f5]" />
                            </div>
                        </div>
                    ) : parsedItems.length === 0 && savedForLater.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-20 px-4 bg-white border border-[#ede8e0] rounded-sm max-w-2xl mx-auto shadow-sm" style={{ animation: 'fadeUp 0.4s ease' }}>
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#fbf9f6] border border-[#ede8e0] flex items-center justify-center text-3xl text-[#C9A96E]">
                                🛍
                            </div>
                            <h2
                                className="text-3xl font-light text-[#1b1c1a] mb-2"
                                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                            >
                                Your Bag is Empty
                            </h2>
                            <p className="text-sm text-[#7A6E63] max-w-md mx-auto mb-8 leading-relaxed font-light">
                                Looks like you haven't added anything to your cart yet. Explore our latest luxury menswear and streetwear collections.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-3.5 bg-[#1b1c1a] text-[#fbf9f6] text-[11px] tracking-[0.24em] uppercase font-medium hover:bg-[#C9A96E] hover:text-[#1b1c1a] transition-all duration-300 shadow-md cursor-pointer"
                            >
                                Explore Collection
                            </button>

                            {/* Suggestions */}
                            <div className="mt-12 pt-8 border-t border-[#ede8e0]">
                                <p className="text-[10px] tracking-[0.2em] uppercase text-[#7A6E63] mb-4 font-medium">
                                    Popular Categories
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {['Oversized T-Shirts', 'Linen Shirts', 'Korean Trousers', 'Co-ord Sets', 'Jackets'].map(tag => (
                                        <span
                                            key={tag}
                                            onClick={() => navigate('/')}
                                            className="text-xs px-3.5 py-1.5 bg-[#fbf9f6] text-[#7A6E63] border border-[#ede8e0] rounded-full hover:border-[#C9A96E] hover:text-[#1b1c1a] cursor-pointer transition-colors"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Main Cart Layout */
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

                            {/* ── Left Column: Items & Savings ── */}
                            <div className="lg:col-span-8 space-y-6">

                                {/* Free Delivery Progress Banner */}
                                <div className="bg-white border border-[#ede8e0] p-4 sm:p-5 rounded-sm shadow-xs">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">🚚</span>
                                            {isFreeShipping ? (
                                                <span className="text-emerald-700 font-medium tracking-wide">
                                                    Congratulations! You've unlocked <strong className="font-semibold">FREE Express Delivery</strong>.
                                                </span>
                                            ) : (
                                                <span className="text-[#4a4844] tracking-wide">
                                                    Add <strong className="text-[#1b1c1a] font-semibold">{fmt(amountNeededForFreeShipping)}</strong> more to get <strong className="text-[#C9A96E] font-semibold">FREE Delivery</strong>
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-[#7A6E63] font-medium hidden sm:inline">
                                            Threshold: {fmt(freeDeliveryThreshold)}
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[#f0ece4] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${isFreeShipping ? 'bg-emerald-500' : 'bg-[#C9A96E]'}`}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Cart Items List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#7A6E63]">
                                            Cart Items ({totalItemsCount})
                                        </span>
                                        <span className="text-xs text-[#B5ADA3]">
                                            Prices inclusive of all taxes
                                        </span>
                                    </div>

                                    {parsedItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="cart-item-card bg-white border border-[#ede8e0] p-4 sm:p-6 rounded-sm flex flex-col sm:flex-row gap-5 relative"
                                        >
                                            {/* Thumbnail */}
                                            <div
                                                onClick={() => navigate(`/product/${item.productId}`)}
                                                className="w-full sm:w-28 sm:h-36 aspect-[3/4] bg-[#f5f3f0] border border-[#ede8e0] rounded-sm overflow-hidden flex-shrink-0 cursor-pointer relative group"
                                            >
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl text-[#B5ADA3]">
                                                        🖼
                                                    </div>
                                                )}
                                            </div>

                                            {/* Item Info */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-[10px] tracking-[0.24em] uppercase text-[#C9A96E] font-medium mb-1">
                                                                Snitch Original
                                                            </p>
                                                            <h3
                                                                onClick={() => navigate(`/product/${item.productId}`)}
                                                                className="text-lg font-normal text-[#1b1c1a] cursor-pointer hover:text-[#C9A96E] transition-colors leading-snug"
                                                                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                                            >
                                                                {item.title}
                                                            </h3>
                                                        </div>

                                                        {/* Unit & Line Price */}
                                                        <div className="text-right">
                                                            <div className="flex items-baseline justify-end gap-2">
                                                                {item.hasPriceChanged && (
                                                                    <span className="text-xs line-through text-[#a89f91] font-normal">
                                                                        {fmt(item.cartPrice * item.quantity, item.currency)}
                                                                    </span>
                                                                )}
                                                                <p
                                                                    className={`text-xl font-medium ${item.isPriceDrop ? 'text-emerald-700' : item.isPriceIncrease ? 'text-amber-800' : 'text-[#1b1c1a]'}`}
                                                                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                                                >
                                                                    {fmt(item.lineTotal, item.currency)}
                                                                </p>
                                                            </div>
                                                            {item.quantity > 1 && (
                                                                <p className="text-[11px] text-[#7A6E63] font-light">
                                                                    {fmt(item.unitPrice, item.currency)} each
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Variant Attributes Badges */}
                                                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                                        {Object.entries(item.attributes).map(([k, v]) => (
                                                            <span
                                                                key={k}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-sm bg-[#fbf9f6] border border-[#ede8e0] text-[11px] text-[#4a4844] font-medium"
                                                            >
                                                                <span className="text-[#7A6E63] mr-1">{k}:</span> {v}
                                                            </span>
                                                        ))}

                                                        {/* Stock Status Pill */}
                                                        {item.stock > 0 && item.stock <= 5 ? (
                                                            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-sm font-medium">
                                                                Only {item.stock} left
                                                            </span>
                                                        ) : item.stock === 0 ? (
                                                            <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-sm font-medium">
                                                                Out of Stock
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-sm font-medium">
                                                                In Stock
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Price Change Notification Banner */}
                                                    {item.hasPriceChanged && (
                                                        <div className="mt-2.5">
                                                            {item.isPriceDrop ? (
                                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-medium leading-normal">
                                                                    <span className="text-xs">🏷️</span>
                                                                    <span>
                                                                        Price dropped! You save <strong className="font-semibold text-emerald-900">{fmt(item.priceDifference, item.currency)}</strong> per item. Get it now at <strong className="font-semibold text-emerald-900">{fmt(item.unitPrice, item.currency)}</strong> (was <span className="line-through opacity-75">{fmt(item.cartPrice, item.currency)}</span>)
                                                                    </span>
                                                                </div>
                                                            ) : item.isPriceIncrease ? (
                                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-amber-50 border border-amber-200/90 text-amber-800 text-[11px] font-medium leading-normal">
                                                                    <span className="text-xs">⚠️</span>
                                                                    <span>
                                                                        Price increased by <strong className="font-semibold text-amber-900">{fmt(item.priceDifference, item.currency)}</strong>. Current price is <strong className="font-semibold text-amber-900">{fmt(item.unitPrice, item.currency)}</strong> (was <span className="line-through opacity-75">{fmt(item.cartPrice, item.currency)}</span>)
                                                                    </span>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions & Quantity Stepper */}
                                                <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-[#f0ece4]">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] tracking-[0.16em] uppercase text-[#7A6E63] font-medium">
                                                            Qty:
                                                        </span>
                                                        <div className="inline-flex items-center border border-[#ede8e0] rounded-sm bg-[#fbf9f6]">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDecrement(item)}
                                                                disabled={item.quantity <= 1}
                                                                className="w-8 h-8 flex items-center justify-center text-sm font-medium hover:bg-[#ede8e0] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                                                aria-label="Decrease quantity"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="w-8 text-center text-xs font-semibold text-[#1b1c1a]">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleIncrement(item)}
                                                                disabled={item.quantity >= item.stock}
                                                                className="w-8 h-8 flex items-center justify-center text-sm font-medium hover:bg-[#ede8e0] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                                                aria-label="Increase quantity"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Secondary Action buttons */}
                                                    <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.15em] font-medium text-[#7A6E63]">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSaveForLater(item)}
                                                            className="hover:text-[#C9A96E] transition-colors cursor-pointer flex items-center gap-1.5"
                                                        >
                                                            <span>🤍</span> Save for later
                                                        </button>
                                                        <span className="text-[#ede8e0]">|</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemove(item)}
                                                            className="hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                            </svg>
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Saved For Later Section (if any) */}
                                {savedForLater.length > 0 && (
                                    <div className="mt-10 pt-8 border-t border-[#ede8e0] space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3
                                                className="text-2xl font-light text-[#1b1c1a]"
                                                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                            >
                                                Saved for Later ({savedForLater.length})
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {savedForLater.map(saved => (
                                                <div key={saved.id} className="bg-white border border-[#ede8e0] p-4 rounded-sm flex gap-3.5 items-center">
                                                    <img
                                                        src={saved.image}
                                                        alt={saved.title}
                                                        className="w-16 h-20 object-cover object-top rounded-sm bg-[#f5f3f0] flex-shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-medium text-[#1b1c1a] truncate mb-1">
                                                            {saved.title}
                                                        </h4>
                                                        <p className="text-xs font-serif font-medium text-[#1b1c1a] mb-2">
                                                            {fmt(saved.unitPrice, saved.currency)}
                                                        </p>
                                                        <button
                                                            onClick={() => handleMoveBackToCart(saved)}
                                                            className="text-[10px] tracking-[0.16em] uppercase text-[#C9A96E] hover:underline font-semibold"
                                                        >
                                                            + Move to Bag
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Luxury Value Props */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                                    <div className="p-4 bg-white border border-[#ede8e0] rounded-sm flex items-center gap-3">
                                        <span className="text-2xl">✨</span>
                                        <div>
                                            <p className="text-xs font-semibold text-[#1b1c1a]">100% Authentic</p>
                                            <p className="text-[10px] text-[#7A6E63]">Direct from verified workshop</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white border border-[#ede8e0] rounded-sm flex items-center gap-3">
                                        <span className="text-2xl">⚡</span>
                                        <div>
                                            <p className="text-xs font-semibold text-[#1b1c1a]">Fast Express Shipping</p>
                                            <p className="text-[10px] text-[#7A6E63]">Dispatch within 24 hours</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white border border-[#ede8e0] rounded-sm flex items-center gap-3">
                                        <span className="text-2xl">🔄</span>
                                        <div>
                                            <p className="text-xs font-semibold text-[#1b1c1a]">7-Day Easy Returns</p>
                                            <p className="text-[10px] text-[#7A6E63]">Hassle-free doorstep pickup</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Right Column: Sticky Order Summary ── */}
                            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">

                                {/* Summary Card */}
                                <div className="bg-white border border-[#ede8e0] p-6 rounded-sm shadow-sm">
                                    <h2
                                        className="text-2xl font-light text-[#1b1c1a] pb-4 border-b border-[#ede8e0]"
                                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                    >
                                        Order Summary
                                    </h2>

                                    {/* Coupons Section */}
                                    <div className="py-4 border-b border-[#ede8e0] space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] tracking-[0.16em] uppercase font-medium text-[#7A6E63] flex items-center gap-1.5">
                                                <span>🏷️</span> Apply Coupon
                                            </span>
                                        </div>

                                        {appliedCoupon ? (
                                            <div className="bg-[#fbf9f6] border border-[#C9A96E] p-3 rounded-sm flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-bold tracking-wider text-[#1b1c1a] uppercase bg-[#C9A96E]/20 px-1.5 py-0.5 rounded">
                                                            {appliedCoupon.code}
                                                        </span>
                                                        <span className="text-xs text-emerald-700 font-medium">Applied</span>
                                                    </div>
                                                    <p className="text-[10px] text-[#7A6E63] mt-1">{appliedCoupon.desc}</p>
                                                </div>
                                                <button
                                                    onClick={handleRemoveCoupon}
                                                    className="text-[10px] uppercase tracking-wider text-rose-600 hover:underline font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter promo code"
                                                        value={couponCode}
                                                        onChange={e => {
                                                            setCouponCode(e.target.value)
                                                            setCouponError('')
                                                        }}
                                                        className="flex-1 px-3 py-2 text-xs uppercase bg-[#fbf9f6] border border-[#ede8e0] rounded-sm focus:outline-none focus:border-[#C9A96E] transition-colors"
                                                    />
                                                    <button
                                                        onClick={() => handleApplyCoupon()}
                                                        className="px-4 py-2 bg-[#1b1c1a] text-[#fbf9f6] text-[10px] uppercase tracking-wider hover:bg-[#C9A96E] hover:text-[#1b1c1a] transition-colors cursor-pointer rounded-sm"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>

                                                {couponError && (
                                                    <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                                                )}
                                                {couponSuccess && (
                                                    <p className="text-[11px] text-emerald-700 font-medium">{couponSuccess}</p>
                                                )}

                                                {/* Preset coupon chips */}
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApplyCoupon('SNITCH10')}
                                                        className="text-[10px] px-2 py-1 bg-[#fbf9f6] border border-dashed border-[#C9A96E] text-[#1b1c1a] rounded-sm hover:bg-[#f7f3ec] transition-colors"
                                                    >
                                                        <strong>SNITCH10</strong> (10% Off)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApplyCoupon('FIRST500')}
                                                        className="text-[10px] px-2 py-1 bg-[#fbf9f6] border border-dashed border-[#C9A96E] text-[#1b1c1a] rounded-sm hover:bg-[#f7f3ec] transition-colors"
                                                    >
                                                        <strong>FIRST500</strong> (₹500 Off)
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Breakdown */}
                                    <div className="py-4 space-y-3 text-xs border-b border-[#ede8e0]">
                                        <div className="flex justify-between text-[#4a4844]">
                                            <span>Subtotal ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})</span>
                                            <span className="font-medium text-[#1b1c1a]">{fmt(subtotal)}</span>
                                        </div>

                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-emerald-700 font-medium">
                                                <span>Coupon Discount ({appliedCoupon?.code})</span>
                                                <span>- {fmt(discountAmount)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-[#4a4844]">
                                            <span>Estimated Delivery Fee</span>
                                            <span>
                                                {shippingFee === 0 ? (
                                                    <span className="text-emerald-700 font-medium uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded-sm">
                                                        FREE
                                                    </span>
                                                ) : (
                                                    <span>{fmt(shippingFee)}</span>
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-[#7A6E63] text-[11px]">
                                            <span>Estimated Tax & Duties</span>
                                            <span className="italic">Included in MRP</span>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="py-4 flex items-baseline justify-between">
                                        <div>
                                            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1b1c1a] block">
                                                Total Payable
                                            </span>
                                            <span className="text-[10px] text-[#7A6E63]">
                                                Inclusive of all taxes
                                            </span>
                                        </div>
                                        <span
                                            className="text-3xl font-medium text-[#1b1c1a]"
                                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                        >
                                            {fmt(grandTotal)}
                                        </span>
                                    </div>

                                    {/* Delivery Timeline Widget */}
                                    <div className="mb-5 p-3 bg-[#fbf9f6] border border-[#ede8e0] rounded-sm flex items-center gap-3 text-xs">
                                        <span className="text-xl">📦</span>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-[#7A6E63] font-medium">
                                                Estimated Delivery
                                            </p>
                                            <p className="text-xs font-semibold text-[#1b1c1a]">
                                                {getDeliveryDateRange()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        type="button"
                                        onClick={handleProceedToCheckout}
                                        disabled={checkoutProcessing || parsedItems.length === 0}
                                        className="w-full py-4 bg-[#1b1c1a] text-[#fbf9f6] text-[11px] tracking-[0.28em] uppercase font-medium hover:bg-[#C9A96E] hover:text-[#1b1c1a] transition-all duration-300 rounded-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {checkoutProcessing ? (
                                            <span className="flex items-center gap-2">
                                                <span className="animate-spin">✦</span> Processing...
                                            </span>
                                        ) : (
                                            <>
                                                <span>Proceed to Checkout</span>
                                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                                </svg>
                                            </>
                                        )}
                                    </button>

                                    {/* Trust / Security Guarantee */}
                                    <div className="mt-4 pt-4 border-t border-[#ede8e0] text-center space-y-2">
                                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#7A6E63] uppercase tracking-wider font-medium">
                                            <span>🔒</span> 256-Bit SSL Encrypted Checkout
                                        </div>
                                        <p className="text-[9px] text-[#B5ADA3] tracking-wide">
                                            UPI · Cards · NetBanking · Cash On Delivery
                                        </p>
                                    </div>
                                </div>

                                {/* Need Help Card */}
                                <div className="p-4 bg-white border border-[#ede8e0] rounded-sm text-center">
                                    <p className="text-xs font-medium text-[#1b1c1a] mb-1">Need assistance with your order?</p>
                                    <p className="text-[11px] text-[#7A6E63] mb-2">Our concierge team is available 24/7</p>
                                    <span className="text-xs text-[#C9A96E] font-medium tracking-wide underline cursor-pointer">
                                        support@snitch.co.in
                                    </span>
                                </div>

                            </div>

                        </div>
                    )}

                </main>

                {/* ── Footer ── */}
                <footer className="bg-[#1b1c1a] text-[#fbf9f6] py-8 px-6 lg:px-12 border-t border-[#ede8e0]/10 mt-16">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A6E63]">
                        <div className="flex items-center gap-3">
                            <span className="font-serif text-sm tracking-[0.3em] uppercase text-[#C9A96E]">Snitch.</span>
                            <span>© 2026 Snitch. All rights reserved.</span>
                        </div>
                        <div className="flex gap-6 text-[11px] tracking-wider uppercase">
                            <span onClick={() => navigate('/')} className="hover:text-white cursor-pointer transition-colors">Shop</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Shipping & Returns</span>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    )
}

export default Cart