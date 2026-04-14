import { useState, useCallback } from 'react'
import type { TypedSupabaseClient } from '../lib/supabase'
import { normalizeName, toPseudoBarcode } from '../lib/voice'

const CATEGORIES = [
  'Biscuits & Gâteaux',
  'Boissons',
  'Boulangerie & Céréales',
  'Bébé',
  'Animaux',
  'Entretien',
  'Épicerie salée',
  'Épicerie sucrée',
  'Fruits & Légumes',
  'Hygiène & Beauté',
  'Produits laitiers',
  'Surgelés',
  'Viandes & Poissons',
  'Autres',
] as const

export type ScannerStep = 'idle' | 'scanning' | 'voicing' | 'loading' | 'found' | 'manual' | 'done'

export interface ScannedProduct {
  barcode: string
  name: string
  brand: string
  quantity: string
  image_url: string
  category: string
}

export function useScanner(client: TypedSupabaseClient | null, familyId: string | null) {
  const [step, setStep] = useState<ScannerStep>('idle')
  const [product, setProduct] = useState<ScannedProduct | null>(null)
  const [error, setError] = useState<string | null>(null)

  const lookupBarcode = useCallback(async (barcode: string) => {
    if (!client || !familyId) return
    setStep('loading')
    setError(null)

    try {
      // 1. Check local DB first
      const { data: existing } = await client
        .from('products')
        .select('barcode, name, brand, quantity, image_url, category')
        .eq('barcode', barcode)
        .maybeSingle()

      if (existing && existing.name) {
        setProduct({
          barcode,
          name: existing.name || '',
          brand: existing.brand || '',
          quantity: existing.quantity || '',
          image_url: existing.image_url || '',
          category: existing.category || 'Autres',
        })
        setStep('found')
        return
      }

      // 2. Try Open Food Facts
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,quantity,image_front_small_url,categories_tags`
      )
      const json = await res.json()

      if (json.status === 1 && json.product?.product_name) {
        const p = json.product
        const category = guessCategory(p.categories_tags || [])
        setProduct({
          barcode,
          name: p.product_name || '',
          brand: p.brands || '',
          quantity: p.quantity || '',
          image_url: p.image_front_small_url || '',
          category,
        })
        setStep('found')
        return
      }

      // 3. Not found → manual entry
      setProduct({
        barcode,
        name: '',
        brand: '',
        quantity: '',
        image_url: '',
        category: 'Autres',
      })
      setStep('manual')
    } catch {
      setError('Erreur de connexion')
      setStep('idle')
    }
  }, [client, familyId])

  const addToList = useCallback(async (productData: ScannedProduct) => {
    if (!client || !familyId) return

    try {
      // Upsert product in DB
      await client.from('products').upsert({
        barcode: productData.barcode,
        name: productData.name,
        brand: productData.brand || null,
        quantity: productData.quantity || null,
        image_url: productData.image_url || null,
        category: productData.category,
        source: 'scan',
      }, { onConflict: 'barcode' })

      // Check if item already in list
      const { data: existing } = await client
        .from('list_items')
        .select('id, qty')
        .eq('family_id', familyId)
        .eq('barcode', productData.barcode)
        .maybeSingle()

      if (existing) {
        // Increment qty
        await client
          .from('list_items')
          .update({ qty: (existing.qty ?? 1) + 1, checked: false, checked_at: null })
          .eq('id', existing.id)
      } else {
        // Add new item
        await client.from('list_items').insert({
          family_id: familyId,
          barcode: productData.barcode,
          qty: 1,
        })
      }

      setStep('done')
      setTimeout(() => {
        setStep('idle')
        setProduct(null)
      }, 1500)
    } catch {
      setError("Erreur lors de l'ajout")
    }
  }, [client, familyId])

  const reset = useCallback(() => {
    setStep('idle')
    setProduct(null)
    setError(null)
  }, [])

  const startScanning = useCallback(() => {
    setStep('scanning')
    setError(null)
  }, [])

  const startVoice = useCallback(() => {
    setStep('voicing')
    setError(null)
  }, [])

  const processVoice = useCallback(async (transcript: string) => {
    if (!client || !familyId) return
    const normalized = normalizeName(transcript)
    if (normalized.length < 2) {
      setError('Dictée trop courte, réessaie.')
      setStep('idle')
      return
    }

    setStep('loading')
    setError(null)

    try {
      // Search existing products by name (ILIKE — case-insensitive).
      const { data: matches } = await client
        .from('products')
        .select('barcode, name, brand, quantity, image_url, category')
        .ilike('name', `%${normalized}%`)
        .order('name', { ascending: true })
        .limit(1)

      const match = matches?.[0]
      if (match && match.name) {
        setProduct({
          barcode: match.barcode,
          name: match.name,
          brand: match.brand || '',
          quantity: match.quantity || '',
          image_url: match.image_url || '',
          category: match.category || 'Autres',
        })
        setStep('found')
        return
      }

      // No existing product → create a fresh voice entry.
      setProduct({
        barcode: toPseudoBarcode(normalized),
        name: transcript.trim(),
        brand: '',
        quantity: '',
        image_url: '',
        category: 'Autres',
      })
      setStep('manual')
    } catch {
      setError('Erreur de connexion')
      setStep('idle')
    }
  }, [client, familyId])

  return {
    step,
    product,
    error,
    categories: CATEGORIES,
    lookupBarcode,
    addToList,
    setProduct,
    setStep,
    startScanning,
    startVoice,
    processVoice,
    reset,
  }
}

/** Map Open Food Facts category tags to our simplified categories */
function guessCategory(tags: string[]): string {
  const joined = tags.join(' ').toLowerCase()

  if (/beverage|drink|water|juice|soda|boisson|eau/.test(joined)) return 'Boissons'
  if (/biscuit|cookie|cake|gâteau|chocolate|confection/.test(joined)) return 'Biscuits & Gâteaux'
  if (/bread|cereal|flour|pasta|rice|pain|farine|pâte|riz|céréale/.test(joined)) return 'Boulangerie & Céréales'
  if (/milk|cheese|yogurt|dairy|lait|fromage|yaourt|beurre|crème/.test(joined)) return 'Produits laitiers'
  if (/meat|fish|poultry|viande|poisson|volaille|charcuterie/.test(joined)) return 'Viandes & Poissons'
  if (/fruit|vegetable|légume|salade/.test(joined)) return 'Fruits & Légumes'
  if (/frozen|surgelé|glace/.test(joined)) return 'Surgelés'
  if (/sweet|sugar|honey|jam|sucr|miel|confiture|chocolat|bonbon|dessert/.test(joined)) return 'Épicerie sucrée'
  if (/sauce|oil|vinegar|spice|condiment|huile|vinaigre|épice|conserve|sel|poivre/.test(joined)) return 'Épicerie salée'
  if (/baby|bébé|infant/.test(joined)) return 'Bébé'
  if (/pet|animal|cat|dog/.test(joined)) return 'Animaux'
  if (/clean|detergent|soap|entretien|lessive|vaisselle/.test(joined)) return 'Entretien'
  if (/hygien|beauty|shampoo|tooth|cosmetic|hygiène|shampo|dentifrice/.test(joined)) return 'Hygiène & Beauté'

  return 'Autres'
}
