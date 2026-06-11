<template>
  <section class="device-access-panel" aria-live="polite">
    <div class="device-access-panel__header">
      <h3 class="device-access-panel__title">
        <span>{{ t('commentsTitle') }}</span>
        <span class="device-access-panel__count-badge">{{ comments.length }}</span>
      </h3>
      <button
        v-if="commentsError && !commentsLoading"
        type="button"
        class="device-access-panel__retry"
        @click="refreshComments"
      >
        {{ t('commentsRetry') }}
      </button>
    </div>

    <div v-if="aggregateSummary" class="device-access-panel__aggregate">
      <span v-if="aggregateSummary.ratingAvg !== null" class="device-access-panel__aggregate-rating">
        {{ formatStarsLabel(aggregateSummary.ratingAvg) }}
      </span>
      <span v-if="aggregateSummary.ratingsLabel" class="device-access-panel__aggregate-meta">{{ aggregateSummary.ratingsLabel }}</span>
      <span class="device-access-panel__aggregate-meta">{{ aggregateSummary.commentsLabel }}</span>
    </div>

    <div v-if="commentsLoading" class="device-access-panel__empty">{{ t('commentsLoading') }}</div>
    <p v-else-if="commentsError" class="device-access-panel__technical-error">{{ t('commentsLoadFailed') }}</p>
    <div v-else-if="flatItems.length" class="device-comment-list">
      <template v-for="item in flatItems" :key="item.comment.id">
        <article class="device-comment-card" :class="{ 'device-comment-card--own': canManageComment(item.comment) }" :style="{ '--comment-depth': String(item.depth) }">
          <div class="device-comment-card__avatar">
            <img
              v-if="getAvatarSource(item.comment)"
              :src="resolveAvatarUrl(getAvatarSource(item.comment) || '')"
              :alt="getAuthorName(item.comment)"
              loading="lazy"
              @error="markAvatarBroken(getAvatarSource(item.comment) || '')"
            />
            <span v-else :style="getAvatarFallbackStyle(getAuthorName(item.comment))">
              {{ getUserInitials(getAuthorName(item.comment)) }}
            </span>
          </div>

          <div class="device-comment-card__body">
            <div class="device-comment-card__meta">
              <div class="device-comment-card__author-line">
                <strong>{{ getAuthorName(item.comment) }}</strong>
                <span v-if="canManageComment(item.comment)" class="device-comment-card__author-badge">{{ t('commentOwnBadge') }}</span>
                <span v-if="item.comment.rating !== null" class="device-comment-card__rating-inline">{{ renderStars(item.comment.rating) }}</span>
              </div>
              <span class="device-comment-card__time">{{ formatCommentDate(item.comment.updated_at || item.comment.created_at) }}</span>
            </div>

            <template v-if="editingCommentId === item.comment.id">
              <div class="device-comment-edit device-comment-form">
                <div v-if="item.comment.parent_id === null" class="device-rating-editor">
                  <button
                    v-for="value in 5"
                    :key="`edit-rating-${item.comment.id}-${value}`"
                    type="button"
                    class="device-rating-star"
                    :class="{ active: (editDraftRating || 0) >= value }"
                    @click="setEditRating(value)"
                  >
                    ★
                  </button>
                  <button type="button" class="device-rating-clear" @click="setEditRating(null)">
                    {{ t('commentRatingClear') }}
                  </button>
                </div>

                <textarea
                  v-model="editDraftBody"
                  class="device-comment-form__input"
                  :maxlength="commentMaxLength"
                  rows="4"
                ></textarea>

                <p class="device-comment-form__replacement-hint">{{ t('commentImagesReplaceHint') }}</p>
                <input
                  :key="editFileInputKey"
                  class="device-comment-form__file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  @change="onEditFilesChange"
                />

                <div v-if="editingComment?.images.length && !editPreviews.length" class="device-comment-gallery device-comment-gallery--current">
                  <a
                    v-for="image in editingComment.images"
                    :key="`existing-edit-${image.id}`"
                    :href="resolveImageUrl(image) || undefined"
                    class="device-comment-gallery__item"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img v-if="resolveImageUrl(image)" :src="resolveImageUrl(image) || ''" :alt="t('commentImageAlt')" loading="lazy" />
                  </a>
                </div>

                <div v-if="editPreviews.length" class="device-comment-gallery device-comment-gallery--preview">
                  <div v-for="preview in editPreviews" :key="preview.url" class="device-comment-gallery__item">
                    <img :src="preview.url" :alt="preview.name" />
                  </div>
                </div>

                <div class="device-comment-form__footer">
                  <div class="device-comment-form__meta-panel">
                    <p class="device-comment-form__counter">{{ editDraftLength }}/{{ commentMaxLength }}</p>
                  </div>
                  <div class="device-comment-actions">
                    <button type="button" class="device-access-panel__secondary" @click="cancelEdit">{{ t('commentCancel') }}</button>
                    <button
                      type="button"
                      class="device-access-panel__primary"
                      :disabled="commentSubmitting || !canSubmitEdit"
                      @click="saveEdit(item.comment.id)"
                    >
                      {{ commentSubmitting ? t('commentSaving') : t('commentSave') }}
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <p v-if="item.comment.body.trim()" class="device-comment-card__text">{{ item.comment.body }}</p>

              <div v-if="item.comment.images.length" class="device-comment-gallery">
                <a
                  v-for="image in item.comment.images"
                  :key="`image-${item.comment.id}-${image.id}`"
                  :href="resolveImageUrl(image) || undefined"
                  class="device-comment-gallery__item"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img v-if="resolveImageUrl(image)" :src="resolveImageUrl(image) || ''" :alt="t('commentImageAlt')" loading="lazy" />
                </a>
              </div>

              <div class="device-comment-actions-row">
                <button
                  v-if="status === 'authenticated'"
                  type="button"
                  class="device-comment-link"
                  @click="toggleReplyForm(item.comment.id)"
                >
                  {{ activeReplyAnchorId === item.comment.id ? t('commentCancel') : t('commentReply') }}
                </button>

                <div v-if="canManageComment(item.comment)" class="device-comment-actions device-comment-actions--inline">
                  <button type="button" class="device-comment-link" @click="startEdit(item.comment)">{{ t('commentEdit') }}</button>
                  <button
                    type="button"
                    class="device-comment-link device-comment-link--danger"
                    :disabled="deletingCommentId === item.comment.id"
                    @click="removeComment(item.comment)"
                  >
                    {{ deletingCommentId === item.comment.id ? t('commentDeleting') : t('commentDelete') }}
                  </button>
                </div>

                <div class="device-comment-votes">
                  <button
                    type="button"
                    class="device-comment-vote device-comment-vote--like"
                    :class="{ active: item.comment.my_vote === 'like' }"
                    :disabled="!canVote || isVotePending(item.comment.id)"
                    @click="toggleVote(item.comment, 'like')"
                  >
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/></svg>
                    <span>{{ item.comment.likes_count }}</span>
                  </button>
                  <button
                    type="button"
                    class="device-comment-vote device-comment-vote--dislike"
                    :class="{ active: item.comment.my_vote === 'dislike' }"
                    :disabled="!canVote || isVotePending(item.comment.id)"
                    @click="toggleVote(item.comment, 'dislike')"
                  >
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/></svg>
                    <span>{{ item.comment.dislikes_count }}</span>
                  </button>
                </div>
              </div>
            </template>
          </div>
        </article>

        <form
          v-if="status === 'authenticated' && activeReplyAnchorId === item.comment.id"
          class="device-reply-form"
          :style="{ '--comment-depth': String(item.depth + 1) }"
          @submit.prevent="submitReply"
        >
          <textarea
            v-model="replyDraft"
            class="device-comment-form__input"
            :placeholder="t('commentReplyPlaceholder')"
            :maxlength="commentMaxLength"
            :disabled="replySubmitting"
            rows="3"
          ></textarea>
          <input
            :key="replyFileInputKey"
            class="device-comment-form__file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            @change="onReplyFilesChange"
          />
          <div v-if="replyPreviews.length" class="device-comment-gallery device-comment-gallery--preview">
            <div v-for="preview in replyPreviews" :key="preview.url" class="device-comment-gallery__item">
              <img :src="preview.url" :alt="preview.name" />
            </div>
          </div>
          <div class="device-comment-form__footer">
            <div class="device-comment-form__meta-panel">
              <p class="device-comment-form__counter">{{ replyDraft.length }}/{{ commentMaxLength }}</p>
            </div>
            <div class="device-comment-actions">
              <button type="button" class="device-access-panel__secondary" @click="cancelReplyForm">{{ t('commentCancel') }}</button>
              <button type="submit" class="device-access-panel__primary" :disabled="replySubmitting || !canSubmitReply">
                {{ replySubmitting ? t('commentSubmitting') : t('commentReplySubmit') }}
              </button>
            </div>
          </div>
        </form>
      </template>
    </div>
    <p v-else class="device-access-panel__empty">{{ t('commentsEmpty') }}</p>

    <form
      v-if="status === 'authenticated' && activeReplyAnchorId === null && editingCommentId === null"
      class="device-comment-form"
      @submit.prevent="submitComment"
    >
      <label class="device-comment-form__label" for="device-comment-message">{{ t('commentFormLabel') }}</label>
      <textarea
        id="device-comment-message"
        v-model="commentDraft"
        class="device-comment-form__input"
        :placeholder="t('commentFormPlaceholder')"
        :disabled="commentSubmitting"
        :maxlength="commentMaxLength"
        rows="4"
      ></textarea>
      <input
        :key="createFileInputKey"
        class="device-comment-form__file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        @change="onCreateFilesChange"
      />
      <div v-if="commentPreviews.length" class="device-comment-gallery device-comment-gallery--preview">
        <div v-for="preview in commentPreviews" :key="preview.url" class="device-comment-gallery__item">
          <img :src="preview.url" :alt="preview.name" />
        </div>
      </div>
      <div class="device-comment-form__footer">
        <div class="device-comment-form__meta-panel">
          <p class="device-comment-form__counter">{{ commentDraftLength }}/{{ commentMaxLength }}</p>
          <div class="device-comment-form__rating-row">
            <span class="device-comment-form__rating-label">{{ t('commentRatingLabel') }}</span>
            <div class="device-rating-editor">
              <button
                v-for="value in 5"
                :key="`create-rating-${value}`"
                type="button"
                class="device-rating-star"
                :class="{ active: (commentRating || 0) >= value }"
                @click="setCreateRating(value)"
              >
                ★
              </button>
              <button type="button" class="device-rating-clear" @click="setCreateRating(null)">{{ t('commentRatingClear') }}</button>
            </div>
          </div>
        </div>
        <button type="submit" class="device-access-panel__primary" :disabled="commentSubmitting || !canSubmitComment">
          {{ commentSubmitting ? t('commentSubmitting') : t('commentSubmit') }}
        </button>
      </div>
    </form>

    <p v-if="status === 'guest'" class="device-access-panel__guest-note">
      <a href="https://cloud.slsys.io/login" target="_blank" rel="noopener noreferrer">{{ t('commentGuestCta') }}</a>
    </p>
    <p v-if="status === 'auth_error' || status === 'network_error'" class="device-access-panel__technical-error">{{ t('commentAuthCheckFailed') }}</p>
    <p v-if="actionMessage" class="device-access-panel__message">{{ actionMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  CommunityApiError,
  createDeviceComment,
  deleteDeviceComment,
  getDeviceComments,
  removeCommentVote,
  resolveCommunityAssetUrl,
  updateDeviceComment,
  voteComment,
  type CommentVote,
  type CommunityComment,
  type CommunityCommentImage,
} from '../../.vitepress/theme/api/communityClient'
import { useCloudAuth } from '../../.vitepress/theme/composables/useCloudAuth'
import { buildCommentThreads, type CommunityCommentThreadNode } from './helpers/buildCommentThreads'

interface PreviewImage {
  name: string
  url: string
}

interface FlatThreadItem {
  comment: CommunityComment
  depth: number
}

const props = defineProps<{
  deviceId: number | null
  commentsCount?: number | null
  ratingAvg?: number | null
  t: (key: string) => string
}>()

const emit = defineEmits<{
  aggregatesChange: [{ commentsCount: number; ratingAvg: number | null; ratingsCount: number }]
}>()

const { status, user } = useCloudAuth()
const comments = ref<CommunityComment[]>([])
const commentsLoading = ref(false)
const commentsError = ref(false)
const commentSubmitting = ref(false)
const deletingCommentId = ref<number | null>(null)
const commentDraft = ref('')
const commentRating = ref<number | null>(null)
const commentFiles = ref<File[]>([])
const commentPreviews = ref<PreviewImage[]>([])
const createFileInputKey = ref(0)
const activeReplyAnchorId = ref<number | null>(null)
const activeReplyParentId = ref<number | null>(null)
const replyDraft = ref('')
const replyFiles = ref<File[]>([])
const replyPreviews = ref<PreviewImage[]>([])
const replyFileInputKey = ref(0)
const replySubmitting = ref(false)
const editDraftBody = ref('')
const editDraftRating = ref<number | null>(null)
const editFiles = ref<File[]>([])
const editPreviews = ref<PreviewImage[]>([])
const editFileInputKey = ref(0)
const editingCommentId = ref<number | null>(null)
const votePendingIds = ref<number[]>([])
const brokenAvatarUrls = ref<string[]>([])
const actionMessage = ref('')
const commentMaxLength = 2000
const maxImagesPerComment = 5
const maxImageSizeBytes = 5 * 1024 * 1024
const allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/webp']

const normalizedDeviceId = computed(() => props.deviceId)
const commentDraftLength = computed(() => commentDraft.value.length)
const editDraftLength = computed(() => editDraftBody.value.length)
const canVote = computed(() => status.value === 'authenticated')
const threads = computed(() => buildCommentThreads(comments.value))
const flatItems = computed<FlatThreadItem[]>(() => flattenThreads(threads.value))
const editingComment = computed(() => comments.value.find((comment) => comment.id === editingCommentId.value) ?? null)
const canSubmitComment = computed(() => hasPayload(commentDraft.value, commentRating.value, commentFiles.value.length))
const canSubmitReply = computed(() => hasPayload(replyDraft.value, null, replyFiles.value.length))
const canSubmitEdit = computed(() => {
  const currentImagesCount = editingComment.value?.images.length ?? 0
  return hasPayload(editDraftBody.value, editDraftRating.value, editFiles.value.length || currentImagesCount)
    && editingCommentId.value !== null
})

const aggregateSummary = computed(() => {
  const commentsCount = comments.value.length || props.commentsCount || 0
  const ratedComments = comments.value.filter((comment) => comment.rating !== null)
  const ratingAvg = ratedComments.length
    ? Number((ratedComments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / ratedComments.length).toFixed(1))
    : props.ratingAvg ?? null

  if (commentsCount === 0 && ratingAvg === null) {
    return null
  }

  return {
    ratingAvg,
    ratingsLabel: ratedComments.length ? `${ratedComments.length} ${pluralizeRatings(ratedComments.length)}` : '',
    commentsLabel: `${commentsCount} ${pluralizeComments(commentsCount)}`,
  }
})

function flattenThreads(nodes: CommunityCommentThreadNode[], depth = 0): FlatThreadItem[] {
  const items: FlatThreadItem[] = []

  for (const node of nodes) {
    items.push({ comment: node.comment, depth })
    items.push(...flattenThreads(node.replies, depth + 1))
  }

  return items
}

function pluralizeComments(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) return props.t('commentsCountOne')
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return props.t('commentsCountFew')
  return props.t('commentsCountMany')
}

