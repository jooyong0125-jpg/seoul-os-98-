import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const jsonPath = path.join(root, 'content', 'memories.json');
const errors = [];
const warnings = [];

function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }
function readJsonIfExists(filePath) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null;
}

function detectFileType(filePath) {
  const data = fs.readFileSync(filePath);
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'jpg';
  if (data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) return 'png';
  if (data.length >= 12 && data.subarray(0, 4).toString('ascii') === 'RIFF' && data.subarray(8, 12).toString('ascii') === 'WAVE') return 'wav';
  if (data.length >= 3 && data.subarray(0, 3).toString('ascii') === 'ID3') return 'mp3';
  if (data.length >= 2 && data[0] === 0xff && (data[1] & 0xe0) === 0xe0) return 'mp3';
  if (data.length >= 4 && data.subarray(0, 4).toString('ascii') === 'fLaC') return 'flac';
  return 'unknown';
}

function validateLocalAsset(memoryId, field, assetPath) {
  if (!assetPath || /^(https?:|data:|blob:)/i.test(assetPath)) return;
  const normalized = String(assetPath).replace(/^\//, '');
  const absolute = path.join(root, normalized);
  if (!fs.existsSync(absolute)) {
    fail(`${memoryId}: ${field} 파일이 없습니다: ${normalized}`);
    return;
  }
  const stat = fs.statSync(absolute);
  if (!stat.isFile() || stat.size === 0) {
    fail(`${memoryId}: ${field} 파일이 비어 있거나 파일이 아닙니다: ${normalized}`);
    return;
  }

  const ext = path.extname(normalized).slice(1).toLowerCase();
  const detected = detectFileType(absolute);
  const aliases = { jpeg: 'jpg' };
  const expected = aliases[ext] || ext;
  if (['jpg','png','mp3','wav','flac'].includes(expected) && detected !== expected) {
    fail(`${memoryId}: ${field} 확장자 .${ext}와 실제 포맷(${detected})이 다릅니다: ${normalized}`);
  }
}

let db;
try {
  db = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
} catch (error) {
  console.error(`memories.json 파싱 실패: ${error.message}`);
  process.exit(1);
}

const memories = Array.isArray(db.memories) ? db.memories : [];
const supplemental = readJsonIfExists(path.join(root, 'content', 'supplemental-memories.json'));
for (const mem of Array.isArray(supplemental?.memories) ? supplemental.memories : []) {
  if (!mem?.id) {
    fail('supplemental memory에 id가 없습니다.');
    continue;
  }
  if (memories.some(existing => existing?.id === mem.id)) {
    fail(`${mem.id}: base/supplemental memory id가 중복됩니다.`);
    continue;
  }
  memories.push(mem);
}

const audioPayload = readJsonIfExists(path.join(root, 'content', 'audio-final.json'));
const audioMap = audioPayload?.audio || {};
for (const mem of memories) {
  const entry = mem?.id ? audioMap[mem.id] : null;
  if (!entry) continue;
  if (!entry.sound || !entry.meta) {
    fail(`${mem.id}: audio-final 항목에 sound 또는 meta가 없습니다.`);
    continue;
  }
  mem.sound = entry.sound;
  mem.audio = { ...entry.meta };
}
memories.sort((a, b) => (a?.seriesOrder || 999) - (b?.seriesOrder || 999));

const types = db.types || {};
const ids = new Set();
const orders = new Set();
const allowedAudioOrigins = new Set(['actual_location', 'actual_seoul_representative', 'representative_ambience']);

for (const [index, mem] of memories.entries()) {
  const label = mem?.id || `memories[${index}]`;
  if (!mem?.id) {
    fail(`${label}: id가 없습니다.`);
    continue;
  }
  if (ids.has(mem.id)) fail(`${label}: 중복 id입니다.`);
  ids.add(mem.id);

  for (const field of ['title','ext','image','text','type','author']) {
    if (!mem[field]) fail(`${label}: ${field}가 없습니다.`);
  }

  if (mem.type && !types[mem.type]) fail(`${label}: 정의되지 않은 type '${mem.type}' 입니다.`);

  if (mem.seriesOrder != null) {
    if (!Number.isInteger(mem.seriesOrder) || mem.seriesOrder < 1 || mem.seriesOrder > 8) {
      fail(`${label}: seriesOrder는 1~8 정수여야 합니다.`);
    } else if (orders.has(mem.seriesOrder)) {
      fail(`${label}: seriesOrder ${mem.seriesOrder}가 중복입니다.`);
    } else {
      orders.add(mem.seriesOrder);
    }
  }

  if (mem.seriesOrder != null) {
    for (const field of ['theme','role','memoryEra','date']) {
      if (!mem[field]) fail(`${label}: 시리즈 기록에 ${field}가 없습니다.`);
    }
    if (!mem.source) {
      fail(`${label}: 시리즈 기록에 source가 없습니다.`);
    } else {
      for (const field of ['capturedAt','place','creator','url','license']) {
        if (!mem.source[field]) fail(`${label}: source.${field}가 없습니다.`);
      }
    }
    if (!mem.sound) fail(`${label}: 최종 오디오 맵 병합 후 sound가 없습니다.`);
    if (!mem.audio) fail(`${label}: 최종 오디오 맵 병합 후 audio provenance가 없습니다.`);
  }

  if (mem.audio?.origin && !allowedAudioOrigins.has(mem.audio.origin)) {
    fail(`${label}: 허용되지 않은 audio.origin '${mem.audio.origin}' 입니다.`);
  }
  if (mem.audio?.status && mem.audio.status !== 'final') {
    fail(`${label}: 병합된 audio.status가 '${mem.audio.status}' 입니다.`);
  }

  if (mem.author === 'sample' && mem.seriesOrder != null) {
    warn(`${label}: seriesOrder가 있지만 아직 sample입니다.`);
  }

  validateLocalAsset(label, 'image', mem.image);
  if (mem.sound) validateLocalAsset(label, 'sound', mem.sound);
}

for (let order = 1; order <= 8; order += 1) {
  if (!orders.has(order)) fail(`FILE ${order} 슬롯이 비어 있습니다.`);
}

const corruptedIds = new Set();
for (const item of Array.isArray(db.corrupted) ? db.corrupted : []) {
  if (!item?.id) fail('corrupted 항목에 id가 없습니다.');
  else if (corruptedIds.has(item.id) || ids.has(item.id)) fail(`${item.id}: id가 중복됩니다.`);
  else corruptedIds.add(item.id);
}

if (warnings.length) {
  console.warn('\nWarnings:');
  warnings.forEach(item => console.warn(`- ${item}`));
}

if (errors.length) {
  console.error('\nSeoulOS content QA FAILED:');
  errors.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`SeoulOS content QA PASS — ${memories.length} memories checked, ${ids.size} unique IDs, ${orders.size}/8 series slots.`);
