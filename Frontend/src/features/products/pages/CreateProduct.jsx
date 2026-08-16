import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useProduct } from '../hook/useProduct'

const MAX_IMAGES = 7
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }

const IconCamera = () => (
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
  </svg>
)
const IconPlus = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)
const IconX = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)
const IconArrowLeft = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
)

const EmptySlot = ({ onClick, isPrimary, isDragging, onDragOver, onDragLeave, onDrop }) => {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        border: `1.5px dashed ${isDragging || hov ? '#C9A96E' : '#d0c5b5'}`,
        borderRadius: 2, cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
        background: isDragging ? 'rgba(201,169,110,0.06)' : hov ? 'rgba(201,169,110,0.03)' : 'transparent',
        transform: isDragging ? 'scale(0.97)' : 'scale(1)',
        ...(isPrimary ? { gridColumn: 'span 2', gridRow: 'span 2' } : {}),
      }}
    >
      <span style={{ color: isDragging || hov ? '#C9A96E' : '#B5ADA3', transition: 'color 0.2s' }}>
        {isPrimary ? <IconCamera /> : <IconPlus />}
      </span>
      <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: isDragging || hov ? '#C9A96E' : '#B5ADA3', transition: 'color 0.2s' }}>
        {isDragging ? 'Drop here' : isPrimary ? 'Primary' : 'Add'}
      </span>
    </div>
  )
}

const FilledSlot = ({ preview, onRemove, isPrimary }) => {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', borderRadius: 2, overflow: 'hidden',
        ...(isPrimary ? { gridColumn: 'span 2', gridRow: 'span 2' } : {}),
      }}
    >
      <img src={preview} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block', transition: 'transform 0.4s ease', transform: hov ? 'scale(1.05)' : 'scale(1)' }} />
      <div style={{ position: 'absolute', inset: 0, background: hov ? 'rgba(27,24,20,0.35)' : 'transparent', transition: 'background 0.2s' }} />
      <button
        type="button"
        onClick={onRemove}
        style={{
          position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%',
          background: 'rgba(27,24,20,0.75)', border: 'none', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', opacity: hov ? 1 : 0, transition: 'opacity 0.2s, background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#c0392b'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(27,24,20,0.75)'}
      >
        <IconX />
      </button>
      {isPrimary && (
        <span style={{
          position: 'absolute', bottom: 8, left: 8,
          fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
          color: '#C9A96E', background: 'rgba(27,24,20,0.65)',
          padding: '2px 8px', borderRadius: 99, backdropFilter: 'blur(4px)',
        }}>
          Primary
        </span>
      )}
    </div>
  )
}

