import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useProduct } from '../hook/useProduct'

const MAX_IMAGES = 7

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
  </svg>
)

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
)

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }

const EmptySlot = ({ onClick, isPrimary, isDragging, onDragOver, onDragLeave, onDrop }) => (
  <div
    onClick={onClick}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    className={[
      'flex flex-col items-center justify-center border border-dashed rounded cursor-pointer transition-all duration-200 group',
      isPrimary ? 'col-span-2 row-span-2' : '',
      isDragging
        ? 'border-[#ffd700] bg-[#1c1b1b] shadow-[0_0_18px_rgba(255,215,0,0.25)] scale-[0.98]'
        : 'border-[#353534] bg-[#1a1a1a] hover:border-[#ffd700] hover:bg-[#1c1b1b]',
    ].join(' ')}
  >
    <span className={`transition-colors duration-200 mb-2 ${
      isDragging ? 'text-[#ffd700]' : 'text-[#999077] group-hover:text-[#ffd700]'
    }`}>
      {isPrimary ? <CameraIcon /> : <PlusIcon />}
    </span>
    <span className={`text-xs font-medium tracking-wide transition-colors duration-200 ${
      isDragging ? 'text-[#ffd700]' : 'text-[#999077] group-hover:text-[#d0c6ab]'
    }`}>
      {isDragging ? 'Drop to upload' : isPrimary ? 'Primary Image' : 'Add'}
    </span>
  </div>
)

const FilledSlot = ({ preview, onRemove, isPrimary }) => (
  <div className={`relative rounded overflow-hidden group ${isPrimary ? 'col-span-2 row-span-2' : ''}`}>
    <img src={preview} alt="Product" className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
      aria-label="Remove image"
    >
      <XIcon />
    </button>
    {isPrimary && (
      <span className="absolute bottom-2 left-2 text-[10px] font-semibold uppercase tracking-widest text-[#ffd700] bg-black/60 px-2 py-0.5 rounded">
        Primary
      </span>
    )}
  </div>
)

