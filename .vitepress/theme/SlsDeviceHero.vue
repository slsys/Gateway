<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'

const devices = [
  {
    title: 'SLS DIN MINI',
    image: '/img/main/1.jpg',
    type: 'photo'
  },
  {
    title: 'SLS DIN MINI',
    image: '/img/main/2.jpg',
    type: 'photo'
  },
  {
    title: 'SLS DIN MINI',
    image: '/img/main/3.jpg',
    type: 'photo'
  },
  {
    title: 'Modkam Gateway',
    image: '/img/main/4.jpg',
    type: 'photo'
  }
]

const activeIndex = ref(0)
const slideDirection = ref<'next' | 'prev'>('next')
let timer: ReturnType<typeof setInterval> | undefined

const activeDevice = computed(() => devices[activeIndex.value])

function startTimer() {
  stopTimer()
  timer = setInterval(showNext, 15000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

function switchTo(index: number, resetTimer = false, direction?: 'next' | 'prev') {
  const nextIndex = (index + devices.length) % devices.length

  if (nextIndex === activeIndex.value) {
    if (resetTimer) {
      startTimer()
    }

    return
  }

  slideDirection.value = direction || (nextIndex > activeIndex.value ? 'next' : 'prev')
  activeIndex.value = nextIndex

  if (resetTimer) {
    startTimer()
  }
}

function showNext(resetTimer = false) {
  switchTo(activeIndex.value + 1, resetTimer, 'next')
}

function showPrev(resetTimer = false) {
  switchTo(activeIndex.value - 1, resetTimer, 'prev')
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <section class="sls-device-hero" aria-label="SLS devices">
    <button class="sls-device-hero__control sls-device-hero__control--prev" type="button" aria-label="Previous device" @click="showPrev(true)">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>

    <div class="sls-device-hero__stage">
      <Transition :name="`sls-device-slide-${slideDirection}`">
        <img :key="activeDevice.image" :class="`sls-device-hero__image--${activeDevice.type || 'photo'}`" :src="withBase(activeDevice.image)" :alt="activeDevice.title">
      </Transition>
    </div>

    <div class="sls-device-hero__content" aria-live="polite">
      <img class="sls-device-hero__logo" :src="withBase('/img/sls_color.svg')" alt="">
      <div>
        <p class="sls-device-hero__brand">SLS Smart Home</p>
        <h1>{{ activeDevice.title }}</h1>
      </div>
    </div>

    <button class="sls-device-hero__control sls-device-hero__control--next" type="button" aria-label="Next device" @click="showNext(true)">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>

    <div class="sls-device-hero__dots">
      <button v-for="(device, index) in devices" :key="device.image" type="button" :aria-label="`Show ${device.title}`" :class="{ active: index === activeIndex }" @click="switchTo(index, true)"></button>
    </div>
  </section>
</template>

<style scoped>
.sls-device-hero {
  position: relative;
  z-index: 0;
  isolation: isolate;
  left: 50%;
  width: 100vw;
  height: clamp(280px, 38vw, 460px);
  margin: 0 0 48px -50vw;
  overflow: hidden;
  background: transparent;
}

.sls-device-hero::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  content: "";
  background: linear-gradient(90deg, var(--vp-c-bg) 0%, rgba(255, 255, 255, 0.72) 36%, rgba(255, 255, 255, 0.08) 68%);
  pointer-events: none;
}

.dark .sls-device-hero {
  background: transparent;
}

.dark .sls-device-hero::after {
  background: linear-gradient(90deg, var(--vp-c-bg) 0%, rgba(27, 27, 31, 0.72) 36%, rgba(27, 27, 31, 0.08) 68%);
}

.sls-device-hero__stage {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.sls-device-hero__stage img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-position: center;
  object-fit: cover;
  filter: none;
}

.sls-device-hero__image--photo {
  opacity: 1;
}

.sls-device-hero__content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: min(600px, calc(100% - 176px));
  min-height: 0;
  margin-left: max(88px, calc((100vw - 1120px) / 2));
  margin-top: clamp(28px, 5vw, 58px);
  padding: 0;
  color: var(--vp-c-text-1);
}

.sls-device-hero__content > div {
  position: relative;
  width: 100%;
  min-width: 0;
}

.sls-device-hero__logo {
  width: clamp(44px, 6vw, 72px);
  height: clamp(44px, 6vw, 72px);
  flex: none;
  margin-bottom: 14px;
  filter: none;
}

.sls-device-hero__brand {
  margin: 0;
  color: transparent;
  background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  background-clip: text;
  -webkit-background-clip: text;
  font-size: clamp(32px, 4vw, 52px);
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0;
  white-space: nowrap;
  text-shadow: none;
}

.sls-device-hero__content h1 {
  margin: 12px 0 0;
  color: var(--vp-c-text-1);
  font-size: clamp(18px, 2.6vw, 34px);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: 0;
  text-shadow: none;
}

.sls-device-hero__control {
  position: absolute;
  z-index: 4;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 50%;
  color: #ffffff;
  background: rgba(15, 23, 42, 0.36);
  transform: translateY(-50%);
  cursor: pointer;
}

.sls-device-hero__control svg {
  width: 26px;
  height: 26px;
}

.sls-device-hero__control path {
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sls-device-hero__control:hover {
  background: rgba(15, 23, 42, 0.58);
}

.sls-device-hero__control--prev {
  left: 24px;
}

.sls-device-hero__control--next {
  right: 24px;
}

.sls-device-hero__dots {
  position: absolute;
  z-index: 4;
  bottom: 20px;
  left: 50%;
  display: flex;
  gap: 8px;
  transform: translateX(-50%);
}

.sls-device-hero__dots button {
  width: 8px;
  height: 8px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.48);
  cursor: pointer;
}

.sls-device-hero__dots button.active {
  width: 22px;
  border-radius: 999px;
  background: #ffffff;
}

.sls-device-slide-next-enter-active,
.sls-device-slide-next-leave-active,
.sls-device-slide-prev-enter-active,
.sls-device-slide-prev-leave-active {
  transition: opacity 0.65s ease, transform 0.65s ease;
}

.sls-device-slide-next-enter-active,
.sls-device-slide-prev-enter-active {
  z-index: 2;
}

.sls-device-slide-next-leave-active,
.sls-device-slide-prev-leave-active {
  z-index: 1;
}

.sls-device-slide-next-enter-from {
  opacity: 0;
  transform: translateX(7%);
}

.sls-device-slide-next-leave-to {
  opacity: 0;
  transform: translateX(-7%);
}

.sls-device-slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-7%);
}

