import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import { useAuth } from '../../auth/hook/useAuth'
import { useCart } from '../../cart/hook/useCart'

const Nav = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { handleLogout } = useAuth()
    const { handleGetCart } = useCart()

    const user = useSelector(state => state.auth.user)
    const cartItems = useSelector(state => state.cart.items || [])

    const [userDropdownOpen, setUserDropdownOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const dropdownRef = useRef(null)

    // Calculate total quantity of items in cart
    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)

    useEffect(() => {
        // Fetch cart when logged in buyer
        if (user && user.role !== 'seller') {
            handleGetCart()
        }
    }, [user])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false)
        setUserDropdownOpen(false)
    }, [location.pathname])

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    }

    const onLogout = async () => {
        await handleLogout()
        setUserDropdownOpen(false)
        navigate('/login')
    }

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <header className="sticky top-0 left-0 right-0 z-50 bg-[rgba(251,249,246,0.94)] backdrop-blur-md border-b border-[#ede8e0] transition-all duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <div className="flex items-center justify-between h-18 gap-4">

                        {/* ── Brand Logo & Primary Nav ── */}
                        <div className="flex items-center gap-8">
                            <Link
                                to="/"
                                className="flex items-center group cursor-pointer select-none"
                            >
                                <span
                                    className="text-xl sm:text-2xl text-[#1b1c1a] tracking-[0.34em] uppercase font-light transition-colors group-hover:text-[#C9A96E]"
                                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                >
                                    Snitch<span className="text-[#C9A96E]">.</span>
                                </span>
                            </Link>

                            {/* Desktop Links */}
                            <nav className="hidden md:flex items-center gap-7">
                                <Link
                                    to="/"
                                    className={`text-[11px] uppercase tracking-[0.2em] font-medium transition-colors duration-200 py-1 ${
                                        location.pathname === '/'
                                            ? 'text-[#1b1c1a] border-b-2 border-[#C9A96E]'
                                            : 'text-[#7A6E63] hover:text-[#C9A96E]'
                                    }`}
                                >
                                    Collection
                                </Link>

                                {user?.role === 'seller' ? (
                                    <>
                                        <Link
                                            to="/seller/dashboard"
                                            className={`text-[11px] uppercase tracking-[0.2em] font-medium transition-colors duration-200 py-1 ${
                                                location.pathname.startsWith('/seller/dashboard')
                                                    ? 'text-[#1b1c1a] border-b-2 border-[#C9A96E]'
                                                    : 'text-[#7A6E63] hover:text-[#C9A96E]'
                                            }`}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/seller/create-product"
                                            className={`text-[11px] uppercase tracking-[0.2em] font-medium transition-colors duration-200 py-1 ${
                                                location.pathname === '/seller/create-product'
                                                    ? 'text-[#1b1c1a] border-b-2 border-[#C9A96E]'
                                                    : 'text-[#7A6E63] hover:text-[#C9A96E]'
                                            }`}
                                        >
                                            + New Product
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        to="/cart"
                                        className={`text-[11px] uppercase tracking-[0.2em] font-medium transition-colors duration-200 py-1 ${
                                            location.pathname === '/cart'
                                                ? 'text-[#1b1c1a] border-b-2 border-[#C9A96E]'
                                                : 'text-[#7A6E63] hover:text-[#C9A96E]'
                                        }`}
                                    >
                                        Bag {cartCount > 0 && `(${cartCount})`}
                                    </Link>
                                )}
                            </nav>
                        </div>

                        {/* ── Search Bar (Desktop) ── */}
                        <div className="hidden lg:flex flex-1 max-w-xs mx-6">
                            <form onSubmit={handleSearchSubmit} className="relative w-full">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#B5ADA3] pointer-events-none">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search luxury styles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 bg-[#fbf9f6] border border-[#ede8e0] rounded-sm text-xs text-[#1b1c1a] placeholder-[#B5ADA3] focus:outline-none focus:border-[#C9A96E] transition-colors"
                                />
                            </form>
                        </div>

                        {/* ── Right Action Controls ── */}
                        <div className="flex items-center gap-4 sm:gap-6">

                            {/* Cart Bag Icon (For Buyers / Guests) */}
                            {(!user || user.role !== 'seller') && (
                                <Link
                                    to="/cart"
                                    className="relative p-2 text-[#1b1c1a] hover:text-[#C9A96E] transition-colors duration-200 flex items-center justify-center group"
                                    aria-label="Shopping Bag"
                                >
                                    <svg
                                        className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.6}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
                                        />
                                    </svg>

                                    {/* Cart Count Badge */}
                                    {cartCount > 0 && (
                                        <span className="absolute top-1 right-0.5 min-w-[17px] h-[17px] px-1 bg-[#1b1c1a] text-[#C9A96E] text-[10px] font-semibold flex items-center justify-center rounded-full border border-[#C9A96E] shadow-sm transform transition-transform group-hover:scale-110">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* User Account / Auth Dropdown */}
                            {user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                        className="flex items-center gap-2 p-1 rounded-sm hover:bg-[#f5f3f0] transition-colors cursor-pointer group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#1b1c1a] text-[#C9A96E] border border-[#C9A96E]/40 flex items-center justify-center text-xs font-serif font-semibold shadow-xs">
                                            {user.fullname?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="hidden sm:flex flex-col text-left">
                                            <span className="text-xs font-medium text-[#1b1c1a] leading-tight group-hover:text-[#C9A96E] transition-colors">
                                                {user.fullname?.split(' ')[0]}
                                            </span>
                                            <span className="text-[9px] uppercase tracking-wider text-[#B5ADA3]">
                                                {user.role || 'Member'}
                                            </span>
                                        </div>
                                        <svg
                                            className={`w-3.5 h-3.5 text-[#7A6E63] transition-transform duration-200 ${
                                                userDropdownOpen ? 'rotate-180 text-[#C9A96E]' : ''
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {userDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-[#ede8e0] rounded-sm shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                            <div className="px-4 py-2.5 border-b border-[#ede8e0] bg-[#fbf9f6]">
                                                <p className="text-xs font-semibold text-[#1b1c1a] truncate">
                                                    {user.fullname}
                                                </p>
                                                <p className="text-[10px] text-[#7A6E63] truncate">
                                                    {user.email}
                                                </p>
                                                <span className="inline-block mt-1 text-[9px] uppercase tracking-widest px-1.5 py-0.5 bg-[#1b1c1a] text-[#C9A96E] rounded-xs font-semibold">
                                                    {user.role === 'seller' ? 'Seller Account' : 'Verified Buyer'}
                                                </span>
                                            </div>

                                            {user.role === 'seller' ? (
                                                <>
                                                    <Link
                                                        to="/seller/dashboard"
                                                        onClick={() => setUserDropdownOpen(false)}
                                                        className="block px-4 py-2 text-xs text-[#4a4844] hover:bg-[#fbf9f6] hover:text-[#1b1c1a] transition-colors"
                                                    >
                                                        📊 Seller Dashboard
                                                    </Link>
                                                    <Link
                                                        to="/seller/create-product"
                                                        onClick={() => setUserDropdownOpen(false)}
                                                        className="block px-4 py-2 text-xs text-[#4a4844] hover:bg-[#fbf9f6] hover:text-[#1b1c1a] transition-colors"
                                                    >
                                                        ➕ Add New Product
                                                    </Link>
                                                </>
                                            ) : (
                                                <Link
                                                    to="/cart"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="block px-4 py-2 text-xs text-[#4a4844] hover:bg-[#fbf9f6] hover:text-[#1b1c1a] transition-colors"
                                                >
                                                    🛍 Shopping Bag {cartCount > 0 && `(${cartCount})`}
                                                </Link>
                                            )}

                                            <div className="border-t border-[#ede8e0] mt-1 pt-1">
                                                <button
                                                    onClick={onLogout}
                                                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium text-[#1b1c1a] hover:text-[#C9A96E] transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 bg-[#1b1c1a] text-[#fbf9f6] text-[10px] uppercase tracking-[0.22em] font-medium hover:bg-[#C9A96E] hover:text-[#1b1c1a] transition-all duration-200 rounded-sm shadow-xs"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Hamburger Toggle */}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-[#1b1c1a] hover:text-[#C9A96E] transition-colors"
                                aria-label="Toggle Navigation"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>

                        </div>

                    </div>
                </div>

                {/* ── Mobile Navigation Menu Drawer ── */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-[#ede8e0] px-6 py-5 space-y-4 animate-in fade-in duration-200">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#B5ADA3]">
                                🔍
                            </span>
                            <input
                                type="text"
                                placeholder="Search styles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 bg-[#fbf9f6] border border-[#ede8e0] rounded-sm text-xs text-[#1b1c1a] focus:outline-none focus:border-[#C9A96E]"
                            />
                        </form>

                        <nav className="flex flex-col space-y-3 pt-2">
                            <Link
                                to="/"
                                className="text-xs uppercase tracking-[0.18em] font-medium text-[#1b1c1a] hover:text-[#C9A96E] transition-colors py-1"
                            >
                                Collection
                            </Link>

                            {user?.role === 'seller' ? (
                                <>
                                    <Link
                                        to="/seller/dashboard"
                                        className="text-xs uppercase tracking-[0.18em] font-medium text-[#1b1c1a] hover:text-[#C9A96E] transition-colors py-1"
                                    >
                                        Seller Dashboard
                                    </Link>
                                    <Link
                                        to="/seller/create-product"
                                        className="text-xs uppercase tracking-[0.18em] font-medium text-[#1b1c1a] hover:text-[#C9A96E] transition-colors py-1"
                                    >
                                        + Add New Product
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to="/cart"
                                    className="text-xs uppercase tracking-[0.18em] font-medium text-[#1b1c1a] hover:text-[#C9A96E] transition-colors py-1 flex items-center justify-between"
                                >
                                    <span>Shopping Bag</span>
                                    {cartCount > 0 && (
                                        <span className="px-2 py-0.5 bg-[#1b1c1a] text-[#C9A96E] text-[10px] rounded-full">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </nav>
                    </div>
                )}
            </header>
        </>
    )
}

export default Nav