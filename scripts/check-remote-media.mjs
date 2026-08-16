import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const db = JSON.parse(fs.readFileSync(path.join(root, 'content', 'memories.json'), 'utf8'));
const audioPath = path.join(root, 'content', 'audio-final.json');
const audioMap = fs.existsSync(audioPath)
  ? (JSON.parse(fs.readFileSync(audioPath, 'utf8')).audio || {})
  : {};
const memories = Array.isArray(db.memories) ? db.memories : [];
const jobs = [];
const errors = [];

function isRemote(value) {
  return /^https?:/i.test(String(value || ''));
}

for (const mem of memories) {
  if (isRemote(mem?.image)) jobs.push({ id: mem.id, kind: 'image', url: mem.image });
  const mappedSound = mem?.id && audioMap[mem.id]?.sound ? audioMap[mem.id].sound : mem?.sound;
  if (isRemote(mappedSound)) jobs.push({ id: mem.id, kind: 'audio', url: mappedSound });
}

function detect(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  if (bytes.length >= 3 && String.fromCharCode(...bytes.slice(0, 3)) === 'ID3') return 'mp3';
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return 'mp3';
  return 'unknown';
}

async function fetchPrefix(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Range: 'bytes=0-63',
        'User-Agent': 'SeoulOS98-QA/1.0'
      },
      signal: controller.signal
    });
    if (!response.ok && response.status !== 206) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    let bytes = new Uint8Array();
    if (reader) {
      const first = await reader.read();
      if (first.value) bytes = first.value.slice(0, 64);
      try { await reader.cancel(); } catch {}
    } else {
      bytes = new Uint8Array((await response.arrayBuffer()).slice(0, 64));
    }

    return {
      status: response.status,
      type: response.headers.get('content-type') || '',
      detected: detect(bytes),
      size: bytes.length
    };
  } finally {
    clearTimeout(timer);
  }
}

async function check(job) {
  try {
    const result = await fetchPrefix(job.url);
    const valid = job.kind === 'image'
      ? ['jpg', 'png'].includes(result.detected)
      : result.detected === 'mp3';

    if (!valid) {
      errors.push(`${job.id}: ${job.kind} signature mismatch (${result.detected}) — ${job.url}`);
      return;
    }
    console.log(`PASS ${job.kind.padEnd(5)} ${job.id} — HTTP ${result.status}, ${result.detected}, ${result.type || 'no content-type'}`);
  } catch (error) {
    errors.push(`${job.id}: ${job.kind} fetch failed — ${job.url} — ${error.message}`);
  }
}

await Promise.all(jobs.map(check));

if (errors.length) {
  console.error(`\nRemote media QA FAILED (${errors.length})`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`\nRemote media QA PASS — ${jobs.length} remote media assets verified.`);
