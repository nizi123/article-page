// Usage: node scripts/compress-large-images.cjs /absolute/backup-directory [public/subdirectory]
// Keeps public URLs and formats intact; original files and report go outside public.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const backup = process.argv[2] && path.resolve(process.argv[2]);
const publicRoot = path.join(root, 'public');
const source = process.argv[3] ? path.resolve(process.argv[3]) : publicRoot;
if (source !== publicRoot && !source.startsWith(publicRoot + path.sep)) {
  throw new Error('Source must be public or a subdirectory of public.');
}
if (!backup || backup === publicRoot || backup.startsWith(publicRoot + path.sep)) {
  throw new Error('Provide a backup directory outside public.');
}
async function walk(dir) {
  const files = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...await walk(p));
    else if (/\.(png|jpe?g)$/i.test(p)) files.push(p);
  }
  return files;
}
(async () => {
  const results = [];
  for (const file of await walk(source)) {
    const before = (await fs.stat(file)).size;
    if (before <= 1024 * 1024) continue;
    const meta = await sharp(file).metadata();
    if ((meta.pages || 1) > 1) continue;
    let pipeline = sharp(file).rotate().resize({ width: 2000, withoutEnlargement: true });
    pipeline = meta.format === 'png'
      ? pipeline.png({ compressionLevel: 9 })
      : pipeline.jpeg({ quality: 85, mozjpeg: true });
    const output = await pipeline.toBuffer();
    if (output.length >= before) continue;
    const relative = path.relative(root, file);
    const original = path.join(backup, relative);
    await fs.mkdir(path.dirname(original), { recursive: true });
    await fs.copyFile(file, original, require('node:fs').constants.COPYFILE_EXCL);
    await fs.writeFile(file, output);
    const afterMeta = await sharp(output).metadata();
    results.push({ file: relative, before, after: output.length,
      originalWidth: meta.width, originalHeight: meta.height,
      width: afterMeta.width, height: afterMeta.height });
    if (results.length % 25 === 0) console.log(`Processed ${results.length} images`);
  }
  await fs.mkdir(backup, { recursive: true });
  await fs.writeFile(path.join(backup, 'report.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ count: results.length,
    before: results.reduce((s, r) => s + r.before, 0),
    after: results.reduce((s, r) => s + r.after, 0), backup }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
