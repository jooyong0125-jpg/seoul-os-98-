/* =========================================================================
   SeoulOS 98 — 앱 & 상태
   ========================================================================= */

/* ── 픽셀 아이콘 (인라인 SVG) ───────────────────────────────────────────── */
const ICON = {
  file: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 1h7l3 3v11H3z" fill="#fff" stroke="#000"/><path d="M10 1v3h3" fill="none" stroke="#000"/><rect x="5" y="7" width="6" height="1" fill="#3a6"/><rect x="5" y="9" width="6" height="1" fill="#3a6"/><rect x="5" y="11" width="4" height="1" fill="#3a6"/></svg>`,
  photo: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="12" fill="#fff" stroke="#000"/><rect x="2" y="3" width="12" height="8" fill="#1084d0"/><circle cx="5" cy="6" r="1.4" fill="#ffd23f"/><path d="M2 11l3-3 2 2 3-4 4 5v0H2z" fill="#0a6"/></svg>`,
  mail: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="3" width="14" height="10" fill="#fff" stroke="#000"/><path d="M1 3l7 5 7-5" fill="none" stroke="#000"/></svg>`,
  hdd: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="4" width="14" height="8" rx="1" fill="#c0c0c0" stroke="#000"/><rect x="2" y="5" width="12" height="4" fill="#808080"/><circle cx="12" cy="10.5" r="1" fill="#0f0"/></svg>`,
  folder: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1 4h5l1 1h8v8H1z" fill="#ffd23f" stroke="#000"/><path d="M1 5h14" stroke="#dfa"/></svg>`,
  folderOpen: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1 4h5l1 1h8v2H3l-2 6z" fill="#ffd23f" stroke="#000"/><path d="M1 13l2-6h13l-2 6z" fill="#ffe58a" stroke="#000"/></svg>`,
  trash: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="4" width="10" height="10" fill="#c0c0c0" stroke="#000"/><rect x="2" y="2" width="12" height="2" fill="#808080" stroke="#000"/><path d="M6 6v6M8 6v6M10 6v6" stroke="#666"/></svg>`,
  gauge: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="9" r="6" fill="none" stroke="#000"/><path d="M8 9L11 5" stroke="#f33" stroke-width="1.5"/><circle cx="8" cy="9" r="1" fill="#000"/></svg>`,
  star: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1l2 4 4 .5-3 3 .8 4L8 14l-3.8 2.5.8-4-3-3 4-.5z" fill="#ffd23f" stroke="#000"/></svg>`,
  map: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1 3l5-2 4 2 5-2v11l-5 2-4-2-5 2z" fill="#cde7c9" stroke="#000"/><path d="M6 1v11M10 3v11" stroke="#4a4"/></svg>`,
  report: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="1" width="12" height="14" fill="#fff" stroke="#000"/><rect x="4" y="4" width="8" height="1" fill="#008"/><rect x="4" y="6" width="8" height="1" fill="#888"/><rect x="4" y="8" width="6" height="1" fill="#888"/><rect x="4" y="11" width="8" height="2" fill="#f39"/></svg>`,
  broken: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 1h7l3 3v11H3z" fill="#fff" stroke="#000"/><path d="M6 6l4 4M10 6l-4 4" stroke="#f33" stroke-width="1.4"/></svg>`,
  info: `<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#1084d0" stroke="#000"/><text x="16" y="24" font-size="22" fill="#fff" text-anchor="middle" font-family="Georgia,serif" font-style="italic">i</text></svg>`,
  warn: `<svg width="32" height="32" viewBox="0 0 32 32"><path d="M16 2l14 26H2z" fill="#ffd23f" stroke="#000"/><text x="16" y="26" font-size="18" fill="#000" text-anchor="middle" font-weight="bold">!</text></svg>`,
  disk: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" fill="#1a1a6e" stroke="#000"/><rect x="4" y="1" width="8" height="6" fill="#c0c0c0"/><rect x="6" y="2" width="3" height="4" fill="#333"/><rect x="3" y="9" width="10" height="5" fill="#dfdfdf"/></svg>`,
  book: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 2h5c1 0 1 1 1 1v11s0-1-1-1H2z" fill="#1084d0" stroke="#000"/><path d="M14 2H9C8 2 8 3 8 3v11s0-1 1-1h5z" fill="#33a0e0" stroke="#000"/><rect x="3" y="5" width="4" height="1" fill="#fff"/><rect x="3" y="7" width="4" height="1" fill="#fff"/><rect x="9" y="5" width="4" height="1" fill="#fff"/><rect x="9" y="7" width="4" height="1" fill="#fff"/></svg>`
};
const bigIcon = (svg) => svg.replace('width="16" height="16"', 'width="44" height="44"')
                            .replace('width="32" height="32"', 'width="44" height="44"');

