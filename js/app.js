const SAMPLE_MIDIS = {
    "simple-scale.mid": "TVRoZAAAAAYAAQACAGBNVHJrAAAAIgD/AwtUZW1wbyBUcmFjawD/UQMHoSAA/1gEBAIYCAD/LwBNVHJrAAAATgD/AwZNZWxvZHkAkDxaYIA8AACQPlpggD4AAJBAWmCAQAAAkEFaYIBBAACQQ1pggEMAAJBFWmCARQAAkEdaYIBHAACQSFpggEgAAP8vAA==",
    "chord-test.mid": "TVRoZAAAAAYAAQACAGBNVHJrAAAAIgD/AwtUZW1wbyBUcmFjawD/UQMJJ8AA/1gEBAIYCAD/LwBNVHJrAAAAcgD/AwZDaG9yZHMAkDxfAJBAXwCQQ1+BQIA8AACAQAAAgEMAAJA7WgCQPloAkENagUCAOwAAgD4AAIBDAACQOVUAkDxVAJBBVYFAgDkAAIA8AACAQQAAkDxfAJBAXwCQQ1+BQIA8AACAQAAAgEMAAP8vAA==",
    "multi-track-demo.mid": "TVRoZAAAAAYAAQADAGBNVHJrAAAAIgD/AwtUZW1wbyBUcmFjawD/UQMIUq8A/1gEBAIYCAD/LwBNVHJrAAAAOAD/AwxNZWxvZHkgVHJhY2sAkEBkgUCAQAAAkENkgUCAQwAAkEVkgUCARQAAkENkgUCAQwAA/y8ATVRyawAAAD4A/wMSQmFzcyBBY2NvbXBhbmltZW50AJAwUIFAgDAAAJA0UIFAgDQAAJA1UIFAgDUAAJAwUIFAgDAAAP8vAA==",
    "pedal-demo.mid": "TVRoZAAAAAYAAQACAGBNVHJrAAAAIgD/AwtUZW1wbyBUcmFjawD/UQMJiWgA/1gEBAIYCAD/LwBNVHJrAAAASQD/Aw1QaWFubyAmIFBlZGFsALBAfwCQPFqBQIA8AACQQFqBQIBAAACQQ1qBQIBDAACwQAAKsEB/dpBIWoFAgEgAALBAAAD/LwA=",
    "dense-midi-test.mid": "TVRoZAAAAAYAAQACAGBNVHJrAAAAIgD/AwtUZW1wbyBUcmFjawD/UQMGihsA/1gEBAIYCAD/LwBNVHJrAAAFIwD/AwtEZW5zZSBUcmFjawCQPFAwgDwAAJA/VTCAPwAAkEJaMIBCAACQRV8wgEUAAJA8ZDCAPAAAkD9pMIA/AACQQm4wgEIAAJBFczCARQBAkDBGAJA0RoFAgDAAAIA0AACQPlAwgD4AAJBBVTCAQQAAkERaMIBEAACQR18wgEcAAJA+ZDCAPgAAkEFpMIBBAACQRG4wgEQAAJBHczCARwBAkDNGAJA3RoFAgDMAAIA3AACQPlAwgD4AAJBBVTCAQQAAkERaMIBEAACQR18wgEcAAJA+ZDCAPgAAkEFpMIBBAACQRG4wgEQAAJBHczCARwBAkDZGAJA6RoFAgDYAAIA6AACQQFAwgEAAAJBDVTCAQwAAkEZaMIBGAACQSV8wgEkAAJBAZDCAQAAAkENpMIBDAACQRm4wgEYAAJBJczCASQBAkDBGAJA0RoFAgDAAAIA0AACQQlAwgEIAAJBFVTCARQAAkEhaMIBIAACQS18wgEsAAJBCZDCAQgAAkEVpMIBFAACQSG4wgEgAAJBLczCASwBAkDNGAJA3RoFAgDMAAIA3AACQPFAwgDwAAJA/VTCAPwAAkEJaMIBCAACQRV8wgEUAAJA8ZDCAPAAAkD9pMIA/AACQQm4wgEIAAJBFczCARQBAkDZGAJA6RoFAgDYAAIA6AACQPlAwgD4AAJBBVTCAQQAAkERaMIBEAACQR18wgEcAAJA+ZDCAPgAAkEFpMIBBAACQRG4wgEQAAJBHczCARwBAkDBGAJA0RoFAgDAAAIA0AACQQFAwgEAAAJBDVTCAQwAAkEZaMIBGAACQSV8wgEkAAJBAZDCAQAAAkENpMIBDAACQRm4wgEYAAJBJczCASQBAkDNGAJA3RoFAgDMAAIA3AACQQlAwgEIAAJBFVTCARQAAkEhaMIBIAACQS18wgEsAAJBCZDCAQgAAkEVpMIBFAACQSG4wgEgAAJBLczCASwBAkDZGAJA6RoFAgDYAAIA6AACQPFAwgDwAAJA/VTCAPwAAkEJaMIBCAACQRV8wgEUAAJA8ZDCAPAAAkD9pMIA/AACQQm4wgEIAAJBFczCARQBAkDBGAJA0RoFAgDAAAIA0AACQPlAwgD4AAJBBVTCAQQAAkERaMIBEAACQR18wgEcAAJA+ZDCAPgAAkEFpMIBBAACQRG4wgEQAAJBHczCARwBAkDNGAJA3RoFAgDMAAIA3AACQQFAwgEAAAJBDVTCAQwAAkEZaMIBGAACQSV8wgEkAAJBAZDCAQAAAkENpMIBDAACQRm4wgEYAAJBJczCASQBAkDZGAJA6RoFAgDYAAIA6AACQQlAwgEIAAJBFVTCARQAAkEhaMIBIAACQS18wgEsAAJBCZDCAQgAAkEVpMIBFAACQSG4wgEgAAJBLczCASwBAkDBGAJA0RoFAgDAAAIA0AAD/LwA="
};

