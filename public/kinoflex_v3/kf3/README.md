# 🎬 KinoFlex v3 — JS Embed Балансер

Профессиональный видеобалансер с JS-подключением как у CDNvideoHub.
**Один тег `<script>` — плеер рендерится прямо на сайте партнёра.**

---

## 📁 Структура

```
kinoflex/
├── index.html                    # Редирект → landing
├── landing/index.html            # Лендинг + живой поиск + демо
├── partner/index.html            # Партнёрский лендинг
├── docs/
│   ├── privacy.html              # Политика конфиденциальности
│   ├── terms.html                # Пользовательское соглашение
│   ├── dmca.html                 # DMCA
│   └── cookies.html              # Политика Cookie
├── embed/
│   └── player.js                 # 🔑 ГЛАВНЫЙ ФАЙЛ — JS embed скрипт
└── assets/
    ├── css/shared.css            # Общие стили
    └── js/ui.js                  # Nav + footer
```

---

## ⚡ Подключение на сайт партнёра

### Фильм:
```html
<div class="kinoflex-player"
     data-kp-id="464963"
     data-type="movie"
     data-title="Интерстеллар"
     data-year="2014"
     data-height="550">
</div>

<script src="https://kinoflex.ru/embed/player.js"
        data-publisher-id="ВАШ_ID"></script>
```

### Сериал:
```html
<div class="kinoflex-player"
     data-kp-id="77184"
     data-type="series"
     data-title="Игра престолов"
     data-year="2011"
     data-height="560">
</div>

<script src="https://kinoflex.ru/embed/player.js"
        data-publisher-id="ВАШ_ID"></script>
```

### DLE-шаблон (автоматически подставляет ID):
```html
<!-- В шаблоне fullstory.tpl замените блок плеера на: -->
<div class="kinoflex-player"
     data-kp-id="{id}"
     data-type="{catlist == 'Сериалы' ? 'series' : 'movie'}"
     data-title="{title}"
     data-year="{year}"
     data-height="550">
</div>
<script src="https://kinoflex.ru/embed/player.js"
        data-publisher-id="ВАШ_ID"></script>
```

---

## 📋 Параметры data-атрибутов

| Атрибут       | Описание                         | Пример          |
|---------------|----------------------------------|-----------------|
| `data-kp-id`  | ID Кинопоиска (обязательный)     | `464963`        |
| `data-type`   | `movie` или `series`             | `series`        |
| `data-title`  | Название для поиска VK/YT/Rutube | `Игра престолов`|
| `data-year`   | Год выхода                       | `2011`          |
| `data-height` | Высота плеера в px               | `550`           |

**Где взять Kinopoisk ID:**
URL: `https://www.kinopoisk.ru/film/464963/` → ID = `464963`

---

## 📺 Источники (12 штук)

| Источник    | Тип    | Описание                        |
|-------------|--------|---------------------------------|
| Namy        | iframe | api.namy.ws                     |
| Atomics     | iframe | api1690380040.atomics.ws        |
| Marts       | iframe | api.marts.ws                    |
| Domem       | iframe | api.domem.ws                    |
| Obrut       | iframe | obrut.show                      |
| Embess      | iframe | api.embess.ws                   |
| Lutube      | iframe | lutube.base44.app               |
| PlVideo     | iframe | plvideo.base44.app              |
| CDNvideoHub | JS     | video-player web component      |
| VK Video    | search | Открывает поиск ВКонтакте       |
| Rutube      | search | Открывает поиск Rutube          |
| YouTube     | search | Открывает поиск YouTube         |

---

## 📢 Реклама (VAST / Clickadilla)

Уже настроена: `spot_id=1488670`

Как работает:
1. Плеер загружает VAST XML через CORS-прокси
2. Извлекает MP4 ссылку из MediaFile
3. Показывает видео-преролл
4. Через 5 сек — кнопка «Пропустить»
5. После пропуска — основной плеер

Изменить spot_id в `embed/player.js`:
```js
vastUrl: 'https://vast.yomeno.xyz/vast?spot_id=ВАШ_ID',
```

---

## 💾 Сохранение состояния

- **Глобально** (для всех фильмов): источник, озвучка
- **Per-film** (по kp_id): сезон, серия

Хранится в `localStorage` браузера посетителя.

---

## 🚀 Деплой на GitHub Pages

```bash
git init
git add .
git commit -m "KinoFlex v3"
git remote add origin https://github.com/USER/kinoflex.git
git push -u origin main
# Settings → Pages → Source: main / root
# Адрес: https://USER.github.io/kinoflex/
```

После деплоя обновите `cdnBase` в `embed/player.js`:
```js
cdnBase: 'https://USER.github.io/kinoflex',
```

---

## 📞 Контакты

Партнёрство: **ginkdev@mail.ru**
