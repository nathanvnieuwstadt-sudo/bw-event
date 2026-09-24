import { useEffect, useMemo, useState } from 'react'
import { listBanquets } from '../../api/banquets'
import type { BanquetLocation, BanquetSummary } from '../../types/banquet'

export function useBanquetFilters(restaurantId: string | null) {
  const [banquets, setBanquets] = useState<BanquetSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [location, setLocation] = useState<BanquetLocation | ''>('')
  const [minGuests, setMinGuests] = useState('')
  const [maxGuests, setMaxGuests] = useState('')

  useEffect(() => {
    if (!restaurantId) {
      setError('Aucun restaurant associé à ce compte.')
      setLoading(false)
      return
    }
    listBanquets(restaurantId)
      .then(setBanquets)
      .catch(() => setError('Impossible de charger les banquets.'))
      .finally(() => setLoading(false))
  }, [restaurantId])

  const filtersActive = Boolean(search || dateFrom || dateTo || location || minGuests || maxGuests)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const min = minGuests ? Number(minGuests) : null
    const max = maxGuests ? Number(maxGuests) : null
    return banquets.filter((b) => {
      if (q && !(b.contactName ?? '').toLowerCase().includes(q) &&
          !(b.contactOrganization ?? '').toLowerCase().includes(q)) return false
      if (dateFrom && (!b.date || b.date < dateFrom)) return false
      if (dateTo && (!b.date || b.date > dateTo)) return false
      if (location && b.location !== location) return false
      if (min != null && (b.headcount == null || b.headcount < min)) return false
      if (max != null && (b.headcount == null || b.headcount > max)) return false
      return true
    })
  }, [banquets, search, dateFrom, dateTo, location, minGuests, maxGuests])

  function resetFilters() {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setLocation('')
    setMinGuests('')
    setMaxGuests('')
  }

  return {
    banquets,
    loading,
    error,
    filtered,
    filtersActive,
    search, setSearch,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    location, setLocation,
    minGuests, setMinGuests,
    maxGuests, setMaxGuests,
    resetFilters,
  }
}