function pluralizeRatings(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) return props.t('ratingsCountOne')
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return props.t('ratingsCountFew')
  return props.t('ratingsCountMany')
}

function normalizeRatingInput(rating: number | null) {
  return rating === null ? null : Math.min(5, Math.max(1, rating))
}

function hasPayload(body: string, rating: number | null, imagesCount: number) {
  const trimmed = body.trim()
  const normalizedRating = normalizeRatingInput(rating)
  return (trimmed.length > 0 || normalizedRating !== null || imagesCount > 0) && trimmed.length <= commentMaxLength
}

function mapCommentError(err: unknown): string {
  if (err instanceof CommunityApiError) {
    switch (err.code) {
      case 'not_authenticated': return props.t('communityAuthRequired')
      case 'invalid_device_id': return props.t('communityInvalidDeviceId')
      case 'invalid_parent_comment': return props.t('communityInvalidParentComment')
      case 'reply_device_mismatch': return props.t('communityReplyDeviceMismatch')
      case 'reply_depth_not_allowed': return props.t('communityReplyDepthNotAllowed')
      case 'invalid_rating': return props.t('communityInvalidRating')
      case 'invalid_vote': return props.t('communityInvalidVote')
      case 'unsupported_image_type': return props.t('communityUnsupportedImageType')
      case 'image_too_large': return props.t('communityImageTooLarge')
      case 'too_many_images': return props.t('communityTooManyImages')
      case 'comment_forbidden': return props.t('communityCommentForbidden')
      case 'comment_not_found': return props.t('communityCommentNotFound')
      case 'auth_service_unavailable': return props.t('communityAuthServiceUnavailable')
      case 'comment_or_rating_required': return props.t('communityCommentOrRatingRequired')
      case 'invalid_comment':
      case 'device_not_found': return props.t('communityValidationError')
      default: return props.t('communityRequestFailed')
    }
  }
  return props.t('communityRequestFailed')
}

