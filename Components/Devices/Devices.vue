<template>
  <section class="devices-page">
    <DeviceFilters
      v-model:search="search"
      v-model:vendor-filter="vendorFilter"
      v-model:group-by="groupBy"
      :vendors="vendors"
      :t="t"
    />

    <p v-if="error" class="devices-error">{{ error }}</p>

    <template v-if="initialLoading">
      <div class="devices-grid">
        <DeviceCardSkeleton v-for="n in pageSize" :key="`skeleton-${n}`" />
      </div>
    </template>

    <template v-else-if="groupBy === 'vendor'">
      <TransitionGroup name="device-group" tag="div">
        <div v-for="group in groupedItems" :key="group.key" class="devices-group">
        <h2 class="devices-group-title">
          <span class="vendor-header">
            <img
              v-if="group.picture"
              :src="assetUrl(group.picture)"
              alt=""
              class="vendor-icon"
              loading="lazy"
            />
            {{ group.key }}
          </span>
        </h2>
        <TransitionGroup name="device-card-list" tag="div" class="devices-grid">
          <DeviceCard
            v-for="item in group.items"
            :key="deviceKey(item)"
            :item="item"
            :image-url="getImageUrl(item)"
            @open="openModal"
          />
        </TransitionGroup>
        </div>
      </TransitionGroup>
    </template>

    <template v-else>
      <TransitionGroup name="device-card-list" tag="div" class="devices-grid">
        <DeviceCard
          v-for="item in visibleItems"
          :key="deviceKey(item)"
          :item="item"
          :image-url="getImageUrl(item)"
          @open="openModal"
        />
        <DeviceCardSkeleton
          v-for="n in pagingSkeletonCount"
          :key="`paging-skeleton-${n}`"
        />
      </TransitionGroup>
    </template>

    <div class="devices-bottom">
      <button
        v-if="canRenderMore && !autoLoad"
        type="button"
        class="load-more-button"
        @click="renderNextPage"
      >
        {{ t('loadMore') }}
      </button>
    </div>

    <div ref="sentinel" class="sentinel" aria-hidden="true"></div>

    <DeviceModal
      :show="showModal"
      :device="modalData"
      :vendors="vendors"
      :image-url="modalData ? getImageUrl(modalData) : ''"
      :decoded-pairing="decodedPairing"
      :decoded-notes="decodedNotes"
      :t="t"
      @close="closeModal"
    />
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { marked } from 'marked'
import DeviceCard from './DeviceCard.vue'
import DeviceCardSkeleton from './DeviceCardSkeleton.vue'
import DeviceFilters from './DeviceFilters.vue'
import DeviceModal from './DeviceModal.vue'
import en from './locales/en.json'
import ru from './locales/ru.json'

const { lang } = useData()

const props = defineProps({
  pageSize: { type: Number, default: 24 },
  autoLoad: { type: Boolean, default: true },
  maxPages: { type: Number, default: Infinity },
})

const allItems = ref([])
const vendors = ref({})
const initialLoading = ref(false)
const paging = ref(false)
const error = ref('')
const sentinel = ref(null)
const observer = ref(null)
const visibleCount = ref(props.pageSize)

const search = ref('')
const groupBy = ref('none')
const vendorFilter = ref('')

const showModal = ref(false)
const modalData = ref(null)
const CMS_ORIGIN = (import.meta.env.VITE_SLS_CMS_ORIGIN || 'https://api.slsys.io').replace(/\/$/, '')

const t = (key) => {
  const dict = lang.value.startsWith('ru') ? ru : en
  return dict[key] || key
}

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()

  return allItems.value.filter((item) => {
    if (vendorFilter.value && String(item['VENDOR']) !== String(vendorFilter.value)) {
      return false
    }

    if (!query) {
      return true
    }

    const modelMatch = (item['MODEL'] || '').toLowerCase().includes(query)
    const titleMatch = (item['TITLE'] || '').toLowerCase().includes(query)
    const zigbeeMatch =
      Array.isArray(item['ZIGBEE_MODELS']) &&
      item['ZIGBEE_MODELS'].some((zigbeeModel) => {
        return (
          (zigbeeModel['modelId'] || '').toLowerCase().includes(query) ||
          (zigbeeModel['manufId'] || '').toLowerCase().includes(query)
        )
      })

    return modelMatch || titleMatch || zigbeeMatch
  })
})

const maxVisibleCount = computed(() => props.pageSize * props.maxPages)

const visibleItems = computed(() => {
  return filteredItems.value.slice(0, Math.min(visibleCount.value, maxVisibleCount.value))
})

const canRenderMore = computed(() => {
  return visibleItems.value.length < filteredItems.value.length &&
    visibleItems.value.length < maxVisibleCount.value
})

const pagingSkeletonCount = computed(() => {
  if (!paging.value || !canRenderMore.value) {
    return 0
  }

  return Math.min(props.pageSize, filteredItems.value.length - visibleItems.value.length)
})

const groupedItems = computed(() => {
  const groups = new Map()

  for (const item of visibleItems.value) {
    const vendor = vendors.value[item['VENDOR']]
    const key = vendor ? vendor['TITLE'] : t('unknownVendor')

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        picture: vendor ? vendor['PICTURE'] : '',
        items: [],
      })
    }

    groups.get(key).items.push(item)
  }

  return Array.from(groups.values())
})

