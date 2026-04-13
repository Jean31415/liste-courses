import { useState, useEffect, useCallback, useMemo } from 'react'
import type { TypedSupabaseClient } from '../lib/supabase'
import type { ListItemWithProduct, ConsolidatedItem } from '../lib/database.types'

function consolidateItems(items: ListItemWithProduct[]): ConsolidatedItem[] {
  const map = new Map<string, ConsolidatedItem>()

  for (const item of items) {
    const key = item.barcode
    const existing = map.get(key)

    if (existing) {
      existing.totalQty += item.qty ?? 1
      existing.sourceIds.push(item.id)
      // If any sub-item is unchecked, the consolidated item is unchecked
      if (!item.checked) {
        existing.checked = false
        existing.checked_at = null
      }
    } else {
      map.set(key, {
        ...item,
        totalQty: item.qty ?? 1,
        sourceIds: [item.id],
      })
    }
  }

  return Array.from(map.values())
}

export function useShoppingList(client: TypedSupabaseClient | null, familyId: string | null) {
  const [rawItems, setRawItems] = useState<ListItemWithProduct[]>([])
  const [loading, setLoading] = useState(false)

  const loadItems = useCallback(async () => {
    if (!client || !familyId) return
    setLoading(true)
    const { data, error } = await client
      .from('list_items')
      .select('*, products(name, brand, quantity, image_url, category)')
      .eq('family_id', familyId)
      .order('checked', { ascending: true })
      .order('created_at', { ascending: false })

    if (!error && data) {
      setRawItems(data as ListItemWithProduct[])
    }
    setLoading(false)
  }, [client, familyId])

  // Initial load
  useEffect(() => {
    loadItems()
  }, [loadItems])

  // Realtime subscription
  useEffect(() => {
    if (!client || !familyId) return

    const channel = client
      .channel('list-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'list_items',
          filter: `family_id=eq.${familyId}`,
        },
        () => {
          loadItems()
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [client, familyId, loadItems])

  // Consolidated items (merged by barcode)
  const items = useMemo(() => consolidateItems(rawItems), [rawItems])

  const toggleItem = useCallback(async (itemId: string, checked: boolean) => {
    if (!client) return

    // Find the consolidated item to get all source IDs
    const consolidated = items.find(i => i.id === itemId)
    const idsToUpdate = consolidated?.sourceIds ?? [itemId]

    // Optimistic update
    setRawItems(prev =>
      prev.map(item =>
        idsToUpdate.includes(item.id)
          ? { ...item, checked, checked_at: checked ? new Date().toISOString() : null }
          : item
      )
    )

    await client
      .from('list_items')
      .update({
        checked,
        checked_at: checked ? new Date().toISOString() : null,
      })
      .in('id', idsToUpdate)
  }, [client, items])

  const deleteChecked = useCallback(async () => {
    if (!client) return
    const checkedIds = rawItems.filter(i => i.checked).map(i => i.id)
    if (checkedIds.length === 0) return

    // Optimistic update
    setRawItems(prev => prev.filter(i => !i.checked))

    await client.from('list_items').delete().in('id', checkedIds)
  }, [client, rawItems])

  const uncheckedCount = items.filter(i => !i.checked).length
  const totalCount = items.length

  // Group items by category
  const groupedItems = items.reduce<Record<string, ConsolidatedItem[]>>((acc, item) => {
    const category = item.products?.category || 'Autres'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {})

  // Sort categories alphabetically, "Autres" always last
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'Autres') return 1
    if (b === 'Autres') return -1
    return a.localeCompare(b, 'fr')
  })

  return {
    items,
    groupedItems,
    sortedCategories,
    loading,
    toggleItem,
    deleteChecked,
    uncheckedCount,
    totalCount,
    reload: loadItems,
  }
}