function emitAggregates() {
  const commentsCount = comments.value.length
  const ratedComments = comments.value.filter((comment) => comment.rating !== null)
  const ratingAvg = ratedComments.length
    ? Number((ratedComments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / ratedComments.length).toFixed(1))
    : null

  emit('aggregatesChange', { commentsCount, ratingAvg, ratingsCount: ratedComments.length })
}

async function refreshComments() {
  const deviceId = normalizedDeviceId.value
  commentsError.value = false
  actionMessage.value = ''

  if (deviceId === null) {
    comments.value = []
    emitAggregates()
    return
  }

  commentsLoading.value = true
  try {
    comments.value = await getDeviceComments(deviceId)
    emitAggregates()
  } catch (err) {
    console.error(err)
    commentsError.value = true
  } finally {
    commentsLoading.value = false
  }
}

watch(normalizedDeviceId, () => { void refreshComments() }, { immediate: true })

function formatCommentDate(value: string | null) {
  if (!value) return ''
  const normalized = value.includes(' ') && !value.includes('T') ? value.replace(' ', 'T') : value
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function renderStars(rating: number) {
  return `${'★'.repeat(Math.round(rating))}${'☆'.repeat(Math.max(0, 5 - Math.round(rating)))}`
}

function formatStarsLabel(rating: number) {
  return `★ ${rating.toFixed(1)}`
}

function getUserInitials(name: string) {
  return (name || props.t('commentAnonymous'))
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function getAvatarFallbackStyle(name: string) {
  const seed = Array.from(name || props.t('commentAnonymous'))
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const hue = seed % 360

  return {
    background: `hsl(${hue} 65% 96%)`,
    color: `hsl(${hue} 56% 50%)`,
  }
}

function getAuthorName(comment: CommunityComment) {
  if (comment.author === null) return props.t('commentDeletedUser')
  return comment.author.display_name.trim() || props.t('commentAnonymous')
}

function isAvatarBroken(value: string) {
  return brokenAvatarUrls.value.includes(value)
}

function markAvatarBroken(value: string) {
  if (!value || brokenAvatarUrls.value.includes(value)) return
  brokenAvatarUrls.value = [...brokenAvatarUrls.value, value]
}

function getAvatarSource(comment: CommunityComment) {
  const candidate = comment.author?.avatar_url ?? null
  if (!candidate || isAvatarBroken(candidate)) return null
  return candidate
}

function resolveAvatarUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/')) return `https://cloud.slsys.io${value}`
  return value
}

function resolveImageUrl(image: CommunityCommentImage) {
  return image.url ? resolveCommunityAssetUrl(image.url) : null
}

function canManageComment(comment: CommunityComment) {
  return status.value === 'authenticated' && comment.author !== null && String(comment.author.id) === String(user.value?.id)
}

function setCreateRating(rating: number | null) {
  commentRating.value = normalizeRatingInput(rating)
}

function setEditRating(rating: number | null) {
  editDraftRating.value = normalizeRatingInput(rating)
}

function revokePreviewUrls(previews: PreviewImage[]) {
  previews.forEach((preview) => URL.revokeObjectURL(preview.url))
}

function clearCreateFiles() {
  revokePreviewUrls(commentPreviews.value)
  commentPreviews.value = []
  commentFiles.value = []
  createFileInputKey.value += 1
}

function clearReplyFiles() {
  revokePreviewUrls(replyPreviews.value)
  replyPreviews.value = []
  replyFiles.value = []
  replyFileInputKey.value += 1
}

function clearEditFiles() {
  revokePreviewUrls(editPreviews.value)
  editPreviews.value = []
  editFiles.value = []
  editFileInputKey.value += 1
}

function buildPreviews(files: File[]): PreviewImage[] {
  return files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }))
}

