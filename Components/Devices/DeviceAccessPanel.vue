<template>
  <section class="device-access-panel" aria-live="polite">
    <div class="device-access-panel__header">
      <div>
        <p class="device-access-panel__eyebrow">{{ t('communityTitle') }}</p>
        <h3 class="device-access-panel__title">{{ t('communitySubtitle') }}</h3>
      </div>
      <button
        v-if="status === 'auth_error' || status === 'network_error'"
        type="button"
        class="device-access-panel__secondary"
        @click="refresh"
      >
        {{ t('retryAuth') }}
      </button>
    </div>

    <div v-if="status === 'loading'" class="device-access-panel__state device-access-panel__state--loading">
      <span class="device-access-panel__spinner" aria-hidden="true"></span>
      <span>{{ t('authChecking') }}</span>
    </div>

    <div v-else-if="status === 'auth_error'" class="device-access-panel__state device-access-panel__state--error">
      <p>{{ t('authFailed') }}</p>
    </div>

    <div v-else-if="status === 'network_error'" class="device-access-panel__state device-access-panel__state--error">
      <p>{{ t('serviceUnavailable') }}</p>
    </div>

    <div v-else class="device-access-panel__content">
      <div v-if="status === 'authenticated'" class="device-access-panel__user">
        {{ t('signedInAs') }} <strong>{{ user?.name }}</strong>
      </div>

      <div v-else class="device-access-panel__guest-note">
        <p>{{ t('guestAccessHint') }}</p>
        <a
          class="device-access-panel__primary"
          href="https://cloud.slsys.io/login"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('loginToCloud') }}
        </a>
      </div>

      <div class="device-community-card">
        <div class="device-community-card__header">
          <h4>{{ t('commentsTitle') }}</h4>
          <span class="device-community-card__meta">{{ comments.length }}</span>
        </div>

        <div v-if="commentsLoading" class="device-community-card__empty">
          {{ t('commentsLoading') }}
        </div>
        <ul v-else-if="comments.length" class="device-comments-list">
          <li v-for="comment in comments" :key="comment.id" class="device-comments-list__item">
            <strong>{{ comment.authorName }}</strong>
            <span>{{ formatCommentDate(comment.createdAt) }}</span>
            <p>{{ comment.message }}</p>
          </li>
        </ul>
        <p v-else class="device-community-card__empty">
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
            rows="4"
          ></textarea>
          <div class="device-comment-form__footer">
            <p class="device-comment-form__hint">{{ t('commentStubHint') }}</p>
            <button type="submit" class="device-access-panel__primary" :disabled="commentSubmitting || !commentDraft.trim()">
              {{ commentSubmitting ? t('commentSubmitting') : t('commentSubmit') }}
            </button>
          </div>
        </form>
        <div v-else class="device-community-card__guest-footer">
          {{ t('commentAuthRequired') }}
        </div>
      </div>

      <div class="device-community-card">
        <div class="device-community-card__header">
          <h4>{{ t('requestTitle') }}</h4>
        </div>
        <p class="device-community-card__empty">
          {{ t('requestStubHint') }}
        </p>
        <form v-if="status === 'authenticated'" class="device-comment-form" @submit.prevent="submitRequest">
          <label class="device-comment-form__label" for="device-request-message">
            {{ t('requestFormLabel') }}
          </label>
          <textarea
            id="device-request-message"
            v-model="requestDraft"
            class="device-comment-form__input"
            :placeholder="t('requestFormPlaceholder')"
            :disabled="requestSubmitting"
            rows="4"
          ></textarea>
          <div class="device-comment-form__footer">
            <p class="device-comment-form__hint">{{ t('requestStubHint') }}</p>
            <button type="submit" class="device-access-panel__primary" :disabled="requestSubmitting || !requestDraft.trim()">
              {{ requestSubmitting ? t('requestSubmitting') : t('requestSubmit') }}
            </button>
          </div>
        </form>
        <div v-else class="device-community-card__guest-footer">
          {{ t('requestAuthRequired') }}
        </div>
      </div>

      <p v-if="actionMessage" class="device-access-panel__message">
        {{ actionMessage }}
      </p>
      <p v-if="error" class="device-access-panel__technical-error">
        {{ error }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DeviceComment } from '../../.vitepress/theme/api/communityClient'
