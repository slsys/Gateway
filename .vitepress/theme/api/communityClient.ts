const COMMUNITY_API_ORIGIN = 'https://api.slsys.io'

export type CommentVote = 'like' | 'dislike'

export interface CommentImage {
  id: number
  public_url: string
  mime_type: string
  size_bytes: number
  sort_order: number
}

export interface DeviceComment {
  id: number
  device_id: number
  parent_id: number | null
  cloud_user_id?: string | number | null
  user_name: string
  comment: string
  rating: number | null
  status: string
  created_at: string
  updated_at: string
  images: CommentImage[]
  likes_count: number
  dislikes_count: number
  my_vote: CommentVote | null
  avatarUrl: string | null
}

export interface DeviceCommentMutationInput {
  deviceId: number
  comment?: string
  rating?: number | null
  parentId?: number | null
  images?: File[]
}

export interface DeviceCommentUpdateInput {
  commentId: number
  comment?: string
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

interface RawCommentImage {
  id?: number | string
  public_url?: string
  mime_type?: string
  size_bytes?: number | string
  sort_order?: number | string
}

interface RawNewDeviceComment {
  id?: number | string
  device_id?: number | string
  parent_id?: number | string | null
  cloud_user_id?: string | number | null
  CLOUD_USER_ID?: string | number | null
  user_name?: string | null
  USER_NAME?: string | null
  comment?: string | null
  COMMENT?: string | null
  rating?: number | string | null
  RATING?: number | string | null
  status?: string
  STATUS?: string
  created_at?: string
  CREATED_AT?: string
  updated_at?: string
  UPDATED_AT?: string
  images?: RawCommentImage[]
  IMAGES?: RawCommentImage[]
  likes_count?: number | string
  LIKES_COUNT?: number | string
  dislikes_count?: number | string
  DISLIKES_COUNT?: number | string
  my_vote?: string | null
  MY_VOTE?: string | null
  avatar_url?: string
  user_avatar?: string
  user_avatar_url?: string
  avatar?: string
  photo_url?: string
}

interface RawLegacyDeviceComment {
  ID: string
  DEVICE_ID: string
  CLOUD_USER_ID?: string
  USER_EMAIL?: string
  USER_NAME: string | null
  USER_AVATAR?: string
  USER_AVATAR_URL?: string
  AVATAR_URL?: string
  AVATAR?: string
  CLOUD_USER_AVATAR?: string
  COMMENT: string
  RATING: string | null
  STATUS: string
  CREATED_AT: string
  UPDATED_AT: string
}

interface RawCreatedDeviceRequest {
  id: number
  cid: number
  status: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
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

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function toVote(value: unknown): CommentVote | null {
  return value === 'like' || value === 'dislike' ? value : null
}

function pickAvatarUrl(raw: Record<string, unknown>): string | null {
  const candidates = [
    raw.avatar_url,
    raw.user_avatar_url,
    raw.user_avatar,
    raw.user_photo_url,
    raw.user_picture_url,
    raw.avatar_path,
    raw.avatar,
    raw.photo_url,
    raw.picture_url,
    raw.USER_AVATAR_URL,
    raw.USER_AVATAR,
    raw.USER_PHOTO_URL,
    raw.USER_PICTURE_URL,
    raw.AVATAR_PATH,
    raw.AVATAR_URL,
    raw.AVATAR,
    raw.CLOUD_USER_AVATAR,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      return candidate
    }
  }