function validateImageFiles(fileList: FileList | null): File[] {
  const files = Array.from(fileList || [])
  if (files.length > maxImagesPerComment) throw new Error(props.t('communityTooManyImages'))

  for (const file of files) {
    if (!allowedImageMimeTypes.includes(file.type)) throw new Error(props.t('communityUnsupportedImageType'))
    if (file.size > maxImageSizeBytes) throw new Error(props.t('communityImageTooLarge'))
  }

  return files
}

function onCreateFilesChange(event: Event) {
  const input = event.target as HTMLInputElement
  try {
    const files = validateImageFiles(input.files)
    clearCreateFiles()
    commentFiles.value = files
    commentPreviews.value = buildPreviews(files)
    actionMessage.value = ''
  } catch (err) {
    clearCreateFiles()
    actionMessage.value = err instanceof Error ? err.message : props.t('communityRequestFailed')
  }
}

function onReplyFilesChange(event: Event) {
  const input = event.target as HTMLInputElement
  try {
    const files = validateImageFiles(input.files)
    clearReplyFiles()
    replyFiles.value = files
    replyPreviews.value = buildPreviews(files)
    actionMessage.value = ''
  } catch (err) {
    clearReplyFiles()
    actionMessage.value = err instanceof Error ? err.message : props.t('communityRequestFailed')
  }
}

