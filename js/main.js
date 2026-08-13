/* =========================================================================
   SeoulOS 98 — 메인 (부팅 · 데스크톱 · 시작메뉴 · 트레이)
   ========================================================================= */

/* ── 데스크톱 ──────────────────────────────────────────────────────────── */
const Desktop = (() => {
  const deskIcons = [
    { id: 'help',  label: '사용 설명서', icon: ICON.book, run: () => Apps.help(false) },
    { id: 'today', label: '오늘의 파일', icon: ICON.mail, run: () => Apps.todaysFile() },
    { id: 'hard',  label: '내 하드 (C:)', icon: ICON.hdd, run: () => Apps.myHard('recovered') },
    { id: 'recovery', label: '복구율', icon: ICON.gauge, run: () => Apps.recovery() },
    { id: 'lost',  label: 'LOST+FOUND', icon: ICON.trash, run: () => Apps.myHard('corrupt') },
    { id: 'type',  label: '서울 성향', icon: ICON.star, run: () => Apps.yourType() }
  ];

  function bigDeskIcon(svg) {
    return svg.replace('width="16" height="16"', 'width="34" height="34"')
              .replace('width="32" height="32"', 'width="34" height="34"');
  }

  function renderIcons() {
    const wrap = document.getElementById('desk-icons');
    wrap.innerHTML = '';
    deskIcons.forEach(d => {
      const el = document.createElement('div');
      el.className = 'desk-icon';
      el.innerHTML = `<span>${bigDeskIcon(d.icon)}</span><span class="label">${d.label}</span>`;
      let clickTimer = null;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        wrap.querySelectorAll('.desk-icon').forEach(x => x.classList.remove('selected'));
        document.querySelectorAll('#desk-saved .desk-icon').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
        Sfx.click();
      });
      el.addEventListener('dblclick', () => { el.classList.remove('selected'); d.run(); });
      wrap.appendChild(el);
    });
  }

  function renderSaved() {
    const wrap = document.getElementById('desk-saved');
    wrap.innerHTML = '';
    State.recovered.slice().reverse().forEach(it => {
      const el = document.createElement('div');
      el.className = 'desk-icon';
      el.innerHTML = `<span>${bigDeskIcon(ICON.photo)}</span><span class="label">${it.title}.${it.ext}</span>`;
      el.addEventListener('click', (e) => { e.stopPropagation(); el.classList.add('selected'); Sfx.click(); });
      el.addEventListener('dblclick', () => {
        el.classList.remove('selected');
        const mem = Content.db.memories.find(m => m.id === it.id);
        if (mem) Apps.viewer(mem);
      });
      wrap.appendChild(el);
    });
  }

  function initStars() {
    const cv = document.getElementById('stars');
    const ctx = cv.getContext('2d');
    function resize() { cv.width = window.innerWidth; cv.height = window.innerHeight; draw(); }
    const stars = [];
    for (let i = 0; i < 90; i++) stars.push({ x: Math.random(), y: Math.random() * 0.62, s: Math.random(), tw: Math.random() * Math.PI * 2 });
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const t = Date.now() / 900;
      stars.forEach(st => {
        const a = 0.35 + Math.abs(Math.sin(t + st.tw)) * 0.6;
        ctx.globalAlpha = a * st.s;
        ctx.fillStyle = st.s > 0.85 ? '#fff6d8' : '#cfe0ff';
        ctx.fillRect(st.x * cv.width, st.y * cv.height, 1.4, 1.4);
      });
      ctx.globalAlpha = 1;
    }
    window.addEventListener('resize', resize);
    resize();
    setInterval(draw, 120);
  }

  function show() {
    document.getElementById('desktop').classList.remove('hidden');
    document.getElementById('taskbar').classList.remove('hidden');
    renderIcons();
    renderSaved();
    initStars();
    // 바탕화면 클릭 시 선택 해제 + 시작메뉴 닫기
    document.getElementById('desktop').addEventListener('click', () => {
      document.querySelectorAll('.desk-icon').forEach(x => x.classList.remove('selected'));
      StartMenu.close();
    });
  }

  return { show, renderSaved, renderIcons };
})();