const decodedNotes = computed(() => {
  return decodeLocalizedText(modalData.value && modalData.value['NOTES'])
})

const decodedPairing = computed(() => {
  const decoded = decodeLocalizedText(modalData.value && modalData.value['PAIRING_NOTES'])
  return decoded ? marked(decoded) : ''
})

function assetUrl(path) {
  return `${CMS_ORIGIN}/${path}`
}

function getImageUrl(item) {
  return assetUrl(item['PICTURE'])
}

function deviceKey(item) {
  return `${item.id || item['ID'] || item['TITLE']}-${item['TITLE']}`
}

async function fetchJson(url) {
  const response = await fetch(new URL(url, CMS_ORIGIN))
  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`)
  }

  const json = await response.json()
  if (!json.data) {
    throw new Error('Unexpected response format')
  }

  return json.data
}

async function fetchDevices() {
  return fetchJson('/ru/ajax/supported_devices?op=get_devices')
}

async function fetchVendors() {
  const data = await fetchJson('/ru/ajax/supported_devices?op=get_vendors')
  vendors.value = data.reduce((acc, vendor) => {
    acc[vendor['ID']] = vendor
    return acc
  }, {})
}

async function loadData() {
  initialLoading.value = true
  error.value = ''

  try {
    await fetchVendors()
    allItems.value = await fetchDevices()
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Failed to load data'
  } finally {
    initialLoading.value = false
  }
}

async function renderNextPage() {
  if (!canRenderMore.value || paging.value) {
    return
  }

  paging.value = true
  await nextTick()

  requestAnimationFrame(() => {
    visibleCount.value = Math.min(
      visibleCount.value + props.pageSize,
      filteredItems.value.length,
      maxVisibleCount.value
    )
    paging.value = false
  })
}

function setupObserver() {
  if (!props.autoLoad || !sentinel.value || typeof IntersectionObserver === 'undefined') {
    return
  }

  observer.value = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        renderNextPage()
      }
    },
    { rootMargin: '800px 0px' }
  )

  observer.value.observe(sentinel.value)
}

async function openModal(itemOrTitle) {
  const title = typeof itemOrTitle === 'string' ? itemOrTitle : itemOrTitle['TITLE']
  showModal.value = true
  modalData.value = null
  document.body.classList.add('modal-open')

  try {
    const data = await fetchJson(`/ru/ajax/supported_devices?op=get_device&id=${encodeURIComponent(title)}`)
    modalData.value = data

    const url = new URL(window.location)
    url.searchParams.set('device', title)
    history.pushState({}, '', url)
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Failed to load device'
  }
}

function closeModal() {
  showModal.value = false
  modalData.value = null
  document.body.classList.remove('modal-open')

  const url = new URL(window.location)
  url.searchParams.delete('device')
  history.pushState({}, '', url)
}

function decodeLocalizedText(notes) {
  if (!notes || Object.keys(notes).length === 0) {
    return ''
  }

  const candidates = [lang.value, 'en', ...Object.keys(notes)]

  for (const key of candidates) {
    const value = notes[key]
    if (!value || String(value).trim() === '') {
      continue
    }

    try {
      const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
      return new TextDecoder().decode(bytes)
    } catch (err) {
      console.warn(`Failed to decode localized text for ${key}`, err)
    }
  }

  return ''
}

watch([search, vendorFilter, groupBy], () => {
  visibleCount.value = props.pageSize
  paging.value = false
})

onMounted(async () => {
  await loadData()
  setupObserver()

  const params = new URLSearchParams(window.location.search)
  const device = params.get('device')
  if (device) {
    await openModal(device)
  }
})

onBeforeUnmount(() => {
  observer.value?.disconnect()
  document.body.classList.remove('modal-open')
})
</script>

<style scoped>
.devices-page {
  --device-card-height: 392px;
  --device-card-media-height: 280px;
  --device-card-height-mobile: 260px;
  --device-card-media-height-mobile: 150px;

  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}

.devices-error {
  margin: 12px 0;
  color: var(--vp-c-danger-1);
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  align-items: stretch;
}

.devices-group {
  margin-bottom: 24px;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.devices-group-title {
  font-size: 20px;
  margin: 12px 0;
}

.vendor-header {
  display: inline-flex;
  align-items: center;
}

.vendor-icon {
  width: auto;
  height: 1.5em;
  margin-right: 8px;
  object-fit: contain;
}

.devices-bottom {
  min-height: 40px;
  display: flex;
  justify-content: center;
  padding: 16px 0 8px;
}

.load-more-button {
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-brand-1);
  padding: 6px 12px;
  cursor: pointer;
}

.load-more-button:hover {
  background: var(--vp-c-brand-soft);
}

.sentinel {
  height: 1px;
}

.device-card-list-move,
.device-group-move {
  transition: transform 0.24s ease;
}

.device-card-list-enter-active,
.device-card-list-leave-active,
.device-group-enter-active,
.device-group-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.device-card-list-enter-from,
.device-card-list-leave-to,
.device-group-enter-from,
.device-group-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.device-card-list-leave-active,
.device-group-leave-active {
  position: absolute;
}

:global(body.modal-open) {
  overflow: hidden;
}

@media (max-width: 600px) {
  .devices-page {
    padding: 12px;
  }

  .devices-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
}
</style>
