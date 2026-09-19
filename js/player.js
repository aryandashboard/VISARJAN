class Player {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.width = 60;
        this.height = 40;
        this.x = Game.width * 0.2; // Start at 20% of screen width
        this.y = Game.height - 150; // Ground height
        
        this.groundY = Game.height - 150;
        this.velocityY = 0;
        this.gravity = 1500;
        this.jumpForce = 800;
        this.isGrounded = true;
        
        this.vx = 0;
        this.speed = 300; // Pixels per second
        
        // Dash state
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashCooldownTimer = 0;
        this.dashSpeedMultiplier = 2.5;
        this.facingDirection = 1; // 1 for right, -1 for left
        
        // Animation
        this.wobble = 0;
        this.legAngle = 0;
        
        // Target Y for hovering/bobbing
        this.baseY = Game.height - 150;
    }
    
    update(dt, autoMove = false) {
        // Handle Dash Cooldown
        if (this.dashCooldownTimer > 0) {
            this.dashCooldownTimer -= dt;
        }
        
        // Handle Dash Active
        if (this.isDashing) {
            this.dashTimer -= dt;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
            // Spawn trail particles
            if (Math.random() < 0.3) {
                Game.particles.createTrail(this.x + this.width/2, this.y + this.height/2);
            }
        }
        
        // Movement
        this.vx = 0;
        
        if (!autoMove) {
            if (Game.keys.a || Game.keys.ArrowLeft || Game.touch.left) {
                this.vx = -1;
                this.facingDirection = -1;
            } else if (Game.keys.d || Game.keys.ArrowRight || Game.touch.right) {
                this.vx = 1;
                this.facingDirection = 1;
            }
            
            // Dash Activation
            if ((Game.keys.Shift || Game.touch.dash) && this.dashCooldownTimer <= 0 && !this.isDashing) {
                this.activateDash();
            }
            
            // Jump Activation
            if ((Game.keys.space || Game.keys.w || Game.keys.W || Game.keys.ArrowUp || Game.touch.jump) && this.isGrounded) {
                this.velocityY = -this.jumpForce;
                this.isGrounded = false;
                if(Game.audio.playJump) Game.audio.playJump();
            }
        } else {
            // Auto move right for Visarjan ending
            this.vx = 0.5;
        }
        
        // Apply Physics (Gravity and Jump)
        if (!this.isGrounded) {
            this.velocityY += this.gravity * dt;
        }
        
        this.y += this.velocityY * dt;
        
        // Ground Collision
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.isGrounded = true;
        }
        
        // Apply velocity
        let currentSpeed = this.speed;
        let moveDirection = this.vx;
        
        if (this.isDashing) {
            currentSpeed *= this.dashSpeedMultiplier;
            // If dashing but not holding a key, dash in facing direction
            if (moveDirection === 0) moveDirection = this.facingDirection;
        }
        
        this.x += moveDirection * currentSpeed * dt;
        
        // Bounds checking (only left side)
        if (this.x < 50) this.x = 50;
        
        // Ground follow
        this.baseY = Game.height - 120; // Default ground offset
        
        // Animation
        if (this.vx !== 0 || !this.isGrounded) {
            this.legAngle = Math.sin(Date.now() * 0.015) * 20;
            this.wobble = Math.sin(Date.now() * 0.01) * 3;
        } else {
            this.legAngle = 0;
            this.wobble = 0;
        }
        
        // Environmental forces (Wind)
        if (Game.currentSection === 2 || Game.currentSection === 3) {
            // Wind pushes back slightly
            this.x -= 30 * dt;
        }
    }
    
    activateDash() {
        this.isDashing = true;
        this.dashTimer = Game.config.dashDuration;
        this.dashCooldownTimer = Game.config.dashCooldown;
        Game.audio.playDash();
        // Camera shake
        Game.environment.shake(5, 0.2);
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Procedural Mushak (Mouse)
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.width/2, this.height, this.width*0.6, 10, 0, 0, Math.PI*2);
        ctx.fill();
        
        // Tail
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, this.height - 15);
        ctx.quadraticCurveTo(-30, this.height, -40, this.height - 20 + Math.sin(this.wobble)*10);
        ctx.stroke();
        
        // Body (Dark Grey/Blue for night time)
        ctx.fillStyle = '#6e7a8a';
        ctx.beginPath();
        ctx.ellipse(this.width/2, this.height/2, this.width/2, this.height/2.5, 0, 0, Math.PI*2);
        ctx.fill();
        
        // Legs
        ctx.strokeStyle = '#4a535e';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        // Front leg
        ctx.beginPath();
        ctx.moveTo(this.width*0.7, this.height*0.8);
        ctx.lineTo(this.width*0.7 + Math.sin(this.legAngle * Math.PI/180)*10, this.height);
        ctx.stroke();
        // Back leg
        ctx.beginPath();
        ctx.moveTo(this.width*0.3, this.height*0.8);
        ctx.lineTo(this.width*0.3 - Math.sin(this.legAngle * Math.PI/180)*10, this.height);
        ctx.stroke();
        
        // Head
        ctx.fillStyle = '#6e7a8a';
        ctx.beginPath();
        ctx.ellipse(this.width*0.8, this.height*0.3, 20, 15, Math.PI/6, 0, Math.PI*2);
        ctx.fill();
        
        // Ear
        ctx.fillStyle = '#8392a3';
        ctx.beginPath();
        ctx.ellipse(this.width*0.7, this.height*0.1, 12, 12, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#e8bacb'; // inner ear
        ctx.beginPath();
        ctx.ellipse(this.width*0.7, this.height*0.1, 6, 6, 0, 0, Math.PI*2);
        ctx.fill();
        
        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.width*0.85, this.height*0.25, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.width*0.87, this.height*0.25, 2, 0, Math.PI*2);
        ctx.fill();
        
        // The Diya (Carried on back/hands)
        this.drawDiya(ctx, this.width*0.5, -5);
        
        if (Game.debugMode) {
            ctx.strokeStyle = 'blue';
            ctx.strokeRect(0, 0, this.width, this.height);
        }
        
        ctx.restore();
    }
    
    drawDiya(ctx, dx, dy) {
        ctx.save();
        ctx.translate(dx, dy);
        
        // Diya Base (Clay)
        ctx.fillStyle = '#a65e2e';
        ctx.beginPath();
        ctx.arc(0, 10, 12, 0, Math.PI, false); // Bottom half circle
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#8c4f26';
        ctx.beginPath();
        ctx.ellipse(0, 10, 12, 4, 0, 0, Math.PI*2); // Top rim
        ctx.fill();
        
        // Flame
        if (Game.flame && Game.flame.current > 0) {
            const flicker = Math.random() * 0.2 + 0.9;
            const size = (Game.flame.current / 100) * 1.5 + 0.5; // Flame size based on health
            
            // Outer glow
            ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
            ctx.beginPath();
            ctx.ellipse(0, 4, 8 * size * flicker, 15 * size * flicker, 0, 0, Math.PI*2);
            ctx.fill();
            
            // Inner flame
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.moveTo(0, -10 * size * flicker);
            ctx.quadraticCurveTo(6 * size, 8, 0, 10);
            ctx.quadraticCurveTo(-6 * size, 8, 0, -10 * size * flicker);
            ctx.fill();
            
            // Core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(0, -2 * size);
            ctx.quadraticCurveTo(2 * size, 8, 0, 9);
            ctx.quadraticCurveTo(-2 * size, 8, 0, -2 * size);
            ctx.fill();
            
            // Spawn flame particles occasionally
            if (Math.random() < 0.1 * size) {
                Game.particles.createFlameSpark(Game.player.x + dx, Game.player.y + dy);
            }
        }
        
        ctx.restore();
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        };
    }
}
