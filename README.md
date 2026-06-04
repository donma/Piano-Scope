# 🎵 Piano Scope

> 純前端 MIDI 樂譜播放器，具備出版級五線譜刻印引擎——無需後端、無需建置工具，開啟即用。

Piano Scope 能讀取標準 `.mid` / `.midi` 檔案，直接在瀏覽器中渲染出版級品質的鋼琴樂譜。支援多音軌 MIDI 並以顏色區分各軌道、即時播放搭配滾動游標，以及由自訂 Canvas 渲染引擎驅動的專業記譜刻印。

---

## ✨ 功能特色

### 專業記譜刻印
- **大譜表（Grand Staff）** — 高音譜表與低音譜表，由鋼琴大括號連接
- **向量譜號** — 以 `Path2D` SVG 路徑繪製高音／低音譜號，不依賴系統字型
- **調號自動偵測** — 根據 MIDI 音符資料自動辨識調性
- **拍號** — 以 Times New Roman 衬線字體呈現
- **小節線與終止線** — 一般小節線 + 最後小節雙線終止記號（細＋粗）
- **加線（Ledger Lines）** — 正確繪製於五線譜上方與下方
- **附點、延音線、臨時記號** — 升記號、降記號、還原記號；附點節奏；延音弧線

### 記譜引擎
- **節拍量化** — 音符對齊至 16 分音符格線（可調整）
- **和弦合併** — 同一 track + 同一譜表 + 同一聲部 + 同一拍點 → 合併為和弦
- **聲部分配** — 不同音軌在同譜表上分配不同的 voice index
- **符桿方向** — 聲部 0 向上、聲部 1 向下；單聲部則依據譜表中線決定
- **Beam 分組** — 八分音符與十六分音符以 beam 連接，帶斜率限制；不同 track / voice 不會混接
- **休止符** — 全休止、二分、四分、八分、十六分休止符（Canvas 繪製，不依賴字型）
- **碰撞處理** — 相鄰音符頭自動水平偏移，避免重疊

### 速度、強弱與踏板
- **速度標記** — 左上角顯示 `♩ = BPM`
- **強弱記號** — 根據 MIDI velocity 自動產生 `pp` / `p` / `mp` / `mf` / `f` / `ff`，繪製於高低譜表之間
- **延音踏板線** — 解析 MIDI CC 64 事件，繪製標準 `Ped. ____/\___\|` 記譜，支援快速踏板更換自動合併

### 多音軌支援
- **音軌顏色** — 16 色色盤，每個音軌分配獨立顏色
- **音軌顯示／隱藏** — 側邊欄 checkbox 控制
- **刻印模式（Engraving）** — 音符主體黑色，音軌顏色作為極淡輔助背景（透明度 0.08）
- **彩色模式（Track）** — 音符頭直接使用音軌顏色（可選）
- **播放高亮** — 正在發聲的音符以音軌顏色淡光標示（透明度 0.18）

### 播放功能
- **Tone.js PolySynth** — 多聲部音訊合成
- **播放游標** — 紅色垂直線搭配倒三角指標
- **自動滾動** — 播放時當前行平滑置中，視區自動跟隨
- **點擊定位** — 點擊樂譜任意位置跳轉播放
- **速度控制** — 0.25x 至 2x 播放速度
- **音量控制** — 可調整滑桿

### 使用者體驗
- **拖放上傳** — 拖曳 `.mid` 檔案至上傳區域，或點擊瀏覽
- **深色／淺色主題** — 一鍵切換，狀態儲存於 localStorage
- **響應式佈局** — 側邊欄在小螢幕自動收合、播放列換行、樂譜水平捲動
- **鍵盤快捷鍵** — 空白鍵播放／暫停

---

## 🚀 開始使用

無需建置步驟，無需安裝相依套件。用現代瀏覽器開啟 `index.html` 即可。

```bash
# 複製儲存庫
git clone https://github.com/donma/Piano-Scope.git
cd Piano-Scope

# 直接用瀏覽器開啟
open index.html
# 或 Windows
start index.html
```

### CDN 相依套件（自動載入）

