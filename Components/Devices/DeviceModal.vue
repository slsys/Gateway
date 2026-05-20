<template>
  <transition name="modal-fade">
    <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-content">
        <button class="close-btn" @click="$emit('close')">x</button>
        <div v-if="device">
          <div class="modal-header">
            <span class="modal-title-text">{{ device['MODEL'] }}</span>
            <span v-if="device['HAVE_IN_LAB'] === '1'" class="badge in-lab">In lab</span>
          </div>
          <div class="modal-body">
            <img :src="imageUrl" alt="" class="modal-image" />
            <div class="modal-info">
              <p><strong>{{ t('converter') }}:</strong> {{ device['TITLE'] }}</p>
              <p>
                <strong>{{ t('manufacturer') }}:</strong>
                {{ vendors[device.VENDOR] ? vendors[device.VENDOR]['TITLE'] : device.VENDOR }}
              </p>
              <p><strong>{{ t('description') }}:</strong> {{ device['DESCRIPTION'] }}</p>
              <div v-if="Array.isArray(device['EXPOSES']) && device['EXPOSES'].length" class="states">
                <strong>{{ t('states') }}:</strong>
                <span v-for="state in device['EXPOSES']" :key="state" class="badge">{{ state }}</span>
              </div>
              <div
                v-if="Array.isArray(device['ZIGBEE_MODELS']) && device['ZIGBEE_MODELS'].length"
                class="states"
              >
                <strong>{{ t('zigbeeModels') }}:</strong>
                <span v-for="(zb, idx) in device['ZIGBEE_MODELS']" :key="idx" class="badge">
                  {{ zb['manufId'] }} / {{ zb['modelId'] }}
                </span>
              </div>
              <p v-if="device['UPDATED_IN']">
                <strong>{{ t('updatedInFirmware') }}:</strong> {{ device['UPDATED_IN'] }}
              </p>
              <div v-if="Array.isArray(device['BUY_LINKS']) && device['BUY_LINKS'].length" class="buy-links">
                <strong>{{ t('buyLinks') }}:</strong>
                <a
                  v-for="(link, idx) in device['BUY_LINKS']"
                  :key="idx"
                  :href="link.url"
                  target="_blank"
                  rel="noopener"
                  class="buy-button-inline"
                >
                  {{ link.name && link.name.trim() !== '' ? link.name : t('buy') }}
                </a>
              </div>
            </div>
          </div>
          <div v-if="decodedPairing" class="pairing">
            <p><strong>{{ t('pairing') }}:</strong></p>
            <div v-html="decodedPairing"></div>
          </div>
          <div v-if="decodedNotes" class="notes">
            <p><strong>{{ t('notes') }}:</strong></p>
            <div v-html="decodedNotes"></div>
          </div>
        </div>
        <div v-else>Loading...</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true },
  device: { type: Object, default: null },
  vendors: { type: Object, required: true },
  imageUrl: { type: String, default: '' },
  decodedPairing: { type: String, default: '' },
  decodedNotes: { type: String, default: '' },
  t: { type: Function, required: true },
})

defineEmits(['close'])
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  padding: 20px;
  max-height: 80vh;
  overflow: auto;
  border-radius: 8px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: var(--vp-c-text-1);
  font-size: 24px;
  cursor: pointer;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.modal-title-text {
  display: inline-block;
  font-size: 1.5em;
}

.modal-body {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.modal-image {
  width: 300px;
  max-width: 100%;
  margin-bottom: 16px;
}

.modal-info {
  flex: 1;
}

.badge {
  display: inline-block;
  background: var(--vp-c-divider);
  color: var(--vp-c-text-1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.in-lab {
  background-color: #4caf50;
  color: white;
}

:global(.dark) .in-lab {
  background-color: #2e7d32;
}

.states {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
  align-items: center;
}

.states strong {
  margin-right: 6px;
}

.buy-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.buy-button-inline {
  border: 1px solid var(--vp-c-brand);
  color: var(--vp-c-brand);
  background: transparent;
  padding: 4px 8px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 13px;
  transition: background 0.2s, color 0.2s;
}

.buy-button-inline:hover {
  background: var(--vp-c-brand);
  color: white;
}

.notes,
.pairing {
  margin-top: 8px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .modal-content {
    width: 100%;
    height: 100%;
    max-height: none;
    border-radius: 0;
    padding: 16px;
    box-sizing: border-box;
  }

  .modal-body {
    flex-direction: column-reverse;
    align-items: stretch;
    overflow-y: auto;
    flex: 1;
  }

  .modal-image {
    width: 100%;
    max-width: none;
    height: 180px;
    object-fit: contain;
    margin-bottom: 16px;
  }

  .modal-info {
    width: 100%;
    order: -1;
    margin-bottom: 16px;
  }
}
</style>
