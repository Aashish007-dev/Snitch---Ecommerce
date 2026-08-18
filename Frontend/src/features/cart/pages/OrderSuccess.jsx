import React, { useState, useMemo } from 'react'
import { useLocation, useNavigate, Link } from 'react-router'
import { useSelector } from 'react-redux'

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

/* ── Fallback Curated Recommendations ──────────────────────────── */
const CURATED_RECOMMENDATIONS = [
    {
        id: 'rec-1',
        title: 'Structured Noir Blazer',
        subtitle: 'Obsidian Black | Tailored Fit',
        price: 3999,
        originalPrice: 5499,
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
        tag: 'BESTSELLER'
    },
    {
        id: 'rec-2',
        title: 'Aurelia Minimal Chain',
        subtitle: '18K Gold Finish | Waterproof',
        price: 1499,
        originalPrice: 2299,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
        tag: 'EXCLUSIVE'
    },
    {
        id: 'rec-3',
        title: 'Tailored Wide-Leg Trousers',
        subtitle: 'Matte Charcoal | Relaxed Fit',
        price: 2499,
        originalPrice: 3499,
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
        tag: 'NEW DROP'
    },
    {
        id: 'rec-4',
        title: 'Chronos Obsidian Timepiece',
        subtitle: 'Matte Black & Gold Accent',
        price: 4999,
        originalPrice: 7999,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        tag: 'VIP ONLY'
    }
]

