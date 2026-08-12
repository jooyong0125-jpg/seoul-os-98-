import Head from "next/head";
import { useState, useEffect, useRef, useCallback } from "react";
import styles from "@/styles/Home.module.css";

// Desktop icon definitions
const ICONS = [
  { id: "explorer", label: "서울 탐색기", accent: "accentExplorer" },
  { id: "files",    label: "오늘의 파일", accent: "accentFile" },
  { id: "drive",    label: "내 하드",     accent: "accentDrive" },
];

const WINDOW_DEFAULTS = {
  explorer: { top: 40, left: 120, width: 720, height: 460 },
  files:    { top: 90, left: 180, width: 450, height: 300 },
  drive:    { top: 120, left: 220, width: 450, height: 300 },
};

// ===== Explorer data =====
const FOLDERS = [
  {
    id: "disappearing",
    name: "사라지는 서울",
    files: [
      {
        id: "euljiro",
        name: "2026_을지로_23시",
        image: "/euljiro_street.png?v=20260811",
        audio: "/km007-street-ambience-9267.mp3",
        text: "불은 아직 켜져 있는데, 사람은 이미 돌아간 뒤였다.",
        mission: "을지로 골목을 걸으며 가장 오래된 간판을 찾아 사진으로 기록하세요.",
      },
      {
        id: "hangang",
        name: "2026_한강_23시",
        image: "/hangangnight.jpg?v=20260811",
        audio: "/hangangrivernight.mp3",
        text: "다리 위로는 차들이 지나갔고, 다리 밑에는 밤이 고여 있었다.\n\n한강 다리 밑의 밤은 도시에서 가장 조용한 곳 중 하나다. 다리 위로 차들이 지나가는 소리가 멀어지고, 물이 흐르는 소리만 낮게 남는다. 사람들은 이곳에 와서 잠시 아무것도 하지 않는다.",
        mission: "한강 다리 밑에 앉아, 눈을 감고 들리는 소리를 3가지만 적어보세요.",
      },
      {
        id: "gwangjang",
        name: "2026_광장시장_23시",
        image: "/gwangjangmarket.png",
        audio: "/gwangjangmarket.mp3",
        text: "불이 하나둘 꺼지고 나서야, 시장은 오늘 하루가 길었다고 말했다.\n\n장이 파하는 시간의 시장은 낮과 완전히 다른 곳이 된다. 사람들이 빠져나간 통로에는 정리하는 손길과 셔터 내리는 소리만 남고, 형광등 불빛 아래 상인들은 말없이 하루를 접는다. 북적이던 자리가 비어가는 그 시간에만 보이는 얼굴이 있다.",
        mission: "오늘 하루 중 '이제 끝났다'고 느낀 순간이 언제였는지 한 줄로 적어보세요.",
      },
      {
        id: "underground",
        name: "2026_지하상가_18시",
        image: "/underground.jpg",
        audio: "/underground.mp3",
        text: "해가 드는 법 없는 그곳에도, 하루를 지나가는 사람들의 발소리는 가득했다.\n\n지하상가는 낮도 밤도 없이 형광등 불빛만 이어지는 공간이다. 화장품 가게, 옷걸이, 낡은 간판 사이로 사람들이 바쁘게 지나가고, 그 발소리와 웅성거림이 통로를 가득 채운다. 지금은 조금씩 잊혀가지만, 한때 이곳은 도시에서 가장 붐비던 길이었다.",
        mission: "지금은 사라졌거나 변해버린, 예전에 자주 지나다니던 장소를 하나 떠올려 적어보세요.",
      },
    ],
  },
  {
    id: "sounds",
    name: "소리 파일",
    files: [
      {
        id: "sound1",
        name: "지하철 안내방송.wav",
        image: "/euljiro_neon.jpg",
        text: "\"다음 역은, 을지로3가, 을지로삼가역입니다.\" 매일 듣지만 매번 다른, 서울의 배경음악.",
        mission: "자주 타는 지하철 노선의 안내방송을 녹음해 보세요.",
      },
    ],
  },
  {
    id: "sentences",
    name: "짧은 문장",
    files: [
      {
        id: "sentence1",
        name: "서울은_걷는_도시.txt",
        image: "/night_hangang.jpg",
        text: "서울은 걷는 도시다. 걸을수록 새로운 길이 보이고, 멈추면 놓친 풍경이 말을 건다.",
        mission: "오늘 처음 가보는 서울의 골목길을 30분 이상 걸어보세요.",
      },
    ],
  },
];