/* ── 시작 메뉴 ─────────────────────────────────────────────────────────── */
const StartMenu = (() => {
  const items = [
    { label: '사용 설명서 (도움말)', icon: ICON.book, run: () => Apps.help(false) },
    { sep: true },
    { label: '오늘의 기억 파일', icon: ICON.mail, run: () => Apps.todaysFile() },
    { label: '내 하드 (C:)', icon: ICON.hdd, run: () => Apps.myHard('recovered') },
    { label: '복구율 보기', icon: ICON.gauge, run: () => Apps.recovery() },
    { label: 'LOST + FOUND', icon: ICON.trash, run: () => Apps.myHard('corrupt') },
    { label: '서울 성향 (YOUR TYPE)', icon: ICON.star, run: () => Apps.yourType() },
    { sep: true },
    { label: '현장 파일 (FIELD FILE)', icon: ICON.map, run: () => Apps.fieldFile() },
    { label: 'HDD REPORT', icon: ICON.report, run: () => Apps.hddReport() },
    { label: 'MEMORY MAP', icon: ICON.map, run: () => Apps.memoryMap() },
    { sep: true },
    { label: 'SeoulOS 98 정보', icon: ICON.info, run: () => Apps.about() },
    { label: '시스템 종료…', icon: ICON.disk, run: () => shutdown() }
  ];
  let open = false;

  function render() {
    const list = document.getElementById('start-list');
    list.innerHTML = '';
    items.forEach(it => {
      if (it.sep) { const s = document.createElement('div'); s.className = 'sm-sep'; list.appendChild(s); return; }
      const el = document.createElement('div');
      el.className = 'sm-item';
      const smIcon = it.icon.replace('width="16" height="16"','width="22" height="22"').replace('width="32" height="32"','width="22" height="22"');
      el.innerHTML = `<span style="width:22px;height:22px;display:inline-flex">${smIcon}</span><span>${it.label}</span>`;
      el.addEventListener('click', (e) => { e.stopPropagation(); close(); it.run(); });
      list.appendChild(el);
    });
  }
  function toggle() { open ? close() : show(); }
  function show() {
    document.getElementById('start-menu').classList.remove('hidden');
    document.getElementById('start-btn').classList.add('pressed');
    open = true; Sfx.click();
  }
  function close() {
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('start-btn').classList.remove('pressed');
    open = false;
  }
  return { render, toggle, close, get open() { return open; } };
})();

/* ── 시스템 종료 ───────────────────────────────────────────────────────── */
function shutdown() {
  Sfx.shutdown();
  const sd = document.createElement('div');
  sd.id = 'shutdown';
  sd.innerHTML = `SeoulOS 98 을(를) 종료하는 중…<br><br><span class="dim" style="color:#6b7bbf">이제 컴퓨터를 안전하게 끌 수 있습니다.</span><br><br><button class="default" id="reboot">다시 부팅</button>`;
  document.getElementById('screen').appendChild(sd);
  setTimeout(() => sd.classList.add('crt-off'), 900);
  setTimeout(() => {
    sd.classList.remove('crt-off');
    sd.style.animation = 'none';
    const b = document.getElementById('reboot');
    if (b) b.addEventListener('click', () => location.reload());
  }, 1500);
}

