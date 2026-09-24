import { Button } from '../ui/Button'
import type { MenuItemRequest } from '../../types/banquet'

interface Props {
  items: MenuItemRequest[]
  onChange: (items: MenuItemRequest[]) => void
  readOnly?: boolean
}

const inputCls =
  'min-h-[44px] rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none disabled:bg-neutral-100 disabled:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:disabled:bg-neutral-950 dark:disabled:text-neutral-500'

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
        <div className="hidden sm:grid sm:grid-cols-[1fr_80px_140px_44px] gap-2 px-0.5">
          <span className="section-label">Plat</span>
          <span className="section-label text-right">Qté</span>
          <span className="section-label">Notes</span>
          <span />
        </div>
      )}

      {items.map((item, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-md border border-neutral-200 p-2 dark:border-neutral-800 sm:grid sm:grid-cols-[1fr_80px_140px_44px] sm:items-center sm:gap-2 sm:border-0 sm:p-0"
        >
          <input
            type="text"
            placeholder="Nom du plat"
            value={item.dishName}
            onChange={(e) => update(index, 'dishName', e.target.value)}
            disabled={readOnly}
            className={inputCls}
          />
          <div className="flex items-center gap-2 sm:contents">
            <input
              type="number"
              placeholder="1"
              min={1}
              aria-label="Quantité"
              value={item.quantity}
              onChange={(e) => update(index, 'quantity', parseInt(e.target.value, 10) || 1)}
              disabled={readOnly}
              className={`${inputCls} w-20 shrink-0 text-right tabular-nums sm:w-auto`}
            />
            <input
              type="text"
              placeholder="Notes"
              value={item.notes ?? ''}
              onChange={(e) => update(index, 'notes', e.target.value)}
              disabled={readOnly}
              className={`${inputCls} min-w-0 flex-1`}
            />
            {!readOnly ? (
              <button
                type="button"
                onClick={() => remove(index)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors duration-100 hover:bg-red-500/10 hover:text-red-600 active:scale-[0.95] dark:hover:text-red-400"
                aria-label="Supprimer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 3l10 10M13 3L3 13" />
                </svg>
              </button>
            ) : (
              <span className="hidden sm:inline" />
            )}
          </div>
        </div>
      ))}

      {!readOnly && (
        <Button type="button" variant="ghost" size="sm" onClick={add} className="mt-1">
          + Ajouter un plat
        </Button>
      )}

      {items.length === 0 && readOnly && (
        <p className="text-sm text-neutral-500">Aucun plat enregistré.</p>
      )}
    </div>
  )
}
