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
        <option v-for="(vendor, id) in vendors" :key="id" :value="id">{{ vendor['TITLE'] }}</option>
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
        <transition-group name="card" tag="div" class="grid">
          <article v-for="item in groupData.items" :key="item.id + '-' + item['TITLE']" class="card" @click="openModal(item['TITLE'])">
            <span class="badge title-badge">#{{ item['TITLE'] }}</span>
            <img
                :src="getImageUrl(item)"
                :alt="item.name || 'image'"
                loading="lazy"
                class="card-image"
            />
            <div class="body">
              <h3 class="title">{{ item['MODEL'] }}</h3>
              <p class="desc">{{ item['DESCRIPTION'] || 'No description' }}</p>
              <span v-if="item['HAVE_IN_LAB'] === '1'" class="badge in-lab">In lab</span>
            </div>
          </article>
        </transition-group>
      </div>
    </div>

    <!-- Ungrouped cards -->
    <transition-group v-else name="card" tag="div" class="grid">
      <!-- skeletons while loading -->
      <template v-if="loading && items.length === 0">
        <div v-for="n in pageSize" :key="`skeleton-${n}`" class="card skeleton">
          <div class="image"></div>
          <div class="body">
            <div class="title"></div>
            <div class="desc"></div>
          </div>
        </div>
      </template>

      <article v-for="item in filteredItems" :key="item.id + '-' + item['TITLE']" class="card" @click="openModal(item['TITLE'])">
        <span class="badge title-badge">#{{ item['TITLE'] }}</span>
        <img
            :src="getImageUrl(item)"
            :alt="item['MODEL'] || 'image'"
            loading="lazy"
            class="card-image"
        />
        <div class="body">
          <h3 class="title">{{ item['MODEL'] }}</h3>
          <p class="desc">{{ item['DESCRIPTION'] || 'No description' }}</p>
          <span v-if="item['HAVE_IN_LAB'] === '1'" class="badge in-lab">In lab</span>
        </div>
      </article>
    </transition-group>

    <!-- loader -->
    <div class="bottom">
      <div v-if="loading && items.length > 0" class="mini-loader">Loading...</div>
    </div>

    <div ref="sentinel" class="sentinel" aria-hidden="true"></div>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeModal">×</button>
        <div v-if="modalData">
          <div class="modal-header">
            <span class="modal-title-text">{{ modalData['MODEL'] }}</span>
            <span v-if="modalData['HAVE_IN_LAB'] === '1'" class="badge in-lab">In lab</span>
          </div>
          <div class="modal-body">
            <img :src="getImageUrl(modalData)" alt="" class="modal-image"/>
            <div class="modal-info">
              <p><strong>{{ t('converter') }}:</strong> {{ modalData['TITLE'] }}</p>
              <p><strong>{{ t('manufacturer') }}:</strong> {{ vendors[modalData.VENDOR] ? vendors[modalData.VENDOR]['TITLE'] : modalData.VENDOR }}</p>
              <p><strong>{{ t('description') }}:</strong> {{ modalData['DESCRIPTION'] }}</p>
              <div v-if="Array.isArray(modalData['EXPOSES']) && modalData['EXPOSES'].length" class="states">
                <strong>{{ t('states') }}:</strong>
                <span v-for="state in modalData['EXPOSES']" :key="state" class="badge">{{ state }}</span>
              </div>
              <p v-if="modalData['UPDATED_IN']"><strong>{{ t('updatedInFirmware') }}:</strong> {{ modalData['UPDATED_IN'] }}</p>
              <div v-if="Array.isArray(modalData['BUY_LINKS']) && modalData['BUY_LINKS'].length" class="buy-links">
                <strong>{{ t('buyLinks') }}:</strong>
                <a v-for="(link, idx) in modalData['BUY_LINKS']" :key="idx" :href="link.url" target="_blank" rel="noopener" class="buy-button-inline">
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
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
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
const loading = ref(false)
const error = ref('')
const sentinel = ref(null)

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
      const modelMatch = (it['MODEL'] || '').toLowerCase().includes(search.value.toLowerCase())
      const zigbeeMatch = Array.isArray(it['ZIGBEE_MODELS']) &&
        it['ZIGBEE_MODELS'].some(z =>
          (z['modelId'] || '').toLowerCase().includes(search.value.toLowerCase()) ||
          (z['manufId'] || '').toLowerCase().includes(search.value.toLowerCase())
        )
      return modelMatch || zigbeeMatch
    })
  }
  if (vendorFilter.value) {
    base = base.filter(it => String(it['VENDOR']) === String(vendorFilter.value))
  }
  return base
})

const groupedItems = computed(() => {
  if (groupBy.value === 'vendor') {
    return filteredItems.value.reduce((acc, item) => {
      const vendorObj = vendors.value[item['VENDOR']]
      const key = vendorObj ? vendorObj['TITLE'] : 'Unknown'
      if (!acc[key]) acc[key] = { items: [], picture: vendorObj ? vendorObj['PICTURE'] : '' }
      acc[key].items.push(item)
      return acc
    }, {})
  }
  return { All: filteredItems.value }
})

function getImageUrl(item) {
  return `https://slsys.io/${item['PICTURE']}`
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
    acc[v['ID']] = v
    return acc
  }, {})
}

async function loadPage() {
  loading.value = true
  error.value = ''
  try {
    items.value = await fetchData()
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Failed to load data'
  } finally {
    loading.value = false
  }
}

