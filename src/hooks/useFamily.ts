import { useState, useEffect, useCallback } from 'react'
import { createSupabaseClient, createAnonClient, type TypedSupabaseClient } from '../lib/supabase'

const STORAGE_KEY = 'familyToken'

interface FamilyState {
  familyId: string | null
  familyName: string | null
  familyToken: string | null
  client: TypedSupabaseClient | null
  loading: boolean
  error: string | null
}

export function useFamily() {
  const [state, setState] = useState<FamilyState>({
    familyId: null,
    familyName: null,
    familyToken: null,
    client: null,
    loading: true,
    error: null,
  })

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY)
    if (!token) {
      setState(s => ({ ...s, loading: false }))
      return
    }
    initFromToken(token)
  }, [])

  async function initFromToken(token: string) {
    setState(s => ({ ...s, loading: true, error: null }))
    const client = createSupabaseClient(token)
    const { data, error } = await client
      .from('families')
      .select('id, name, token')
      .single()

    if (error || !data) {
      localStorage.removeItem(STORAGE_KEY)
      setState({ familyId: null, familyName: null, familyToken: null, client: null, loading: false, error: 'Foyer introuvable' })
      return
    }

    localStorage.setItem(STORAGE_KEY, data.token)
    setState({
      familyId: data.id,
      familyName: data.name,
      familyToken: data.token,
      client,
      loading: false,
      error: null,
    })
  }

  const createFamily = useCallback(async (name: string) => {
    setState(s => ({ ...s, loading: true, error: null }))
    const anonClient = createAnonClient()
    const { data, error } = await anonClient.rpc('create_family', { p_name: name }).single()

    if (error || !data) {
      setState(s => ({ ...s, loading: false, error: error?.message || 'Erreur de création' }))
      return
    }

    const token = (data as { id: string; token: string }).token
    localStorage.setItem(STORAGE_KEY, token)
    await initFromToken(token)
  }, [])

  const joinFamily = useCallback(async (token: string) => {
    const trimmed = token.trim().toLowerCase()
    if (trimmed.length < 6) {
      setState(s => ({ ...s, error: 'Code trop court (min 6 caractères)' }))
      return
    }
    await initFromToken(trimmed)
  }, [])

  const leaveFamily = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState({
      familyId: null,
      familyName: null,
      familyToken: null,
      client: null,
      loading: false,
      error: null,
    })
  }, [])

  const copyToken = useCallback(async () => {
    if (state.familyToken) {
      await navigator.clipboard.writeText(state.familyToken)
    }
  }, [state.familyToken])

  return {
    ...state,
    createFamily,
    joinFamily,
    leaveFamily,
    copyToken,
  }
}
