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
        name: "을지로 네온",
        image: "/euljiro_neon.jpg",
        text: "오래된 골목 사이로 네온이 깜빡인다. 을지로 3가, 이 빛은 언제까지 남아 있을까. 간판 하나하나에 누군가의 하루가 새겨져 있다.",
        mission: "을지로 골목을 걸으며 가장 오래된 간판을 찾아 사진으로 기록하세요.",
      },
      {
        id: "hangang",
        name: "밤 한강",
        image: "/night_hangang.jpg",
        text: "달빛이 강 위에 부서진다. 다리 아래 바람이 불 때마다 서울의 소리가 들린다. 이 강은 늘 여기 있었다.",
        mission: "밤 한강에서 가장 마음에 드는 다리를 골라 그 위에서 바람 소리를 녹음하세요.",
      },
      {
        id: "gwangjang",
        name: "광장시장",
        image: "/gwangjang_market.jpg",
        text: "빈대떡 냄새, 마약김밥의 유혹, 좌판 위의 오래된 손맛. 광장시장은 서울에서 가장 따뜻한 골목이다.",
        mission: "광장시장에서 가장 줄이 긴 가게를 찾아 그 음식을 맛보고 한 줄 감상을 남기세요.",
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

// ===== Draggable Window Hook =====
function useDrag(initialPos) {
  const [pos, setPos] = useState(initialPos);
  const [maximized, setMaximized] = useState(false);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const savedPos = useRef(initialPos);

  const onMouseDown = useCallback((e) => {
    if (maximized) return;
    dragging.current = true;
    offset.current = { x: e.clientX - pos.left, y: e.clientY - pos.top };

    const onMouseMove = (e) => {
      if (!dragging.current) return;
      setPos({ top: e.clientY - offset.current.y, left: e.clientX - offset.current.x });
    };
    const onMouseUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [pos, maximized]);

  const toggleMaximize = useCallback(() => {
    if (maximized) {
      setPos(savedPos.current);
      setMaximized(false);
    } else {
      savedPos.current = pos;
      setPos({ top: 0, left: 0 });
      setMaximized(true);
    }
  }, [maximized, pos]);

  return { pos, maximized, onMouseDown, toggleMaximize, setPos };
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentFile.image} alt={currentFile.name} className={styles.contentImage} />
            <div className={styles.contentText}>{currentFile.text}</div>
            <div className={styles.contentMission}>
              <span className={styles.contentMissionLabel}>📌 미션:</span>
              {currentFile.mission}
            </div>
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

// ===== Draggable Window Component =====
function DraggableWindow({ id, title, isExplorer, isFocused, onClose, onFocus, children }) {
  const defaults = WINDOW_DEFAULTS[id] || { top: 80, left: 150, width: 450, height: 300 };
  const { pos, maximized, onMouseDown, toggleMaximize } = useDrag({
    top: defaults.top,
    left: defaults.left,
  });
  const [minimized, setMinimized] = useState(false);

  if (minimized) return null;

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
    >
      <div
        className={`${styles.titleBar} ${!isFocused ? styles.titleBarInactive : ""}`}
        onMouseDown={onMouseDown}
      >
        <span className={styles.titleText}>{title}</span>
        <div className={styles.titleButtons}>
          <button
            className={styles.titleBtn}
            onClick={(e) => { e.stopPropagation(); setMinimized(true); }}
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
        // Don't close if clicking the start button itself (parent handles toggle)
        if (e.target.closest('#start-button')) return;
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className={styles.startMenu} id="start-menu" ref={menuRef}>
      {/* Left blue banner */}
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

  function openWindow(id) {
    setOpenWindows((prev) => ({ ...prev, [id]: true }));
    setFocusedWindow(id);
  }

  function closeWindow(id) {
    setOpenWindows((prev) => ({ ...prev, [id]: false }));
    if (focusedWindow === id) setFocusedWindow(null);
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
              onClose={() => closeWindow(icon.id)}
              onFocus={() => setFocusedWindow(icon.id)}
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
        <div className={styles.taskbar} id="taskbar">
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
                    focusedWindow === icon.id ? styles.taskbarWindowBtnActive : ""
                  }`}
                  onClick={() => setFocusedWindow(icon.id)}
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
