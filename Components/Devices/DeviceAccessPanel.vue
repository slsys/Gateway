<template>
  <section class="device-access-panel" aria-live="polite">
    <div class="device-access-panel__header">
      <h3 class="device-access-panel__title">{{ t('commentsTitle') }} ({{ comments.length }})</h3>
      <div class="device-access-panel__header-actions">
        <a
          v-if="status === 'guest'"
          class="device-access-panel__cta"
          href="https://cloud.slsys.io/login"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('commentGuestCta') }}
        </a>
        <button
          v-if="commentsError && !commentsLoading"
          type="button"
          class="device-access-panel__retry"
          @click="refreshComments"
        >
          {{ t('commentsRetry') }}
        </button>
      </div>
    </div>

    <div v-if="aggregateSummary" class="device-access-panel__aggregate">
      <span v-if="aggregateSummary.ratingAvg !== null" class="device-access-panel__aggregate-rating">
        {{ formatStarsLabel(aggregateSummary.ratingAvg) }}
      </span>
      <span v-if="aggregateSummary.ratingsLabel" class="device-access-panel__aggregate-meta">{{ aggregateSummary.ratingsLabel }}</span>
      <span class="device-access-panel__aggregate-meta">{{ aggregateSummary.commentsLabel }}</span>
    </div>

    <div v-if="commentsLoading" class="device-access-panel__empty">
      {{ t('commentsLoading') }}
    </div>
    <p v-else-if="commentsError" class="device-access-panel__technical-error">
      {{ t('commentsLoadFailed') }}
    </p>
    <ul v-else-if="visibleComments.length" class="device-comments-list">
      <li
        v-for="comment in visibleComments"
        :key="comment.id"
        class="device-comments-list__item"
        :class="{ 'device-comments-list__item--own': isOwnComment(comment) }"
      >
        <div class="device-comments-list__avatar">
          <img v-if="comment.avatarUrl" :src="comment.avatarUrl" :alt="comment.USER_NAME || comment.USER_EMAIL" loading="lazy" />
          <span v-else>{{ getUserInitials(comment.USER_NAME || comment.USER_EMAIL) }}</span>
        </div>
        <div class="device-comments-list__body">
          <div class="device-comments-list__meta">
            <div class="device-comments-list__author-line">
              <strong>{{ comment.USER_NAME || t('commentAnonymous') }}</strong>
              <span v-if="isOwnComment(comment)" class="device-comments-list__author-badge">{{ t('commentOwnBadge') }}</span>
              <span v-if="comment.rating !== null" class="device-comments-list__rating-inline" :aria-label="`${comment.rating} / 5`">
                {{ renderStars(comment.rating) }}
              </span>
            </div>
            <span>{{ formatCommentDate(comment.UPDATED_AT || comment.CREATED_AT) }}</span>
          </div>

          <template v-if="editingCommentId === comment.id">
            <div class="device-comment-edit">
              <div class="device-rating-editor">
                <button
                  v-for="value in 5"
                  :key="`edit-rating-${comment.id}-${value}`"
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
                v-model="editDraftComment"
                class="device-comment-form__input"
                :maxlength="commentMaxLength"
                rows="4"
              ></textarea>
              <div class="device-comment-form__footer">
                <div class="device-comment-form__meta-panel">
                  <p class="device-comment-form__hint">{{ t('commentSubmitHint') }}</p>
                  <p class="device-comment-form__counter">{{ editDraftLength }}/{{ commentMaxLength }}</p>
                </div>
                <div class="device-comment-actions">
                  <button type="button" class="device-access-panel__secondary" @click="cancelEdit">
                    {{ t('commentCancel') }}
                  </button>
                  <button
                    type="button"
                    class="device-access-panel__primary"
                    :disabled="commentSubmitting || !canSubmitEdit"
                    @click="saveEdit(comment.id)"
                  >
                    {{ commentSubmitting ? t('commentSaving') : t('commentSave') }}
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <p v-if="comment.COMMENT.trim()">{{ comment.COMMENT }}</p>
            <div v-if="canManageComment(comment)" class="device-comment-actions device-comment-actions--inline">
              <button type="button" class="device-comment-link" @click="startEdit(comment)">
                {{ t('commentEdit') }}
              </button>
              <button
                type="button"
                class="device-comment-link device-comment-link--danger"
                :disabled="deletingCommentId === comment.id"
                @click="removeComment(comment)"
              >
                {{ deletingCommentId === comment.id ? t('commentDeleting') : t('commentDelete') }}
              </button>
            </div>
          </template>
        </div>
      </li>
    </ul>
    <p v-else class="device-access-panel__empty">
      {{ t('commentsEmpty') }}
    </p>

    <form v-if="status === 'authenticated'" class="device-comment-form" @submit.prevent="submitComment">
      <label class="device-comment-form__label" for="device-comment-message">
        {{ t('commentFormLabel') }}
      </label>
      <div class="device-rating-editor device-rating-editor--create">
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
        <button type="button" class="device-rating-clear" @click="setCreateRating(null)">
          {{ t('commentRatingClear') }}
        </button>
      </div>
      <textarea
        id="device-comment-message"
        v-model="commentDraft"
        class="device-comment-form__input"
        :placeholder="t('commentFormPlaceholder')"
        :disabled="commentSubmitting"
        :maxlength="commentMaxLength"
        rows="4"
      ></textarea>
      <div class="device-comment-form__footer">
        <div class="device-comment-form__meta-panel">
          <p class="device-comment-form__hint">{{ t('commentSubmitHint') }}</p>
          <p class="device-comment-form__counter">{{ commentDraftLength }}/{{ commentMaxLength }}</p>
        </div>
        <button
          type="submit"
          class="device-access-panel__primary"
          :disabled="commentSubmitting || !canSubmitComment"
        >
          {{ commentSubmitting ? t('commentSubmitting') : t('commentSubmit') }}
        </button>
      </div>
    </form>

    <p v-if="status === 'auth_error' || status === 'network_error'" class="device-access-panel__technical-error">
      {{ t('commentAuthCheckFailed') }}
    </p>
    <p v-if="actionMessage" class="device-access-panel__message">{{ actionMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  CommunityApiError,
  createDeviceComment,
  deleteDeviceComment,
  getDeviceComments,
  updateDeviceComment,
  type NormalizedDeviceComment,
} from '../../.vitepress/theme/api/communityClient'
import { useCloudAuth } from '../../.vitepress/theme/composables/useCloudAuth'

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

const comments = ref<NormalizedDeviceComment[]>([])
const commentsLoading = ref(false)
const commentsError = ref(false)
const commentSubmitting = ref(false)
const deletingCommentId = ref<number | null>(null)
const commentDraft = ref('')
const commentRating = ref<number | null>(null)
const editDraftComment = ref('')
const editDraftRating = ref<number | null>(null)
const editingCommentId = ref<number | null>(null)
const actionMessage = ref('')
const commentMaxLength = 2000

const normalizedDeviceId = computed(() => props.deviceId)
const commentDraftLength = computed(() => commentDraft.value.length)
const editDraftLength = computed(() => editDraftComment.value.length)
const visibleComments = computed(() => comments.value.filter((comment) => comment.COMMENT.trim() || comment.rating !== null))
const canSubmitComment = computed(() => isValidCommentPayload(commentDraft.value, commentRating.value) && normalizedDeviceId.value !== null)
const canSubmitEdit = computed(() => isValidCommentPayload(editDraftComment.value, editDraftRating.value) && editingCommentId.value !== null)
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

function emitAggregates() {
  const commentsCount = comments.value.length
  const ratedComments = comments.value.filter((comment) => comment.rating !== null)
  const ratingAvg = ratedComments.length
    ? Number((ratedComments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / ratedComments.length).toFixed(1))
    : null

  emit('aggregatesChange', {
    commentsCount,
    ratingAvg,
    ratingsCount: ratedComments.length,
  })
}

function pluralizeComments(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return props.t('commentsCountOne')
  }
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return props.t('commentsCountFew')
  }
  return props.t('commentsCountMany')
}

