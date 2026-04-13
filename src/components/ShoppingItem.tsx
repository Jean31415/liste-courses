import type { ConsolidatedItem } from '../lib/database.types'

interface Props {
  item: ConsolidatedItem
  onToggle: (id: string, checked: boolean) => void
}

export function ShoppingItem({ item, onToggle }: Props) {
  const product = item.products
  const checked = item.checked ?? false

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

      {item.totalQty > 1 && (
        <span className="list-item-qty">&times;{item.totalQty}</span>
      )}
    </div>
  )
}
