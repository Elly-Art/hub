// --- Setup Stars Background ---
function createStars() {
    const container = document.getElementById('starContainer');
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
        container.appendChild(star);
    }
}

// --- Navigation Logic ---
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.game-view');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.game;
        
        navButtons.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`game-${target}`).classList.add('active');
        
        // Context-aware initialization
        if(target === 'draw') initDraw();
        if(target === 'memory') initMemoryGame();
        if(target === 'shatter') initShatter();
    });
});

// --- GAME 1: Magic Button ---
let count = 0;
const magicBtn = document.getElementById('magicButton');
const countDisplay = document.getElementById('pressCount');

magicBtn.addEventListener('click', (e) => {
    count++;
    countDisplay.textContent = count;
    createEffect(e.clientX, e.clientY);
});

function createEffect(x, y) {
    for (let i = 0; i < 8; i++) {
        const bubble = document.createElement('div');
        const size = Math.random() * 20 + 10;
        
        Object.assign(bubble.style, {
            position: 'fixed',
            left: `${x}px`,
            top: `${y}px`,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: `hsl(${Math.random() * 360}, 70%, 60%)`,
            pointerEvents: 'none',
            zIndex: '100',
            transition: 'all 0.6s ease-out'
        });

        document.body.appendChild(bubble);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50;
        
        setTimeout(() => {
            bubble.style.transform = `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`;
            bubble.style.opacity = '0';
        }, 10);

        setTimeout(() => bubble.remove(), 700);
    }
}

// --- NEW GAME: Animal Shatter ---
const animals = ['🦁', '🐯', '🦒', '🐘', '🦏', '🦓', '🐊', '🐆', '🐒', '🦍'];
const shatterTarget = document.getElementById('shatter-target');
const shatterCanvas = document.getElementById('shatterCanvas');
const shatterCountDisplay = document.getElementById('shatterCount');
let shatterCount = 0;
let particles = [];
let shatterCtx;

function initShatter() {
    shatterCanvas.width = 400;
    shatterCanvas.height = 400;
    shatterCtx = shatterCanvas.getContext('2d');
}

function createParticles(x, y) {
    const count = 40;
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            size: Math.random() * 10 + 5,
            color: `hsl(${Math.random() * 360}, 80%, 60%)`,
            life: 1.0
        });
    }
}

function updateShatter() {
    if (!shatterCtx) return;
    shatterCtx.clearRect(0, 0, shatterCanvas.width, shatterCanvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravity
        p.life -= 0.02;
        
        shatterCtx.globalAlpha = p.life;
        shatterCtx.fillStyle = p.color;
        shatterCtx.beginPath();
        shatterCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        shatterCtx.fill();
        
        if (p.life <= 0) particles.splice(i, 1);
    }
    
    if (particles.length > 0) {
        requestAnimationFrame(updateShatter);
    }
}

document.getElementById('shatterContainer').addEventListener('click', (e) => {
    if (particles.length > 0) return; // Prevent spam

    shatterCount++;
    shatterCountDisplay.textContent = shatterCount;
    
    // Play shatter animation
    createParticles(shatterCanvas.width / 2, shatterCanvas.height / 2);
    updateShatter();
    
    // Change animal
    shatterTarget.style.opacity = '0';
    shatterTarget.style.transform = 'scale(0.1)';
    
    setTimeout(() => {
        const currentAnimal = shatterTarget.textContent;
        let nextAnimal = currentAnimal;
        while(nextAnimal === currentAnimal) {
            nextAnimal = animals[Math.floor(Math.random() * animals.length)];
        }
        shatterTarget.textContent = nextAnimal;
        shatterTarget.style.opacity = '1';
        shatterTarget.style.transform = 'scale(1)';
    }, 400);
});

// --- GAME 2: Rainbow Paint ---
let isDrawing = false;
let ctx;
let hue = 0;

function initDraw() {
    const canvas = document.getElementById('paintCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    // Resize canvas to fit container
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 20;

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPosition(e.touches[0]); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e.touches[0]); });
    canvas.addEventListener('touchend', finishedPosition);
}

function startPosition(e) {
    isDrawing = true;
    draw(e);
}

function finishedPosition() {
    isDrawing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!isDrawing) return;
    
    const canvas = document.getElementById('paintCanvas');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;

    ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    hue++;
    if (hue >= 360) hue = 0;
}

document.getElementById('clearCanvas').addEventListener('click', () => {
    if(ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
});

// --- GAME 3: Bubble Pop ---
const arena = document.getElementById('bubble-arena');
const scoreDisplay = document.getElementById('bubble-score');
let bubbleScore = 0;

function spawnBubble() {
    if (!document.getElementById('game-bubbles').classList.contains('active')) return;
    
    const bubble = document.createElement('div');
    const size = Math.random() * 40 + 40;
    bubble.className = 'bubble';
    
    Object.assign(bubble.style, {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 80 + 10}%`,
        '--speed': `${Math.random() * 2 + 3}s`,
        background: `hsla(${Math.random() * 360}, 70%, 70%, 0.4)`
    });

    bubble.addEventListener('mousedown', () => {
        bubbleScore++;
        scoreDisplay.textContent = `Score: ${bubbleScore}`;
        bubble.remove();
    });

    arena.appendChild(bubble);
    setTimeout(() => bubble.remove(), 5000);
}

setInterval(spawnBubble, 1000);

// --- GAME 4: Musical Emojis ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playNote(frequency) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
}

const notes = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25
};

document.querySelector('.music-keyboard').addEventListener('click', (e) => {
    const key = e.target.closest('.music-key');
    if (!key) return;
    const note = key.dataset.note;
    playNote(notes[note]);
});

// --- GAME 5: Cosmic Match ---
const emojis = ['🚀', '🪐', '⭐', '👨‍🚀', '👽', '🛸', '🛰️', '🌑'];
let cards = [];
let flippedCards = [];
let lockGrid = false;

function initMemoryGame() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-front">✨</div>
            <div class="card-back">${emoji}</div>
        `;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (lockGrid || this.classList.contains('flipped')) return;

    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        lockGrid = true;
        const [c1, c2] = flippedCards;
        if (c1.dataset.emoji === c2.dataset.emoji) {
            c1.classList.add('matched');
            c2.classList.add('matched');
            flippedCards = [];
            lockGrid = false;
        } else {
            setTimeout(() => {
                c1.classList.remove('flipped');
                c2.classList.remove('flipped');
                flippedCards = [];
                lockGrid = false;
            }, 1000);
        }
    }
}

document.getElementById('resetMemory').addEventListener('click', initMemoryGame);

// Initialize
createStars();
initShatter();
