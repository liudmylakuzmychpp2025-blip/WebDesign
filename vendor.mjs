import fs from 'fs';
import path from 'path';

const cp = (from, to) => {
  try {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.cpSync('node_modules/' + from, to, { recursive: true });
    console.log('OK  ', to);
  } catch (e) {
    console.log('FAIL', from, '-', e.code);
  }
};

cp('@fortawesome/fontawesome-free/css/all.min.css', 'assets/vendor/fa/css/all.min.css');
cp('@fortawesome/fontawesome-free/webfonts', 'assets/vendor/fa/webfonts');

cp('swiper/swiper-bundle.min.css', 'assets/vendor/swiper/swiper-bundle.min.css');
cp('swiper/swiper-bundle.min.js', 'assets/vendor/swiper/swiper-bundle.min.js');

cp('@fancyapps/ui/dist/fancybox/fancybox.css', 'assets/vendor/fancybox/fancybox.css');
cp('@fancyapps/ui/dist/fancybox/fancybox.umd.js', 'assets/vendor/fancybox/fancybox.umd.js');

cp('typed.js/lib/typed.min.js', 'assets/vendor/typed/typed.umd.js');

cp('@fontsource-variable/inter/index.css', 'assets/vendor/fonts/inter.css');
cp('@fontsource-variable/inter/files', 'assets/vendor/fonts/files');
cp('@fontsource-variable/montserrat/index.css', 'assets/vendor/fonts/montserrat.css');
cp('@fontsource-variable/montserrat/files', 'assets/vendor/fonts/files');