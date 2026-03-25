import { apiUrl } from './config'

export async function apiFetch(path, { token, method = 'GET', body, headers = {} } = {}) {
  const h = {
    'Content-Type': 'application/json',
    ...headers,
  }
  if (token) h.Authorization = `Bearer ${token}`
  const res = await fetch(apiUrl(path), {
    method,
    headers: h,
    body: body != null ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    const err = new Error(typeof data === 'string' ? data : data?.message || res.statusText)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}
