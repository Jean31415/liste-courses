import { useState } from 'react'
import type { ScannedProduct } from '../hooks/useScanner'

interface Props {
  product: ScannedProduct
  categories: readonly string[]
  isManual: boolean
  onConfirm: (product: ScannedProduct) => void
  onCancel: () => void
}

export function ProductForm({ product, categories, isManual, onConfirm, onCancel }: Props) {
  const [name, setName] = useState(product.name)
  const [brand, setBrand] = useState(product.brand)
  const [category, setCategory] = useState(product.category)

  const handleSubmit = () => {
    if (!name.trim()) return
    onConfirm({
      ...product,
      name: name.trim(),
      brand: brand.trim(),
      category,
    })
  }

  return (
    <div className="scanner-overlay">
      <div className="scanner-header">
        <span>{isManual ? 'Nouveau produit' : 'Produit trouvé'}</span>
        <button className="scanner-close" onClick={onCancel}>✕</button>
      </div>

      <div className="product-form">
        {product.image_url && (
          <img
            className="product-form-img"
            src={product.image_url}
            alt=""
          />
        )}

        <div className="product-form-barcode">{product.barcode}</div>

        {isManual ? (
          <>
            <input
              className="setup-input"
              type="text"
              placeholder="Nom du produit *"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
            <input
              className="setup-input"
              type="text"
              placeholder="Marque (optionnel)"
              value={brand}
              onChange={e => setBrand(e.target.value)}
            />
          </>
        ) : (
          <div className="product-form-info">
            <div className="product-form-name">{product.name}</div>
            <div className="product-form-meta">
              {[product.brand, product.quantity].filter(Boolean).join(' · ')}
            </div>
          </div>
        )}

        <select
          className="setup-input product-form-select"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="product-form-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Annuler
          </button>
          <button
            className="btn btn-accent"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Ajouter à la liste
          </button>
        </div>
      </div>
    </div>
  )
}