.sls-device-slide-prev-leave-to {
  opacity: 0;
  transform: translateX(7%);
}

@media (max-width: 767px) {
  .sls-device-hero {
    height: 360px;
    background: transparent;
  }

  .sls-device-hero__stage {
    padding: 0;
  }

  .sls-device-hero__stage img {
    width: 100%;
  }

  .sls-device-hero::after {
    background: linear-gradient(180deg, var(--vp-c-bg) 0%, rgba(255, 255, 255, 0.62) 42%, rgba(255, 255, 255, 0.08) 72%);
  }

  .dark .sls-device-hero {
    background: transparent;
  }

  .dark .sls-device-hero::after {
    background: linear-gradient(180deg, var(--vp-c-bg) 0%, rgba(27, 27, 31, 0.62) 42%, rgba(27, 27, 31, 0.08) 72%);
  }

  .sls-device-hero__content {
    width: calc(100% - 88px);
    margin-left: 44px;
    margin-top: 28px;
  }

  .sls-device-hero__content > div {
    max-width: min(420px, 72vw);
  }

  .sls-device-hero__logo {
    width: 42px;
    height: 42px;
    margin-bottom: 10px;
  }

  .sls-device-hero__brand {
    font-size: clamp(26px, 6vw, 32px);
  }

  .sls-device-hero__content h1 {
    margin-top: 8px;
    font-size: clamp(16px, 4.8vw, 24px);
  }

  .sls-device-hero__control {
    width: 34px;
    height: 34px;
  }

  .sls-device-hero__control svg {
    width: 22px;
    height: 22px;
  }

  .sls-device-hero__control--prev {
    left: 10px;
  }

  .sls-device-hero__control--next {
    right: 10px;
  }
}

@media (min-width: 768px) and (max-width: 1040px) {
  .sls-device-hero__content {
    width: min(520px, calc(100% - 176px));
    margin-left: 88px;
  }

  .sls-device-hero__content > div {
    max-width: 100%;
  }
}

@media (min-width: 1041px) and (max-width: 1180px) {
  .sls-device-hero__content {
    width: min(540px, calc(100% - 176px));
    margin-left: 88px;
  }

  .sls-device-hero__brand {
    font-size: clamp(34px, 4vw, 46px);
  }
}
</style>
