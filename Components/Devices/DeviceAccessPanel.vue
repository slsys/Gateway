<template>
  <section class="device-access-panel" aria-live="polite">
    <div class="device-access-panel__header">
      <h3 class="device-access-panel__title">
        {{ t('commentsTitle') }} <span class="device-access-panel__count">{{ comments.length }}</span>
      </h3>
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
        <button v-if="commentsError && !commentsLoading" type="button" class="device-access-panel__retry" @click="refreshComments">
          {{ t('commentsRetry') }}
        </button>
      </div>
    </div>

    <div v-if="commentsLoading" class="device-access-panel__empty">
      {{ t('commentsLoading') }}
    </div>
    <p v-else-if="commentsError" class="device-access-panel__technical-error">
      {{ t('commentsLoadFailed') }}
    </p>
    <ul v-else-if="comments.length" class="device-comments-list">
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="device-comments-list__item"
        :class="{ 'device-comments-list__item--own': isOwnComment(comment) }"
      >
        <div class="device-comments-list__avatar">
          <img v-if="comment.avatarUrl" :src="comment.avatarUrl" :alt="comment.userName" loading="lazy" />
          <span v-else>{{ getUserInitials(comment.userName) }}</span>
        </div>
        <div class="device-comments-list__body">
          <div class="device-comments-list__meta">
            <div class="device-comments-list__author-line">
              <strong>{{ comment.userName }}</strong>
              <span v-if="isOwnComment(comment)" class="device-comments-list__author-badge">{{ t('commentOwnBadge') }}</span>
            </div>
            <span>{{ formatCommentDate(comment.createdAt) }}</span>
          </div>
          <p>{{ comment.comment }}</p>
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
  getDeviceComments,
  type DeviceComment,
} from '../../.vitepress/theme/api/communityClient'
import { useCloudAuth } from '../../.vitepress/theme/composables/useCloudAuth'

const props = defineProps<{
  deviceId: number | null
  t: (key: string) => string
}>()

const { status, user } = useCloudAuth()

const comments = ref<DeviceComment[]>([])
const commentsLoading = ref(false)
const commentsError = ref(false)
const commentSubmitting = ref(false)
const commentDraft = ref('')
const actionMessage = ref('')
const commentMaxLength = 2000

const normalizedDeviceId = computed(() => props.deviceId)
const commentDraftLength = computed(() => commentDraft.value.length)
const canSubmitComment = computed(() => {
  const trimmed = commentDraft.value.trim()
  return trimmed.length > 0 && trimmed.length <= commentMaxLength && normalizedDeviceId.value !== null
})

function mapCommentError(err: unknown): string {
  if (err instanceof CommunityApiError) {
    if (err.code === 'not_authenticated') {
      return props.t('communityAuthRequired')
    }
    if (err.status === 422) {
      return props.t('communityValidationError')
    }
    if (err.code === 'auth_service_unavailable') {
      return props.t('communityAuthServiceUnavailable')
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
    return
  }

  commentsLoading.value = true

  try {
    comments.value = await getDeviceComments(deviceId)
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

function getUserInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function isOwnComment(comment: DeviceComment) {
  return Boolean(user.value?.email) && user.value?.email === comment.userEmail
}

async function submitComment() {
  if (!canSubmitComment.value || normalizedDeviceId.value === null) {
    actionMessage.value = props.t('communityValidationError')
    return
  }

  commentSubmitting.value = true
  actionMessage.value = ''

  try {
    const created = await createDeviceComment(normalizedDeviceId.value, commentDraft.value.trim())
    comments.value = [
      {
        id: created.id,
        deviceId: created.deviceId,
        cloudUserId: '',
        userEmail: created.userEmail,
        userName: created.userName,
        avatarUrl: created.avatarUrl,
        comment: created.comment,
        status: created.status,
        createdAt: created.createdAt,
        updatedAt: created.createdAt,
      },
      ...comments.value,
    ]
    commentDraft.value = ''
    actionMessage.value = props.t('commentSubmitSuccess')
  } catch (err) {
    actionMessage.value = mapCommentError(err)
  } finally {
    commentSubmitting.value = false
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

.device-access-panel__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 2px 8px;
  margin-left: 8px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.device-access-panel__primary,
.device-access-panel__cta,
.device-access-panel__retry {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--vp-c-brand-1);
  padding: 9px 14px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.device-access-panel__primary {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
}

.device-access-panel__cta,
.device-access-panel__retry {
  background: transparent;
  color: var(--vp-c-brand-1);
}

.device-access-panel__cta:hover,
.device-access-panel__cta:focus-visible,
.device-access-panel__retry:hover,
.device-access-panel__retry:focus-visible,
.device-access-panel__primary:hover,
.device-access-panel__primary:focus-visible {
  background: var(--vp-c-brand-soft);
}

.device-access-panel__primary:hover,
.device-access-panel__primary:focus-visible {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
}

.device-access-panel__primary:disabled {
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
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.device-comments-list__item:hover {
  transform: translateY(-1px);
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
  margin-bottom: 8px;
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
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.66)),
    var(--vp-c-bg-soft);
  line-height: 1.6;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

:global(.dark) .device-comments-list__item p {
  background:
    linear-gradient(180deg, rgba(40, 44, 52, 0.92), rgba(30, 34, 40, 0.88)),
    var(--vp-c-bg-soft);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.22);
}

.device-comments-list__item--own p {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 24%, var(--vp-c-divider));
}

.device-comment-form {
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

  .device-access-panel__header-actions {
    justify-content: flex-start;
  }

  .device-comments-list__meta > span {
    white-space: normal;
  }
}
</style>
