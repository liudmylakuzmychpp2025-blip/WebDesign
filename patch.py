import re, sys

path = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
html = open(path, encoding='utf-8').read()

def sub(pattern, repl, flags=re.S, count_expected=1):
    global html
    html, n = re.subn(pattern, lambda m: m.expand(repl), html, flags=flags)
    assert n == count_expected, f'Не знайдено фрагмент ({n} збігів): {pattern[:60]}'

# 1. Tailwind CDN + inline config -> зібраний CSS
sub(r'<!-- Tailwind CSS \(CDN.*?-->\s*<script src="https://cdn\.tailwindcss\.com"></script>\s*<!-- Налаштування.*?-->\s*<script>\s*tailwind\.config = \{.*?\};\s*</script>',
    '<link rel="stylesheet" href="css/output.css" />')

# 2. Google Fonts: менше накреслень
sub(re.escape('family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap'),
    'family=Inter:wght@400;600&family=Montserrat:wght@700&display=swap')

# 3. Font Awesome без блокування рендеру
FA = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css'
sub(re.escape(f'<link rel="stylesheet" href="{FA}" />'),
    '<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin />\n'
    f'    <link rel="preload" as="style" href="{FA}" onload="this.onload=null;this.rel=\'stylesheet\'" />\n'
    f'    <noscript><link rel="stylesheet" href="{FA}" /></noscript>')

# 4. Прелоад hero (LCP) перед custom-styles
sub(re.escape('<link rel="stylesheet" href="css/custom-styles.css" />'),
    '<link rel="preload" as="image" href="assets/images/hero-960.webp" '
    'imagesrcset="assets/images/hero-640.webp 640w, assets/images/hero-960.webp 960w, assets/images/hero-1280.webp 1280w" '
    'imagesizes="(min-width:1024px) 40vw, 100vw" fetchpriority="high" />\n'
    '    <link rel="stylesheet" href="css/custom-styles.css" />')

# 5. Hero: srcset
sub(re.escape('src="assets/images/hero.webp" alt='),
    'src="assets/images/hero-960.webp" srcset="assets/images/hero-640.webp 640w, assets/images/hero-960.webp 960w, assets/images/hero-1280.webp 1280w" '
    'sizes="(min-width:1024px) 40vw, 100vw" decoding="async" alt=')

# 6. Картки: jpg -> webp + srcset
sub(r'src="assets/images/(card_\w+)\.jpg" alt=',
    r'src="assets/images/\1-800.webp" srcset="assets/images/\1-400.webp 400w, assets/images/\1-800.webp 800w" '
    r'sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw" decoding="async" alt=',
    count_expected=3)

# 7. YouTube-фасад
sub(r'<iframe class="h-full w-full" src="https://www\.youtube-nocookie\.com/embed/Bo113ThT_-o".*?</iframe>',
    '''<div id="yt" class="relative h-full w-full">
                <button type="button" id="yt-play" aria-label="Відтворити відео: огляд тренувань" class="group absolute inset-0 h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus">
                  <img src="https://i.ytimg.com/vi/Bo113ThT_-o/hqdefault.jpg" alt="" width="480" height="360" loading="lazy" decoding="async" class="h-full w-full object-cover" />
                  <span class="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/10">
                    <i class="fa-solid fa-circle-play text-6xl text-brand-primary" aria-hidden="true"></i>
                  </span>
                </button>
              </div>''')

# 8. Google Maps-фасад
sub(r'<iframe class="h-full w-full" src="https://www\.google\.com/maps.*?</iframe>',
    '''<div id="map" class="h-full w-full">
                <button type="button" id="map-load" class="flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-3 text-brand-muted transition-colors hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus">
                  <i class="fa-solid fa-map-location-dot text-5xl" aria-hidden="true"></i>
                  <span class="font-semibold">Показати карту</span>
                  <span class="text-xs">Яремче, Україна</span>
                </button>
              </div>''')

# 9. Скрипт фасадів
sub(r'</body>', '''<script>
      (function () {
        function swap(boxId, btnId, src, title, allow) {
          var btn = document.getElementById(btnId);
          if (!btn) return;
          btn.addEventListener('click', function () {
            var f = document.createElement('iframe');
            f.src = src; f.title = title; f.className = 'h-full w-full';
            f.allowFullscreen = true; f.referrerPolicy = 'strict-origin-when-cross-origin';
            if (allow) f.allow = allow;
            document.getElementById(boxId).replaceChildren(f);
          });
        }
        swap('yt', 'yt-play', 'https://www.youtube-nocookie.com/embed/Bo113ThT_-o?autoplay=1',
          'Огляд тренувань фітнес-кемпу «Онови своє тіло»', 'autoplay; encrypted-media; picture-in-picture');
        swap('map', 'map-load', 'https://www.google.com/maps?q=Yaremche,+Ukraine&output=embed',
          'Карта розташування фітнес-кемпу «Онови своє тіло» в Яремчі', '');
      })();
    </script>
  </body>''')

open(path, 'w', encoding='utf-8').write(html)
print('OK: index.html оновлено')