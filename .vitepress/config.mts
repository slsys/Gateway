import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "SLS Smart Home",
  description: "SLS Smart Home documentation",
  base: '/docs/',
  //ignoreDeadLinks: true,
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: {
      light: '/img/sls.svg',
      dark: '/img/sls_light.svg'
    },
    /*editLink: {
      pattern: 'https://github.com/slsys/Gateway/edit/master/:path'
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Домашняя', link: '/' },
      { text: 'Документация', link: '/basic' },
      { text: 'Команда', link: '/team' },
      //{ text: 'FAQ (вопросы и ответы)', link: '/faq' },
    ],

    sidebar: [
      {
        text: 'Введение',
        items: [
          { text: 'Общие сведения', link: '/basic' },
          { text: 'Первый запуск', link: '/firststart' },
          {
            text: 'Возможности интеграции',
            //collapsed: false,
            items: [
              { text: 'Home Assistant', link: '/integrations/has' },
              { text: 'Majordomo', link: '/integrations/majordomo' },
              { text: 'Telegram', link: '/telegram' },
              { text: 'Yandex', link: '/integrations/yandex' },
            ]
          },
          { text: 'FAQ (вопросы и ответы)', link: '/faq' },
        ]
      },
      {
        text: 'Возможности',
        items: [
          { text: 'Web-интерфейс', link: '/web' },
          { text: 'Кастомная визуализация', link: '/ui' },
          { text: 'Конвертеры устройств', link: '/zigbee_converters' },
          { text: 'Объекты', link: '/objects' },
          { text: 'Таймеры', link: '/timers' },
          { text: 'Сценарии', link: '/scenes' },
          { text: 'Карта сети', link: '/map' },
          { text: 'Binding', link: '/bind' },
          { text: 'Touchlink', link: '/touchlink' },
          { text: 'Хранилище', link: '/storage' },
          { text: 'Бэкап и восстановление', link: '/backup' },
          { text: 'Управление LED', link: '/led_control' },
          { text: 'SLS Cloud', link: '/cloud' },
          { text: 'SLS Pro', link: '/sls_pro' },
        ]
      },
      {
        text: 'Протокол',
        items: [
          {
            text: 'HTTP API',
            link: '/http_api',
            items: [
              
              
            ]
          },          
          {
            text: 'MQTT',
            items: [
              { text: 'Структура сообщений (z2m)', link: 'https://www.zigbee2mqtt.io/information/mqtt_topics_and_message_structure.html' },
              { text: 'Дополнительные комнады', link: '/slscommand' },
            ]
          }, 
        ]
      },      
      {
        text: 'Оборудование',
        items: [
          { text: 'Шлюзы', link: '/sls_dev' },
          { text: 'Обновление координатора', link: '/update_coordinator' },
          { text: 'KNX', link: '/knx' },
          { text: '1-wire', link: '/1wire' },
          { text: 'ModBus', link: '/modbus' },
          { text: 'OpenTherm', link: '/ot_boiler_compatibility' },
          
        ]
      },
      {
        text: 'Скрипты и сценарии',
        items: [
          { text: 'Simple Bind. Автоматизации', link: '/simplebind' },
          { text: 'Поддержка скриптов LUA', link: '/lua' },
          { text: 'Примеры сценариев', link: '/samples' },
          { text: 'Использование GPIO', link: '/gpio_sample' },
          { text: 'MQTT', link: '/mqtt' },
          { text: 'Термоголовка', link: '/trv_ext_temp' },
          { text: 'Управление котлами', link: '/heating_сurve' },
          
        ]
      }
    ],
    outline:{label:'На странице:'},*/
    socialLinks: [
      { icon: 'github', link: 'https://github.com/slsys/Gateway/' },
      { icon: 
        {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telegram" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/></svg>'
        },
        link: 'https://t.me/slsys'
      },
      { icon: 
        {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M275.3 250.5c7 7.4 18.4 7.4 25.5 0l108.9-114.2c31.6-33.2 29.8-88.2-5.6-118.8-30.8-26.7-76.7-21.9-104.9 7.7L288 36.9l-11.1-11.6C248.7-4.4 202.8-9.2 172 17.5c-35.3 30.6-37.2 85.6-5.6 118.8l108.9 114.2zm290 77.6c-11.8-10.7-30.2-10-42.6 0L430.3 402c-11.3 9.1-25.4 14-40 14H272c-8.8 0-16-7.2-16-16s7.2-16 16-16h78.3c15.9 0 30.7-10.9 33.3-26.6 3.3-20-12.1-37.4-31.6-37.4H192c-27 0-53.1 9.3-74.1 26.3L71.4 384H16c-8.8 0-16 7.2-16 16v96c0 8.8 7.2 16 16 16h356.8c14.5 0 28.6-4.9 40-14L564 377c15.2-12.1 16.4-35.3 1.3-48.9z"/></svg>'
        },
        link: '/donate'
      },

      
    ],
    search: {
      provider: 'local'
    },
    /*footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    }*/
  },
  locales: {
    root: {
      label: 'Русский',
      lang: 'ru',
      themeConfig:
      {
        editLink: {
          pattern: 'https://github.com/slsys/Gateway/edit/master/:path',
          text: 'Редактировать в GitHub'
        },
        lastUpdated: {
          text: 'Обновлено',
        },
        docFooter: {
          prev: 'Предыдущая страница',
          next: 'Следующая страница'
        },
        outline:{label:'На странице:'},
        search: {
          provider: 'local',
          options: {
            translations: {
              button: {
                buttonText: 'Поиск',
                buttonAriaLabel: 'Найти',
              },
              modal: {
                noResultsText: 'Ничего не найдено',
                resetButtonTitle: 'Сбросить',
                footer: {
                  selectText: 'Выбрать',
                  navigateText: 'Навигация',
                  closeText: 'Закрыть',
                }
              }
            }
          }
        },        
        nav: [
          { text: 'Домашняя', link: '/' },
          { text: 'Документация', link: '/basic' },
          { text: 'Команда', link: '/team' },
          //{ text: 'FAQ (вопросы и ответы)', link: '/faq' },
        ],
        sidebar: [
          {
            text: 'Введение',
            items: [
              { text: 'Общие сведения', link: '/basic' },
              { text: 'Первый запуск', link: '/firststart' },
              {
                text: 'Возможности интеграции',
                //collapsed: false,
                items: [
                  { text: 'Home Assistant', link: '/integrations/has' },
                  { text: 'Majordomo', link: '/integrations/majordomo' },
                  { text: 'Telegram', link: '/telegram' },
                  { text: 'Yandex', link: '/integrations/yandex' },
                ]
              },
              { text: 'FAQ (вопросы и ответы)', link: '/faq' },
            ]
          },
          {
            text: 'Возможности',
            items: [
              { text: 'Web-интерфейс', link: '/web' },
              { text: 'Кастомная визуализация', link: '/ui' },
              { text: 'Конвертеры устройств', link: '/zigbee_converters' },
              { text: 'Объекты', link: '/objects' },
              { text: 'Таймеры', link: '/timers' },
              { text: 'Сценарии', link: '/scenes' },
              { text: 'Карта сети', link: '/map' },
              { text: 'Binding', link: '/bind' },
              { text: 'Touchlink', link: '/touchlink' },
              { text: 'Хранилище', link: '/storage' },
              { text: 'Бэкап и восстановление', link: '/backup' },
              { text: 'Управление LED', link: '/led_control' },
              { text: 'SLS Cloud', link: '/cloud' },
              { text: 'SLS Pro', link: '/sls_pro' },
            ]
          },
          {
            text: 'Протокол',
            items: [
              {
                text: 'HTTP API',
                link: '/http_api',
                items: [
                  
                  
                ]
              },          
              {
                text: 'MQTT',
                items: [
                  { text: 'Структура сообщений (z2m)', link: 'https://www.zigbee2mqtt.io/information/mqtt_topics_and_message_structure.html' },
                  { text: 'Дополнительные комнады', link: '/slscommand' },
                ]
              }, 
            ]
          },      
          {
            text: 'Оборудование',
            items: [
              { text: 'Шлюзы', link: '/sls_dev' },
              { text: 'Обновление координатора', link: '/update_coordinator' },
              { text: 'KNX', link: '/knx' },
              { text: '1-wire', link: '/1wire' },
              { text: 'ModBus', link: '/modbus' },
              { text: 'OpenTherm', link: '/ot_boiler_compatibility' },
              
            ]
          },
          {
            text: 'Скрипты и сценарии',
            items: [
              { text: 'Simple Bind. Автоматизации', link: '/simplebind' },
              { text: 'Поддержка скриптов LUA', link: '/lua' },
              { text: 'Примеры сценариев', link: '/samples' },
              { text: 'Использование GPIO', link: '/gpio_sample' },
              { text: 'MQTT', link: '/mqtt' },
              { text: 'Термоголовка', link: '/trv_ext_temp' },
              { text: 'Управление котлами', link: '/heating_сurve' },
              
            ]
          }
        ],
      }
    },
    en: {
      label: 'English',
      lang: 'en', // optional, will be added  as `lang` attribute on `html` tag
      link: '/en/', // default /fr/ -- shows on navbar translations menu, can be external
      themeConfig:
      {
        editLink: {
          pattern: 'https://github.com/slsys/Gateway/edit/master/:path'
        },
        nav: [
          { text: 'Home', link: '/en' },
          { text: 'Documentation', link: '/en/basic' },
          { text: 'Team', link: '/en/team' },
        ],
        sidebar: [
          {
            text: 'Intro',
            items: [
              { text: 'Basic', link: '/en/basic' },
              { text: 'First start', link: '/en/firststart' },
              {
                text: 'Integrations',
                //collapsed: false,
                items: [
                  { text: 'Home Assistant', link: '/en/integrations/has' },
                  { text: 'Majordomo', link: '/en/integrations/majordomo' },
                  { text: 'Telegram', link: '/en/telegram' },
                  { text: 'Yandex', link: '/en/integrations/yandex' },
                ]
              },
              { text: 'FAQ (answers and questions)', link: '/en/faq' },
            ]
          },
          {
            text: 'Abilities',
            items: [
              { text: 'Web-interface', link: '/en/web' },
              { text: 'Custom visualization', link: '/en/ui' },
              { text: 'Device converters', link: '/en/zigbee_converters' },
              { text: 'Objects', link: '/en/objects' },
              { text: 'Timers', link: '/en/timers' },
              { text: 'Scenes', link: '/en/scenes' },
              { text: 'Network map', link: '/en/map' },
              { text: 'Binding', link: '/en/bind' },
              { text: 'Touchlink', link: '/en/touchlink' },
              { text: 'Storage', link: '/en/storage' },
              { text: 'Backup and recovery', link: '/en/backup' },
              { text: 'LED control', link: '/en/led_control' },
              { text: 'SLS Cloud', link: '/en/cloud' },
              { text: 'SLS Pro', link: '/en/sls_pro' },
            ]
          },
          {
            text: 'Protocol',
            items: [
              {
                text: 'HTTP API',
                link: '/en/http_api',
                items: [
                  
                  
                ]
              },          
              {
                text: 'MQTT',
                items: [
                  { text: 'Message structure (z2m)', link: 'https://www.zigbee2mqtt.io/information/mqtt_topics_and_message_structure.html' },
                  { text: 'Additional commands', link: '/en/slscommand' },
                ]
              }, 
            ]
          },      
          {
            text: 'Hardware',
            items: [
              { text: 'Gateways', link: '/en/sls_dev' },
              { text: 'Coordinator update', link: '/en/update_coordinator' },
              { text: 'KNX', link: '/en/knx' },
              { text: '1-wire', link: '/en/1wire' },
              { text: 'ModBus', link: '/en/modbus' },
              { text: 'OpenTherm', link: '/en/ot_boiler_compatibility' },
              
            ]
          },
          {
            text: 'Scripts and scenarios',
            items: [
              { text: 'Simple Bind Automation', link: '/en/simplebind' },
              { text: 'LUA Script support', link: '/en/lua' },
              { text: 'Example scripts', link: '/en/samples' },
              { text: 'GPIO use', link: '/en/gpio_sample' },
              { text: 'MQTT', link: '/en/mqtt' },
              { text: 'Thermal head', link: '/en/trv_ext_temp' },
              { text: 'Boiler control', link: '/en/heating_сurve' },
              
            ]
          }
        ]
      }
    }
  }
})

