import { computed, onMounted, ref } from 'vue'
import { getCloudSession, type CloudSessionUser } from '../api/authClient'

export type CloudAuthStatus =
  | 'loading'
  | 'guest'
  | 'authenticated'
  | 'auth_error'
  | 'network_error'

export function useCloudAuth() {
  const status = ref<CloudAuthStatus>('loading')
  const user = ref<CloudSessionUser | null>(null)
  const error = ref<string | null>(null)
  const hasLoaded = ref(false)

  async function refresh() {
    status.value = 'loading'
    error.value = null

    try {
      const session = await getCloudSession()

      if (session.authenticated) {
        status.value = 'authenticated'
        user.value = session.user
      } else {
        status.value = 'guest'
        user.value = null
      }
    } catch (err) {
      user.value = null

      if (err instanceof TypeError) {
        status.value = 'network_error'
        error.value = err.message || 'Network request failed'
      } else if (err instanceof Error) {
        status.value = 'auth_error'
        error.value = err.message
      } else {
        status.value = 'auth_error'
        error.value = 'Unknown authorization error'
      }
    } finally {
      hasLoaded.value = true
    }
  }

  onMounted(() => {
    if (!hasLoaded.value) {
      void refresh()
    }
  })

  return {
    status: computed(() => status.value),
    user: computed(() => user.value),
    error: computed(() => error.value),
    refresh,
  }
}
