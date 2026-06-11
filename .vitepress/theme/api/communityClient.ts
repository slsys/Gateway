const COMMUNITY_API_ORIGIN = 'https://api.slsys.io'

export type CommentVote = 'like' | 'dislike'

export type CommunityCommentImage = {
  id: number
  url: string | null
  mime_type: string | null
  size_bytes: number
  sort_order: number
  created_at: string | null
}

export type CommunityCommentAuthor = {
  id: string
  display_name: string
  email: string | null
  avatar_url: string | null
} | null

export type CommunityComment = {
  id: number
  device_id: number
  parent_id: number | null
  body: string
  rating: number | null
  status: string
  created_at: string | null
  updated_at: string | null
  images: CommunityCommentImage[]
  likes_count: number
  dislikes_count: number
  my_vote: CommentVote | null
  author: CommunityCommentAuthor
}

export interface DeviceCommentMutationInput {
  deviceId: number
  body?: string
  rating?: number | null
  parentId?: number | null
  images?: File[]
}

export interface DeviceCommentUpdateInput {
  commentId: number
  body?: string
  rating?: number | null
  images?: File[]
}

export interface VoteCommentResult {
  comment_id: number
  likes_count: number
  dislikes_count: number
  my_vote: CommentVote | null
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

export interface CreatedDeviceRequest {
  id: number
  cid: number
  status: string
}

export type CommunityErrorCode =
  | 'not_authenticated'
  | 'invalid_device_id'
  | 'invalid_parent_comment'
  | 'reply_device_mismatch'
  | 'reply_depth_not_allowed'
  | 'invalid_comment'
  | 'invalid_rating'
  | 'comment_or_rating_required'
  | 'invalid_vote'
  | 'unsupported_image_type'
  | 'image_too_large'
  | 'too_many_images'
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

interface RawCreatedDeviceRequest {
  id: number
  cid: number
  status: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function toVote(value: unknown): CommentVote | null {
  return value === 'like' || value === 'dislike' ? value : null
}

function extractErrorCode(payload: CommunityErrorResponse): string {
  const candidates = [payload.code, payload.error, payload.message]
  const knownCodes = [
    'not_authenticated',
    'invalid_device_id',
    'invalid_parent_comment',
    'reply_device_mismatch',
    'reply_depth_not_allowed',
    'invalid_comment',
    'invalid_rating',
    'comment_or_rating_required',
    'invalid_vote',
    'unsupported_image_type',
    'image_too_large',
    'too_many_images',
    'comment_forbidden',
    'comment_not_found',
    'device_not_found',
    'auth_service_unavailable',
  ]

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') {
      continue
    }