function onEditFilesChange(event: Event) {
  const input = event.target as HTMLInputElement
  try {
    const files = validateImageFiles(input.files)
    clearEditFiles()
    editFiles.value = files
    editPreviews.value = buildPreviews(files)
    actionMessage.value = ''
  } catch (err) {
    clearEditFiles()
    actionMessage.value = err instanceof Error ? err.message : props.t('communityRequestFailed')
  }
}

function resetCreateForm() {
  commentDraft.value = ''
  commentRating.value = null
  clearCreateFiles()
}

function toggleReplyForm(commentId: number) {
  if (activeReplyAnchorId.value === commentId) {
    cancelReplyForm()
    return
  }
  cancelEdit()
  activeReplyAnchorId.value = commentId
  activeReplyParentId.value = commentId
  replyDraft.value = ''
  clearReplyFiles()
  actionMessage.value = ''
}

function cancelReplyForm() {
  activeReplyAnchorId.value = null
  activeReplyParentId.value = null
  replyDraft.value = ''
  clearReplyFiles()
}

function startEdit(comment: CommunityComment) {
  cancelReplyForm()
  editingCommentId.value = comment.id
  editDraftBody.value = comment.body
  editDraftRating.value = comment.parent_id === null ? comment.rating : null
  clearEditFiles()
  actionMessage.value = ''
}

