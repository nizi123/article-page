# Large image compression

Run from the project root:

```sh
node scripts/compress-large-images.cjs "$PWD/.image-backups/$(date +%Y%m%d-%H%M%S)"
```

Requires `sharp` (available in the current Next.js installation). Use a new backup
folder for every run. The script considers JPEG/PNG files larger than 1 MiB,
keeps their existing public paths and formats, and replaces only smaller results.
It preserves aspect ratio, caps width at 2,000px without enlargement, auto-orients
photos, uses JPEG quality 85, and lossless PNG encoding after resizing. Animated
images are skipped. Small text and full-screen images should be checked visually.

Originals and per-file before/after sizes are retained in the backup folder.
`.image-backups` is excluded from Git and Vercel uploads; never copy it into
`public` or another hosting service's published output.

The first run's backup and report are in `.image-backups/2026-10-11/`.
This only changes local assets. A deployment is required to publish the changes;
it does not clear previously accumulated hosting bandwidth usage.
