---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
slsDeviceHero: true

title: Домашняя

#hero:
#  name: "SLS Smart Home"
#  text: "Документация SLS-шлюза"
#  tagline: Переработанная и улучшенная версия документации проекта
  #image: /img/sls_color.svg
  #actions:
  #  - theme: brand
  #    text: Lua
  #    link: /lua
  #  - theme: alt
  #    text: HTTP API
  #    link: /http_api

features:
  - icon: 🧭
    title: Документация
    details: Быстрый старт, возможности шлюза, web-интерфейс, API, MQTT и настройка оборудования.
    link: /basic
    linkText: Открыть документацию
  - icon: 🧩
    title: Устройства
    details: Список поддерживаемых Zigbee-устройств и оборудование SLS для локального управления домом.
    link: /supported_devices
    linkText: Смотреть список
  - icon: 💬
    title: Сообщества
    details: Telegram и другие площадки для обсуждения прошивки, устройств, сценариев и интеграций.
    link: /telegram
    linkText: Перейти
---

<section class="sls-home-block sls-home-quickstart">
  <div class="sls-home-block__heading">
    <p>Быстрый старт</p>
    <h2>От подключения до первых устройств</h2>
  </div>
  <div class="sls-home-steps">
    <a href="/firststart">
      <span>1</span>
      <h3>Запустите шлюз</h3>
      <p>Подключение, первый вход и базовая настройка сети.</p>
    </a>
    <a href="/web">
      <span>2</span>
      <h3>Откройте web-интерфейс</h3>
      <p>Панель управления, настройки, устройства и сервисные действия.</p>
    </a>
    <a href="/supported_devices">
      <span>3</span>
      <h3>Добавьте устройства</h3>
      <p>Проверьте совместимость и подключите Zigbee-устройства.</p>
    </a>
  </div>
</section>
