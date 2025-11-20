export class PlatformManager {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.platforms = [];
        this.platformWidth = 80;
        this.platformHeight = 15;
        this.minGapY = 60;
        this.maxGapY = 180;

        this.reset();
    }

    reset() {
        this.platforms = [];
        // Create starting platform (Full Width for safety)
        this.platforms.push({
            x: 0,
            y: this.gameHeight - 50,
            width: this.gameWidth,
            height: this.platformHeight,
            type: 'normal',
            vx: 0
        });

        // Generate initial platforms
        let currentY = this.gameHeight - 50;
        while (currentY > 0) {
            this.generateNextPlatform();
            currentY = this.platforms[this.platforms.length - 1].y;
        }
    }

    generateNextPlatform() {
        const prevPlatform = this.platforms[this.platforms.length - 1];
        const y = prevPlatform.y - (this.minGapY + Math.random() * (this.maxGapY - this.minGapY));

        // Difficulty Scaling
        const depth = -y;
        const movingChance = Math.min(0.5, depth / 10000);
        const springChance = 0.1;

        let type = 'normal';
        let vx = 0;
        let hasSpring = false;

        if (Math.random() < movingChance) {
            type = 'moving';
            vx = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2);
        }

        if (Math.random() < springChance) {
            hasSpring = true;
        }

        const x = Math.random() * (this.gameWidth - this.platformWidth);

        this.platforms.push({
            x,
            y,
            width: this.platformWidth,
            height: this.platformHeight,
            type,
            vx,
            hasSpring
        });
    }

    update(cameraY) {
        // Remove platforms that are below the screen
        this.platforms = this.platforms.filter(p => p.y < cameraY + this.gameHeight);

        // Generate new platforms above
        const highestPlatform = this.platforms[this.platforms.length - 1];
        if (highestPlatform && highestPlatform.y > cameraY - 100) {
            let currentY = highestPlatform.y;
            while (currentY > cameraY - 100) {
                this.generateNextPlatform();
                currentY = this.platforms[this.platforms.length - 1].y;
            }
        }

        // Update moving platforms
        this.platforms.forEach(p => {
            if (p.type === 'moving') {
                p.x += p.vx;
                if (p.x <= 0 || p.x + p.width >= this.gameWidth) {
                    p.vx *= -1;
                }
            }
        });
    }

    draw(ctx, cameraY) {
        this.platforms.forEach(p => {
            // Only draw if visible
            if (p.y > cameraY && p.y < cameraY + this.gameHeight) {
                // Platform Body
                ctx.fillStyle = p.type === 'moving' ? '#ff0055' : '#646cff';
                ctx.beginPath();
                ctx.fillRect(p.x, p.y - cameraY, p.width, p.height);

                // Highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(p.x, p.y - cameraY, p.width, 4);

                // Spring
                if (p.hasSpring) {
                    ctx.fillStyle = '#00ff88';
                    ctx.fillRect(p.x + p.width / 2 - 5, p.y - cameraY - 5, 10, 5);
                }
            }
        });
    }

    checkCollision(player) {
        // Only check collision if falling
        if (player.vy < 0) return false;

        for (let p of this.platforms) {
            const playerBottom = player.y + player.height;
            const playerPrevBottom = player.prevY + player.height;

            if (
                player.x + player.width > p.x &&
                player.x < p.x + p.width &&
                playerBottom >= p.y &&
                playerPrevBottom <= p.y + p.height
            ) {
                // Snap to top of platform
                player.y = p.y - player.height;

                if (p.hasSpring) {
                    return 'spring';
                }
                return true;
            }
        }
        return false;
    }
}
