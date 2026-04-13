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
      .select('*, products(name, brand, quantity, image_url)')
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

  return {
    items,
    loading,
    toggleItem,
    deleteChecked,
    uncheckedCount,
    totalCount,
    reload: loadItems,
  }
}
