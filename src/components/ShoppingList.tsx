import type { ConsolidatedItem } from '../lib/database.types'
import { ShoppingItem } from './ShoppingItem'
import { EmptyState } from './EmptyState'

const CATEGORY_ICONS: Record<string, string> = {
  'Biscuits & Gâteaux': '🍪',
  'Boulangerie & Céréales': '🥖',
  'Boissons': '🥤',
  'Fruits & Légumes': '🥕',
  'Viandes & Poissons': '🥩',
  'Produits laitiers': '🧀',
  'Surgelés': '🧊',
  'Épicerie salée': '🥫',
  'Épicerie sucrée': '🍫',
  'Hygiène & Beauté': '🧴',
  'Entretien': '🧹',
  'Bébé': '🍼',
  'Animaux': '🐾',
  'Autres': '📦',
}

interface Props {
  groupedItems: Record<string, ConsolidatedItem[]>
  sortedCategories: string[]
  loading: boolean
  uncheckedCount: number
  totalCount: number
  onToggle: (id: string, checked: boolean) => void
  onDeleteChecked: () => void
}

export function ShoppingList({
  groupedItems, sortedCategories, loading, uncheckedCount, totalCount,
  onToggle, onDeleteChecked,
}: Props) {
  const checkedCount = totalCount - uncheckedCount

  return (
    <div className="shopping-list">
      <div className="list-actions">
        {checkedCount > 0 && (
          <button className="btn btn-sm btn-ghost" onClick={onDeleteChecked}>
            Retirer les cochés ({checkedCount})
          </button>
        )}
        <span className="list-count">
          {uncheckedCount > 0
            ? `${uncheckedCount} restant${uncheckedCount > 1 ? 's' : ''}`
            : totalCount > 0
              ? 'Tout est coché !'
              : ''}
        </span>
      </div>

      <div className="list-container">
        <div className="list-header">
          <span>Liste de courses</span>
          <span className="list-total">
            {totalCount} article{totalCount > 1 ? 's' : ''}
          </span>
        </div>

        <div className="list-body">
          {loading && totalCount === 0 ? (
            <div className="list-loading">
              <div className="spinner" />
              <span>Chargement...</span>
            </div>
          ) : totalCount === 0 ? (
            <EmptyState />
          ) : (
            sortedCategories.map(category => (
              <div key={category} className="category-group">
                <div className="category-header">
                  <span className="category-icon">{CATEGORY_ICONS[category] || '📦'}</span>
                  <span className="category-name">{category}</span>
                  <span className="category-count">{groupedItems[category].length}</span>
                </div>
                {groupedItems[category].map(item => (
                  <ShoppingItem
                    key={item.id}
                    item={item}
                    onToggle={onToggle}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
