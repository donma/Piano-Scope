/**
 * 專業級五線譜與多音軌渲染器
 * 負責將 MIDI notes 轉換為量化排版模型，並繪製出版級雙譜表（Grand Staff）
 */

// SVG Path 向量譜號與休止符資料
const TREBLE_CLEF_PATH = "M32.108,45.02C31.428,42.709,30.78,40.425,30.195,38.209C34.229,34.433,37.429,29.413,37.5,21.283C37.536,17.06,37.032,12.006,33.025,6.535C31.843,4.922,29.604,4.519,27.934,5.621C23.985,8.227,20,14.457,20,22.5C20,26.253,20.699,30.663,21.782,35.411C20.949,36.021,20.077,36.63,19.177,37.259C12.86,41.667,5,47.153,5,60C5,74.084,16.44,82.5,27.5,82.5C29.658,82.5,31.729,82.271,33.677,81.841C33.684,82.066,33.688,82.285,33.688,82.5C33.688,85.257,31.445,87.5,28.688,87.5C27.352,87.5,26.096,86.98,25.153,86.036L19.848,91.339C22.209,93.7,25.348,95,28.688,95C35.581,95,41.188,89.393,41.188,82.5C41.188,81.387,41.118,80.206,40.986,78.964C46.528,75.615,50,70.154,50,63.75C50,53.699,42.05,45.47,32.108,45.02ZM29.244,15.311C29.86,17.224,30.017,19.139,30,21.218C29.973,24.421,29.287,26.889,28.125,28.943C27.729,26.582,27.5,24.41,27.5,22.5C27.5,19.607,28.264,17.158,29.244,15.311ZM27.5,75C20.229,75,12.5,69.743,12.5,60C12.5,51.065,17.341,47.686,23.469,43.409C23.573,43.337,23.677,43.264,23.781,43.192C24.103,44.346,24.438,45.509,24.78,46.677C19.873,49.271,16.188,54.53,16.188,60C16.188,63.338,17.488,66.477,19.848,68.838L25.153,63.535C24.209,62.59,23.688,59.999,23.688,59.999C23.688,57.909,25.121,55.645,27.027,54.157C27.096,54.384,27.166,54.611,27.234,54.838C29.303,61.627,31.419,68.566,32.64,74.372C31.05,74.78,29.322,75,27.5,75ZM39.503,70.664C38.239,65.243,36.406,59.209,34.508,52.981C39.128,54.381,42.5,58.679,42.5,63.75C42.5,67.669,41.258,71.217,39.503,70.664Z";

const BASS_CLEF_PATH = "M75 55c0 4 3 8 8 8s8-4 8-8-3-8-8-8-8 4-8 8zm0-37c0 4 3 8 8 8s8-4 8-8-3-8-8-8-8 4-8 8zm-48 20c25 0 43-13 43-37 0-39-39-62-76-78-0-0-1-0-1-0-1 0-2 1-2 2 0 0 0 1 0 1 30 18 61 39 61 74 0 18-10 35-26 35-12 0-20-8-24-20 2 1 4 2 6 2 8 0 15-7 15-15 0-9-7-16-15-16-9 0-16 7-16 16 0 20 15 36 34 36z";

// 常見調號定義
const KEY_SIGNATURES = {
    'C': { sharps: 0, flats: 0, name: 'C Major' },
    'G': { sharps: 1, flats: 0, trebleSteps: [0], bassSteps: [1], name: 'G Major' },
    'D': { sharps: 2, flats: 0, trebleSteps: [0, 3], bassSteps: [1, 4], name: 'D Major' },
    'F': { sharps: 0, flats: 1, trebleSteps: [4], bassSteps: [5], name: 'F Major' },
    'Bb': { sharps: 0, flats: 2, trebleSteps: [4, 1], bassSteps: [5, 2], name: 'Bb Major' }
};

// 每個調號在十二個半音上的音符升降對應（0-11 分別為 C 到 B）
const KEY_MAPS = {
    'C': {
        0: { step: 0, acc: '' }, 1: { step: 0, acc: '#' }, 2: { step: 1, acc: '' }, 3: { step: 1, acc: '#' },
        4: { step: 2, acc: '' }, 5: { step: 3, acc: '' }, 6: { step: 3, acc: '#' }, 7: { step: 4, acc: '' },
        8: { step: 4, acc: '#' }, 9: { step: 5, acc: '' }, 10: { step: 5, acc: '#' }, 11: { step: 6, acc: '' }
    },
    'G': {
        0: { step: 0, acc: '' }, 1: { step: 0, acc: '#' }, 2: { step: 1, acc: '' }, 3: { step: 1, acc: '#' },
        4: { step: 2, acc: '' }, 5: { step: 3, acc: 'n' }, 6: { step: 3, acc: '' }, 7: { step: 4, acc: '' },
        8: { step: 4, acc: '#' }, 9: { step: 5, acc: '' }, 10: { step: 5, acc: '#' }, 11: { step: 6, acc: '' }
    },
    'D': {
        0: { step: 0, acc: 'n' }, 1: { step: 0, acc: '' }, 2: { step: 1, acc: '' }, 3: { step: 1, acc: '#' },
        4: { step: 2, acc: '' }, 5: { step: 3, acc: 'n' }, 6: { step: 3, acc: '' }, 7: { step: 4, acc: '' },
        8: { step: 4, acc: '#' }, 9: { step: 5, acc: '' }, 10: { step: 5, acc: '#' }, 11: { step: 6, acc: '' }
    },
    'F': {
        0: { step: 0, acc: '' }, 1: { step: 0, acc: '#' }, 2: { step: 1, acc: '' }, 3: { step: 1, acc: '#' },
        4: { step: 2, acc: '' }, 5: { step: 3, acc: '' }, 6: { step: 3, acc: '#' }, 7: { step: 4, acc: '' },
        8: { step: 4, acc: '#' }, 9: { step: 5, acc: '' }, 10: { step: 6, acc: '' }, 11: { step: 6, acc: 'n' }
    },
    'Bb': {
        0: { step: 0, acc: '' }, 1: { step: 0, acc: '#' }, 2: { step: 1, acc: '' }, 3: { step: 2, acc: '' },
        4: { step: 2, acc: 'n' }, 5: { step: 3, acc: '' }, 6: { step: 3, acc: '#' }, 7: { step: 4, acc: '' },
        8: { step: 4, acc: '#' }, 9: { step: 5, acc: '' }, 10: { step: 6, acc: '' }, 11: { step: 6, acc: 'n' }
    }
};

class ScoreRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.offscreen = null;
        this.offCtx = null;
        this.tracks = [];
        this.tempo = 120;
        this.timeSignature = [4, 4];
        this.keySignature = 'C'; // 預設使用 C 大調
        this.currentTime = 0;
        this.onSeek = null;
        this.animFrame = null;
        this.measuresPerLine = 4;
        this.totalMeasures = 1;
        this.totalLines = 1;
        
        this.lastTracks = null;
        this.lastOptions = null;
        this.notationModel = null;
        
        // 渲染模式：'engraving' (正式黑色出版譜，使用 trackColor 做低干擾輔助)
        //            'track' (多音軌彩色譜，音符頭直接以音軌色彩上色)
        this.colorMode = 'engraving'; 

        // 預設與 app.js 相同的軌道色彩庫，確保隨機顏色的一致性
        this.trackColors = [
            '#6366f1', '#ec4899', '#f59e0b', '#10b981',
            '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6',
            '#f97316', '#84cc16', '#06b6d4', '#d946ef',
            '#22c55e', '#eab308', '#64748b', '#a855f7',
        ];

        this.config = {
            bgColor: '#fbf7eb', // 優雅淡象牙白紙張背景
            paperShadow: 'rgba(77, 60, 36, 0.05)',
            staffColor: '#38342e', // 深炭黑色五線譜，極細精準
            noteColor: '#171717', // 接近出版級的純黑色音符
            highlightColor: 'rgba(214, 55, 55, 0.14)',
            playheadColor: 'rgba(214, 55, 55, 0.6)', // 播放游標
            staffSpacing: 10, // 五線譜線與線的垂直半距 (5線總高度 40px)
            noteRadius: 4.2, // 音符半徑
            lineHeight: 0.8, // 五線譜線寬
            leftMargin: 90, // 譜表左側預留寬度（放置大譜表連線、譜號、調號）
            rightMargin: 40,
            measureWidthMin: 220, // 最小小節寬度
            lineSpacing: 160, // 行與行之間的間距
            grandGap: 56, // 高音譜表與低音譜表間的間隔
            topPadding: 40,
            bottomPadding: 32,
            stemLength: 26, // 符桿長度
        };
    }

    setTheme() {}
    setTimeSignature(n, d) { this.timeSignature = [n, d]; }
    setTempo(t) { this.tempo = t; }
    setKeySignature(key) { this.keySignature = key || 'C'; }

    /**
     * 渲染多軌道資料
     */
    renderTracks(tracks, options = {}) {
        if (!tracks || tracks.length === 0) {
            if (this._resizeFn) {
                window.removeEventListener('resize', this._resizeFn);
                this._resizeFn = null;
            }
            this.container.innerHTML = '<div style="text-align:center;padding:60px;color:#86918a;font-size:14px;">勾選軌道以顯示樂譜</div>';
            this.tracks = [];
            this.canvas = null;
            this.ctx = null;
            this.offscreen = null;
            this.offCtx = null;
            this.notationModel = null;
            this.lastTracks = null;
            this.lastOptions = null;
            this.totalMeasures = 1;
            this.totalLines = 1;
            return;
        }

        this.tracks = tracks;
        this.lastTracks = tracks;
        this.lastOptions = options;
        this.tempo = options.tempo || 120;

        // 步驟 1: 將 MIDI 軌道音符合併、量化並建立 notation model
        this.notationModel = this.prepareNotationModel(tracks, this.tempo);
        this.totalMeasures = this.notationModel.totalMeasures;

        // 步驟 2: 計算版面（自動換行與拉伸小節寬度）
        const { width, height } = this.layoutSystems(
            this.notationModel.chords,
            this.notationModel.rests,
            this.totalMeasures
        );

        // 步驟 3: 解決多聲部、音符頭與休止符碰撞
        this.resolveCollisions(this.notationModel.chords, this.notationModel.rests);

        // 步驟 4: 初始化畫布
        this.setupCanvas(width, height);
        this.bindResize();
        
        // 步驟 5: 執行繪製
        this.drawFrame();
    }

    render(notes, options = {}) {
        this.renderTracks([{ notes, name: '', color: this.config.noteColor }], options);
    }

    /**
     * 繪製整個樂譜畫面到離屏畫布，然後同步至顯示畫布
     */
    drawFrame() {
        if (!this.canvas || !this.notationModel) return;

        const width = parseInt(this.canvas.style.width, 10);
        const height = parseInt(this.canvas.style.height, 10);
        const ctx = this.offCtx;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = this.config.bgColor;
        ctx.fillRect(0, 0, width, height);

        // 繪製紙質感底紋
        this.drawPaperGuides(ctx, width, height);

        // 繪製每一行的譜表、譜號、調號與拍號
        for (let line = 0; line < this.totalLines; line++) {
            this.drawStaff(ctx, line);
            this.drawClefs(ctx, line);
            this.drawKeySignature(ctx, line);
            this.drawTimeSignature(ctx, line);
            
            // 繪製行首小節編號
            const firstM = this.lines[line][0];
            const measureNumber = firstM + 1;
            const trebleTopY = this.getSystemTop(line);
            ctx.save();
            ctx.font = '600 11px Inter, sans-serif';
            ctx.fillStyle = '#7f7668';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(`${measureNumber}`, this.measureX[firstM], trebleTopY - 10);
            ctx.restore();
        }

        // 繪製垂直小節線與最後終止線
        this.drawMeasureLines(ctx, this.totalMeasures);

        // 繪製音軌高亮氣泡（在音符後方襯托）
        this.drawTrackHighlights(ctx, this.notationModel.chords);

        // 繪製休止符
        this.drawRests(ctx, this.notationModel.rests);

        // 繪製音群 Beam 連線
        this.drawBeams(ctx, this.notationModel.chords);

        // 繪製常規音符頭、符桿與臨時記號
        this.drawNotes(ctx, this.notationModel.chords);

        // 繪製跨拍延音線
        this.drawTies(ctx, this.notationModel.chords);

        // 繪製播放紅色指針
        this.drawPlayhead(ctx);

        // 同步雙緩衝離屏畫布內容到主螢幕
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.drawImage(this.offscreen, 0, 0, width, height);
    }

    /**
     * 步驟 1: 將原始 MIDI tracks/notes 轉成可繪製的樂譜資料模型
     */
    prepareNotationModel(tracks, tempo) {
        // 1.1 整理 tracks 確保 metadata 完整
        const normalizedTracks = this.normalizeTracks(tracks);

        // 自動偵測調性 (Key Signature Detection)
        const allRawNotes = [];
        normalizedTracks.forEach(t => {
            if (t.visible) allRawNotes.push(...t.notes);
        });
        const detectedKey = this.detectKeySignature(allRawNotes);
        this.setKeySignature(detectedKey);
        console.log(`[ScoreRenderer] 自動辨識並套用調號: ${detectedKey} Major`);

        // 1.2 量化音符 (使用混和式 16分音符/三連音 量化)
        const allQuantizedNotes = [];
        normalizedTracks.forEach(track => {
            if (!track.visible) return;
            const quantized = this.quantizeNotes(track.notes, track, tempo);
            allQuantizedNotes.push(...quantized);
        });

        // 1.3 為每個音符分發所屬譜表 (treble / bass)
        this.assignStaff(normalizedTracks, allQuantizedNotes);

        // 1.4 為多聲部(多軌道)分配 voiceIndex
        this.assignVoices(allQuantizedNotes);

        // 1.5 將同聲部、同時間點音符歸類為 chord
        const chords = this.groupChords(allQuantizedNotes);

        // 1.6 產生音軌級休止符以補齊靜音空白
        const rests = this.generateRests(normalizedTracks, allQuantizedNotes, tempo);

        // 1.7 計算樂曲的總小節數
        const beatsPerMeasure = this.timeSignature[0];
        let maxBeat = 0;
        allQuantizedNotes.forEach(n => {
            if (n.startBeat + n.durationBeat > maxBeat) {
                maxBeat = n.startBeat + n.durationBeat;
            }
        });
        const totalMeasures = Math.max(1, Math.ceil(maxBeat / beatsPerMeasure));

        return {
            tracks: normalizedTracks,
            chords,
            rests,
            totalMeasures
        };
    }

    /**
     * 整理軌道，加入 trackId 與確保色彩穩定性
     */
    normalizeTracks(tracks) {
        if (!tracks) return [];
        return tracks.map((track, i) => {
            const trackId = track.trackId || track.name || `track-${i}`;
            const trackName = track.name || `Track ${i + 1}`;
            const trackColor = track.color || this.trackColors[i % this.trackColors.length] || '#171717';
            const visible = track.visible !== false;
            return {
                trackId,
                trackName,
                trackColor,
                visible,
                notes: track.notes || []
            };
        });
    }

    /**
     * 自動偵測 MIDI 的音高調性 (C, G, D, F, Bb Major)
     */
    detectKeySignature(notes) {
        if (!notes || notes.length === 0) return 'C';

        // 統計 12 個半音的頻率
        const counts = new Array(12).fill(0);
        notes.forEach(note => {
            counts[note.pitch % 12]++;
        });

        // 定義 C, G, D, F, Bb 大調的自然音階半音集合
        const scales = {
            'C': [0, 2, 4, 5, 7, 9, 11], // C D E F G A B
            'G': [7, 9, 11, 0, 2, 4, 6], // G A B C D E F#
            'D': [2, 4, 6, 7, 9, 11, 1], // D E F# G A B C#
            'F': [5, 7, 9, 10, 0, 2, 4], // F G A Bb C D E
            'Bb': [10, 0, 2, 3, 5, 7, 9] // Bb C D Eb F G A
        };

        let bestKey = 'C';
        let maxScore = -1;

        for (const [key, scale] of Object.entries(scales)) {
            let score = 0;
            scale.forEach(pc => {
                score += counts[pc];
            });

            // 加上些微權重，偏向升降音符較少的主調
            if (key === 'C') score *= 1.05;

            if (score > maxScore) {
                maxScore = score;
                bestKey = key;
            }
        }

        return bestKey;
    }

    /**
     * 混和式網格量化：自動判斷音符更接近 16分音符 (0.25) 還是三連音 (0.333) 網格
     */
    quantizeBeat(beat) {
        const sixteenthGrid = Math.round(beat / 0.25) * 0.25;
        const tripletGrid = Math.round(beat / 0.33333) * 0.33333;
        const d1 = Math.abs(beat - sixteenthGrid);
        const d2 = Math.abs(beat - tripletGrid);

        // 如果明顯更貼近三連音（設有 0.03 的偏向判定容差），則採用三連音
        if (d2 < d1 - 0.03) {
            return parseFloat(tripletGrid.toFixed(4));
        }
        return sixteenthGrid;
    }

    /**
     * 將 MIDI note 的時間量化為混和式節拍網格
     */
    quantizeNotes(notes, track, tempo) {
        const secondsPerBeat = 60 / tempo;
        const beatsPerMeasure = this.timeSignature[0];

        return notes.map(note => {
            const startBeat = note.time / secondsPerBeat;
            const durationBeat = note.duration / secondsPerBeat;

            // 透過量化器處理起點與時值
            let qStart = this.quantizeBeat(startBeat);
            let qDuration = this.quantizeBeat(durationBeat);
            if (qDuration < 0.25) qDuration = 0.25;

            // 計算所屬小節與小節內的起點
            const measureIndex = Math.floor(qStart / beatsPerMeasure);
            const beatIndex = parseFloat((qStart % beatsPerMeasure).toFixed(4));

            return {
                trackId: track.trackId,
                trackName: track.trackName,
                trackColor: track.trackColor,
                channel: track.channel || 0,
                pitch: note.pitch,
                startBeat: qStart,
                durationBeat: qDuration,
                velocity: note.velocity !== undefined ? note.velocity : 90,
                measureIndex,
                beatIndex,
                visible: track.visible,
                originalNote: note // 保留原始 MIDI note 作為播放高亮依據
            };
        });
    }

    /**
     * 判斷音符要放在高音譜表 (treble) 或低音譜表 (bass)
     */
    assignStaff(tracks, notes) {
        const trackAverages = {};
        tracks.forEach(track => {
            const trackNotes = notes.filter(n => n.trackId === track.trackId);
            if (trackNotes.length === 0) {
                trackAverages[track.trackId] = 60;
                return;
            }
            const sum = trackNotes.reduce((acc, n) => acc + n.pitch, 0);
            trackAverages[track.trackId] = sum / trackNotes.length;
        });

        notes.forEach(note => {
            const avg = trackAverages[note.trackId];
            if (avg < 53) {
                // 如果是低音軌道（如貝斯），則整軌偏向低音譜表，除非音特別高
                note.staff = note.pitch > 67 ? 'treble' : 'bass';
            } else if (avg > 67) {
                // 高音軌道
                note.staff = note.pitch < 48 ? 'bass' : 'treble';
            } else {
                // 一般混合音軌，以中央 C（MIDI 60）為界
                note.staff = note.pitch >= 60 ? 'treble' : 'bass';
            }
        });
    }

    /**
     * 根據每個譜表內的不同音軌，分配聲部 index (voiceIndex)
     */
    assignVoices(notes) {
        const trebleTrackIds = Array.from(new Set(notes.filter(n => n.staff === 'treble').map(n => n.trackId)));
        const bassTrackIds = Array.from(new Set(notes.filter(n => n.staff === 'bass').map(n => n.trackId)));

        notes.forEach(note => {
            if (note.staff === 'treble') {
                note.voiceIndex = trebleTrackIds.indexOf(note.trackId);
            } else {
                note.voiceIndex = bassTrackIds.indexOf(note.trackId);
            }
        });
    }

    /**
     * 合併和弦：只有同一 track、同一 staff、同一 voice、同一時間點的 notes，才可以合併成 chord
     */
    groupChords(notes) {
        const chords = [];
        const chordMap = {};

        notes.forEach(note => {
            const key = `${note.trackId}_${note.staff}_${note.voiceIndex}_${note.startBeat}`;
            if (!chordMap[key]) {
                chordMap[key] = {
                    trackId: note.trackId,
                    trackName: note.trackName,
                    trackColor: note.trackColor,
                    staff: note.staff,
                    voiceIndex: note.voiceIndex,
                    startBeat: note.startBeat,
                    durationBeat: note.durationBeat,
                    measureIndex: note.measureIndex,
                    beatIndex: note.beatIndex,
                    visible: note.visible,
                    isBeamed: false,
                    notes: []
                };
                chords.push(chordMap[key]);
            }
            chordMap[key].notes.push(note);
            if (note.durationBeat > chordMap[key].durationBeat) {
                chordMap[key].durationBeat = note.durationBeat;
            }
        });

        // 排序和弦內部的音高（從小到大）
        chords.forEach(chord => {
            chord.notes.sort((a, b) => a.pitch - b.pitch);
        });

        return chords;
    }

    /**
     * 貪婪法拆解靜音長度，轉換為對應時值的休止符陣列
     */
    getRestComponents(duration) {
        let remaining = duration;
        const components = [];
        const sizes = [4, 2, 1, 0.5, 0.25]; // 全休止符(4拍)、二分(2拍)、四分(1拍)、八分(0.5拍)、十六分(0.25拍)
        for (const size of sizes) {
            while (remaining >= size - 0.01) {
                components.push(size);
                remaining -= size;
            }
        }
        return components;
    }

    /**
     * 為各音軌生成休止符，避免畫面缺乏節奏對比
     */
    generateRests(tracks, quantizedNotes, tempo) {
        const rests = [];
        const beatsPerMeasure = this.timeSignature[0];

        // 尋找最後一拍的拍數
        let maxBeat = 0;
        quantizedNotes.forEach(n => {
            if (n.startBeat + n.durationBeat > maxBeat) {
                maxBeat = n.startBeat + n.durationBeat;
            }
        });
        const totalMeasures = Math.max(1, Math.ceil(maxBeat / beatsPerMeasure));

        tracks.forEach(track => {
            const trackNotes = quantizedNotes.filter(n => n.trackId === track.trackId);
            if (trackNotes.length === 0) return;

            ['treble', 'bass'].forEach(staff => {
                const staffNotes = trackNotes.filter(n => n.staff === staff);
                if (staffNotes.length === 0) return; // 該軌在該譜表無音符，不生成休止符以免繁雜

                const voiceIndex = staffNotes[0].voiceIndex;

                for (let m = 0; m < totalMeasures; m++) {
                    const measureStartBeat = m * beatsPerMeasure;
                    const measureEndBeat = measureStartBeat + beatsPerMeasure;

                    // 找出落在此小節範圍內的音符
                    const mNotes = staffNotes.filter(n => n.startBeat < measureEndBeat && (n.startBeat + n.durationBeat) > measureStartBeat);

                    if (mNotes.length === 0) {
                        // 整小節靜音：添加一個全休止符
                        rests.push({
                            type: 'rest',
                            trackId: track.trackId,
                            trackName: track.trackName,
                            trackColor: track.trackColor,
                            staff,
                            voiceIndex,
                            startBeat: measureStartBeat,
                            durationBeat: beatsPerMeasure,
                            measureIndex: m,
                            beatIndex: 0,
                            visible: track.visible
                        });
                        continue;
                    }

                    // 收集被音符佔據的區間
                    const segments = mNotes.map(n => {
                        return {
                            s: Math.max(measureStartBeat, n.startBeat),
                            e: Math.min(measureEndBeat, n.startBeat + n.durationBeat)
                        };
                    });

                    // 排序並合併相交區間
                    segments.sort((a, b) => a.s - b.s);
                    const merged = [];
                    segments.forEach(seg => {
                        if (merged.length === 0) {
                            merged.push(seg);
                        } else {
                            const last = merged[merged.length - 1];
                            if (seg.s <= last.e) {
                                last.e = Math.max(last.e, seg.e);
                            } else {
                                merged.push(seg);
                            }
                        }
                    });

                    // 尋找區間之間的空隙
                    let current = measureStartBeat;
                    const gaps = [];
                    merged.forEach(seg => {
                        if (seg.s > current + 0.01) {
                            gaps.push({ s: current, e: seg.s });
                        }
                        current = Math.max(current, seg.e);
                    });
                    if (current < measureEndBeat - 0.01) {
                        gaps.push({ s: current, e: measureEndBeat });
                    }

                    // 將空隙填補上合適時值的休止符
                    gaps.forEach(gap => {
                        const gapDur = gap.e - gap.s;
                        const components = this.getRestComponents(gapDur);
                        let restStart = gap.s;
                        components.forEach(dur => {
                            const mIndex = Math.floor(restStart / beatsPerMeasure);
                            const bIndex = restStart % beatsPerMeasure;
                            rests.push({
                                type: 'rest',
                                trackId: track.trackId,
                                trackName: track.trackName,
                                trackColor: track.trackColor,
                                staff,
                                voiceIndex,
                                startBeat: restStart,
                                durationBeat: dur,
                                measureIndex: mIndex,
                                beatIndex: bIndex,
                                visible: track.visible
                            });
                            restStart += dur;
                        });
                    });
                }
            });
        });

        return rests;
    }

    /**
     * 步驟 2: 計算每一小節在不同行的寬度、坐標以及自動換行拉伸
     */
    layoutSystems(chords, rests, totalMeasures) {
        const parent = this.container.parentElement;
        const parentWidth = parent ? parent.clientWidth : 960;
        const parentStyles = parent ? window.getComputedStyle(parent) : null;
        const horizontalPadding = parentStyles
            ? (parseFloat(parentStyles.paddingLeft) || 0) + (parseFloat(parentStyles.paddingRight) || 0)
            : 48;
        const contentWidth = Math.max(320, parentWidth - horizontalPadding);
        const usableWidth = Math.max(this.config.measureWidthMin, contentWidth - this.config.leftMargin - this.config.rightMargin);

        // 2.1 計算每個小節的自然寬度（基於音符密集度）
        const naturalWidths = [];
        const beatsPerMeasure = this.timeSignature[0];

        for (let m = 0; m < totalMeasures; m++) {
            const mChords = chords.filter(c => c.measureIndex === m && c.visible);
            // 找出小節內有多少種起點時間
            const uniqueBeats = new Set(mChords.map(c => c.startBeat));
            const density = Math.max(1, uniqueBeats.size);
            const activeTracks = new Set(mChords.map(c => c.trackId));
            const trackMultiplier = activeTracks.size > 2 ? 1.2 : 1.0;

            const naturalWidth = (120 + density * 24) * trackMultiplier;
            naturalWidths.push(naturalWidth);
        }

        // 2.2 貪婪折行
        const lines = [];
        let currentLine = [];
        let currentWidth = 0;

        for (let m = 0; m < totalMeasures; m++) {
            const w = naturalWidths[m];
            if (currentLine.length === 0) {
                currentLine.push(m);
                currentWidth += w;
            } else {
                if (currentWidth + w > usableWidth * 1.15) {
                    lines.push(currentLine);
                    currentLine = [m];
                    currentWidth = w;
                } else {
                    currentLine.push(m);
                    currentWidth += w;
                }
            }
        }
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }

        this.totalLines = lines.length;
        this.lines = lines;

        // 2.3 縮放與對齊每一行的小節
        const measureWidths = new Array(totalMeasures).fill(0);
        const measureX = new Array(totalMeasures).fill(0);
        const measureLineIndex = new Array(totalMeasures).fill(0);

        lines.forEach((lineMeasures, lineIdx) => {
            const sumNaturalWidth = lineMeasures.reduce((acc, m) => acc + naturalWidths[m], 0);
            const scale = usableWidth / sumNaturalWidth;

            let currentX = this.config.leftMargin;
            lineMeasures.forEach(m => {
                measureWidths[m] = naturalWidths[m] * scale;
                measureX[m] = currentX;
                measureLineIndex[m] = lineIdx;
                currentX += measureWidths[m];
            });
        });

        this.measureWidths = measureWidths;
        this.measureX = measureX;
        this.measureLineIndex = measureLineIndex;

        // 2.4 計算總寬高
        const systemHeight = this.getSystemHeight();
        const width = this.config.leftMargin + usableWidth + this.config.rightMargin;
        const height = this.config.topPadding + (this.totalLines - 1) * this.config.lineSpacing + systemHeight + this.config.bottomPadding;

        // 2.5 設定音符絕對坐標
        const halfSpacing = this.config.staffSpacing / 2;

        chords.forEach(c => {
            if (!c.visible) return;
            const m = c.measureIndex;
            const line = measureLineIndex[m];
            const mX = measureX[m];
            const mW = measureWidths[m];

            // 小節開頭預留空間，以防止音符貼在小節線上
            const leftPadding = (m === 0) ? 44 : 20;
            const rightPadding = 12;

            const progress = c.beatIndex / beatsPerMeasure;
            const xInMeasure = leftPadding + progress * (mW - leftPadding - rightPadding);

            c.x = mX + xInMeasure;

            const staffTopY = c.staff === 'treble' ? this.getSystemTop(line) : this.getBassTop(this.getSystemTop(line));

            c.notes.forEach(note => {
                const offsetSteps = this.getStaffOffsetSteps(note.pitch, c.staff === 'treble');
                note.x = c.x;
                note.y = staffTopY + offsetSteps * halfSpacing;
                note.offsetSteps = offsetSteps;
                note.staffTopY = staffTopY;
                note.line = line;
            });

            c.y = c.notes.reduce((acc, n) => acc + n.y, 0) / c.notes.length;
            c.line = line;
            c.staffTopY = staffTopY;
        });

        // 2.6 設定休止符絕對坐標
        rests.forEach(r => {
            if (!r.visible) return;
            const m = r.measureIndex;
            const line = measureLineIndex[m];
            const mX = measureX[m];
            const mW = measureWidths[m];

            const leftPadding = (m === 0) ? 44 : 20;
            const rightPadding = 12;

            const progress = r.beatIndex / beatsPerMeasure;
            const xInMeasure = leftPadding + progress * (mW - leftPadding - rightPadding);

            r.x = mX + xInMeasure;

            const staffTopY = r.staff === 'treble' ? this.getSystemTop(line) : this.getBassTop(this.getSystemTop(line));
            r.y = staffTopY + 4 * halfSpacing; // 預設第三線
            r.line = line;
        });

        return { width, height };
    }

    /**
     * 步驟 3: 解決多軌道、聲部以及相鄰音程（二度音程）的碰撞問題
     */
    resolveCollisions(chords, rests) {
        // 3.1 同時發生的不同聲部和弦，做水平位移
        const chordGroups = {};
        chords.forEach(c => {
            if (!c.visible) return;
            const key = `${c.staff}_${c.startBeat}`;
            if (!chordGroups[key]) chordGroups[key] = [];
            chordGroups[key].push(c);
        });

        Object.values(chordGroups).forEach(group => {
            if (group.length <= 1) {
                group.forEach(c => { c.xOffset = 0; });
                return;
            }
            // 依聲部 index 排序，並給予微幅的水平交錯，以利辨識
            group.sort((a, b) => a.voiceIndex - b.voiceIndex);
            group.forEach((c, idx) => {
                let offset = 0;
                if (idx === 1) offset = 8;
                else if (idx === 2) offset = -8;
                else if (idx > 2) offset = 16 * (idx - 1);
                
                c.xOffset = offset;
                c.x += offset; // 直接位移和弦的基礎坐標，使得符桿與連線均能對齊
            });
            // 套用新的 x 坐標到 notes 身上
            group.forEach(c => {
                c.notes.forEach(note => {
                    note.x = c.x;
                });
            });
        });

        // 3.2 和弦內相鄰二度音程音符頭交錯 offset
        chords.forEach(c => {
            c.notes.forEach(note => { note.xOffset = 0; });
            const stemDown = this.determineStemDirection(c, chords);
            for (let i = 0; i < c.notes.length - 1; i++) {
                const note1 = c.notes[i];
                const note2 = c.notes[i + 1];
                const step1 = this.getDiatonicIndex(note1.pitch);
                const step2 = this.getDiatonicIndex(note2.pitch);
                if (Math.abs(step2 - step1) === 1) {
                    if (stemDown) {
                        // 符桿向下時：低音符 (note1) 往左偏，高音符 (note2) 保持原位
                        note1.xOffset = -9;
                        note1.x -= 9;
                    } else {
                        // 符桿向上時：高音符 (note2) 往右偏，低音符 (note1) 保持原位
                        note2.xOffset = 9;
                        note2.x += 9;
                    }
                }
            }
        });

        // 3.3 解決休止符碰撞（不同聲部的休止符垂直挪開，避免疊重）
        const restGroups = {};
        rests.forEach(r => {
            if (!r.visible) return;
            const key = `${r.staff}_${r.startBeat}`;
            if (!restGroups[key]) restGroups[key] = [];
            restGroups[key].push(r);
        });

        Object.values(restGroups).forEach(group => {
            if (group.length <= 1) {
                group.forEach(r => { r.yOffset = 0; r.xOffset = 0; });
                return;
            }
            group.sort((a, b) => a.voiceIndex - b.voiceIndex);
            group.forEach((r, idx) => {
                if (idx === 0) {
                    r.yOffset = -22; // 第一個偏上移
                    r.xOffset = 0;
                } else if (idx === 1) {
                    r.yOffset = 22;  // 第二個偏下移
                    r.xOffset = 0;
                } else {
                    r.yOffset = 0;
                    r.xOffset = 12 * (idx - 1); // 其餘水平橫移
                }
                r.y += r.yOffset;
                r.x += r.xOffset;
            });
        });
    }

    /**
     * 繪製五線譜基線（Treble & Bass 雙譜表）
     */
    drawStaff(ctx, line) {
        const { leftMargin, staffSpacing, lineHeight, staffColor } = this.config;
        
        // 算出該行（System）的實際總寬度
        const lineMeasures = this.lines[line];
        const systemWidth = lineMeasures.reduce((acc, m) => acc + this.measureWidths[m], 0);

        const trebleTopY = this.getSystemTop(line);
        const bassTopY = this.getBassTop(trebleTopY);

        ctx.save();
        ctx.strokeStyle = staffColor;
        ctx.lineWidth = lineHeight;

        // 五線譜線條繪製時，從 leftMargin - 60 (以涵蓋 clef 與括線) 直至行尾
        const startX = leftMargin - 60;
        const endX = leftMargin + systemWidth;

        // 繪製高音與低音譜表線
        for (let i = 0; i < 5; i++) {
            const yOffset = i * staffSpacing;
            
            ctx.beginPath();
            ctx.moveTo(startX, trebleTopY + yOffset);
            ctx.lineTo(endX, trebleTopY + yOffset);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(startX, bassTopY + yOffset);
            ctx.lineTo(endX, bassTopY + yOffset);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * 繪製大譜表左側的鋼琴大括線（Piano Brace）
     */
    drawPianoBrace(ctx, trebleTopY, bassTopY) {
        const x = this.config.leftMargin - 60;
        const yStart = trebleTopY;
        const yEnd = bassTopY + 4 * this.config.staffSpacing;
        const midY = (yStart + yEnd) / 2;

        ctx.save();
        ctx.strokeStyle = this.config.noteColor;
        
        // 繪製粗左側直線
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, yStart);
        ctx.lineTo(x, yEnd);
        ctx.stroke();

        // 繪製精緻的貝氏曲線大括線
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        // 上半弧度
        ctx.moveTo(x, yStart);
        ctx.bezierCurveTo(x - 12, yStart, x - 12, midY - 10, x - 2, midY);
        // 下半弧度
        ctx.bezierCurveTo(x - 12, midY + 10, x - 12, yEnd, x, yEnd);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * 繪製向量 SVG clef
     */
    drawClef(ctx, pathString, x, y, scaleX, scaleY, offsetTranslateY = 0) {
        ctx.save();
        ctx.translate(x, y + offsetTranslateY);
        ctx.scale(scaleX, scaleY);
        const path = new Path2D(pathString);
        ctx.fillStyle = this.config.noteColor;
        ctx.fill(path);
        ctx.restore();
    }

    drawTrebleClef(ctx, x, staffTopY) {
        // 高音譜表 G4 位於第二線，在此作縮放對齊
        this.drawClef(ctx, TREBLE_CLEF_PATH, x, staffTopY, 0.58, 0.58);
    }

    drawBassClef(ctx, x, staffTopY) {
        // 低音譜表 F3 位於第四線，在此作縮放對齊
        const scale = 0.36;
        this.drawClef(ctx, BASS_CLEF_PATH, x, staffTopY + 10, scale, scale, -36.5 * scale);
    }

    drawClefs(ctx, line) {
        const trebleTopY = this.getSystemTop(line);
        const bassTopY = this.getBassTop(trebleTopY);

        this.drawPianoBrace(ctx, trebleTopY, bassTopY);
        this.drawTrebleClef(ctx, this.config.leftMargin - 52, trebleTopY);
        this.drawBassClef(ctx, this.config.leftMargin - 50, bassTopY);
    }

    /**
     * 繪製拍號 (numerator / denominator)
     */
    drawTimeSignature(ctx, line) {
        if (line !== 0) return; // 僅在行 0（第一小節開頭）顯示拍號

        const { leftMargin, staffSpacing, noteColor } = this.config;
        const trebleTopY = this.getSystemTop(line);
        const bassTopY = this.getBassTop(trebleTopY);
        
        // 畫在 clef 與調號後方
        const x = leftMargin + 10;

        ctx.save();
        ctx.fillStyle = noteColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 20px "Times New Roman", Georgia, serif';

        // 高音譜表拍號
        ctx.fillText(String(this.timeSignature[0]), x, trebleTopY + 10);
        ctx.fillText(String(this.timeSignature[1]), x, trebleTopY + 30);

        // 低音譜表拍號
        ctx.fillText(String(this.timeSignature[0]), x, bassTopY + 10);
        ctx.fillText(String(this.timeSignature[1]), x, bassTopY + 30);

        ctx.restore();
    }

    /**
     * 繪製調號
     */
    drawKeySignature(ctx, line) {
        const key = this.keySignature || 'C';
        const config = KEY_SIGNATURES[key];
        if (!config || (config.sharps === 0 && config.flats === 0)) return;

        const { leftMargin, staffSpacing } = this.config;
        const trebleTopY = this.getSystemTop(line);
        const bassTopY = this.getBassTop(trebleTopY);
        const halfSpacing = staffSpacing / 2;

        // 放在 clef 後方、bar line 前方
        let startX = leftMargin - 26;

        ctx.save();
        if (config.sharps > 0) {
            config.trebleSteps.forEach((step, idx) => {
                const x = startX + idx * 8;
                this.drawSharp(ctx, x, trebleTopY + step * halfSpacing);
            });
            config.bassSteps.forEach((step, idx) => {
                const x = startX + idx * 8;
                this.drawSharp(ctx, x, bassTopY + step * halfSpacing);
            });
        } else if (config.flats > 0) {
            config.trebleSteps.forEach((step, idx) => {
                const x = startX + idx * 8;
                this.drawFlat(ctx, x, trebleTopY + step * halfSpacing);
            });
            config.bassSteps.forEach((step, idx) => {
                const x = startX + idx * 8;
                this.drawFlat(ctx, x, bassTopY + step * halfSpacing);
            });
        }
        ctx.restore();
    }

    /**
     * 繪製升記號 ♯
     */
    drawSharp(ctx, x, y) {
        ctx.save();
        ctx.strokeStyle = this.config.noteColor;
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        // 斜橫線
        ctx.beginPath();
        ctx.moveTo(x - 4, y - 2);
        ctx.lineTo(x + 4, y - 4);
        ctx.moveTo(x - 4, y + 3);
        ctx.lineTo(x + 4, y + 1);
        ctx.stroke();

        // 粗豎線（微幅向右傾斜）
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(x - 1.8, y - 6.5);
        ctx.lineTo(x - 2.2, y + 6.5);
        ctx.moveTo(x + 1.8, y - 5.5);
        ctx.lineTo(x + 1.4, y + 7.5);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * 繪製降記號 ♭
     */
    drawFlat(ctx, x, y) {
        ctx.save();
        ctx.strokeStyle = this.config.noteColor;
        ctx.fillStyle = this.config.noteColor;
        ctx.lineWidth = 1.1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        // 豎符桿
        ctx.moveTo(x, y - 9.5);
        ctx.lineTo(x, y + 2);
        // 降音符鼓起的肚皮
        ctx.bezierCurveTo(x + 3.8, y + 2, x + 4.8, y - 0.8, x + 3.8, y - 2.8);
        ctx.bezierCurveTo(x + 2.8, y - 4.8, x, y - 2.8, x, y - 2.8);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }

    /**
     * 繪製還原記號 ♮
     */
    drawNatural(ctx, x, y) {
        ctx.save();
        ctx.strokeStyle = this.config.noteColor;
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'miter';

        ctx.beginPath();
        // 左豎線
        ctx.moveTo(x - 2, y - 6.5);
        ctx.lineTo(x - 2, y + 2.5);
        // 右豎線
        ctx.moveTo(x + 2, y - 2.5);
        ctx.lineTo(x + 2, y + 6.5);
        // 上斜橫線
        ctx.moveTo(x - 2, y - 2.5);
        ctx.lineTo(x + 2, y - 2.5);
        // 下斜橫線
        ctx.moveTo(x - 2, y + 2.5);
        ctx.lineTo(x + 2, y + 2.5);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * 繪製小節線與最後一小節的終止線
     */
    drawMeasureLines(ctx, totalMeasures) {
        const { leftMargin, staffSpacing, staffColor } = this.config;

        ctx.save();
        ctx.strokeStyle = staffColor;

        for (let line = 0; line < this.totalLines; line++) {
            const trebleTopY = this.getSystemTop(line);
            const bassTopY = this.getBassTop(trebleTopY);
            const trebleBottomY = trebleTopY + 4 * staffSpacing;
            const bassBottomY = bassTopY + 4 * staffSpacing;

            const lineMeasures = this.lines[line];
            if (!lineMeasures || lineMeasures.length === 0) continue;

            // 1. 每行起點繪製小節線（連結高音與低音譜表）
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(leftMargin, trebleTopY);
            ctx.lineTo(leftMargin, bassBottomY);
            ctx.stroke();

            // 2. 繪製小節內與小節間的分隔線
            lineMeasures.forEach((m, idx) => {
                const isLastOfLine = (idx === lineMeasures.length - 1);
                const isLastOfSong = (m === totalMeasures - 1);
                const barX = this.measureX[m] + this.measureWidths[m];

                if (isLastOfSong) {
                    // 終止線（一細一粗雙線）
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(barX - 4.5, trebleTopY);
                    ctx.lineTo(barX - 4.5, bassBottomY);
                    ctx.stroke();

                    ctx.lineWidth = 2.8;
                    ctx.beginPath();
                    ctx.moveTo(barX - 1.4, trebleTopY);
                    ctx.lineTo(barX - 1.4, bassBottomY);
                    ctx.stroke();
                } else if (isLastOfLine) {
                    // 行末小節線連結上下譜表
                    ctx.lineWidth = 1.3;
                    ctx.beginPath();
                    ctx.moveTo(barX, trebleTopY);
                    ctx.lineTo(barX, bassBottomY);
                    ctx.stroke();
                } else {
                    // 譜表內部小節線，中間空隙不連，視覺上極為精緻
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    // 高音譜表小節線
                    ctx.moveTo(barX, trebleTopY);
                    ctx.lineTo(barX, trebleBottomY);
                    // 低音譜表小節線
                    ctx.moveTo(barX, bassTopY);
                    ctx.lineTo(barX, bassBottomY);
                    ctx.stroke();
                }
            });
        }
        ctx.restore();
    }

    /**
     * 繪製加線 (Ledger Lines)
     */
    drawLedgerLines(ctx, x, staffTopY, offsetSteps, color) {
        const halfSpacing = this.config.staffSpacing / 2;
        const lineWidth = this.config.noteRadius * 3.0;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.1;

        if (offsetSteps < 0) {
            // 上方加線（偶數步）
            for (let step = -2; step >= offsetSteps; step -= 2) {
                const y = staffTopY + step * halfSpacing;
                ctx.beginPath();
                ctx.moveTo(x - lineWidth / 2, y);
                ctx.lineTo(x + lineWidth / 2, y);
                ctx.stroke();
            }
        } else if (offsetSteps > 8) {
            // 下方加線
            for (let step = 10; step <= offsetSteps; step += 2) {
                const y = staffTopY + step * halfSpacing;
                ctx.beginPath();
                ctx.moveTo(x - lineWidth / 2, y);
                ctx.lineTo(x + lineWidth / 2, y);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    /**
     * 判斷非 Beam 時的符桿方向
     */
    determineStemDirection(chord, allChords) {
        // 檢查同小節、同拍是否有多個聲部同時存在
        const hasOtherVoices = allChords.some(c => 
            c.visible && 
            c !== chord && 
            c.staff === chord.staff && 
            c.measureIndex === chord.measureIndex && 
            Math.abs(c.startBeat - chord.startBeat) < 0.1
        );

        if (hasOtherVoices) {
            // 聲部 0 優先符桿向上，其餘向下，完美避免重合
            if (chord.voiceIndex === 0) return false; // UP (stemDown = false)
            if (chord.voiceIndex === 1) return true;  // DOWN (stemDown = true)
        }

        // 單聲部預設規則：高於中線符桿向下，低於中線符桿向上
        const avgOffset = chord.notes.reduce((acc, n) => acc + n.offsetSteps, 0) / chord.notes.length;
        return avgOffset < 4; // steps 越小音越高
    }

    /**
     * 繪製符尾（非 Beam 時的 8分 或 16分音符旗幟）
     */
    drawFlag(ctx, stemX, stemEndY, stemDown, durationBeat) {
        ctx.save();
        ctx.strokeStyle = this.config.noteColor;
        ctx.fillStyle = this.config.noteColor;
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        const dir = stemDown ? -1 : 1; // 符尾指向 notehead 方向

        // 繪製第一片旗尾
        ctx.beginPath();
        ctx.moveTo(stemX, stemEndY);
        ctx.bezierCurveTo(stemX + 4.5, stemEndY + 3 * dir, stemX + 7, stemEndY + 9 * dir, stemX + 5.5, stemEndY + 13 * dir);
        ctx.stroke();

        // 16分音符增繪第二片旗尾
        if (durationBeat <= 0.28) {
            const shift = 4 * dir;
            ctx.beginPath();
            ctx.moveTo(stemX, stemEndY + shift);
            ctx.bezierCurveTo(stemX + 4.5, stemEndY + shift + 3 * dir, stemX + 7, stemEndY + shift + 9 * dir, stemX + 5.5, stemEndY + shift + 13 * dir);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * 繪製休止符
     */
    drawRestSymbol(ctx, type, x, y) {
        ctx.save();
        ctx.strokeStyle = this.config.noteColor;
        ctx.fillStyle = this.config.noteColor;
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const staffSpacing = this.config.staffSpacing;

        if (type === 4) {
            // 全休止符：掛在第四線下方 (即 y - staffSpacing)
            const topY = y - staffSpacing;
            ctx.fillRect(x - 5.5, topY, 11, 5);
        } else if (type === 2) {
            // 二分休止符：坐於第三線上方
            ctx.fillRect(x - 5.5, y - 5, 11, 5);
        } else if (type === 1) {
            // 四分休止符：閃電狀曲線
            ctx.beginPath();
            ctx.moveTo(x - 3, y - 8);
            ctx.lineTo(x + 2.5, y - 5);
            ctx.lineTo(x - 2.5, y - 1);
            ctx.lineTo(x + 2, y + 2.5);
            ctx.bezierCurveTo(x + 2.8, y + 4.2, x + 0.5, y + 7.5, x - 2.5, y + 6.8);
            ctx.stroke();
        } else if (type === 0.5) {
            // 八分休止符：帶有一球斜線
            ctx.beginPath();
            ctx.arc(x - 1.8, y - 2.5, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x - 1.8, y - 0.7);
            ctx.bezierCurveTo(x + 1.8, y - 3, x + 1.8, y - 4.5, x - 1.8, y - 2.5);
            ctx.moveTo(x + 1.8, y - 3.8);
            ctx.lineTo(x - 1.8, y + 5.5);
            ctx.stroke();
        } else if (type === 0.25) {
            // 十六分休止符：雙球斜線
            ctx.beginPath();
            ctx.arc(x - 2.4, y - 4.5, 1.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x - 2.4, y - 2.9);
            ctx.bezierCurveTo(x + 0.8, y - 5, x + 0.8, y - 6.5, x - 2.4, y - 4.5);
            
            ctx.arc(x - 3.2, y + 0.5, 1.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x - 3.2, y + 2.1);
            ctx.bezierCurveTo(x, y, x, y - 1.5, x - 3.2, y + 0.5);
            
            ctx.moveTo(x + 1.6, y - 5.8);
            ctx.lineTo(x - 2.4, y + 7.5);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawRests(ctx, rests) {
        rests.forEach(r => {
            if (!r.visible) return;
            this.drawRestSymbol(ctx, r.durationBeat, r.x, r.y);

            // 休止符下方繪製音軌代表點，讓使用者一眼看清聲部歸屬
            ctx.save();
            ctx.fillStyle = r.trackColor;
            ctx.beginPath();
            ctx.arc(r.x, r.y + 11, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    /**
     * 繪製音群連線 (Beams)
     */
    drawBeams(ctx, chords) {
        const groups = {};

        // 將 8分 與 16分音符歸組（以每 1 拍為 Beam 單位，不跨小節，不跨軌道，不跨聲部）
        chords.forEach(c => {
            if (!c.visible) return;
            if (c.durationBeat >= 0.9) return;

            const beatGroupIndex = Math.floor(c.startBeat);
            const key = `${c.line}_${c.staff}_${c.trackId}_${c.voiceIndex}_${c.measureIndex}_${beatGroupIndex}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(c);
        });

        Object.values(groups).forEach(group => {
            if (group.length < 2) return;

            // 依水平順序排列
            group.sort((a, b) => a.x - b.x);

            // 統計音高平均，決定整個連線符桿的朝向
            const avgY = group.reduce((acc, c) => acc + c.y, 0) / group.length;
            const middleY = group[0].staff === 'treble' 
                ? this.getSystemTop(group[0].line) + 20 
                : this.getBassTop(this.getSystemTop(group[0].line)) + 20;
            const stemUp = avgY >= middleY;

            // 決定原始符桿端點
            const stemEnds = group.map(c => {
                const headY = stemUp 
                    ? Math.min(...c.notes.map(n => n.y))
                    : Math.max(...c.notes.map(n => n.y));
                const naturalEnd = stemUp ? headY - 24 : headY + 24;
                return { c, headY, naturalEnd };
            });

            // 以首尾音符端點計算 Beam 斜率與位置
            const first = stemEnds[0];
            const last = stemEnds[stemEnds.length - 1];

            let beamY0 = first.naturalEnd;
            let beamYN = last.naturalEnd;

            // 限制最大斜率，防止 Beam 傾斜過度
            const maxSlope = 0.12;
            const dx = last.c.x - first.c.x;
            if (dx > 0) {
                let slope = (beamYN - beamY0) / dx;
                if (Math.abs(slope) > maxSlope) {
                    slope = Math.sign(slope) * maxSlope;
                    beamYN = beamY0 + slope * dx;
                }
            }

            // 微調 Beam 高度以確保符桿不會太短 (不小於 20px)
            stemEnds.forEach((se) => {
                const progress = dx > 0 ? (se.c.x - first.c.x) / dx : 0;
                const beamY = beamY0 + progress * (beamYN - beamY0);

                if (stemUp) {
                    if (beamY > se.headY - 20) {
                        const diff = beamY - (se.headY - 20);
                        beamY0 -= diff;
                        beamYN -= diff;
                    }
                } else {
                    if (beamY < se.headY + 20) {
                        const diff = (se.headY + 20) - beamY;
                        beamY0 += diff;
                        beamYN += diff;
                    }
                }
            });

            ctx.save();
            ctx.fillStyle = this.config.noteColor;
            ctx.strokeStyle = this.config.noteColor;

            const beamThickness = 3.6;

            // 繪製主要第一軌 Beam
            ctx.beginPath();
            if (stemUp) {
                ctx.moveTo(first.c.x + this.config.noteRadius - 0.4, beamY0);
                ctx.lineTo(last.c.x + this.config.noteRadius - 0.4, beamYN);
                ctx.lineTo(last.c.x + this.config.noteRadius - 0.4, beamYN + beamThickness);
                ctx.lineTo(first.c.x + this.config.noteRadius - 0.4, beamY0 + beamThickness);
            } else {
                ctx.moveTo(first.c.x - this.config.noteRadius + 0.4, beamY0 - beamThickness);
                ctx.lineTo(last.c.x - this.config.noteRadius + 0.4, beamYN - beamThickness);
                ctx.lineTo(last.c.x - this.config.noteRadius + 0.4, beamYN);
                ctx.lineTo(first.c.x - this.config.noteRadius + 0.4, beamY0);
            }
            ctx.fill();

            // 若有 16分音符，增繪第二軌輔助 Beam
            const has16ths = group.some(c => c.durationBeat <= 0.28);
            if (has16ths) {
                const shift = stemUp ? 5.2 : -5.2;
                ctx.beginPath();
                if (stemUp) {
                    ctx.moveTo(first.c.x + this.config.noteRadius - 0.4, beamY0 + shift);
                    ctx.lineTo(last.c.x + this.config.noteRadius - 0.4, beamYN + shift);
                    ctx.lineTo(last.c.x + this.config.noteRadius - 0.4, beamYN + shift + beamThickness);
                    ctx.lineTo(first.c.x + this.config.noteRadius - 0.4, beamY0 + shift + beamThickness);
                } else {
                    ctx.moveTo(first.c.x - this.config.noteRadius + 0.4, beamY0 + shift - beamThickness);
                    ctx.lineTo(last.c.x - this.config.noteRadius + 0.4, beamYN + shift - beamThickness);
                    ctx.lineTo(last.c.x - this.config.noteRadius + 0.4, beamYN + shift);
                    ctx.lineTo(first.c.x - this.config.noteRadius + 0.4, beamY0 + shift);
                }
                ctx.fill();
            }

            // 繪製和弦所有音符到 Beam 的符桿連線
            ctx.lineWidth = 1.1;
            stemEnds.forEach(se => {
                const progress = dx > 0 ? (se.c.x - first.c.x) / dx : 0;
                const beamY = beamY0 + progress * (beamYN - beamY0);
                const stemX = stemUp 
                    ? se.c.x + this.config.noteRadius - 0.4
                    : se.c.x - this.config.noteRadius + 0.4;

                se.c.notes.forEach(note => {
                    ctx.beginPath();
                    ctx.moveTo(stemX, note.y);
                    ctx.lineTo(stemX, beamY);
                    ctx.stroke();
                });

                se.c.isBeamed = true; // 註記已完成 Beam 連線，避免重複繪製一般符桿
            });

            ctx.restore();
        });
    }

    /**
     * 繪製音符頭、常規符桿與標誌
     */
    drawNotes(ctx, chords) {
        const keySig = this.keySignature || 'C';

        chords.forEach(c => {
            if (!c.visible) return;

            const stemDown = this.determineStemDirection(c, chords);

            // 1. 繪製加線
            c.notes.forEach(note => {
                const isPlaying = this.isHighlighted(note);
                const strokeColor = isPlaying ? '#be2d23' : (this.colorMode === 'track' ? note.trackColor : this.config.noteColor);
                this.drawLedgerLines(ctx, note.x, note.staffTopY, note.offsetSteps, strokeColor);
            });

            // 2. 繪製非 Beam 音符的常規符桿
            if (!c.isBeamed) {
                const needsStem = c.durationBeat < 3.5; // 全音符不繪符桿
                if (needsStem) {
                    ctx.save();
                    ctx.strokeStyle = this.config.noteColor;
                    ctx.lineWidth = 1.1;

                    let stemX, stemStartY, stemEndY;
                    if (stemDown) {
                        stemX = c.x - this.config.noteRadius + 0.4;
                        stemStartY = Math.min(...c.notes.map(n => n.y)) + 1;
                        stemEndY = Math.max(...c.notes.map(n => n.y)) + this.config.stemLength;
                    } else {
                        stemX = c.x + this.config.noteRadius - 0.4;
                        stemStartY = Math.max(...c.notes.map(n => n.y)) - 1;
                        stemEndY = Math.min(...c.notes.map(n => n.y)) - this.config.stemLength;
                    }

                    ctx.beginPath();
                    ctx.moveTo(stemX, stemStartY);
                    ctx.lineTo(stemX, stemEndY);
                    ctx.stroke();

                    // 繪製符尾旗幟
                    if (c.durationBeat <= 0.5) {
                        this.drawFlag(ctx, stemX, stemEndY, stemDown, c.durationBeat);
                    }
                    ctx.restore();
                }
            }

            // 3. 繪製橢圓音符頭與臨時記號、附點
            c.notes.forEach(note => {
                const beats = note.durationBeat;
                const wholeNote = beats >= 3.5;
                const openHead = !wholeNote && beats >= 1.75;
                const isPlaying = this.isHighlighted(note);

                let headFill, headStroke;
                if (isPlaying) {
                    headFill = wholeNote || openHead ? this.config.bgColor : '#be2d23';
                    headStroke = '#be2d23';
                } else if (this.colorMode === 'track') {
                    headFill = wholeNote || openHead ? this.config.bgColor : note.trackColor;
                    headStroke = note.trackColor;
                } else {
                    // engraving 模式下音符主要為黑色，但音符外框使用 trackColor 代表所屬聲部
                    headFill = wholeNote || openHead ? this.config.bgColor : this.config.noteColor;
                    headStroke = note.trackColor || this.config.noteColor;
                }

                ctx.save();
                ctx.beginPath();
                const radius = isPlaying ? this.config.noteRadius * 1.15 : this.config.noteRadius;
                // 傾斜的橢圓音符頭，極具專業樂譜刻印質感
                ctx.ellipse(note.x, note.y, radius, radius * 0.72, -0.32, 0, Math.PI * 2);
                ctx.fillStyle = headFill;
                ctx.strokeStyle = headStroke;
                ctx.lineWidth = (this.colorMode === 'engraving' && !isPlaying) ? 2.0 : (openHead || wholeNote ? 1.6 : 1.1);
                ctx.fill();
                ctx.stroke();
                ctx.restore();

                // 4. 繪製臨時記號
                const { accidental } = this.getNoteDiatonicAndAccidental(note.pitch, keySig);
                if (accidental) {
                    const accX = c.x - this.config.noteRadius - 8;
                    if (accidental === '#') this.drawSharp(ctx, accX, note.y);
                    else if (accidental === 'b') this.drawFlat(ctx, accX, note.y);
                    else if (accidental === 'n') this.drawNatural(ctx, accX, note.y);
                }

                // 5. 繪製附點（三分或六分時值等）
                const dotted = Math.abs(beats - 1.5) < 0.05 || 
                               Math.abs(beats - 3.0) < 0.05 || 
                               Math.abs(beats - 0.75) < 0.05;
                if (dotted) {
                    ctx.save();
                    ctx.fillStyle = isPlaying ? '#be2d23' : (this.colorMode === 'track' ? note.trackColor : this.config.noteColor);
                    // 若音符在線條上，附點微微往上偏移至間隙，防止與五線譜重疊看不清
                    const dotY = (note.offsetSteps % 2 === 0) ? note.y - 2.8 : note.y;
                    ctx.beginPath();
                    ctx.arc(note.x + this.config.noteRadius + 4.8, dotY, 1.6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });
        });
    }

    /**
     * 繪製延音線 (Ties)
     */
    drawTies(ctx, chords) {
        const allNotes = [];
        chords.forEach(c => {
            c.notes.forEach(n => {
                allNotes.push({ ...n, chord: c });
            });
        });

        // 依時間排序
        allNotes.sort((a, b) => a.startBeat - b.startBeat);

        ctx.save();
        ctx.strokeStyle = this.config.noteColor;
        ctx.lineWidth = 1.0;

        for (let i = 0; i < allNotes.length; i++) {
            const n1 = allNotes[i];

            for (let j = i + 1; j < allNotes.length; j++) {
                const n2 = allNotes[j];
                // 若超出起點太遠則中斷搜尋
                if (n2.startBeat > n1.startBeat + n1.durationBeat + 0.1) break;

                // 若 pitch、音軌、聲部相同，且起止點完美吻合，則連結延音線
                if (n2.pitch === n1.pitch && 
                    n2.trackId === n1.trackId && 
                    n2.staff === n1.staff &&
                    Math.abs(n2.startBeat - (n1.startBeat + n1.durationBeat)) < 0.06) {

                    const x1 = n1.chord.x;
                    const y1 = n1.y;
                    const x2 = n2.chord.x;
                    const y2 = n2.y;

                    // 若音高低於五線譜中線，弧線向上拱；反之向下
                    const curveUp = n1.offsetSteps > 4;

                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2 + (curveUp ? -7 : 7);

                    ctx.beginPath();
                    ctx.moveTo(x1 + 3.5, y1 + (curveUp ? -2.2 : 2.2));
                    ctx.quadraticCurveTo(midX, midY, x2 - 3.5, y2 + (curveUp ? -2.2 : 2.2));
                    ctx.stroke();
                    break;
                }
            }
        }
        ctx.restore();
    }

    /**
     * 繪製音軌色彩輔助提示（僅在 engraving 模式下繪製極淡的柔和背景光）
     */
    drawTrackHighlights(ctx, chords) {
        chords.forEach(c => {
            if (!c.visible) return;
            c.notes.forEach(note => {
                const isPlaying = this.isHighlighted(note);

                if (isPlaying) {
                    // 播放中音符：背景使用 0.18 透明度的軌道色彩，低調舒適
                    ctx.save();
                    ctx.fillStyle = this.hexToRgba(note.trackColor, 0.18);
                    ctx.fillRect(note.x - 5.5, note.y - 11, 11, 22);
                    ctx.restore();
                } else if (this.colorMode === 'engraving') {
                    // 正式模式下：在音符頭後方襯以 0.08 極淡色彩，防止混亂
                    ctx.save();
                    ctx.fillStyle = this.hexToRgba(note.trackColor, 0.08);
                    ctx.beginPath();
                    ctx.arc(note.x, note.y, this.config.noteRadius * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });
        });
    }

    /**
     * 繪製播放游標與頂端倒三角形
     */
    drawPlayhead(ctx) {
        if (this.currentTime <= 0 || this.totalLines === 0 || !this.lines || this.lines.length === 0) return;

        const beatsPerMeasure = this.timeSignature[0];
        const currentBeat = this.currentTime * this.tempo / 60;
        const measureFloat = currentBeat / beatsPerMeasure;
        const measureIndex = Math.floor(measureFloat);

        if (measureIndex >= this.totalMeasures) return;

        const line = this.measureLineIndex[measureIndex];
        if (line === undefined || line < 0 || line >= this.totalLines) return;

        const mX = this.measureX[measureIndex];
        const mW = this.measureWidths[measureIndex];

        const leftPadding = (measureIndex === 0) ? 44 : 20;
        const rightPadding = 12;
        const progress = measureFloat - measureIndex;

        // 計算對齊音符的 X 坐標
        const x = mX + leftPadding + progress * (mW - leftPadding - rightPadding);

        const trebleTopY = this.getSystemTop(line);
        const bassTopY = this.getBassTop(trebleTopY);
        const bassBottomY = bassTopY + 4 * this.config.staffSpacing;

        ctx.save();
        ctx.strokeStyle = this.config.playheadColor;
        ctx.lineWidth = 1.3;

        // 直游標
        ctx.beginPath();
        ctx.moveTo(x, trebleTopY - 6);
        ctx.lineTo(x, bassBottomY + 6);
        ctx.stroke();

        // 倒三角指標
        ctx.fillStyle = this.config.playheadColor;
        ctx.beginPath();
        ctx.moveTo(x - 3.5, trebleTopY - 6);
        ctx.lineTo(x + 3.5, trebleTopY - 6);
        ctx.lineTo(x, trebleTopY - 1.5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    drawTrackLegend() {
        // 已整合至 app.js DOM 的左側音軌清單 UI，此處保留做為結構完整性
        console.log("Track legend is integrated with app.js DOM UI.");
    }

    drawPlayheadOnCtx(ctx) {
        this.drawPlayhead(ctx);
    }

    /**
     * 紙張底紋繪製（正式樂譜不畫雜亂色塊，僅保留輕微紙質感）
     */
    drawPaperGuides(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = this.config.paperShadow;
        for (let y = 20; y < height; y += 30) {
            ctx.fillRect(0, y, width, 1);
        }
        ctx.restore();
    }

    setupCanvas(width, height) {
        const dpr = window.devicePixelRatio || 1;

        this.container.innerHTML = '';
        this.canvas = document.createElement('canvas');
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.canvas.style.cursor = 'pointer';
        this.container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(dpr, dpr);

        this.offscreen = document.createElement('canvas');
        this.offscreen.width = width * dpr;
        this.offscreen.height = height * dpr;
        this.offCtx = this.offscreen.getContext('2d');
        this.offCtx.scale(dpr, dpr);

        this.bindClick();
    }

    bindResize() {
        if (this._resizeFn) window.removeEventListener('resize', this._resizeFn);
        this._resizeFn = () => {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(() => {
                if (this.lastTracks) this.renderTracks(this.lastTracks, this.lastOptions);
            }, 120);
        };
        window.addEventListener('resize', this._resizeFn);
    }

    /**
     * 畫布點擊 Seek 定位邏輯（適配動態小節拉伸）
     */
    bindClick() {
        if (!this.canvas) return;
        this.canvas.addEventListener('click', event => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const line = Math.max(0, Math.min(this.totalLines - 1, Math.floor((y - this.config.topPadding) / this.config.lineSpacing)));
            
            const lineMeasures = this.lines[line];
            if (!lineMeasures || lineMeasures.length === 0) return;

            // 尋找被點擊的小節
            let targetMeasure = -1;
            let relX = -1;
            for (const m of lineMeasures) {
                const startX = this.measureX[m];
                const endX = startX + this.measureWidths[m];
                if (x >= startX && x <= endX) {
                    targetMeasure = m;
                    relX = x - startX;
                    break;
                }
            }

            if (targetMeasure !== -1 && relX >= 0) {
                const mW = this.measureWidths[targetMeasure];
                const leftPadding = (targetMeasure === 0) ? 44 : 20;
                const rightPadding = 12;

                // 反推點擊比例與時間
                const usableW = mW - leftPadding - rightPadding;
                const progress = Math.max(0, Math.min(1.0, (relX - leftPadding) / usableW));

                const beatsPerMeasure = this.timeSignature[0];
                const totalMeasure = targetMeasure + progress;
                const secondsPerBeat = 60 / this.tempo;
                const time = totalMeasure * beatsPerMeasure * secondsPerBeat;

                if (this.onSeek) this.onSeek(time);
            }
        });
    }

    updatePlayhead(time) {
        this.currentTime = time;
        if (!this._lastDraw || Date.now() - this._lastDraw > 30) {
            this._lastDraw = Date.now();
            this.drawFrame();
        }
    }

    clear() {
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        if (this._resizeFn) {
            window.removeEventListener('resize', this._resizeFn);
            this._resizeFn = null;
        }
        this.container.innerHTML = '';
        this.tracks = [];
        this.canvas = null;
        this.ctx = null;
        this.offscreen = null;
        this.offCtx = null;
        this.currentTime = 0;
        this.lastTracks = null;
        this.lastOptions = null;
        this.totalMeasures = 1;
        this.totalLines = 1;
    }

    /* === 工具函式 === */

    getMeasureDuration() {
        return this.timeSignature[0] * (60 / this.tempo);
    }

    getSystemHeight() {
        return 8 * this.config.staffSpacing + this.config.grandGap;
    }

    getSystemTop(line) {
        return this.config.topPadding + line * this.config.lineSpacing;
    }

    getBassTop(trebleTopY) {
        return trebleTopY + 4 * this.config.staffSpacing + this.config.grandGap;
    }

    getDesiredMeasureWidth(contentWidth) {
        if (contentWidth >= 1400) return 400;
        if (contentWidth >= 1120) return 350;
        if (contentWidth >= 840) return 300;
        if (contentWidth >= 640) return 270;
        return 240;
    }

    getStaffOffsetSteps(midi, isTreble) {
        const topIndex = isTreble ? this.getDiatonicIndex(77) : this.getDiatonicIndex(57);
        return topIndex - this.getDiatonicIndex(midi);
    }

    getNoteDiatonicAndAccidental(midi, keySig = 'C') {
        const keyMap = KEY_MAPS[keySig] || KEY_MAPS['C'];
        const pitchClass = ((midi % 12) + 12) % 12;
        const octave = Math.floor(midi / 12) - 1;
        const info = keyMap[pitchClass];
        const diatonicIndex = octave * 7 + info.step;
        return {
            diatonicIndex,
            accidental: info.acc
        };
    }

    getDiatonicIndex(midi) {
        const keySig = this.keySignature || 'C';
        const { diatonicIndex } = this.getNoteDiatonicAndAccidental(midi, keySig);
        return diatonicIndex;
    }

    getInkColor(color) {
        return this.mixHexColors(color, this.config.noteColor, 0.38);
    }

    mixHexColors(primary, secondary, ratio) {
        const a = this.hexToRgb(primary) || { r: 26, g: 35, b: 50 };
        const b = this.hexToRgb(secondary) || { r: 23, g: 23, b: 23 };
        const mix = channel => Math.round(a[channel] * ratio + b[channel] * (1 - ratio));
        return `rgb(${mix('r')}, ${mix('g')}, ${mix('b')})`;
    }

    hexToRgb(color) {
        if (!color || typeof color !== 'string') return null;
        const hex = color.replace('#', '');
        if (hex.length !== 6) return null;
        const value = Number.parseInt(hex, 16);
        if (Number.isNaN(value)) return null;
        return {
            r: (value >> 16) & 255,
            g: (value >> 8) & 255,
            b: value & 255,
        };
    }

    hexToRgba(hex, alpha) {
        const rgb = this.hexToRgb(hex) || { r: 23, g: 23, b: 23 };
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }

    /**
     * 判斷音符是否處於目前播放高亮時間內
     */
    isHighlighted(note) {
        const orig = note.originalNote;
        if (!orig) return false;
        const time = this.currentTime;
        return time >= orig.time - 0.03 && time <= orig.time + orig.duration + 0.03;
    }
}

window.ScoreRenderer = ScoreRenderer;
