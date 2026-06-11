<template>
  <section class="device-access-panel" aria-live="polite">
    <div class="device-access-panel__header">
      <h3 class="device-access-panel__title">
        {{ t('commentsTitle') }} <span class="device-access-panel__count">({{ comments.length }})</span>
      </h3>
      <button v-if="commentsError && !commentsLoading" type="button" class="device-access-panel__retry" @click="refreshComments">
        {{ t('commentsRetry') }}
      </button>
    </div>

    <div v-if="commentsLoading" class="device-access-panel__empty">
      {{ t('commentsLoading') }}
    </div>
    <p v-else-if="commentsError" class="device-access-panel__technical-error">
      {{ t('commentsLoadFailed') }}
    </p>
    <ul v-else-if="comments.length" class="device-comments-list">
      <li v-for="comment in comments" :key="comment.id" class="device-comments-list__item">
        <strong>{{ comment.userName }}</strong>
        <span>{{ formatCommentDate(comment.createdAt) }}</span>
        <p>{{ comment.comment }}</p>
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
        <div class="device-comment-form__meta">
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
    <a
      v-else-if="status === 'guest'"
      class="device-access-panel__cta"
      href="https://cloud.slsys.io/login"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ t('commentGuestCta') }}
    </a>

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

const { status } = useCloudAuth()

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

.device-access-panel__title {
  margin: 0;
  font-size: 20px;
}

.device-access-panel__count {
  color: var(--vp-c-text-2);
  font-weight: 500;
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
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
}

.device-comments-list__item strong,
.device-comments-list__item span,
.device-comments-list__item p {
  display: block;
}

.device-comments-list__item span {
  margin-top: 2px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.device-comments-list__item p {
  margin-top: 6px;
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

.device-comment-form__meta {
  display: grid;
  gap: 4px;
}

.device-access-panel__cta,
.device-access-panel__technical-error,
.device-access-panel__message {
  margin-top: 14px;
}

.device-access-panel__message {
  color: var(--vp-c-brand-1);
}

@media (max-width: 640px) {
  .device-access-panel__header,
  .device-comment-form__footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
