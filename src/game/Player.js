export class Player {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.width = 40;
    this.height = 40;
    this.x = gameWidth / 2 - this.width / 2;
    this.y = gameHeight - 150;
    this.prevY = this.y; // For collision detection
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0.4; // Floatier
    this.jumpStrength = -13; // Higher jump for floatier gravity
    this.speed = 6; // Slightly faster movement
    this.color = '#00ff88';
  }

  update(input) {
    this.prevY = this.y;

    // Horizontal movement
    if (input.left) this.vx = -this.speed;
    else if (input.right) this.vx = this.speed;
    else this.vx = 0;

    this.x += this.vx;

    // Screen wrapping
    if (this.x + this.width < 0) this.x = this.gameWidth;
    if (this.x > this.gameWidth) this.x = -this.width;

    // Vertical movement (Physics)
    this.vy += this.gravity;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    // Draw a simple rounded rectangle or character
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 5);
    ctx.fill();

    // Add some eyes for character
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x + 10, this.y + 12, 5, 0, Math.PI * 2);
    ctx.arc(this.x + 30, this.y + 12, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(this.x + 10 + (this.vx > 0 ? 2 : -2), this.y + 12, 2, 0, Math.PI * 2);
    ctx.arc(this.x + 30 + (this.vx > 0 ? 2 : -2), this.y + 12, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  jump(isSuper = false) {
    this.vy = isSuper ? this.jumpStrength * 1.5 : this.jumpStrength;
  }
}
