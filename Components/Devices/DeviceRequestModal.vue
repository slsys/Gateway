<template>
  <transition name="modal-fade">
    <div v-if="show" class="request-backdrop" @click.self="$emit('close')">
      <div class="request-modal">
        <button type="button" class="request-modal__close" @click="$emit('close')">x</button>
        <div class="request-modal__header">
          <p class="request-modal__eyebrow">{{ t('requestButton') }}</p>
          <h2>{{ t('requestModalTitle') }}</h2>
          <p>{{ t('requestModalDescription') }}</p>
        </div>

        <div v-if="prefillWarnings.length" class="request-modal__warning">
          <p>{{ t('requestPrefillWarningTitle') }}</p>
          <ul>
            <li v-for="warning in prefillWarnings" :key="warning">{{ t(warning) }}</li>
          </ul>
        </div>

        <form class="request-form" @submit.prevent="handleSubmit">
          <div class="request-form__grid">
            <label>
              <span>{{ t('requestVendorLabel') }}</span>
              <input v-model="form.vendor" type="text" autocomplete="organization" />
            </label>
            <label>
              <span>{{ t('requestModelLabel') }}</span>
              <input v-model="form.model" type="text" autocomplete="off" required />
            </label>
            <label>
              <span>{{ t('requestManufacturerNameLabel') }}</span>
              <input v-model="form.manufacturerName" type="text" autocomplete="organization" />
            </label>
            <label>
              <span>{{ t('requestModelIdLabel') }}</span>
              <input v-model="form.modelId" type="text" autocomplete="off" />
            </label>
            <label>
              <span>{{ t('requestManufIdLabel') }}</span>
              <input v-model="form.manufId" type="text" autocomplete="off" />
            </label>
            <label>
              <span>{{ t('requestIeeeAddrLabel') }}</span>
              <input v-model="form.ieeeAddr" type="text" autocomplete="off" />
            </label>
            <label>
              <span>{{ t('requestUpdatedInLabel') }}</span>
              <input v-model="form.updatedIn" type="text" autocomplete="off" placeholder="0.0.0" />
            </label>
            <label>
              <span>{{ t('requestPowerSourceLabel') }}</span>
              <input v-model="form.powerSource" type="number" min="0" inputmode="numeric" />
            </label>
            <label>
              <span>{{ t('requestSourceLabel') }}</span>
              <input v-model="form.source" type="text" autocomplete="off" />
            </label>
          </div>

          <label>
            <span>{{ t('requestDescriptionLabel') }}</span>
            <textarea v-model="form.description" rows="4"></textarea>
          </label>

          <label>
            <span>{{ t('requestExposesLabel') }}</span>
            <textarea v-model="form.exposes" rows="3"></textarea>
          </label>

          <div class="request-form__grid">
            <label>
              <span>{{ t('requestEndpointsLabel') }}</span>
              <textarea v-model="form.endpoints" rows="5"></textarea>
            </label>
            <label>
              <span>{{ t('requestClustersLabel') }}</span>
              <textarea v-model="form.clusters" rows="5"></textarea>
            </label>
          </div>

          <div class="request-form__grid">
            <label>
              <span>{{ t('requestInterviewLabel') }}</span>
              <textarea v-model="form.interview" rows="6"></textarea>
            </label>
            <label>
              <span>{{ t('requestRawPayloadLabel') }}</span>
              <textarea v-model="form.rawPayload" rows="6"></textarea>
            </label>
          </div>

          <p class="request-form__hint">{{ t('requestSubmitHint') }}</p>
          <p v-if="submitMessage" class="request-form__message">{{ submitMessage }}</p>

          <div class="request-form__actions">
            <button type="button" class="request-form__secondary" @click="$emit('close')">
              {{ t('requestCancel') }}
            </button>
            <button type="submit" class="request-form__primary" :disabled="submitting || !form.model.trim()">
              {{ submitting ? t('requestSubmitting') : t('requestSubmit') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { CommunityApiError, createDeviceRequest } from '../../.vitepress/theme/api/communityClient'
import {
  buildDeviceRequestPayload,
  createEmptyDeviceRequestPrefill,
  getDeviceRequestPayloadWarnings,
  type DeviceRequestPrefill,
} from './helpers/deviceRequestPrefill'

const props = defineProps<{
  show: boolean
  prefill: DeviceRequestPrefill
  prefillWarnings: string[]
  t: (key: string) => string
}>()

defineEmits<{
  close: []
}>()

const form = reactive<DeviceRequestPrefill>(createEmptyDeviceRequestPrefill())
const submitting = ref(false)
const submitMessage = ref('')

watch(
  () => props.show,
  (visible) => {
    if (!visible) {
      return
    }

    Object.assign(form, createEmptyDeviceRequestPrefill(), props.prefill)
    submitMessage.value = ''
  },
  { immediate: true },
)

function mapRequestError(err: unknown, t: (key: string) => string) {
  if (err instanceof CommunityApiError) {
    if (err.code === 'not_authenticated') {
      return t('communityAuthRequired')
    }
    if (err.code === 'auth_service_unavailable') {
      return t('communityAuthServiceUnavailable')
    }
    if (err.status === 422) {
      return t('communityValidationError')
    }
  }

  return t('communityRequestFailed')
}

async function handleSubmit() {
  if (!form.model.trim()) {
    submitMessage.value = props.t('communityValidationError')
    return
  }

  const localWarnings = getDeviceRequestPayloadWarnings(form)
  if (localWarnings.length > 0) {
    submitMessage.value = props.t(localWarnings[0])
    return
  }

  submitting.value = true
  submitMessage.value = ''

  try {
    const result = await createDeviceRequest(buildDeviceRequestPayload(form))
    submitMessage.value = `${props.t('requestSuccessPrefix')} ${result.status}`

    if (import.meta.env.DEV) {
      console.debug('Device request accepted', result)
    }
  } catch (err) {
    submitMessage.value = mapRequestError(err, props.t)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.request-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
}

.request-modal {
  position: relative;
  width: min(920px, calc(100vw - 32px));
  max-height: min(88vh, 920px);
  overflow: auto;
  padding: 24px;
  border-radius: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-shadow: var(--vp-shadow-4);
}

.request-modal__close {
  position: absolute;
  top: 18px;
  right: 18px;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 24px;
  cursor: pointer;
}

.request-modal__header h2,
.request-modal__header p,
.request-modal__warning p,
.request-form__hint,
.request-form__message {
  margin: 0;
}

.request-modal__eyebrow {
  margin-bottom: 6px;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.request-modal__header p:last-child {
  margin-top: 8px;
  color: var(--vp-c-text-2);
}

.request-modal__warning {
  margin-top: 16px;
  padding: 12px 14px;
  border: 1px solid var(--vp-c-warning-1);
  border-radius: 10px;
  background: var(--vp-c-warning-soft);
}

.request-modal__warning ul {
  margin: 8px 0 0;
  padding-left: 20px;
}

.request-form {
  display: grid;
  gap: 16px;
  margin-top: 20px;
}

.request-form__grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.request-form label {
  display: grid;
  gap: 8px;
}

.request-form span {
  font-weight: 600;
}

.request-form input,
.request-form textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  box-sizing: border-box;
  resize: vertical;
}

.request-form__hint {
  color: var(--vp-c-text-2);
}

.request-form__message {
  color: var(--vp-c-brand-1);
}

.request-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.request-form__primary,
.request-form__secondary {
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  border: 1px solid var(--vp-c-brand-1);
}

.request-form__primary {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
}

.request-form__primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.request-form__secondary {
  background: transparent;
  color: var(--vp-c-brand-1);
}

@media (max-width: 700px) {
  .request-modal {
    width: 100%;
    height: 100%;
    max-height: none;
    border-radius: 0;
    padding: 18px;
  }

  .request-form__grid {
    grid-template-columns: 1fr;
  }

  .request-form__actions {
    flex-direction: column-reverse;
  }
}
</style>