function cancelEdit() {
  editingCommentId.value = null
  editDraftBody.value = ''
  editDraftRating.value = null
  clearEditFiles()
}

async function submitComment() {
  if (!canSubmitComment.value || normalizedDeviceId.value === null) {
    actionMessage.value = props.t('communityCommentOrRatingRequired')
    return
  }

  commentSubmitting.value = true
  actionMessage.value = ''
  try {
    await createDeviceComment({ deviceId: normalizedDeviceId.value, body: commentDraft.value, rating: commentRating.value, images: commentFiles.value })
    resetCreateForm()
    actionMessage.value = props.t('commentSubmitSuccess')
    await refreshComments()
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    commentSubmitting.value = false
  }
}

async function submitReply() {
  if (!canSubmitReply.value || normalizedDeviceId.value === null || activeReplyParentId.value === null) {
    actionMessage.value = props.t('communityCommentOrRatingRequired')
    return
  }

  replySubmitting.value = true
  actionMessage.value = ''
  try {
    await createDeviceComment({ deviceId: normalizedDeviceId.value, parentId: activeReplyParentId.value, body: replyDraft.value, images: replyFiles.value })
    cancelReplyForm()
    actionMessage.value = props.t('commentReplySuccess')
    await refreshComments()
  } catch (err) {
    const parentComment = comments.value.find((comment) => comment.id === activeReplyParentId.value) ?? null
    if (
      parentComment?.parent_id !== null
      && err instanceof CommunityApiError
      && (err.code === 'invalid_comment' || err.code === 'request_failed')
    ) {
      actionMessage.value = props.t('communityReplyDepthNotAllowed')
    } else {
      actionMessage.value = mapCommentError(err)
    }
  } finally {
    replySubmitting.value = false
  }
}

