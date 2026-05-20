<template>
  <section class="firmware-uploader">
    <div class="installer-panel">
      <img src="/img/sls.svg" alt="" class="installer-logo" />

      <div class="installer-content">
        <h1>{{ t('title') }}</h1>
        <ol class="steps">
          <li>{{ t('stepConnect') }}</li>
          <li>{{ t('stepSelect') }}</li>
          <li>{{ t('stepInstall') }}</li>
          <li>{{ t('stepBoot') }}</li>
        </ol>

        <div class="firmware-controls">
          <label class="field">
            <span>{{ t('version') }}</span>
            <select v-model="selectedVersion">
              <option v-for="version in versions" :key="version" :value="version">
                {{ version }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>{{ t('board') }}</span>
            <select v-model="selectedBoard">
              <option v-for="board in boards" :key="board.id" :value="board.id">
                {{ board.label }}
              </option>
            </select>
          </label>
        </div>

        <div class="install-row">
          <esp-web-install-button
            :key="manifestUrl"
            ref="installButton"
            :manifest="manifestUrl"
          >
            <button class="install-button" slot="activate">{{ t('install') }}</button>
            <span slot="unsupported">{{ t('unsupported') }}</span>
            <span slot="not-allowed">{{ t('notAllowed') }}</span>
          </esp-web-install-button>
        </div>

        <label class="erase-toggle">
          <input v-model="eraseFirst" type="checkbox" />
          <span>{{ t('eraseFirst') }}</span>
        </label>
      </div>

      <footer class="drivers">
        CH341:
        <a href="https://github.com/nodemcu/nodemcu-devkit/tree/master/Drivers" target="_blank" rel="noopener">
          driver
        </a>
        CP2102:
        <a href="https://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers" target="_blank" rel="noopener">
          driver
        </a>
      </footer>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'

const { lang } = useData()

const versions = ['2026.02.01d1', '2026.01.15d2', '2025.12.20d1']
const boards = [
  { id: 'esp32', label: 'ESP32 Classic' },
  { id: 'esp32-s3', label: 'ESP32-S3' },
]

const selectedVersion = ref(versions[0])
const selectedBoard = ref(boards[0].id)
const eraseFirst = ref(false)
const installButton = ref(null)

const messages = {
  ru: {
    title: 'Установить SLS Gate',
    stepConnect: 'Подключите ESP к компьютеру через USB-кабель или serial-to-USB адаптер.',
    stepSelect: 'Выберите версию прошивки и плату.',
    stepInstall: 'Нажмите "Установить" и выберите COM-порт подключенной ESP.',
    stepBoot: 'Удерживайте кнопку flash/boot до окончания прошивки, если это требует производитель платы.',
    version: 'Версия прошивки',
    board: 'Плата',
    install: 'Установить',
    eraseFirst: 'Чистая установка: стереть память ESP перед прошивкой',
    unsupported: 'Ваш браузер не поддерживает Web Serial. Используйте Chrome, Edge или другой совместимый браузер.',
    notAllowed: 'Страница должна быть открыта в безопасном контексте HTTPS или на localhost.',
  },
  en: {
    title: 'Install SLS Gate',
    stepConnect: 'Connect ESP to the computer using a USB cable or serial-to-USB adapter.',
    stepSelect: 'Select firmware version and board.',
    stepInstall: 'Click "Install" and select the ESP COM port.',
    stepBoot: 'Hold the flash/boot button until flashing is complete if your board requires it.',
    version: 'Firmware version',
    board: 'Board',
    install: 'Install',
    eraseFirst: 'Clean install: erase ESP flash before installation',
    unsupported: 'Your browser does not support Web Serial. Use Chrome, Edge, or another compatible browser.',
    notAllowed: 'This page must be opened in a secure HTTPS context or on localhost.',
  },
}

const locale = computed(() => (lang.value.startsWith('ru') ? 'ru' : 'en'))
const t = (key) => messages[locale.value][key] || key

const manifestUrl = computed(() => {
  return withBase(`/firmware/sls-gate/manifests/sls-gate-${selectedVersion.value}-${selectedBoard.value}.json`)
})

function syncEraseAttribute() {
  const element = installButton.value
  if (!element) {
    return
  }

  if (eraseFirst.value) {
    element.setAttribute('erase-first', '')
  } else {
    element.removeAttribute('erase-first')
  }
}

onMounted(async () => {
  if (!customElements.get('esp-web-install-button')) {
    await import('https://unpkg.com/esp-web-tools@10.0.1/dist/web/install-button.js?module')
  }

  syncEraseAttribute()
})

watch([eraseFirst, manifestUrl], async () => {
  await nextTick()
  syncEraseAttribute()
})
</script>

<style scoped>
.firmware-uploader {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px;
}

.installer-panel {
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.08);
}

.installer-logo {
  display: block;
  height: 170px;
  width: 100%;
  padding-top: 40px;
  object-fit: contain;
}

.installer-content {
  padding: 24px;
}

.installer-content h1 {
  margin: 0 0 16px;
  text-align: center;
  font-size: 28px;
}

.steps {
  margin: 0 0 20px;
  padding-left: 22px;
  line-height: 1.75;
  list-style: decimal;
}

.steps li {
  padding-left: 4px;
}

.firmware-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
}

.field select {
  height: 38px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 0 10px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.install-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 10px 0 14px;
}

.install-button {
  border: 0;
  border-radius: 6px;
  padding: 8px 18px;
  background: var(--vp-c-brand-3);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.install-button:hover {
  background: var(--vp-c-brand-2);
}

.erase-toggle {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  line-height: 1.4;
}

.drivers {
  padding: 10px 14px;
  border-top: 1px solid var(--vp-c-divider);
  text-align: right;
  font-size: 12px;
  line-height: 1.4;
  color: var(--vp-c-text-2);
}

.drivers a {
  margin-right: 10px;
}

@media (max-width: 640px) {
  .firmware-controls {
    grid-template-columns: 1fr;
  }

  .installer-content {
    padding: 18px;
  }
}
</style>
