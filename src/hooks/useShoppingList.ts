import { useState, useEffect, useCallback } from 'react'
import type { TypedSupabaseClient } from '../lib/supabase'
import type { ListItemWithProduct } from '../lib/database.types'

export function useShoppingList(client: TypedSupabaseClient | null, familyId: string | null) {
  const [items, setItems] = useState<ListItemWithProduct[]>([])
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
      setItems(data as ListItemWithProduct[])
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

  const toggleItem = useCallback(async (itemId: string, checked: boolean) => {
    if (!client) return

    // Optimistic update
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
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
      .eq('id', itemId)
  }, [client])

  const updateQty = useCallback(async (itemId: string, newQty: number) => {
    if (!client) return

    if (newQty <= 0) {
      // Delete item
      setItems(prev => prev.filter(i => i.id !== itemId))
      await client.from('list_items').delete().eq('id', itemId)
    } else {
      // Update qty
      setItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, qty: newQty } : item
        )
      )
      await client
        .from('list_items')
        .update({ qty: newQty })
        .eq('id', itemId)
    }
  }, [client])

  const deleteChecked = useCallback(async () => {
    if (!client) return
    const checkedIds = items.filter(i => i.checked).map(i => i.id)
    if (checkedIds.length === 0) return

    // Optimistic update
    setItems(prev => prev.filter(i => !i.checked))

    await client.from('list_items').delete().in('id', checkedIds)
  }, [client, items])

  const uncheckedCount = items.filter(i => !i.checked).length
  const totalCount = items.length

  // Group items by category
  const groupedItems = items.reduce<Record<string, ListItemWithProduct[]>>((acc, item) => {
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
    updateQty,
    deleteChecked,
    uncheckedCount,
    totalCount,
    reload: loadItems,
  }
}
