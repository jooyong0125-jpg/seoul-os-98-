/* =========================================================================
   SeoulOS 98 — 메인 (부팅 · 데스크톱 · 시작메뉴 · 트레이)
   ========================================================================= */

/* ── 데스크톱 ──────────────────────────────────────────────────────────── */
const Desktop = (() => {
  const deskIcons = [
    { id: 'today', label: '오늘의 파일', icon: ICON.mail, run: () => Apps.todaysFile() },
    { id: 'hard',  label: '내 하드 (C:)', icon: ICON.hdd, run: () => Apps.myHard('recovered') },
    { id: 'lost',  label: 'LOST+FOUND', icon: ICON.trash, run: () => Apps.myHard('corrupt') },
    { id: 'type',  label: '서울 성향', icon: ICON.star, run: () => Apps.yourType() },
    { id: 'help',  label: '사용 설명서', icon: ICON.book, run: () => Apps.help(false) }
  ];

  const oneTap = () => window.innerWidth <= 640 || window.matchMedia('(pointer: coarse)').matches;

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
      const icon = document.createElement('span');
      icon.innerHTML = bigDeskIcon(d.icon);
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = d.label;
      el.append(icon, label);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (oneTap()) { d.run(); return; }
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
      const icon = document.createElement('span');
      icon.innerHTML = bigDeskIcon(ICON.photo);
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = `${it.title}.${it.ext}`;
      el.append(icon, label);
      const openFile = () => {
        el.classList.remove('selected');
        const mem = Content.db.memories.find(m => m.id === it.id);
        if (mem) Apps.viewer(mem);
      };
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (oneTap()) { openFile(); return; }
        el.classList.add('selected'); Sfx.click();
      });
      el.addEventListener('dblclick', () => {
        openFile();
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

  function initCityMotion() {
    const cv = document.getElementById('city-motion');
    const skyline = document.getElementById('skyline');
    if (!cv || !skyline || cv.dataset.ready === 'true') return;
    cv.dataset.ready = 'true';
    const ctx = cv.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const source = { width: 1920, height: 1080 };

    // Coordinates below are traced from skyline.jpg, not generated at random.
    const windowLights = [
      [52, 655], [58, 673], [99, 680], [128, 679], [177, 672], [190, 694],
      [371, 631], [384, 632], [399, 631], [420, 648], [445, 665], [462, 682],
      [725, 632], [739, 632], [753, 632], [767, 649], [781, 666],
      [852, 644], [869, 644], [886, 660], [903, 677],
      [949, 657], [961, 674], [973, 691], [1108, 680], [1125, 680], [1142, 696],
      [1217, 657], [1233, 674], [1250, 691], [1417, 647], [1432, 664], [1450, 681],
      [1716, 615], [1732, 632], [1747, 649], [1794, 676], [1810, 693], [1864, 662]
    ].map((point, index) => ({
      x: point[0], y: point[1],
      phase: (index * 1.73) % (Math.PI * 2),
      period: 2600 + (index % 7) * 430
    }));

    const signs = [
      { x: 570, y: 647, w: 109, h: 70, color: '#ff4fa7', phase: 0.2, period: 3400 },
      { x: 772, y: 732, w: 100, h: 29, color: '#ff54c9', phase: 1.7, period: 2900 },
      { x: 1178, y: 817, w: 101, h: 31, color: '#ff5ebd', phase: 3.1, period: 4100 }
    ];

    const roads = {
      eastbound: [[-30, 876], [1945, 876]],
      westbound: [[1945, 866], [-30, 866]],
      leftRamp: [[365, 974], [586, 837]],
      rightRamp: [[1622, 978], [1286, 820]]
    };
    const cars = Array.from({ length: 10 }, (_, index) => ({
      road: index < 4 ? roads.eastbound : index < 7 ? roads.westbound : index < 9 ? roads.rightRamp : roads.leftRamp,
      offset: (index * 0.137 + 0.08) % 1,
      speed: index < 7 ? 0.000018 + (index % 3) * 0.000003 : 0.000014,
      color: index % 3 === 0 ? '#ff445f' : '#ffe6a1'
    }));
    let width = 0;
    let height = 0;
    let frame = 0;
    let imageMap = null;

    function resize() {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      width = cv.clientWidth;
      height = cv.clientHeight;
      cv.width = Math.round(width * dpr);
      cv.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const box = skyline.getBoundingClientRect();
      const canvasBox = cv.getBoundingClientRect();
      const scale = Math.max(box.width / source.width, box.height / source.height);
      imageMap = {
        scale,
        x: box.left - canvasBox.left + (box.width - source.width * scale) / 2,
        y: box.top - canvasBox.top + box.height - source.height * scale
      };
    }

    function point(x, y) {
      return { x: imageMap.x + x * imageMap.scale, y: imageMap.y + y * imageMap.scale };
    }

    function pathPoint(path, progress) {
      const start = point(path[0][0], path[0][1]);
      const end = point(path[1][0], path[1][1]);
      return {
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress,
        angle: Math.atan2(end.y - start.y, end.x - start.x)
      };
    }

    function draw(time) {
      ctx.clearRect(0, 0, width, height);
      if (!imageMap) return;
      ctx.globalCompositeOperation = 'lighter';

      windowLights.forEach(light => {
        const pulse = (Math.sin((time / light.period) * Math.PI * 2 + light.phase) + 1) / 2;
        if (pulse < 0.48) return;
        const p = point(light.x, light.y);
        const size = Math.max(1, 2.2 * imageMap.scale);
        ctx.globalAlpha = 0.12 + pulse * 0.42;
        ctx.fillStyle = '#ffd778';
        ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.max(1, size * 1.5), size);
      });

      signs.forEach(sign => {
        const wave = (Math.sin((time / sign.period) * Math.PI * 2 + sign.phase) + 1) / 2;
        const flicker = Math.sin(time * 0.043 + sign.phase * 11) > 0.94 ? 0.18 : 1;
        const p = point(sign.x, sign.y);
        ctx.save();
        ctx.globalAlpha = (0.1 + wave * 0.2) * flicker;
        ctx.strokeStyle = sign.color;
        ctx.lineWidth = Math.max(1, imageMap.scale * 2);
        ctx.shadowColor = sign.color;
        ctx.shadowBlur = Math.max(3, imageMap.scale * 12);
        ctx.strokeRect(p.x, p.y, sign.w * imageMap.scale, sign.h * imageMap.scale);
        ctx.restore();
      });

      if (!reduced) {
        cars.forEach(car => {
          const progress = (time * car.speed + car.offset) % 1;
          const p = pathPoint(car.road, progress);
          const tail = Math.max(3, imageMap.scale * 13);
          const head = Math.max(1.3, imageMap.scale * 3.2);
          ctx.globalAlpha = 0.28;
          ctx.strokeStyle = car.color;
          ctx.lineWidth = Math.max(0.8, imageMap.scale);
          ctx.beginPath();
          ctx.moveTo(p.x - Math.cos(p.angle) * tail, p.y - Math.sin(p.angle) * tail);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.globalAlpha = 0.88;
          ctx.fillStyle = car.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, head, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (!reduced) frame = requestAnimationFrame(draw);
    }

    document.addEventListener('visibilitychange', () => {
      if (reduced) return;
      if (document.hidden) cancelAnimationFrame(frame);
      else frame = requestAnimationFrame(draw);
    });
    window.addEventListener('resize', resize);
    resize();
    draw(0);
  }

  function show() {
    document.getElementById('desktop').classList.remove('hidden');
    document.getElementById('taskbar').classList.remove('hidden');
    renderIcons();
    renderSaved();
    initStars();
    initCityMotion();
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
  if (document.getElementById('shutdown')) return;
  Sfx.shutdown();
  const sd = document.createElement('div');
  sd.id = 'shutdown';
  sd.setAttribute('role', 'status');
  sd.setAttribute('aria-live', 'polite');
  sd.innerHTML = `<div class="shutdown-panel">
    <div class="shutdown-copy shutdown-working">SeoulOS 98 을(를) 종료하는 중…</div>
    <div class="shutdown-copy shutdown-ready" hidden>
      이제 컴퓨터를 안전하게 끌 수 있습니다.<br><br>
      <button class="default" id="reboot">다시 부팅</button>
    </div>
  </div>`;
  document.getElementById('screen').appendChild(sd);
  setTimeout(() => sd.classList.add('crt-off'), 900);
  setTimeout(() => {
    if (!sd.isConnected) return;
    sd.classList.remove('crt-off');
    sd.classList.add('ready');
    sd.querySelector('.shutdown-working').hidden = true;
    sd.querySelector('.shutdown-ready').hidden = false;
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
  const ONBOARDING_VERSION = 3;
  const fast = () => !State.firstBoot;
  let done = false;
  let naming = false;

  const logsFull = [
    { t: 'SEOUL MICRO SYSTEMS BIOS v9.8', c: 'dim' },
    { t: 'MEMORY CHECK ... 640K OK', c: '' },
    { t: 'DETECTING SEOUL.HDD ............. OK', c: '' },
    { t: 'LOADING SEOUL.SYS', c: '' },
    { t: 'MOUNTING /기억 ................. OK', c: '' },
    { t: 'WARNING: 다수의 파일이 손상되었습니다.', c: 'warn' },
    { t: 'NOTICE: 오늘의 기억 신호를 발견했습니다.', c: 'warn' },
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

    const totalMs = fast() ? 900 : 3000;
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
    if (done || naming) return;
    document.getElementById('boot-fill').style.width = '100%';
    document.getElementById('boot-pct').textContent = '100%';
    if (State.profilePromptVersion >= ONBOARDING_VERSION) { enter(); return; }

    naming = true;
    const wrap = document.getElementById('boot-name-wrap');
    const input = document.getElementById('boot-name');
    const savedName = String(State.name || '').trim();
    input.value = savedName === '이름 없는 복구자' ? '' : savedName;
    document.getElementById('boot-skip').classList.add('hidden');
    wrap.classList.remove('hidden');
    input.focus();

    const submit = useInput => {
      if (done) return;
      State.name = useInput && input.value.trim() ? input.value.trim() : '이름 없는 복구자';
      State.profilePromptVersion = ONBOARDING_VERSION;
      enter();
    };
    document.getElementById('boot-enter').addEventListener('click', () => submit(true), { once: true });
    document.getElementById('boot-name-skip').addEventListener('click', () => submit(false), { once: true });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(true); });
  }

  function enter() {
    if (done) return; done = true;
    const shouldWelcome = State.welcomeVersion < ONBOARDING_VERSION;
    const shouldShowManual = State.manualVersion < ONBOARDING_VERSION;
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
      const openFirstContent = () => {
        if (shouldShowManual) Apps.help(true, ONBOARDING_VERSION);
        else {
          Apps.todaysFile();
          if (!shouldWelcome) Toast.show('보관소 연결 완료', '오늘의 기억 신호를 확인하세요.');
        }
      };

      if (shouldWelcome) {
        const savedName = String(State.name || '').trim().replace(/\s*님$/, '');
        const welcomeName = !savedName || savedName === '이름 없는 복구자' ? '복구자' : savedName;
        State.welcomeVersion = ONBOARDING_VERSION;
        Toast.show(`${welcomeName} 님, 환영합니다.`, '서울의 기억 보관소에 접속했습니다.', 2100);
        setTimeout(openFirstContent, 2300);
      } else {
        setTimeout(openFirstContent, 620);
      }
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
