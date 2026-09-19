class FlameSystem {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.max = 100;
        this.current = this.max;
        this.devotion = 0;
        this.maxDevotion = 100;
        
        this.isBappaBlessingActive = false;
        this.blessingTimer = 0;
        this.blessingDuration = 5; // seconds
        
        this.flickerIntensity = 0;
    }
    
    update(dt) {
        if (this.isBappaBlessingActive) {
            this.blessingTimer -= dt;
            if (this.blessingTimer <= 0) {
                this.isBappaBlessingActive = false;
                Game.ui.hideBappaBlessing();
            }
            // Spawn golden particles during blessing
            if (Math.random() < 0.2) {
                Game.particles.createGoldenParticle(Game.player.x + Math.random()*50, Game.player.y - Math.random()*50);
            }
            return; // Flame doesn't decrease during blessing
        }
        
        // Calculate drain rate
        let drainRate = Game.config.flameDrainNormal;
        
        // Weather modifiers
        if (Game.currentSection === 2) drainRate *= 1.5; // Wind
        else if (Game.currentSection === 3) drainRate *= 2.5; // Storm
        
        // Dash modifier
        if (Game.player.isDashing) drainRate *= 2.0;
        
        // Apply drain
        this.current -= drainRate * dt;
        
        // Visual effects based on flame health
        if (this.current <= 30 && this.current > 10) {
            this.flickerIntensity = 0.2;
            if (Math.random() < 0.05) Game.audio.playWarning();
        } else if (this.current <= 10) {
            this.flickerIntensity = 0.5;
            if (Math.random() < 0.1) Game.audio.playWarning();
        } else {
            this.flickerIntensity = 0;
        }
        
        // Game Over condition
        if (this.current <= 0) {
            this.current = 0;
            Game.gameOver();
        }
    }
    
    addFlame(amount) {
        this.current += amount;
        if (this.current > this.max) {
            // Excess flame becomes bonus score
            const excess = this.current - this.max;
            Game.addScore(Math.floor(excess));
            this.current = this.max;
        }
        Game.particles.createCollectEffect(Game.player.x + 30, Game.player.y, '#ff9900');
    }
    
    addDevotion(amount) {
        if (this.isBappaBlessingActive) return;
        
        this.devotion += amount;
        if (this.devotion >= this.maxDevotion) {
            this.activateBappaBlessing();
            this.devotion = 0;
        }
    }
    
    activateBappaBlessing() {
        this.isBappaBlessingActive = true;
        this.blessingTimer = this.blessingDuration;
        Game.ui.showBappaBlessing();
        Game.audio.playBlessing();
        Game.environment.shake(10, 0.5);
        
        // Spawn lots of golden particles
        for (let i = 0; i < 30; i++) {
            Game.particles.createGoldenParticle(Game.player.x + Math.random()*200 - 100, Game.player.y - Math.random()*100);
        }
    }
    
    drawLighting(ctx, px, py) {
        // Create darkness overlay with a "hole" for the light
        ctx.globalCompositeOperation = 'source-over';
        
        let radius = 300 * (this.current / this.max);
        
        // Add flicker
        if (this.flickerIntensity > 0) {
            radius -= Math.random() * radius * this.flickerIntensity;
        }
        // Minimal radius so it's never completely pitch black immediately
        if (radius < 120) radius = 120;
        
        // Blessing makes it brighter
        if (this.isBappaBlessingActive) {
            radius = 600;
        }
        
        // Draw the darkness
        // We use a radial gradient from the player outward
        // Center of player + offset for diya
        const cx = px + 30;
        const cy = py - 5;
        
        const gradient = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
        
        // The center is transparent, edges are dark
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
        
        // Darker depending on weather
        let maxDarkness = 0.85;
        if (Game.currentSection === 3) maxDarkness = 0.95; // Rain is darker
        if (this.isBappaBlessingActive) maxDarkness = 0.2; // Blessing is bright
        
        gradient.addColorStop(1, `rgba(10, 11, 26, ${maxDarkness})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, Game.width, Game.height);
        
        // If blessing active, draw a golden aura around player
        if (this.isBappaBlessingActive) {
            const auraGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 150);
            auraGrad.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
            auraGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = auraGrad;
            ctx.fillRect(0, 0, Game.width, Game.height);
        }
        
        // Reset composite op
        ctx.globalCompositeOperation = 'source-over';
    }
    
    drawVisarjanLighting(ctx) {
        // Soft romantic night lighting
        ctx.fillStyle = 'rgba(10, 11, 26, 0.3)';
        ctx.fillRect(0, 0, Game.width, Game.height);
    }
}