    const normalized = candidate.trim().toLowerCase()
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
    case 'invalid_parent_comment':
    case 'reply_device_mismatch':
    case 'reply_depth_not_allowed':
    case 'invalid_comment':
    case 'invalid_rating':
    case 'comment_or_rating_required':
    case 'invalid_vote':
    case 'unsupported_image_type':
    case 'image_too_large':
    case 'too_many_images':
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

function normalizeCommentImage(raw: unknown): CommunityCommentImage {
  if (!isRecord(raw)) {
    throw new CommunityApiError('Unexpected comment image payload', 200, 'invalid_response')
  }

  const id = toNumber(raw.id)
  const sizeBytes = toNumber(raw.size_bytes)
  const sortOrder = toNumber(raw.sort_order)

  if (id === null || sizeBytes === null || sortOrder === null) {
    throw new CommunityApiError('Unexpected comment image payload', 200, 'invalid_response')
  }

  return {
    id,
    url: typeof raw.url === 'string' || raw.url === null ? raw.url : null,
    mime_type: toNullableString(raw.mime_type),
    size_bytes: sizeBytes,
    sort_order: sortOrder,
    created_at: toNullableString(raw.created_at),
  }
}

function normalizeCommentAuthor(raw: unknown): CommunityCommentAuthor {
  if (raw === null) {
    return null
  }

  if (!isRecord(raw) || typeof raw.id !== 'string' || typeof raw.display_name !== 'string') {
    throw new CommunityApiError('Unexpected comment author payload', 200, 'invalid_response')
  }

  return {
    id: raw.id,
    display_name: raw.display_name,
    email: toNullableString(raw.email),
    avatar_url: toNullableString(raw.avatar_url),
  }
}

function normalizeComment(raw: unknown): CommunityComment {
  if (!isRecord(raw)) {
    throw new CommunityApiError('Unexpected comments payload', 200, 'invalid_response')
  }

  const id = toNumber(raw.id)
  const deviceId = toNumber(raw.device_id)
  const likesCount = toNumber(raw.likes_count)
  const dislikesCount = toNumber(raw.dislikes_count)

  if (
    id === null
    || deviceId === null
    || likesCount === null
    || dislikesCount === null
    || typeof raw.body !== 'string'
    || typeof raw.status !== 'string'
  ) {
    throw new CommunityApiError('Unexpected comments payload', 200, 'invalid_response')
  }

  const images = Array.isArray(raw.images)
    ? raw.images.map(normalizeCommentImage).sort((left, right) => left.sort_order - right.sort_order)
    : []

  return {
    id,
    device_id: deviceId,
    parent_id: toNumber(raw.parent_id),
    body: raw.body,
    rating: toNumber(raw.rating),
    status: raw.status,
    created_at: toNullableString(raw.created_at),
    updated_at: toNullableString(raw.updated_at),
    images,
    likes_count: likesCount,
    dislikes_count: dislikesCount,
    my_vote: toVote(raw.my_vote),
    author: normalizeCommentAuthor(raw.author ?? null),
  }
}

function appendCommentMutation(formData: FormData, input: DeviceCommentMutationInput | DeviceCommentUpdateInput) {
  if ('deviceId' in input) {
    formData.append('device_id', String(input.deviceId))
  } else {
    formData.append('comment_id', String(input.commentId))
  }

  if (typeof input.body === 'string' && input.body.trim() !== '') {
    formData.append('body', input.body.trim())
  }

  if (typeof input.rating === 'number') {
    formData.append('rating', String(input.rating))
  }

  if ('parentId' in input && input.parentId !== null && input.parentId !== undefined) {
    formData.append('parent_id', String(input.parentId))
  }

  if (Array.isArray(input.images) && input.images.length > 0) {
    input.images.forEach((image) => {
      formData.append('images[]', image)
    })
  }
}

function normalizeVoteResult(raw: unknown, status: number): VoteCommentResult {
  if (!isRecord(raw)) {
    throw new CommunityApiError('Unexpected vote payload', status, 'invalid_response')
  }

  const commentId = toNumber(raw.comment_id)
  const likesCount = toNumber(raw.likes_count)
  const dislikesCount = toNumber(raw.dislikes_count)

  if (commentId === null || likesCount === null || dislikesCount === null) {
    throw new CommunityApiError('Unexpected vote payload', status, 'invalid_response')
  }

  return {
    comment_id: commentId,
    likes_count: likesCount,
    dislikes_count: dislikesCount,
    my_vote: toVote(raw.my_vote),
  }
}

export function resolveCommunityAssetUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  if (!url.startsWith('/')) {
    return `${COMMUNITY_API_ORIGIN}/${url}`
  }

  return `${COMMUNITY_API_ORIGIN}${url}`
}

export async function getDeviceComments(deviceId: number): Promise<CommunityComment[]> {
  const response = await fetch(
    `${COMMUNITY_API_ORIGIN}/api/community/comments?device_id=${encodeURIComponent(String(deviceId))}`,
    { credentials: 'include' },
  )

  const data = await readCommunityResponse<unknown[]>(response)

  if (!Array.isArray(data)) {
    throw new CommunityApiError('Unexpected comments payload', response.status, 'invalid_response')
  }

  return data.map(normalizeComment)
}

export async function createDeviceComment(input: DeviceCommentMutationInput): Promise<CommunityComment> {
  const formData = new FormData()
  appendCommentMutation(formData, input)

  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/comments`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  const data = await readCommunityResponse<unknown>(response)
  return normalizeComment(data)
}

export async function updateDeviceComment(input: DeviceCommentUpdateInput): Promise<CommunityComment> {
  const formData = new FormData()
  appendCommentMutation(formData, input)

  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/comments/update`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  const data = await readCommunityResponse<unknown>(response)
  return normalizeComment(data)
}

export async function deleteDeviceComment(commentId: number): Promise<{ id: number; status: string }> {
  const formData = new FormData()
  formData.append('comment_id', String(commentId))

  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/comments/delete`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  const data = await readCommunityResponse<unknown>(response)

  if (!isRecord(data)) {
    throw new CommunityApiError('Unexpected delete payload', response.status, 'invalid_response')
  }

  const id = toNumber(data.id)
  if (id === null || typeof data.status !== 'string') {
    throw new CommunityApiError('Unexpected delete payload', response.status, 'invalid_response')
  }

  return { id, status: data.status }
}

export async function voteComment(commentId: number, vote: CommentVote): Promise<VoteCommentResult> {
  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/comments/${commentId}/vote`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vote }),
  })

  const data = await readCommunityResponse<unknown>(response)
  return normalizeVoteResult(data, response.status)
}

export async function removeCommentVote(commentId: number): Promise<VoteCommentResult> {
  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/comments/${commentId}/vote`, {
    method: 'DELETE',
    credentials: 'include',
  })

  const data = await readCommunityResponse<unknown>(response)
  return normalizeVoteResult(data, response.status)
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
