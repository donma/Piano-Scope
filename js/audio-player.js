/**
 * 音頻播放模組
 * 延遲初始化 AudioContext
 */
class AudioPlayer {
    constructor() {
        this.synth = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.duration = 0;
        this.tempo = 120;
        this.playbackSpeed = 1;
        this.volume = 0.8;
        this.scheduledEvents = [];
        this.notes = [];
        this.onTimeUpdate = null;
        this.onNotePlay = null;
        this.onPlaybackEnd = null;
        this.animationFrame = null;
        this.startTimestamp = 0;
        this.pauseTime = 0;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        try {
            await Tone.start();
            this.synth = new Tone.PolySynth(Tone.Synth, {
                maxPolyphony: 64,
                voice: Tone.Synth,
                options: {
                    oscillator: { type: 'triangle8' },
                    envelope: { attack: 0.002, decay: 0.8, sustain: 0.2, release: 1.2 }
                }
            }).toDestination();
            this.synth.volume.value = this.volume * 30 - 30;
            this.initialized = true;
        } catch (e) {
            console.error('音頻初始化失敗:', e);
        }
    }

    loadNotes(notes, tempo = 120) {
        this.stop();
        this.notes = notes || [];
        this.tempo = tempo;
        this.duration = this.notes.length > 0 ? Math.max(...this.notes.map(n => n.time + n.duration)) : 0;
    }

    async play() {
        if (this.isPlaying) return;
        if (!this.initialized) await this.init();
        if (!this.synth) return;

        this.isPlaying = true;
        this.isPaused = false;
        Tone.Transport.bpm.value = this.tempo * this.playbackSpeed;
        this.scheduleNotes();
        Tone.Transport.start();
        this.startTimestamp = Tone.now() - (this.pauseTime / this.playbackSpeed);
        this.startTimeUpdateLoop();
    }

    scheduleNotes() {
        this.clearScheduledEvents();
        const startOffset = this.pauseTime;

        this.notes.forEach((note, index) => {
            const noteTime = note.time - startOffset;
            if (noteTime < 0) return;
            const scaledTime = noteTime / this.playbackSpeed;
            const scaledDuration = note.duration / this.playbackSpeed;

            const eventId = Tone.Transport.schedule(time => {
                try {
                    const noteName = MidiParser.midiToNoteName(note.pitch).fullName;
                    this.synth.triggerAttackRelease(noteName, scaledDuration * 0.9, time, note.velocity * this.volume);
                    if (this.onNotePlay) this.onNotePlay(note, index);
                } catch (e) {}
            }, `+${scaledTime}`);

            this.scheduledEvents.push(eventId);
        });
    }

    pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        this.isPaused = true;
        this.pauseTime = this.currentTime;
        Tone.Transport.pause();
        this.clearScheduledEvents();
        this.stopTimeUpdateLoop();
        if (this.synth) this.synth.releaseAll();
    }

    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.pauseTime = 0;
        Tone.Transport.stop();
        this.clearScheduledEvents();
        this.stopTimeUpdateLoop();
        if (this.synth) this.synth.releaseAll();
    }

    seekTo(time) {
        const wasPlaying = this.isPlaying;
        if (wasPlaying) this.pause();
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        this.pauseTime = this.currentTime;
        if (this.onTimeUpdate) this.onTimeUpdate(this.currentTime, this.duration);
        if (wasPlaying) this.play();
    }

    setSpeed(speed) {
        const wasPlaying = this.isPlaying;
        if (wasPlaying) this.pause();
        this.playbackSpeed = speed;
        if (wasPlaying) this.play();
    }

    setVolume(v) {
        this.volume = Math.max(0, Math.min(1, v));
        if (this.synth) this.synth.volume.value = this.volume * 30 - 30;
    }

    clearScheduledEvents() {
        this.scheduledEvents.forEach(id => { try { Tone.Transport.clear(id); } catch (e) {} });
        this.scheduledEvents = [];
    }

    startTimeUpdateLoop() {
        const updateTime = () => {
            if (!this.isPlaying) return;
            this.currentTime = (Tone.now() - this.startTimestamp) * this.playbackSpeed;
            if (this.currentTime >= this.duration) {
                this.currentTime = this.duration;
                this.stop();
                if (this.onPlaybackEnd) this.onPlaybackEnd();
                return;
            }
            if (this.onTimeUpdate) this.onTimeUpdate(this.currentTime, this.duration);
            this.animationFrame = requestAnimationFrame(updateTime);
        };
        this.animationFrame = requestAnimationFrame(updateTime);
    }

    stopTimeUpdateLoop() {
        if (this.animationFrame) { cancelAnimationFrame(this.animationFrame); this.animationFrame = null; }
    }

    static formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    destroy() {
        this.stop();
        if (this.synth) { this.synth.dispose(); this.synth = null; }
    }
}

window.AudioPlayer = AudioPlayer;
