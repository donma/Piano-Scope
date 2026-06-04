/**
 * MIDI 解析模組
 * 負責解析 MIDI 檔案，提取軌道和音符資訊
 */
class MidiParser {
    constructor() {
        this.midi = null;
        this.tracks = [];
    }

    /**
     * 從 File 物件載入 MIDI
     */
    async loadFromFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            return this.loadFromBuffer(arrayBuffer);
        } catch (error) {
            console.error('讀取檔案錯誤:', error);
            return { success: false, error: '無法讀取檔案' };
        }
    }

    /**
     * 從 ArrayBuffer 載入 MIDI
     */
    async loadFromBuffer(buffer) {
        try {
            this.midi = new Midi(buffer);
            this.tracks = this.parseTracks();
            
            if (this.tracks.length === 0) {
                return { success: false, error: '找不到任何音符軌道' };
            }

            return {
                success: true,
                data: this.getMidiInfo()
            };
        } catch (error) {
            console.error('MIDI 解析錯誤:', error);
            return { success: false, error: 'MIDI 檔案格式錯誤' };
        }
    }

    /**
     * 解析所有軌道
     */
    parseTracks() {
        if (!this.midi) return [];

        return this.midi.tracks
            .map((track, index) => {
                const notes = track.notes.map(note => ({
                    pitch: note.midi,
                    name: note.name,
                    duration: note.duration,
                    time: note.time,
                    velocity: note.velocity,
                    ticks: note.ticks,
                    durationTicks: note.durationTicks
                }));

                // 解析 CC 64 延音踏板事件
                const pedalEvents = [];
                const cc64 = track.controlChanges ? (track.controlChanges[64] || track.controlChanges["64"]) : null;
                if (cc64 && Array.isArray(cc64)) {
                    cc64.forEach(cc => {
                        pedalEvents.push({
                            time: cc.time,
                            value: cc.value
                        });
                    });
                }
                pedalEvents.sort((a, b) => a.time - b.time);

                return {
                    index,
                    name: track.name || `Track ${index + 1}`,
                    instrument: this.getInstrumentName(track.instrument?.number || 0),
                    instrumentNumber: track.instrument?.number || 0,
                    channel: track.channel,
                    notes,
                    noteCount: notes.length,
                    duration: track.duration || 0,
                    isPercussion: track.channel === 9,
                    pedalEvents
                };
            })
            .filter(track => track.noteCount > 0 && !track.isPercussion);
    }

    /**
     * 取得樂器名稱
     */
    getInstrumentName(number) {
        const instruments = [
            '鋼琴', '明亮鋼琴', '電鋼琴', '酒吧鋼琴', '電鋼琴1', '電鋼琴2',
            '大鍵琴', '擊弦古鋼琴', '鋼片琴', '音樂盒', '顫音琴', '馬林巴',
            '木琴', '鐘琴', '管鐘', '手風琴', '口琴', '探戈手風琴',
            '尼龍弦吉他', '鋼弦吉他', '爵士吉他', '清音吉他', '悶音吉他',
            '過驅動吉他', '失真吉他', '吉他泛音', '貝斯', '電貝斯',
            '無品貝斯', '擊弦貝斯', '撥弦貝斯', '顫音貝斯',
            '顫音弦樂', '弦樂合奏1', '弦樂合奏2', '合成弦樂1', '合成弦樂2',
            '合唱', '弦樂顫音', '彈撥弦', '定音鼓',
            '弦樂合奏', '慢弦樂', '合成弦樂', '管弦樂',
            '小號', '長號', '大號', '小號悶音', '法國號',
            '銅管樂', '合成銅管1', '合成銅管2',
            '高音薩克斯', '中音薩克斯', '次中音薩克斯', '上低音薩克斯',
            '雙簧管', '英國管', '低音管', '單簧管',
            '短笛', '長笛', '豎笛', '排簫',
            '吹瓶聲', '尺八',
            '哨子', '陶笛',
            '合成主音1', '合成主音2', '合成主音3', '合成主音4',
            '合成主音5', '合成主音6', '合成主音7', '合成主音8',
            '合成背景1', '合成背景2', '合成背景3', '合成背景4',
            '合成背景5', '合成背景6', '合成背景7', '合成背景8',
            '合成效果1', '合成效果2', '合成效果3', '合成效果4',
            '合成效果5', '合成效果6', '合成效果7', '合成效果8',
            '西塔琴', '斑鳩琴', '三味線', '十三弦古箏',
            '卡林巴', '手風琴', '風笛',
            '小提琴', '中提琴', '大提琴', '低音提琴',
            '顫音', '顫音2', '豎琴',
            '定音鼓', '鋼鼓', '木塊', '太鼓',
            '旋律鼓', '合成鼓', '反向鈸'
        ];
        return instruments[number] || '鋼琴';
    }

    /**
     * 取得 MIDI 檔案資訊
     */
    getMidiInfo() {
        if (!this.midi) return null;

        const tempos = this.midi.header.tempos || [];
        const timeSignatures = this.midi.header.timeSignatures || [];

        return {
            name: this.midi.name || '未命名',
            duration: this.midi.duration,
            trackCount: this.tracks.length,
            tracks: this.tracks,
            tempo: tempos.length > 0 ? tempos[0].bpm : 120,
            timeSignature: timeSignatures.length > 0 
                ? `${timeSignatures[0].timeSignature[0]}/${timeSignatures[0].timeSignature[1]}`
                : '4/4'
        };
    }

    /**
     * 取得指定軌道的音符
     */
    getTrackNotes(trackIndex) {
        return this.tracks[trackIndex]?.notes || [];
    }

    /**
     * 將 MIDI 音高轉換為音符名稱
     */
    static midiToNoteName(midi) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midi / 12) - 1;
        const noteIndex = midi % 12;
        return {
            name: noteNames[noteIndex],
            octave: octave,
            fullName: `${noteNames[noteIndex]}${octave}`
        };
    }

    /**
     * 判斷音符應該在高音譜號還是低音譜號
     */
    static getStaff(midi) {
        return midi >= 60 ? 'treble' : 'bass';
    }

    /**
     * 將 MIDI 音高轉換為 VexFlow 音符名稱
     */
    static midiToVexFlowKey(midi) {
        const noteInfo = MidiParser.midiToNoteName(midi);
        return `${noteInfo.name.toLowerCase()}/${noteInfo.octave}`;
    }

    /**
     * 根據持續時間計算 VexFlow 音符類型
     */
    static durationToVexFlowType(duration, tempo = 120) {
        const beats = duration * (tempo / 60);
        
        if (beats >= 3.5) return 'w';
        if (beats >= 1.75) return 'h';
        if (beats >= 0.875) return 'q';
        if (beats >= 0.4375) return '8';
        if (beats >= 0.21875) return '16';
        return '32';
    }
}

window.MidiParser = MidiParser;
