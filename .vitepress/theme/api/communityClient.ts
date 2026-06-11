const COMMUNITY_API_ORIGIN = 'https://api.slsys.io'

export type RawDeviceComment = {
  ID: string
  DEVICE_ID: string
  CLOUD_USER_ID: string
  USER_EMAIL: string
  USER_NAME: string | null
  USER_AVATAR?: string
  USER_AVATAR_URL?: string
  AVATAR_URL?: string
  AVATAR?: string
  CLOUD_USER_AVATAR?: string
  COMMENT: string
  RATING: string | null
  STATUS: 'Published'
  CREATED_AT: string
  UPDATED_AT: string
}

export type NormalizedDeviceComment = RawDeviceComment & {
  id: number
  deviceId: number
  cloudUserId: string
  rating: number | null
  avatarUrl: string | null
}

export type CreatedOrUpdatedComment = {
  id: number
  deviceId: number
  cloudUserId: string
  userEmail: string
  userName: string | null
  avatarUrl: string | null
  comment: string
  rating: number | null
  status: 'Published'
  createdAt: string
  updatedAt: string
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
  | 'invalid_rating'
  | 'comment_or_rating_required'
  | 'comment_forbidden'
  | 'comment_not_found'
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
  data?: T
}

interface CommunityErrorResponse {
  success?: boolean
  error?: string
  code?: string
  message?: string
}

interface RawCreatedDeviceComment {
  id: number
  device_id: number
  cloud_user_id?: string | number
  user_name: string | null
  user_email: string
  avatar_url?: string
  user_avatar?: string
  user_avatar_url?: string
  comment: string
  rating?: number | string | null
  status: 'Published'
  created_at: string
  updated_at?: string
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

function extractErrorCode(payload: CommunityErrorResponse): string {
  const candidates = [payload.code, payload.error, payload.message]

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') {
      continue
    }

    const normalized = candidate.trim().toLowerCase()
    const knownCodes = [
      'not_authenticated',
      'invalid_device_id',
      'invalid_comment',
      'invalid_rating',
      'comment_or_rating_required',
      'comment_forbidden',
      'comment_not_found',
      'device_not_found',
      'auth_service_unavailable',
    ]

    const exactMatch = knownCodes.find((code) => normalized === code)
    if (exactMatch) {
      return exactMatch
    }

    const containedMatch = knownCodes.find((code) => normalized.includes(code))
    if (containedMatch) {
      return containedMatch
    }
  }

  return ''
}

function parseErrorCode(status: number, payload: CommunityErrorResponse): CommunityErrorCode {
  const rawCode = extractErrorCode(payload)

  switch (rawCode) {
    case 'not_authenticated':
    case 'invalid_device_id':
    case 'invalid_comment':
    case 'invalid_rating':
    case 'comment_or_rating_required':
    case 'comment_forbidden':
    case 'comment_not_found':
    case 'device_not_found':
    case 'auth_service_unavailable':
      return rawCode
    default:
      if (status === 401) {
        return 'not_authenticated'
      }
      if (status === 403) {
        return 'comment_forbidden'
      }
      if (status === 404) {
        return 'comment_not_found'
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

async function readJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw new CommunityApiError('Invalid community API response', response.status, 'invalid_response')
  }
}

async function readCommunityResponse<T>(response: Response): Promise<T> {
  const payload = await readJsonResponse(response)

  if (!response.ok) {
    const errorPayload = isRecord(payload) ? (payload as CommunityErrorResponse) : {}
    const code = parseErrorCode(response.status, errorPayload)
    const message = typeof errorPayload.message === 'string'
      ? errorPayload.message
      : typeof errorPayload.error === 'string'
        ? errorPayload.error
        : `Community request failed: ${response.status}`

    throw new CommunityApiError(message, response.status, code)
  }

  if (!isRecord(payload) || payload.success !== true) {
    throw new CommunityApiError('Unexpected community API payload', response.status, 'invalid_response')
  }

  return (payload as CommunitySuccessResponse<T>).data as T
}

function normalizeRating(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function normalizeAvatarFromRawComment(raw: RawDeviceComment): string | null {
  return raw.USER_AVATAR_URL || raw.USER_AVATAR || raw.AVATAR_URL || raw.AVATAR || raw.CLOUD_USER_AVATAR || null
}

function normalizeAvatarFromCreatedComment(raw: RawCreatedDeviceComment): string | null {
  return raw.avatar_url || raw.user_avatar_url || raw.user_avatar || null
}

function toNormalizedComment(raw: RawDeviceComment): NormalizedDeviceComment {
  return {
    ...raw,
    id: Number(raw.ID),
    deviceId: Number(raw.DEVICE_ID),
    cloudUserId: String(raw.CLOUD_USER_ID),
    rating: normalizeRating(raw.RATING),
    avatarUrl: normalizeAvatarFromRawComment(raw),
  }
}

function toCreatedOrUpdatedComment(raw: RawCreatedDeviceComment): CreatedOrUpdatedComment {
  return {
    id: raw.id,
    deviceId: raw.device_id,
    cloudUserId: raw.cloud_user_id === undefined ? '' : String(raw.cloud_user_id),
    userEmail: raw.user_email,
    userName: raw.user_name,
    avatarUrl: normalizeAvatarFromCreatedComment(raw),
    comment: raw.comment,
    rating: normalizeRating(raw.rating),
    status: raw.status,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at || raw.created_at,
  }
}

export async function getDeviceComments(deviceId: number): Promise<NormalizedDeviceComment[]> {
  const response = await fetch(
    `${COMMUNITY_API_ORIGIN}/api/community/comments?device_id=${encodeURIComponent(String(deviceId))}`,
    { credentials: 'include' },
  )

  const data = await readCommunityResponse<RawDeviceComment[]>(response)

  if (!Array.isArray(data)) {
    throw new CommunityApiError('Unexpected comments payload', response.status, 'invalid_response')
  }

  return data.map(toNormalizedComment)
}

export async function createDeviceComment(
  deviceId: number,
  comment: string,
  rating: number | null,
): Promise<CreatedOrUpdatedComment> {
  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/comments`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      device_id: deviceId,
      comment,
      rating,
    }),
  })

  const data = await readCommunityResponse<RawCreatedDeviceComment>(response)

  if (!isRecord(data) || typeof data.id !== 'number') {
    throw new CommunityApiError('Unexpected created comment payload', response.status, 'invalid_response')
  }

  return toCreatedOrUpdatedComment(data)
}

export async function updateDeviceComment(
  commentId: number,
  comment: string,
  rating: number | null,
): Promise<CreatedOrUpdatedComment> {
  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/comments/update`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      comment_id: commentId,
      comment,
      rating,
    }),
  })

  const data = await readCommunityResponse<RawCreatedDeviceComment>(response)

  if (!isRecord(data) || typeof data.id !== 'number') {
    throw new CommunityApiError('Unexpected updated comment payload', response.status, 'invalid_response')
  }

  return toCreatedOrUpdatedComment(data)
}

export async function deleteDeviceComment(commentId: number): Promise<void> {
  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/comments/delete`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment_id: commentId }),
  })

  await readCommunityResponse<unknown>(response)
}

export async function createDeviceRequest(payload: DeviceRequestPayload): Promise<CreatedDeviceRequest> {
  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/requests`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
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

  if (!isRecord(data) || typeof data.id !== 'number' || typeof data.cid !== 'number' || typeof data.status !== 'string') {
    throw new CommunityApiError('Unexpected created request payload', response.status, 'invalid_response')
  }

  return { id: data.id, cid: data.cid, status: data.status }
}
