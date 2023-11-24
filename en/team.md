---
layout: page
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
  {
    avatar: 'https://avatars.githubusercontent.com/u/36795643?v=4',
    name: 'Григорий',
    title: 'Создатель проекта',
    links: [
      { icon: 'github', link: 'https://github.com/Avenitos' },
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/28798291?v=4',
    name: 'Дмитрий',
    links: [
      { icon: 'github', link: 'https://github.com/directman66' },
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/15828541?v=4',
    name: 'Никита',
    links: [
      { icon: 'github', link: 'https://github.com/nick7zmail' },
    ]
  },
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Наша команда
    </template>
    <template #lead>
      Команда разработчиков и участников проекта SLS
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>