import {
  createDeviceComment,
  createDeviceRequest,
  getDeviceComments,
} from '../../.vitepress/theme/api/communityClient'
import { useCloudAuth } from '../../.vitepress/theme/composables/useCloudAuth'

const props = defineProps<{
  deviceId: string
  t: (key: string) => string
}>()

const { status, user, error, refresh } = useCloudAuth()

const comments = ref<DeviceComment[]>([])
const commentsLoading = ref(false)
const commentSubmitting = ref(false)
const requestSubmitting = ref(false)
const commentDraft = ref('')
const requestDraft = ref('')
const actionMessage = ref('')

const normalizedDeviceId = computed(() => props.deviceId.trim())

watch(
  normalizedDeviceId,
  async (deviceId) => {
    comments.value = []
    actionMessage.value = ''

    if (!deviceId) {
      return
    }

    commentsLoading.value = true

    try {
      comments.value = await getDeviceComments(deviceId)
    } catch (err) {
      console.error(err)
      actionMessage.value = props.t('commentsLoadFailed')
    } finally {
      commentsLoading.value = false
    }
  },
  { immediate: true },
)

function formatCommentDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

async function submitComment() {
  if (!normalizedDeviceId.value || !commentDraft.value.trim()) {
    return
  }

  commentSubmitting.value = true
  actionMessage.value = ''

  try {
    await createDeviceComment(normalizedDeviceId.value, {
      message: commentDraft.value.trim(),
    })
  } catch (err) {
    console.error(err)
    actionMessage.value = props.t('commentStubResult')
  } finally {
    commentSubmitting.value = false
  }
}

async function submitRequest() {
  if (!normalizedDeviceId.value || !requestDraft.value.trim()) {
    return
  }

  requestSubmitting.value = true
  actionMessage.value = ''

  try {
    await createDeviceRequest({
      deviceId: normalizedDeviceId.value,
      message: requestDraft.value.trim(),
    })
  } catch (err) {
    console.error(err)
    actionMessage.value = props.t('requestStubResult')
  } finally {
    requestSubmitting.value = false
  }
}
</script>

<style scoped>
.device-access-panel {
  margin-top: 24px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.device-access-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.device-access-panel__eyebrow {
  margin: 0 0 4px;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.device-access-panel__title {
  margin: 0;
  font-size: 20px;
}

.device-access-panel__state,
.device-access-panel__guest-note,
.device-access-panel__user,
.device-access-panel__message,
.device-access-panel__technical-error {
  margin-bottom: 16px;
}

.device-access-panel__state {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--vp-c-text-2);
}

.device-access-panel__state--error {
  color: var(--vp-c-danger-1);
}

.device-access-panel__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: device-access-spin 0.9s linear infinite;
}

.device-access-panel__content {
  display: grid;
  gap: 16px;
}

.device-access-panel__primary,
.device-access-panel__secondary {
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

.device-access-panel__primary:hover,
.device-access-panel__primary:focus-visible {
  background: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
}

.device-access-panel__secondary {
  background: transparent;
  color: var(--vp-c-brand-1);
}

.device-access-panel__secondary:hover,
.device-access-panel__secondary:focus-visible {
  background: var(--vp-c-brand-soft);
}

.device-access-panel__primary:disabled,
.device-access-panel__secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.device-community-card {
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.device-community-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.device-community-card__header h4 {
  margin: 0;
  font-size: 16px;
}

.device-community-card__meta {
  min-width: 24px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  text-align: center;
}

.device-community-card__empty,
.device-community-card__guest-footer,
.device-comment-form__hint,
.device-access-panel__technical-error {
  color: var(--vp-c-text-2);
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
  margin: 6px 0 0;
}

.device-comment-form {
  margin-top: 16px;
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

.device-comment-form__hint,
.device-access-panel__message,
.device-access-panel__technical-error,
.device-community-card__guest-footer,
.device-community-card__empty,
.device-access-panel__user,
.device-access-panel__guest-note p {
  margin: 0;
}

.device-access-panel__message {
  color: var(--vp-c-brand-1);
}

@keyframes device-access-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .device-access-panel {
    padding: 16px;
  }

  .device-access-panel__header,
  .device-comment-form__footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
