/* =========================================================================
   SeoulOS 98 — Final Project Hardening
   - '오늘의 파일'을 Asia/Seoul 달력 날짜 기준으로 고정
   - 8개 seriesOrder 고정 슬롯으로 날짜→기억 매핑 안정화
   - 검증된 최종 오디오 맵을 런타임에 병합
   - 확정 콘텐츠 메타데이터 런타임 QA
   - 세계관 FILE DATE와 실제 SOURCE CAPTURED를 UI에서 구분
   - localhost에서 운영 자산을 몰래 참조하지 않도록 asset 경로 하드닝
   - localStorage 사용 불가를 사전에 감지하고 사용자에게 경고
   ========================================================================= */
(() => {
  'use strict';

  const SEOUL_TZ = 'Asia/Seoul';
  const SERIES_SIZE = 8;
  const ALLOWED_AUDIO_ORIGINS = new Set([
    'actual_location',
    'actual_seoul_representative',
    'representative_ambience'
  ]);

  function seoulDateKey(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: SEOUL_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(now);
    const values = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function dateKeyToDayNumber(key) {
    const [year, month, day] = key.split('-').map(Number);
    return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  }

  function shortDate(value) {
    const match = String(value || '').match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : String(value || 'UNKNOWN');
  }

  function persistentStorageAvailable() {
    const probe = 'seoulos98.storage.probe';
    try {
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return true;
    } catch (error) {
      console.error('[SeoulOS Storage] localStorage is unavailable. Recovery state will be session-only.', error);
      return false;
    }
  }

  const storagePersistent = persistentStorageAvailable();
  window.SeoulOSStorage = { persistent: storagePersistent };

  if (typeof Content !== 'undefined') {
    // 로컬 개발에서 없는 자산을 운영 Vercel에서 대신 가져오면 QA가 거짓 PASS가 된다.
    // 원격 URL은 그대로 두고, 프로젝트 내부 경로는 현재 origin 기준으로만 해석한다.
    Content.assetUrl = function hardenedAssetUrl(path) {
      if (!path || /^(https?:|data:|blob:)/i.test(path)) return path || '';
      return String(path).replace(/^\/+/, '');
    };

    // 날짜→기억 매핑은 배열 길이나 배열 순서가 아니라 1~8 고정 슬롯으로 계산한다.
    // 이렇게 하면 새 기억을 추가하거나 JSON 배열을 재정렬해도 이미 존재하는 날짜의 목표 슬롯은 변하지 않는다.
    Content.todays = function todaysInSeoul() {
      const memories = Content.db.memories || [];
      if (!memories.length) return null;

      const dayNumber = dateKeyToDayNumber(seoulDateKey());
      const targetOrder = ((dayNumber % SERIES_SIZE) + SERIES_SIZE) % SERIES_SIZE + 1;
      const exact = memories.find(mem => mem && mem.seriesOrder === targetOrder);
      if (exact) return exact;

      // 제작 중 누락 슬롯이 있을 때만 임시 fallback. 8개가 완성되면 이 분기는 사용되지 않는다.
      const ordered = memories
        .filter(mem => mem && Number.isInteger(mem.seriesOrder))
        .slice()
        .sort((a, b) => a.seriesOrder - b.seriesOrder);
      if (ordered.length) {
        return ordered.find(mem => mem.seriesOrder > targetOrder) || ordered[0];
      }

      return memories[0];
    };
  }

  async function mergeFinalAudio(db) {
    try {
      const res = await fetch('content/audio-final.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const map = payload && payload.audio ? payload.audio : {};
      const memories = Array.isArray(db && db.memories) ? db.memories : [];
      let merged = 0;

      memories.forEach(mem => {
        if (!mem || !mem.id || !map[mem.id]) return;
        const entry = map[mem.id];
        if (!entry.sound || !entry.meta) return;
        mem.sound = entry.sound;
        mem.audio = { ...entry.meta };
        merged += 1;
      });

      window.SeoulOSAudioMap = { loaded: true, merged };
      console.info(`[SeoulOS Audio] final audio map merged: ${merged}`);
    } catch (error) {
      window.SeoulOSAudioMap = { loaded: false, merged: 0, error: String(error && error.message || error) };
      console.warn('[SeoulOS Audio] final audio map could not be loaded. Base memory data is unchanged.', error);
    }
    return db;
  }

  function validateContent(db) {
    const errors = [];
    const warnings = [];
    const memories = Array.isArray(db && db.memories) ? db.memories : [];
    const types = db && db.types ? db.types : {};
    const ids = new Set();
    const orders = new Set();

    memories.forEach((mem, index) => {
      const label = mem && mem.id ? mem.id : `memories[${index}]`;
      if (!mem || !mem.id) {
        errors.push(`${label}: id가 없습니다.`);
        return;
      }
      if (ids.has(mem.id)) errors.push(`${label}: 중복 id입니다.`);
      ids.add(mem.id);

      ['title', 'image', 'text', 'type'].forEach(field => {
        if (!mem[field]) errors.push(`${label}: ${field}가 없습니다.`);
      });

      if (mem.type && !types[mem.type]) {
        errors.push(`${label}: 정의되지 않은 type '${mem.type}' 입니다.`);
      }

      if (mem.seriesOrder != null) {
        if (!Number.isInteger(mem.seriesOrder) || mem.seriesOrder < 1 || mem.seriesOrder > SERIES_SIZE) {
          errors.push(`${label}: seriesOrder는 1~${SERIES_SIZE} 정수여야 합니다.`);
        } else if (orders.has(mem.seriesOrder)) {
          errors.push(`${label}: seriesOrder ${mem.seriesOrder}가 중복입니다.`);
        } else {
          orders.add(mem.seriesOrder);
        }
      }

      // 시리즈에 실제로 투입되는 확정 기록은 provenance가 없으면 공개 금지 대상으로 본다.
      if (mem.author === 'user' && mem.seriesOrder != null) {
        if (!mem.source) {
          errors.push(`${label}: 확정 기록인데 source 메타데이터가 없습니다.`);
        } else {
          ['capturedAt', 'place', 'creator', 'url', 'license'].forEach(field => {
            if (!mem.source[field]) errors.push(`${label}: source.${field}가 없습니다.`);
          });
        }
        if (mem.sound && !mem.audio) {
          errors.push(`${label}: sound가 있지만 audio provenance가 없습니다.`);
        }
      }

      if (mem.audio && mem.audio.origin && !ALLOWED_AUDIO_ORIGINS.has(mem.audio.origin)) {
        errors.push(`${label}: audio.origin '${mem.audio.origin}' 값이 허용 목록에 없습니다.`);
      }

      if (mem.author === 'sample' && mem.seriesOrder != null) {
        warnings.push(`${label}: 시리즈 번호가 있지만 아직 sample 상태입니다.`);
      }
    });

    const report = {
      checkedAt: new Date().toISOString(),
      seoulDate: seoulDateKey(),
      memoryCount: memories.length,
      storagePersistent,
      audioMap: window.SeoulOSAudioMap || null,
      errors,
      warnings,
      pass: errors.length === 0
    };

    window.SeoulOSQA = report;
    if (report.pass) console.info('[SeoulOS QA]', report);
    else console.error('[SeoulOS QA]', report);
    return report;
  }

  // 기본 콘텐츠를 읽은 뒤 최종 오디오 맵을 병합하고 QA한다.
  if (typeof Content !== 'undefined' && typeof Content.load === 'function') {
    const originalLoad = Content.load.bind(Content);
    Content.load = async function hardenedLoad() {
      const db = await originalLoad();
      await mergeFinalAudio(db);
      validateContent(db);
      return db;
    };
  }

  function memoryFromViewer(win) {
    const id = String(win && win.dataset && win.dataset.id || '');
    if (!id.startsWith('view_')) return null;
    const memoryId = id.slice(5);
    return (Content.db.memories || []).find(mem => mem.id === memoryId) || null;
  }

  function enhanceViewer(win) {
    const mem = memoryFromViewer(win);
    if (!mem) return;

    const rows = win.querySelectorAll('.archive-meta > div');
    rows.forEach(row => {
      const label = row.querySelector('span');
      const value = row.querySelector('b');
      if (!label || !value) return;
      if (label.textContent.trim() === '수집 일자' || label.textContent.trim() === 'FILE DATE') {
        label.textContent = 'FILE DATE';
        value.textContent = mem.date || 'UNKNOWN';
      }
    });

    const state = win.querySelector('.archive-source');
    if (state && mem.author === 'user') {
      const captured = mem.source && mem.source.capturedAt ? shortDate(mem.source.capturedAt) : null;
      state.textContent = captured ? `확정 기록 · SRC ${captured}` : '확정 기록';
      if (mem.source) {
        state.title = [mem.source.creator, mem.source.license, mem.source.place].filter(Boolean).join(' · ');
      }
    }

    const photo = win.querySelector('.archive-photo img');
    if (photo && mem.source && mem.source.capturedAt) {
      photo.title = `SOURCE CAPTURED ${shortDate(mem.source.capturedAt)} · ${mem.source.place || ''}`.trim();
    }
  }

  function enhanceTodaySignal(root = document) {
    const note = root.querySelector('.signalwin .signal-note');
    if (!note || typeof Content === 'undefined') return;
    const mem = Content.todays();
    if (!mem) return;
    note.textContent = `${mem.place || '서울'} · FILE ${mem.date || 'UNKNOWN'}`;
  }

  function enhanceArchiveUI(root = document) {
    root.querySelectorAll('.archive-viewer[data-id^="view_"]').forEach(enhanceViewer);
    enhanceTodaySignal(root);
  }

  function showStorageWarning() {
    if (storagePersistent) return;
    const hint = document.querySelector('.power-hint');
    if (!hint || hint.querySelector('[data-storage-warning]')) return;
    const warning = document.createElement('span');
    warning.dataset.storageWarning = 'true';
    warning.textContent = '⚠ 저장 기능을 사용할 수 없습니다. 새로고침하면 복구 기록이 사라질 수 있습니다.';
    warning.style.display = 'inline-block';
    warning.style.marginTop = '6px';
    hint.appendChild(document.createElement('br'));
    hint.appendChild(warning);
  }

  window.addEventListener('DOMContentLoaded', () => {
    showStorageWarning();
    enhanceArchiveUI();
    const windows = document.getElementById('windows');
    if (!windows) return;
    const observer = new MutationObserver(() => enhanceArchiveUI(windows));
    observer.observe(windows, { childList: true, subtree: true });
  });
})();
