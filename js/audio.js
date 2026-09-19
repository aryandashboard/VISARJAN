class AudioSystem {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.ambientOsc = null;
        this.ambientGain = null;
        
        this.isSoundOn = true;
        
        // Initialize on first user interaction to comply with browser autoplay policies
        window.addEventListener('click', () => this.init(), { once: true });
        window.addEventListener('keydown', () => this.init(), { once: true });
        window.addEventListener('touchstart', () => this.init(), { once: true });
    }
    
    init() {
        if (this.ctx) return;
        
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return; // Fallback if not supported
        
        this.ctx = new AudioContext();
        
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isSoundOn ? 0.5 : 0;
        this.masterGain.connect(this.ctx.destination);
    }
    
    toggleSound() {
        this.isSoundOn = !this.isSoundOn;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isSoundOn ? 0.5 : 0;
        }
        return this.isSoundOn;
    }
    
    playTone(freq, type, duration, vol) {
        if (!this.ctx || !this.isSoundOn) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
    
    playCollect() {
        // Pleasant high chime
        this.playTone(880, 'sine', 0.2, 0.3); // A5
        setTimeout(() => this.playTone(1108.73, 'sine', 0.3, 0.3), 50); // C#6
    }
    
    playSpecial() {
        // Golden diya - magical sparkle sound
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'sine', 0.4, 0.2), i * 50);
        });
    }
    
    playImpact() {
        // Low thud
        this.playTone(100, 'square', 0.3, 0.5);
        
        // Noise burst for crunch
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 0.2; // 0.2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
    }
    
    playDash() {
        // Whoosh sound (white noise with bandpass sweep)
        if (!this.ctx) return;
        
        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, this.ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(2000, this.ctx.currentTime + 0.2);
        filter.Q.value = 2;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
    }
    
    playWarning() {
        // Subtle low pulsing hum
        this.playTone(200, 'triangle', 0.5, 0.2);
    }
    
    playBlessing() {
        // Grand chord
        this.playTone(261.63, 'square', 2.0, 0.1); // C4
        this.playTone(329.63, 'square', 2.0, 0.1); // E4
        this.playTone(392.00, 'square', 2.0, 0.1); // G4
    }
    
    playGameOver() {
        // Sad descending tones
        this.playTone(392.00, 'triangle', 0.5, 0.3); // G4
        setTimeout(() => this.playTone(329.63, 'triangle', 0.5, 0.3), 300); // E4
        setTimeout(() => this.playTone(261.63, 'triangle', 1.0, 0.3), 600); // C4
    }
    
    playVisarjan() {
        // Peaceful ending arpeggio
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major pentatonic
        let time = 0;
        for (let i=0; i<12; i++) {
            setTimeout(() => {
                this.playTone(notes[i % notes.length], 'sine', 1.0, 0.1);
            }, time * 1000);
            time += 0.3;
        }
    }
    
    playAmbient() {
        if (!this.ctx || !this.isSoundOn) return;
        this.stopAmbient();
        
        // Low rhythmic drone for tension
        this.ambientOsc = this.ctx.createOscillator();
        this.ambientOsc.type = 'triangle';
        this.ambientOsc.frequency.value = 55; // Low A
        
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 2; // 2Hz pulse (rhythm)
        
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain);
        lfoGain.connect(this.ambientOsc.frequency);
        
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.value = 0.1;
        
        this.ambientOsc.connect(this.ambientGain);
        this.ambientGain.connect(this.masterGain);
        
        this.ambientOsc.start();
        lfo.start();
    }
    
    stopAmbient() {
        if (this.ambientOsc) {
            this.ambientOsc.stop();
            this.ambientOsc.disconnect();
            this.ambientOsc = null;
        }
    }
}
