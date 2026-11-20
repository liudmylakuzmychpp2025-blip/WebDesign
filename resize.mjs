import sharp from 'sharp';

const dir = 'assets/images/';
const jobs = [
  ['hero.webp',             'hero-1200.webp',            1200],
  ['card_weight_loss.jpg',  'card_weight_loss-800.webp',  800],
  ['card_muscle_gain.jpg',  'card_muscle_gain-800.webp',  800],
  ['card_fitness_tone.jpg', 'card_fitness_tone-800.webp', 800],
];

for (const [src, out, width] of jobs) {
  await sharp(dir + src).resize({ width }).webp({ quality: 75 }).toFile(dir + out);
  console.log('OK', out);
}