// ===== Draggable Window Hook (fixed) =====
function useDrag(initialPos) {
  const [pos, setPos] = useState(initialPos);
  const [maximized, setMaximized] = useState(false);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const savedPos = useRef(initialPos);
  // Use ref to always have latest pos without recreating callback
  const posRef = useRef(initialPos);
  posRef.current = pos;

  const onMouseDown = useCallback((e) => {
    if (maximized) return;
    // Prevent text selection while dragging
    e.preventDefault();
    dragging.current = true;
    
    // Support both mouse and touch events
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    offset.current = {
      x: clientX - posRef.current.left,
      y: clientY - posRef.current.top,
    };

    const onMouseMove = (moveEvent) => {
      if (!dragging.current) return;
      const moveClientX = moveEvent.type.includes('touch') ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveClientY = moveEvent.type.includes('touch') ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      // Clamp so the title bar stays on screen
      const newLeft = moveClientX - offset.current.x;
      const newTop = moveClientY - offset.current.y;
      
      // Improve boundaries for mobile (prevent going completely off-screen horizontally, and keep title bar visible vertically)
      const clampedTop = Math.max(0, Math.min(newTop, window.innerHeight - 30));
      // Allow window to be dragged partially off-screen, but keep at least 50px visible
      const clampedLeft = Math.max(-window.innerWidth + 50, Math.min(newLeft, window.innerWidth - 50));
      
      setPos({ top: clampedTop, left: clampedLeft });
    };
    
    const onMouseUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onMouseMove);
      document.removeEventListener("touchend", onMouseUp);
    };
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onMouseMove, { passive: false });
    document.addEventListener("touchend", onMouseUp);
  }, [maximized]); // No longer depends on pos — uses posRef instead

  const toggleMaximize = useCallback(() => {
    if (maximized) {
      setPos(savedPos.current);
      setMaximized(false);
    } else {
      savedPos.current = posRef.current;
      setPos({ top: 0, left: 0 });
      setMaximized(true);
    }
  }, [maximized]);

  return { pos, maximized, onMouseDown, toggleMaximize };
}

