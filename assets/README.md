# Assets

## `app/` — ассеты реального приложения
Скопированы из `apk/www`, используются мокапами интерфейса (hero + showcase).

| Файл | Назначение |
|---|---|
| `app/fonts.css` | `@font-face` для Manrope |
| `app/fonts/manrope-cyr.woff2` | Manrope, кириллица |
| `app/fonts/manrope-lat.woff2` | Manrope, латиница |
| `app/phosphor/phosphor.css` | иконочный шрифт Phosphor Light |
| `app/phosphor/Phosphor-Light.woff2` | глифы иконок |

Иконки подключаются классами `ph-light ph-*`; шрифты и иконки — только локальные, без CDN.

## Изображения
PNG-скриншотов нет и они не нужны: все мокапы телефона и окна `NeoShell.exe` собраны на HTML/CSS. Единственный файл — `rickroll-qr.svg`: настоящий QR-код, который используется во всех местах сайта.
