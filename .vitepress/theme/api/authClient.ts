export interface CloudSessionUser {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
}

export type CloudSession =
  | { authenticated: false }
  | { authenticated: true; user: CloudSessionUser }

interface RawCloudSessionUser {
  id: string
  email: string
  name: string
  avatarUrl?: unknown
  avatar_url?: unknown
  avatar?: unknown
  photo_url?: unknown
  image?: unknown
}

interface RawAuthenticatedCloudSession {
  authenticated: true
  user: RawCloudSessionUser
}

interface RawGuestCloudSession {
  authenticated: false
}

type RawCloudSession = RawAuthenticatedCloudSession | RawGuestCloudSession

function pickAvatarUrl(user: RawCloudSessionUser): string | null {
  const candidates = [
    user.avatarUrl,
    user.avatar_url,
    user.avatar,
    user.photo_url,
    user.image,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      return candidate
    }
  }

  return null
}

export async function getCloudSession(): Promise<CloudSession> {
  const response = await fetch('https://cloud.slsys.io/api/auth/session', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Session request failed: ${response.status}`)
  }

  const data = (await response.json()) as RawCloudSession

  if (
    typeof data !== 'object' ||
    data === null ||
    typeof data.authenticated !== 'boolean'
  ) {
    throw new Error('Invalid session payload')
  }

  if (data.authenticated) {
    if (
      typeof data.user !== 'object' ||
      data.user === null ||
      typeof data.user.id !== 'string' ||
      typeof data.user.email !== 'string' ||
      typeof data.user.name !== 'string'
    ) {
      throw new Error('Invalid authenticated session payload')
    }

    return {
      authenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatarUrl: pickAvatarUrl(data.user),
      },
    }
  }

  return { authenticated: false }
}
