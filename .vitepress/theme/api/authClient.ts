export interface CloudSessionUser {
  id: string
  email: string
  name: string
}

export type CloudSession =
  | { authenticated: false }
  | { authenticated: true; user: CloudSessionUser }

export async function getCloudSession(): Promise<CloudSession> {
  const response = await fetch('https://cloud.slsys.io/api/auth/session', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Session request failed: ${response.status}`)
  }

  const data = (await response.json()) as CloudSession

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
  }

  return data
}
