export function logout() {
  localStorage.removeItem('restomap:auth_token')
  window.location.href = '/auth'
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('restomap:auth_token')
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('restomap:auth_token')
}
