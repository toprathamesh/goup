import { Player } from './game/Player.js';
import { PlatformManager } from './game/PlatformManager.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const menuScreen = document.getElementById('menu-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreDisplay = document.getElementById('score-display');
const finalScoreDisplay = document.getElementById('final-score');

// Game State
let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
let score = 0;
let cameraY = 0;

// Game Objects
let player;
let platformManager;

// Input State (Singleton)
const input = {
    left: false,
    right: false
};

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;

    if (e.code === 'Space') {
        if (gameState === 'MENU' || gameState === 'GAMEOVER') {
            startGame();
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;
});

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initGame() {
    player = new Player(canvas.width, canvas.height);
    platformManager = new PlatformManager(canvas.width, canvas.height);
    score = 0;
    cameraY = 0;
    scoreDisplay.innerText = `Score: 0`;
}

function startGame() {
    gameState = 'PLAYING';
    menuScreen.classList.remove('active');
    menuScreen.classList.add('hidden');
    gameOverScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');
    initGame();
    // Loop is already running
}

function gameOver() {
    gameState = 'GAMEOVER';
    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('active');
    finalScoreDisplay.innerText = `Score: ${Math.floor(score)}`;
}

function update() {
    if (gameState !== 'PLAYING') return;

    player.update(input);

    // Camera Logic: Move camera up if player goes above 1/3 of screen
    const targetY = player.y - canvas.height / 2;
    if (targetY < cameraY) {
        cameraY = targetY;
        score = Math.max(score, -cameraY); // Score is based on height
        scoreDisplay.innerText = `Score: ${Math.floor(score)}`;
    }

    // Platform Logic
    platformManager.update(cameraY);

    // Collision
    if (platformManager.checkCollision(player)) {
        player.jump();
    }

    // Game Over Condition
    if (player.y > cameraY + canvas.height) {
        gameOver();
    }
}

function draw() {
    // Clear background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING' || gameState === 'GAMEOVER') {
        platformManager.draw(ctx, cameraY);

        // Draw Player
        ctx.save();
        ctx.translate(0, -cameraY);
        player.draw(ctx);
        ctx.restore();
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
