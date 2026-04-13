import { useFamily } from './hooks/useFamily'
import { useShoppingList } from './hooks/useShoppingList'
import { FamilySetup } from './components/FamilySetup'
import { FamilyBar } from './components/FamilyBar'
import { ShoppingList } from './components/ShoppingList'

function App() {
  const family = useFamily()
  const list = useShoppingList(family.client, family.familyId)

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
    </div>
  )
}

export default App
