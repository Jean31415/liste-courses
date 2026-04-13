import { useFamily } from './hooks/useFamily'
import { useShoppingList } from './hooks/useShoppingList'
import { useScanner } from './hooks/useScanner'
import { FamilySetup } from './components/FamilySetup'
import { FamilyBar } from './components/FamilyBar'
import { ShoppingList } from './components/ShoppingList'
import { BarcodeScanner } from './components/BarcodeScanner'
import { ProductForm } from './components/ProductForm'

function App() {
  const family = useFamily()
  const list = useShoppingList(family.client, family.familyId)
  const scanner = useScanner(family.client, family.familyId)

  // Loading splash
  if (family.loading && !family.familyId) {
    return (
      <div className="root">
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  // No family → setup screen
  if (!family.familyId) {
    return (
      <div className="root">
        <FamilySetup
          onCreateFamily={family.createFamily}
          onJoinFamily={family.joinFamily}
          error={family.error}
          loading={family.loading}
        />
      </div>
    )
  }

  // Main app
  return (
    <div className="root">
      <FamilyBar
        familyName={family.familyName!}
        familyToken={family.familyToken!}
        onCopyToken={family.copyToken}
        onLeave={family.leaveFamily}
      />

      <ShoppingList
        groupedItems={list.groupedItems}
        sortedCategories={list.sortedCategories}
        loading={list.loading}
        uncheckedCount={list.uncheckedCount}
        totalCount={list.totalCount}
        onToggle={list.toggleItem}
        onUpdateQty={list.updateQty}
        onDeleteChecked={list.deleteChecked}
      />

      {/* Scan button */}
      <button
        className="fab-scan"
        onClick={scanner.startScanning}
        aria-label="Scanner un produit"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7V5a2 2 0 012-2h2"/>
          <path d="M17 3h2a2 2 0 012 2v2"/>
          <path d="M21 17v2a2 2 0 01-2 2h-2"/>
          <path d="M7 21H5a2 2 0 01-2-2v-2"/>
          <line x1="7" y1="12" x2="17" y2="12"/>
          <line x1="7" y1="8" x2="17" y2="8"/>
          <line x1="7" y1="16" x2="17" y2="16"/>
        </svg>
      </button>

      {/* Scanner overlay */}
      {scanner.step === 'scanning' && (
        <BarcodeScanner
          onScan={scanner.lookupBarcode}
          onClose={scanner.reset}
        />
      )}

      {/* Loading overlay */}
      {scanner.step === 'loading' && (
        <div className="scanner-overlay">
          <div className="scanner-loading">
            <div className="spinner" />
            <span>Recherche du produit...</span>
          </div>
        </div>
      )}

      {/* Product found or manual entry */}
      {(scanner.step === 'found' || scanner.step === 'manual') && scanner.product && (
        <ProductForm
          product={scanner.product}
          categories={scanner.categories}
          isManual={scanner.step === 'manual'}
          onConfirm={scanner.addToList}
          onCancel={scanner.reset}
        />
      )}

      {/* Success toast */}
      {scanner.step === 'done' && (
        <div className="toast-success">
          ✓ Produit ajouté !
        </div>
      )}

      {/* Error toast */}
      {scanner.error && (
        <div className="toast-error">
          {scanner.error}
        </div>
      )}
    </div>
  )
}

export default App
