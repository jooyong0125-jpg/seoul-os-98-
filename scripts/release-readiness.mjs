import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const db = JSON.parse(fs.readFileSync(path.join(root, 'content', 'memories.json'), 'utf8'));
const memories = Array.isArray(db.memories) ? db.memories : [];
const blockers = [];
const SERIES_SIZE = 8;

function block(message) { blockers.push(message); }
function isRemote(value) { return /^(https?:|data:|blob:)/i.test(String(value || '')); }

if (memories.length !== SERIES_SIZE) {
  block(`기억 파일 수가 ${memories.length}/${SERIES_SIZE}입니다.`);
}

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
    if (mem.audio.status && mem.audio.status !== 'final') {
      block(`${label}: audio.status가 '${mem.audio.status}'입니다.`);
    }
    if (!mem.audio.origin) block(`${label}: audio.origin이 없습니다.`);
  }

  if (mem?.image && isRemote(mem.image)) {
    block(`${label}: 최종 이미지는 외부 핫링크가 아니라 로컬 assets/img 파일이어야 합니다.`);
  }
  if (mem?.sound && isRemote(mem.sound)) {
    block(`${label}: 최종 음원은 외부 핫링크가 아니라 로컬 assets/audio 파일이어야 합니다.`);
  }
  if (mem?.image && !isRemote(mem.image) && !String(mem.image).startsWith('assets/img/')) {
    block(`${label}: image가 assets/img/ 아래에 있지 않습니다.`);
  }
  if (mem?.sound && !isRemote(mem.sound) && !String(mem.sound).startsWith('assets/audio/')) {
    block(`${label}: sound가 assets/audio/ 아래에 있지 않습니다.`);
  }
}

for (let order = 1; order <= SERIES_SIZE; order += 1) {
  if (!orders.has(order)) block(`FILE ${order} 슬롯이 비어 있습니다.`);
}

const finalCount = memories.filter(mem => mem?.author === 'user').length;
const soundCount = memories.filter(mem => Boolean(mem?.sound)).length;
const localImageCount = memories.filter(mem => mem?.image && !isRemote(mem.image)).length;
const localSoundCount = memories.filter(mem => mem?.sound && !isRemote(mem.sound)).length;

console.log('\nSeoulOS 98 Release Readiness');
console.log(`- memories: ${memories.length}/${SERIES_SIZE}`);
console.log(`- finalized: ${finalCount}/${SERIES_SIZE}`);
console.log(`- sound attached: ${soundCount}/${SERIES_SIZE}`);
console.log(`- local images: ${localImageCount}/${SERIES_SIZE}`);
console.log(`- local sounds: ${localSoundCount}/${SERIES_SIZE}`);

if (blockers.length) {
  console.error(`\nRELEASE GATE: FAIL (${blockers.length} blockers)`);
  blockers.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log('\nRELEASE GATE: PASS — 8/8 memories are final and locally packaged.');
