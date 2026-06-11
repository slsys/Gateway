export interface DeviceComment {
  id: string
  authorName: string
  message: string
  createdAt: string
}

export interface CreateDeviceCommentPayload {
  message: string
}

export interface CreateDeviceRequestPayload {
  vendor: string
  model: string
  title: string
  description: string
  picture: string
  exposes: string[]
  zigbeeModelsText: string
  buyLinksText: string
  notes: string
  pairingNotes: string
  protocol: string
}

const COMMUNITY_API_NOT_READY = 'Community API is not connected yet'

export async function getDeviceComments(_deviceId: string): Promise<DeviceComment[]> {
  // Stub until the community backend is ready.
  return []
}

export async function createDeviceComment(
  _deviceId: string,
  _payload: CreateDeviceCommentPayload,
): Promise<never> {
  // Stub until the community backend is ready.
  throw new Error(COMMUNITY_API_NOT_READY)
}

export async function createDeviceRequest(
  _payload: CreateDeviceRequestPayload,
): Promise<never> {
  // Stub until the community backend is ready.
  throw new Error(COMMUNITY_API_NOT_READY)
}