const CreateProduct = () => {
  const navigate = useNavigate()
  const { handleCreateProduct } = useProduct()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'INR',
  })
  const [images, setImages] = useState(Array(MAX_IMAGES).fill(null))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const fileInputRefs = useRef([])

  // Shared helper: attach a File object to a slot
  const acceptFile = (file, index) => {
    if (!file || !file.type.startsWith('image/')) return
    const preview = URL.createObjectURL(file)
    setImages(prev => {
      const updated = [...prev]
      if (updated[index]?.preview) URL.revokeObjectURL(updated[index].preview)
      updated[index] = { file, preview }
      return updated
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSlotClick = (index) => {
    fileInputRefs.current[index]?.click()
  }

  const handleFileChange = (e, index) => {
    acceptFile(e.target.files?.[0], index)
    e.target.value = ''
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDragOverIndex(index)
  }

  const handleDragLeave = (e) => {
    // Only clear if leaving the slot entirely (not a child element)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null)
    }
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    setDragOverIndex(null)
    const file = e.dataTransfer.files?.[0]
    acceptFile(file, index)
  }

  const handleRemoveImage = (index) => {
    setImages(prev => {
      const updated = [...prev]
      if (updated[index]?.preview) URL.revokeObjectURL(updated[index].preview)
      updated[index] = null
      return updated
    })
  }

  const buildFormData = (extra = {}) => {
    const data = new FormData()
    data.append('title', formData.title)
    data.append('description', formData.description)
    data.append('priceAmount', formData.priceAmount)
    data.append('priceCurrency', formData.priceCurrency)
    images.forEach(img => { if (img?.file) data.append('images', img.file) })
    Object.entries(extra).forEach(([k, v]) => data.append(k, v))
    return data
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await handleCreateProduct(buildFormData())
      navigate('/')
    } catch (err) {
      console.error('Failed to create product:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#131313] text-[#e5e2e1] font-sans antialiased"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,215,0,0.05) 0%, transparent 50%)' }}
    >
      <main className="h-full flex flex-col max-w-[1100px] mx-auto px-6 py-8">

        {/* Header */}
        <header className="mb-6 flex-shrink-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#d0c6ab] hover:text-[#ffd700] transition-colors duration-200 mb-3 text-sm font-medium"
          >
            <ArrowLeftIcon />
            Back
          </button>
          <div className="flex items-baseline gap-4">
            <h1 className="text-[28px] font-semibold text-[#e5e2e1] tracking-tight leading-none">
              Create Product
            </h1>
            <p className="text-[15px] text-[#999077]">
              Add a new item to your collection
            </p>
          </div>
        </header>

        {/* Two-column on desktop, single-column on mobile */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row lg:items-stretch gap-6 flex-1 min-h-0"
        >

          {/* ── LEFT COLUMN: Product Details + Pricing ── */}
          <div
            className="flex-1 min-w-0 min-h-0 bg-[#1f1f1f] border border-[#27272a] rounded-xl shadow-2xl relative overflow-y-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {/* Gold top bar */}
            <div className="sticky top-0 left-0 w-full h-[2px] bg-[#ffd700] z-10" />

            <div className="p-7">

              {/* PRODUCT DETAILS */}
              <section className="mb-7">
                <h2 className="text-[11px] uppercase text-[#ffd700] tracking-[0.2em] font-semibold mb-5">
                  Product Details
                </h2>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="title" className="text-[13px] font-medium text-[#d0c6ab] tracking-wide">
                      Title
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Classic Slim-Fit Blazer"
                      required
                      className="w-full h-11 px-4 bg-[#131313] border border-[#353534] rounded text-[#e5e2e1] text-[15px] placeholder:text-zinc-600 focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_10px_rgba(255,215,0,0.2)] transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="description" className="text-[13px] font-medium text-[#d0c6ab] tracking-wide">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the product, its materials, fit, and care instructions..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[#131313] border border-[#353534] rounded text-[#e5e2e1] text-[15px] placeholder:text-zinc-600 resize-none focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_10px_rgba(255,215,0,0.2)] transition-all duration-200 leading-relaxed"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-[#353534] mb-7" />

              {/* PRICING */}
              <section>
                <h2 className="text-[11px] uppercase text-[#ffd700] tracking-[0.2em] font-semibold mb-5">
                  Pricing
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="priceAmount" className="text-[13px] font-medium text-[#d0c6ab] tracking-wide">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-[15px] pointer-events-none select-none">
                        {CURRENCY_SYMBOLS[formData.priceCurrency]}
                      </span>
                      <input
                        id="priceAmount"
                        name="priceAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.priceAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                        className="w-full h-11 pl-8 pr-4 bg-[#131313] border border-[#353534] rounded text-[#e5e2e1] text-[15px] placeholder:text-zinc-600 focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_10px_rgba(255,215,0,0.2)] transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="priceCurrency" className="text-[13px] font-medium text-[#d0c6ab] tracking-wide">
                      Currency
                    </label>
                    <div className="relative">
                      <select
                        id="priceCurrency"
                        name="priceCurrency"
                        value={formData.priceCurrency}
                        onChange={handleChange}
                        className="w-full h-11 px-4 appearance-none bg-[#131313] border border-[#353534] rounded text-[#e5e2e1] text-[15px] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_10px_rgba(255,215,0,0.2)] transition-all duration-200 cursor-pointer"
                      >
                        <option value="INR">INR — Indian Rupee</option>
                        <option value="USD">USD — US Dollar</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="GBP">GBP — British Pound</option>
                      </select>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#999077] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>

          {/* ── RIGHT COLUMN: Images + Actions ── */}
          <div className="w-full lg:w-[400px] lg:flex-shrink-0 flex flex-col gap-5 min-h-0">

            {/* Images card — fills remaining height */}
            <div
              className="flex-1 min-h-0 bg-[#1f1f1f] border border-[#27272a] rounded-xl shadow-2xl relative overflow-y-auto flex flex-col"
              style={{ scrollbarWidth: 'none' }}
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-[#ffd700]" />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-baseline justify-between mb-5">
                  <h2 className="text-[11px] uppercase text-[#ffd700] tracking-[0.2em] font-semibold">
                    Images
                  </h2>
                  <span className="text-[12px] text-[#999077]">
                    {images.filter(Boolean).length} / {MAX_IMAGES} uploaded
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 auto-rows-[88px] flex-1">
                  {images.map((img, i) => (
                    <React.Fragment key={i}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={el => (fileInputRefs.current[i] = el)}
                        onChange={e => handleFileChange(e, i)}
                      />
                      {img ? (
                        <FilledSlot preview={img.preview} onRemove={() => handleRemoveImage(i)} isPrimary={i === 0} />
                      ) : (
                        <EmptySlot
                          onClick={() => handleSlotClick(i)}
                          isPrimary={i === 0}
                          isDragging={dragOverIndex === i}
                          onDragOver={e => handleDragOver(e, i)}
                          onDragLeave={handleDragLeave}
                          onDrop={e => handleDrop(e, i)}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <p className="mt-3 text-[11px] text-[#999077]">
                  The first image will be used as the product thumbnail.
                </p>
              </div>
            </div>

            {/* Actions card */}
            <div className="flex-shrink-0 bg-[#1f1f1f] border border-[#27272a] rounded-xl p-5 shadow-2xl flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#ffd700] text-[#131313] cursor-pointer font-semibold text-[15px] tracking-wide rounded hover:bg-[#e9c400] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,215,0,0.25)]"
              >
                {isSubmitting ? 'Publishing…' : 'Publish Product'}
              </button>
            </div>

          </div>
        </form>
      </main>
    </div>
  )
}

export default CreateProduct
