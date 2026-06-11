<template>
  <section class="device-access-panel" aria-live="polite">
    <h3 class="device-access-panel__title">
      {{ t('commentsTitle') }} <span class="device-access-panel__count">({{ comments.length }})</span>
    </h3>

    <div v-if="commentsLoading" class="device-access-panel__empty">
      {{ t('commentsLoading') }}
    </div>
    <ul v-else-if="comments.length" class="device-comments-list">
      <li v-for="comment in comments" :key="comment.id" class="device-comments-list__item">
        <strong>{{ comment.authorName }}</strong>
        <span>{{ formatCommentDate(comment.createdAt) }}</span>
        <p>{{ comment.message }}</p>
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
        rows="4"
      ></textarea>
      <div class="device-comment-form__footer">
        <p class="device-comment-form__hint">{{ t('commentStubHint') }}</p>
        <button type="submit" class="device-access-panel__primary" :disabled="commentSubmitting || !commentDraft.trim()">
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

    <p v-if="actionMessage" class="device-access-panel__message">
      {{ actionMessage }}
    </p>
    <p v-if="status === 'auth_error' || status === 'network_error'" class="device-access-panel__technical-error">
      {{ t('commentFormUnavailable') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DeviceComment } from '../../.vitepress/theme/api/communityClient'
import { createDeviceComment, getDeviceComments } from '../../.vitepress/theme/api/communityClient'
import { useCloudAuth } from '../../.vitepress/theme/composables/useCloudAuth'

const props = defineProps<{
  deviceId: string
  t: (key: string) => string
}>()

const { status } = useCloudAuth()

const comments = ref<DeviceComment[]>([])
const commentsLoading = ref(false)
const commentSubmitting = ref(false)
const commentDraft = ref('')
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
</script>

<style scoped>
.device-access-panel {
  margin-top: 24px;
}

.device-access-panel__title {
  margin: 0 0 12px;
  font-size: 20px;
}

.device-access-panel__count {
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.device-access-panel__primary,
.device-access-panel__cta {
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

.device-access-panel__cta {
  margin-top: 14px;
  background: transparent;
  color: var(--vp-c-brand-1);
}

.device-access-panel__cta:hover,
.device-access-panel__cta:focus-visible {
  background: var(--vp-c-brand-soft);
}

.device-access-panel__primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.device-access-panel__empty,
.device-comment-form__hint,
.device-access-panel__technical-error {
  color: var(--vp-c-text-2);
}

.device-access-panel__empty,
.device-access-panel__message,
.device-access-panel__technical-error,
.device-comments-list__item p,
.device-comment-form__hint {
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
  margin: 6px 0 0;
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

.device-access-panel__message {
  margin-top: 12px;
  color: var(--vp-c-brand-1);
}

@media (max-width: 640px) {
  .device-comment-form__footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
