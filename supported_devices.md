---
layout: page
---

<style>
.badge {
    text-transform:capitalize;
    padding: 0.35em 1em;
    margin-bottom:0.15em;
}
.btn-margin {
    margin: .25rem .125rem;
}
.card {
  border-radius:10px;
  line-height: 130%;
  border: none;
}
.card-body {
    padding:25px;
}
.card-link {
    margin-top:16px;
}
.picture {
    width:150px;
    padding-bottom:50px;
    padding-top:20px;
}
.card-text {
    font-size:14px;
}
.row-list > * {
    padding-top: calc(var(--bs-gutter-x) * .5);
    padding-bottom: calc(var(--bs-gutter-x) * .5);
}
h6 {
    margin-bottom:10px!important;
}
.card {
  transition: transform .4s;
}
.card:hover {
  transform:scale(1.03);
  transition: transform .2s;
}
</style>

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const devices = [
  {
    picture: 'https://slsys.io/img/supported_devices/40.png',
    title: 40,
    name: 'LED1924G9',
    desc: 'TRADFRI bulb E26/E27 CWS 800/806 lumen, dimmable, color, opal white ()',

  },
  {
    picture: 'https://slsys.io/img/supported_devices/111.png',
    title: 111,
    name: 'LED1736G9',
    desc: 'TRADFRI LED bulb E26/E27 806 lumen, dimmable, white spectrum, clear',
    
  },
  {
    picture: 'https://slsys.io/img/supported_devices/83.png',
    title: 83,
    name: 'SSM-U02 / DLKZMK12LM',
    desc: 'T1 single relay (no neutral wire)',
    
  },
]
</script>

<div class="row">
   <div class="col-xl-3 col-lg-4 col-md-6" v-for="device in devices" :key="device.converter">
    <div class="card shadow h-100" href="/action/supported_devices?device=[#TITLE#]">
    <div class="card-body">
     <div class="card-link h-100" onclick="location.href='/action/supported_devices?device=[#TITLE#]'" style="cursor:pointer">
      <div class="text-center">
        <img :src="device.picture" class="picture position-relative" alt="...">
      </div>
    <h6 class="card-title">{{ device.name }}</h6>
    <p class="card-text">{{ device.desc }}</p><hr>
    <div class="position-absolute top-0 start-0" style="padding:20px 25px;margin-top: -3px;"><h6 class="card-title">{{ device.title }}</h6></div>
    </div>
  </div>
</div>
 </div>
</div>