  return null
}

function normalizeCommentImage(raw: unknown): CommentImage | null {
  if (!isRecord(raw) || typeof raw.public_url !== 'string') {
    return null
  }

  const id = toNumber(raw.id) ?? 0
  const sizeBytes = toNumber(raw.size_bytes) ?? 0
  const sortOrder = toNumber(raw.sort_order) ?? 0

  return {
    id,
    public_url: raw.public_url,
    mime_type: typeof raw.mime_type === 'string' ? raw.mime_type : '',
    size_bytes: sizeBytes,
    sort_order: sortOrder,
  }
}

function normalizeImages(rawImages: unknown): CommentImage[] {
  if (!Array.isArray(rawImages)) {
    return []
  }

  return rawImages
    .map(normalizeCommentImage)
    .filter((image): image is CommentImage => image !== null)
    .sort((left, right) => left.sort_order - right.sort_order)
}

function normalizeLegacyComment(raw: RawLegacyDeviceComment): DeviceComment {
  return {
    id: Number(raw.ID),
    device_id: Number(raw.DEVICE_ID),
    parent_id: null,
    cloud_user_id: raw.CLOUD_USER_ID ?? null,
    user_name: raw.USER_NAME || 'User',
    comment: raw.COMMENT || '',
    rating: toNumber(raw.RATING),
    status: raw.STATUS,
    created_at: raw.CREATED_AT,
    updated_at: raw.UPDATED_AT,
    images: [],
    likes_count: 0,
    dislikes_count: 0,
    my_vote: null,
    avatarUrl: pickAvatarUrl(raw),
  }
}

function normalizeNewComment(raw: RawNewDeviceComment): DeviceComment {
  const id = toNumber(raw.id)
  const deviceId = toNumber(raw.device_id)

  if (id === null || deviceId === null) {
    throw new CommunityApiError('Unexpected comments payload', 200, 'invalid_response')
  }

  return {
    id,
    device_id: deviceId,
    parent_id: toNumber(raw.parent_id),
    cloud_user_id: raw.cloud_user_id ?? raw.CLOUD_USER_ID ?? null,
    user_name: typeof raw.user_name === 'string' && raw.user_name.trim() !== ''
      ? raw.user_name
      : typeof raw.USER_NAME === 'string' && raw.USER_NAME.trim() !== ''
        ? raw.USER_NAME
        : 'User',
    comment: typeof raw.comment === 'string' ? raw.comment : typeof raw.COMMENT === 'string' ? raw.COMMENT : '',
    rating: toNumber(raw.rating ?? raw.RATING),
    status: typeof raw.status === 'string' ? raw.status : typeof raw.STATUS === 'string' ? raw.STATUS : 'Published',
    created_at: typeof raw.created_at === 'string' ? raw.created_at : typeof raw.CREATED_AT === 'string' ? raw.CREATED_AT : '',
    updated_at: typeof raw.updated_at === 'string'
      ? raw.updated_at
      : typeof raw.UPDATED_AT === 'string'
        ? raw.UPDATED_AT
        : typeof raw.created_at === 'string'
          ? raw.created_at
          : typeof raw.CREATED_AT === 'string'
            ? raw.CREATED_AT
            : '',
    images: normalizeImages(raw.images ?? raw.IMAGES),
    likes_count: toNumber(raw.likes_count ?? raw.LIKES_COUNT) ?? 0,
    dislikes_count: toNumber(raw.dislikes_count ?? raw.DISLIKES_COUNT) ?? 0,
    my_vote: toVote(raw.my_vote ?? raw.MY_VOTE),
    avatarUrl: pickAvatarUrl(raw),
  }
}

function normalizeDeviceComment(raw: unknown): DeviceComment {
  if (!isRecord(raw)) {
    throw new CommunityApiError('Unexpected comments payload', 200, 'invalid_response')
  }

  if ('id' in raw || 'device_id' in raw) {
    return normalizeNewComment(raw as RawNewDeviceComment)
  }

  if ('ID' in raw && 'DEVICE_ID' in raw) {
    return normalizeLegacyComment(raw as RawLegacyDeviceComment)
  }

  throw new CommunityApiError('Unexpected comments payload', 200, 'invalid_response')
}

function appendCommentMutation(formData: FormData, input: DeviceCommentMutationInput | DeviceCommentUpdateInput) {
  if ('deviceId' in input) {
    formData.append('device_id', String(input.deviceId))
  } else {
    formData.append('comment_id', String(input.commentId))
  }

  if (typeof input.comment === 'string' && input.comment.trim() !== '') {
    formData.append('comment', input.comment.trim())
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

export function resolveCommunityAssetUrl(publicUrl: string): string {
  if (/^https?:\/\//i.test(publicUrl)) {
    return publicUrl
  }

  if (!publicUrl.startsWith('/')) {
    return `${COMMUNITY_API_ORIGIN}/${publicUrl}`
  }

  return `${COMMUNITY_API_ORIGIN}${publicUrl}`
}

export async function getDeviceComments(deviceId: number): Promise<DeviceComment[]> {
  const response = await fetch(
    `${COMMUNITY_API_ORIGIN}/api/community/comments?device_id=${encodeURIComponent(String(deviceId))}`,
    { credentials: 'include' },
  )

  const data = await readCommunityResponse<unknown[]>(response)

  if (!Array.isArray(data)) {
    throw new CommunityApiError('Unexpected comments payload', response.status, 'invalid_response')
  }

  return data.map(normalizeDeviceComment)
}

export async function createDeviceComment(input: DeviceCommentMutationInput): Promise<unknown> {
  const formData = new FormData()
  appendCommentMutation(formData, input)

  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/comments`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  return readCommunityResponse<unknown>(response)
}

export async function updateDeviceComment(input: DeviceCommentUpdateInput): Promise<unknown> {
  const formData = new FormData()
  appendCommentMutation(formData, input)

  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/comments/update`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  return readCommunityResponse<unknown>(response)
}

export async function deleteDeviceComment(commentId: number): Promise<unknown> {
  const formData = new FormData()
  formData.append('comment_id', String(commentId))

  const response = await fetch(`${COMMUNITY_API_ORIGIN}/api/community/comments/delete`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  return readCommunityResponse<unknown>(response)
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
