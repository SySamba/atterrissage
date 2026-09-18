export function Btn({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-blue-800 text-white hover:bg-blue-900',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    warning: 'bg-amber-500 text-white hover:bg-amber-600',
  }
  return (
    <button
      className={`px-3 py-2 rounded-md text-sm font-medium transition disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ title, actions, children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <div className="flex gap-2">{actions}</div>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}

export function Field({ label, children, required, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium text-slate-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  )
}

export function Input(props) {
  return (
    <input
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
      {...props}
    />
  )
}

export function Select({ children, ...props }) {
  return (
    <select
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
      {...props}
    >
      {children}
    </select>
  )
}

export function Table({ columns, rows, empty = 'Aucune donnée' }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((c) => (
              <th key={c.key} className="text-left px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-slate-400">
                {empty}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="border-b border-slate-100 hover:bg-slate-50">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 text-slate-700">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Badge({ children, color = 'slate' }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    sky: 'bg-blue-100 text-blue-800',
    violet: 'bg-violet-100 text-violet-700',
  }
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto" onClick={onClose}>
      <div
        className={`bg-white rounded-lg shadow-xl mt-10 mb-10 w-full ${wide ? 'max-w-4xl' : 'max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex gap-2">{actions}</div>
    </div>
  )
}

export function ErrorMsg({ error }) {
  if (!error) return null
  const msg = error?.response?.data?.message
    || Object.values(error?.response?.data?.errors ?? {}).flat()[0]
    || 'Une erreur est survenue'
  return <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm mb-4">{msg}</div>
}

export function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
      <span>
        {meta.total} résultat{meta.total > 1 ? 's' : ''} — page {meta.current_page}/{meta.last_page}
      </span>
      <div className="flex gap-1">
        <Btn variant="secondary" className="!py-1 !px-2 text-xs" disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)}>
          ← Précédent
        </Btn>
        <Btn variant="secondary" className="!py-1 !px-2 text-xs" disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)}>
          Suivant →
        </Btn>
      </div>
    </div>
  )
}
