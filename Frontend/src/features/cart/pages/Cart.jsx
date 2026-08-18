import React, { useEffect, useState, useMemo } from 'react'
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
const getDeliveryDateRange = (daysMin = 3, daysMax = 5) => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() + daysMin)
    const end = new Date(today)
    end.setDate(today.getDate() + daysMax)

    const opt = { day: 'numeric', month: 'short' }
    return `${start.toLocaleDateString('en-US', opt)} - ${end.toLocaleDateString('en-US', opt)}`
}

const AVAILABLE_COUPONS = [
    {
        code: 'SNITCH10',
        title: '10% OFF',
        desc: '10% discount on entire cart',
        minSpend: 0,
        type: 'PERCENTAGE',
        value: 10
    },
    {
        code: 'FIRST500',
        title: 'FLAT ₹500 OFF',
        desc: 'Save ₹500 on orders above ₹1,499',
        minSpend: 1499,
        type: 'FLAT',
        value: 500
    },
    {
        code: 'LUXE15',
        title: '15% OFF',
        desc: '15% luxury discount on orders above ₹2,999',
        minSpend: 2999,
        type: 'PERCENTAGE',
        value: 15
    },
    {
        code: 'FREESHIP',
        title: 'FREE EXPRESS SHIPPING',
        desc: 'Zero shipping fee on any cart value',
        minSpend: 0,
        type: 'FREESHIP',
        value: 0
    }
]