function pluralizeRatings(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return props.t('ratingsCountOne')
  }
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return props.t('ratingsCountFew')
  }
  return props.t('ratingsCountMany')
}

function normalizeRatingInput(rating: number | null) {
  return rating === null ? null : Math.min(5, Math.max(1, rating))
}

function isValidCommentPayload(comment: string, rating: number | null) {
  const trimmed = comment.trim()
  const normalizedRating = normalizeRatingInput(rating)
  return (trimmed.length > 0 || normalizedRating !== null) && trimmed.length <= commentMaxLength
}

function mapCommentError(err: unknown): string {
  if (err instanceof CommunityApiError) {
    switch (err.code) {
      case 'not_authenticated':
        return props.t('communityAuthRequired')
      case 'comment_forbidden':
        return props.t('communityCommentForbidden')
      case 'invalid_rating':
        return props.t('communityInvalidRating')
      case 'comment_or_rating_required':
        return props.t('communityCommentOrRatingRequired')
      case 'comment_not_found':
        return props.t('communityCommentNotFound')
      case 'auth_service_unavailable':
        return props.t('communityAuthServiceUnavailable')
      case 'invalid_comment':
      case 'invalid_device_id':
      case 'device_not_found':
        return props.t('communityValidationError')
      default:
        return props.t('communityRequestFailed')
    }
  }

  return props.t('communityRequestFailed')
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

watch(
  normalizedDeviceId,
  () => {
    void refreshComments()
  },
  { immediate: true },
)

function formatCommentDate(value: string) {
  const normalized = value.includes(' ') && !value.includes('T') ? value.replace(' ', 'T') : value
  const date = new Date(normalized)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function renderStars(rating: number) {
  const full = '★'.repeat(Math.round(rating))
  const empty = '☆'.repeat(Math.max(0, 5 - Math.round(rating)))
  return `${full}${empty}`
}

function formatStarsLabel(rating: number) {
  return `★ ${rating.toFixed(1)}`
}

function getUserInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function isOwnComment(comment: NormalizedDeviceComment) {
  return Boolean(user.value?.id) && String(comment.CLOUD_USER_ID) === String(user.value?.id)
}

function canManageComment(comment: NormalizedDeviceComment) {
  return status.value === 'authenticated' && isOwnComment(comment)
}

function setCreateRating(rating: number | null) {
  commentRating.value = normalizeRatingInput(rating)
}

function setEditRating(rating: number | null) {
  editDraftRating.value = normalizeRatingInput(rating)
}

function startEdit(comment: NormalizedDeviceComment) {
  editingCommentId.value = comment.id
  editDraftComment.value = comment.COMMENT
  editDraftRating.value = comment.rating
  actionMessage.value = ''
}

function cancelEdit() {
  editingCommentId.value = null
  editDraftComment.value = ''
  editDraftRating.value = null
}

async function submitComment() {
  if (!canSubmitComment.value || normalizedDeviceId.value === null) {
    actionMessage.value = props.t('communityCommentOrRatingRequired')
    return
  }

  commentSubmitting.value = true
  actionMessage.value = ''

  try {
    await createDeviceComment(normalizedDeviceId.value, commentDraft.value.trim(), commentRating.value)
    commentDraft.value = ''
    commentRating.value = null
    actionMessage.value = props.t('commentSubmitSuccess')
    await refreshComments()
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    commentSubmitting.value = false
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
    await updateDeviceComment(commentId, editDraftComment.value.trim(), editDraftRating.value)
    cancelEdit()
    actionMessage.value = props.t('commentUpdateSuccess')
    await refreshComments()
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    commentSubmitting.value = false
  }
}

async function removeComment(comment: NormalizedDeviceComment) {
  if (!window.confirm(props.t('commentDeleteConfirm'))) {
    return
  }

  deletingCommentId.value = comment.id
  actionMessage.value = ''

  try {
    await deleteDeviceComment(comment.id)
    actionMessage.value = props.t('commentDeleteSuccess')
    await refreshComments()
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    deletingCommentId.value = null
  }
}
</script>

<style scoped>
.device-access-panel {
  margin-top: 24px;
}

.device-access-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.device-access-panel__header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.device-access-panel__title {
  margin: 0;
  font-size: 16px;
  line-height: 21px;
}

.device-access-panel__aggregate {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.device-access-panel__aggregate-rating {
  color: #c47c00;
  font-weight: 700;
}

.device-access-panel__aggregate-meta {
  color: var(--vp-c-text-2);
}

.device-access-panel__primary,
.device-access-panel__secondary,
.device-access-panel__cta,
.device-access-panel__retry {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-brand-1);
  padding: 7px 14px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  box-sizing: border-box;
}

.device-access-panel__primary {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
}

.device-access-panel__secondary,
.device-access-panel__cta,
.device-access-panel__retry {
  background: transparent;
  color: var(--vp-c-brand-1);
}

.device-access-panel__primary:disabled,
.device-access-panel__secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.device-access-panel__empty,
.device-comment-form__hint,
.device-access-panel__technical-error,
.device-comment-form__counter {
  color: var(--vp-c-text-2);
}

.device-access-panel__empty,
.device-access-panel__message,
.device-access-panel__technical-error,
.device-comments-list__item p,
.device-comment-form__hint,
.device-comment-form__counter {
  margin: 0;
}

.device-comments-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.device-comments-list__item + .device-comments-list__item {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--vp-c-divider);
}

.device-comments-list__item {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.device-comments-list__item--own .device-comments-list__avatar {
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.device-comments-list__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--vp-c-brand-soft), rgba(0, 0, 0, 0.04));
  color: var(--vp-c-brand-1);
  font-size: 13px;
  font-weight: 700;
}

