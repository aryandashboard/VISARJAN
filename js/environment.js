class Environment {
    constructor() {
        this.reset();
        this.generateSky();
    }
    
    reset() {
        this.bgOffset = 0;
        this.midOffset = 0;
        this.fgOffset = 0;
        
        this.shakeTimer = 0;
        this.shakeMagnitude = 0;
        
        this.weather = 'CALM'; // CALM, WIND, STORM
        this.isVisarjan = false;
        
        // Stars
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * Game.width,
                y: Math.random() * (Game.height * 0.6),
                size: Math.random() * 2,
                twinkleSpeed: Math.random() * 0.05
            });
        }
    }
    
    setWeather(type) {
        this.weather = type;
        if (type === 'WIND' || type === 'STORM') {
            Game.particles.setWeatherSystem(type);
        } else {
            Game.particles.clearWeather();
        }
    }
    
    setVisarjanMode() {
        this.isVisarjan = true;
        this.setWeather('CALM');
    }
    
    shake(magnitude, duration) {
        this.shakeMagnitude = magnitude;
        this.shakeTimer = duration;
    }
    
    generateSky() {
        // Pre-render a background gradient if needed, though drawing it directly is fine
    }
    
    update(dt) {
        // Parallax scrolling tied to camera
        this.bgOffset = (Game.camera.x * 0.1) % Game.width;
        this.midOffset = (Game.camera.x * 0.3) % Game.width;
        this.fgOffset = (Game.camera.x * 0.7) % Game.width;
        
        // Update screenshake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Apply screenshake
        if (this.shakeTimer > 0) {
            const dx = (Math.random() - 0.5) * this.shakeMagnitude;
            const dy = (Math.random() - 0.5) * this.shakeMagnitude;
            ctx.translate(dx, dy);
        }
        
        this.drawSky(ctx);
        this.drawBackground(ctx);
        this.drawMidground(ctx);
        this.drawForeground(ctx);
        
        ctx.restore();
    }
    
    drawSky(ctx) {
        // Night sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, Game.height);
        if (this.weather === 'STORM') {
            grad.addColorStop(0, '#05050a');
            grad.addColorStop(1, '#1a1a2e');
        } else {
            grad.addColorStop(0, '#0a0b1a');
            grad.addColorStop(1, '#2c1b3d'); // Purple hue near horizon
        }
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, Game.width, Game.height);
        
        // Draw Stars
        if (this.weather !== 'STORM') {
            ctx.fillStyle = '#ffffff';
            this.stars.forEach(star => {
                star.size += Math.sin(Date.now() * star.twinkleSpeed) * 0.1;
                ctx.globalAlpha = Math.max(0.2, Math.min(1, Math.sin(Date.now() * star.twinkleSpeed)));
                ctx.beginPath();
                ctx.arc(star.x, star.y, Math.max(0.5, star.size), 0, Math.PI*2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;
            
            // Draw Moon if Visarjan or Calm
            if (this.isVisarjan || Game.currentSection === 0) {
                ctx.fillStyle = '#ffeedd';
                ctx.beginPath();
                ctx.arc(Game.width * 0.8, Game.height * 0.2, 40, 0, Math.PI*2);
                ctx.fill();
                // Glow
                const moonGlow = ctx.createRadialGradient(Game.width*0.8, Game.height*0.2, 40, Game.width*0.8, Game.height*0.2, 100);
                moonGlow.addColorStop(0, 'rgba(255, 238, 221, 0.4)');
                moonGlow.addColorStop(1, 'rgba(255, 238, 221, 0)');
                ctx.fillStyle = moonGlow;
                ctx.fillRect(0, 0, Game.width, Game.height);
            }
        }
    }
    
    drawBackground(ctx) {
        // Distant city silhouette
        ctx.fillStyle = '#111222';
        this.drawSilhouetteLayer(ctx, this.bgOffset, 0.1, Game.height * 0.6, 150);
    }
    
    drawMidground(ctx) {
        // Pandals and closer buildings
        ctx.fillStyle = '#1d152b';
        this.drawSilhouetteLayer(ctx, this.midOffset, 0.3, Game.height * 0.5, 250);
        
        // Draw festive hanging lights in early sections
        if (Game.currentSection < 3 && !this.isVisarjan) {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            
            const numLights = 10;
            const segment = Game.width / 3;
            
            for (let j = 0; j < 4; j++) {
                let xStart = (j * segment) - (this.midOffset % segment);
                
                ctx.beginPath();
                ctx.moveTo(xStart, 50);
                ctx.quadraticCurveTo(xStart + segment/2, 150, xStart + segment, 50);
                ctx.stroke();
                
                // Bulbs
                for (let i = 1; i < numLights; i++) {
                    const t = i / numLights;
                    // Quadratic bezier curve point calc
                    const bx = (1-t)*(1-t)*xStart + 2*(1-t)*t*(xStart + segment/2) + t*t*(xStart + segment);
                    const by = (1-t)*(1-t)*50 + 2*(1-t)*t*150 + t*t*50;
                    
                    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
                    ctx.fillStyle = colors[i % colors.length];
                    ctx.beginPath();
                    ctx.arc(bx, by, 3, 0, Math.PI*2);
                    ctx.fill();
                    
                    // Small glow
                    ctx.fillStyle = ctx.fillStyle.replace(')', ', 0.5)').replace('rgb', 'rgba');
                    ctx.beginPath();
                    ctx.arc(bx, by, 8, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        }
    }
    
    drawForeground(ctx) {
        // Ground
        ctx.fillStyle = '#0a0510';
        ctx.fillRect(0, Game.height - 120, Game.width, 120);
        
        // Ground details (scrolling)
        ctx.fillStyle = '#1a1020';
        const groundSpeed = this.fgOffset % 100;
        for (let i = 0; i < Game.width / 100 + 2; i++) {
            ctx.fillRect(i * 100 - groundSpeed, Game.height - 110, 20, 5);
            ctx.fillRect(i * 100 - groundSpeed + 40, Game.height - 80, 15, 3);
        }
        
        // If Visarjan, draw water
        if (this.isVisarjan) {
            ctx.fillStyle = '#0f2040';
            ctx.fillRect(0, Game.height - 100, Game.width, 100);
            
            // Reflections
            ctx.fillStyle = 'rgba(255, 238, 221, 0.2)';
            for(let i=0; i<5; i++) {
                ctx.fillRect(Game.width * 0.75 + Math.sin(Date.now()*0.001 + i)*10, Game.height - 90 + (i*15), 100 - (i*10), 5);
            }
        } else if (Game.currentSection > 0 && Game.currentSection < 4) {
            // Draw crowd silhouettes in foreground
            ctx.fillStyle = '#05020a';
            const crowdOffset = this.fgOffset % 200;
            for(let i = -1; i < Game.width / 200 + 1; i++) {
                const cx = i * 200 - crowdOffset;
                // Draw a simple person shape
                ctx.beginPath();
                ctx.arc(cx, Game.height - 130, 15, 0, Math.PI*2); // Head
                ctx.fill();
                ctx.fillRect(cx - 20, Game.height - 120, 40, 120); // Body
            }
        }
    }
    
    drawSilhouetteLayer(ctx, offset, freq, baseY, variance) {
        // Very basic procedural skyline
        const sliceWidth = 100;
        const totalSlices = Math.ceil(Game.width / sliceWidth) + 2;
        
        const startIdx = Math.floor(offset / sliceWidth);
        const drawOffset = offset % sliceWidth;
        
        ctx.beginPath();
        ctx.moveTo(0, Game.height);
        
        for (let i = 0; i < totalSlices; i++) {
            const idx = startIdx + i;
            // Pseudo-random height based on index
            const h = Math.abs(Math.sin(idx * 123.45) * Math.cos(idx * 678.90)) * variance;
            ctx.lineTo(i * sliceWidth - drawOffset, baseY - h);
            ctx.lineTo((i + 1) * sliceWidth - drawOffset, baseY - h);
        }
        
        ctx.lineTo(Game.width, Game.height);
        ctx.closePath();
        ctx.fill();
    }
}
