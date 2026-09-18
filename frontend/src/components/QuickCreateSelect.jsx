import { useState } from 'react'
import api from '../api'
import { useAuth } from '../auth'
import { Btn, ErrorMsg, Field, Input, Select, Modal } from './ui'

/**
 * Liste déroulante avec bouton « + » permettant à l'admin/agent
 * de créer une entrée du référentiel sans quitter le formulaire.
 *
 * props:
 *  - value, onChange : valeur sélectionnée (id) et callback
 *  - options : [{id, label}]
 *  - endpoint : endpoint API de création (ex: '/compagnies')
 *  - fields : champs du mini-formulaire [{name, label, type?, required?, options?}]
 *  - createTitle : titre de la modale
 *  - placeholder, required
 */
export default function QuickCreateSelect({ value, onChange, options, endpoint, fields, createTitle, placeholder = '—', required }) {
  const { user } = useAuth()
  const canCreate = ['admin', 'agent'].includes(user?.role)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({})
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const openModal = () => {
    setForm(Object.fromEntries(fields.map((f) => [f.name, f.default ?? ''])))
    setError(null)
    setOpen(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form }
      Object.keys(payload).forEach((k) => { if (payload[k] === '') payload[k] = null })
      const { data } = await api.post(endpoint, payload)
      onChange(String(data.id), data)
      setOpen(false)
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex gap-1">
      <div className="flex-1">
        <Select value={value} onChange={(e) => onChange(e.target.value)} required={required}>
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </Select>
      </div>
      {canCreate && (
        <Btn type="button" variant="secondary" className="!px-2.5" title={createTitle} onClick={openModal}>+</Btn>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={createTitle}>
        <form onSubmit={save}>
          <ErrorMsg error={error} />
          <div className="space-y-4">
            {fields.map((f) => (
              <Field key={f.name} label={f.label} required={f.required}>
                {f.type === 'select' ? (
                  <Select value={form[f.name] ?? ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} required={f.required}>
                    <option value="">—</option>
                    {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
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
            <Btn type="submit" disabled={saving}>{saving ? 'Création…' : 'Créer'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
