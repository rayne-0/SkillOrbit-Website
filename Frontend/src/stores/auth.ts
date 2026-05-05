import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE = 'http://localhost:8000/api/auth'

interface User {
  id: number
  name: string
  email: string
  is_admin: boolean
}

interface Tokens {
  access: string
  refresh: string
}

function loadTokens(): Tokens | null {
  try {
    const s = localStorage.getItem('skillorbit_tokens')
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const tokens = ref<Tokens | null>(loadTokens())
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  function persistTokens(t: Tokens | null) {
    tokens.value = t
    if (t) localStorage.setItem('skillorbit_tokens', JSON.stringify(t))
    else localStorage.removeItem('skillorbit_tokens')
  }

  async function hydrate() {
    if (!tokens.value?.access) { loading.value = false; return }
    try {
      const res = await fetch(`${API_BASE}/me/`, {
        headers: { Authorization: `Bearer ${tokens.value.access}` },
      })
      if (res.ok) {
        const data = await res.json()
        user.value = data.user
      } else {
        persistTokens(null)
        user.value = null
      }
    } catch { /* server unreachable */ }
    finally { loading.value = false }
  }

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Login failed')
    persistTokens(data.tokens)
    user.value = data.user
    return data.user as User
  }

  async function signup(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Signup failed')
    persistTokens(data.tokens)
    user.value = data.user
    return data.user as User
  }

  async function googleLogin(credential: string) {
    const res = await fetch(`${API_BASE}/google/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Google login failed')
    persistTokens(data.tokens)
    user.value = data.user
    return data.user as User
  }

  function logout() {
    persistTokens(null)
    user.value = null
  }

  async function requestOtp(email: string) {
    const res = await fetch(`${API_BASE}/forgot-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to send OTP')
    return data.message as string
  }

  async function verifyOtp(email: string, otp: string) {
    const res = await fetch(`${API_BASE}/verify-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'OTP verification failed')
    return data.reset_token as string
  }

  async function resetPassword(resetToken: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/reset-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Password reset failed')
    return data.message as string
  }

  // Hydrate on store init
  hydrate()

  return {
    user, tokens, loading, isAuthenticated,
    login, signup, googleLogin, logout,
    requestOtp, verifyOtp, resetPassword,
  }
})
