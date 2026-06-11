<template>
  <article class="device-card" @click="$emit('open', item)">
    <span class="device-badge device-title-badge">#{{ item['TITLE'] }}</span>
    <span v-if="item['HAVE_IN_LAB'] === '1'" class="device-badge device-in-lab">
      In lab
    </span>

    <div class="device-card-media">
      <img
        :src="imageUrl"
        :alt="item['MODEL'] || 'image'"
        loading="lazy"
        class="device-card-image"
      />
    </div>

    <div class="device-card-body">
      <h3 class="device-card-title">{{ item['MODEL'] }}</h3>
      <p class="device-card-desc">{{ item['DESCRIPTION'] || fallbackDescription }}</p>
      <div v-if="showMeta" class="device-card-meta">
        <template v-if="ratingAverage !== null">
          <span class="device-card-meta__rating">★ {{ ratingAverage.toFixed(1) }}</span>
          <span class="device-card-meta__divider">·</span>
          <span class="device-card-meta__comments-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="device-card-meta__text">{{ commentsCount }}</span>
        </template>
        <template v-else-if="commentsCount > 0">
          <span class="device-card-meta__comments-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="device-card-meta__text">{{ commentsCount }}</span>
        </template>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DeviceItem } from './types/device'

const props = defineProps<{
  item: DeviceItem
  imageUrl: string
  fallbackDescription?: string
}>()

defineEmits<{
  open: [item: DeviceItem]
}>()

const commentsCount = computed(() => Number(props.item.COMMENTS_COUNT || 0))
const ratingAverage = computed(() => {
  const numeric = Number(props.item.RATING_AVG)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null
})
const showMeta = computed(() => commentsCount.value > 0)
</script>

<style scoped>
.device-card {
  height: var(--device-card-height);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s, opacity 0.3s;
  contain: layout paint;
}

.device-card:hover {
  transform: scale(1.05);
}

.device-card-media {
  height: var(--device-card-media-height);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.device-card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.device-card-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.device-card-title {
  margin: 0;
  font-size: 16px;
  line-height: 21px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.device-card-desc {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.device-card-meta {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.device-card-meta__rating {
  color: #c47c00;
  font-weight: 700;
}

.device-card-meta__comments-icon {
  display: inline-flex;
  width: 14px;
  height: 14px;
}

.device-card-meta__comments-icon svg {
  width: 100%;
  height: 100%;
}

.device-card-meta__divider,
.device-card-meta__text {
  color: var(--vp-c-text-2);
}

.device-badge {
  display: inline-block;
  background: var(--vp-c-divider);
  color: var(--vp-c-text-1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 16px;
}

.device-title-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  max-width: calc(100% - 16px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-in-lab {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: var(--vp-c-success-2);
  color: var(--vp-c-bg);
}

@media (max-width: 600px) {
  .device-card {
    height: var(--device-card-height-mobile);
    padding: 8px;
  }

  .device-card-media {
    height: var(--device-card-media-height-mobile);
    padding: 28px 8px 8px;
  }
}
</style>
