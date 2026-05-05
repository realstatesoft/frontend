import sharp from 'sharp';
import { resolve } from 'path';

const assets = resolve('./src/assets');

const conversions = [
  { input: 'FotoHero.png', output: 'FotoHero.webp', width: 1920 },
  { input: 'fotoSearch.png', output: 'fotoSearch.webp', width: 1200 },
  { input: 'ImagenCta.png', output: 'ImagenCta.webp', width: 800 },
  { input: 'PublishWithAgentCard.png', output: 'PublishWithAgentCard.webp', width: 600 },
  { input: 'SelfPublish.png', output: 'SelfPublish.webp', width: 600 },
];

for (const { input, output, width } of conversions) {
  const src = resolve(assets, input);
  const dst = resolve(assets, output);
  try {
    const info = await sharp(src)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(dst);
    console.log(`✅ ${input} → ${output} (${Math.round(info.size / 1024)} KB)`);
  } catch (e) {
    console.error(`❌ ${input}: ${e.message}`);
  }
}
