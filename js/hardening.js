/* =========================================================================
   SeoulOS 98 — Final Project Hardening
   - '오늘의 파일'을 Asia/Seoul 달력 날짜 기준으로 고정
   - 확정 콘텐츠 메타데이터 런타임 QA
   - 세계관 FILE DATE와 실제 SOURCE CAPTURED를 UI에서 구분
   ========================================================================= */
(() => {
  'use strict';

  const SEOUL_TZ = 'Asia/Seoul';
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

  // 기존 UTC 기반 Date.now()/86400000 로테이션을 서울의 '달력 날짜' 기준으로 교체한다.
  if (typeof Content !== 'undefined') {
    Content.todays = function todaysInSeoul() {
      const memories = Content.db.memories || [];
      if (!memories.length) return null;
      const dayNumber = dateKeyToDayNumber(seoulDateKey());
      const index = ((dayNumber % memories.length) + memories.length) % memories.length;
      return memories[index];
    };
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
        if (!Number.isInteger(mem.seriesOrder) || mem.seriesOrder < 1 || mem.seriesOrder > 8) {
          errors.push(`${label}: seriesOrder는 1~8 정수여야 합니다.`);
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
      errors,
      warnings,
      pass: errors.length === 0
    };

    window.SeoulOSQA = report;
    if (report.pass) console.info('[SeoulOS QA]', report);
    else console.error('[SeoulOS QA]', report);
    return report;
  }

  // Content.load가 끝난 직후 QA를 자동 실행한다.
  if (typeof Content !== 'undefined' && typeof Content.load === 'function') {
    const originalLoad = Content.load.bind(Content);
    Content.load = async function hardenedLoad() {
      const db = await originalLoad();
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

  window.addEventListener('DOMContentLoaded', () => {
    enhanceArchiveUI();
    const windows = document.getElementById('windows');
    if (!windows) return;
    const observer = new MutationObserver(() => enhanceArchiveUI(windows));
    observer.observe(windows, { childList: true, subtree: true });
  });
})();
