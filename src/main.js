import { Player } from './game/Player.js';
import { PlatformManager } from './game/PlatformManager.js';
import { ParticleSystem } from './game/ParticleSystem.js';

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
let highScore = localStorage.getItem('goup_highscore') || 0;
let cameraY = 0;

// Game Objects
let player;
let platformManager;
let particleSystem;

// Background Stars
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
    });
}

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
    // Re-distribute stars on resize
    stars.forEach(s => {
        s.x = Math.random() * canvas.width;
        s.y = Math.random() * canvas.height;
    });
}
window.addEventListener('resize', resize);
resize();

function initGame() {
    player = new Player(canvas.width, canvas.height);
    platformManager = new PlatformManager(canvas.width, canvas.height);
    particleSystem = new ParticleSystem();
    score = 0;
    cameraY = 0;
    scoreDisplay.innerText = `Score: 0 | High: ${highScore}`;
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

    if (score > highScore) {
        highScore = Math.floor(score);
        localStorage.setItem('goup_highscore', highScore);
    }

    finalScoreDisplay.innerText = `Score: ${Math.floor(score)} | Best: ${highScore}`;
}

function update() {
    if (gameState !== 'PLAYING') return;

    player.update(input);

    // Camera Logic: Move camera up if player goes above 1/3 of screen
    const targetY = player.y - canvas.height / 2;
    if (targetY < cameraY) {
        cameraY = targetY;
        score = Math.max(score, -cameraY); // Score is based on height
        scoreDisplay.innerText = `Score: ${Math.floor(score)} | High: ${highScore}`;
        gameOver();
    }
}

function draw() {
    // Clear background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Stars (Parallax)
    ctx.fillStyle = 'white';
    stars.forEach(s => {
        // Parallax effect: stars move slower than camera
        let y = (s.y - cameraY * s.speed) % canvas.height;
        if (y < 0) y += canvas.height;
        ctx.beginPath();
        ctx.arc(s.x, y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });

    if (gameState === 'PLAYING' || gameState === 'GAMEOVER') {
        platformManager.draw(ctx, cameraY);
        particleSystem.draw(ctx, cameraY);

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