async function openModal(title) {
  const resp = await fetch(`/ru/ajax/supported_devices?op=get_device&id=${encodeURIComponent(title)}`)
  const json = await resp.json()
  modalData.value = json.data
  showModal.value = true
  const url = new URL(window.location)
  url.searchParams.set('device', title)
  history.pushState({}, '', url)
}
function closeModal() {
  showModal.value = false
  const url = new URL(window.location)
  url.searchParams.delete('device')
  history.pushState({}, '', url)
}

const decodedNotes = computed(() => {
  const notes = modalData.value && modalData.value['NOTES']
  if (!notes || Object.keys(notes).length === 0) return ''

  const cur = lang.value
  const curVal = notes[cur]
  if (curVal && String(curVal).trim() !== '') {
    try {
      const bytes = Uint8Array.from(atob(curVal), c => c.charCodeAt(0))
      return new TextDecoder().decode(bytes)
    } catch (e) {}
  }

  if (notes.en && String(notes.en).trim() !== '') {
    try {
      const bytes = Uint8Array.from(atob(notes.en), c => c.charCodeAt(0))
      return new TextDecoder().decode(bytes)
    } catch (e) {}
  }

  for (const k of Object.keys(notes)) {
    const v = notes[k]
    if (v && String(v).trim() !== '') {
      try {
        const bytes = Uint8Array.from(atob(v), c => c.charCodeAt(0))
        return new TextDecoder().decode(bytes)
      } catch (e) {}
    }
  }

  return ''
})

const decodedPairing = computed(() => {
  const notes = modalData.value && modalData.value['PAIRING_NOTES']
  if (!notes || Object.keys(notes).length === 0) return ''

  const cur = lang.value
  const curVal = notes[cur]
  let decoded = ''
  if (curVal && String(curVal).trim() !== '') {
    try {
      const bytes = Uint8Array.from(atob(curVal), c => c.charCodeAt(0))
      decoded = new TextDecoder().decode(bytes)
    } catch (e) {}
  }

  if (!decoded && notes.en && String(notes.en).trim() !== '') {
    try {
      const bytes = Uint8Array.from(atob(notes.en), c => c.charCodeAt(0))
      decoded = new TextDecoder().decode(bytes)
    } catch (e) {}
  }

  if (!decoded) {
    for (const k of Object.keys(notes)) {
      const v = notes[k]
      if (v && String(v).trim() !== '') {
        try {
          const bytes = Uint8Array.from(atob(v), c => c.charCodeAt(0))
          decoded = new TextDecoder().decode(bytes)
          break
        } catch (e) {}
      }
    }
  }

  return decoded ? marked(decoded) : ''
})

onMounted(async () => {
  await fetchVendors()
  await loadPage()
  const params = new URLSearchParams(window.location.search)
  const dev = params.get('device')
  if (dev) await openModal(dev)
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
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  transition: all 0.3s ease;
}
.card {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-radius:10px;
  overflow:hidden;
  border: 1px solid var(--vp-c-divider);
  box-shadow:0 2px 8px rgba(0,0,0,0.06);
  display:flex;
  flex-direction:column;
  transition: transform 0.3s, opacity 0.3s, all 0.3s;
  position: relative; /* ensure child absolute positioning works */
  cursor: pointer;
}
.card:hover {
  transform: scale(1.05);
}
.card-image{  object-fit:cover; display:block ; padding: 40px 20px}
.body{ padding:12px }
.title{ font-size:16px; margin:0 0 8px }
.desc{ font-size:13px; color: var(--vp-c-text-2); margin:0 }
.skeleton {
  animation: pulse 1.2s infinite;
  background: linear-gradient(90deg, var(--vp-c-bg-alt), var(--vp-c-bg), var(--vp-c-bg-alt));
}
.skeleton .image {
  height: 240px;
  background: var(--vp-c-bg-alt);
}
.skeleton .title {
  height: 18px;
  width: 60%;
  background: var(--vp-c-bg-alt);
  margin-bottom: 8px;
}
.skeleton .desc {
  height: 12px;
  width: 100%;
  background: var(--vp-c-bg-alt);
}
.mini-loader{ text-align:center; padding:12px }
.sentinel{ height:1px }

.card .in-lab {
  position: absolute;
  top: 8px;
  right: 8px;
}

.card .title-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

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
  font-size: 24px;
  cursor: pointer;
}
.modal-image {
  width: 300px;
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
.modal-header {
  display: flex;
  align-items: center; /* vertically center title and badge */
  gap: 8px;
  margin-bottom: 16px;
}
.modal-title-text {
  display: inline-block;
  font-size: 1.5em; /* revert to previous size */
}
.modal-body { display: flex; align-items: flex-start; gap: 20px; }
.modal-info { flex: 1; }

.badge {
  display: inline-block;
  background: var(--vp-c-divider);
  color: var(--vp-c-text-1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.states {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
.notes { margin-top: 8px; }
.pairing { margin-top: 8px; }

.states {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
.states strong {
  margin-right: 6px;
}
/* .in-lab badge style for both cards and modal header */
.in-lab {
  background-color: #4CAF50;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.dark .in-lab {
  background-color: #2E7D32; /* darker green for dark mode */
}

/* Added animation styles for filtering and grouping transitions */
.grid, .group {
  transition: all 0.3s ease;
}
.card {
  transition: transform 0.3s, opacity 0.3s;
}
.buy-links {
  display: flex;
  align-items: center;
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

@media (max-width: 600px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-input, .filter-select {
    min-width: auto;
    width: 100%;
  }
  .modal-body {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: 20px;
  }
  .modal-info {
    width: 100%;
    order: -1;
    margin-bottom: 16px;
  }
  .modal-image {
    width: 70%;
    max-width: 250px;
  }
}
</style>

