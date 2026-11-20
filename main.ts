// gta6-clipper-01 entry: hands VIDEO.json to the gate.
//
// The video itself is the entry — the house reads its views from YouTube and
// places go by those views. This program only copies VIDEO.json from the
// repository root to /output, and it checks the address first so a malformed
// URL fails loudly instead of slipping through silently. A placeholder URL
// (the one this repository ships with before the video is uploaded) is
// allowed through with a warning: the gate refuses it at submit time, and
// the real address replaces it before the entry goes in.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// A YouTube video address: a Short, a watch page, or a youtu.be link,
// with an 11-character video id.
const YOUTUBE_URL =
  /^https:\/\/(www\.|m\.)?(youtube\.com\/(shorts\/|watch\?v=)|youtu\.be\/)[A-Za-z0-9_-]{11}([?&#].*)?$/;
const PLACEHOLDER_URL = 'https://www.youtube.com/shorts/<id>';

const source = join(BOT_DIR, 'VIDEO.json');

let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(source, 'utf8'));
} catch (err) {
  console.error(`VIDEO.json could not be read from ${source}: ${(err as Error).message}`);
  process.exit(1);
}

if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
  console.error('VIDEO.json must be a JSON object with a url field');
  process.exit(1);
}

const url = (parsed as { url?: unknown }).url;
if (typeof url !== 'string' || url.length === 0) {
  console.error('VIDEO.json has no url string');
  process.exit(1);
}
if (url === PLACEHOLDER_URL) {
  console.error('warning: VIDEO.json still holds the placeholder address; replace it with the real video URL before submitting');
} else if (!YOUTUBE_URL.test(url)) {
  console.error(`VIDEO.json url is not a YouTube video address: ${url}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(source, join(OUTPUT_DIR, 'VIDEO.json'));
} catch (err) {
  console.error(`VIDEO.json could not be copied to ${OUTPUT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
