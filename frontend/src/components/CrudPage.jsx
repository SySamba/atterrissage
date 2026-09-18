import { useEffect, useState } from 'react'
import api from '../api'
import { Btn, Card, ErrorMsg, Field, Input, Modal, PageHeader, Select, Table } from './ui'

/**
 * Page CRUD générique.
 * props:
 *  - title, subtitle
 *  - endpoint (ex: '/aeroports')
 *  - columns: [{key, label, render?}]
 *  - fields: [{name, label, type: 'text'|'number'|'select'|'textarea'|'checkbox', required, options?}]
 *  - initial: objet valeurs initiales du formulaire
 *  - filters: node rendu au-dessus du tableau (reçoit {params, setParams})
 *  - params: paramètres de requête par défaut
 *  - canDelete: bool ou fonction(row)
 */
export default function CrudPage({ title, subtitle, endpoint, columns, fields, initial = {}, filters, params: baseParams = {}, canDelete = true }) {
  const [rows, setRows] = useState([])
  const [params, setParams] = useState(baseParams)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initial)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    api.get(endpoint, { params }).then((r) => setRows(r.data)).catch(setError)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [params])

  const openCreate = () => {
    setEditing(null)
    setForm(initial)
    setError(null)
    setOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    const f = { ...initial }
    fields.forEach(({ name, type }) => {
      f[name] = row[name] ?? (type === 'checkbox' ? false : '')
    })
    setForm(f)
    setError(null)
    setOpen(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form }
      fields.forEach(({ name, type }) => {
        if (type === 'checkbox') payload[name] = payload[name] ? 1 : 0
        if (type === 'number' && payload[name] === '') payload[name] = null
      })
      if (editing) {
        await api.put(`${endpoint}/${editing.id}`, payload)
      } else {
        await api.post(endpoint, payload)
      }
      setOpen(false)
      load()
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (row) => {
    if (!window.confirm('Confirmer la suppression ?')) return
    try {
      await api.delete(`${endpoint}/${row.id}`)
      load()
    } catch (err) {
      setError(err)
    }
  }

  const cols = [
    ...columns,
    {
      key: '_actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Btn variant="secondary" className="!py-1 !px-2 text-xs" onClick={() => openEdit(row)}>Modifier</Btn>
          {(canDelete === true || (typeof canDelete === 'function' && canDelete(row))) && (
            <Btn variant="danger" className="!py-1 !px-2 text-xs" onClick={() => remove(row)}>Supprimer</Btn>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} actions={<Btn onClick={openCreate}>+ Nouveau</Btn>} />
      <ErrorMsg error={!open ? error : null} />
      <Card>
        {filters && <div className="mb-4">{filters({ params, setParams })}</div>}
        <Table columns={cols} rows={rows} />
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Modifier' : `Nouveau — ${title}`}>
        <form onSubmit={save}>
          <ErrorMsg error={error} />
          <div className="grid grid-cols-1 gap-4">
            {fields.map((f) => (
              <Field key={f.name} label={f.label} required={f.required}>
                {f.type === 'select' ? (
                  <Select value={form[f.name] ?? ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} required={f.required}>
                    <option value="">—</option>
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    rows={3}
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                ) : f.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={!!form[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                  />
                ) : (
                  <Input
                    type={f.type ?? 'text'}
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    required={f.required}
                  />
                )}
              </Field>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <Btn variant="secondary" type="button" onClick={() => setOpen(false)}>Annuler</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
