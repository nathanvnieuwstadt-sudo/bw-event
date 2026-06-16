import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
}

export function Table<T>({
  columns,
  rows,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No records found.',
}: Props<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-card">
      <table className="min-w-full divide-y divide-stone-100">
        <thead>
          <tr className="bg-stone-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  'px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-stone-400',
                  col.className ?? '',
                ].join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-stone-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={[
                  'transition-colors duration-75',
                  onRowClick
                    ? 'cursor-pointer hover:bg-stone-50 active:bg-stone-100'
                    : '',
                ].join(' ')}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={['px-4 py-3 text-sm text-stone-700', col.className ?? ''].join(' ')}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