/**
 * 主應用程式 - 優化版
 */
class PianoScoreApp {
    constructor() {
        this.midiParser = new MidiParser();
        this.scoreRenderer = new ScoreRenderer('score');
        this.audioPlayer = new AudioPlayer();

        this.el = {
            uploadArea: document.getElementById('upload-area'),
            fileInput: document.getElementById('file-input'),
            btnPlay: document.getElementById('btn-play'),
            btnStop: document.getElementById('btn-stop'),
            progress: document.getElementById('progress'),
            speedSelect: document.getElementById('speed-select'),
            volumeSlider: document.getElementById('volume'),
            btnNewFile: document.getElementById('btn-new-file'),
            btnTheme: document.getElementById('btn-theme'),
            iconSun: document.getElementById('icon-sun'),
            iconMoon: document.getElementById('icon-moon'),
            nowPlaying: document.getElementById('now-playing'),
            nowPlayingText: document.getElementById('now-playing-text'),
            mainContent: document.getElementById('main-content'),
            timeTotal: document.getElementById('time-total'),
            timeCurrent: document.getElementById('time-current'),
            trackList: document.getElementById('track-list'),
            trackCount: document.getElementById('track-count'),
            fileInfo: document.getElementById('file-info'),
            playIcon: document.getElementById('play-icon'),
            pauseIcon: document.getElementById('pause-icon'),
            btnExportPng: document.getElementById('btn-export-png'),
            btnShowSamples: document.getElementById('btn-show-samples'),
            sampleList: document.getElementById('sample-list'),
            scoreModeSelect: document.getElementById('score-mode-select'),
            debugOverlayCheckbox: document.getElementById('debug-overlay-checkbox'),
        };

        this.midiData = null;
        this.audioInitialized = false;
        this.currentTheme = 'dark';
        this.checkedTracks = new Set();
        this.trackColors = [
            '#6366f1', '#ec4899', '#f59e0b', '#10b981',
            '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6',
            '#f97316', '#84cc16', '#06b6d4', '#d946ef',
            '#22c55e', '#eab308', '#64748b', '#a855f7',
        ];

        this.initTheme();
        this.bindEvents();
        this.setupCallbacks();
    }

    initTheme() {
        const t = localStorage.getItem('theme') || 'dark';
        this.setTheme(t);
    }

