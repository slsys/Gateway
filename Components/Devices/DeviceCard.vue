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
    </div>
  </article>
</template>

<script setup>
defineProps({
  item: { type: Object, required: true },
  imageUrl: { type: String, required: true },
  fallbackDescription: { type: String, default: 'No description' },
})

defineEmits(['open'])
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
  background-color: #4caf50;
  color: white;
}

:global(.dark) .device-in-lab {
  background-color: #2e7d32;
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

  .device-card-body {
    padding: 10px;
  }
}
</style>
