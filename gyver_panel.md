Пример сценария управления светодиодной матрицей с [модифицированной прошивкой Алекса Гайвера](https://github.com/vvip-68/GyverPanelWiFi/wiki) из сценариев SLS
```lua
--https://github.com/vvip-68/GyverPanelWiFi/wiki/API-%D1%83%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F-%D1%83%D1%81%D1%82%D1%80%D0%BE%D0%B9%D1%81%D1%82%D0%B2%D0%BE%D0%BC
--mqtt.pub('af7cd12a/cmd', '$1 0;')  --выключить
--mqtt.pub('af7cd12a/cmd', '$1 1;')  --включить
--mqtt.pub('af7cd12a/cmd', '$1 2;')  --переключить
--mqtt.pub('af7cd12a/cmd', '$5 1;')   --очистить
--mqtt.pub('af7cd12a/cmd', '$8 2 1 0;') -- $8 2 N X;   - вкл/выкл использование эффекта в демо-режиме; N - номер эффекта, X=0 - не использовать X=1 - использовать 
--mqtt.pub('af7cd12a/cmd', '$6 1|Jagerу привет;')
--mqtt.pub('af7cd12a/cmd', '$13 1 1;')
--mqtt.pub('af7cd12a/cmd', '$6 14|медленное отображение;')
--mqtt.pub('af7cd12a/cmd', '$14 10;') --Часы простые;  
--mqtt.pub('af7cd12a/cmd', '$14 0;')--       - Черный экран (выкл);  
--mqtt.pub('af7cd12a/cmd', '$14 1;')--       - Белый экран (освещение);  
--mqtt.pub('af7cd12a/cmd', '$14 2;')--       - Цветной экран;  
--mqtt.pub('af7cd12a/cmd', '$14 3;')--       - Огонь;  
--mqtt.pub('af7cd12a/cmd', '$14 4;')--      - Конфетти;  
--mqtt.pub('af7cd12a/cmd', '$14 5;')--       - Радуга;  
--mqtt.pub('af7cd12a/cmd', '$14 6;')--       - Матрица;  
--mqtt.pub('af7cd12a/cmd', '$14 7;')--       - Светлячки;  
--mqtt.pub('af7cd12a/cmd', '$14 8;')--       - Часы ночные;
mqtt.pub('af7cd12a/cmd', '$14 9;')--       - Часы бегущей строкой;
--mqtt.pub('af7cd12a/cmd', '$14 10;')--     - Часы простые;
```
