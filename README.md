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
- **樂譜模式切換** — 正式樂譜（黑色為主）/ 音軌彩色（音符頭上色），播放列下拉選單即時切換
- **播放高亮** — 正在發聲的音符以音軌顏色淡光標示（透明度 0.18）

### 播放功能
- **Tone.js PolySynth** — 多聲部音訊合成
- **播放游標** — 紅色垂直線搭配倒三角指標
- **自動滾動** — 播放時當前行平滑置中，視區自動跟隨
- **點擊定位** — 點擊樂譜任意位置跳轉播放
- **速度控制** — 0.25x 至 2x 播放速度
- **音量控制** — 可調整滑桿

### 匯出與範例
- **匯出 PNG** — 一鍵將樂譜匯出為 PNG 圖片（自動關閉 Debug 疊層）
- **範例 MIDI** — 內建 5 首範例（音階、和弦、多音軌、踏板、密集排版），無需自行準備檔案

### Debug 模式
- **小節邊界** — 綠色虛線與小節編號
- **節拍網格** — 藍色虛線與拍號標記
- **音符邊界框** — 紅色矩形標示每個音符頭
- **聲部標籤** — 紫色標記顯示 trackId 與 voiceIndex

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

> 💡 若使用 `file://` 協議開啟，範例 MIDI 會以內嵌 Base64 載入。若透過 HTTP Server 開啟，則優先從 `samples/` 資料夾讀取。

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
│   ├── score-renderer.js   # 記譜刻印引擎（2300+ 行）
│   ├── audio-player.js     # Tone.js 播放控制器
│   └── app.js              # 應用程式協調器（含範例 MIDI Base64）
├── samples/                # 範例 MIDI 檔案
│   ├── simple-scale.mid
│   ├── chord-test.mid
│   ├── multi-track-demo.mid
│   ├── pedal-demo.mid
│   └── dense-midi-test.mid
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
  → groupPedalSegments()           // 相鄰踏板段自動合併（間隔 ≤ 0.4 拍）
  → generateDynamicsMarkings()     // velocity → 強弱記號（pp / p / mp / mf / f / ff）
  → layoutSystems()                // 計算 x/y 位置，動態小節寬度
  → resolveCollisions()            // 偏移重疊音符頭
  → drawFrame()                    // 渲染至離屏畫布，再同步至螢幕
```

---

## 🎹 使用方式

1. **上傳** — 拖曳 `.mid` 檔案至上傳區域，或點擊「選擇檔案」；也可點「載入範例 MIDI」快速體驗
2. **選擇音軌** — 在左側側邊欄勾選／取消音軌
3. **播放** — 按下播放按鈕或按空白鍵
4. **定位** — 點擊樂譜任意位置跳轉播放位置
5. **調整** — 使用播放列的速度與音量控制
6. **切換模式** — 播放列下拉選單切換「正式樂譜」或「音軌彩色」
7. **匯出** — 點擊「匯出樂譜 PNG」下載樂譜圖片

---

## 🎨 顏色模式

| 模式 | 音符頭 | 符桿 | 音軌標示 |
|------|--------|------|----------|
| **正式樂譜**（預設） | 黑色 | 黑色 | 極淡 0.08 透明度背景圓 |
| **音軌彩色** | 音軌顏色 | 黑色 | 音符頭直接使用音軌顏色 |

可在播放列下拉選單即時切換，或在瀏覽器主控台：`scoreRenderer.colorMode = 'engraving'` 或 `'track'`

---

## 🐛 Debug 模式

勾選播放列的「Debug 模式」核取方塊，會在樂譜上疊加診斷資訊：

- **綠色虛線** — 小節邊界與編號
- **藍色虛線** — 節拍格線與拍號
- **紅色矩形** — 音符頭邊界框
- **紫色標籤** — trackId 與 voiceIndex

匯出 PNG 時會自動關閉 Debug 疊層。

---

## 🛠 技術說明

- **Canvas 雙緩衝** — 所有繪製先寫入離屏畫布，再同步至顯示畫布，防止閃爍
- **HiDPI 支援** — Canvas 依 `devicePixelRatio` 縮放，在 Retina 螢幕上呈現清晰銳利
- **響應式重繪** — 視窗縮放觸發 120ms 去抖重繪，重新計算小節寬度
- **全音階音高映射** — MIDI 音高透過 `octave * 7 + step` 公式映射至譜表位置
- **Beam 斜率限制** — Beam 最大斜率限制為 0.12，防止極端角度
- **踏板段融合** — 間隔 ≤ 0.4 拍的踏板段自動合併為連續踏板線
- **強弱演算法** — 依據 velocity 閾值分六級，變級且間距 ≥ 6 拍才標記
- **範例 MIDI 雙軌載入** — HTTP Server 環境優先讀取檔案，`file://` 協議降級使用內嵌 Base64

---

## 📄 授權條款

MIT

---

## 🙏 致謝

- [Tone.js](https://tonejs.github.io/) — Web Audio 音訊框架
- [@tonejs/midi](https://github.com/Tonejs/Midi) — MIDI 解析函式庫
- 記譜標準參考自 Elaine Gould 所著 [Behind Bars](https://www.amazon.com/Behind-Bars-Definitive-Guide-Notation/dp/0571514561)