/* ── 트레이 (시계 · 소리 · CRT) ────────────────────────────────────────── */
const Tray = (() => {
  function tick() {
    const d = new Date();
    let h = d.getHours(); const ampm = h < 12 ? '오전' : '오후';
    let hh = h % 12; if (hh === 0) hh = 12;
    const m = String(d.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = `${ampm} ${hh}:${m}`;
  }
  function setSoundIcon(muted) {
    const img = document.getElementById('tray-sound');
    img.src = muted
      ? `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path fill='%23000' d='M2 6h3l4-3v10L5 10H2z'/><path stroke='%23c00' stroke-width='1.4' d='M11 5l4 6M15 5l-4 6'/></svg>`
      : `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path fill='%23000' d='M2 6h3l4-3v10L5 10H2z'/><path stroke='%23000' fill='none' d='M11 5c2 2 2 4 0 6'/></svg>`;
  }
  function applyCrt(on) {
    document.getElementById('crt-overlay').classList.toggle('on', on);
    document.getElementById('screen').classList.toggle('crt-flicker', on);
  }
  function init() {
    tick(); setInterval(tick, 10000);
    // 초기 상태 반영
    Sfx.setMuted(State.muted); setSoundIcon(State.muted);
    applyCrt(State.crt);
    document.getElementById('tray-sound').addEventListener('click', () => {
      const m = Sfx.toggleMute(); State.muted = m; setSoundIcon(m);
      if (!m) Sfx.ding();
    });
    document.getElementById('tray-crt').addEventListener('click', () => {
      State.crt = !State.crt; applyCrt(State.crt); Sfx.click();
    });
  }
  return { init, setSoundIcon, applyCrt };
})();

/* ── 부팅 시퀀스 ───────────────────────────────────────────────────────── */
const Boot = (() => {
  const fast = () => !State.firstBoot;
  let done = false;

  const logsFull = [
    { t: 'SEOUL MICRO SYSTEMS BIOS v9.8', c: 'dim' },
    { t: 'MEMORY CHECK ... 640K OK', c: '' },
    { t: 'DETECTING SEOUL.HDD ............. OK', c: '' },
    { t: 'LOADING SEOUL.SYS', c: '' },
    { t: 'MOUNTING /기억 ................. OK', c: '' },
    { t: 'WARNING: 다수의 파일이 손상되었습니다.', c: 'warn' },
    { t: 'WARNING: 일부 기억은 24시간 뒤 사라집니다.', c: 'warn' },
    { t: '복구 시스템을 초기화합니다 ...', c: '' },
    { t: 'SEOUL MEMORY RECOVERY SYSTEM 준비 완료.', c: '' }
  ];

  const stages = ['MEMORY CHECK…', 'DETECTING HDD…', 'LOADING SEOUL.SYS…', 'MOUNTING /기억…', 'READY.'];

  function run() {
    const boot = document.getElementById('boot');
    const fill = document.getElementById('boot-fill');
    const pctEl = document.getElementById('boot-pct');
    const stageEl = document.getElementById('boot-stage');
    const logEl = document.getElementById('boot-log');
    boot.classList.add('power-on');

    const skip = document.getElementById('boot-skip');
    const keyskip = () => finishToName();
    skip.addEventListener('click', keyskip);
    document.addEventListener('keydown', keyskip, { once: true });
    boot.addEventListener('click', () => {}, { once: true });

    const totalMs = fast() ? 1200 : 4200;
    const logs = fast() ? logsFull.slice(3) : logsFull;
    let pct = 0, li = 0;
    const startT = Date.now();

    const iv = setInterval(() => {
      if (done) { clearInterval(iv); return; }
      const elapsed = Date.now() - startT;
      pct = Math.min(100, Math.round(elapsed / totalMs * 100));
      fill.style.width = pct + '%';
      pctEl.textContent = pct + '%';
      stageEl.textContent = stages[Math.min(stages.length - 1, Math.floor(pct / 25))];
      // 로그 출력
      const wantLogs = Math.floor(pct / 100 * logs.length);
      while (li < wantLogs && li < logs.length) {
        const l = logs[li++];
        const div = document.createElement('div');
        div.className = l.c; div.textContent = '> ' + l.t;
        logEl.appendChild(div);
        logEl.scrollTop = logEl.scrollHeight;
        Sfx.hdd();
      }
      if (pct >= 100) { clearInterval(iv); setTimeout(finishToName, 250); }
    }, 60);
  }

  function finishToName() {
    if (done) return;
    // 이미 이름 입력 단계면 무시
    if (!document.getElementById('boot-name-wrap').classList.contains('hidden')) return;
    document.getElementById('boot-fill').style.width = '100%';
    document.getElementById('boot-pct').textContent = '100%';

    if (fast() && State.name) { enter(); return; }  // 재방문이고 이름 있으면 바로 진입

    const wrap = document.getElementById('boot-name-wrap');
    wrap.classList.remove('hidden');
    document.getElementById('boot-skip').classList.add('hidden');
    const input = document.getElementById('boot-name');
    if (State.name) input.value = State.name;
    input.focus();
    const go = () => { State.name = (input.value.trim() || '이름 없는 복구자'); enter(); };
    document.getElementById('boot-enter').addEventListener('click', go);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  }

  function enter() {
    if (done) return; done = true;
    State.firstBoot = false;
    Sfx.startup();
    const boot = document.getElementById('boot');
    boot.style.transition = 'opacity .5s';
    boot.style.opacity = '0';
    setTimeout(() => {
      boot.classList.add('hidden');
      Desktop.show();
      StartMenu.render();
      Tray.init();
      // 첫 방문(또는 아직 설명서를 안 본 사용자)에게는 사용 설명서를 자동으로,
      // 그 외에는 가벼운 환영 토스트만.
      setTimeout(() => {
        if (!State.helpSeen) {
          Apps.help(true);
        } else {
          Toast.show('다시 오셨군요, ' + (State.name || '복구자') + '님',
            '바탕화면의 [오늘의 파일]을 더블클릭해 오늘의 기억을 복구하세요.');
        }
      }, 850);
    }, 500);
  }

  return { run };
})();

/* ── 부트스트랩 ────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', async () => {
  // 시작 버튼 / 시작 메뉴
  document.getElementById('start-btn').addEventListener('click', (e) => { e.stopPropagation(); StartMenu.toggle(); });
  document.getElementById('start-menu').addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => StartMenu.close());

  // 안전장치: 어떤 제스처든 들어오면 오디오 언락 (전원 버튼을 못 눌러도 대비)
  const anyUnlock = () => { Sfx.unlock(); };
  document.addEventListener('pointerdown', anyUnlock);
  document.addEventListener('keydown', anyUnlock);

  await Content.load();

  // 전원 켜기 = 첫 사용자 제스처 → 오디오를 제스처 스택 안에서 언락한 뒤 부팅
  const power = document.getElementById('power');
  const powerBtn = document.getElementById('power-btn');
  let powered = false;
  const powerOn = () => {
    if (powered) return;          // 중복 실행 방지 (버블링/더블클릭 대비)
    powered = true;
    Sfx.unlock();                 // 반드시 이 클릭(제스처) 안에서 실행
    power.classList.add('off');   // 전원 화면 페이드아웃
    setTimeout(() => {
      power.style.display = 'none';
      document.getElementById('boot').classList.remove('hidden');
      Boot.run();
    }, 420);
  };
  // 전원 버튼 또는 전원 화면 어디를 눌러도 켜짐
  power.addEventListener('click', powerOn);
});
