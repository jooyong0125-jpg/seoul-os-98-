import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "@/styles/Home.module.css";

// Desktop icon definitions
const ICONS = [
  { id: "explorer", label: "서울 탐색기", accent: "accentExplorer" },
  { id: "files",    label: "오늘의 파일", accent: "accentFile" },
  { id: "drive",    label: "내 하드",     accent: "accentDrive" },
];

const WINDOW_OFFSETS = {
  explorer: { top: 40, left: 120 },
  files:    { top: 90, left: 180 },
  drive:    { top: 120, left: 220 },
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

// ===== Explorer Component =====
function ExplorerWindow({ onClose }) {
  const [selectedFolder, setSelectedFolder] = useState(FOLDERS[0].id);
  const [selectedFile, setSelectedFile] = useState(null);

  const currentFolder = FOLDERS.find((f) => f.id === selectedFolder);
  const currentFile = currentFolder?.files.find((f) => f.id === selectedFile);

  return (
    <div
      className={`${styles.window} ${styles.windowExplorer}`}
      id="window-explorer"
      style={{ top: WINDOW_OFFSETS.explorer.top, left: WINDOW_OFFSETS.explorer.left }}
    >
      {/* Title bar */}
      <div className={styles.titleBar}>
        <span className={styles.titleText}>서울 탐색기</span>
        <div className={styles.titleButtons}>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="서울 탐색기 닫기"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Explorer body */}
      <div className={styles.explorerBody}>
        {/* Left: Folder sidebar */}
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

        {/* Right panel */}
        <div className={styles.rightPanel}>
          {currentFile ? (
            /* Content viewer */
            <div className={styles.contentViewer}>
              <button
                className={styles.backButton}
                onClick={() => setSelectedFile(null)}
              >
                ← 뒤로
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentFile.image}
                alt={currentFile.name}
                className={styles.contentImage}
              />
              <div className={styles.contentText}>{currentFile.text}</div>
              <div className={styles.contentMission}>
                <span className={styles.contentMissionLabel}>📌 미션:</span>
                {currentFile.mission}
              </div>
            </div>
          ) : (
            /* File list */
            <div className={styles.fileList}>
              {currentFolder?.files.map((file) => (
                <div
                  key={file.id}
                  className={styles.fileItem}
                  onClick={() => setSelectedFile(file.id)}
                >
                  <span className={styles.fileMiniIcon}></span>
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Main Page =====
export default function Home() {
  const [time, setTime] = useState("");
  const [openWindows, setOpenWindows] = useState({});

  // Boot screen state: "bios" → "logo" → "fadeout" → "done"
  const [bootPhase, setBootPhase] = useState("bios");

  // Boot sequence timer — runs every visit, no localStorage
  useEffect(() => {
    // Phase 1: BIOS screen (1.5s) → Phase 2: Logo screen
    const t1 = setTimeout(() => setBootPhase("logo"), 1500);
    // Phase 2: Logo screen (2.2s) → Fade out
    const t2 = setTimeout(() => setBootPhase("fadeout"), 3700);
    // Fade out animation (0.4s) → Done
    const t3 = setTimeout(() => setBootPhase("done"), 4100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
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
  }

  function closeWindow(id) {
    setOpenWindows((prev) => ({ ...prev, [id]: false }));
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
          {/* Phase 1: BIOS */}
          {bootPhase === "bios" && (
            <div className={`${styles.bootScreen} ${styles.biosScreen}`} id="boot-bios">
              <div>
                <span className={styles.biosHighlight}>SeoulOS 98 BIOS v1.0</span>
              </div>
              <div>Copyright (C) 2026, Seoul Digital Lab</div>
              <br />
              <div>Main Processor : Seoul City Core @ 98MHz</div>
              <div>Memory Test : <span className={styles.biosHighlight}>65536KB OK</span></div>
              <br />
              <div>Detecting Hard Drives...</div>
              <div>Primary Master : SEOUL-HDD 2.1GB</div>
              <br />
              <div>
                Loading SeoulOS 98... <span className={styles.biosCursor}></span>
              </div>
            </div>
          )}

          {/* Phase 2: Logo + Progress Bar */}
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


      <div className={styles.desktop} id="desktop">
        {/* Desktop Icons */}
        <div className={styles.iconGrid}>
          {ICONS.map((icon) => (
            <div
              key={icon.id}
              className={styles.iconItem}
              id={`icon-${icon.id}`}
              onDoubleClick={() => openWindow(icon.id)}
            >
              <div className={styles.iconBox}>
                <div className={`${styles.iconAccent} ${styles[icon.accent]}`}></div>
              </div>
              <span className={styles.iconLabel}>{icon.label}</span>
            </div>
          ))}
        </div>

        {/* Explorer window — uses its own component */}
        {openWindows.explorer && (
          <ExplorerWindow onClose={() => closeWindow("explorer")} />
        )}

        {/* Other windows (still empty) */}
        {ICONS.filter((i) => i.id !== "explorer").map((icon) =>
          openWindows[icon.id] ? (
            <div
              key={`window-${icon.id}`}
              className={styles.window}
              id={`window-${icon.id}`}
              style={{
                top: WINDOW_OFFSETS[icon.id].top,
                left: WINDOW_OFFSETS[icon.id].left,
              }}
            >
              <div className={styles.titleBar}>
                <span className={styles.titleText}>{icon.label}</span>
                <div className={styles.titleButtons}>
                  <button
                    className={styles.closeButton}
                    onClick={() => closeWindow(icon.id)}
                    aria-label={`${icon.label} 닫기`}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className={styles.windowBody}></div>
            </div>
          ) : null
        )}

        {/* Taskbar */}
        <div className={styles.taskbar} id="taskbar">
          <button className={styles.startButton} id="start-button">
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

          <div className={styles.tray} id="system-tray">
            {time}
          </div>
        </div>
      </div>
    </>
  );
}
