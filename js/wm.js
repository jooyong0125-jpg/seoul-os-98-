/* =========================================================================
   SeoulOS 98 — 윈도우 매니저
   창 생성 / 드래그 이동 / 포커스 / 최소화·최대화·닫기 / 태스크바 연동
   ========================================================================= */
const WM = (() => {
  const layer = () => document.getElementById('windows');
  const taskWrap = () => document.getElementById('task-windows');
  let z = 100;
  let seq = 0;
  const wins = {};              // id -> {el, taskEl, title, minimized, prevRect}
  let active = null;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const closeSvg = `<svg width="8" height="7" viewBox="0 0 8 7"><path d="M0 0h2l2 2 2-2h2L5 3l3 3H6L4 4 2 6H0l3-3z" fill="#000"/></svg>`;
  const minSvg   = `<svg width="8" height="7" viewBox="0 0 8 7"><rect x="0" y="5" width="7" height="2" fill="#000"/></svg>`;
  const maxSvg   = `<svg width="9" height="8" viewBox="0 0 9 8"><rect x="0" y="0" width="9" height="8" fill="none" stroke="#000" stroke-width="1"/><rect x="0" y="0" width="9" height="2" fill="#000"/></svg>`;

  function focus(id) {
    const w = wins[id]; if (!w) return;
    Object.values(wins).forEach(o => {
      o.el.classList.remove('active');
      if (o.taskEl) o.taskEl.classList.remove('active');
    });
    w.el.classList.add('active');
    w.el.style.zIndex = (++z);
    if (w.taskEl) w.taskEl.classList.add('active');
    active = id;
    // 창의 앰비언스가 있으면 알림 (뷰어 전환용) — apps에서 처리
    document.dispatchEvent(new CustomEvent('wm:focus', { detail: { id } }));
  }

  function makeDraggable(win, handle) {
    let sx, sy, ox, oy, dragging = false;
    const down = (e) => {
      if (win.classList.contains('maximized')) return;
      const p = e.touches ? e.touches[0] : e;
      dragging = true;
      sx = p.clientX; sy = p.clientY;
      const r = win.getBoundingClientRect();
      ox = r.left; oy = r.top;
      win.classList.add('dragging');
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
      document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('touchend', up);
    };
    const move = (e) => {
      if (!dragging) return;
      if (e.cancelable) e.preventDefault();
      const p = e.touches ? e.touches[0] : e;
      let nx = ox + (p.clientX - sx);
      let ny = oy + (p.clientY - sy);
      const maxX = layer().clientWidth - 60, maxY = layer().clientHeight - 24;
      nx = Math.max(-win.offsetWidth + 80, Math.min(nx, maxX));
      ny = Math.max(0, Math.min(ny, maxY));
      win.style.left = nx + 'px';
      win.style.top = ny + 'px';
      win.style.right = 'auto';
    };
    const up = () => {
      dragging = false;
      win.classList.remove('dragging');
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
    };
    handle.addEventListener('mousedown', down);
    handle.addEventListener('touchstart', down, { passive: true });
  }

  /* opts: {id, title, icon, body(HTMLstring or node), width, className,
            noMax, noMin, x, y, onClose, center} */
  function open(opts) {
    if (opts.id && wins[opts.id]) {  // 이미 있으면 포커스/복원
      restore(opts.id); focus(opts.id);
      return wins[opts.id].el;
    }
    const id = opts.id || ('win_' + (++seq));
    const win = document.createElement('div');
    win.className = 'window ' + (opts.className || '');
    win.dataset.id = id;
    if (opts.width) win.style.width = opts.width + 'px';
    const safeTitle = escapeHtml(opts.title || 'SeoulOS');

    const ctrls = [];
    if (!opts.noMin) ctrls.push(`<button class="title-btn" data-act="min" title="최소화">${minSvg}</button>`);
    if (!opts.noMax) ctrls.push(`<button class="title-btn" data-act="max" title="최대화">${maxSvg}</button>`);
    ctrls.push(`<button class="title-btn" data-act="close" title="닫기">${closeSvg}</button>`);

    win.innerHTML =
      `<div class="title-bar">
         ${opts.icon ? `<span class="title-icon">${opts.icon}</span>` : ''}
         <span class="title-text">${safeTitle}</span>
         <span class="title-controls">${ctrls.join('')}</span>
       </div>`;

    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'window-shell';
    bodyWrap.style.display = 'flex';
    bodyWrap.style.flexDirection = 'column';
    bodyWrap.style.flex = '1 1 auto';
    bodyWrap.style.minHeight = '0';
    if (typeof opts.body === 'string') bodyWrap.innerHTML = opts.body;
    else if (opts.body) bodyWrap.appendChild(opts.body);
    win.appendChild(bodyWrap);

    layer().appendChild(win);

    // 위치
    const vw = layer().clientWidth, vh = layer().clientHeight;
    const ww = win.offsetWidth, wh = win.offsetHeight;
    let x = opts.x, y = opts.y;
    if (opts.center || x == null) x = Math.max(8, (vw - ww) / 2 + (seq % 5) * 16 - 32);
    if (opts.center || y == null) y = Math.max(8, (vh - wh) / 2 - 30 + (seq % 5) * 14 - 28);
    x = Math.max(0, Math.min(x, Math.max(0, vw - ww)));
    y = Math.max(0, Math.min(y, Math.max(0, vh - wh)));
    win.style.left = Math.round(x) + 'px';
    win.style.top = Math.round(y) + 'px';

    // 태스크바 항목
    const taskEl = document.createElement('button');
    taskEl.className = 'task-item bevel-out';
    taskEl.innerHTML = `${opts.icon ? `<span style="width:15px;height:15px;display:inline-flex">${opts.icon}</span>` : ''}<span>${safeTitle}</span>`;
    taskEl.addEventListener('click', () => {
      if (active === id && !wins[id].minimized) minimize(id);
      else { restore(id); focus(id); }
      Sfx.click();
    });
    taskWrap().appendChild(taskEl);

    wins[id] = { el: win, taskEl, title: opts.title, minimized: false, prevRect: null, onClose: opts.onClose };

    // 이벤트
    const bar = win.querySelector('.title-bar');
    makeDraggable(win, bar);
    win.addEventListener('mousedown', () => focus(id), true);
    win.addEventListener('touchstart', () => focus(id), { capture: true, passive: true });

    win.querySelectorAll('.title-btn').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = b.dataset.act;
        if (act === 'close') close(id);
        else if (act === 'min') { minimize(id); Sfx.click(); }
        else if (act === 'max') { toggleMax(id); Sfx.click(); }
      });
    });
    bar.addEventListener('dblclick', () => { if (!opts.noMax) toggleMax(id); });

    Sfx.open();
    focus(id);
    return win;
  }

  function close(id) {
    const w = wins[id]; if (!w) return;
    if (w.onClose) { try { w.onClose(); } catch (e) {} }
    w.el.style.transition = 'opacity .1s, transform .1s';
    w.el.style.opacity = '0';
    w.el.style.transform = 'scale(.96)';
    setTimeout(() => { w.el.remove(); }, 100);
    if (w.taskEl) w.taskEl.remove();
    delete wins[id];
    Sfx.close();
    document.dispatchEvent(new CustomEvent('wm:close', { detail: { id } }));
  }

  function minimize(id) {
    const w = wins[id]; if (!w) return;
    w.minimized = true;
    w.el.classList.add('hidden');
    w.el.classList.remove('active');
    if (w.taskEl) w.taskEl.classList.remove('active');
    active = null;
  }
  function restore(id) {
    const w = wins[id]; if (!w) return;
    w.minimized = false;
    w.el.classList.remove('hidden');
  }
  function toggleMax(id) {
    const w = wins[id]; if (!w) return;
    const el = w.el;
    if (el.classList.contains('maximized')) {
      el.classList.remove('maximized');
      if (w.prevRect) {
        el.style.left = w.prevRect.left; el.style.top = w.prevRect.top;
        el.style.width = w.prevRect.width; el.style.height = w.prevRect.height;
      }
    } else {
      w.prevRect = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
      el.classList.add('maximized');
      el.style.left = '0px'; el.style.top = '0px';
      el.style.width = '100%'; el.style.height = '100%';
    }
  }

  window.addEventListener('resize', () => {
    Object.values(wins).forEach(w => {
      if (!w.el.classList.contains('maximized')) return;
      w.el.style.left = '0px';
      w.el.style.top = '0px';
      w.el.style.width = '100%';
      w.el.style.height = '100%';
    });
  });

  function exists(id) { return !!wins[id]; }
  function get(id) { return wins[id] && wins[id].el; }

  return { open, close, focus, minimize, restore, toggleMax, exists, get };
})();