    setTheme(t) {
        this.currentTheme = t;
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        this.el.iconSun.classList.toggle('hidden', t !== 'dark');
        this.el.iconMoon.classList.toggle('hidden', t !== 'light');
    }

    async initAudio() {
        if (this.audioInitialized) return;
        try {
            await Tone.start();
            await this.audioPlayer.init();
            this.audioInitialized = true;
        } catch (e) { console.error('音頻啟動失敗:', e); }
    }

    bindEvents() {
        const { uploadArea, fileInput, btnPlay, btnStop, progress, speedSelect, volumeSlider, btnNewFile, btnTheme } = this.el;

        uploadArea.addEventListener('click', e => {
            if (e.target.closest('.upload-btn') || !e.target.closest('button')) fileInput.click();
        });
        uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
        uploadArea.addEventListener('drop', e => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files.length) this.loadMidiFile(e.dataTransfer.files[0]);
        });
        fileInput.addEventListener('change', e => { if (e.target.files[0]) this.loadMidiFile(e.target.files[0]); });

        btnPlay.addEventListener('click', async () => { await this.initAudio(); this.togglePlay(); });
        btnStop.addEventListener('click', () => this.stopPlayback());

        progress.parentElement.addEventListener('click', e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            this.audioPlayer.seekTo(pct * this.audioPlayer.duration);
        });

        speedSelect.addEventListener('change', e => this.audioPlayer.setSpeed(parseFloat(e.target.value)));
        volumeSlider.addEventListener('input', e => this.audioPlayer.setVolume(parseInt(e.target.value) / 100));
        btnNewFile.addEventListener('click', () => this.resetApp());
        btnTheme.addEventListener('click', () => this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark'));

        document.addEventListener('keydown', async e => {
            if (e.code === 'Space') { e.preventDefault(); await this.initAudio(); this.togglePlay(); }
        });

        // 樂譜模式切換
        this.el.scoreModeSelect.addEventListener('change', e => {
            this.scoreRenderer.colorMode = e.target.value;
            this.renderScore();
        });

        // Debug Overlay 切換
        this.el.debugOverlayCheckbox.addEventListener('change', e => {
            this.scoreRenderer.debugMode = e.target.checked;
            this.scoreRenderer.drawFrame();
        });

        // 匯出 PNG
        this.el.btnExportPng.addEventListener('click', () => {
            this.exportPng();
        });

        // 展開範例選單
        this.el.btnShowSamples.addEventListener('click', e => {
            e.stopPropagation();
            this.el.sampleList.classList.toggle('hidden');
        });

        // 點擊載入範例
        this.el.sampleList.querySelectorAll('.btn-sample').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const filename = btn.getAttribute('data-sample');
                this.loadSampleMidi(filename);
            });
        });
    }

    setupCallbacks() {
        this.audioPlayer.onTimeUpdate = (cur, total) => {
            this.updateProgress(cur, total);
            this.scoreRenderer.updatePlayhead(cur);
        };
        this.audioPlayer.onPlaybackEnd = () => {
            this.updatePlayBtn(false);
            this.el.nowPlaying.classList.add('hidden');
        };
        this.scoreRenderer.onSeek = time => this.audioPlayer.seekTo(time);
    }

    async loadMidiFile(file) {
        if (!file.name.match(/\.(mid|midi)$/i)) { alert('請選擇 MIDI 檔案'); return; }
        try {
            const result = await this.midiParser.loadFromFile(file);
            if (!result.success) { alert(result.error); return; }
            this.currentMidiName = file.name; // 記錄目前 MIDI 檔名
            this.midiData = result.data;
            this.checkedTracks.clear();
            this.midiData.tracks.forEach((t, i) => this.checkedTracks.add(i));
            this.el.uploadArea.classList.add('hidden');
            this.el.mainContent.classList.remove('hidden');
            this.updateUI();
        } catch (e) {
            console.error('載入錯誤:', e);
            alert('載入失敗');
        }
    }

    updateUI() {
        if (!this.midiData) return;
        this.updateTrackList();
        this.updateFileInfo();
        this.el.btnPlay.disabled = false;
        this.el.btnStop.disabled = false;
        this.el.btnExportPng.disabled = false; // 啟用 PNG 匯出按鈕
        this.el.timeTotal.textContent = AudioPlayer.formatTime(this.midiData.duration);
        this.renderScore();
        this.loadCheckedNotes();
    }

    updateTrackList() {
        const { trackList, trackCount } = this.el;
        trackList.innerHTML = '';
        trackCount.textContent = this.midiData.tracks.length;

        this.midiData.tracks.forEach((track, i) => {
            const item = document.createElement('div');
            item.className = 'track-item';
            const color = this.trackColors[i % this.trackColors.length];
            const checked = this.checkedTracks.has(i);

            item.innerHTML = `
                <input type="checkbox" class="track-checkbox" ${checked ? 'checked' : ''}>
                <div class="track-color" style="background:${color}"></div>
                <div class="track-info">
                    <div class="track-name">${track.name || 'Track ' + (i + 1)}</div>
                    <div class="track-instrument">${track.instrument} · ${track.noteCount} 音符</div>
                </div>
            `;

            const cb = item.querySelector('.track-checkbox');
            cb.addEventListener('click', e => e.stopPropagation());
            cb.addEventListener('change', () => this.toggleTrack(i, cb.checked));

            item.addEventListener('click', () => {
                cb.checked = !cb.checked;
                this.toggleTrack(i, cb.checked);
            });

            trackList.appendChild(item);
        });
    }

    toggleTrack(index, checked) {
        if (checked) this.checkedTracks.add(index);
        else this.checkedTracks.delete(index);
        this.renderScore();
        this.loadCheckedNotes();
    }

    updateFileInfo() {
        const d = this.midiData;
        this.el.fileInfo.innerHTML = `
            <div class="file-info-item"><span class="file-info-label">檔案</span><span class="file-info-value">${d.name || '未命名'}</span></div>
            <div class="file-info-item"><span class="file-info-label">時長</span><span class="file-info-value">${AudioPlayer.formatTime(d.duration)}</span></div>
            <div class="file-info-item"><span class="file-info-label">軌道</span><span class="file-info-value">${d.trackCount}</span></div>
            <div class="file-info-item"><span class="file-info-label">速度</span><span class="file-info-value">${d.tempo} BPM</span></div>
            <div class="file-info-item"><span class="file-info-label">拍號</span><span class="file-info-value">${d.timeSignature}</span></div>
        `;
    }

    renderScore() {
        try {
            const tracks = [];
            const sorted = [...this.checkedTracks].sort((a, b) => a - b);
            sorted.forEach(idx => {
                const t = this.midiData.tracks[idx];
                if (t) {
                    tracks.push({
                        notes: t.notes,
                        name: t.name || `Track ${idx + 1}`,
                        color: this.trackColors[idx % this.trackColors.length],
                        pedalEvents: t.pedalEvents || []
                    });
                }
            });

            this.scoreRenderer.setTempo(this.midiData.tempo);
            const [n, d] = this.midiData.timeSignature.split('/').map(Number);
            this.scoreRenderer.setTimeSignature(n, d);
            this.scoreRenderer.renderTracks(tracks, { tempo: this.midiData.tempo });
        } catch (e) { console.error('渲染錯誤:', e); }
    }

    loadCheckedNotes() {
        try {
            const all = [];
            this.checkedTracks.forEach(i => {
                const t = this.midiData.tracks[i];
                if (t) all.push(...t.notes);
            });
            all.sort((a, b) => a.time - b.time);

            const wasPlaying = this.audioPlayer.isPlaying;
            const savedTime = this.audioPlayer.currentTime;
            this.audioPlayer.loadNotes(all, this.midiData.tempo);
            this.el.timeTotal.textContent = AudioPlayer.formatTime(this.audioPlayer.duration);

            if (wasPlaying) {
                this.audioPlayer.seekTo(savedTime);
                this.audioPlayer.play();
            }
        } catch (e) { console.error('載入音符錯誤:', e); }
    }

    async togglePlay() {
        if (this.checkedTracks.size === 0) return;
        if (this.audioPlayer.isPlaying) {
            this.audioPlayer.pause();
            this.updatePlayBtn(false);
            this.el.nowPlaying.classList.add('hidden');
        } else {
            await this.audioPlayer.play();
            this.updatePlayBtn(true);
            this.showNowPlaying();
        }
    }

    showNowPlaying() {
        const names = [];
        this.checkedTracks.forEach(i => {
            const t = this.midiData.tracks[i];
            if (t) names.push(t.name || `Track ${i + 1}`);
        });
        this.el.nowPlayingText.textContent = names.join(', ') || '播放中';
        this.el.nowPlaying.classList.remove('hidden');
    }

    stopPlayback() {
        this.audioPlayer.stop();
        this.updatePlayBtn(false);
        this.updateProgress(0, 0);
        this.scoreRenderer.updatePlayhead(0);
        this.el.nowPlaying.classList.add('hidden');
    }

    updatePlayBtn(playing) {
        this.el.playIcon.classList.toggle('hidden', playing);
        this.el.pauseIcon.classList.toggle('hidden', !playing);
    }

    updateProgress(cur, total) {
        const pct = total > 0 ? (cur / total) * 100 : 0;
        this.el.progress.style.width = pct + '%';
        this.el.timeCurrent.textContent = AudioPlayer.formatTime(cur);
    }

    resetApp() {
        this.audioPlayer.stop();
        this.scoreRenderer.clear();
        this.midiParser = new MidiParser();
        this.midiData = null;
        this.checkedTracks.clear();
        this.currentMidiName = null;
        this.el.mainContent.classList.add('hidden');
        this.el.uploadArea.classList.remove('hidden');
        this.el.sampleList.classList.add('hidden'); // 隱藏範例列表
        this.el.fileInput.value = '';
        this.updatePlayBtn(false);
        this.updateProgress(0, 0);
        this.el.nowPlaying.classList.add('hidden');
        this.el.btnExportPng.disabled = true; // 停用 PNG 匯出按鈕
    }

    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    async loadSampleMidi(filename) {
        try {
            let buffer;
            try {
                // 優先嘗試使用 fetch 取得（若在 HTTP Server 環境下）
                const response = await fetch('samples/' + filename);
                if (!response.ok) throw new Error('Fetch failed');
                buffer = await response.arrayBuffer();
                console.log(`[App] 成功透過 HTTP 讀取範例: ${filename}`);
            } catch (err) {
                // 失敗時使用內嵌 Base64 降級加載（支持 file:// 協議）
                console.warn(`[App] HTTP 讀取失敗，改用內嵌 Base64 載入: ${filename}`);
                const base64 = SAMPLE_MIDIS[filename];
                if (!base64) throw new Error('Missing embedded MIDI data');
                buffer = this.base64ToArrayBuffer(base64);
            }

            const result = await this.midiParser.loadFromBuffer(buffer);
            if (!result.success) { alert(result.error); return; }
            
            this.currentMidiName = filename; // 記錄範例檔名

            this.midiData = result.data;
            this.checkedTracks.clear();
            this.midiData.tracks.forEach((t, i) => this.checkedTracks.add(i));
            
            this.el.uploadArea.classList.add('hidden');
            this.el.mainContent.classList.remove('hidden');
            this.updateUI();
        } catch (e) {
            console.error('載入範例錯誤:', e);
            alert('載入範例失敗');
        }
    }

    exportPng() {
        if (!this.scoreRenderer || !this.scoreRenderer.canvas) return;

        // 1. 暫時關閉 Debug Mode 以確保不影響正式輸出的 PNG
        const originalDebugMode = this.scoreRenderer.debugMode;
        this.scoreRenderer.debugMode = false;

        // 2. 重新渲染無標記的正式樂譜
        this.scoreRenderer.drawFrame();

        // 3. 匯出 PNG Data URL
        const dataUrl = this.scoreRenderer.canvas.toDataURL('image/png');

        // 4. 還原原本的 Debug Mode 並重新繪製畫面
        this.scoreRenderer.debugMode = originalDebugMode;
        this.scoreRenderer.drawFrame();

        // 5. 觸發瀏覽器下載
        let filename = this.currentMidiName || 'score.mid';
        if (!filename.toLowerCase().endsWith('.png')) {
            filename += '.png';
        }

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new PianoScoreApp(); });
