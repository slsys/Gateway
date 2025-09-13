<template>
  <section class="progressive-cards">
    <div class="controls">
    </div>

    <!-- Filters -->
    <div class="filters">
      <input
          type="text"
          v-model="search"
          :placeholder="t('filterPlaceholder')"
          class="filter-input"
      />
      <select v-model="vendorFilter" class="filter-select">
        <option value="">{{ t('allVendors') }}</option>
        <option v-for="(vendor, id) in vendors" :key="id" :value="id">{{ vendor.TITLE }}</option>
      </select>
      <select v-model="groupBy" class="filter-select">
        <option value="none">{{ t('noGroup') }}</option>
        <option value="vendor">{{ t('groupByVendor') }}</option>
      </select>
    </div>

    <!-- Grouped cards -->
    <div v-if="groupBy !== 'none'">
      <div v-for="(groupData, groupKey) in groupedItems" :key="groupKey" class="group">
        <h2 class="group-title">
          <span class="vendor-header">
            <img v-if="groupData.picture" :src="'https://slsys.io/' + groupData.picture" alt="" class="vendor-icon" />
            {{ groupKey }}
          </span>
        </h2>
        <div class="grid">
          <article v-for="item in groupData.items" :key="item.id" class="card" @click="openModal(item.ID)">
            <img
                :src="getImageUrl(item)"
                :alt="item.name || 'image'"
                loading="lazy"
                class="card-image"
            />
            <div class="body">
              <h3 class="title">{{ item.MODEL }}</h3>
              <p class="desc">{{ item.DESCRIPTION || 'No description' }}</p>
            </div>
          </article>
        </div>
      </div>
    </div>

    <!-- Ungrouped cards -->
    <div v-else class="grid">
      <!-- skeletons while first page loads -->
      <template v-if="loading && items.length === 0">
        <div v-for="n in pageSize" :key="`skeleton-${n}`" class="card skeleton">
          <div class="image"></div>
          <div class="body">
            <div class="title"></div>
            <div class="desc"></div>
          </div>
        </div>
      </template>

      <article v-for="item in filteredItems" :key="item.id" class="card" @click="openModal(item.ID)">
        <img
            :src="getImageUrl(item)"
            :alt="item.MODEL || 'image'"
            loading="lazy"
            class="card-image"
        />
        <div class="body">
          <h3 class="title">{{ item.MODEL }}</h3>
          <p class="desc">{{ item.DESCRIPTION || 'No description' }}</p>
        </div>
      </article>
    </div>

    <!-- loader / manual control -->
    <div class="bottom">
      <button v-if="!autoLoad && hasMore && !loading" @click="loadPage" class="btn">{{ t('loadMore') }}</button>
      <div v-if="loading && items.length > 0" class="mini-loader">Loading...</div>
      <div v-if="!hasMore && items.length > 0" class="end">{{ t('noMoreItems') }}</div>
    </div>

    <div ref="sentinel" class="sentinel" aria-hidden="true"></div>

    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-content">
        <button class="close-btn" @click="closeModal">×</button>
        <div v-if="modalData">
          <h3 class="modal-title">{{ modalData.MODEL }}</h3>
          <div class="modal-body">
            <img :src="getImageUrl(modalData)" alt="" class="modal-image"/>
            <div class="modal-info">
              <p><strong>{{ t('converter') }}:</strong> {{ modalData.TITLE }}</p>
              <p><strong>{{ t('manufacturer') }}:</strong> {{ vendors[modalData.VENDOR] ? vendors[modalData.VENDOR].TITLE : modalData.VENDOR }}</p>
              <p><strong>{{ t('description') }}:</strong> {{ modalData.DESCRIPTION }}</p>
            </div>
          </div>
        </div>
        <div v-else>Loading...</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import en from './locales/en.json'
import ru from './locales/ru.json'

import { useData } from 'vitepress'
const { lang } = useData()
const t = (key) => {
  const dict = lang.value.startsWith('ru') ? ru : en
  return dict[key] || key
}

const props = defineProps({
  pageSize: { type: Number, default: 20 },
  autoLoad: { type: Boolean, default: true },
  maxPages: { type: Number, default: Infinity },
})

const items = ref([])
const page = ref(1)
const loading = ref(false)
const error = ref('')
const hasMore = ref(true)
const sentinel = ref(null)
let observer = null

// filters
const search = ref('')
const groupBy = ref('none')
const vendorFilter = ref('')

const showModal = ref(false)
const modalData = ref(null)

const vendors = ref({})

const filteredItems = computed(() => {
  let base = items.value
  if (search.value) {
    base = base.filter((it) => {
      const modelMatch = (it.MODEL || '').toLowerCase().includes(search.value.toLowerCase())
      const zigbeeMatch = Array.isArray(it.ZIGBEE_MODELS) &&
        it.ZIGBEE_MODELS.some(z => (z.modelId || '').toLowerCase().includes(search.value.toLowerCase()))
      return modelMatch || zigbeeMatch
    })
  }
  if (vendorFilter.value) {
    base = base.filter(it => String(it.VENDOR) === String(vendorFilter.value))
  }
  return base
})

const groupedItems = computed(() => {
  if (groupBy.value === 'vendor') {
    return filteredItems.value.reduce((acc, item) => {
      const vendorObj = vendors.value[item.VENDOR]
      const key = vendorObj ? vendorObj.TITLE : 'Unknown'
      if (!acc[key]) acc[key] = { items: [], picture: vendorObj ? vendorObj.PICTURE : '' }
      acc[key].items.push(item)
      return acc
    }, {})
  }
  return { All: filteredItems.value }
})

