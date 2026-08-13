/* =========================================================================
   SeoulOS 98 — 사운드 엔진
   시스템/UI 사운드는 Web Audio API로 직접 합성 (에셋 파일 불필요).
   앰비언스(오늘의 파일 소리)는 <audio> 태그로 재생.
   ========================================================================= */
const Sfx = (() => {
  let ctx = null;
  let muted = false;
  let unlocked = false;

  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { ctx = null; }
    }
    // 사용자 제스처 후 resume
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  // 첫 사용자 제스처 안에서 반드시 호출 — 컨텍스트를 즉시 만들고 무음 톤으로
  // 오디오 파이프라인을 "예열"해 이후 소리가 확실히 나도록 함.
  function warmUp() {
    const c = ac(); if (!c) return;
    try {
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, c.currentTime);   // 사실상 무음
      const osc = c.createOscillator();
      osc.frequency.value = 220;
      osc.connect(g); g.connect(c.destination);
      osc.start(); osc.stop(c.currentTime + 0.02);
      unlocked = true;
    } catch (e) {}
  }

  // 기본 톤 재생기
  function tone(freq, dur, type = 'square', vol = 0.14, when = 0) {
    const c = ac(); if (!c || muted) return;
    const t0 = c.currentTime + when;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  // 주파수 스윕(노이즈 대체용)
  function sweep(f1, f2, dur, type = 'sine', vol = 0.12, when = 0) {
    const c = ac(); if (!c || muted) return;
    const t0 = c.currentTime + when;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(f2, 1), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  // 짧은 노이즈 버스트 (HDD 긁는 소리, 클릭 질감)
  function noise(dur, vol = 0.06, when = 0, filterFreq = 2400) {
    const c = ac(); if (!c || muted) return;
    const t0 = c.currentTime + when;
    const n = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, n, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(); src.buffer = buf;
    const flt = c.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = filterFreq;
    const g = c.createGain(); g.gain.value = vol;
    src.connect(flt); flt.connect(g); g.connect(c.destination);
    src.start(t0);
  }

  const api = {
    get muted() { return muted; },
    get ready() { return unlocked && ctx && ctx.state === 'running'; },
    setMuted(m) {
      muted = m;
      const amb = document.getElementById('ambient');
      if (amb) amb.muted = m;
    },
    toggleMute() { this.setMuted(!muted); return muted; },
    // 첫 제스처에서 호출 — 컨텍스트 생성 + resume + 예열을 한 번에
    unlock() { warmUp(); return this.ready; },

    // ── UI 사운드 ──
    click()  { tone(180, 0.03, 'square', 0.06); },
    open()   { tone(520, 0.05, 'square', 0.08); tone(760, 0.06, 'square', 0.07, 0.05); },
    close()  { tone(420, 0.05, 'square', 0.07); tone(240, 0.06, 'square', 0.06, 0.05); },
    error()  { tone(200, 0.16, 'square', 0.12); tone(200, 0.16, 'square', 0.12, 0.2); },
    ding()   { tone(880, 0.09, 'sine', 0.10); tone(1320, 0.14, 'sine', 0.08, 0.08); },

    // 파일 복구 성공음 (짧은 아르페지오)
    recover() {
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => tone(f, 0.13, 'square', 0.09, i * 0.07));
    },

    // HDD 시크 (부팅 중 반복)
    hdd() { noise(0.05, 0.05, 0, 1800); tone(90, 0.04, 'square', 0.04, 0.02); },

    // 부팅 완료 시동음 (Win98 감성 3음 상승)
    startup() {
      const c = ac(); if (!c) return;
      sweep(392, 523, 0.30, 'triangle', 0.10, 0);
      sweep(523, 659, 0.30, 'triangle', 0.10, 0.18);
      sweep(659, 880, 0.55, 'triangle', 0.12, 0.36);
      tone(1319, 0.4, 'sine', 0.06, 0.55);
    },

    // 셧다운 하강음
    shutdown() {
      sweep(660, 180, 0.7, 'triangle', 0.12, 0);
    }
  };

  return api;
})();
