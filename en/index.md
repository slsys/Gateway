---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
slsDeviceHero: true

title: Home

#hero:
#  name: "SLS Smart Home"
#  text: "SLS Gateway documentation"
#  tagline: Revised and improved version of the project documentation
  #actions:
  #  - theme: brand
  #    text: Lua
  #    link: /lua
  #  - theme: alt
  #    text: HTTP API
  #    link: /http_api

features:
  - icon: 🧭
    title: Documentation
    details: Quick start, gateway features, web UI, API, MQTT, and hardware setup.
    link: /en/basic
    linkText: Open docs
  - icon: 🧩
    title: Devices
    details: Supported Zigbee devices and SLS hardware for local smart home control.
    link: /en/supported_devices
    linkText: View list
  - icon: 💬
    title: Communities
    details: Telegram and other places for firmware, devices, scenarios, and integration discussions.
    link: /en/telegram
    linkText: Open
---

<section class="sls-home-block sls-home-quickstart">
  <div class="sls-home-block__heading">
    <p>Quick Start</p>
    <h2>From gateway setup to first devices</h2>
  </div>
  <div class="sls-home-steps">
    <a href="/en/firststart">
      <span>1</span>
      <h3>Start the gateway</h3>
      <p>Connect, sign in for the first time, and configure the network.</p>
    </a>
    <a href="/en/web">
      <span>2</span>
      <h3>Open the web UI</h3>
      <p>Control panel, settings, devices, and service actions.</p>
    </a>
    <a href="/en/supported_devices">
      <span>3</span>
      <h3>Add devices</h3>
      <p>Check compatibility and pair Zigbee devices.</p>
    </a>
  </div>
</section>