const OrderSuccess = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const user = useSelector(state => state.auth?.user)

    const queryParams = new URLSearchParams(location.search)
    const orderIdParam = queryParams.get("order_id") || "order_" + Math.random().toString(36).substring(2, 10).toUpperCase()

    // State passed from Cart page checkout
    const orderState = location.state || {}

    const orderId = orderState.orderId || orderIdParam
    const paymentId = orderState.paymentId || 'pay_' + Math.random().toString(36).substring(2, 12)
    const orderItems = orderState.items && orderState.items.length > 0 ? orderState.items : null
    const subtotal = orderState.subtotal ?? 3499
    const discountAmount = orderState.discountAmount ?? 0
    const shippingFee = orderState.shippingFee ?? 0
    const grandTotal = orderState.grandTotal ?? (subtotal - discountAmount + shippingFee)
    const appliedCoupon = orderState.appliedCoupon || null
    const deliveryCity = orderState.deliveryCity || 'Bengaluru'
    const pincode = orderState.pincode || '560001'

    const recipientName = orderState.user?.fullname || user?.fullname || 'Snitch Patron'
    const recipientEmail = orderState.user?.email || user?.email || 'customer@snitch.co.in'
    const recipientContact = orderState.user?.contact || user?.contact || '+91 98765 43210'

    const estimatedDelivery = useMemo(() => getDeliveryDateRange(3, 5), [])
    const orderDate = useMemo(() => new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }), [])

    const [copied, setCopied] = useState(false)
    const [downloadingInvoice, setDownloadingInvoice] = useState(false)
    const [invoiceDownloaded, setInvoiceDownloaded] = useState(false)

    const handleCopyOrderId = () => {
        navigator.clipboard?.writeText(orderId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
    }

    const handleDownloadInvoice = () => {
        setDownloadingInvoice(true)
        setTimeout(() => {
            setDownloadingInvoice(false)
            setInvoiceDownloaded(true)
            window.print()
            setTimeout(() => setInvoiceDownloaded(false), 3000)
        }, 800)
    }

    return (
        <div className="min-h-screen bg-[#0e0e0e] text-[#e5e2e1] font-sans antialiased selection:bg-[#ffd700] selection:text-[#121212] pt-24 pb-20 relative overflow-hidden">
            {/* Background Ambient Radial Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[550px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ffd700]/10 via-[#ffd700]/[0.02] to-transparent pointer-events-none blur-3xl -z-10" />
            <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#ffd700]/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-2/3 right-0 w-96 h-96 bg-[#ffd700]/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── Breadcrumb Navigation ─────────────────────────── */}
                <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#999077] mb-8">
                    <Link to="/" className="hover:text-[#ffd700] transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/cart" className="hover:text-[#ffd700] transition-colors">Cart</Link>
                    <span>/</span>
                    <span className="text-[#ffd700] font-semibold">Order Confirmation</span>
                </nav>

                {/* ── Hero Confirmation Section ──────────────────────── */}
                <section className="text-center py-6 sm:py-10 flex flex-col items-center relative">
                    {/* Glowing Checkmark Badge */}
                    <div className="relative mb-6 group">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#1c1b1b] border border-[#ffd700]/40 flex items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.2)] transition-transform duration-500 group-hover:scale-105">
                            {/* Inner ambient pulse */}
                            <div className="absolute inset-0 rounded-full bg-[#ffd700]/10 animate-ping opacity-30" />
                            
                            {/* Checkmark SVG Icon */}
                            <svg className="w-12 h-12 text-[#ffd700] drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        {/* Gold sparkle dots */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ffd700] rounded-full shadow-[0_0_8px_#ffd700] animate-pulse" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#ffe16d] rounded-full shadow-[0_0_6px_#ffe16d] animate-pulse delay-300" />
                    </div>

                    {/* Headline */}
                    <span className="text-xs uppercase font-bold tracking-[0.3em] text-[#ffd700] mb-2 px-3 py-1 rounded-full bg-[#ffd700]/10 border border-[#ffd700]/20">
                        Payment Successful
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white mt-1 mb-3">
                        Order Confirmed
                    </h1>
                    <p className="text-sm sm:text-base text-[#b7b5b4] max-w-lg mx-auto font-light leading-relaxed">
                        Thank you for choosing <span className="text-white font-medium">Snitch</span>. Your luxury pieces are being reserved and prepped for express delivery.
                    </p>

                    {/* Order ID Pill with Copy */}
                    <div className="mt-6 inline-flex items-center gap-3 bg-[#1a1919] border border-[#353534] hover:border-[#ffd700]/60 rounded-full px-5 py-2.5 transition-all duration-200 shadow-lg group">
                        <span className="text-xs uppercase tracking-widest text-[#999077]">Order Reference:</span>
                        <code className="text-sm font-mono font-bold text-[#ffd700] tracking-wide">{orderId}</code>
                        <button
                            onClick={handleCopyOrderId}
                            title="Copy Order ID"
                            className="p-1 rounded hover:bg-[#2a2a2a] text-[#c8c6c5] hover:text-[#ffd700] transition-colors relative"
                            aria-label="Copy Order ID"
                        >
                            {copied ? (
                                <svg className="w-4 h-4 text-[#ffd700]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {copied && (
                        <span className="text-[11px] text-[#ffd700] mt-2 font-medium tracking-wide transition-opacity duration-200">
                            ✓ Order ID copied to clipboard
                        </span>
                    )}
                </section>

                {/* ── Tracking Timeline / Progress Stepper ─────────── */}
                <section className="my-8 bg-[#141414]/90 backdrop-blur-xl border border-[#27272a] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                    {/* Top Accent Gold Bar */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-80" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#27272a]">
                        <div>
                            <span className="text-xs uppercase tracking-widest text-[#999077] font-semibold">Delivery Estimate</span>
                            <p className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#ffd700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {estimatedDelivery}
                            </p>
                        </div>
                        <div className="sm:text-right">
                            <span className="text-xs uppercase tracking-widest text-[#999077] font-semibold">Shipping Speed</span>
                            <p className="text-sm font-medium text-[#ffd700] flex items-center sm:justify-end gap-1 mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-ping" />
                                Priority Express Air (Complimentary)
                            </p>
                        </div>
                    </div>

                    {/* Timeline Steps */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-8 relative">
                        {/* Background connecting bar */}
                        <div className="absolute top-4 left-6 right-6 h-[2px] bg-[#2a2a2a] -z-0" />
                        <div className="absolute top-4 left-6 w-1/4 h-[2px] bg-[#ffd700] -z-0 shadow-[0_0_8px_#ffd700]" />

                        {/* Step 1: Confirmed */}
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ffd700] text-[#121212] flex items-center justify-center font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(255,215,0,0.5)] ring-4 ring-[#141414]">
                                ✓
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-white mt-3 uppercase tracking-wider">Confirmed</span>
                            <span className="text-[10px] sm:text-xs text-[#ffd700] mt-0.5 font-medium">{orderDate.split(',')[0]}</span>
                        </div>

                        {/* Step 2: Processing */}
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#242424] border-2 border-[#ffd700]/70 text-[#ffd700] flex items-center justify-center font-bold text-xs sm:text-sm shadow-md ring-4 ring-[#141414] animate-pulse">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-white mt-3 uppercase tracking-wider">Processing</span>
                            <span className="text-[10px] sm:text-xs text-[#999077] mt-0.5">Quality check</span>
                        </div>

                        {/* Step 3: Shipped */}
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1c1b1b] border border-[#353534] text-[#6b6968] flex items-center justify-center font-bold text-xs sm:text-sm ring-4 ring-[#141414]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-[#6b6968] mt-3 uppercase tracking-wider">Shipped</span>
                            <span className="text-[10px] sm:text-xs text-[#52525b] mt-0.5">In transit</span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1c1b1b] border border-[#353534] text-[#6b6968] flex items-center justify-center font-bold text-xs sm:text-sm ring-4 ring-[#141414]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-[#6b6968] mt-3 uppercase tracking-wider">Delivered</span>
                            <span className="text-[10px] sm:text-xs text-[#52525b] mt-0.5">To doorstep</span>
                        </div>
                    </div>
                </section>

                {/* ── Main Details Grid (Items & Summary) ───────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-8">

                    {/* Order Items List (2 Cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#141414]/90 backdrop-blur-xl border border-[#27272a] rounded-2xl p-6 sm:p-8 shadow-xl">
                            <div className="flex items-center justify-between pb-4 border-b border-[#27272a] mb-6">
                                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                    <span>Purchased Items</span>
                                    <span className="text-xs bg-[#ffd700]/10 text-[#ffd700] px-2.5 py-0.5 rounded-full border border-[#ffd700]/20 font-semibold">
                                        {orderItems ? orderItems.length : '1'} {orderItems?.length === 1 ? 'Item' : 'Items'}
                                    </span>
                                </h2>
                                <span className="text-xs text-[#999077] tracking-wider uppercase font-medium">Standard Pack</span>
                            </div>

                            {/* Item Cards */}
                            <div className="divide-y divide-[#27272a]">
                                {orderItems ? (
                                    orderItems.map((item, idx) => {
                                        const title = item.title || item.product?.title || 'Snitch Designer Apparel'
                                        const image = item.image || item.product?.images?.[0]?.url || item.product?.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80'
                                        const qty = item.quantity || 1
                                        const unitPrice = item.unitPrice || item.price?.amount || 1999
                                        const size = item.attributes?.size || item.size || 'M'
                                        const color = item.attributes?.color || item.color || 'Standard'

                                        return (
                                            <div key={item.id || idx} className="py-5 first:pt-0 last:pb-0 flex gap-4 sm:gap-6 items-center group">
                                                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-[#1c1b1b] border border-[#27272a] group-hover:border-[#ffd700]/50 transition-colors shrink-0">
                                                    <img
                                                        src={image}
                                                        alt={title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80'
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div>
                                                            <h3 className="text-sm sm:text-base font-semibold text-white uppercase tracking-wide truncate group-hover:text-[#ffd700] transition-colors">
                                                                {title}
                                                            </h3>
                                                            <div className="flex flex-wrap gap-2 text-xs text-[#999077] mt-1">
                                                                <span className="bg-[#1f1f1f] px-2 py-0.5 rounded border border-[#2e2e30]">Size: {size}</span>
                                                                <span className="bg-[#1f1f1f] px-2 py-0.5 rounded border border-[#2e2e30]">Color: {color}</span>
                                                                <span className="bg-[#1f1f1f] px-2 py-0.5 rounded border border-[#2e2e30]">Qty: {qty}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <span className="text-sm sm:text-base font-bold text-[#ffd700]">
                                                                {fmt(unitPrice * qty)}
                                                            </span>
                                                            {qty > 1 && (
                                                                <p className="text-[11px] text-[#6b6968]">{fmt(unitPrice)} each</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    /* Fallback Item Display when loaded with query param */
                                    <div className="py-5 flex gap-4 sm:gap-6 items-center group">
                                        <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-[#1c1b1b] border border-[#27272a] group-hover:border-[#ffd700]/50 transition-colors shrink-0">
                                            <img
                                                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80"
                                                alt="Snitch Luxury Apparel"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <h3 className="text-sm sm:text-base font-semibold text-white uppercase tracking-wide truncate group-hover:text-[#ffd700] transition-colors">
                                                        Snitch Signature Ensemble
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 text-xs text-[#999077] mt-1">
                                                        <span className="bg-[#1f1f1f] px-2 py-0.5 rounded border border-[#2e2e30]">Size: L</span>
                                                        <span className="bg-[#1f1f1f] px-2 py-0.5 rounded border border-[#2e2e30]">Color: Obsidian Black</span>
                                                        <span className="bg-[#1f1f1f] px-2 py-0.5 rounded border border-[#2e2e30]">Qty: 1</span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-sm sm:text-base font-bold text-[#ffd700]">
                                                        {fmt(subtotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Shipping & Payment Cards in 2 Columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Shipping Card */}
                            <div className="bg-[#141414]/90 backdrop-blur-xl border border-[#27272a] rounded-2xl p-6 shadow-xl relative group hover:border-[#ffd700]/40 transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#ffd700]/10 border border-[#ffd700]/20 flex items-center justify-center text-[#ffd700]">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xs uppercase tracking-widest font-bold text-white">Shipping Address</h3>
                                </div>
                                <div className="text-xs sm:text-sm text-[#b7b5b4] space-y-1">
                                    <p className="font-semibold text-white">{recipientName}</p>
                                    <p>Flat 402, Aureate Luxury Heights</p>
                                    <p>{deliveryCity}, Karnataka - {pincode}</p>
                                    <p className="text-[#999077] pt-1">Phone: {recipientContact}</p>
                                </div>
                            </div>

                            {/* Payment Card */}
                            <div className="bg-[#141414]/90 backdrop-blur-xl border border-[#27272a] rounded-2xl p-6 shadow-xl relative group hover:border-[#ffd700]/40 transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#ffd700]/10 border border-[#ffd700]/20 flex items-center justify-center text-[#ffd700]">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xs uppercase tracking-widest font-bold text-white">Payment Method</h3>
                                </div>
                                <div className="text-xs sm:text-sm text-[#b7b5b4] space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded bg-[#1f1f1f] text-[10px] font-mono border border-[#353534] text-white">RAZORPAY</span>
                                        <span className="text-xs text-white font-medium">Prepaid Instant</span>
                                    </div>
                                    <p className="text-[11px] text-[#999077] font-mono truncate">Txn ID: {paymentId}</p>
                                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold pt-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>256-Bit SSL Encrypted & Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Financial Summary (1 Col) */}
                    <div className="space-y-6">
                        <div className="bg-[#141414]/90 backdrop-blur-xl border border-[#27272a] rounded-2xl p-6 sm:p-8 shadow-xl sticky top-28">
                            <h2 className="text-lg font-bold uppercase tracking-wider text-white pb-4 border-b border-[#27272a] mb-5">
                                Price Breakdown
                            </h2>

                            <div className="space-y-3.5 text-sm text-[#b7b5b4]">
                                <div className="flex justify-between items-center">
                                    <span>Bag Subtotal</span>
                                    <span className="text-white font-medium">{fmt(subtotal)}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span>Express Shipping</span>
                                    <span className="text-[#ffd700] font-semibold text-xs uppercase tracking-wider bg-[#ffd700]/10 px-2 py-0.5 rounded border border-[#ffd700]/20">
                                        Free
                                    </span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-400">
                                        <span className="flex items-center gap-1">
                                            <span>Coupon Savings</span>
                                            {appliedCoupon && <span className="text-[10px] bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">{appliedCoupon.code}</span>}
                                        </span>
                                        <span className="font-semibold">-{fmt(discountAmount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-[#999077] text-xs">
                                    <span>Estimated GST & Luxury Taxes</span>
                                    <span>Included</span>
                                </div>

                                <div className="border-t border-[#27272a] pt-4 mt-2 flex justify-between items-end">
                                    <div>
                                        <span className="text-xs uppercase tracking-widest text-[#999077] font-semibold block">Total Paid</span>
                                        <span className="text-[11px] text-emerald-400">Includes all taxes</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl sm:text-3xl font-extrabold text-[#ffd700] drop-shadow-[0_0_12px_rgba(255,215,0,0.3)]">
                                            {fmt(grandTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Luxury Action CTAs */}
                            <div className="mt-8 space-y-3">
                                <Link
                                    to="/"
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#ffd700] hover:bg-[#ffe16d] text-[#121212] font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(255,215,0,0.25)] hover:shadow-[0_6px_25px_rgba(255,215,0,0.4)] active:scale-[0.98]"
                                >
                                    <span>Continue Shopping</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>

                                <button
                                    onClick={handleDownloadInvoice}
                                    disabled={downloadingInvoice}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-transparent hover:bg-[#ffd700]/10 border border-[#ffd700]/40 text-[#ffd700] font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-200 active:scale-[0.98]"
                                >
                                    {downloadingInvoice ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-[#ffd700]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Preparing Invoice...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            <span>Download Invoice</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Email notification alert */}
                            <div className="mt-6 p-3.5 rounded-xl bg-[#1a1919] border border-[#27272a] flex items-start gap-2.5">
                                <svg className="w-4 h-4 text-[#ffd700] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <p className="text-[11px] text-[#999077] leading-relaxed">
                                    Invoice & shipment tracking details have been dispatched to <span className="text-white font-medium">{recipientEmail}</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── VIP Concierge Support Banner ───────────────────── */}
                <section className="my-10 bg-gradient-to-r from-[#171717] via-[#1c1a17] to-[#171717] border border-[#ffd700]/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                        <div className="w-12 h-12 rounded-xl bg-[#ffd700]/10 border border-[#ffd700]/30 flex items-center justify-center text-[#ffd700] shrink-0 mx-auto sm:mx-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs uppercase tracking-widest text-[#ffd700] font-bold">24/7 VIP Concierge</span>
                            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">Need size modifications or priority changes?</h3>
                            <p className="text-xs text-[#999077] mt-0.5">Reach your dedicated personal style concierge within 2 hours of booking.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <a
                            href="mailto:support@snitch.co.in"
                            className="px-5 py-2.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-white border border-[#353534] text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                            Email Concierge
                        </a>
                        <a
                            href="https://wa.me/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-lg bg-[#ffd700]/10 hover:bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]/30 text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                            Live WhatsApp
                        </a>
                    </div>
                </section>

                {/* ── Recommendations ("Complete The Look") ─────────── */}
                <section className="my-14 border-t border-[#27272a] pt-12">
                    <div className="text-center mb-8">
                        <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#ffd700]">Curated For You</span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mt-1">Complete The Look</h2>
                        <p className="text-xs sm:text-sm text-[#999077] max-w-md mx-auto mt-1">Handpicked pairings styled to complement your recent purchase.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {CURATED_RECOMMENDATIONS.map((item) => (
                            <Link
                                to="/"
                                key={item.id}
                                className="group bg-[#141414] border border-[#27272a] hover:border-[#ffd700]/60 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 shadow-lg"
                            >
                                <div className="aspect-[3/4] bg-[#1c1b1b] relative overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-[#121212]/80 backdrop-blur-md text-[#ffd700] px-2 py-0.5 rounded border border-[#ffd700]/30">
                                        {item.tag}
                                    </span>
                                </div>
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide truncate group-hover:text-[#ffd700] transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-[11px] text-[#999077] truncate mt-0.5">{item.subtitle}</p>
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-3">
                                        <span className="text-sm font-bold text-[#ffd700]">{fmt(item.price)}</span>
                                        <span className="text-[11px] text-[#6b6968] line-through">{fmt(item.originalPrice)}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    )
}

export default OrderSuccess