class ParticleSystem {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.particles = [];
        this.floatingTexts = [];
        this.weatherParticles = [];
        this.weatherType = 'CALM';
    }
    
    setWeatherSystem(type) {
        this.weatherType = type;
        this.weatherParticles = [];
        
        const count = type === 'WIND' ? 50 : 150; // More particles for storm/rain
        
        for (let i = 0; i < count; i++) {
            this.weatherParticles.push(this.createWeatherParticle(type));
        }
    }
    
    clearWeather() {
        this.weatherType = 'CALM';
        this.weatherParticles = [];
    }
    
    createWeatherParticle(type) {
        if (type === 'WIND') {
            // Leaves/dust
            return {
                x: Math.random() * Game.width * 1.5,
                y: Math.random() * Game.height,
                vx: -200 - Math.random() * 200,
                vy: 20 + Math.random() * 50,
                size: Math.random() * 4 + 2,
                color: Math.random() > 0.5 ? '#7b8c4d' : '#8c6b4d',
                rotation: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 5,
                type: 'leaf'
            };
        } else if (type === 'STORM') {
            // Rain
            return {
                x: Math.random() * Game.width * 1.2,
                y: Math.random() * Game.height,
                vx: -100,
                vy: 500 + Math.random() * 300,
                size: Math.random() * 15 + 10,
                color: 'rgba(150, 180, 255, 0.5)',
                type: 'rain'
            };
        }
    }
    
    createFlameSpark(x, y) {
        this.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 50,
            vy: -50 - Math.random() * 50,
            life: 1.0,
            maxLife: 1.0 + Math.random(),
            size: Math.random() * 3 + 1,
            color: '#ffcc00',
            type: 'spark'
        });
    }
    
    createTrail(x, y) {
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            life: 0.3,
            maxLife: 0.3,
            size: Game.player.width,
            color: 'rgba(110, 122, 138, 0.3)', // Mushak color
            type: 'trail'
        });
    }
    
    createCollectEffect(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200 - 100,
                life: 0.5 + Math.random() * 0.5,
                maxLife: 1.0,
                size: Math.random() * 4 + 2,
                color: color,
                type: 'spark'
            });
        }
    }
    
    createImpactEffect(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 300,
                vy: (Math.random() - 0.5) * 300,
                life: 0.4 + Math.random() * 0.3,
                maxLife: 0.7,
                size: Math.random() * 5 + 2,
                color: '#aaaaaa',
                type: 'dust'
            });
        }
    }
    
    createGoldenParticle(x, y) {
        this.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 50,
            vy: -20 - Math.random() * 50,
            life: 1.5 + Math.random(),
            maxLife: 2.5,
            size: Math.random() * 3 + 2,
            color: '#ffd700',
            type: 'spark'
        });
    }
    
    createVisarjanLight() {
        this.particles.push({
            x: Game.width + 50,
            y: Game.height - 80 + (Math.random() - 0.5) * 30,
            vx: -30 - Math.random() * 30,
            vy: Math.sin(Date.now() * 0.001) * 10,
            life: 10,
            maxLife: 10,
            size: Math.random() * 4 + 4,
            color: '#ff9900',
            type: 'floaty'
        });
    }
    
    createFloatingText(text, x, y, color) {
        this.floatingTexts.push({
            text: text,
            x: x,
            y: y,
            vy: -50,
            life: 1.0,
            maxLife: 1.0,
            color: color
        });
    }
    
    update(dt) {
        // Update weather
        for (let i = 0; i < this.weatherParticles.length; i++) {
            let p = this.weatherParticles[i];
            
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.type === 'leaf') p.rotation += p.spin * dt;
            
            // Reset if offscreen
            if (p.y > Game.height || p.x < -50) {
                Object.assign(p, this.createWeatherParticle(this.weatherType));
            }
        }
        
        // Update normal particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            
            // Gravity or float
            if (p.type === 'spark') p.vy -= 100 * dt; // Float up
            if (p.type === 'dust') p.vy += 200 * dt; // Gravity
            if (p.type === 'trail') {
                // follow world scroll
                p.x -= Game.config.baseSpeed * Game.speedMultiplier * dt;
            }
        }
        
        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            let t = this.floatingTexts[i];
            t.life -= dt;
            if (t.life <= 0) {
                this.floatingTexts.splice(i, 1);
                continue;
            }
            t.y += t.vy * dt;
        }
    }
    
    draw(ctx) {
        // Draw normal particles
        for (let p of this.particles) {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            
            if (p.type === 'trail') {
                // Draw ghostly mushak
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, p.size/2, p.size/2.5, 0, 0, Math.PI*2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1.0;
        
        // Draw weather
        for (let p of this.weatherParticles) {
            ctx.fillStyle = p.color;
            
            if (p.type === 'rain') {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.vx * 0.1, p.y + p.vy * 0.1); // draw line based on velocity
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            } else if (p.type === 'leaf') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size, p.size/2, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
            }
        }
        
        // Draw floating texts
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px var(--font-heading, "Cinzel", serif)';
        for (let t of this.floatingTexts) {
            ctx.globalAlpha = t.life / t.maxLife;
            ctx.fillStyle = t.color;
            ctx.fillText(t.text, t.x, t.y);
            // subtle outline
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.strokeText(t.text, t.x, t.y);
        }
        ctx.globalAlpha = 1.0;
    }
}