| 函式庫 | 版本 | 用途 |
|--------|------|------|
| [@tonejs/midi](https://github.com/Tonejs/Midi) | 2.0.28 | MIDI 檔案解析（含 CC 64 踏板事件） |
| [Tone.js](https://github.com/Tonejs/Tone.js) | 14.7.77 | 音訊合成與播放 |

這些套件由 jsDelivr CDN 載入，寫在 `index.html` 中——無需 `npm install`。

---

## 📂 專案結構

```
Piano-Scope/
├── index.html              # 單頁應用程式入口
├── README.md               # 本說明文件
├── css/
│   └── style.css           # 主題系統、響應式佈局、播放器 UI
├── js/
│   ├── midi-parser.js      # MIDI 檔案解析（含 CC 64 踏板事件）
│   ├── score-renderer.js   # 記譜刻印引擎（2200+ 行）
│   ├── audio-player.js     # Tone.js 播放控制器
│   └── app.js              # 應用程式協調器
└── lib/                    # （保留給本機函式庫）
```

### 渲染管線

```
MIDI 檔案
  → MidiParser.loadFromFile()      // 載入並解析 MIDI（含 CC 64 踏板）
  → normalizeTracks()              // 設定 trackId, trackColor, channel, pedalEvents
  → detectKeySignature()           // 自動偵測調號
  → quantizeNotes()                // 量化至節拍格線，保留 metadata
  → assignStaff()                  // pitch ≥ 60 → 高音譜表，否則低音譜表
  → assignVoices()                 // 不同音軌 → 不同聲部
  → groupChords()                  // 同 track + staff + voice + beat → 和弦
  → generatePedalSegments()        // CC 64 → 踏板時值區間
  → groupPedalSegments()           // 相鄰踏板段自動合併
  → generateDynamicsMarkings()     // velocity → 強弱記號
  → layoutSystems()                // 計算 x/y 位置，動態小節寬度
  → resolveCollisions()            // 偏移重疊音符頭
  → drawFrame()                    // 渲染至離屏畫布，再同步至螢幕
```

---

## 🎹 使用方式

1. **上傳** — 拖曳 `.mid` 檔案至上傳區域，或點擊「選擇檔案」
2. **選擇音軌** — 在左側側邊欄勾選／取消音軌
3. **播放** — 按下播放按鈕或按空白鍵
4. **定位** — 點擊樂譜任意位置跳轉播放位置
5. **調整** — 使用播放列的速度與音量控制

---

## 🎨 顏色模式

| 模式 | 音符頭 | 符桿 | 音軌標示 |
|------|--------|------|----------|
| **刻印模式**（預設） | 黑色 | 黑色 | 極淡 0.08 透明度背景圓 |
| **彩色模式** | 音軌顏色 | 黑色 | 音符頭直接使用音軌顏色 |

在瀏覽器主控台切換：`scoreRenderer.colorMode = 'engraving'` 或 `'track'`

---

## 🛠 技術說明

- **Canvas 雙緩衝** — 所有繪製先寫入離屏畫布，再同步至顯示畫布，防止閃爍
- **HiDPI 支援** — Canvas 依 `devicePixelRatio` 縮放，在 Retina 螢幕上呈現清晰銳利
- **響應式重繪** — 視窗縮放觸發 120ms 去抖重繪，重新計算小節寬度
- **全音階音高映射** — MIDI 音高透過 `octave * 7 + step` 公式映射至譜表位置
- **Beam 斜率限制** — Beam 最大斜率限制為 0.12，防止極端角度
- **踏板段融合** — 間隔 ≤ 0.4 拍的踏板段自動合併為連續踏板線
- **強弱演算法** — 依據 velocity 閾值分六級，變級且間距 ≥ 6 拍才標記

---

## 📄 授權條款

MIT

---

## 🙏 致謝

- [Tone.js](https://tonejs.github.io/) — Web Audio 音訊框架
- [@tonejs/midi](https://github.com/Tonejs/Midi) — MIDI 解析函式庫
- 記譜標準參考自 Elaine Gould 所著 [Behind Bars](https://www.amazon.com/Behind-Bars-Definitive-Guide-Notation/dp/0571514561)
