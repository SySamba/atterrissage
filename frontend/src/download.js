import api from './api'

const trigger = (res) => {
  const blobUrl = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = blobUrl
  const cd = res.headers['content-disposition']
  a.download = cd?.match(/filename="?([^";\n]+)/)?.[1] ?? 'export'
  a.click()
  URL.revokeObjectURL(blobUrl)
}

export async function downloadFile(url, params = {}) {
  const res = await api.get(url, { params, responseType: 'blob' })
  trigger(res)
}

export async function downloadFilePost(url, body = {}, params = {}) {
  const res = await api.post(url, body, { params, responseType: 'blob' })
  trigger(res)
}
