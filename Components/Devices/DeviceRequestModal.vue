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

        <form class="request-form" @submit.prevent="handleSubmit">
          <div class="request-form__grid">
            <label>
              <span>{{ t('requestVendorLabel') }}</span>
              <input v-model="form.vendor" type="text" autocomplete="organization" />
            </label>
            <label>
              <span>{{ t('requestModelLabel') }}</span>
              <input v-model="form.model" type="text" autocomplete="off" />
            </label>
            <label>
              <span>{{ t('requestTitleLabel') }}</span>
              <input v-model="form.title" type="text" autocomplete="off" />
            </label>
            <label>
              <span>{{ t('requestPictureLabel') }}</span>
              <input v-model="form.picture" type="url" inputmode="url" placeholder="https://" />
            </label>
          </div>

          <label>
            <span>{{ t('requestDescriptionLabel') }}</span>
            <textarea v-model="form.description" rows="4"></textarea>
          </label>

          <div class="request-form__grid">
            <label>
              <span>{{ t('requestExposesLabel') }}</span>
              <textarea v-model="form.exposesText" rows="4"></textarea>
            </label>
            <label>
              <span>{{ t('requestZigbeeModelsLabel') }}</span>
              <textarea v-model="form.zigbeeModelsText" rows="4"></textarea>
            </label>
          </div>

          <div class="request-form__grid">
            <label>
              <span>{{ t('requestLinksLabel') }}</span>
              <textarea v-model="form.buyLinksText" rows="3"></textarea>
            </label>
            <label>
              <span>{{ t('requestProtocolLabel') }}</span>
              <input v-model="form.protocol" type="text" autocomplete="off" />
            </label>
          </div>

          <div class="request-form__grid">
            <label>
              <span>{{ t('requestNotesLabel') }}</span>
              <textarea v-model="form.notes" rows="4"></textarea>
            </label>
            <label>
              <span>{{ t('requestPairingNotesLabel') }}</span>
              <textarea v-model="form.pairingNotes" rows="4"></textarea>
            </label>
          </div>

          <p class="request-form__hint">{{ t('requestStubHint') }}</p>
          <p v-if="submitMessage" class="request-form__message">{{ submitMessage }}</p>

          <div class="request-form__actions">
            <button type="button" class="request-form__secondary" @click="$emit('close')">
              {{ t('requestCancel') }}
            </button>
            <button type="submit" class="request-form__primary">
              {{ t('requestSubmit') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { createDeviceRequest } from '../../.vitepress/theme/api/communityClient'
import {
  buildDeviceRequestPayload,
  createEmptyDeviceRequestPrefill,
  type DeviceRequestPrefill,
} from './helpers/deviceRequestPrefill'

const props = defineProps<{
  show: boolean
  prefill: DeviceRequestPrefill
  t: (key: string) => string
}>()

defineEmits<{
  close: []
}>()

const form = reactive<DeviceRequestPrefill>(createEmptyDeviceRequestPrefill())
const submitMessage = computed(() => state.message)
const state = reactive({ message: '' })

watch(
  () => props.show,
  (visible) => {
    if (!visible) {
      return
    }

    Object.assign(form, createEmptyDeviceRequestPrefill(), props.prefill)
    state.message = ''
  },
  { immediate: true },
)

async function handleSubmit() {
  const payload = buildDeviceRequestPayload(form)

  try {
    await createDeviceRequest(payload)
  } catch {
    state.message = props.t('requestStubResult')

    if (import.meta.env.DEV) {
      console.debug('Device request stub payload', payload)
    }
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
.request-modal__header p {
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

.request-form__hint,
.request-form__message {
  margin: 0;
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