const Safe = {
  html(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

/* ── 상태 (localStorage) ──────────────────────────────────────────────── */
const State = (() => {
  const KEY = 'seoulos98.save.v1';
  const def = {
    name: '', recovered: [], corruptFound: [], firstBoot: true,
    crt: true, muted: false, helpSeen: false, introSeen: false,
    profilePromptVersion: 0, welcomeVersion: 0, manualVersion: 0
  };
  let s;
  try { s = Object.assign({}, def, JSON.parse(localStorage.getItem(KEY) || '{}')); }
  catch (e) { s = Object.assign({}, def); }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

  return {
    get data() { return s; },
    get name() { return s.name; },
    set name(v) { s.name = v; save(); },
    get recovered() { return s.recovered; },
    isRecovered(id) { return s.recovered.some(r => r.id === id); },
    addRecovered(mem) {
      if (this.isRecovered(mem.id)) return false;
      s.recovered.push({ id: mem.id, title: mem.title, ext: mem.ext, image: mem.image, ts: Date.now() });
      save(); return true;
    },
    addCorrupt(id) { if (!s.corruptFound.includes(id)) { s.corruptFound.push(id); save(); } },
    get corruptFound() { return s.corruptFound; },
    get firstBoot() { return s.firstBoot; },
    set firstBoot(v) { s.firstBoot = v; save(); },
    get crt() { return s.crt; },
    set crt(v) { s.crt = v; save(); },
    get muted() { return s.muted; },
    set muted(v) { s.muted = v; save(); },
    get helpSeen() { return s.helpSeen; },
    set helpSeen(v) { s.helpSeen = v; save(); },
    get introSeen() { return s.introSeen; },
    set introSeen(v) { s.introSeen = v; save(); },
    get profilePromptVersion() { return Number(s.profilePromptVersion) || 0; },
    set profilePromptVersion(v) { s.profilePromptVersion = Number(v) || 0; save(); },
    get welcomeVersion() { return Number(s.welcomeVersion) || 0; },
    set welcomeVersion(v) { s.welcomeVersion = Number(v) || 0; save(); },
    get manualVersion() { return Number(s.manualVersion) || 0; },
    set manualVersion(v) { s.manualVersion = Number(v) || 0; save(); },
    reset() { s = Object.assign({}, def); save(); }
  };
})();

/* ── 콘텐츠 로드 ──────────────────────────────────────────────────────── */
const Content = (() => {
  let db = { memories: [], corrupted: [], types: {} };
  async function load() {
    try {
      const res = await fetch('content/memories.json', { cache: 'no-store' });
      const j = await res.json();
      db.memories = (j.memories || []).filter(m => m && m.id);
      db.corrupted = j.corrupted || [];
      db.types = j.types || {};
    } catch (e) {
      console.warn('콘텐츠 로드 실패, 기본값 사용', e);
    }
    return db;
  }
  // 날짜 기반 "오늘의 파일" 결정 (매일 바뀌되 결정적)
  function todays() {
    if (!db.memories.length) return null;
    const day = Math.floor(Date.now() / 86400000);
    return db.memories[day % db.memories.length];
  }
  function assetUrl(path) {
    if (!path || /^(https?:|data:|blob:)/i.test(path)) return path || '';
    const local = location.hostname === '127.0.0.1' || location.hostname === 'localhost';
    return local ? `https://seoul-os-98.vercel.app/${String(path).replace(/^\//, '')}` : path;
  }
  return { load, get db() { return db; }, todays, assetUrl };
})();

/* =========================================================================
   앱 (Apps)
   ========================================================================= */
const Apps = (() => {
  const oneTap = () => window.innerWidth <= 640 || window.matchMedia('(pointer: coarse)').matches;

  /* ── 02. 오늘의 기억 파일 (작은 신호 알림) ── */
  function todaysFile() {
    const mem = Content.todays();
    if (!mem) { Dialog.info('오류', '오늘의 파일을 불러올 수 없습니다.'); return; }

    const recovered = State.isRecovered(mem.id);
    const body = document.createElement('div');
    body.className = 'window-body';
    body.innerHTML = `
      <div class="signal-body">
        <span class="signal-led" aria-hidden="true"></span>
        <div>
          <p class="signal-kicker">SEOUL.SYS / INCOMING</p>
          <p><b>새 기억 신호를 감지했습니다.</b></p>
          <p class="signal-file">${Safe.html(mem.title)}.${Safe.html(mem.ext)}</p>
          <p class="signal-note">${Safe.html(mem.place || '서울')} · ${Safe.html(mem.date)}</p>
          ${recovered ? '<p class="signal-saved">이미 복구된 기록입니다.</p>' : ''}
        </div>
      </div>
      <div class="signal-actions">
        <span>신호 분석 완료</span>
        <button class="default" data-act="open">보관소 열기</button>
      </div>`;
    WM.open({
      id: 'today', title: '복구국 알림', icon: ICON.mail, width: 330,
      className: 'signalwin', body, noMin: true, noMax: true,
      x: Math.max(8, window.innerWidth - 350), y: Math.max(8, window.innerHeight - 244)
    });
    body.querySelector('[data-act=open]').addEventListener('click', () => { WM.close('today'); viewer(mem); });
  }

  /* ── 03. 시립기억보관소 (사진 · 소리 · 문장 · 복구) ── */
  let viewerAudioId = null;
  function viewer(mem) {
    const id = 'view_' + mem.id;
    const already = State.isRecovered(mem.id);
    const recordId = `SEOUL-${String(mem.date || '').replace(/-/g, '')}-${String(mem.id).replace(/[^a-z0-9]/gi, '').slice(-5).toUpperCase()}`;
    const sourceState = mem.author === 'user' ? '사용자 기록' : '샘플 자료 · 출처 보강 필요';
    const body = document.createElement('div');
    body.className = 'window-body';
    body.innerHTML = `
      <div class="archive-shell">
        <div class="menu-bar archive-menu"><span><u>파</u>일</span><span><u>편</u>집</span><span><u>보</u>기</span><span><u>도</u>구</span><span><u>도</u>움말</span></div>
        <div class="archive-meta" aria-label="기록 정보">
          <div><span>RECORD ID</span><b>${Safe.html(recordId)}</b></div>
          <div><span>수집 일자</span><b>${Safe.html(mem.date)}</b></div>
          <div><span>위치</span><b>${Safe.html(mem.place || '서울')}</b></div>
          <div><span>상태</span><b class="archive-source">${Safe.html(sourceState)}</b></div>
        </div>
        <div class="archive-work">
          <aside class="archive-tree bevel-in" aria-label="기억 보관함">
            <div class="archive-tree-title">${ICON.folderOpen}<span>기억 보관함</span></div>
            <button class="archive-node selected" data-nav="today">${ICON.mail}<span>오늘 도착함</span><b>1</b></button>
            <button class="archive-node" data-nav="recovered">${ICON.folder}<span>복구된 기억</span><b>${State.recovered.length}</b></button>
            <button class="archive-node" data-nav="corrupt">${ICON.broken}<span>손상 파일</span><b>${Content.db.corrupted.length}</b></button>
            <div class="archive-tree-rule"></div>
            <div class="archive-tree-foot">SEOUL MUNICIPAL<br>MEMORY ARCHIVE</div>
          </aside>
          <div class="archive-photo viewer-photo">
            <img src="${Safe.html(Content.assetUrl(mem.image))}" alt="${Safe.html(mem.title)}" draggable="false">
            <div class="scan"></div><div class="noise"></div>
            <div class="archive-photo-label">${Safe.html(mem.title)}.${Safe.html(mem.ext)}</div>
          </div>
        </div>
        <div class="archive-console">
          <section class="archive-story">
            <div class="archive-audio">
              <span class="archive-section-label">FIELD AUDIO</span>
              <button class="tp-btn" data-act="play" title="재생/일시정지" aria-label="재생/일시정지">
                <svg viewBox="0 0 12 12"><path d="M2 1l8 5-8 5z" fill="#000"/></svg>
              </button>
              <button class="tp-btn" data-act="stop" title="정지" aria-label="정지">
                <svg viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" fill="#000"/></svg>
              </button>
              <div class="seek bevel-in"><div class="track"></div><div class="fill"></div></div>
              <span class="tp-time pixel">00:00 / 00:00</span>
            </div>
            <div class="archive-caption">
              <span class="archive-section-label">MEMORY NOTE</span>
              <div class="vt-body" aria-live="polite"></div><span class="cursor blink">_</span>
            </div>
            <div class="archive-tags"><span>${Safe.html(mem.type || 'archive')}</span><span>${mem.sound ? 'PHOTO + AUDIO' : 'PHOTO'}</span><span>${Safe.html(mem.ext || 'FILE').toUpperCase()}</span></div>
          </section>
          <section class="archive-recovery">
            <div class="archive-recovery-kicker">MEMORY RECOVERY</div>
            <button class="archive-recover" data-act="recover" ${already ? 'disabled' : ''}>
              ${already ? '복구 완료' : '복구하기'}
            </button>
            <div class="archive-progress-head"><span>복구 진행</span><b data-progress-pct>${already ? '100' : '0'}%</b></div>
            <div class="archive-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${already ? '100' : '0'}"><i style="width:${already ? '100' : '0'}%"></i></div>
            <div class="archive-progress-state" data-progress-state>${already ? 'RECOVERY COMPLETE' : 'IDLE / READY'}</div>
          </section>
        </div>
        <div class="status-bar archive-status"><span class="status-cell">${Safe.html(mem.title)}.${Safe.html(mem.ext)}</span><span class="status-cell fixed">서울시립기억보관소</span></div>
      </div>`;

    const win = WM.open({
      id, title: `서울OS 98 - 시립기억보관소 · ${mem.title}.${mem.ext}`, icon: ICON.photo,
      width: 1100, className: 'viewer archive-viewer', body, y: 70,
      onClose: () => { stopViewerAudio(); }
    });

    body.querySelector('[data-nav=recovered]').addEventListener('click', () => Apps.myHard('recovered'));
    body.querySelector('[data-nav=corrupt]').addEventListener('click', () => Apps.myHard('corrupt'));

    const photo = body.querySelector('.archive-photo img');
    photo.addEventListener('error', () => {
      photo.remove();
      body.querySelector('.archive-photo').classList.add('missing');
    });

    // 문장은 짧은 복구 타이핑으로 드러난다.
    const vt = body.querySelector('.vt-body');
    const full = String(mem.text || '기록 문장이 남아 있지 않습니다.');
    let ci = 0;
    const typer = setInterval(() => {
      if (ci >= full.length) { clearInterval(typer); return; }
      if (!win.isConnected) { clearInterval(typer); return; }
      ci += 1;
      vt.textContent = full.slice(0, ci);
    }, 20);

    // 오디오
    const amb = document.getElementById('ambient');
    const playBtn = body.querySelector('[data-act=play]');
    const stopBtn = body.querySelector('[data-act=stop]');
    const fill = body.querySelector('.fill');
    const timeEl = body.querySelector('.tp-time');
    const seek = body.querySelector('.seek');

    function fmt(t) { t = Math.max(0, t | 0); return String((t / 60) | 0).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); }
    function setPlayIcon(playing) {
      playBtn.innerHTML = playing
        ? `<svg viewBox="0 0 12 12"><rect x="2" y="1" width="3" height="10" fill="#000"/><rect x="7" y="1" width="3" height="10" fill="#000"/></svg>`
        : `<svg viewBox="0 0 12 12"><path d="M2 1l8 5-8 5z" fill="#000"/></svg>`;
    }
    function stopViewerAudio() {
      if (viewerAudioId === id) { amb.pause(); amb.currentTime = 0; viewerAudioId = null; }
    }

    if (mem.sound) {
      playBtn.addEventListener('click', () => {
        Sfx.unlock();
        if (viewerAudioId !== id || amb.paused) {
          if (viewerAudioId !== id) { amb.src = Content.assetUrl(mem.sound); amb.currentTime = 0; }
          viewerAudioId = id;
          amb.play().then(() => setPlayIcon(true)).catch(() => {});
        } else { amb.pause(); setPlayIcon(false); }
        Sfx.click();
      });
      stopBtn.addEventListener('click', () => { stopViewerAudio(); setPlayIcon(false); Sfx.click(); });
      amb.ontimeupdate = () => {
        if (viewerAudioId !== id) return;
        const p = amb.duration ? amb.currentTime / amb.duration : 0;
        fill.style.width = (p * 100) + '%';
        timeEl.textContent = fmt(amb.currentTime) + ' / ' + fmt(amb.duration || 0);
      };
      amb.onended = () => { if (viewerAudioId === id) { setPlayIcon(false); fill.style.width = '0'; } };
      seek.addEventListener('click', (e) => {
        if (viewerAudioId !== id || !amb.duration) return;
        const r = seek.getBoundingClientRect();
        amb.currentTime = ((e.clientX - r.left) / r.width) * amb.duration;
      });
    } else {
      playBtn.disabled = true; stopBtn.disabled = true;
      timeEl.textContent = '소리 없음';
    }

    // 다른 창 포커스 시 이 오디오 유지, 닫힐 때만 정지 (onClose에서)
    // 복구 버튼
    const recBtn = body.querySelector('[data-act=recover]');
    if (!already) recBtn.addEventListener('click', () => {
      const progress = body.querySelector('.archive-progress');
      const progressFill = progress.querySelector('i');
      const pctEl = body.querySelector('[data-progress-pct]');
      const stateEl = body.querySelector('[data-progress-state]');
      recBtn.disabled = true;
      recBtn.textContent = '복구 중...';
      stateEl.textContent = 'SCANNING MEMORY BLOCKS';
      const started = performance.now();
      const duration = 1900;
      const animate = now => {
        if (!win.isConnected) return;
        const raw = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - raw, 3);
        const pct = Math.round(eased * 100);
        progressFill.style.width = pct + '%';
        progress.setAttribute('aria-valuenow', String(pct));
        pctEl.textContent = pct + '%';
        if (raw < 1) {
          if (pct % 9 === 0) Sfx.hdd();
          requestAnimationFrame(animate);
          return;
        }
        const ok = State.addRecovered(mem);
        recBtn.textContent = '복구 완료';
        stateEl.textContent = 'RECOVERY COMPLETE';
        if (ok) {
          Sfx.recover();
          Desktop.renderSaved();
          Toast.show('복구 완료', `${mem.title}.${mem.ext} 파일을 내 하드에 저장했습니다.`);
          Apps.recoveryUpdate && Apps.recoveryUpdate();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  /* ── 04. 내 하드 (탐색기) ── */
  function myHard(sub) {
    sub = sub || 'recovered';
    const body = document.createElement('div');
    body.className = 'window-body';
    body.style.padding = '0';
    body.innerHTML = `
      <div class="menu-bar"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>H</u>elp</span></div>
      <div class="exp-addr bevel-thin-in" style="margin:2px">
        <span>주소</span>
        <span class="field bevel-in">${ICON.hdd} <span id="exp-path">C:\\내하드\\${sub === 'recovered' ? '복구된기억' : sub}</span></span>
      </div>
      <div class="exp-main">
        <div class="exp-tree bevel-in">
          <div class="node" data-nav="root">${ICON.hdd} 내 하드 (C:)</div>
          <div class="node indent ${sub==='recovered'?'sel':''}" data-nav="recovered">${ICON.folder} 복구된 기억</div>
          <div class="node indent ${sub==='corrupt'?'sel':''}" data-nav="corrupt">${ICON.folder} 손상 · LOST+FOUND</div>
          <div class="node indent" data-nav="type">${ICON.star} 서울 성향</div>
        </div>
        <div class="exp-list bevel-in" id="exp-list"></div>
      </div>
      <div class="status-bar">
        <span class="status-cell" id="exp-count">0 개체</span>
        <span class="status-cell fixed" style="min-width:120px" id="exp-size">복구율 계산중…</span>
      </div>`;

    const win = WM.open({ id: 'hard', title: '내 하드 (C:) — SeoulOS 탐색기', icon: ICON.hdd, width: 540, className: 'explorer', body });

    const list = body.querySelector('#exp-list');
    const countEl = body.querySelector('#exp-count');
    const sizeEl = body.querySelector('#exp-size');

    function draw(kind) {
      body.querySelectorAll('.exp-tree .node').forEach(n => n.classList.toggle('sel', n.dataset.nav === kind));
      body.querySelector('#exp-path').textContent =
        'C:\\내하드\\' + (kind === 'recovered' ? '복구된기억' : kind === 'corrupt' ? '손상파일' : '서울성향');
      list.innerHTML = '';
      if (kind === 'recovered') {
        const items = State.recovered;
        if (!items.length) {
          list.innerHTML = `<div class="exp-empty">아직 복구한 기억이 없습니다.<br>바탕화면의 [오늘의 파일]을 열어 첫 기억을 복구하세요.</div>`;
        } else {
          items.slice().reverse().forEach(it => {
            const f = document.createElement('div'); f.className = 'exp-file';
            f.innerHTML = `${ICON.photo}<span class="fn">${Safe.html(it.title)}.${Safe.html(it.ext)}</span>`;
            const openMemory = () => {
              const mem = Content.db.memories.find(m => m.id === it.id);
              if (mem) Apps.viewer(mem); else Dialog.info('알림', '원본 데이터를 찾을 수 없습니다.');
            };
            f.addEventListener('dblclick', openMemory);
            f.addEventListener('click', () => {
              if (oneTap()) { openMemory(); return; }
              list.querySelectorAll('.exp-file').forEach(x=>x.classList.remove('sel')); f.classList.add('sel'); Sfx.click();
            });
            list.appendChild(f);
          });
        }
        countEl.textContent = items.length + ' 개체';
      } else if (kind === 'corrupt') {
        drawCorrupt(list, countEl);
      } else {
        list.innerHTML = `<div class="exp-empty">서울 성향 리포트를 생성합니다…</div>`;
        countEl.textContent = '1 개체';
        setTimeout(() => { WM.close('hard'); yourType(); }, 300);
      }
      const total = Content.db.memories.length || 1;
      const pct = Math.round(State.recovered.length / total * 100);
      sizeEl.textContent = `복구율 ${pct}%`;
    }

    body.querySelectorAll('.exp-tree .node').forEach(n => {
      n.addEventListener('click', () => { const k = n.dataset.nav; if (k === 'root') return; draw(k); Sfx.click(); });
    });
    draw(sub);
  }

  function drawCorrupt(list, countEl) {
    const items = Content.db.corrupted || [];
    list.innerHTML = '';
    items.forEach(it => {
      const f = document.createElement('div'); f.className = 'exp-file';
      f.innerHTML = `${ICON.broken}<span class="fn neon">${Safe.html(it.title)}.${Safe.html(it.ext)}</span>`;
      f.addEventListener('dblclick', () => corruptRecover(it));
      f.addEventListener('click', () => {
        if (oneTap()) { corruptRecover(it); return; }
        list.querySelectorAll('.exp-file').forEach(x=>x.classList.remove('sel')); f.classList.add('sel'); Sfx.click();
      });
      list.appendChild(f);
    });
    if (countEl) countEl.textContent = items.length + ' 개체 (손상)';
  }

  function corruptRecover(it) {
    Sfx.error();
    Dialog.custom({
      title: 'LOST + FOUND', icon: ICON.warn, width: 340,
      html: `<p><b>${Safe.html(it.title)}.${Safe.html(it.ext)}</b></p>
             <p class="pixel" style="background:#000;color:#0f6;padding:8px;margin-top:8px;white-space:pre-wrap;font-size:12px">${Safe.html(it.recoverText || '복구할 수 없는 조각입니다.')}</p>`,
      buttons: [{ label: '복구 시도', default: true, act: () => {
        State.addCorrupt(it.id);
        Toast.show('LOST+FOUND', '조각을 표시해두었습니다. 언젠가 복구될지도 모릅니다.');
      }}, { label: '닫기' }]
    });
  }

  /* ── 05. 복구율 시스템 (Scandisk 스타일) ── */
  function recovery() {
    const total = Content.db.memories.length || 1;
    const done = State.recovered.length;
    const pct = Math.round(done / total * 100);
    const body = document.createElement('div');
    body.className = 'window-body';
    body.innerHTML = `
      <div class="rec-screen">
        <div class="rec-title">SEOUL MEMORY RECOVERY — 스캔 결과</div>
        <div class="rec-pct" id="rec-pct">0.0%</div>
        <div class="rec-gauge"><i id="rec-fill"></i></div>
        <div class="rec-stats">
          <div class="row"><span class="k">복구된 기억</span><span class="v" id="rec-done">${done} 개</span></div>
          <div class="row"><span class="k">남은 기억</span><span class="v" id="rec-left">${total-done} 개</span></div>
          <div class="row"><span class="k">발견한 손상 조각</span><span class="v bad">${State.corruptFound.length} 개</span></div>
          <div class="row"><span class="k">복구자</span><span class="v">${Safe.html(State.name || '이름 없음')}</span></div>
        </div>
      </div>
      <div class="mail-actions" style="padding:10px">
        <button data-act="close" class="default">확인</button>
      </div>`;
    const win = WM.open({ id: 'recovery', title: '복구율 — ScanSeoul', icon: ICON.gauge, width: 380, className: 'recwin', body });
    body.querySelector('[data-act=close]').addEventListener('click', () => WM.close('recovery'));
    // 애니메이션
    let cur = 0;
    const pctEl = body.querySelector('#rec-pct'), fillEl = body.querySelector('#rec-fill');
    const anim = setInterval(() => {
      if (!win.isConnected) { clearInterval(anim); return; }
      cur += Math.max(0.6, (pct - cur) * 0.12);
      if (cur >= pct) { cur = pct; clearInterval(anim); }
      pctEl.textContent = cur.toFixed(1) + '%';
      fillEl.style.width = cur + '%';
      if (Math.random() < 0.3) Sfx.hdd();
    }, 40);
  }
  function recoveryUpdate() {
    if (!WM.exists('recovery')) return;
    WM.close('recovery'); recovery();
  }

  /* ── 08. 서울 성향 (YOUR TYPE) ── */
  function yourType() {
    const rec = State.recovered;
    let typeKey = 'night';
    if (rec.length) {
      const tally = {};
      rec.forEach(r => { const m = Content.db.memories.find(x => x.id === r.id); if (m && m.type) tally[m.type] = (tally[m.type]||0)+1; });
      typeKey = Object.keys(tally).sort((a,b)=>tally[b]-tally[a])[0] || 'night';
    }
    const t = Content.db.types[typeKey] || { name: '기억 복구자', desc: '당신은 이제 막 복구를 시작했습니다.' };
    const body = document.createElement('div');
    body.className = 'window-body';
    body.style.padding = '0';
    body.innerHTML = `
      <div class="type-screen">
        <canvas class="type-stars"></canvas>
        <div class="moon"></div>
        <div class="type-label">YOUR SEOUL TYPE</div>
        <div class="type-name">「 ${Safe.html(t.name)} 」</div>
        <div class="type-desc">${Safe.html(t.desc)}</div>
        <div class="type-foot">복구한 기억 ${rec.length}개 기준 · SeoulOS 98</div>
      </div>
      <div class="mail-actions" style="padding:10px">
        <button data-act="close" class="default">닫기</button>
      </div>`;
    const win = WM.open({ id: 'yourtype', title: '서울 성향 — YOUR TYPE', icon: ICON.star, width: 360, className: 'typewin', body });
    body.querySelector('[data-act=close]').addEventListener('click', () => WM.close('yourtype'));
    // 별 캔버스
    const cv = body.querySelector('.type-stars');
    requestAnimationFrame(() => {
      const r = cv.getBoundingClientRect(); cv.width = r.width; cv.height = r.height;
      const g = cv.getContext('2d');
      for (let i=0;i<70;i++){ g.globalAlpha=Math.random()*0.8+0.2; g.fillStyle='#fff';
        g.fillRect(Math.random()*cv.width, Math.random()*cv.height*0.7, 1, 1); }
    });
  }

  /* ── 3차 준비중 스텁 ── */
  function stub(id, title, icon, layerLabel, desc) {
    const body = document.createElement('div');
    body.className = 'window-body';
    body.innerHTML = `
      <div class="stub-body">
        <div class="stub-ic">${bigIcon(icon)}</div>
        <p><b>${title}</b></p>
        <p class="dim">${desc}</p>
        <span class="layer">${layerLabel}</span>
      </div>
      <div class="mail-actions" style="padding:10px"><button data-act="close" class="default">확인</button></div>`;
    const win = WM.open({ id, title, icon, width: 320, body });
    body.querySelector('[data-act=close]').addEventListener('click', () => WM.close(id));
  }
  function fieldFile() { stub('field', '현장 파일 (FIELD FILE)', ICON.map, '3층 · 도시 탐험', '복구한 기억이 실제 서울의 장소와 연결됩니다.\n지도 위에서 그 골목을 다시 찾을 수 있게 됩니다.'); }
  function hddReport() { stub('hddreport', 'HDD REPORT', ICON.report, '2층 · 종합 리포트', '당신의 복구 기록을 한 장의 리포트로 정리합니다.\n곧 만나보실 수 있습니다.'); }
  function memoryMap() { stub('memmap', 'MEMORY MAP', ICON.map, '3층 · 기억 지도', '복구된 기억들이 서울 전역의 지도 위에 별처럼 이어집니다.\n곧 열립니다.'); }

  /* ── 사용 설명서 (복구자 매뉴얼 · 마법사 스타일) ── */
  function help(auto = false, version = 0) {
    // 4개 챕터 데이터
    const pages = [
      {
        key: 'intro', tab: '환영합니다',
        title: '복구자 매뉴얼에 오신 것을 환영합니다',
        art: 'welcome',
        html: `
          <p class="hp-lead">당신은 <b>관광객</b>이 아니라 <span class="hp-hl">기억 복구자(Recoverer)</span>입니다.</p>
          <p class="hp-p">서울은 매일 조금씩 사라집니다. 헐리는 골목, 꺼지는 간판,
          다시는 들을 수 없는 밤시장의 소리 — 검색해도 나오지 않는 것들이죠.</p>
          <p class="hp-p">이 낡은 컴퓨터 <b>SeoulOS&nbsp;98</b>은 그 사라지는 조각들을
          <b>파일</b>로 붙잡아 둡니다. 당신이 할 일은 단 하나,
          매일 도착하는 기억을 열어보고 <span class="hp-hl">내 하드에 복구</span>하는 것.</p>
          <div class="hp-quote">“지도가 아니라, 하나의 기억이 되도록.”</div>
          <p class="hp-p hp-dim">아래 <b>[다음 ▶]</b> 버튼을 눌러 사용법을 계속 읽어보세요.
          단 3단계면 충분합니다.</p>`
      },
      {
        key: 'core', tab: '핵심 3단계',
        title: '기억을 복구하는 법 — 단 3단계',
        art: 'steps',
        html: `
          <ol class="hp-steps">
            <li>
              <span class="hp-no">1</span>
              <div class="hp-stxt">
                <b>오늘의 파일을 연다</b>
                <p>바탕화면 왼쪽 위 <span class="hp-chip">✉ 오늘의 파일</span> 아이콘을
                <u>더블클릭</u>합니다. 매일 <b>딱 하나</b>의 기억이 도착합니다.
                (사진 1장 + 그 장소의 소리 + 한 문장)</p>
              </div>
            </li>
            <li>
              <span class="hp-no">2</span>
              <div class="hp-stxt">
                <b>천천히 감상한다</b>
                <p>사진이 지직거리며 뜨고, 그 장소의 소리가 흐르고,
                문장이 한 글자씩 타이핑됩니다. 재생 컨트롤의
                <span class="hp-chip">▶</span> / <span class="hp-chip">■</span>
                로 소리를 조절하세요.</p>
              </div>
            </li>
            <li>
              <span class="hp-no">3</span>
              <div class="hp-stxt">
                <b>내 하드에 복구한다</b>
                <p>맘에 들면 아래 <span class="hp-chip hp-chip-cta">내 하드에 복구 ▼</span>
                버튼을 누르세요. 이 기억은 <b>영원히</b> 당신의 컴퓨터에 저장됩니다.</p>
                <p class="hp-warn">복구 전 기록은 보관소의 오늘 도착함 폴더에서 다시 확인할 수 있습니다.</p>
              </div>
            </li>
          </ol>`
      },
      {
        key: 'places', tab: '내 컴퓨터 둘러보기',
        title: '복구한 뒤엔 — 이 아이콘들을 써보세요',
        art: 'icons',
        html: `
          <ul class="hp-list">
            <li><span class="hp-ic">${ICON.hdd}</span>
              <div><b>내 하드 (C:)</b><p>복구한 기억이 폴더 안에 차곡차곡 쌓입니다.
              언제든 더블클릭해 다시 감상할 수 있어요.</p></div></li>
            <li><span class="hp-ic">${ICON.gauge}</span>
              <div><b>복구율</b><p>당신이 지금까지 서울을 몇 % 복구했는지
              스캔디스크 게이지로 보여줍니다.</p></div></li>
            <li><span class="hp-ic">${ICON.star}</span>
              <div><b>서울 성향 (YOUR TYPE)</b><p>복구한 기억의 성격을 분석해
              당신이 어떤 복구자인지 밤하늘 카드로 알려줍니다.</p></div></li>
            <li><span class="hp-ic">${ICON.trash}</span>
              <div><b>LOST + FOUND</b><p>완전히 복구되지 않은 <b>손상 조각</b>들이 숨어 있습니다.
              용기 있는 복구자만 열어보세요.</p></div></li>
          </ul>
          <p class="hp-p hp-dim">모든 메뉴는 좌측 하단 <b>[시작]</b> 버튼에서도 열 수 있습니다.</p>`
      },
      {
        key: 'tips', tab: '문제 해결 · 팁',
        title: '알아두면 좋은 것들',
        art: 'tips',
        html: `
          <div class="hp-faq">
            <div class="hp-q">🔊 소리가 안 들려요</div>
            <div class="hp-a">첫 화면의 <b>⏻ 전원 버튼</b>을 눌러 시작했는지 확인하세요.
            (브라우저는 클릭이 있어야 소리를 냅니다.) 그래도 안 되면 우측 하단 트레이의
            <b>스피커 아이콘</b>이 꺼져있지 않은지 보세요. 헤드폰을 권장합니다 🎧</div>

            <div class="hp-q">🖥 화면이 지직거려요</div>
            <div class="hp-a">그건 <b>CRT 브라운관 효과</b>예요(의도된 감성입니다!).
            눈이 피로하면 트레이의 <b>모니터 아이콘</b>으로 끌 수 있습니다.</div>

            <div class="hp-q">💾 내 기록은 저장되나요?</div>
            <div class="hp-a">네. 복구한 기억 · 이름 · 설정은 이 브라우저에 <b>자동 저장</b>됩니다.
            다시 방문하면 이어서 복구할 수 있어요.</div>

            <div class="hp-q">📅 매일 같은 파일인가요?</div>
            <div class="hp-a">아니요. <b>날짜가 바뀌면</b> 새로운 기억이 도착합니다.
            매일 들러 하나씩 복구해 보세요.</div>
          </div>`
      }
    ];

    let idx = 0;
    const body = document.createElement('div');
    body.className = 'window-body';
    body.style.padding = '0';
    body.innerHTML = `
      <div class="manual">
        <aside class="manual-side">
          <div class="ms-logo"><span class="seoulos-logo">Seoul<b>OS</b></span><span class="ms-98">98</span></div>
          <div class="ms-cap">복구자 매뉴얼<br><span>RECOVERER'S MANUAL</span></div>
          <nav class="ms-tabs"></nav>
          <div class="ms-foot">(C) 1998<br>Seoul Micro Systems</div>
        </aside>
        <section class="manual-main">
          <div class="mm-art" id="mm-art"></div>
          <h2 class="mm-title" id="mm-title"></h2>
          <div class="mm-content" id="mm-content"></div>
        </section>
      </div>
      <div class="manual-actions">
        ${auto ? '<span class="manual-once">처음 한 번만 자동으로 표시됩니다.</span>' : '<span></span>'}
        <div class="ma-nav">
          <button data-act="start">${auto ? '닫고 시작' : '닫기'}</button>
          <button data-act="prev" disabled>◀ 이전</button>
          <button class="default" data-act="next">다음 ▶</button>
        </div>
      </div>`;

    let introFinished = false;
    const finishIntro = () => {
      if (!auto || introFinished) return;
      introFinished = true;
      State.introSeen = true;
      State.helpSeen = true;
      if (version) State.manualVersion = version;
      setTimeout(() => Apps.todaysFile(), 200);
    };
    const win = WM.open({
      id: 'help', title: '사용 설명서 — 복구자 매뉴얼', icon: ICON.book,
      width: 560, className: 'manualwin', body, onClose: finishIntro
    });

    const tabsWrap = body.querySelector('.ms-tabs');
    const artEl = body.querySelector('#mm-art');
    const titleEl = body.querySelector('#mm-title');
    const contentEl = body.querySelector('#mm-content');
    const startBtn = body.querySelector('[data-act=start]');
    const prevBtn = body.querySelector('[data-act=prev]');
    const nextBtn = body.querySelector('[data-act=next]');

    // 챕터별 픽셀 일러스트(인라인 SVG)
    const ART = {
      welcome: `<svg viewBox="0 0 120 60" class="art-svg"><rect width="120" height="60" fill="#0a1b2a"/><rect x="0" y="44" width="120" height="16" fill="#08202b"/><g fill="#ffce54"><rect x="14" y="26" width="8" height="18"/><rect x="26" y="18" width="10" height="26"/><rect x="40" y="30" width="7" height="14"/><rect x="70" y="22" width="9" height="22"/><rect x="84" y="14" width="11" height="30"/><rect x="99" y="28" width="8" height="16"/></g><g fill="#ff4d6d"><rect x="27" y="21" width="8" height="2"/><rect x="85" y="18" width="9" height="2"/></g><circle cx="100" cy="12" r="6" fill="#fff6d8"/><g fill="#33d6ff"><rect x="10" y="8" width="1" height="1"/><rect x="55" y="6" width="1" height="1"/><rect x="66" y="12" width="1" height="1"/><rect x="40" y="10" width="1" height="1"/></g></svg>`,
      steps: `<svg viewBox="0 0 120 60" class="art-svg"><rect width="120" height="60" fill="#12233a"/><rect x="12" y="14" width="30" height="34" fill="#fff" stroke="#000"/><path d="M12 14h30v6H12z" fill="#000080"/><rect x="16" y="24" width="22" height="2" fill="#3a6"/><rect x="16" y="29" width="22" height="2" fill="#3a6"/><rect x="16" y="34" width="14" height="2" fill="#3a6"/><path d="M50 30h14m-6-5l6 5-6 5" stroke="#33d6ff" fill="none" stroke-width="2"/><rect x="74" y="16" width="34" height="30" fill="#c0c0c0" stroke="#000"/><rect x="78" y="20" width="26" height="16" fill="#1084d0"/><circle cx="84" cy="26" r="3" fill="#ffd23f"/><path d="M78 36l7-6 4 3 6-6 9 9z" fill="#0a6"/></svg>`,
      icons: `<svg viewBox="0 0 120 60" class="art-svg"><rect width="120" height="60" fill="#1a2b1a"/><g transform="translate(16,16)"><rect x="0" y="4" width="26" height="16" rx="1" fill="#c0c0c0" stroke="#000"/><rect x="2" y="6" width="22" height="8" fill="#808080"/><circle cx="20" cy="17" r="2" fill="#0f0"/></g><g transform="translate(52,14)"><circle cx="12" cy="12" r="11" fill="none" stroke="#fff"/><path d="M12 12l6-7" stroke="#f33" stroke-width="2"/></g><g transform="translate(86,12)"><path d="M12 0l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#ffd23f" stroke="#000"/></g></svg>`,
      tips: `<svg viewBox="0 0 120 60" class="art-svg"><rect width="120" height="60" fill="#2a1a2a"/><circle cx="60" cy="30" r="18" fill="#1084d0" stroke="#000"/><text x="60" y="40" font-size="26" fill="#fff" text-anchor="middle" font-family="Georgia,serif" font-style="italic">i</text><g fill="#33d6ff"><rect x="20" y="14" width="2" height="2"/><rect x="96" y="20" width="2" height="2"/><rect x="30" y="44" width="2" height="2"/><rect x="90" y="42" width="2" height="2"/></g></svg>`
    };

    pages.forEach((p, i) => {
      const t = document.createElement('button');
      t.className = 'ms-tab';
      t.innerHTML = `<span class="ms-tno">${String(i + 1).padStart(2, '0')}</span>${p.tab}`;
      t.addEventListener('click', () => { idx = i; render(); Sfx.click(); });
      tabsWrap.appendChild(t);
    });

    function render() {
      const p = pages[idx];
      artEl.innerHTML = ART[p.art] || '';
      titleEl.textContent = p.title;
      contentEl.innerHTML = p.html;
      contentEl.scrollTop = 0;
      tabsWrap.querySelectorAll('.ms-tab').forEach((t, i) => t.classList.toggle('active', i === idx));
      prevBtn.disabled = idx === 0;
      nextBtn.textContent = idx === pages.length - 1 ? '시작하기 ▶' : '다음 ▶';
    }

    startBtn.addEventListener('click', () => { WM.close('help'); Sfx.click(); });
    prevBtn.addEventListener('click', () => { if (idx > 0) { idx--; render(); Sfx.click(); } });
    nextBtn.addEventListener('click', () => {
      if (idx < pages.length - 1) { idx++; render(); Sfx.click(); }
      else {
        WM.close('help');
      }
    });

    render();
  }

  function about() {
    Dialog.custom({
      title: 'SeoulOS 98 정보', icon: ICON.info, width: 360,
      html: `<p><b class="seoulos-logo">SeoulOS 98</b> — Seoul Memory Recovery System</p>
             <p style="margin-top:8px;line-height:1.6">빠르게 사라지는 서울을,<br>느린 컴퓨터 안에서 발견하고 복구하고<br>나만의 하드에 저장한다.</p>
             <p class="dim" style="margin-top:10px;font-size:11px">당신은 관광객이 아니라 <b>기억 복구자</b>입니다.<br>(C) 1998 Seoul Micro Systems</p>`,
      buttons: [{ label: '확인', default: true }]
    });
  }

  return { todaysFile, viewer, myHard, recovery, recoveryUpdate, yourType,
           fieldFile, hddReport, memoryMap, about, corruptRecover, help };
})();

/* =========================================================================
   Dialog / Toast
   ========================================================================= */
const Dialog = (() => {
  let n = 0;
  function custom({ title, icon, html, buttons, width }) {
    const id = 'dlg_' + (++n);
    const body = document.createElement('div');
    body.className = 'window-body';
    body.innerHTML = `<div class="d-body"><span class="ic">${bigIcon(icon || ICON.info)}</span><div>${html}</div></div>
                      <div class="d-actions"></div>`;
    const act = body.querySelector('.d-actions');
    (buttons || [{ label: '확인', default: true }]).forEach(b => {
      const btn = document.createElement('button');
      btn.textContent = b.label; if (b.default) btn.className = 'default';
      btn.addEventListener('click', () => { WM.close(id); if (b.act) b.act(); });
      act.appendChild(btn);
    });
    WM.open({ id, title: title || 'SeoulOS', icon: icon || ICON.info, width: width || 320, className: 'dialog', body, noMin: true, noMax: true });
    Sfx.ding();
  }
  function info(title, msg) { custom({ title, icon: ICON.info, html: `<p>${Safe.html(msg)}</p>`, buttons: [{ label: '확인', default: true }] }); }
  return { custom, info };
})();

const Toast = (() => {
  let timer = null;
  function show(title, msg, duration = 4200) {
    const el = document.getElementById('toast');
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-body').textContent = msg;
    el.style.display = 'block';
    el.classList.add('active');
    Sfx.ding();
    clearTimeout(timer);
    timer = setTimeout(() => { el.style.display = 'none'; }, duration);
  }
  return { show };
})();
