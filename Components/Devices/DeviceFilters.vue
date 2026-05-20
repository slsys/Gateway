<template>
  <div class="device-filters">
    <input
      :value="search"
      type="text"
      :placeholder="t('filterPlaceholder')"
      class="device-filter-input"
      @input="$emit('update:search', $event.target.value)"
    />
    <select
      :value="vendorFilter"
      class="device-filter-select"
      @change="$emit('update:vendorFilter', $event.target.value)"
    >
      <option value="">{{ t('allVendors') }}</option>
      <option v-for="(vendor, id) in vendors" :key="id" :value="id">
        {{ vendor['TITLE'] }}
      </option>
    </select>
    <select
      :value="groupBy"
      class="device-filter-select"
      @change="$emit('update:groupBy', $event.target.value)"
    >
      <option value="none">{{ t('noGroup') }}</option>
      <option value="vendor">{{ t('groupByVendor') }}</option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  search: { type: String, required: true },
  vendorFilter: { type: String, required: true },
  groupBy: { type: String, required: true },
  vendors: { type: Object, required: true },
  t: { type: Function, required: true },
})

defineEmits(['update:search', 'update:vendorFilter', 'update:groupBy'])
</script>

<style scoped>
.device-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  justify-content: flex-end;
}

.device-filter-input,
.device-filter-select {
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  min-width: 180px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

@media (max-width: 600px) {
  .device-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .device-filter-input,
  .device-filter-select {
    min-width: auto;
    width: 100%;
  }
}
</style>
