import sharp from 'sharp';

const dir = 'assets/images/';
const jobs = [
  ['hero.webp', 'hero', [640, 960, 1280]],
  ['card_weight_loss.jpg', 'card_weight_loss', [400, 800]],
  ['card_muscle_gain.jpg', 'card_muscle_gain', [400, 800]],
  ['card_fitness_tone.jpg', 'card_fitness_tone', [400, 800]],
];

for (const [src, name, widths] of jobs) {
  for (const w of widths) {
    await sharp(dir + src)
      .resize({ width: w })
      .webp({ quality: 75 })
      .toFile(`${dir}${name}-${w}.webp`);
    console.log(`${name}-${w}.webp`);
  }
}
console.log('Готово');