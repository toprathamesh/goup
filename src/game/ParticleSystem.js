export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, color = 'white', count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1.0,
                color,
                size: Math.random() * 3 + 2
            });
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            p.size *= 0.95;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx, cameraY) {
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y - cameraY, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }
}
