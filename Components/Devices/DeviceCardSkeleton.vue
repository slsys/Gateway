<template>
  <div class="device-card-skeleton" aria-hidden="true">
    <div class="skeleton-badge"></div>
    <div class="skeleton-media">
      <div class="skeleton-image"></div>
    </div>
    <div class="skeleton-body">
      <div class="skeleton-title"></div>
      <div class="skeleton-desc"></div>
      <div class="skeleton-desc short"></div>
    </div>
  </div>
</template>

<style scoped>
.device-card-skeleton {
  height: var(--device-card-height);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background: var(--vp-c-bg);
  animation: device-skeleton-pulse 1.2s infinite;
  contain: layout paint;
}

.skeleton-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 58px;
  height: 20px;
  border-radius: 4px;
  background: var(--vp-c-bg-alt);
}

.skeleton-media {
  height: var(--device-card-media-height);
  padding: 40px 20px;
  box-sizing: border-box;
}

.skeleton-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}

.skeleton-body {
  padding: 12px;
}

.skeleton-title {
  width: 70%;
  height: 42px;
  margin-bottom: 8px;
  border-radius: 6px;
  background: var(--vp-c-bg-alt);
}

.skeleton-desc {
  width: 100%;
  height: 18px;
  margin-bottom: 6px;
  border-radius: 6px;
  background: var(--vp-c-bg-alt);
}

.skeleton-desc.short {
  width: 82%;
}

@keyframes device-skeleton-pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .device-card-skeleton {
    height: var(--device-card-height-mobile);
    padding: 8px;
    box-sizing: border-box;
  }

  .skeleton-media {
    height: var(--device-card-media-height-mobile);
    padding: 28px 8px 8px;
  }
}
</style>
