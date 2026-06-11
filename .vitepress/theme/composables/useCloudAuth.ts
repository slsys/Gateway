import { computed, onMounted, ref } from 'vue'
import { getCloudSession, type CloudSessionUser } from '../api/authClient'

export type CloudAuthStatus =
  | 'loading'
  | 'guest'
  | 'authenticated'
  | 'auth_error'
  | 'network_error'

const status = ref<CloudAuthStatus>('loading')
const user = ref<CloudSessionUser | null>(null)
const error = ref<string | null>(null)
const hasLoaded = ref(false)
let inFlightRefresh: Promise<void> | null = null

async function refreshCloudAuth() {
  if (inFlightRefresh) {
    return inFlightRefresh
  }

  status.value = 'loading'
  error.value = null

  inFlightRefresh = (async () => {
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
      inFlightRefresh = null
    }
  })()

  return inFlightRefresh
}

export function useCloudAuth() {
  onMounted(() => {
    if (!hasLoaded.value && !inFlightRefresh) {
      void refreshCloudAuth()
    }
  })

  return {
    status: computed(() => status.value),
    user: computed(() => user.value),
    error: computed(() => error.value),
    refresh: refreshCloudAuth,
  }
}