const Field = ({ label, htmlFor, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <label htmlFor={htmlFor} style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A6E63' }}>
      {label}
    </label>
    {children}
  </div>
)

const inputBase = {
  width: '100%', background: 'transparent', border: 'none',
  borderBottom: '1px solid #d0c5b5', outline: 'none',
  padding: '10px 0', fontSize: 15, color: '#1b1c1a',
  fontFamily: "'Inter', sans-serif", transition: 'border-color 0.25s', boxSizing: 'border-box',
}
const focusGold = e => e.target.style.borderBottomColor = '#C9A96E'
const blurWarm  = e => e.target.style.borderBottomColor = '#d0c5b5'

const CreateProduct = () => {
  const navigate = useNavigate()
  const { handleCreateProduct } = useProduct()

  const [formData, setFormData] = useState({ title: '', description: '', priceAmount: '', priceCurrency: 'INR' })
  const [images, setImages]     = useState(Array(MAX_IMAGES).fill(null))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const fileInputRefs = useRef([])

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

  const handleChange     = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  const handleSlotClick  = i => fileInputRefs.current[i]?.click()
  const handleFileChange = (e, i) => { acceptFile(e.target.files?.[0], i); e.target.value = '' }
  const handleDragOver   = (e, i) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDragOverIndex(i) }
  const handleDragLeave  = e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverIndex(null) }
  const handleDrop       = (e, i) => { e.preventDefault(); setDragOverIndex(null); acceptFile(e.dataTransfer.files?.[0], i) }

  const handleRemoveImage = i => {
    setImages(prev => {
      const updated = [...prev]
      if (updated[i]?.preview) URL.revokeObjectURL(updated[i].preview)
      updated[i] = null
      return updated
    })
  }

  const buildFormData = () => {
    const data = new FormData()
    data.append('title', formData.title)
    data.append('description', formData.description)
    data.append('priceAmount', formData.priceAmount)
    data.append('priceCurrency', formData.priceCurrency)
    images.forEach(img => { if (img?.file) data.append('images', img.file) })
    return data
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await handleCreateProduct(buildFormData())
      navigate('/seller/dashboard')
    } catch (err) {
      console.error('Failed to create product:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadedCount = images.filter(Boolean).length

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        ::placeholder { color: #c5bdb3 !important; }
        select option { background: #fbf9f6; color: #1b1c1a; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}>

        <div style={{ background: '#1b1c1a', padding: '48px 40px 40px' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C9A96E', margin: '0 0 8px' }}>Seller portal</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 300, color: '#fbf9f6', margin: 0, lineHeight: 1.1 }}>
            List a New <em>Product</em>
          </h1>
          <p style={{ fontSize: 12, color: '#7A6E63', margin: '10px 0 0', letterSpacing: '0.04em' }}>
            Fill in the details below and upload up to {MAX_IMAGES} product images.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 40px 80px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 2, padding: '36px 40px', animation: 'fadeUp 0.4s ease both' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A96E', margin: '0 0 28px' }}>Product Details</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <Field label="Title" htmlFor="cp-title">
                  <input id="cp-title" name="title" type="text" value={formData.title} onChange={handleChange}
                    placeholder="e.g. Classic Slim-Fit Blazer" required style={inputBase} onFocus={focusGold} onBlur={blurWarm} />
                </Field>
                <Field label="Description" htmlFor="cp-description">
                  <textarea id="cp-description" name="description" value={formData.description} onChange={handleChange}
                    placeholder="Describe the product, its materials, fit, and care instructions..." rows={5}
                    style={{ ...inputBase, resize: 'none', lineHeight: 1.7 }} onFocus={focusGold} onBlur={blurWarm} />
                </Field>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 2, padding: '36px 40px', animation: 'fadeUp 0.4s ease 0.07s both' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A96E', margin: '0 0 28px' }}>Pricing</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <Field label="Amount" htmlFor="cp-priceAmount">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', color: '#B5ADA3', fontSize: 16, pointerEvents: 'none', fontFamily: "'Cormorant Garamond', serif" }}>
                      {CURRENCY_SYMBOLS[formData.priceCurrency]}
                    </span>
                    <input id="cp-priceAmount" name="priceAmount" type="number" min="0" step="0.01" value={formData.priceAmount}
                      onChange={handleChange} placeholder="0.00" required
                      style={{ ...inputBase, paddingLeft: 20 }} onFocus={focusGold} onBlur={blurWarm} />
                  </div>
                </Field>
                <Field label="Currency" htmlFor="cp-priceCurrency">
                  <div style={{ position: 'relative' }}>
                    <select id="cp-priceCurrency" name="priceCurrency" value={formData.priceCurrency} onChange={handleChange}
                      style={{ ...inputBase, appearance: 'none', cursor: 'pointer', paddingRight: 24 }} onFocus={focusGold} onBlur={blurWarm}>
                      <option value="INR">INR — Indian Rupee</option>
                      <option value="USD">USD — US Dollar</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="GBP">GBP — British Pound</option>
                    </select>
                    <svg style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#B5ADA3' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </Field>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.4s ease 0.12s both' }}>

            <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 2, padding: '32px 32px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A96E', margin: 0 }}>Product Images</p>
                <span style={{ fontSize: 11, color: '#B5ADA3' }}>{uploadedCount} / {MAX_IMAGES}</span>
              </div>

              <div style={{ height: 2, background: '#f0ece4', borderRadius: 1, marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(uploadedCount / MAX_IMAGES) * 100}%`, background: '#C9A96E', borderRadius: 1, transition: 'width 0.4s ease' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: 88, gap: 8 }}>
                {images.map((img, i) => (
                  <React.Fragment key={i}>
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      ref={el => (fileInputRefs.current[i] = el)} onChange={e => handleFileChange(e, i)} />
                    {img ? (
                      <FilledSlot preview={img.preview} onRemove={() => handleRemoveImage(i)} isPrimary={i === 0} />
                    ) : (
                      <EmptySlot onClick={() => handleSlotClick(i)} isPrimary={i === 0}
                        isDragging={dragOverIndex === i}
                        onDragOver={e => handleDragOver(e, i)} onDragLeave={handleDragLeave} onDrop={e => handleDrop(e, i)} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <p style={{ fontSize: 11, color: '#B5ADA3', marginTop: 14, lineHeight: 1.6 }}>
                First image is the thumbnail. Drag & drop or click to upload.
              </p>
            </div>

            {formData.title && (
              <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 2, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                {images[0] ? (
                  <img src={images[0].preview} alt="" style={{ width: 44, height: 44, objectFit: 'cover', objectPosition: 'top', borderRadius: 2, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 44, height: 44, background: '#f5f3f0', borderRadius: 2, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                    <span style={{ fontSize: 18 }}>🖼</span>
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B5ADA3', margin: '0 0 3px' }}>Preview</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: '#1b1c1a', margin: '0 0 2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {formData.title}
                  </p>
                  {formData.priceAmount && (
                    <p style={{ fontSize: 13, color: '#7A6E63', margin: 0 }}>
                      {CURRENCY_SYMBOLS[formData.priceCurrency]}{parseFloat(formData.priceAmount).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              id="cp-publish-btn"
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%', padding: '18px 0',
                background: isSubmitting ? '#d0c5b5' : '#1b1c1a',
                color: '#fbf9f6', border: 'none',
                fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontFamily: "'Inter', sans-serif", borderRadius: 2,
                transition: 'background 0.25s, color 0.25s',
              }}
              onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.background = '#C9A96E'; e.currentTarget.style.color = '#1b1c1a'; } }}
              onMouseLeave={e => { if (!isSubmitting) { e.currentTarget.style.background = '#1b1c1a'; e.currentTarget.style.color = '#fbf9f6'; } }}
            >
              {isSubmitting ? 'Publishing…' : 'Publish Product'}
            </button>

          </div>
        </form>
      </div>
    </>
  )
}

export default CreateProduct
