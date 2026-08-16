import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const db = JSON.parse(fs.readFileSync(path.join(root, 'content', 'memories.json'), 'utf8'));
const memories = Array.isArray(db.memories) ? db.memories : [];
const blockers = [];
const SERIES_SIZE = 8;

function block(message) { blockers.push(message); }
function isRemote(value) { return /^(https?:|data:|blob:)/i.test(String(value || '')); }
function readJsonIfExists(filePath) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null;
}
function mergeSupplementalMemories() {
  const payload = readJsonIfExists(path.join(root, 'content', 'supplemental-memories.json'));
  for (const mem of Array.isArray(payload?.memories) ? payload.memories : []) {
    if (mem?.id && !memories.some(existing => existing?.id === mem.id)) memories.push(mem);
  }
}
function mergeFinalAudio() {
  const payload = readJsonIfExists(path.join(root, 'content', 'audio-final.json'));
  const map = payload?.audio || {};
  for (const mem of memories) {
    const entry = mem?.id ? map[mem.id] : null;
    if (!entry?.sound || !entry?.meta) continue;
    mem.sound = entry.sound;
    mem.audio = { ...entry.meta };
  }
}
function isApprovedRemoteImage(value) {
  try {
    const url = new URL(String(value || ''));
    return ['upload.wikimedia.org', 'commons.wikimedia.org', 'museum.seoul.go.kr'].includes(url.hostname);
  } catch {
    return false;
  }
}
function isApprovedRemoteAudio(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' && url.hostname === 'bigsoundbank.com' && /^\/UPLOAD\/mp3\/\d+\.mp3$/i.test(url.pathname);
  } catch {
    return false;
  }
}
function imageIsReleaseReady(value) {
  if (!value) return false;
  if (!isRemote(value)) return String(value).startsWith('assets/img/');
  return isApprovedRemoteImage(value);
}
function audioIsReleaseReady(value) {
  if (!value) return false;
  if (!isRemote(value)) return String(value).startsWith('assets/audio/');
  return isApprovedRemoteAudio(value);
}

mergeSupplementalMemories();
mergeFinalAudio();
memories.sort((a, b) => (a.seriesOrder || 999) - (b.seriesOrder || 999));

if (memories.length !== SERIES_SIZE) block(`기억 파일 수가 ${memories.length}/${SERIES_SIZE}입니다.`);

const orders = new Map();
for (const mem of memories) {
  const label = mem?.id || '(unknown)';

  if (!Number.isInteger(mem?.seriesOrder) || mem.seriesOrder < 1 || mem.seriesOrder > SERIES_SIZE) {
    block(`${label}: seriesOrder가 1~${SERIES_SIZE} 범위의 정수가 아닙니다.`);
  } else if (orders.has(mem.seriesOrder)) {
    block(`${label}: FILE ${mem.seriesOrder}가 ${orders.get(mem.seriesOrder)}와 중복됩니다.`);
  } else {
    orders.set(mem.seriesOrder, label);
  }

  if (mem?.author !== 'user') block(`${label}: 아직 author:${mem?.author || 'missing'} 상태입니다.`);

  for (const field of ['theme', 'role', 'memoryEra', 'date', 'title', 'image', 'sound', 'text', 'place', 'type']) {
    if (!mem?.[field]) block(`${label}: 최종 공개 필드 ${field}가 없습니다.`);
  }

  if (!mem?.source) {
    block(`${label}: source provenance가 없습니다.`);
  } else {
    for (const field of ['capturedAt', 'place', 'creator', 'url', 'license']) {
      if (!mem.source[field]) block(`${label}: source.${field}가 없습니다.`);
    }
  }

  if (!mem?.audio) {
    block(`${label}: audio provenance가 없습니다.`);
  } else {
    if (mem.audio.status && mem.audio.status !== 'final') block(`${label}: audio.status가 '${mem.audio.status}'입니다.`);
    if (!mem.audio.origin) block(`${label}: audio.origin이 없습니다.`);
    if (!mem.audio.license) block(`${label}: audio.license가 없습니다.`);
    if (!mem.audio.pageUrl) block(`${label}: audio.pageUrl이 없습니다.`);
  }

  if (mem?.image && !imageIsReleaseReady(mem.image)) block(`${label}: image는 로컬 assets/img 또는 승인된 공공 아카이브 원본이어야 합니다.`);
  if (mem?.sound && !audioIsReleaseReady(mem.sound)) block(`${label}: sound는 로컬 assets/audio 또는 승인된 직접 CC0 MP3 자산이어야 합니다.`);
}

for (let order = 1; order <= SERIES_SIZE; order += 1) {
  if (!orders.has(order)) block(`FILE ${order} 슬롯이 비어 있습니다.`);
}

const finalCount = memories.filter(mem => mem?.author === 'user').length;
const soundCount = memories.filter(mem => Boolean(mem?.sound)).length;
const imageReadyCount = memories.filter(mem => imageIsReleaseReady(mem?.image)).length;
const audioReadyCount = memories.filter(mem => audioIsReleaseReady(mem?.sound)).length;

console.log('\nSeoulOS 98 Release Readiness');
console.log(`- memories: ${memories.length}/${SERIES_SIZE}`);
console.log(`- finalized: ${finalCount}/${SERIES_SIZE}`);
console.log(`- sound attached: ${soundCount}/${SERIES_SIZE}`);
console.log(`- image ready: ${imageReadyCount}/${SERIES_SIZE}`);
console.log(`- audio ready: ${audioReadyCount}/${SERIES_SIZE}`);

if (blockers.length) {
  console.error(`\nRELEASE GATE: FAIL (${blockers.length} blockers)`);
  blockers.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log('\nRELEASE GATE: PASS — 8/8 memories are final with verified archival images and verified media audio.');
