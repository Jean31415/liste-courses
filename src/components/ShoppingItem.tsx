import type { ListItemWithProduct } from '../lib/database.types'

interface Props {
  item: ListItemWithProduct
  onToggle: (id: string, checked: boolean) => void
  onUpdateQty: (id: string, newQty: number) => void
}

export function ShoppingItem({ item, onToggle, onUpdateQty }: Props) {
  const product = item.products
  const checked = item.checked ?? false
  const qty = item.qty ?? 1

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdateQty(item.id, qty - 1)
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (qty < 99) onUpdateQty(item.id, qty + 1)
  }

  return (
    <div
      className={`list-item ${checked ? 'checked' : ''}`}
      onClick={() => onToggle(item.id, !checked)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onToggle(item.id, !checked)}
    >
      <div className="list-checkbox">
        {checked && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {product?.image_url ? (
        <img
          className="list-item-img"
          src={product.image_url}
          alt=""
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <div className="list-item-img-placeholder" />
      )}

      <div className="list-item-info">
        <div className="list-item-name">
          {product?.name || item.barcode}
        </div>
        <div className="list-item-meta">
          {[product?.brand, product?.quantity].filter(Boolean).join(' · ') || item.barcode}
        </div>
      </div>

      <div className="qty-controls" onClick={e => e.stopPropagation()}>
        <button
          className="qty-btn qty-btn-minus"
          onClick={handleDecrement}
          aria-label={qty <= 1 ? 'Supprimer' : 'Diminuer'}
        >
          {qty <= 1 ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : '−'}
        </button>
        <span className="qty-value">{qty}</span>
        <button
          className="qty-btn qty-btn-plus"
          onClick={handleIncrement}
          disabled={qty >= 99}
          aria-label="Augmenter"
        >
          +
        </button>
      </div>
    </div>
  )
}