async function saveEdit(commentId: number) {
  if (!canSubmitEdit.value) {
    actionMessage.value = props.t('communityCommentOrRatingRequired')
    return
  }

  commentSubmitting.value = true
  actionMessage.value = ''
  try {
    await updateDeviceComment({ commentId, body: editDraftBody.value, rating: editDraftRating.value, images: editFiles.value })
    cancelEdit()
    actionMessage.value = props.t('commentUpdateSuccess')
    await refreshComments()
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    commentSubmitting.value = false
  }
}

async function removeComment(comment: CommunityComment) {
  if (!window.confirm(props.t('commentDeleteConfirm'))) return

  deletingCommentId.value = comment.id
  actionMessage.value = ''
  try {
    await deleteDeviceComment(comment.id)
    if (activeReplyAnchorId.value === comment.id || activeReplyParentId.value === comment.id) {
      cancelReplyForm()
    }
    if (editingCommentId.value === comment.id) {
      cancelEdit()
    }
    actionMessage.value = props.t('commentDeleteSuccess')
    await refreshComments()
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    deletingCommentId.value = null
  }
}

function isVotePending(commentId: number) {
  return votePendingIds.value.includes(commentId)
}

function patchVoteState(commentId: number, voteState: { likes_count: number; dislikes_count: number; my_vote: CommentVote | null }) {
  comments.value = comments.value.map((comment) => comment.id === commentId
    ? { ...comment, likes_count: voteState.likes_count, dislikes_count: voteState.dislikes_count, my_vote: voteState.my_vote }
    : comment)
}

async function toggleVote(comment: CommunityComment, nextVote: CommentVote) {
  if (!canVote.value || isVotePending(comment.id)) return

  votePendingIds.value = [...votePendingIds.value, comment.id]
  actionMessage.value = ''
  try {
    const result = comment.my_vote === nextVote ? await removeCommentVote(comment.id) : await voteComment(comment.id, nextVote)
    patchVoteState(comment.id, result)
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    votePendingIds.value = votePendingIds.value.filter((id) => id !== comment.id)
  }
}

onBeforeUnmount(() => {
  revokePreviewUrls(commentPreviews.value)
  revokePreviewUrls(replyPreviews.value)
  revokePreviewUrls(editPreviews.value)
})
</script>

<style scoped>
.device-access-panel {
  margin-top: 24px;
}

