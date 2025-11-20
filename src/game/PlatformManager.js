export class PlatformManager {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.platforms = [];
        this.platformWidth = 80;
        this.platformHeight = 15;
        // Jump physics: v0 = -13, g = 0.4. Max height = v0^2 / (2g) = 169 / 0.8 = ~211.
        // Let's be safe and say max gap is 180.
        this.minGapY = 60;
        this.maxGapY = 180;

        this.reset();
    }

    reset() {
        this.platforms = [];
        // Create starting platform
        this.platforms.push({
            x: this.gameWidth / 2 - this.platformWidth / 2,
            y: this.gameHeight - 50,
            width: this.platformWidth,
            height: this.platformHeight,
            type: 'normal'
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

        // Ensure x is reachable.
        // Horizontal speed = 6. Time to peak = 13/0.4 = 32.5 frames.
        // Max horizontal distance = 6 * 32.5 = 195.
        // We can place it anywhere within range, but let's keep it simple and just random for now,
        // as the screen width is usually small enough that you can reach most places.
        // But to be safe, let's clamp it relative to previous platform if screen is huge.
        // For now, random x on screen is fine for standard mobile/desktop widths.

        const x = Math.random() * (this.gameWidth - this.platformWidth);

        this.platforms.push({
            x,
            y,
            width: this.platformWidth,
            height: this.platformHeight,
            type: 'normal'
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
    }

    draw(ctx, cameraY) {
        ctx.fillStyle = '#646cff'; // Primary color
        this.platforms.forEach(p => {
            // Only draw if visible
            if (p.y > cameraY && p.y < cameraY + this.gameHeight) {
                ctx.beginPath();
                ctx.roundRect(p.x, p.y - cameraY, p.width, p.height, 4); // Adjust for camera
                ctx.fill();

                // Add a top highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(p.x, p.y - cameraY, p.width, 4);
                ctx.fillStyle = '#646cff';
            }
        });
    }

    checkCollision(player) {
        // Only check collision if falling
        if (player.vy < 0) return false;

        for (let p of this.platforms) {
            // Improved Collision Detection (prevents tunneling)
            // Check if player passed through the platform in this frame

            const playerBottom = player.y + player.height;
            const playerPrevBottom = player.prevY + player.height;

            if (
                player.x + player.width > p.x &&
                player.x < p.x + p.width &&
                playerBottom >= p.y &&
                playerPrevBottom <= p.y + p.height // Was above or inside platform previously
            ) {
                // Snap to top of platform
                player.y = p.y - player.height;
                return true;
            }
        }
        return false;
    }
}
