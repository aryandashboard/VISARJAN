class EntityManager {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.collectibles = [];
        this.obstacles = [];
        
        this.spawnTimer = 0;
        this.nextSpawnDelay = 1.0;
        
        this.graceTimer = 5.0; // 5 seconds grace period at start
        
        // Definitions
        this.itemTypes = [
            { type: 'FLOWER', flame: 5, score: 10, dev: 10, color: '#ff3366', chance: 50, emoji: '🌺' },
            { type: 'OIL', flame: 20, score: 20, dev: 5, color: '#ffcc00', chance: 30, emoji: '🛢️' },
            { type: 'DIYA', flame: 10, score: 30, dev: 15, color: '#ff6600', chance: 18, emoji: '🪔' },
            { type: 'GOLDEN_DIYA', flame: 40, score: 100, dev: 50, color: '#ffffff', chance: 2, emoji: '✨' }
        ];
        
        // The level is pre-populated, so we just reset the arrays
        this.populateLevel();
    }
    
    populateLevel() {
        // Explicit tutorial sequence
        const explicitItems = [
            { x: 250, type: 'FLOWER', airborne: false },
            { x: 450, type: 'OIL', airborne: false },
            { x: 650, type: 'OBSTACLE' },
            { x: 850, type: 'DIYA', airborne: false },
            { x: 1100, type: 'OBSTACLE' },
            { x: 1300, type: 'DIYA', airborne: true },
            { x: 1500, type: 'GOLDEN_DIYA', airborne: false }
        ];
        
        explicitItems.forEach(item => this.spawnAt(item.x, item.type, item.airborne));
        
        // Randomly fill the rest of the world up to max distance
        let currentX = 1800;
        let maxDist = Game.config.maxDistance;
        while(currentX < maxDist - 300) {
            let isObstacle = Math.random() < 0.3;
            if (isObstacle) {
                this.spawnAt(currentX, 'OBSTACLE');
            } else {
                // Pick random item
                let roll = Math.random() * 100;
                let currentAccum = 0;
                let selectedType = this.itemTypes[0];
                for (let item of this.itemTypes) {
                    currentAccum += item.chance;
                    if (roll <= currentAccum) {
                        selectedType = item;
                        break;
                    }
                }
                let airborne = Math.random() < 0.2;
                this.spawnAt(currentX, selectedType.type, airborne);
            }
            currentX += 200 + Math.random() * 150; // Random gap
        }
    }
    
    spawnAt(x, typeStr, airborne = false) {
        if (typeStr === 'OBSTACLE') {
            this.obstacles.push({
                x: x,
                y: Game.height - 150, // Ground level
                width: 50,
                height: 50,
                type: 'BARRICADE',
                emoji: '🚧',
                hit: false,
                id: Math.random()
            });
        } else {
            let selectedType = this.itemTypes.find(t => t.type === typeStr);
            let yPos = Game.height - 150;
            if (airborne) yPos -= 130;
            this.collectibles.push({
                x: x,
                y: yPos,
                width: 40,
                height: 40,
                data: selectedType,
                hoverOffset: 0,
                id: Math.random()
            });
        }
    }
    
    update(dt) {
        if (Game.state !== 'PLAYING' || Game.environment.isVisarjan) return;
        
        // Update Collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            let c = this.collectibles[i];
            
            // Hover animation
            c.hoverOffset = Math.sin(Date.now() * 0.005 + c.id) * 10;
            
            // Collision with player
            if (this.checkCollision(Game.player.getBounds(), this.getBounds(c))) {
                this.collectItem(c);
                this.collectibles.splice(i, 1);
                continue;
            }
        }
        
        // Update Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let o = this.obstacles[i];
            
            // Collision with player
            if (!o.hit && this.checkCollision(Game.player.getBounds(), this.getBounds(o))) {
                this.hitObstacle(o);
                o.hit = true; // Prevent multiple hits
            }
        }
    }
    
    // spawnEntity and spawnScripted removed as we populate level upfront.
    
    getBounds(entity) {
        return {
            x: entity.x,
            y: entity.y + (entity.hoverOffset || 0),
            w: entity.width,
            h: entity.height
        };
    }
    
    checkCollision(rect1, rect2) {
        // Make hitboxes slightly forgiving (smaller than actual drawing)
        const marginX = 10;
        const marginY = 10;
        
        return (
            rect1.x + marginX < rect2.x + rect2.w - marginX &&
            rect1.x + rect1.w - marginX > rect2.x + marginX &&
            rect1.y + marginY < rect2.y + rect2.h - marginY &&
            rect1.h + rect1.y - marginY > rect2.y + marginY
        );
    }
    
    collectItem(item) {
        Game.flame.addFlame(item.data.flame);
        Game.flame.addDevotion(item.data.dev);
        Game.addScore(item.data.score);
        
        Game.particles.createFloatingText(`+${item.data.flame} Flame`, item.x, item.y - 20, item.data.color);
        
        if (item.data.type === 'GOLDEN_DIYA') {
            Game.audio.playSpecial();
        } else {
            Game.audio.playCollect();
        }
    }
    
    hitObstacle(obstacle) {
        if (Game.flame.isBappaBlessingActive) {
            // Smash through obstacle during blessing!
            Game.particles.createImpactEffect(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
            Game.audio.playImpact();
            return;
        }
        
        // Normal hit
        Game.flame.current -= 15; // Damage
        Game.audio.playImpact();
        Game.environment.shake(8, 0.3);
        Game.particles.createImpactEffect(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
        Game.particles.createFloatingText("-15 Flame", obstacle.x, obstacle.y - 20, '#ff3300');
        
        // Push player back slightly
        Game.player.x -= 30;
    }
    
    draw(ctx) {
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const padding = 100;
        
        for (let c of this.collectibles) {
            // Only draw if within screen
            if (c.x < Game.camera.x - padding || c.x > Game.camera.x + Game.width + padding) continue;
            
            ctx.fillText(c.data.emoji, c.x + c.width/2, c.y + c.hoverOffset + c.height/2);
            
            if (Game.debugMode) {
                ctx.strokeStyle = 'lime';
                ctx.lineWidth = 2;
                ctx.strokeRect(c.x, c.y + c.hoverOffset, c.width, c.height);
            }
        }
        
        for (let o of this.obstacles) {
            if (o.x < Game.camera.x - padding || o.x > Game.camera.x + Game.width + padding) continue;
            
            ctx.globalAlpha = o.hit ? 0.3 : 1.0;
            ctx.fillText(o.emoji, o.x + o.width/2, o.y + o.height/2);
            ctx.globalAlpha = 1.0;
            
            if (Game.debugMode) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.strokeRect(o.x, o.y, o.width, o.height);
            }
        }
    }
}
