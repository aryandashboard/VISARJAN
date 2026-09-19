/**
 * VISARJAN - Core Game Logic
 */

// Global Game Object to hold state
const Game = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    
    // Game State
    state: 'MENU', // MENU, TUTORIAL, PLAYING, GAMEOVER, VISARJAN
    score: 0,
    highScore: 0,
    distance: 0,
    timeElapsed: 0,
    lastTime: 0,
    deltaTime: 0,
    debugMode: false,
    
    // Camera
    camera: { x: 0, y: 0 },
    
    // Difficulty / Progression
    currentSection: 0, // 0: Calm, 1: Procession, 2: Wind, 3: Storm, 4: Final
    speedMultiplier: 1.0,
    
    // Input
    keys: {
        a: false, A: false, d: false, D: false,
        w: false, W: false,
        ArrowLeft: false, ArrowRight: false, ArrowUp: false,
        space: false, Shift: false
    },
    touch: {
        left: false, right: false, dash: false, jump: false
    },
    
    // Config
    config: {
        baseSpeed: 400, // Movement speed for player
        maxDistance: 3000, // Distance to reach Visarjan
        dashDuration: 1.0, // Seconds
        dashCooldown: 2.5, // Seconds
        flameDrainNormal: 1.5, // % per second
        targetFPS: 60
    },
    
    // Systems
    player: null,
    environment: null,
    flame: null,
    entities: null,
    particles: null,
    audio: null,
    ui: null,
    
    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Load High Score
        const savedScore = localStorage.getItem('visarjan_highscore');
        if (savedScore) {
            this.highScore = parseInt(savedScore, 10);
        }
        
        // Init Input
        this.initInput();
        
        // Init Systems
        this.audio = new AudioSystem();
        this.ui = new UI();
        this.particles = new ParticleSystem();
        this.environment = new Environment();
        this.player = new Player();
        this.flame = new FlameSystem();
        this.entities = new EntityManager();
        
        this.ui.updateMenuHighScore(this.highScore);
        
        // Start loop
        requestAnimationFrame((time) => this.loop(time));
    },
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    },
    
    initInput() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F3') {
                e.preventDefault();
                this.debugMode = !this.debugMode;
                Game.ui.toggleDebug(this.debugMode);
                return;
            }
            if (this.keys.hasOwnProperty(e.key) || e.key === ' ' || e.key === 'Shift') {
                if (e.key === ' ') this.keys.space = true;
                else if (e.key === 'Shift') this.keys.Shift = true;
                else this.keys[e.key] = true;
            } else if (e.code === 'Space') {
                this.keys.space = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key) || e.key === ' ' || e.key === 'Shift') {
                if (e.key === ' ') this.keys.space = false;
                else if (e.key === 'Shift') this.keys.Shift = false;
                else this.keys[e.key] = false;
            } else if (e.code === 'Space') {
                this.keys.space = false;
            }
        });
        
        // Touch
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (isTouch) {
            document.body.classList.add('touch-enabled');
            
            const tLeft = document.getElementById('touch-left');
            const tRight = document.getElementById('touch-right');
            const tDash = document.getElementById('touch-dash');
            const tJump = document.getElementById('touch-jump');
            
            tLeft.addEventListener('touchstart', (e) => { e.preventDefault(); this.touch.left = true; }, {passive: false});
            tLeft.addEventListener('touchend', (e) => { e.preventDefault(); this.touch.left = false; }, {passive: false});
            
            tRight.addEventListener('touchstart', (e) => { e.preventDefault(); this.touch.right = true; }, {passive: false});
            tRight.addEventListener('touchend', (e) => { e.preventDefault(); this.touch.right = false; }, {passive: false});
            
            tDash.addEventListener('touchstart', (e) => { e.preventDefault(); this.touch.dash = true; }, {passive: false});
            tDash.addEventListener('touchend', (e) => { e.preventDefault(); this.touch.dash = false; }, {passive: false});
            
            tJump.addEventListener('touchstart', (e) => { e.preventDefault(); this.touch.jump = true; }, {passive: false});
            tJump.addEventListener('touchend', (e) => { e.preventDefault(); this.touch.jump = false; }, {passive: false});
        }
    },
    
    startGame() {
        this.state = 'PLAYING';
        this.score = 0;
        this.distance = 0;
        this.timeElapsed = 0;
        this.currentSection = 0;
        this.speedMultiplier = 1.0;
        this.camera.x = 0;
        this.maxDistanceReached = 0;
        
        this.player.reset();
        this.flame.reset();
        this.environment.reset();
        this.entities.reset();
        this.particles.reset();
        
        this.ui.showHUD();
        this.audio.playAmbient();
        this.ui.showSectionTitle("THE BEGINNING");
    },
    
    gameOver() {
        this.state = 'GAMEOVER';
        this.audio.stopAmbient();
        this.audio.playGameOver();
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('visarjan_highscore', this.highScore);
        }
        
        this.ui.showGameOver();
    },
    
    triggerVisarjan() {
        this.state = 'VISARJAN';
        this.audio.stopAmbient();
        this.audio.playVisarjan();
        
        // Clear obstacles, spawn flowers and floating diyas
        this.entities.obstacles = [];
        this.environment.setVisarjanMode();
        
        setTimeout(() => {
            let total = this.score + 500 + Math.floor(this.flame.current * 10);
            let isNewHigh = false;
            if (total > this.highScore) {
                this.highScore = total;
                localStorage.setItem('visarjan_highscore', this.highScore);
                isNewHigh = true;
            }
            this.ui.showEnding(this.score, Math.floor(this.flame.current * 10), total, isNewHigh);
        }, 5000); // Show ending screen after 5 seconds of peace
    },
    
    addScore(amount) {
        if (this.flame.isBappaBlessingActive) {
            amount *= 2;
        }
        this.score += amount;
    },
    
    loop(timestamp) {
        // Calculate Delta Time
        if (!this.lastTime) this.lastTime = timestamp;
        this.deltaTime = (timestamp - this.lastTime) / 1000; // in seconds
        this.lastTime = timestamp;
        
        // Cap deltaTime to prevent huge jumps if tab is inactive
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;
        
        this.update();
        this.draw();
        
        requestAnimationFrame((time) => this.loop(time));
    },
    
    update() {
        if (this.state === 'PLAYING') {
            this.timeElapsed += this.deltaTime;
            
            // Update systems
            this.player.update(this.deltaTime);
            
            // Camera follows player
            this.camera.x = Math.max(0, this.player.x - this.width * 0.2);
            
            // Distance is exactly player.x
            this.distance = this.player.x;
            
            this.environment.update(this.deltaTime);
            this.entities.update(this.deltaTime);
            this.flame.update(this.deltaTime);
            this.particles.update(this.deltaTime);
            
            // Score based on distance moved forward
            // Keep track of max distance reached for score
            if (!this.maxDistanceReached) this.maxDistanceReached = 0;
            if (this.distance > this.maxDistanceReached) {
                if (Math.floor(this.distance / 10) > Math.floor(this.maxDistanceReached / 10)) {
                    this.score += 1;
                }
                this.maxDistanceReached = this.distance;
            }
            
            // Check progression
            this.checkProgression();
            
            // Check win condition
            if (this.distance >= this.config.maxDistance) {
                this.triggerVisarjan();
            }
            
            this.ui.updateHUD();
            
        } else if (this.state === 'VISARJAN') {
            this.player.update(this.deltaTime, true); // Auto move
            this.environment.update(this.deltaTime);
            this.particles.update(this.deltaTime);
            // Spawn floaty lights
            if (Math.random() < 0.1) {
                this.particles.createVisarjanLight();
            }
        } else if (this.state === 'MENU' || this.state === 'TUTORIAL') {
            this.environment.update(this.deltaTime * 0.5); // slow pan
            this.particles.update(this.deltaTime);
        }
    },
    
    checkProgression() {
        const progress = this.distance / this.config.maxDistance;
        
        let newSection = 0;
        if (progress > 0.8) newSection = 4; // Final
        else if (progress > 0.6) newSection = 3; // Storm
        else if (progress > 0.4) newSection = 2; // Wind
        else if (progress > 0.15) newSection = 1; // Procession
        
        if (newSection !== this.currentSection) {
            this.currentSection = newSection;
            this.speedMultiplier = 1.0 + (this.currentSection * 0.15);
            
            const titles = ["THE BEGINNING", "THE PROCESSION", "THE WIND", "THE STORM", "THE FINAL JOURNEY"];
            if (this.state === 'PLAYING') {
                this.ui.showSectionTitle(titles[this.currentSection]);
            }
            
            // Update environment weather
            if (this.currentSection === 2) this.environment.setWeather('WIND');
            else if (this.currentSection === 3) this.environment.setWeather('STORM');
            else if (this.currentSection === 4) this.environment.setWeather('CALM');
        }
    },
    
    draw() {
        // Clear
        this.ctx.fillStyle = '#0a0b1a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw Background Layers
        this.environment.draw(this.ctx);
        
        this.ctx.save();
        this.ctx.translate(-this.camera.x, 0);
        
        // Draw Entities (below player)
        if (this.state === 'PLAYING') {
            this.entities.draw(this.ctx);
        }
        
        // Draw Player
        if (this.state === 'PLAYING' || this.state === 'VISARJAN') {
            this.player.draw(this.ctx);
        }
        
        // Draw Particles
        this.particles.draw(this.ctx);
        
        this.ctx.restore();
        
        // Draw Lighting / Visibility Mask
        if (this.state === 'PLAYING') {
            this.flame.drawLighting(this.ctx, this.player.x - this.camera.x, this.player.y);
        } else if (this.state === 'VISARJAN') {
            this.flame.drawVisarjanLighting(this.ctx);
        } else {
            // Menu lighting
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
};

// Start when ready
window.onload = () => {
    Game.init();
};