function getImageUrl(item) {
  return `https://slsys.io/${item.PICTURE}`
}

async function fetchData() {
  const resp = await fetch('/ru/ajax/supported_devices?op=get_devices')
  if (!resp.ok) throw new Error(`Server error: ${resp.status}`)
  const json = await resp.json()
  if (!json.data) throw new Error('Unexpected response format')
  return json.data
}

async function fetchVendors() {
  const resp = await fetch('/ru/ajax/supported_devices?op=get_vendors')
  if (!resp.ok) throw new Error(`Server error: ${resp.status}`)
  const json = await resp.json()
  if (!json.data) throw new Error('Unexpected response format')
  vendors.value = json.data.reduce((acc, v) => {
    acc[v.ID] = v
    return acc
  }, {})
}

async function loadPage() {
  if (loading.value || !hasMore.value) return
  if (page.value > props.maxPages) {
    hasMore.value = false
    return
  }

  loading.value = true
  error.value = ''
  try {
    const data = await fetchData()
    items.value = data
    hasMore.value = false// API возвращает всё сразу
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Failed to load data'
  } finally {
    loading.value = false
  }
}

function setupObserver() {
  if (!props.autoLoad) return
  if (!('IntersectionObserver' in window)) return

  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && hasMore.value && !loading.value) {
        loadPage()
      }
    }
  }, {
    root: null,
    rootMargin: '300px',
    threshold: 0.1,
  })

  if (sentinel.value) observer.observe(sentinel.value)
}

function teardownObserver() {
  if (observer && sentinel.value) observer.unobserve(sentinel.value)
  observer = null
}

async function openModal(id) {
  const resp = await fetch(`/ru/ajax/supported_devices?op=get_device&id=${id}`)
  const json = await resp.json()
  modalData.value = json.data
  showModal.value = true
  const url = new URL(window.location)
  url.searchParams.set('device', id)
  history.pushState({}, '', url)
}
function closeModal() {
  showModal.value = false
  const url = new URL(window.location)
  url.searchParams.delete('device')
  history.pushState({}, '', url)
}

onMounted(async () => {
  await fetchVendors()
  await loadPage()
  const params = new URLSearchParams(window.location.search)
  const dev = params.get('device')
  if (dev) openModal(dev)
  setupObserver()
})

onBeforeUnmount(() => {
  teardownObserver()
})

watch(() => props.autoLoad, (v) => {
  teardownObserver()
  if (v) setupObserver()
})
</script>

<style scoped>
.progressive-cards {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}
.controls {
  display:flex;
  gap:12px;
  align-items:center;
  margin-bottom:12px;
}
.filters {
  display:flex;
  gap:12px;
  margin-bottom:16px;
  justify-content: flex-end;
}
.filter-input, .filter-select {
  padding:6px 10px;
  border:1px solid #ccc;
  border-radius:6px;
  min-width: 180px;
}
.group { margin-bottom: 24px; }
.group-title { font-size: 20px; margin: 12px 0; }
.btn{ padding:8px 12px; border-radius:6px; border:1px solid #ccc; background:transparent; cursor:pointer }
.error{ color: #b00020 }
.grid{
  display:grid;
  grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
  gap:16px;
}
.card{
  background: var(--vp-c-bg);
  color: var(--vp-c-text);
  border-radius:10px;
  overflow:hidden;
  border: 1px solid var(--vp-c-divider, rgba(255,255,255,0.1));
  box-shadow:0 2px 8px rgba(0,0,0,0.06);
  display:flex;
  flex-direction:column;
  transition: transform 0.3s;
}
.card:hover {
  transform: scale(1.05);
}
.card-image{  object-fit:cover; display:block ; padding: 40px 20px}
.body{ padding:12px }
.title{ font-size:16px; margin:0 0 8px }
.desc{ font-size:13px; color: var(--vp-c-text-soft, var(--vp-c-text)); margin:0 }
.skeleton{ animation: pulse 1.2s infinite; background:linear-gradient(90deg,#f5f5f5,#efefef,#f5f5f5) }
.skeleton .image{ height:140px; background:#eee }
.skeleton .title{ height:18px; width:60%; background:#e7e7e7; margin-bottom:8px }
.skeleton .desc{ height:12px; width:100%; background:#e7e7e7 }
.mini-loader{ text-align:center; padding:12px }
.end{ text-align:center; padding:12px; color:#666 }
.sentinel{ height:1px }

@keyframes pulse{ 0%{opacity:1}50%{opacity:0.6}100%{opacity:1} }

.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: var(--vp-c-bg);
  color: var(--vp-c-text);
  padding: 20px;
  max-height: 80vh;
  overflow: auto;
  border-radius: 8px;
  position: relative;
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
.modal-image {
  max-width: 100%;
  margin-bottom: 16px;
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
.modal-title { font-size: 1.5em; margin-bottom: 16px; }
.modal-body { display: flex; align-items: flex-start; gap: 20px; }
.modal-info { flex: 1; }

.model-ids {
  margin-top: 8px;
}
.badge {
  display: inline-block;
  background: var(--vp-c-divider, #ddd);
  color: var(--vp-c-text);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
  margin-bottom: 4px;
}
.states .badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
</style>
