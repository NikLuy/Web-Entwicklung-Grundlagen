// ============================================================
// sound.js — Web Audio API synthesized sound effects (v2)
// Much quieter, less annoying, with proper throttling
// ============================================================

export class Sound {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this._initialized = false;
        this._sirenOsc = null;
        this._sirenGain = null;

        // Throttle control
        this._lastWakaTime = 0;
        this._wakaInterval = 120; // ms between waka sounds
    }

    /** Initialize AudioContext on first user gesture */
    init() {
        if (this._initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._initialized = true;
        } catch (e) {
            console.warn('Web Audio not supported');
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        this.stopSiren();
    }

    /** Play a simple tone */
    _playTone(freq, duration, type = 'sine', volume = 0.04, delay = 0) {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        const t = this.ctx.currentTime + delay;
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + duration);
    }

    /** Classic intro jingle (simplified, gentle) */
    playIntro() {
        if (!this.ctx || this.muted) return;
        const notes = [
            { f: 523, d: 0.12 }, { f: 587, d: 0.12 }, { f: 659, d: 0.12 },
            { f: 523, d: 0.12 }, { f: 587, d: 0.12 }, { f: 659, d: 0.24 },
            { f: 523, d: 0.12 }, { f: 587, d: 0.12 }, { f: 659, d: 0.12 },
            { f: 784, d: 0.12 }, { f: 659, d: 0.12 }, { f: 587, d: 0.36 },
        ];
        let time = 0;
        notes.forEach(n => {
            this._playTone(n.f, n.d, 'sine', 0.05, time);
            time += n.d + 0.02;
        });
        return time * 1000;
    }

    /** Waka-waka pellet sound — throttled so it doesn't fire every frame */
    _wakaState = false;
    playWaka() {
        if (!this.ctx || this.muted) return;
        const now = performance.now();
        if (now - this._lastWakaTime < this._wakaInterval) return;
        this._lastWakaTime = now;

        const freq = this._wakaState ? 280 : 350;
        this._wakaState = !this._wakaState;
        this._playTone(freq, 0.06, 'sine', 0.03);
    }

    /** Power pellet / frightened mode — short subtle cue */
    playFrightened() {
        if (!this.ctx || this.muted) return;
        this._playTone(150, 0.2, 'sine', 0.03);
    }

    /** Ghost eaten — quick ascending chirp */
    playEatGhost() {
        if (!this.ctx || this.muted) return;
        for (let i = 0; i < 4; i++) {
            this._playTone(500 + i * 250, 0.05, 'sine', 0.04, i * 0.04);
        }
    }

    /** Death sound — descending tone */
    playDeath() {
        if (!this.ctx || this.muted) return;
        for (let i = 0; i < 8; i++) {
            this._playTone(700 - i * 60, 0.08, 'sine', 0.04, i * 0.08);
        }
    }

    /** Extra life chime */
    playExtraLife() {
        if (!this.ctx || this.muted) return;
        const notes = [523, 659, 784, 1047];
        notes.forEach((f, i) => {
            this._playTone(f, 0.12, 'sine', 0.04, i * 0.1);
        });
    }

    /** Start a very subtle background hum (not the old aggressive siren) */
    startSiren(intensity = 0) {
        if (!this.ctx || this.muted) return;
        this.stopSiren();
        this._sirenOsc = this.ctx.createOscillator();
        this._sirenGain = this.ctx.createGain();
        this._sirenOsc.type = 'sine';
        this._sirenOsc.frequency.value = 60 + intensity * 40;
        this._sirenGain.gain.value = 0.012; // very quiet
        this._sirenOsc.connect(this._sirenGain);
        this._sirenGain.connect(this.ctx.destination);
        this._sirenOsc.start();
    }

    /** Update siren pitch based on pellets eaten ratio */
    updateSiren(intensity) {
        if (this._sirenOsc) {
            this._sirenOsc.frequency.value = 60 + intensity * 40;
        }
    }

    /** Stop the siren */
    stopSiren() {
        if (this._sirenOsc) {
            try { this._sirenOsc.stop(); } catch (e) { /* already stopped */ }
            this._sirenOsc = null;
            this._sirenGain = null;
        }
    }
}
