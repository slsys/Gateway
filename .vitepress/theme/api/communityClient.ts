const COMMUNITY_API_ORIGIN = 'https://api.slsys.io'

export interface DeviceComment {
  id: number
  deviceId: number
  cloudUserId: string
  userEmail: string
  userName: string
  avatarUrl: string | null
  comment: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface CreatedDeviceComment {
  id: number
  deviceId: number
  userName: string
  userEmail: string
  avatarUrl: string | null
  comment: string
  status: string
  createdAt: string
}

export interface DeviceRequestPayload {
  vendor: string
  model: string
  description: string
  updatedIn: string
  exposes: string
  powerSource: number | null
  source: string
  ieeeAddr: string
  manufacturerName: string
  modelId: string
  manufId: string
  endpoints: unknown[]
  clusters: unknown[]
  interview: Record<string, unknown>
  rawPayload: Record<string, unknown>
}

export type CommunityErrorCode =
  | 'not_authenticated'
  | 'invalid_device_id'
  | 'invalid_comment'
  | 'device_not_found'
  | 'auth_service_unavailable'
  | 'request_failed'
  | 'invalid_response'

export class CommunityApiError extends Error {
  status: number
  code: CommunityErrorCode

  constructor(message: string, status: number, code: CommunityErrorCode) {
    super(message)
    this.name = 'CommunityApiError'
    this.status = status
    this.code = code
  }
}

interface CommunitySuccessResponse<T> {
  success: boolean
  data: T
}

interface CommunityErrorResponse {
  success?: boolean
  error?: string
  code?: string
  message?: string
}

interface RawDeviceComment {
  ID: string
  DEVICE_ID: string
  CLOUD_USER_ID: string
  USER_EMAIL: string
  USER_NAME: string
  USER_AVATAR?: string
  USER_AVATAR_URL?: string
  AVATAR_URL?: string
  AVATAR?: string
  CLOUD_USER_AVATAR?: string
  COMMENT: string
  STATUS: string
  CREATED_AT: string
  UPDATED_AT: string
}

interface RawCreatedDeviceComment {
  id: number
  device_id: number
  user_name: string
  user_email: string
  avatar_url?: string
  user_avatar?: string
  user_avatar_url?: string
  comment: string
  status: string
  created_at: string
}

interface RawCreatedDeviceRequest {
  id: number
  cid: number
  status: string
}

export interface CreatedDeviceRequest {
  id: number
  cid: number
  status: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseErrorCode(status: number, payload: CommunityErrorResponse): CommunityErrorCode {
  const rawCode = typeof payload.code === 'string'
    ? payload.code
    : typeof payload.error === 'string'
      ? payload.error
      : ''

  switch (rawCode) {
    case 'not_authenticated':
      return 'not_authenticated'
    case 'invalid_device_id':
      return 'invalid_device_id'
    case 'invalid_comment':
      return 'invalid_comment'
    case 'device_not_found':
      return 'device_not_found'
    case 'auth_service_unavailable':
      return 'auth_service_unavailable'
    default:
      if (status === 401) {
        return 'not_authenticated'
      }
      if (status === 404) {
        return 'device_not_found'
      }
      if (status === 422) {
        return 'invalid_comment'
      }
      if (status === 503) {
        return 'auth_service_unavailable'
      }
      return 'request_failed'
  }
}

async function readCommunityResponse<T>(response: Response): Promise<T> {
  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new CommunityApiError('Invalid community API response', response.status, 'invalid_response')
  }

  if (!response.ok) {
    const errorPayload = isRecord(payload) ? payload as CommunityErrorResponse : {}
    const code = parseErrorCode(response.status, errorPayload)
    const message = typeof errorPayload.message === 'string'
      ? errorPayload.message
      : typeof errorPayload.error === 'string'
        ? errorPayload.error
        : `Community request failed: ${response.status}`

    throw new CommunityApiError(message, response.status, code)
  }

  if (!isRecord(payload) || payload.success !== true || !('data' in payload)) {
    throw new CommunityApiError('Unexpected community API payload', response.status, 'invalid_response')
  }

  return (payload as CommunitySuccessResponse<T>).data
}

function toDeviceComment(raw: RawDeviceComment): DeviceComment {
  return {
    id: Number(raw.ID),
    deviceId: Number(raw.DEVICE_ID),
    cloudUserId: raw.CLOUD_USER_ID,
    userEmail: raw.USER_EMAIL,
    userName: raw.USER_NAME,
    avatarUrl: raw.USER_AVATAR_URL || raw.USER_AVATAR || raw.AVATAR_URL || raw.AVATAR || raw.CLOUD_USER_AVATAR || null,
    comment: raw.COMMENT,
    status: raw.STATUS,
    createdAt: raw.CREATED_AT,
    updatedAt: raw.UPDATED_AT,
  }
}

function toCreatedDeviceComment(raw: RawCreatedDeviceComment): CreatedDeviceComment {
  return {
    id: raw.id,
    deviceId: raw.device_id,
    userName: raw.user_name,
    userEmail: raw.user_email,
    avatarUrl: raw.avatar_url || raw.user_avatar_url || raw.user_avatar || null,
    comment: raw.comment,
    status: raw.status,
    createdAt: raw.created_at,
  }
}

export async function getDeviceComments(deviceId: number): Promise<DeviceComment[]> {
  const response = await fetch(
    `${COMMUNITY_API_ORIGIN}/api/community/comments?device_id=${encodeURIComponent(String(deviceId))}`,
    {
      credentials: 'include',
    },
  )

  const data = await readCommunityResponse<RawDeviceComment[]>(response)

  if (!Array.isArray(data)) {
    throw new CommunityApiError('Unexpected comments payload', response.status, 'invalid_response')
  }

  return data.map(toDeviceComment)
}

export async function createDeviceComment(deviceId: number, comment: string): Promise<CreatedDeviceComment> {
  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/comments`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      device_id: deviceId,
      comment,
    }),
  })

  const data = await readCommunityResponse<RawCreatedDeviceComment>(response)

  if (!isRecord(data) || typeof data.id !== 'number' || typeof data.comment !== 'string') {
    throw new CommunityApiError('Unexpected created comment payload', response.status, 'invalid_response')
  }

  return toCreatedDeviceComment(data)
}

export async function createDeviceRequest(payload: DeviceRequestPayload): Promise<CreatedDeviceRequest> {
  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/requests`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vendor: payload.vendor,
      model: payload.model,
      description: payload.description,
      updated_in: payload.updatedIn,
      exposes: payload.exposes,
      power_source: payload.powerSource,
      source: payload.source,
      ieee_addr: payload.ieeeAddr,
      manufacturer_name: payload.manufacturerName,
      model_id: payload.modelId,
      manuf_id: payload.manufId,
      endpoints: payload.endpoints,
      clusters: payload.clusters,
      interview: payload.interview,
      raw_payload: payload.rawPayload,
    }),
  })

  const data = await readCommunityResponse<RawCreatedDeviceRequest>(response)

  if (
    !isRecord(data) ||
    typeof data.id !== 'number' ||
    typeof data.cid !== 'number' ||
    typeof data.status !== 'string'
  ) {
    throw new CommunityApiError('Unexpected created request payload', response.status, 'invalid_response')
  }

  return {
    id: data.id,
    cid: data.cid,
    status: data.status,
  }
}
