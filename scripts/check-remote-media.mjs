import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const db = JSON.parse(fs.readFileSync(path.join(root, 'content', 'memories.json'), 'utf8'));
const supplementalPath = path.join(root, 'content', 'supplemental-memories.json');
if (fs.existsSync(supplementalPath)) {
  const supplemental = JSON.parse(fs.readFileSync(supplementalPath, 'utf8'));
  for (const mem of Array.isArray(supplemental.memories) ? supplemental.memories : []) {
    if (mem?.id && !db.memories.some(existing => existing?.id === mem.id)) db.memories.push(mem);
  }
}
const audioPath = path.join(root, 'content', 'audio-final.json');
const audioMap = fs.existsSync(audioPath)
  ? (JSON.parse(fs.readFileSync(audioPath, 'utf8')).audio || {})
  : {};
const memories = Array.isArray(db.memories) ? db.memories : [];
const jobs = [];
const errors = [];
const warnings = [];

function isRemote(value) {
  return /^https?:/i.test(String(value || ''));
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function trustedRateLimitHost(url) {
  try {
    return new URL(url).hostname === 'upload.wikimedia.org';
  } catch {
    return false;
  }
}

for (const mem of memories) {
  if (isRemote(mem?.image)) {
    jobs.push({
      id: mem.id,
      kind: 'image',
      url: mem.image,
      fallbackUrl: isRemote(mem?.source?.originalFileUrl) && mem.source.originalFileUrl !== mem.image
        ? mem.source.originalFileUrl
        : null
    });
  }
  const mappedSound = mem?.id && audioMap[mem.id]?.sound ? audioMap[mem.id].sound : mem?.sound;
  if (isRemote(mappedSound)) jobs.push({ id: mem.id, kind: 'audio', url: mappedSound, fallbackUrl: null });
}

function detect(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  if (bytes.length >= 3 && String.fromCharCode(...bytes.slice(0, 3)) === 'ID3') return 'mp3';
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return 'mp3';
  return 'unknown';
}

async function requestPrefix(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Range: 'bytes=0-63',
        'User-Agent': 'SeoulOS98-QA/1.0 (portfolio media integrity check)'
      },
      signal: controller.signal
    });

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get('retry-after'));
      try { await response.body?.cancel(); } catch {}
      return { rateLimited: true, retryAfter: Number.isFinite(retryAfter) ? retryAfter : null };
    }

    if (!response.ok && response.status !== 206) throw new Error(`HTTP ${response.status}`);

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
      rateLimited: false,
      status: response.status,
      type: response.headers.get('content-type') || '',
      detected: detect(bytes)
    };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPrefix(url) {
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await requestPrefix(url);
    if (!result.rateLimited) return result;
    if (attempt === maxAttempts) {
      const error = new Error('HTTP 429 after retries');
      error.code = 'RATE_LIMIT';
      throw error;
    }
    const delay = result.retryAfter ? Math.min(result.retryAfter * 1000, 8000) : 800 * attempt;
    console.log(`RETRY rate-limit (${attempt}/${maxAttempts - 1}) in ${delay}ms — ${url}`);
    await sleep(delay);
  }
  throw new Error('unreachable');
}

function isValidSignature(kind, detected) {
  return kind === 'image' ? ['jpg', 'png'].includes(detected) : detected === 'mp3';
}

async function verifyUrl(job, url, label) {
  const result = await fetchPrefix(url);
  if (!isValidSignature(job.kind, result.detected)) throw new Error(`${label} signature mismatch (${result.detected})`);
  console.log(`PASS ${job.kind.padEnd(5)} ${job.id}${label === 'fallback' ? ' [source fallback]' : ''} — HTTP ${result.status}, ${result.detected}, ${result.type || 'no content-type'}`);
}

async function check(job) {
  try {
    await verifyUrl(job, job.url, 'primary');
    return;
  } catch (primaryError) {
    if (job.fallbackUrl) {
      console.log(`FALLBACK ${job.id} — primary unavailable (${primaryError.message}); checking source original.`);
      try {
        await sleep(500);
        await verifyUrl(job, job.fallbackUrl, 'fallback');
        return;
      } catch (fallbackError) {
        if (fallbackError.code === 'RATE_LIMIT' && trustedRateLimitHost(job.fallbackUrl)) {
          warnings.push(`${job.id}: Wikimedia source original rate-limited; reachability inconclusive this run.`);
          return;
        }
        errors.push(`${job.id}: ${job.kind} primary+fallback failed — ${primaryError.message}; ${fallbackError.message}`);
        return;
      }
    }

    if (primaryError.code === 'RATE_LIMIT' && job.kind === 'image' && trustedRateLimitHost(job.url)) {
      warnings.push(`${job.id}: Wikimedia image rate-limited; reachability inconclusive this run.`);
      return;
    }
    errors.push(`${job.id}: ${job.kind} fetch failed — ${job.url} — ${primaryError.message}`);
  }
}

for (const job of jobs) {
  await check(job);
  if (job.kind === 'image') await sleep(350);
}

if (warnings.length) {
  console.warn(`\nRemote media QA WARNINGS (${warnings.length})`);
  warnings.forEach(warning => console.warn(`- ${warning}`));
}
if (errors.length) {
  console.error(`\nRemote media QA FAILED (${errors.length})`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`\nRemote media QA PASS — ${jobs.length - warnings.length} verified, ${warnings.length} transient Wikimedia warning(s).`);