.device-access-panel__header {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.device-access-panel__title {
  align-items: center;
  color: var(--vp-c-text-1);
  display: inline-flex;
  font-size: 1rem;
  font-weight: 600;
  gap: 8px;
  line-height: 1.35;
  margin: 0;
}

.device-access-panel__count-badge {
  align-items: center;
  background: linear-gradient(180deg, rgba(126, 135, 255, 0.16), rgba(126, 135, 255, 0.08));
  border-radius: 999px;
  color: #4457c2;
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  justify-content: center;
  min-height: 24px;
  min-width: 28px;
  padding: 1px 10px;
}

.device-access-panel__retry,
.device-comment-link,
.device-rating-clear {
  background: transparent;
  border: 0;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
  padding: 0;
}

.device-access-panel__retry {
  font-size: 12px;
}

.device-comment-link--danger {
  color: var(--vp-c-danger-1);
}

.device-access-panel__aggregate {
  align-items: center;
  color: var(--vp-c-text-2);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.device-access-panel__aggregate-rating {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.device-access-panel__empty,
.device-access-panel__technical-error,
.device-access-panel__message,
.device-access-panel__guest-note {
  color: var(--vp-c-text-2);
  margin: 14px 0 0;
}

.device-comment-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.device-comment-card {
  display: flex;
  gap: 12px;
  margin-left: calc(var(--comment-depth, 0) * 26px);
}

.device-comment-card__avatar {
  align-items: center;
  background: linear-gradient(180deg, rgba(126, 135, 255, 0.12), rgba(126, 135, 255, 0.06));
  border-radius: 999px;
  border: 1px solid rgba(126, 135, 255, 0.14);
  color: #4963d3;
  display: flex;
  flex: 0 0 44px;
  font-size: 14px;
  font-weight: 700;
  height: 44px;
  justify-content: center;
  overflow: hidden;
  width: 44px;
}

.device-comment-card__avatar > span {
  align-items: center;
  border-radius: inherit;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
}

.device-comment-card__avatar img {
  display: block;
  border-radius: inherit;
  height: 44px;
  object-fit: cover;
  width: 44px;
}

.device-comment-card__body {
  flex: 1;
  min-width: 0;
}

.device-comment-card__meta {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  justify-content: space-between;
}

.device-comment-card__author-line {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.device-comment-card__author-line strong {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.25;
}

.device-comment-card__author-badge {
  background: #e6f3e4;
  border-radius: 999px;
  color: #2a7d35;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  padding: 3px 8px;
}

.device-comment-card__rating-inline,
.device-comment-card__time {
  font-size: 12px;
}

.device-comment-card__rating-inline {
  color: #f5b400;
  font-size: 14px;
}

.device-comment-card__time {
  color: var(--vp-c-text-2);
}

.device-comment-card__text {
  color: var(--vp-c-text-1);
  margin: 8px 0 0;
  line-height: 1.5;
  white-space: pre-wrap;
}

.device-comment-gallery {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  margin-top: 10px;
}

.device-comment-gallery__item {
  aspect-ratio: 1;
  background: var(--vp-c-bg-soft);
  border-radius: 10px;
  display: block;
  overflow: hidden;
}

.device-comment-gallery__item img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.device-comment-votes {
  align-items: center;
  display: flex;
  gap: 12px;
}

.device-comment-vote {
  align-items: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  gap: 5px;
  line-height: 1.35;
  padding: 0;
}

.device-comment-vote svg {
  fill: currentColor;
  height: 14px;
  width: 14px;
}

.device-comment-vote--like {
  color: var(--vp-c-success-1);
}

.device-comment-vote--dislike {
  color: var(--vp-c-danger-1);
}

.device-comment-vote--dislike svg {
  transform: rotate(180deg);
}

.device-comment-vote:not(.active) {
  opacity: 0.8;
}

.device-comment-vote:disabled,
.device-comment-link:disabled,
.device-access-panel__primary:disabled,
.device-access-panel__secondary:disabled {
  cursor: default;
  opacity: 0.5;
}

.device-comment-actions-row {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 10px;
}

.device-comment-actions {
  display: inline-flex;
  gap: 12px;
}

.device-comment-votes {
  margin-left: auto;
}

.device-comment-form,
.device-reply-form {
  background: linear-gradient(180deg, rgba(126, 135, 255, 0.04), rgba(126, 135, 255, 0.02));
  border: 1px solid rgba(126, 135, 255, 0.24);
  border-radius: 14px;
  margin-top: 18px;
  padding: 14px;
}

.device-reply-form {
  margin-left: calc(var(--comment-depth, 0) * 26px + 52px);
}

.device-comment-form__label {
  color: var(--vp-c-text-1);
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}

.device-comment-form__input,
.device-comment-form__file-input {
  width: 100%;
}

.device-comment-form__input {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  color: var(--vp-c-text-1);
  font: inherit;
  padding: 10px 12px;
  resize: vertical;
}

.device-comment-form__input:focus {
  border-color: var(--vp-c-brand-1);
  outline: none;
}

.device-comment-form__file-input {
  color: var(--vp-c-text-2);
  margin-top: 12px;
}

.device-comment-form__footer {
  align-items: flex-end;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-top: 12px;
}

.device-comment-form__meta-panel {
  display: grid;
  gap: 8px;
}

.device-comment-form__counter,
.device-comment-form__replacement-hint {
  color: var(--vp-c-text-2);
  font-size: 12px;
  margin: 0;
}

.device-comment-form__rating-row {
  display: grid;
  gap: 6px;
}

.device-comment-form__rating-label {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.device-rating-editor {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.device-rating-star {
  background: transparent;
  border: 0;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
}

.device-rating-star.active {
  color: #f5b400;
}

.device-access-panel__primary,
.device-access-panel__secondary {
  border-radius: 10px;
  font: inherit;
  min-height: 36px;
  padding: 0 14px;
}

.device-access-panel__primary {
  background: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
  color: #fff;
}

.device-access-panel__secondary {
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.device-access-panel__guest-note a {
  color: var(--vp-c-brand-1);
}

@media (max-width: 640px) {
  .device-comment-card,
  .device-comment-form__footer,
  .device-comment-card__meta {
    align-items: flex-start;
  }

  .device-comment-form__footer,
  .device-comment-card__meta {
    flex-direction: column;
  }

  .device-comment-card,
  .device-reply-form {
    margin-left: 0;
  }
}
</style>
