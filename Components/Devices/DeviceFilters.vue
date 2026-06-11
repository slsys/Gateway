<template>
  <div class="device-filters">
    <div class="device-filters__actions">
      <button
        v-if="showRequestButton"
        type="button"
        class="device-filter-request-button"
        @click="$emit('openRequest')"
      >
        {{ t('requestButton') }}
      </button>
    </div>

    <div class="device-filters__controls">
      <input
        :value="search"
        type="text"
        :placeholder="t('filterPlaceholder')"
        class="device-filter-input"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      />
      <select
        :value="vendorFilter"
        class="device-filter-select"
        @change="$emit('update:vendorFilter', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ t('allVendors') }}</option>
        <option v-for="(vendor, id) in vendors" :key="id" :value="id">
          {{ vendor.TITLE }}
        </option>
      </select>
      <select
        :value="groupBy"
        class="device-filter-select"
        @change="$emit('update:groupBy', ($event.target as HTMLSelectElement).value)"
      >
        <option value="none">{{ t('noGroup') }}</option>
        <option value="vendor">{{ t('groupByVendor') }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DeviceVendor } from './types/device'

defineProps<{
  search: string
  vendorFilter: string
  groupBy: string
  vendors: Record<string, DeviceVendor>
  showRequestButton: boolean
  t: (key: string) => string
}>()

defineEmits<{
  'update:search': [value: string]
  'update:vendorFilter': [value: string]
  'update:groupBy': [value: string]
  openRequest: []
}>()
</script>

<style scoped>
.device-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.device-filters__actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: none;
}

.device-filters__controls {
  display: flex;
  flex: 1;
  gap: 12px;
  justify-content: flex-end;
}

.device-filter-input,
.device-filter-select {
  padding: 6px 10px;
  min-height: 38px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  min-width: 180px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.device-filter-request-button {
  flex: none;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
  min-height: 38px;
  padding: 8px 14px;
  cursor: pointer;
}

@media (max-width: 600px) {
  .device-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .device-filters__actions,
  .device-filters__controls {
    flex-direction: column;
  }

  .device-filter-input,
  .device-filter-select,
  .device-filter-request-button {
    min-width: auto;
    width: 100%;
  }
}
</style>
