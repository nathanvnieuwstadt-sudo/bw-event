import { Button } from '../ui/Button'
import type { MenuItemRequest } from '../../types/banquet'

interface Props {
  items: MenuItemRequest[]
  onChange: (items: MenuItemRequest[]) => void
  readOnly?: boolean
}

const inputCls =
  'rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none disabled:bg-stone-50 disabled:text-stone-400'

export function MenuItemEditor({ items, onChange, readOnly = false }: Props) {
  function add() {
    onChange([...items, { dishName: '', quantity: 1 }])
  }

  function update(index: number, field: keyof MenuItemRequest, value: string | number) {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <div className="grid grid-cols-[1fr_80px_140px_20px] gap-2 px-0.5">
          <span className="section-label">Plat</span>
          <span className="section-label text-right">Qté</span>
          <span className="section-label">Notes</span>
          <span />
        </div>
      )}

      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-[1fr_80px_140px_20px] items-center gap-2">
          <input
            type="text"
            placeholder="Nom du plat"
            value={item.dishName}
            onChange={(e) => update(index, 'dishName', e.target.value)}
            disabled={readOnly}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="1"
            min={1}
            value={item.quantity}
            onChange={(e) => update(index, 'quantity', parseInt(e.target.value, 10) || 1)}
            disabled={readOnly}
            className={`${inputCls} text-right tabular-nums`}
          />
          <input
            type="text"
            placeholder="Notes"
            value={item.notes ?? ''}
            onChange={(e) => update(index, 'notes', e.target.value)}
            disabled={readOnly}
            className={inputCls}
          />
          {!readOnly ? (
            <button
              type="button"
              onClick={() => remove(index)}
              className="flex items-center justify-center rounded text-stone-300 transition-colors duration-100 hover:text-red-500 active:scale-[0.9]"
              aria-label="Supprimer"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          ) : (
            <span />
          )}
        </div>
      ))}

      {!readOnly && (
        <Button type="button" variant="ghost" size="sm" onClick={add} className="mt-1">
          + Ajouter un plat
        </Button>
      )}

      {items.length === 0 && readOnly && (
        <p className="text-sm text-stone-400">Aucun plat enregistré.</p>
      )}
    </div>
  )
}