// ===== Explorer Content Component =====
function ExplorerContent() {
  const [selectedFolder, setSelectedFolder] = useState(FOLDERS[0].id);
  const [selectedFile, setSelectedFile] = useState(null);

  const currentFolder = FOLDERS.find((f) => f.id === selectedFolder);
  const currentFile = currentFolder?.files.find((f) => f.id === selectedFile);

  return (
    <div className={styles.explorerBody}>
      <div className={styles.folderPanel}>
        {FOLDERS.map((folder) => (
          <div
            key={folder.id}
            className={`${styles.folderItem} ${
              selectedFolder === folder.id ? styles.folderItemActive : ""
            }`}
            onClick={() => {
              setSelectedFolder(folder.id);
              setSelectedFile(null);
            }}
          >
            <span className={styles.folderMiniIcon}></span>
            {folder.name}
          </div>
        ))}
      </div>
      <div className={styles.rightPanel}>
        {currentFile ? (
          <div className={styles.contentViewer}>
            <button className={styles.backButton} onClick={() => setSelectedFile(null)}>
              ← 뒤로
            </button>
            <div className={styles.contentImageBlock}>
              <div className={styles.contentImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentFile.image} alt={currentFile.name} className={styles.contentImage} />
              </div>
            </div>
            {currentFile.audio && (
              <audio controls src={currentFile.audio} className={styles.audioPlayer}>
                브라우저가 오디오를 지원하지 않습니다.
              </audio>
            )}
            <div className={styles.contentText}>{currentFile.text}</div>
            <div className={styles.contentMission}>
              <span className={styles.contentMissionLabel}>📌 미션:</span>
              {currentFile.mission}
            </div>
            <button
              className={styles.restoreButton}
              onClick={() => alert("내 하드에 성공적으로 복구되었습니다.")}
            >
              내 하드에 복구
            </button>
          </div>
        ) : (
          <div className={styles.fileList}>
            {currentFolder?.files.map((file) => (
              <div key={file.id} className={styles.fileItem} onClick={() => setSelectedFile(file.id)}>
                <span className={styles.fileMiniIcon}></span>
                {file.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Draggable Window Component (fixed) =====
// minimized state is now controlled by parent via props
function DraggableWindow({ id, title, isExplorer, isFocused, isMinimized, onClose, onFocus, onMinimize, children }) {
  const defaults = WINDOW_DEFAULTS[id] || { top: 80, left: 150, width: 450, height: 300 };
  const { pos, maximized, onMouseDown, toggleMaximize } = useDrag({
    top: defaults.top,
    left: defaults.left,
  });

  // If minimized, hide but don't unmount (preserves internal state like explorer selection)
  if (isMinimized) return null;

  return (
    <div
      className={`${styles.window} ${isExplorer ? styles.windowExplorer : ""} ${
        maximized ? styles.windowMaximized : ""
      }`}
      id={`window-${id}`}
      style={
        maximized
          ? { top: 0, left: 0, zIndex: isFocused ? 200 : 100 }
          : { top: pos.top, left: pos.left, zIndex: isFocused ? 200 : 100 }
      }
      onMouseDown={onFocus}
      onTouchStart={onFocus}
    >
      <div
        className={`${styles.titleBar} ${!isFocused ? styles.titleBarInactive : ""}`}
        onMouseDown={(e) => {
          // Only drag with left mouse button, and not on the buttons area
          if (e.target.closest(`.${styles.titleButtons}`)) return;
          onMouseDown(e);
        }}
        onTouchStart={(e) => {
          if (e.target.closest(`.${styles.titleButtons}`)) return;
          onMouseDown(e);
        }}
      >
        <span className={styles.titleText}>{title}</span>
        <div className={styles.titleButtons}>
          <button
            className={styles.titleBtn}
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            aria-label="최소화"
          >
            _
          </button>
          <button
            className={styles.titleBtn}
            onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}
            aria-label="최대화"
          >
            □
          </button>
          <button
            className={styles.titleBtn}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      </div>
      {children || <div className={styles.windowBody}></div>}
    </div>
  );
}

// ===== Start Menu Component =====
function StartMenu({ onOpenWindow, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (e.target.closest('#start-button')) return;
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className={styles.startMenu} id="start-menu" ref={menuRef}>
      <div className={styles.startMenuBanner}>
        <span className={styles.bannerText}>SeoulOS 98</span>
      </div>
      <div className={styles.startMenuItems}>
        {ICONS.map((icon) => (
          <div
            key={icon.id}
            className={styles.startMenuItem}
            onClick={() => {
              onOpenWindow(icon.id);
              onClose();
            }}
          >
            <div className={styles.startMenuIcon}>
              <div className={`${styles.iconAccent} ${styles[icon.accent]}`}></div>
            </div>
            <span>{icon.label}</span>
          </div>
        ))}
        <div className={styles.startMenuDivider}></div>
        <div className={styles.startMenuItem} style={{ color: "#808080" }}>
          <div className={styles.startMenuIcon}>
            <span style={{ fontSize: "14px" }}>❓</span>
          </div>
          <span>도움말</span>
        </div>
      </div>
    </div>
  );
}

// ===== Main Page =====
export default function Home() {
  const [time, setTime] = useState("");
  // Track open windows: { [id]: true/false }
  const [openWindows, setOpenWindows] = useState({});
  // Track minimized windows: { [id]: true/false }
  const [minimizedWindows, setMinimizedWindows] = useState({});
  // Track which window is focused (topmost)
  const [focusedWindow, setFocusedWindow] = useState(null);
  // Start menu visibility
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  // Boot screen state
  const [bootPhase, setBootPhase] = useState("bios");

  useEffect(() => {
    const t1 = setTimeout(() => setBootPhase("logo"), 1500);
    const t2 = setTimeout(() => setBootPhase("fadeout"), 3700);
    const t3 = setTimeout(() => setBootPhase("done"), 4100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    }
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  // Open window (or restore if minimized, or bring to front if already open)
  function openWindow(id) {
    if (openWindows[id]) {
      // Already open — un-minimize if needed, and bring to front
      if (minimizedWindows[id]) {
        setMinimizedWindows((prev) => ({ ...prev, [id]: false }));
      }
      setFocusedWindow(id);
    } else {
      // Not open — open fresh
      setOpenWindows((prev) => ({ ...prev, [id]: true }));
      setMinimizedWindows((prev) => ({ ...prev, [id]: false }));
      setFocusedWindow(id);
    }
  }

  function closeWindow(id) {
    setOpenWindows((prev) => ({ ...prev, [id]: false }));
    setMinimizedWindows((prev) => ({ ...prev, [id]: false }));
    if (focusedWindow === id) setFocusedWindow(null);
  }

  function minimizeWindow(id) {
    setMinimizedWindows((prev) => ({ ...prev, [id]: true }));
    if (focusedWindow === id) setFocusedWindow(null);
  }

  // Taskbar button click: toggle minimize/restore
  function onTaskbarButtonClick(id) {
    if (minimizedWindows[id]) {
      // Restore from minimized
      setMinimizedWindows((prev) => ({ ...prev, [id]: false }));
      setFocusedWindow(id);
    } else if (focusedWindow === id) {
      // Already focused — minimize it
      minimizeWindow(id);
    } else {
      // Not focused — bring to front
      setFocusedWindow(id);
    }
  }

  return (
    <>
      <Head>
        <title>SeoulOS 98</title>
        <meta name="description" content="SeoulOS 98 - 레트로 감성 데스크탑" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ===== Boot Screen ===== */}
      {bootPhase !== "done" && (
        <>
          {bootPhase === "bios" && (
            <div className={`${styles.bootScreen} ${styles.biosScreen}`} id="boot-bios">
              <div><span className={styles.biosHighlight}>SeoulOS 98 BIOS v1.0</span></div>
              <div>Copyright (C) 2026, Seoul Digital Lab</div>
              <br />
              <div>Main Processor : Seoul City Core @ 98MHz</div>
              <div>Memory Test : <span className={styles.biosHighlight}>65536KB OK</span></div>
              <br />
              <div>Detecting Hard Drives...</div>
              <div>Primary Master : SEOUL-HDD 2.1GB</div>
              <br />
              <div>Loading SeoulOS 98... <span className={styles.biosCursor}></span></div>
            </div>
          )}
          {(bootPhase === "logo" || bootPhase === "fadeout") && (
            <div
              className={`${styles.bootScreen} ${styles.logoScreen} ${
                bootPhase === "fadeout" ? styles.fadeOut : ""
              }`}
              id="boot-logo"
            >
              <div className={styles.logoFlag}>
                <span className={`${styles.logoFlagBlock} ${styles.flagBlockRed}`}></span>
                <span className={`${styles.logoFlagBlock} ${styles.flagBlockGreen}`}></span>
                <span className={`${styles.logoFlagBlock} ${styles.flagBlockBlue}`}></span>
                <span className={`${styles.logoFlagBlock} ${styles.flagBlockYellow}`}></span>
              </div>
              <div className={styles.logoTitle}>SeoulOS 98</div>
              <div className={styles.logoSubtitle}>서울을 탐색하는 운영체제</div>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}></div>
              </div>
            </div>
          )}
        </>
      )}

      <div className={styles.desktop} id="desktop" onClick={() => setStartMenuOpen(false)}>
        {/* Desktop Icons */}
        <div className={styles.iconGrid}>
          {ICONS.map((icon) => (
            <div
              key={icon.id}
              className={styles.iconItem}
              id={`icon-${icon.id}`}
              onClick={(e) => { e.stopPropagation(); openWindow(icon.id); }}
            >
              <div className={styles.iconBox}>
                <div className={`${styles.iconAccent} ${styles[icon.accent]}`}></div>
              </div>
              <span className={styles.iconLabel}>{icon.label}</span>
            </div>
          ))}
        </div>

        {/* Windows */}
        {ICONS.map((icon) =>
          openWindows[icon.id] ? (
            <DraggableWindow
              key={`window-${icon.id}`}
              id={icon.id}
              title={icon.label}
              isExplorer={icon.id === "explorer"}
              isFocused={focusedWindow === icon.id}
              isMinimized={!!minimizedWindows[icon.id]}
              onClose={() => closeWindow(icon.id)}
              onFocus={() => setFocusedWindow(icon.id)}
              onMinimize={() => minimizeWindow(icon.id)}
            >
              {icon.id === "explorer" ? <ExplorerContent /> : <div className={styles.windowBody}></div>}
            </DraggableWindow>
          ) : null
        )}

        {/* Start Menu */}
        {startMenuOpen && (
          <StartMenu
            onOpenWindow={openWindow}
            onClose={() => setStartMenuOpen(false)}
          />
        )}

        {/* Taskbar */}
        <div className={styles.taskbar} id="taskbar" onClick={(e) => e.stopPropagation()}>
          <div className={styles.taskbarLeft}>
            <button
              className={`${styles.startButton} ${startMenuOpen ? styles.startButtonActive : ""}`}
              id="start-button"
              onClick={(e) => { e.stopPropagation(); setStartMenuOpen((prev) => !prev); }}
            >
              <span className={styles.startLogo}>
                <span className={styles.flagIcon}>
                  <span className={styles.flagRed}></span>
                  <span className={styles.flagGreen}></span>
                  <span className={styles.flagBlue}></span>
                  <span className={styles.flagYellow}></span>
                </span>
              </span>
              시작
            </button>

            {/* Taskbar window buttons */}
            {ICONS.map((icon) =>
              openWindows[icon.id] ? (
                <button
                  key={`taskbar-${icon.id}`}
                  className={`${styles.taskbarWindowBtn} ${
                    focusedWindow === icon.id && !minimizedWindows[icon.id]
                      ? styles.taskbarWindowBtnActive
                      : ""
                  }`}
                  onClick={() => onTaskbarButtonClick(icon.id)}
                >
                  {icon.label}
                </button>
              ) : null
            )}
          </div>

          <div className={styles.tray} id="system-tray">
            {time}
          </div>
        </div>
      </div>
    </>
  );
}
