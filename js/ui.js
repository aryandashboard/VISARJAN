class UI {
    constructor() {
        // DOM Elements
        this.screens = {
            menu: document.getElementById('main-menu'),
            tutorial: document.getElementById('tutorial-screen'),
            gameOver: document.getElementById('game-over-screen'),
            ending: document.getElementById('ending-screen')
        };
        
        this.hud = document.getElementById('hud');
        
        // HUD Elements
        this.els = {
            score: document.getElementById('score'),
            distance: document.getElementById('distance'),
            flameFill: document.getElementById('flame-bar-fill'),
            devotionFill: document.getElementById('devotion-bar-fill'),
            dashInd: document.getElementById('dash-indicator'),
            sectionTitle: document.getElementById('section-title'),
            bappaText: document.getElementById('bappa-blessing-text'),
            progressInd: document.getElementById('progress-indicator'),
            criticalWarning: document.getElementById('critical-warning'),
            
            // Debug elements
            debugOverlay: document.getElementById('debug-overlay'),
            debugFps: document.getElementById('debug-fps'),
            debugPx: document.getElementById('debug-px'),
            debugPy: document.getElementById('debug-py'),
            debugDist: document.getElementById('debug-dist'),
            debugFlame: document.getElementById('debug-flame'),
            debugDev: document.getElementById('debug-dev'),
            debugEnts: document.getElementById('debug-ents'),
            debugSection: document.getElementById('debug-section'),
            debugDash: document.getElementById('debug-dash')
        };
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Main Menu
        document.getElementById('btn-play').addEventListener('click', () => {
            Game.audio.init();
            this.hideAllScreens();
            Game.startGame();
        });
        
        document.getElementById('btn-tutorial').addEventListener('click', () => {
            Game.audio.init();
            this.hideAllScreens();
            this.screens.tutorial.classList.remove('hidden');
        });
        
        const soundBtn = document.getElementById('btn-sound');
        soundBtn.addEventListener('click', () => {
            Game.audio.init();
            const isOn = Game.audio.toggleSound();
            soundBtn.innerText = `SOUND: ${isOn ? 'ON' : 'OFF'}`;
        });
        
        // Tutorial
        document.getElementById('btn-start-game').addEventListener('click', () => {
            Game.audio.init();
            this.hideAllScreens();
            Game.startGame();
        });
        
        // Game Over
        document.getElementById('btn-retry').addEventListener('click', () => {
            this.hideAllScreens();
            Game.startGame();
        });
        
        document.getElementById('btn-main-menu').addEventListener('click', () => {
            this.hideAllScreens();
            this.screens.menu.classList.remove('hidden');
            Game.state = 'MENU';
        });
        
        // Ending
        document.getElementById('btn-play-again').addEventListener('click', () => {
            this.hideAllScreens();
            this.screens.menu.classList.remove('hidden');
            Game.state = 'MENU';
        });
    }
    
    hideAllScreens() {
        for (let key in this.screens) {
            this.screens[key].classList.add('hidden');
        }
        this.hud.classList.add('hidden');
    }
    
    showHUD() {
        this.hud.classList.remove('hidden');
    }
    
    updateHUD() {
        // Score & Distance
        this.els.score.innerText = Math.floor(Game.score);
        this.els.distance.innerText = Math.floor(Game.distance);
        
        // Flame Bar
        const flamePercent = (Game.flame.current / Game.flame.max) * 100;
        this.els.flameFill.style.width = `${flamePercent}%`;
        
        if (flamePercent < 20) {
            this.els.flameFill.style.background = '#ff3300';
            this.els.flameFill.style.boxShadow = '0 0 10px #ff3300';
        } else if (flamePercent < 50) {
            this.els.flameFill.style.background = '#ff9900';
            this.els.flameFill.style.boxShadow = '0 0 10px #ff9900';
        } else {
            this.els.flameFill.style.background = 'linear-gradient(90deg, #ff3300, #ff9900, #ffcc00)';
            this.els.flameFill.style.boxShadow = 'none';
        }
        
        // Critical Warning Overlay
        if (flamePercent < 20) {
            this.els.criticalWarning.classList.remove('hidden');
        } else {
            this.els.criticalWarning.classList.add('hidden');
        }
        
        // Devotion Bar
        const devPercent = (Game.flame.devotion / Game.flame.maxDevotion) * 100;
        this.els.devotionFill.style.width = `${devPercent}%`;
        
        // Dash Indicator
        if (Game.player.dashCooldownTimer <= 0) {
            this.els.dashInd.classList.add('ready');
            this.els.dashInd.innerText = "DASH READY";
        } else {
            this.els.dashInd.classList.remove('ready');
            this.els.dashInd.innerText = `COOLDOWN: ${Math.ceil(Game.player.dashCooldownTimer)}s`;
        }
        
        // Progress Indicator
        const progressPercent = Math.min(100, (Game.distance / Game.config.maxDistance) * 100);
        this.els.progressInd.style.left = `${progressPercent}%`;
        
        // Debug update
        if (Game.debugMode) {
            this.els.debugFps.innerText = Math.round(1 / Game.deltaTime);
            this.els.debugPx.innerText = Math.round(Game.player.x);
            this.els.debugPy.innerText = Math.round(Game.player.y);
            this.els.debugDist.innerText = Math.round(Game.distance);
            this.els.debugFlame.innerText = Math.round(Game.flame.current);
            this.els.debugDev.innerText = Math.round(Game.flame.devotion);
            this.els.debugEnts.innerText = Game.entities.collectibles.length + Game.entities.obstacles.length;
            this.els.debugSection.innerText = Game.currentSection;
            this.els.debugDash.innerText = Math.max(0, Game.player.dashCooldownTimer).toFixed(1);
        }
    }
    
    toggleDebug(isOn) {
        if (isOn) {
            this.els.debugOverlay.classList.remove('hidden');
        } else {
            this.els.debugOverlay.classList.add('hidden');
        }
    }
    
    showSectionTitle(title) {
        this.els.sectionTitle.innerText = title;
        this.els.sectionTitle.classList.remove('hidden');
        this.els.sectionTitle.style.opacity = 1;
        
        // Fade out after 3 seconds
        setTimeout(() => {
            this.els.sectionTitle.style.opacity = 0;
            setTimeout(() => {
                this.els.sectionTitle.classList.add('hidden');
            }, 1000); // Wait for transition
        }, 3000);
    }
    
    showBappaBlessing() {
        this.els.bappaText.classList.remove('hidden');
    }
    
    hideBappaBlessing() {
        this.els.bappaText.classList.add('hidden');
    }
    
    updateMenuHighScore(score) {
        document.getElementById('menu-high-score').innerText = score;
    }
    
    showGameOver() {
        this.hud.classList.add('hidden');
        this.els.criticalWarning.classList.add('hidden');
        this.screens.gameOver.classList.remove('hidden');
        
        document.getElementById('go-score').innerText = Math.floor(Game.score);
        document.getElementById('go-distance').innerText = Math.floor(Game.distance);
        document.getElementById('go-high-score').innerText = Game.highScore;
        
        this.updateMenuHighScore(Game.highScore);
    }
    
    showEnding(baseScore, flameBonus, total, isNewHigh) {
        // Smoothly fade out the HUD
        this.hud.style.transition = 'opacity 2s ease';
        this.hud.style.opacity = 0;
        this.els.criticalWarning.classList.add('hidden');
        
        setTimeout(() => {
            this.hud.classList.add('hidden');
            this.hud.style.opacity = 1;
            this.screens.ending.classList.remove('hidden');
            
            document.getElementById('end-score').innerText = Math.floor(baseScore);
            document.getElementById('end-distance').innerText = Math.floor(Game.distance);
            document.getElementById('end-flame-bonus').innerText = flameBonus;
            document.getElementById('end-total').innerText = total;
            
            const newHighMsg = document.getElementById('new-high-score-msg');
            if (isNewHigh) {
                newHighMsg.classList.remove('hidden');
            } else {
                newHighMsg.classList.add('hidden');
            }
            
            this.updateMenuHighScore(Game.highScore);
        }, 2000);
    }
}