.device-comments-list__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.device-comments-list__body {
  min-width: 0;
}

.device-comments-list__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.device-comments-list__author-line {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.device-comments-list__author-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(76, 175, 80, 0.14);
  color: #2e7d32;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
}

.device-comments-list__rating-inline {
  color: #c47c00;
  font-size: 13px;
  letter-spacing: 0.04em;
}

.device-comments-list__meta strong {
  display: block;
  font-size: 14px;
  line-height: 1.3;
}

.device-comments-list__meta > span {
  flex: none;
  font-size: 12px;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.device-comments-list__item p {
  margin-top: 0;
  line-height: 1.6;
}

.device-comment-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.device-comment-actions--inline {
  margin-top: 8px;
}

.device-comment-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font: inherit;
}

.device-comment-link--danger {
  color: var(--vp-c-danger-1);
}

.device-comment-form,
.device-comment-edit {
  margin-top: 18px;
}

.device-comment-form__label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.device-comment-form__input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  resize: vertical;
  box-sizing: border-box;
}

.device-comment-form__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 12px;
}

.device-comment-form__meta-panel {
  display: grid;
  gap: 4px;
}

.device-rating-editor {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.device-rating-star {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--vp-c-divider);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.device-rating-star.active {
  color: #c47c00;
}

.device-rating-clear {
  margin-left: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font: inherit;
}

.device-access-panel__technical-error,
.device-access-panel__message {
  margin-top: 14px;
}

.device-access-panel__message {
  color: var(--vp-c-brand-1);
}

@media (max-width: 640px) {
  .device-access-panel__header,
  .device-comment-form__footer,
  .device-comments-list__meta {
    flex-direction: column;
    align-items: stretch;
  }

  .device-access-panel__header-actions,
  .device-comment-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .device-comments-list__meta > span {
    white-space: normal;
  }
}
</style>