const Cart = () => {
    const navigate = useNavigate()
    const {
        loading: cartLoading,
        updatingItems,
        handleGetCart,
        handleIncrementCartItem,
        handleDecrementCartItem,
        handleRemoveCartItem,
        handleClearCart
    } = useCart()

    const rawCart = useSelector(state => state.cart)
    const user = useSelector(state => state.auth?.user)

    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [couponInput, setCouponInput] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [couponError, setCouponError] = useState('')
    const [couponSuccess, setCouponSuccess] = useState('')
    const [toast, setToast] = useState(null)

    // Saved For Later (with localStorage persistence)
    const [savedForLater, setSavedForLater] = useState(() => {
        try {
            const saved = localStorage.getItem('snitch_saved_for_later')
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    })

    // Pincode Delivery Checker
    const [pincode, setPincode] = useState('560001')
    const [pincodeStatus, setPincodeStatus] = useState({
        checked: true,
        valid: true,
        city: 'Bengaluru',
        days: '2-3 Business Days'
    })
    const [pincodeInput, setPincodeInput] = useState('560001')
    const [pincodeChecking, setPincodeChecking] = useState(false)

    // Checkout Modal
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
    const [checkoutStep, setCheckoutStep] = useState('address') // 'address' | 'payment' | 'success'
    const [checkoutProcessing, setCheckoutProcessing] = useState(false)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi')
    const [deliveryAddress, setDeliveryAddress] = useState({
        name: user?.name || 'Aashish Kumar',
        phone: user?.phone || '9876543210',
        street: 'Flat 402, Prestige Hermitage, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
    })

    // Sync savedForLater to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('snitch_saved_for_later', JSON.stringify(savedForLater))
        } catch (e) {
            console.error('Failed to sync saved for later:', e)
        }
    }, [savedForLater])

    // Load cart on mount
    useEffect(() => {
        setIsInitialLoading(true)
        handleGetCart()
            .catch(err => console.error('Failed to fetch cart on mount:', err))
            .finally(() => setIsInitialLoading(false))
    }, [handleGetCart])

    const showToast = (message, undoAction = null) => {
        setToast({ message, undoAction })
        setTimeout(() => {
            setToast(null)
        }, 4500)
    }

    /* ── Helper to extract image URL safely ── */
    const extractImageUrl = (img) => {
        if (!img) return ''
        if (typeof img === 'string') return img
        if (typeof img === 'object') {
            return img.url || img.secure_url || img.src || ''
        }
        return ''
    }

    /* ── Resolve Cart Items accurately for both Object & Array variants ── */
    const resolveCartItem = (cartItem) => {
        if (!cartItem) return null
        const product = cartItem.product || {}

        // Resolve variant ID whether it's a string, an object, or embedded inside product.variants
        const rawVariantId = (typeof cartItem.variant === 'object' && cartItem.variant?._id)
            ? String(cartItem.variant._id)
            : (cartItem.variant ? String(cartItem.variant) : '')

        // Resolve matched variant subdocument:
        // Case 1: product.variants is a single object (e.g. { _id, images, attributes, price, stock })
        // Case 2: product.variants is an array of objects ([{ _id, ... }])
        // Case 3: cartItem.variant is populated as an object
        let matchedVariant = null

        if (product.variants && typeof product.variants === 'object' && !Array.isArray(product.variants)) {
            matchedVariant = product.variants
        } else if (Array.isArray(product.variants) && product.variants.length > 0) {
            matchedVariant = product.variants.find(v => String(v._id) === rawVariantId || String(v.id) === rawVariantId) || product.variants[0]
        } else if (typeof cartItem.variant === 'object' && cartItem.variant !== null) {
            matchedVariant = cartItem.variant
        }

        const variantId = rawVariantId || (matchedVariant?._id ? String(matchedVariant._id) : '')
        const productId = String(product._id || product.id || '')

        // Selected Variant Image Resolution Priority:
        let image = ''

        // Priority 1: Variant images array
        if (matchedVariant?.images && Array.isArray(matchedVariant.images) && matchedVariant.images.length > 0) {
            for (const img of matchedVariant.images) {
                const url = extractImageUrl(img)
                if (url) {
                    image = url
                    break
                }
            }
        }

        // Priority 2: Variant single image field
        if (!image && matchedVariant?.images) {
            image = extractImageUrl(matchedVariant.images)
        }
        if (!image && matchedVariant?.image) {
            image = extractImageUrl(matchedVariant.image)
        }

        // Priority 3: Cart item direct image
        if (!image && cartItem.image) {
            image = extractImageUrl(cartItem.image)
        }

        // Priority 4: Fallback to product images
        if (!image && product?.images && Array.isArray(product.images) && product.images.length > 0) {
            for (const img of product.images) {
                const url = extractImageUrl(img)
                if (url) {
                    image = url
                    break
                }
            }
        }
        if (!image && product?.images) {
            image = extractImageUrl(product.images)
        }
        if (!image && product?.image) {
            image = extractImageUrl(product.image)
        }

        // Pricing extraction
        const cartPrice = cartItem.price?.amount
        const livePrice = matchedVariant?.price?.amount ?? product.price?.amount
        const unitPrice = livePrice ?? cartPrice ?? 0
        const originalPrice = matchedVariant?.mrp ?? product.mrp ?? (unitPrice ? Math.round(unitPrice * 1.35) : 0)

        const currency = cartItem.price?.currency ??
            matchedVariant?.price?.currency ??
            product.price?.currency ??
            'INR'

        const stock = matchedVariant?.stock ?? product.stock ?? 20
        const attributes = matchedVariant?.attributes || (typeof cartItem.variant === 'object' ? cartItem.variant?.attributes : {}) || {}
        const quantity = Math.max(1, cartItem.quantity || 1)

        // Price comparison & discounts
        const hasPriceChanged = typeof cartPrice === 'number' && typeof livePrice === 'number' && cartPrice !== livePrice
        const isPriceDrop = hasPriceChanged && livePrice < cartPrice
        const isPriceIncrease = hasPriceChanged && livePrice > cartPrice
        const priceDifference = hasPriceChanged ? Math.abs(livePrice - cartPrice) : 0

        const itemKey = `${productId}_${variantId || 'default'}`

        return {
            id: cartItem._id || itemKey,
            itemKey,
            productId,
            variantId,
            title: product.title || 'Snitch Classic Apparel',
            description: product.description || '',
            image,
            unitPrice,
            originalPrice,
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

    // Safely extract items array from Redux cart state
    const parsedItems = useMemo(() => {
        const rawItems = Array.isArray(rawCart?.items)
            ? rawCart.items
            : (Array.isArray(rawCart) ? rawCart : [])
        return rawItems.map(resolveCartItem).filter(Boolean)
    }, [rawCart])

    const totalItemsCount = parsedItems.reduce((acc, item) => acc + item.quantity, 0)
    const subtotal = parsedItems.reduce((acc, item) => acc + item.lineTotal, 0)
    const totalMRP = parsedItems.reduce((acc, item) => acc + (item.originalPrice * item.quantity), 0)
    const catalogSavings = Math.max(0, totalMRP - subtotal)

    // Free delivery calculation (Threshold: ₹999)
    const freeDeliveryThreshold = 999
    const isFreeShippingByValue = subtotal >= freeDeliveryThreshold
    const isFreeShipping = isFreeShippingByValue || appliedCoupon?.type === 'FREESHIP'
    const amountNeededForFreeShipping = Math.max(0, freeDeliveryThreshold - subtotal)
    const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100))
    const shippingFee = (subtotal === 0 || isFreeShipping) ? 0 : 99

    // Discount Calculation
    const discountAmount = useMemo(() => {
        if (!appliedCoupon || subtotal === 0) return 0
        if (appliedCoupon.type === 'PERCENTAGE') {
            return Math.round((subtotal * appliedCoupon.value) / 100)
        }
        if (appliedCoupon.type === 'FLAT') {
            return Math.min(subtotal, appliedCoupon.value)
        }
        return 0
    }, [appliedCoupon, subtotal])

    const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee)
    const totalOrderSavings = catalogSavings + discountAmount + (shippingFee === 0 && subtotal > 0 ? 99 : 0)

    /* ── Coupon Handlers ── */
    const handleApplyCoupon = (couponToApply) => {
        const couponCode = (typeof couponToApply === 'string' ? couponToApply : couponInput).trim().toUpperCase()
        setCouponError('')
        setCouponSuccess('')

        if (!couponCode) {
            setCouponError('Please enter a valid promo code.')
            return
        }

        const matched = AVAILABLE_COUPONS.find(c => c.code === couponCode)
        if (!matched) {
            setCouponError(`Invalid coupon code "${couponCode}". Please check available offers.`)
            return
        }

        if (matched.minSpend > 0 && subtotal < matched.minSpend) {
            setCouponError(`Minimum order value of ${fmt(matched.minSpend)} required for ${matched.code}.`)
            return
        }

        setAppliedCoupon(matched)
        setCouponSuccess(`Coupon "${matched.code}" applied successfully!`)
        setCouponInput('')
        showToast(`Coupon ${matched.code} applied! Saved ${matched.type === 'PERCENTAGE' ? `${matched.value}%` : fmt(matched.value)}`)
    }

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null)
        setCouponSuccess('')
        setCouponError('')
        showToast('Coupon code removed')
    }

    /* ── Quantity Stepper Handlers ── */
    const handleIncrement = (item) => {
        if (item.quantity >= item.stock) {
            showToast(`Maximum available stock limit (${item.stock}) reached for this item.`)
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
        showToast(`Removed "${item.title}" from bag.`, () => {
            // Undo Action
            handleIncrementCartItem({ productId: item.productId, variantId: item.variantId })
            showToast(`Restored "${item.title}" to bag.`)
        })
    }

    /* ── Save for Later ── */
    const handleSaveForLater = (item) => {
        setSavedForLater(prev => {
            const exists = prev.some(s => s.productId === item.productId && s.variantId === item.variantId)
            if (exists) return prev
            return [item, ...prev]
        })
        handleRemoveCartItem({ productId: item.productId, variantId: item.variantId })
        showToast(`Moved "${item.title}" to Saved for Later.`)
    }

    const handleMoveBackToCart = (savedItem) => {
        setSavedForLater(prev => prev.filter(s => !(s.productId === savedItem.productId && s.variantId === savedItem.variantId)))
        handleIncrementCartItem({ productId: savedItem.productId, variantId: savedItem.variantId })
        showToast(`Moved "${savedItem.title}" back to bag.`)
    }

    const handleRemoveSavedItem = (savedItem) => {
        setSavedForLater(prev => prev.filter(s => !(s.productId === savedItem.productId && s.variantId === savedItem.variantId)))
        showToast(`Removed "${savedItem.title}" from saved list.`)
    }

    /* ── Pincode Checker ── */
    const handleCheckPincode = (e) => {
        e?.preventDefault()
        const code = pincodeInput.trim()
        if (!/^\d{6}$/.test(code)) {
            setPincodeStatus({
                checked: true,
                valid: false,
                city: '',
                days: ''
            })
            return
        }

        setPincodeChecking(true)
        setTimeout(() => {
            setPincodeChecking(false)
            setPincode(code)
            setPincodeStatus({
                checked: true,
                valid: true,
                city: code.startsWith('11') ? 'New Delhi' : code.startsWith('40') ? 'Mumbai' : code.startsWith('56') ? 'Bengaluru' : 'Direct Metro Delivery',
                days: '2-4 Business Days'
            })
        }, 400)
    }

    /* ── Checkout Simulation ── */
    const handleOpenCheckout = () => {
        setCheckoutStep('address')
        setCheckoutModalOpen(true)
    }

    const handleConfirmOrder = () => {
        setCheckoutProcessing(true)
        setTimeout(() => {
            setCheckoutProcessing(false)
            setCheckoutStep('success')
            handleClearCart()
        }, 1200)
    }

    const isBagEmpty = parsedItems.length === 0

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <style>{`
                .editorial-font {
                    font-family: 'Cormorant Garamond', Georgia, serif;
                }
                .sans-font {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }
                @keyframes pulseGold {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(201, 169, 110, 0.25); }
                    50% { box-shadow: 0 0 0 8px rgba(201, 169, 110, 0); }
                }
                .gold-pulse {
                    animation: pulseGold 2.5s infinite;
                }
                .cart-card {
                    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
                }
                .cart-card:hover {
                    border-color: #d1c7b7;
                    box-shadow: 0 10px 30px -4px rgba(27, 28, 26, 0.06);
                }
            `}</style>

            <div className="min-h-screen bg-[#faf8f5] text-[#1b1c1a] sans-font flex flex-col justify-between selection:bg-[#C9A96E]/20 selection:text-[#1b1c1a]">

                {/* ── Toast Notification ── */}
                {toast && (
                    <div className="fixed bottom-6 right-6 z-50 bg-[#141413] text-[#faf8f5] px-5 py-3.5 rounded shadow-2xl flex items-center gap-4 border border-[#C9A96E]/40 text-xs tracking-wide transition-all transform animate-in slide-in-from-bottom duration-300">
                        <span className="text-[#C9A96E] text-base">✦</span>
                        <span className="font-normal">{toast.message}</span>
                        {toast.undoAction && (
                            <button
                                onClick={toast.undoAction}
                                className="text-[#C9A96E] uppercase font-bold tracking-wider hover:underline ml-1 cursor-pointer"
                            >
                                Undo
                            </button>
                        )}
                        <button
                            onClick={() => setToast(null)}
                            className="text-stone-400 hover:text-white ml-2 text-sm leading-none cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* ── Main Content Container ── */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 flex-1 w-full">

                    {/* Breadcrumbs & Page Header */}
                    <div className="mb-8 border-b border-[#ede8e0] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <nav className="flex items-center gap-2 text-[11px] text-[#7A6E63] tracking-[0.2em] uppercase mb-2.5">
                                <span onClick={() => navigate('/')} className="hover:text-[#C9A96E] cursor-pointer transition-colors">Home</span>
                                <span className="text-[#ede8e0]">/</span>
                                <span className="text-[#1b1c1a] font-semibold">Shopping Bag</span>
                            </nav>
                            <div className="flex items-baseline gap-3">
                                <h1 className="editorial-font text-3xl sm:text-4xl lg:text-5xl font-light text-[#1b1c1a] tracking-tight">
                                    Your Shopping Bag
                                </h1>
                                <span className="text-xs uppercase tracking-[0.2em] text-[#7A6E63] font-medium">
                                    ({totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'})
                                </span>
                            </div>
                        </div>

                        {/* Trust Highlights */}
                        <div className="hidden sm:flex items-center gap-6 text-[11px] uppercase tracking-[0.18em] text-[#7A6E63]">
                            <div className="flex items-center gap-2">
                                <span className="text-[#C9A96E]">✦</span>
                                <span>100% Authentic Apparel</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[#C9A96E]">✦</span>
                                <span>7-Day Easy Returns</span>
                            </div>
                        </div>
                    </div>

                    {isInitialLoading ? (
                        /* Skeleton Loader */
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
                            <div className="lg:col-span-8 space-y-4">
                                {[1, 2].map(n => (
                                    <div key={n} className="bg-white border border-[#ede8e0] p-6 rounded flex gap-5 h-44">
                                        <div className="w-28 bg-[#f0ece4] rounded" />
                                        <div className="flex-1 space-y-3 pt-2">
                                            <div className="h-4 bg-[#f0ece4] w-2/3 rounded" />
                                            <div className="h-3 bg-[#f5f3f0] w-1/3 rounded" />
                                            <div className="h-4 bg-[#f0ece4] w-1/4 rounded mt-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="lg:col-span-4">
                                <div className="bg-white border border-[#ede8e0] p-6 rounded h-96 bg-[#faf8f5]" />
                            </div>
                        </div>
                    ) : isBagEmpty && savedForLater.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-20 px-4 bg-white border border-[#ede8e0] rounded max-w-2xl mx-auto shadow-xs animate-in fade-in duration-300">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#faf8f5] border border-[#ede8e0] flex items-center justify-center text-4xl text-[#C9A96E] gold-pulse">
                                🛍️
                            </div>
                            <h2 className="editorial-font text-3xl sm:text-4xl font-light text-[#1b1c1a] mb-3">
                                Your Shopping Bag is Empty
                            </h2>
                            <p className="text-xs sm:text-sm text-[#7A6E63] max-w-md mx-auto mb-8 leading-relaxed font-light">
                                Looks like you haven't made your choice yet. Explore our curated collections of luxury streetwear, Italian linen shirts, and tailored trousers.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-10 py-4 bg-[#141413] text-[#faf8f5] text-[11px] tracking-[0.28em] uppercase font-medium hover:bg-[#C9A96E] hover:text-[#141413] transition-all duration-300 shadow-md cursor-pointer rounded-xs"
                            >
                                Explore New Drops
                            </button>

                            {/* Trending Categories */}
                            <div className="mt-14 pt-8 border-t border-[#ede8e0]">
                                <p className="text-[10px] tracking-[0.24em] uppercase text-[#7A6E63] mb-4 font-semibold">
                                    Trending Collections
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {['Oversized T-Shirts', 'Linen Shirts', 'Korean Trousers', 'Co-ord Sets', 'Minimalist Tees', 'Jackets'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => navigate(`/?search=${encodeURIComponent(tag)}`)}
                                            className="text-xs px-4 py-2 bg-[#faf8f5] text-[#1b1c1a] border border-[#ede8e0] rounded hover:border-[#C9A96E] hover:text-[#C9A96E] cursor-pointer transition-colors duration-150"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Main Bag Content */
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

                            {/* ── Left Column: Items, Free Shipping & Saved Items ── */}
                            <div className="lg:col-span-8 space-y-6">

                                {/* Free Delivery Progress Card */}
                                <div className="bg-white border border-[#ede8e0] p-4 sm:p-5 rounded shadow-2xs">
                                    <div className="flex items-center justify-between text-xs mb-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-lg">🚚</span>
                                            {isFreeShipping ? (
                                                <span className="text-emerald-800 font-medium tracking-wide flex items-center gap-1.5">
                                                    <span>🎉</span> You've unlocked <strong className="font-semibold underline decoration-emerald-500">FREE Express Delivery</strong> on this order!
                                                </span>
                                            ) : (
                                                <span className="text-[#4a4844] tracking-wide">
                                                    Add <strong className="text-[#141413] font-semibold">{fmt(amountNeededForFreeShipping)}</strong> more to get <strong className="text-[#C9A96E] font-semibold">FREE Express Delivery</strong>
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-[#7A6E63] font-medium hidden sm:inline uppercase tracking-wider">
                                            Free at {fmt(freeDeliveryThreshold)}
                                        </span>
                                    </div>

                                    {/* Progress Track */}
                                    <div className="w-full h-2 bg-[#f0ece4] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-700 ease-out ${isFreeShipping ? 'bg-emerald-600' : 'bg-[#C9A96E]'}`}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Cart Items List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7A6E63]">
                                            Items in Bag ({totalItemsCount})
                                        </span>
                                        <span className="text-[11px] text-[#7A6E63]">
                                            All taxes included
                                        </span>
                                    </div>

                                    {parsedItems.map((item) => {
                                        const isItemUpdating = updatingItems[item.itemKey]

                                        return (
                                            <div
                                                key={item.id}
                                                className={`cart-card bg-white border border-[#ede8e0] p-4 sm:p-6 rounded flex flex-col sm:flex-row gap-5 relative ${
                                                    isItemUpdating ? 'opacity-70 pointer-events-none' : ''
                                                }`}
                                            >
                                                {/* Selected Variant Image Thumbnail */}
                                                <div
                                                    onClick={() => navigate(`/product/${item.productId}`)}
                                                    className="w-full sm:w-32 sm:h-44 aspect-[3/4] bg-[#f5f3f0] border border-[#ede8e0] rounded overflow-hidden flex-shrink-0 cursor-pointer relative group"
                                                >
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-3xl text-[#7A6E63]">
                                                            👔
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <p className="text-[10px] tracking-[0.24em] uppercase text-[#C9A96E] font-semibold mb-1">
                                                                    Snitch Originals
                                                                </p>
                                                                <h3
                                                                    onClick={() => navigate(`/product/${item.productId}`)}
                                                                    className="editorial-font text-xl sm:text-2xl font-normal text-[#1b1c1a] cursor-pointer hover:text-[#C9A96E] transition-colors leading-snug"
                                                                >
                                                                    {item.title}
                                                                </h3>
                                                            </div>

                                                            {/* Pricing info */}
                                                            <div className="text-right flex-shrink-0">
                                                                <div className="flex items-baseline justify-end gap-2">
                                                                    {item.hasPriceChanged && (
                                                                        <span className="text-xs line-through text-[#7A6E63] font-normal">
                                                                            {fmt(item.cartPrice * item.quantity, item.currency)}
                                                                        </span>
                                                                    )}
                                                                    <p className={`editorial-font text-2xl font-medium ${
                                                                        item.isPriceDrop
                                                                            ? 'text-emerald-700'
                                                                            : item.isPriceIncrease
                                                                            ? 'text-rose-600 font-semibold'
                                                                            : 'text-[#1b1c1a]'
                                                                    }`}>
                                                                        {fmt(item.lineTotal, item.currency)}
                                                                    </p>
                                                                </div>
                                                                {item.quantity > 1 && (
                                                                    <p className={`text-[11px] font-light ${item.isPriceIncrease ? 'text-rose-500' : 'text-[#7A6E63]'}`}>
                                                                        {fmt(item.unitPrice, item.currency)} / piece
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Selected Variant Attributes & Stock */}
                                                        <div className="flex flex-wrap items-center gap-2 mt-3">
                                                            {Object.entries(item.attributes).map(([k, v]) => (
                                                                <span
                                                                    key={k}
                                                                    className="inline-flex items-center px-2.5 py-1 rounded bg-[#faf8f5] border border-[#ede8e0] text-[11px] text-[#4a4844] font-medium"
                                                                >
                                                                    <span className="text-[#7A6E63] mr-1 uppercase text-[9px] tracking-wider">{k}:</span> {v}
                                                                </span>
                                                            ))}

                                                            {/* Stock Status Badge */}
                                                            {item.stock > 0 && item.stock <= 5 ? (
                                                                <span className="text-[10px] uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                                                                    Only {item.stock} left in stock
                                                                </span>
                                                            ) : item.stock === 0 ? (
                                                                <span className="text-[10px] uppercase tracking-wider text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-medium">
                                                                    Out of Stock
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                                                                    In Stock
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Price Change Notifications */}
                                                        {item.hasPriceChanged && (
                                                            <div className="mt-3">
                                                                {item.isPriceIncrease && (
                                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium animate-pulse">
                                                                        <span className="text-xs">⚠️</span>
                                                                        <span>
                                                                            Price increased by <strong className="font-semibold text-rose-900">{fmt(item.priceDifference, item.currency)}</strong>. Current price is <strong className="font-semibold text-rose-900">{fmt(item.unitPrice, item.currency)}</strong> (was <span className="line-through opacity-75">{fmt(item.cartPrice, item.currency)}</span>)
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {item.isPriceDrop && (
                                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                                                                        <span className="text-xs">🏷️</span>
                                                                        <span>
                                                                            Price Drop! You save <strong className="font-semibold text-emerald-900">{fmt(item.priceDifference, item.currency)}</strong> per item. Current price is <strong className="font-semibold text-emerald-900">{fmt(item.unitPrice, item.currency)}</strong> (was <span className="line-through opacity-75">{fmt(item.cartPrice, item.currency)}</span>)
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Controls & Secondary Actions */}
                                                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-[#f0ece4]">
                                                        {/* Quantity Stepper */}
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] tracking-[0.2em] uppercase text-[#7A6E63] font-semibold">
                                                                Quantity:
                                                            </span>
                                                            <div className="inline-flex items-center border border-[#ede8e0] rounded bg-[#faf8f5]">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDecrement(item)}
                                                                    disabled={item.quantity <= 1 || isItemUpdating}
                                                                    className="w-8 h-8 flex items-center justify-center text-sm font-medium hover:bg-[#ede8e0] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                                                    aria-label="Decrease quantity"
                                                                >
                                                                    −
                                                                </button>
                                                                <span className="w-9 text-center text-xs font-semibold text-[#1b1c1a]">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleIncrement(item)}
                                                                    disabled={item.quantity >= item.stock || isItemUpdating}
                                                                    className="w-8 h-8 flex items-center justify-center text-sm font-medium hover:bg-[#ede8e0] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                                                    aria-label="Increase quantity"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.16em] font-medium text-[#7A6E63]">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSaveForLater(item)}
                                                                disabled={isItemUpdating}
                                                                className="hover:text-[#C9A96E] transition-colors cursor-pointer flex items-center gap-1.5"
                                                            >
                                                                <span>🤍</span> Save for Later
                                                            </button>
                                                            <span className="text-[#ede8e0]">|</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemove(item)}
                                                                disabled={isItemUpdating}
                                                                className="hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1.5"
                                                            >
                                                                <span>✕</span> Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Saved for Later Section */}
                                {savedForLater.length > 0 && (
                                    <div className="mt-12 pt-8 border-t border-[#ede8e0] space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="editorial-font text-2xl sm:text-3xl font-light text-[#1b1c1a]">
                                                Saved for Later ({savedForLater.length})
                                            </h3>
                                            <span className="text-xs text-[#7A6E63]">
                                                Items stay saved in your browser
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {savedForLater.map(saved => (
                                                <div key={saved.id} className="bg-white border border-[#ede8e0] p-4 rounded flex gap-4 items-center">
                                                    <img
                                                        src={saved.image}
                                                        alt={saved.title}
                                                        className="w-18 h-24 object-cover object-top rounded bg-[#f5f3f0] flex-shrink-0 border border-[#ede8e0]"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-semibold text-[#1b1c1a] truncate mb-1">
                                                            {saved.title}
                                                        </h4>
                                                        <p className="editorial-font text-base font-medium text-[#1b1c1a] mb-2">
                                                            {fmt(saved.unitPrice, saved.currency)}
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => handleMoveBackToCart(saved)}
                                                                className="text-[10px] tracking-[0.18em] uppercase text-[#C9A96E] font-bold hover:underline cursor-pointer"
                                                            >
                                                                + Move to Bag
                                                            </button>
                                                            <button
                                                                onClick={() => handleRemoveSavedItem(saved)}
                                                                className="text-[10px] tracking-[0.18em] uppercase text-[#7A6E63] hover:text-rose-600 cursor-pointer"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Luxury Pillars */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                                    <div className="p-4 bg-white border border-[#ede8e0] rounded flex items-center gap-3.5">
                                        <span className="text-2xl">✨</span>
                                        <div>
                                            <p className="text-xs font-semibold text-[#1b1c1a]">100% Genuine Apparel</p>
                                            <p className="text-[10px] text-[#7A6E63]">Direct from verified atelier</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white border border-[#ede8e0] rounded flex items-center gap-3.5">
                                        <span className="text-2xl">⚡</span>
                                        <div>
                                            <p className="text-xs font-semibold text-[#1b1c1a]">Pan-India Express Dispatch</p>
                                            <p className="text-[10px] text-[#7A6E63]">Dispatched within 24 hours</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white border border-[#ede8e0] rounded flex items-center gap-3.5">
                                        <span className="text-2xl">🔄</span>
                                        <div>
                                            <p className="text-xs font-semibold text-[#1b1c1a]">7-Day Doorstep Returns</p>
                                            <p className="text-[10px] text-[#7A6E63]">Hassle-free reverse pickup</p>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* ── Right Column: Sticky Summary & Coupons ── */}
                            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">

                                {/* Delivery Pincode Checker */}
                                <div className="bg-white border border-[#ede8e0] p-5 rounded shadow-xs">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#7A6E63] flex items-center gap-1.5">
                                            <span>📍</span> Delivery Check
                                        </span>
                                    </div>
                                    <form onSubmit={handleCheckPincode} className="flex gap-2">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={pincodeInput}
                                            onChange={e => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Enter 6-digit pincode"
                                            className="flex-1 px-3 py-2 text-xs uppercase bg-[#faf8f5] border border-[#ede8e0] rounded focus:outline-none focus:border-[#C9A96E] transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            disabled={pincodeChecking}
                                            className="px-4 py-2 bg-[#141413] text-[#faf8f5] text-[10px] uppercase tracking-[0.18em] hover:bg-[#C9A96E] hover:text-[#141413] transition-colors cursor-pointer rounded disabled:opacity-50 font-medium"
                                        >
                                            {pincodeChecking ? '...' : 'Check'}
                                        </button>
                                    </form>

                                    {pincodeStatus.checked && pincodeStatus.valid ? (
                                        <div className="mt-3 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 p-2.5 rounded flex items-center justify-between">
                                            <span>Delivery to <strong>{pincodeStatus.city} ({pincode})</strong></span>
                                            <span className="font-semibold">{getDeliveryDateRange(2, 4)}</span>
                                        </div>
                                    ) : pincodeStatus.checked && !pincodeStatus.valid ? (
                                        <p className="mt-2 text-[11px] text-rose-600">Please enter a valid 6-digit postal code.</p>
                                    ) : null}
                                </div>

                                {/* Order Summary Card */}
                                <div className="bg-white border border-[#ede8e0] p-6 rounded shadow-xs">
                                    <h2 className="editorial-font text-2xl font-light text-[#1b1c1a] pb-4 border-b border-[#ede8e0]">
                                        Order Summary
                                    </h2>

                                    {/* Coupon Section */}
                                    <div className="py-4 border-b border-[#ede8e0] space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#7A6E63] flex items-center gap-1.5">
                                                <span>🏷️</span> Apply Promo Code
                                            </span>
                                        </div>

                                        {appliedCoupon ? (
                                            <div className="bg-[#faf8f5] border border-[#C9A96E] p-3 rounded flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold tracking-wider text-[#141413] bg-[#C9A96E]/20 px-2 py-0.5 rounded">
                                                            {appliedCoupon.code}
                                                        </span>
                                                        <span className="text-xs text-emerald-700 font-semibold">Applied</span>
                                                    </div>
                                                    <p className="text-[10px] text-[#7A6E63] mt-1">{appliedCoupon.desc}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveCoupon}
                                                    className="text-[10px] uppercase tracking-wider text-rose-600 hover:underline font-bold cursor-pointer"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2.5">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter code (e.g. SNITCH10)"
                                                        value={couponInput}
                                                        onChange={e => {
                                                            setCouponInput(e.target.value)
                                                            setCouponError('')
                                                        }}
                                                        className="flex-1 px-3 py-2 text-xs uppercase bg-[#faf8f5] border border-[#ede8e0] rounded focus:outline-none focus:border-[#C9A96E] transition-colors"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApplyCoupon()}
                                                        className="px-4 py-2 bg-[#141413] text-[#faf8f5] text-[10px] uppercase tracking-[0.18em] hover:bg-[#C9A96E] hover:text-[#141413] transition-colors cursor-pointer rounded font-medium"
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

                                                {/* Preset Coupon Quick Pills */}
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {AVAILABLE_COUPONS.slice(0, 3).map(cp => (
                                                        <button
                                                            key={cp.code}
                                                            type="button"
                                                            onClick={() => handleApplyCoupon(cp.code)}
                                                            className="text-[10px] px-2.5 py-1 bg-[#faf8f5] border border-dashed border-[#C9A96E] text-[#141413] rounded hover:bg-[#f2ece1] transition-colors cursor-pointer font-medium"
                                                        >
                                                            <strong>{cp.code}</strong> ({cp.title})
                                                        </button>
                                                    ))}
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
                                                    <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded">
                                                        FREE
                                                    </span>
                                                ) : (
                                                    <span className="font-medium text-[#1b1c1a]">{fmt(shippingFee)}</span>
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-[#7A6E63] text-[11px]">
                                            <span>GST & Duty Levies</span>
                                            <span className="italic">Included in MRP</span>
                                        </div>
                                    </div>

                                    {/* Total Payable */}
                                    <div className="py-4 flex items-baseline justify-between">
                                        <div>
                                            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#141413] block">
                                                Total Payable
                                            </span>
                                            <span className="text-[10px] text-[#7A6E63]">
                                                Inclusive of all taxes
                                            </span>
                                        </div>
                                        <span className="editorial-font text-3xl sm:text-4xl font-medium text-[#1b1c1a]">
                                            {fmt(grandTotal)}
                                        </span>
                                    </div>

                                    {/* Savings Banner */}
                                    {totalOrderSavings > 0 && (
                                        <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200/80 rounded text-center text-xs text-emerald-800 font-medium">
                                            🎉 You are saving <strong className="font-bold">{fmt(totalOrderSavings)}</strong> on this order!
                                        </div>
                                    )}

                                    {/* Checkout CTA */}
                                    <button
                                        type="button"
                                        onClick={handleOpenCheckout}
                                        disabled={isBagEmpty}
                                        className="w-full py-4 bg-[#141413] text-[#faf8f5] text-[11px] tracking-[0.28em] uppercase font-medium hover:bg-[#C9A96E] hover:text-[#141413] transition-all duration-300 rounded shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                                    >
                                        <span>Proceed to Checkout</span>
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                        </svg>
                                    </button>

                                    {/* Security Pillars */}
                                    <div className="mt-5 pt-4 border-t border-[#ede8e0] text-center space-y-2">
                                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#7A6E63] uppercase tracking-wider font-semibold">
                                            <span>🔒</span> 256-Bit SSL Encrypted Checkout
                                        </div>
                                        <p className="text-[9px] text-[#7A6E63] tracking-wide uppercase">
                                            UPI · Cards · NetBanking · Cash On Delivery
                                        </p>
                                    </div>
                                </div>

                                {/* Support Card */}
                                <div className="p-4 bg-white border border-[#ede8e0] rounded text-center">
                                    <p className="text-xs font-semibold text-[#1b1c1a] mb-0.5">Need styling or order guidance?</p>
                                    <p className="text-[11px] text-[#7A6E63] mb-2">Our concierge team is available 24/7</p>
                                    <span className="text-xs text-[#C9A96E] font-semibold tracking-wide hover:underline cursor-pointer">
                                        concierge@snitch.co.in
                                    </span>
                                </div>

                            </div>

                        </div>
                    )}

                </main>

                {/* ── Mobile Floating Sticky Checkout Bar ── */}
                {!isBagEmpty && (
                    <div className="lg:hidden sticky bottom-0 left-0 right-0 z-40 bg-[rgba(255,255,255,0.95)] backdrop-blur-md border-t border-[#ede8e0] p-4 shadow-2xl flex items-center justify-between gap-4">
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-[#7A6E63] block">
                                Total ({totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'})
                            </span>
                            <span className="editorial-font text-2xl font-bold text-[#1b1c1a]">
                                {fmt(grandTotal)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleOpenCheckout}
                            className="px-6 py-3.5 bg-[#141413] text-[#faf8f5] text-[10px] tracking-[0.24em] uppercase font-medium hover:bg-[#C9A96E] hover:text-[#141413] transition-colors rounded shadow-md cursor-pointer"
                        >
                            Checkout →
                        </button>
                    </div>
                )}

                {/* ── Checkout Modal Drawer ── */}
                {checkoutModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="bg-[#faf8f5] border border-[#ede8e0] rounded-md max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setCheckoutModalOpen(false)}
                                className="absolute top-5 right-5 text-stone-400 hover:text-black text-xl cursor-pointer"
                            >
                                ✕
                            </button>

                            {checkoutStep === 'address' && (
                                <div>
                                    <div className="mb-6">
                                        <p className="text-[10px] tracking-[0.24em] uppercase text-[#C9A96E] font-bold">Step 1 of 2</p>
                                        <h3 className="editorial-font text-3xl font-light text-[#1b1c1a]">Shipping Address</h3>
                                    </div>

                                    <div className="space-y-3.5 text-xs">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-wider text-[#7A6E63] mb-1 font-semibold">Full Name</label>
                                            <input
                                                type="text"
                                                value={deliveryAddress.name}
                                                onChange={e => setDeliveryAddress({ ...deliveryAddress, name: e.target.value })}
                                                className="w-full px-3 py-2.5 bg-white border border-[#ede8e0] rounded focus:outline-none focus:border-[#C9A96E]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] uppercase tracking-wider text-[#7A6E63] mb-1 font-semibold">Mobile Number</label>
                                            <input
                                                type="text"
                                                value={deliveryAddress.phone}
                                                onChange={e => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                                                className="w-full px-3 py-2.5 bg-white border border-[#ede8e0] rounded focus:outline-none focus:border-[#C9A96E]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] uppercase tracking-wider text-[#7A6E63] mb-1 font-semibold">Street / Apartment Address</label>
                                            <input
                                                type="text"
                                                value={deliveryAddress.street}
                                                onChange={e => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                                                className="w-full px-3 py-2.5 bg-white border border-[#ede8e0] rounded focus:outline-none focus:border-[#C9A96E]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-wider text-[#7A6E63] mb-1 font-semibold">City</label>
                                                <input
                                                    type="text"
                                                    value={deliveryAddress.city}
                                                    onChange={e => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                                                    className="w-full px-3 py-2.5 bg-white border border-[#ede8e0] rounded focus:outline-none focus:border-[#C9A96E]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-wider text-[#7A6E63] mb-1 font-semibold">Postal Code</label>
                                                <input
                                                    type="text"
                                                    value={deliveryAddress.pincode}
                                                    onChange={e => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                                                    className="w-full px-3 py-2.5 bg-white border border-[#ede8e0] rounded focus:outline-none focus:border-[#C9A96E]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setCheckoutStep('payment')}
                                            className="w-full py-3.5 bg-[#141413] text-[#faf8f5] text-[11px] tracking-[0.24em] uppercase font-medium hover:bg-[#C9A96E] hover:text-[#141413] transition-colors rounded cursor-pointer"
                                        >
                                            Continue to Payment ({fmt(grandTotal)})
                                        </button>
                                    </div>
                                </div>
                            )}

                            {checkoutStep === 'payment' && (
                                <div>
                                    <div className="mb-6">
                                        <p className="text-[10px] tracking-[0.24em] uppercase text-[#C9A96E] font-bold">Step 2 of 2</p>
                                        <h3 className="editorial-font text-3xl font-light text-[#1b1c1a]">Payment Method</h3>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        {[
                                            { id: 'upi', title: 'UPI Instant (GPay / PhonePe / Paytm)', icon: '⚡' },
                                            { id: 'card', title: 'Credit / Debit Card (Visa, Mastercard, RuPay)', icon: '💳' },
                                            { id: 'cod', title: 'Cash on Delivery (Doorstep Verification)', icon: '💵' }
                                        ].map(method => (
                                            <div
                                                key={method.id}
                                                onClick={() => setSelectedPaymentMethod(method.id)}
                                                className={`p-3.5 border rounded cursor-pointer transition-all flex items-center justify-between ${
                                                    selectedPaymentMethod === method.id
                                                        ? 'bg-white border-[#C9A96E] shadow-xs'
                                                        : 'bg-white/50 border-[#ede8e0] hover:border-[#C9A96E]/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{method.icon}</span>
                                                    <span className="text-xs font-medium text-[#1b1c1a]">{method.title}</span>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                    selectedPaymentMethod === method.id ? 'border-[#C9A96E] bg-[#C9A96E]' : 'border-stone-300'
                                                }`}>
                                                    {selectedPaymentMethod === method.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-3 bg-white border border-[#ede8e0] rounded text-xs space-y-1.5 mb-6">
                                        <div className="flex justify-between text-[#7A6E63]">
                                            <span>Delivery To:</span>
                                            <span className="font-semibold text-[#1b1c1a]">{deliveryAddress.name}, {deliveryAddress.pincode}</span>
                                        </div>
                                        <div className="flex justify-between text-[#7A6E63]">
                                            <span>Total Amount:</span>
                                            <span className="font-bold text-[#1b1c1a]">{fmt(grandTotal)}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setCheckoutStep('address')}
                                            className="px-4 py-3.5 border border-[#ede8e0] text-[10px] tracking-wider uppercase text-[#7A6E63] hover:bg-white rounded cursor-pointer"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleConfirmOrder}
                                            disabled={checkoutProcessing}
                                            className="flex-1 py-3.5 bg-[#141413] text-[#faf8f5] text-[11px] tracking-[0.24em] uppercase font-medium hover:bg-[#C9A96E] hover:text-[#141413] transition-colors rounded cursor-pointer disabled:opacity-50"
                                        >
                                            {checkoutProcessing ? 'Placing Order...' : `Pay & Place Order (${fmt(grandTotal)})`}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {checkoutStep === 'success' && (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl text-emerald-700">
                                        ✓
                                    </div>
                                    <h3 className="editorial-font text-3xl font-light text-[#1b1c1a] mb-2">
                                        Order Placed Successfully!
                                    </h3>
                                    <p className="text-xs text-[#7A6E63] max-w-sm mx-auto mb-6 leading-relaxed">
                                        Thank you for choosing Snitch. A confirmation SMS and email have been sent to your registered contacts.
                                    </p>
                                    <div className="p-4 bg-white border border-[#ede8e0] rounded text-left text-xs space-y-2 mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-[#7A6E63]">Order Reference:</span>
                                            <span className="font-mono font-semibold">#SNITCH-{Math.floor(100000 + Math.random() * 900000)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#7A6E63]">Estimated Delivery:</span>
                                            <span className="font-semibold text-emerald-800">{getDeliveryDateRange(2, 4)}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCheckoutModalOpen(false)
                                            navigate('/')
                                        }}
                                        className="w-full py-3.5 bg-[#141413] text-[#faf8f5] text-[11px] tracking-[0.24em] uppercase font-medium hover:bg-[#C9A96E] hover:text-[#141413] transition-colors rounded cursor-pointer"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Footer ── */}
                <footer className="bg-[#141413] text-[#faf8f5] py-8 px-6 lg:px-12 border-t border-[#ede8e0]/10 mt-16">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A6E63]">
                        <div className="flex items-center gap-3">
                            <span className="editorial-font text-base tracking-[0.3em] uppercase text-[#C9A96E]">Snitch.</span>
                            <span>© {new Date().getFullYear()} Snitch. All rights reserved.</span>
                        </div>
                        <div className="flex gap-6 text-[10px] tracking-wider uppercase">
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