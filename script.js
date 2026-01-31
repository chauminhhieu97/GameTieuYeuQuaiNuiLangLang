
// State
const state = {
    arrows: 5000,
    clicks: 0,
    timeIndex: 0, // 0: dawn, 1: day, 2: dusk, 3: night
    inventory: [],
    autoClickers: 0,
    // Phase 5: Mini-game state
    combo: 0,
    comboTimer: null,
    frenzyHeat: 0,
    frenzyActive: false,
    lastClickTime: 0,
    // Phase 7: Upgrades State
    upgrades: {
        ant: 0,
        spider: 0,
        mattress: 0,
        mirror: 0,
        tea: 0,
        // Characters (1 = owned)
        frog: 0,
        bear: 0
    },
    activeCharacter: 'pig',
    // Phase 6: Stress System
    stress: 0,
    maxStress: 100,
    isBurnedOut: false,
    // Phase 6: Rhythm Game (Meeting)
    meetingActive: false,
    meetingScore: 0,
    meetingMaxNotes: 10,
    meetingNotesSpawned: 0,
    inputBuffer: false, // Prevent spamming
    // Performance
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    particleMultiplier: 1
};

// Adjust performance based on device
if (state.isMobile) {
    state.particleMultiplier = 0.3; // Reduce particles to 30% on mobile
}

// Config
const DAY_CYCLE_DURATION = 15000; // Slower day cycle
const DIALOGUE_CHANCE = 0.15;
const GACHA_COST = 50;
const HIRE_COST = 500;

// DOM Elements
const els = {
    score: document.getElementById('score'),
    sky: document.getElementById('sky-layer'),
    pig: document.getElementById('pig-char'),
    hitbox: document.getElementById('grind-stone-hitbox'),
    feedback: document.getElementById('feedback-container'),
    particlesLayer: (() => {
        let el = document.getElementById('particles-layer');
        if (!el) { // Create if missing from HTML, though CSS has it
            el = document.createElement('div');
            el.id = 'particles-layer';
            document.getElementById('game-container').appendChild(el);
        }
        return el;
    })(),
    dialogueBox: document.getElementById('dialogue-box'),
    dialogueText: document.getElementById('dialogue-text'),
    arrowPile: document.getElementById('arrow-pile'),
    shopBtn: document.getElementById('shop-btn'),
    modal: document.getElementById('gacha-modal'),
    closeModal: document.querySelector('.close-btn'),
    rollBtn: document.getElementById('roll-btn'),
    rewardDisplay: document.getElementById('reward-display'),
    rewardIcon: document.getElementById('reward-icon'),
    rewardName: document.getElementById('reward-name'),
    rewardDesc: document.getElementById('reward-desc'),
    // Inventory
    inventoryBtn: document.getElementById('inventory-btn'),
    inventoryModal: document.getElementById('inventory-modal'),
    closeInventory: document.querySelector('.close-inventory'),
    inventoryGrid: document.getElementById('inventory-grid'),
    clickPowerDisp: document.getElementById('click-power'),
    autoPowerDisp: document.getElementById('auto-power'),
    hireBtn: document.getElementById('hire-btn'),
    // Phase 5: Mini-games
    spiritLayer: document.getElementById('spirit-layer'),
    comboDisplay: document.getElementById('combo-display'),
    comboCount: document.getElementById('combo-count'),
    frenzyBar: document.getElementById('frenzy-bar'),
    frenzyContainer: document.getElementById('frenzy-container'),
    // Phase 7: Upgrades UI
    recruitBtn: document.getElementById('recruit-btn'),
    furnitureBtn: document.getElementById('furniture-btn'),
    recruitModal: document.getElementById('recruit-modal'),
    furnitureModal: document.getElementById('furniture-modal'),
    closeRecruit: document.querySelector('.close-recruit'),
    closeFurniture: document.querySelector('.close-furniture'),
    recruitList: document.getElementById('recruit-list'),
    furnitureList: document.getElementById('furniture-list'),
    // Phase 6: Stress System
    stressBar: document.getElementById('stress-bar'),
    stressLabel: document.getElementById('stress-label'),
    stressIcon: document.getElementById('stress-icon'),
    screamBtn: document.getElementById('scream-btn'),
    eatBtn: document.getElementById('eat-btn'),
    burnoutOverlay: document.getElementById('burnout-overlay'),
    burnoutOverlay: document.getElementById('burnout-overlay'),
    gameContainer: document.getElementById('game-container'),
    // Phase 6: Rhythm Game
    meetingOverlay: document.getElementById('meeting-overlay'),
    targetZone: document.getElementById('target-zone'),
    notesContainer: document.getElementById('notes-container'),
    meetingFeedback: document.getElementById('meeting-feedback'),
    meetingStatus: document.getElementById('meeting-status'),
    comboStreak: document.getElementById('combo-streak')
};

// Data
const dialogues = {
    self: [
        "Mẹ ơi con đói...",
        "Sắp xong rồi, cố lên...",
        "Đại Vương hôm nay trông dữ quá...",
        "Nhớ món canh củ cải ghê...",
        "Mài, mài nữa, mài mãi...",
        "Tay mỏi quá...",
        "Ước gì có máy mài tự động..."
    ],
    boss: [
        "Lại lười biếng à!",
        "KPI hôm nay đâu?",
        "Tao mà bị mắng thì chúng mày chết với tao!",
        "Làm nhanh lên, tối nay tăng ca!",
        "Không làm xong thì nhịn cơm!"
    ]
};

const items = [
    // Scrap 60%
    { name: "Vụn sắt vụn", desc: "Chả làm được gì (+1 damage)", type: "scrap", chance: 0.3, icon: "🔩" },
    { name: "Lá cây khô", desc: "Gió thổi bay mất rồi", type: "scrap", chance: 0.15, icon: "🍂" },
    { name: "Mẩu bánh thiu", desc: "Ăn vào đau bụng thôi", type: "scrap", chance: 0.15, icon: "🤢" },
    // Common 30%
    { name: "Bình rượu", desc: "Say xỉn nhưng làm hăng hơn (+crit)", type: "common", chance: 0.15, icon: "🍶" },
    { name: "Đá mài xịn", desc: "Mài sắc hơn hẳn (+5 damage)", type: "common", chance: 0.15, icon: "🪨" },
    // Rare 8%
    { name: "Mũ rơm", desc: "Che nắng đỡ mệt (+crit)", type: "rare", chance: 0.04, icon: "👒" },
    { name: "Tạp dề mới", desc: "Trông chuyên nghiệp hẳn", type: "rare", chance: 0.04, icon: "🎽" },
    // Legendary 2%
    { name: "Mảnh bản đồ", desc: "Đường về nhà...", type: "legendary", chance: 0.01, icon: "🗺️" },
    { name: "Lông Tôn Ngộ Không", desc: "Quyền năng vô hạn!", type: "legendary", chance: 0.01, icon: "🐒" },
    { name: "Lông Tôn Ngộ Không", desc: "Quyền năng vô hạn!", type: "legendary", chance: 0.01, icon: "🐒" }
];

// Upgrades Data
const upgradeData = {
    ant: { name: "Yêu Kiến", desc: "Chăm chỉ mài dùm bạn (+1 Auto/s)", baseCost: 50, type: "recruit", icon: "🐜" },
    spider: { name: "Nhện Tinh", desc: "Giăng tơ giữ đá, mài bén hơn (+5 Power)", baseCost: 200, type: "recruit", icon: "🕷️" },
    mattress: { name: "Nệm Êm", desc: "Nằm sướng quá quên cả stress (-10% Stress Gain)", baseCost: 500, type: "furniture", icon: "🛏️" },
    mirror: { name: "Gương Thần", desc: "Tự ngắm mình thấy đẹp trai quá (+5% Crit)", baseCost: 800, type: "furniture", icon: "🪞" },
    tea: { name: "Trà Đạo", desc: "Uống miếng trà, lòng thanh thản (-1 Stress/s)", baseCost: 1000, type: "furniture", icon: "🍵" },
    // Characters
    frog: { name: "Ếch Cốm", desc: "Nhỏ nhưng có võ. Nhảy nhót lung tung.", baseCost: 1000, type: "character", icon: "assets/frog_imp.png" },
    bear: { name: "Gấu Ngố", desc: "To xác nhưng hiền khô. Đấm phát chết luôn.", baseCost: 2500, type: "character", icon: "assets/bear_imp.png" }
};

// Cycles
const timeClasses = ['time-dawn', 'time-day', 'time-dusk', 'time-night'];

function updateTime() {
    state.timeIndex = (state.timeIndex + 1) % timeClasses.length;
    els.sky.className = timeClasses[state.timeIndex];
}

setInterval(updateTime, DAY_CYCLE_DURATION);

// Auto-Grinder Loop (1s)
setInterval(() => {
    if (state.autoClickers > 0) {
        // Distribute visuals over the second
        const perTick = Math.ceil(state.autoClickers / 5); // 5 ticks per sec visual
        let left = state.autoClickers;

        // Instant logical update
        state.arrows += state.autoClickers;
        updateUI(); // This includes button states

        // Visuals
        spawnFeedback(
            els.pig.getBoundingClientRect().left + 150,
            els.pig.getBoundingClientRect().top + 100,
            state.autoClickers,
            false,
            true // isAuto
        );
    }

    // Passive Stress Relief (Tea)
    if (state.upgrades.tea > 0) {
        // -1 stress per level per second
        const relief = state.upgrades.tea * 1;
        if (state.stress > 0 && !state.isBurnedOut) {
            state.stress = Math.max(0, state.stress - relief);
            updateStressUI();
            // Maybe occasional steam particle?
        }
    }
}, 1000);

// Core Mechanics
function clickGrind(e) {
    if (state.isBurnedOut) return; // Disable clicking during burnout

    state.clicks++;

    // Calculate power
    let power = calculateClickPower();
    const isCrit = Math.random() < calculateCritChance();

    // Frenzy bonus
    if (state.frenzyActive) {
        power *= 2;
    }

    const gain = isCrit ? power * 5 : power;
    state.arrows += gain;

    // Combo System
    updateCombo();

    // Frenzy Heat System
    updateFrenzyHeat();

    // Immediate UI Feedback
    updateUI();
    animatePig();

    // Juicy Effects
    spawnShockwave(e.clientX, e.clientY);
    spawnFeedback(e.clientX, e.clientY, gain, isCrit);

    // NEW: Screen Shake & Flash
    if (isCrit) {
        document.body.classList.remove('shake-screen');
        void document.body.offsetWidth;
        document.body.classList.add('shake-screen');
        Haptics.heavy(); // Crit Impact
    } else {
        Haptics.light(); // Normal grind
    }

    // Hit flash on pig
    els.pig.classList.add('hit-flash');
    setTimeout(() => els.pig.classList.remove('hit-flash'), 50);

    // Audio
    playSound(isCrit ? 'crit' : 'grind');

    // Fly resources to score
    const scoreRect = els.score.getBoundingClientRect();
    const targetX = scoreRect.left + scoreRect.width / 2;
    const targetY = scoreRect.top + scoreRect.height / 2;
    spawnFlyingResource(e.clientX, e.clientY, targetX, targetY);

    addArrowVisual();

    // Random Dialogue
    if (Math.random() < DIALOGUE_CHANCE) {
        showDialogue();
    }

    // Sweat when clicking fast
    const now = Date.now();
    if (now - state.lastClickTime < 200) {
        spawnSweatDrop();
    }
    // Stress System
    calculateStress(now);

    state.lastClickTime = now;
}

function calculateStress(now) {
    if (state.isBurnedOut) return;

    // Fast clicking increases stress
    // Mattress reduces stress gain (10% per level)
    let stressGain = 0.5;
    if (now - state.lastClickTime < 150) { // Very fast
        stressGain = 2.0;
    }

    // Apply Mattress reduction
    if (state.upgrades.mattress > 0) {
        const reduction = Math.min(0.9, state.upgrades.mattress * 0.1); // Cap at 90% reduction
        stressGain *= (1 - reduction);
    }

    if (now - state.lastClickTime < 300) { // Fast/Very Fast
        state.stress += stressGain;
    } else {
        // Slow clicking reduces stress slightly
        state.stress = Math.max(0, state.stress - 0.2);
    }

    // Cap stress
    state.stress = Math.min(state.maxStress, state.stress);

    // Check Burnout
    if (state.stress >= state.maxStress) {
        triggerBurnout();
    }

    updateStressUI();
}

function triggerBurnout() {
    state.isBurnedOut = true;
    els.gameContainer.classList.add('burnout');
    playSound('ui'); // Fail sound?

    // Disable controls via flag effectively (clickGrind checks nothing but we can add check)
    // Actually clickGrind doesn't check isBurnedOut yet.

    setTimeout(() => {
        state.isBurnedOut = false;
        state.stress = 0;
        els.gameContainer.classList.remove('burnout');
        updateStressUI();
        playSound('fanfare'); // Recover sound
    }, 10000); // 10 seconds punishment
}

function updateStressUI() {
    const pct = (state.stress / state.maxStress) * 100;
    els.stressBar.style.width = `${pct}%`;

    if (state.stress > 80) {
        els.stressBar.classList.add('danger');
        els.stressIcon.textContent = "🤬";
    } else if (state.stress > 50) {
        els.stressBar.classList.remove('danger');
        els.stressIcon.textContent = "😫";
    } else {
        els.stressBar.classList.remove('danger');
        els.stressIcon.textContent = "😐";
    }

    // Update label
    els.stressLabel.textContent = `ÁP LỰC: ${Math.floor(state.stress)}%`;
}

function relieveStress(amount) {
    if (state.isBurnedOut) return;
    state.stress = Math.max(0, state.stress - amount);
    updateStressUI();
    playSound('ui');

    // Visual feedback
    spawnFeedback(
        els.pig.getBoundingClientRect().left + 50,
        els.pig.getBoundingClientRect().top,
        "Chill",
        false
    );
}

function updateUI() {
    els.score.textContent = state.arrows;
    // Pop effect
    els.score.parentElement.classList.remove('anim-pop');
    void els.score.parentElement.offsetWidth;
    els.score.parentElement.classList.add('anim-pop');
    updateProgressBar();

    // Affordability Pulse
    if (state.arrows >= GACHA_COST) {
        els.shopBtn.classList.add('btn-pulse');
    } else {
        els.shopBtn.classList.remove('btn-pulse');
    }
}

// Sprite Animation System (24fps Standard)
// Sprite Animation System V2 (Row-based Sequential)
class SpriteAnimator {
    constructor(elementId, config = {}) {
        this.el = document.getElementById(elementId);
        this.fps = config.fps || 24;
        this.frameInterval = 1000 / this.fps;
        this.lastTime = 0;

        // Dimensions
        // Assumes uniform grid cells. 
        // cols: Max frames across (for width calculation)
        // rows: Total states down (for height calculation)
        this.cols = config.cols || 1;
        this.rows = config.rows || 1;

        // State Config: { 'name': { row: 0, frames: 8, loop: true } }
        this.states = config.states || {};

        this.currentState = 'idle';
        this.currentFrame = 0;
        this.isPlaying = true;

        // Set initial style
        this.updateBackgroundSize();

        // Start Loop
        requestAnimationFrame(this.animate.bind(this));
    }

    updateBackgroundSize() {
        if (!this.el) return;
        // background-size: (cols * 100)% (rows * 100)%
        // Example: 12 cols -> 1200%, 3 rows -> 300%
        // This ensures 1 frame = 100% of container width/height
        this.el.style.backgroundSize = `${this.cols * 100}% ${this.rows * 100}%`;
    }

    setState(stateName) {
        if (this.states[stateName] && this.currentState !== stateName) {
            this.currentState = stateName;
            this.currentFrame = 0;
        }
    }

    animate(time) {
        requestAnimationFrame(this.animate.bind(this));

        if (!this.isPlaying || !this.el) return;

        const delta = time - this.lastTime;
        if (delta > this.frameInterval) {
            this.lastTime = time - (delta % this.frameInterval);

            const stateData = this.states[this.currentState];
            if (!stateData) return;

            // Calculate Positions
            const row = stateData.row;
            // Support colOffset to start at a specific column
            const startCol = stateData.colOffset || 0;
            const frame = this.currentFrame + startCol;

            // Percentage positions
            // X: frame / (cols - 1) * 100
            // Y: row / (rows - 1) * 100
            // Note: If cols=1, div by 0 check needed, but cols always >=1 for sprite sheets

            const xPos = this.cols > 1 ? frame * (100 / (this.cols - 1)) : 0;
            const yPos = this.rows > 1 ? row * (100 / (this.rows - 1)) : 0;

            this.el.style.backgroundPosition = `${xPos}% ${yPos}%`;

            // Ink Boil (Jitter) - Preserved for 24fps feel on static images
            const boilX = (Math.random() - 0.5) * 2;
            const boilY = (Math.random() - 0.5) * 2;
            this.el.style.transform = `translate(${boilX}px, ${boilY}px)`;

            // Advance Frame
            this.currentFrame++;
            if (this.currentFrame >= stateData.frames) {
                if (stateData.loop !== false) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = stateData.frames - 1; // Hold last frame
                }
            }
        }
    }

    triggerAction(actionState, duration = null) {
        const previous = this.currentState;
        this.setState(actionState);

        // If duration is null, rely on animation end (not easily detected in this loop without callback)
        // So we stick to duration or manually switch back
        if (duration) {
            setTimeout(() => {
                this.setState(previous);
            }, duration);
        }
    }
}

// Initialize Animators
// Pig Configuration:
// Row 1 (Index 0): Idle (8 frames)
// Row 2 (Index 1): Grind/Work (12 frames)
// Row 3 (Index 2): Panic (8 frames)
// Max Cols = 12
// Pig Configuration V3 (Static Grid Fix)
// 2x2 Grid:
// [0,0 Idle] [0,1 Grind]
// [1,0 Sleep] [1,1 Panic]
// Pig Configuration V4 (Fixed for 4x3 layout and 24fps)
const pigAnimator = new SpriteAnimator('pig-char', {
    cols: 4,     // 400% width implied 4 cols
    rows: 3,     // 300% height implied 3 rows
    fps: 24,     // Cinematic 24fps
    states: {
        // Idle: Row 0. We can cycle 4 frames or hold 1. Let's cycle 4 for "breathing" if sheet has it.
        'idle': { row: 0, frames: 4, loop: true },

        // Grind: Row 1. Fast action.
        'grind': { row: 1, frames: 4, loop: true },

        // Panic/Sleep: Row 2? We'll assume Row 2 is panic/special.
        'panic': { row: 2, frames: 4, loop: true }
    }
});

/*
// FUTURE CONFIG (When you have the generated 12-col sprite)
const pigAnimator_FUTURE = new SpriteAnimator('pig-char', {
    cols: 12,
    rows: 3,
    fps: 24,
    states: { 
        'idle': { row: 0, frames: 8 },
        'grind': { row: 1, frames: 12 },
        'panic': { row: 2, frames: 8 }
    }
});
*/

const wolfAnimator = new SpriteAnimator('wolf-char', {
    cols: 3, rows: 1,
    fps: 8,
    states: {
        'idle': { row: 0, frames: 1 },
        'shout': { row: 0, frames: 3 }, // Cycle through all 3 distinct poses as if animation
        'point': { row: 0, frames: 1 }
    }
});

function animatePig() {
    // Trigger grind state
    if (typeof pigAnimator !== 'undefined') pigAnimator.triggerAction('grind', 200);

    // Squash & Stretch (Wrapper)
    const wrapper = document.getElementById('character-wrapper');
    if (wrapper) {
        wrapper.classList.remove('squash-active');
        void wrapper.offsetWidth;
        wrapper.classList.add('squash-active');
    }
}

function spawnShockwave(x, y) {
    const shockwave = document.createElement('div');
    shockwave.className = 'shockwave';
    shockwave.style.left = `${x}px`;
    shockwave.style.top = `${y}px`;
    els.feedback.appendChild(shockwave);

    setTimeout(() => shockwave.remove(), 600);
}

function spawnFlyingResource(startX, startY, targetX, targetY) {
    // Create floating little arrow icon
    const el = document.createElement('div');
    el.innerHTML = '🏹';
    el.style.position = 'absolute';
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.fontSize = '20px';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '100';
    el.style.transition = 'all 0.6s cubic-bezier(0.5, 0, 0.5, 1)';
    // Random spread start
    const spreadX = (Math.random() - 0.5) * 50;
    const spreadY = (Math.random() - 0.5) * 50;

    els.feedback.appendChild(el);

    // 1. Burst out
    requestAnimationFrame(() => {
        el.style.transform = `translate(${spreadX}px, ${spreadY}px) scale(1.2)`;

        // 2. Fly to target after brief pause
        setTimeout(() => {
            el.style.left = `${targetX}px`;
            el.style.top = `${targetY}px`;
            el.style.transform = `scale(0.5)`;
            el.style.opacity = '0';
        }, 100);
    });

    setTimeout(() => el.remove(), 700);
}

function spawnFeedback(x, y, amount, isCrit, isAuto = false) {
    // Text +1
    const text = document.createElement('div');
    text.className = isCrit ? 'floating-text crit' : 'floating-text';
    text.textContent = isCrit ? `CRIT! +${amount}` : `+${amount}`;

    if (isAuto) {
        text.style.fontSize = '20px';
        text.style.opacity = 0.7;
    }

    const offsetX = (Math.random() - 0.5) * 40;
    text.style.left = `${x + offsetX}px`;
    text.style.top = `${y - 50}px`;

    els.feedback.appendChild(text);
    setTimeout(() => text.remove(), 1000);

    // Spark particles - Reduced on mobile
    const baseCount = isCrit ? 20 : 8;
    const particleCount = Math.floor(baseCount * state.particleMultiplier);

    // Skip particles entirely on mobile if too many
    if (state.isMobile && particleCount < 2) return;

    for (let i = 0; i < particleCount; i++) {
        const spark = document.createElement('div');
        const types = ['star', 'spark', 'chip'];
        const type = isCrit ? 'star' : types[Math.floor(Math.random() * types.length)];

        spark.className = `particle ${type}`;

        const angle = Math.random() * 360;
        const velocity = 50 + Math.random() * 100;
        const tx = Math.cos(angle * Math.PI / 180) * velocity;
        const ty = Math.sin(angle * Math.PI / 180) * velocity;

        spark.style.setProperty('--tx', `${tx}px`);
        spark.style.setProperty('--ty', `${ty}px`);
        spark.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);

        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;

        if (isCrit) spark.style.background = '#ffd700';

        els.feedback.appendChild(spark);
        setTimeout(() => spark.remove(), 800);
    }

    // Ink Splat (Visual Juice)
    if (!state.isMobile && Math.random() < 0.5) {
        spawnInkParticle(x, y);
    }
}

function spawnInkParticle(x, y) {
    const ink = document.createElement('div');
    ink.className = 'particle chip';

    // Random position offset
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = (Math.random() - 0.5) * 60;

    ink.style.left = `${x + offsetX}px`;
    ink.style.top = `${y + offsetY}px`;

    // Ink spread physics
    const scale = 0.5 + Math.random();
    ink.style.transform = `scale(${scale})`;

    // Physics
    const tx = (Math.random() - 0.5) * 100;
    const ty = (Math.random() - 0.5) * 100 + 50; // Fall down slightly

    ink.style.setProperty('--tx', `${tx}px`);
    ink.style.setProperty('--ty', `${ty}px`);
    ink.style.setProperty('--rot', `${Math.random() * 360}deg`);

    els.feedback.appendChild(ink);
    setTimeout(() => ink.remove(), 800);
}

function spawnSweat() {
    const sweat = document.createElement('div');
    sweat.className = 'particle sweat';
    // Position near the pig's head
    const rect = els.pig.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 60;
    const y = rect.top + 80;

    sweat.style.left = `${x}px`;
    sweat.style.top = `${y}px`;

    // Sweat physics: fall down
    sweat.style.setProperty('--tx', `${(Math.random() - 0.5) * 20}px`);
    sweat.style.setProperty('--ty', `150px`);
    sweat.style.setProperty('--rot', '0deg');

    els.feedback.appendChild(sweat);
    setTimeout(() => sweat.remove(), 1000);
}


// Audio System (Synthesized - No files needed)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Audio System (Sonic Branding & Mixer)
const AudioMixer = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),
    channels: {},

    init: function () {
        this.channels['pig'] = this.ctx.createGain();
        this.channels['wolf'] = this.ctx.createGain();
        this.channels['sfx'] = this.ctx.createGain();
        this.channels['bgm'] = this.ctx.createGain();

        // Routing
        this.channels['pig'].connect(this.ctx.destination);
        this.channels['wolf'].connect(this.ctx.destination);
        this.channels['sfx'].connect(this.ctx.destination);

        // Volume Mix
        this.channels['pig'].gain.value = 1.0;
        this.channels['wolf'].gain.value = 1.2; // Loud warning
        this.channels['sfx'].gain.value = 0.8;
    },

    play: function (key, channel = 'sfx', pitch = 1.0) {
        if (this.ctx.state === 'suspended') this.ctx.resume();

        // In a real app, we would load .wav files here.
        // Since we are ensuring the generic logic works without files,
        // we will generate "Sonic Branding" synthetically if file not found (simulated).
        this.playSynthetic(key, channel, pitch);
    },

    playSynthetic: function (key, channel, pitch) {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Master connect
        gain.connect(this.channels[channel]); // Connect to channel instead of destination for volume control

        // Sonic Branding Logic
        if (channel === 'pig') {
            // Pig: "Ot ot" / "Scritch" - Lanh lảnh, high pitch, texture
            if (key === 'grind') {
                // Wood grinding sound (Noise + Bandpass)
                this.playNoise(t, 0.1, 800, 1.0); // Helper for noise
                return; // Noise handled separately
            } else if (key === 'crit') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800 * pitch, t);
                osc.frequency.exponentialRampToValueAtTime(300, t + 0.1); // "Pew" effect
            } else {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(500 * pitch, t);
            }
        } else if (channel === 'wolf') {
            // Wolf: "Gao" - Low, Sawtooth, Rough
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100 * pitch, t);
            // Pitch drop for growl
            osc.frequency.linearRampToValueAtTime(80 * pitch, t + 0.3);

            // Add distortion/wobble via second osc ideally, but keep simple
        } else {
            // SFX
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440 * pitch, t);
        }

        // Envelope (Ink-wash style: Soft attack, organic decay)
        const duration = (channel === 'wolf') ? 0.3 : 0.1;
        gain.gain.setValueAtTime(0, t);

        // Attack
        const attack = (key === 'grind') ? 0.01 : 0.05;
        gain.gain.linearRampToValueAtTime(this.channels[channel].gain.value, t + attack);

        // Decay
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        osc.start(t);
        osc.stop(t + duration);
    },

    playNoise: function (startTime, duration, freq, volume) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // White noise
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Filter for "Wood" sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = freq;
        filter.Q.value = 1; // Resonance

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume * 0.5, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(startTime);
    }
};

// Initialize Mixer
AudioMixer.init();

const SoundFX = {
    // Adapter for legacy calls
    grind: () => AudioMixer.play('grind', 'pig'),
    crit: () => AudioMixer.play('crit', 'pig', 1.5),
    coin: () => AudioMixer.play('pop', 'sfx'),
    uiClick: () => AudioMixer.play('pop', 'sfx', 0.8),
    fanfare: () => {
        // Simple scale
        setTimeout(() => AudioMixer.play('pop', 'sfx', 1.0), 0);
        setTimeout(() => AudioMixer.play('pop', 'sfx', 1.2), 100);
        setTimeout(() => AudioMixer.play('pop', 'sfx', 1.5), 200);
    }
};

const Haptics = {
    enabled: true,

    vibrate: function (pattern) {
        if (!this.enabled || !navigator.vibrate) return;
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            // Ignore if disallowed
        }
    },

    light: function () { this.vibrate(5); }, // Subtle tick
    medium: function () { this.vibrate(15); },
    heavy: function () { this.vibrate([10, 30, 20]); }, // Crunch
    rumble: function () { this.vibrate([50, 50, 50, 50, 100]); } // Boss
};


function playSound(type) {
    try {
        if (type === 'grind') SoundFX.grind();
        else if (type === 'crit') { SoundFX.crit(); Haptics.heavy(); }
        else if (type === 'coin') SoundFX.coin();
        else if (type === 'ui') { SoundFX.uiClick(); Haptics.light(); }
        else if (type === 'fanfare') SoundFX.fanfare();
    } catch (e) { console.warn("Audio error", e); }
}

function addArrowVisual() {
    if (state.arrows % 10 === 0) {
        const arrow = document.createElement('div');
        arrow.className = 'arrow-stack-item';
        // Random offset for jagged pile look
        const shiftX = (Math.random() - 0.5) * 10;
        arrow.style.transform = `rotate(${Math.random() * 10 - 5}deg) translateX(${shiftX}px)`;
        els.arrowPile.appendChild(arrow);

        // Limit visually
        if (els.arrowPile.children.length > 40) {
            els.arrowPile.removeChild(els.arrowPile.firstChild);
        }
    }
}

function showDialogue() {
    // 30% chance boss yells, 70% pig talks
    const isBoss = Math.random() < 0.3;
    const pool = isBoss ? dialogues.boss : dialogues.self;
    const text = pool[Math.floor(Math.random() * pool.length)];

    els.dialogueText.textContent = isBoss ? `Boss: "${text}"` : text;
    els.dialogueText.style.color = isBoss ? '#d32f2f' : '#4e342e';
    els.dialogueBox.classList.remove('hidden');

    // Wolf logic
    const wolfEl = document.getElementById('wolf-char');
    if (isBoss) {
        if (wolfEl) wolfEl.classList.add('active');
        if (typeof wolfAnimator !== 'undefined') {
            wolfAnimator.setState('shout');
            AudioMixer.play('shout', 'wolf'); // Sonic Branding
        }
        // Shake screen handled in clickGrind usually, but here too
    } else {
        // Pig Talk
        if (typeof pigAnimator !== 'undefined') pigAnimator.triggerAction('action', 500); // reuse action/grind for talk
    }

    // Hide after 3s
    setTimeout(() => {
        els.dialogueBox.classList.add('hidden');
        if (wolfEl) wolfEl.classList.remove('active');
        if (typeof wolfAnimator !== 'undefined') wolfAnimator.setState('idle');
    }, 3000);
}

// Gacha System
function openShop() {
    playSound('ui');
    els.modal.classList.remove('hidden');
    els.rewardDisplay.classList.add('hidden');
}

function closeShop() {
    playSound('ui');
    els.modal.classList.add('hidden');
}

function rollGacha() {
    if (state.arrows < GACHA_COST) {
        // Shake button to indicate error
        els.rollBtn.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
        ], { duration: 300 });
        return;
    }

    state.arrows -= GACHA_COST;
    updateUI();
    playSound('coin'); // Payment sound

    // Weighted Random
    let roll = Math.random();
    let selectedItem = items[0];
    let cumulative = 0;

    for (const item of items) {
        cumulative += item.chance;
        if (roll < cumulative) {
            selectedItem = item;
            break;
        }
    }

    showReward(selectedItem);
}

function showReward(item) {
    els.rewardDisplay.classList.add('hidden');
    els.modal.querySelector('.gacha-machine').classList.remove('shake-box'); // Reset

    // 1. Shake animation
    els.modal.querySelector('.gacha-machine').classList.add('shake-box');
    playSound('grind'); // Mechanical noise

    // 2. Wait 1.5s then reveal
    setTimeout(() => {
        els.modal.querySelector('.gacha-machine').classList.remove('shake-box');

        // Show reward
        els.rewardDisplay.classList.remove('hidden');
        els.rewardDisplay.classList.remove('reward-pop');
        void els.rewardDisplay.offsetWidth;
        els.rewardDisplay.classList.add('reward-pop');

        els.rewardIcon.textContent = item.icon;
        els.rewardName.textContent = item.name;
        els.rewardDesc.textContent = item.desc;

        playSound('fanfare');

        // Rare+ sound or effect could go here

        state.inventory.push(item);
        updateInventoryDisplay();
        updateStatsDisplay();

    }, 1200);
}

// Upgrades System
function renderShop(type) {
    const listEl = type === 'recruit' ? els.recruitList : els.furnitureList;
    listEl.innerHTML = '';

    // Filter items first
    const items = [];
    for (let [key, data] of Object.entries(upgradeData)) {
        if (type === 'recruit') {
            if (data.type === 'recruit' || data.type === 'character') items.push({ key, ...data });
        } else {
            if (data.type === type) items.push({ key, ...data });
        }
    }

    // Sort items? Characters first?
    items.sort((a, b) => {
        if (a.type === b.type) return a.baseCost - b.baseCost;
        return a.type === 'character' ? -1 : 1;
    });

    let lastType = null;

    // Prepend Default Pig if Recruit
    if (type === 'recruit') {
        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'shop-section-title';
        sectionTitle.textContent = "Nhân Vật Chính";
        listEl.appendChild(sectionTitle);

        const isPigActive = state.activeCharacter === 'pig';
        const pigEl = document.createElement('div');
        pigEl.className = 'shop-item';
        if (isPigActive) pigEl.classList.add('active-char');

        pigEl.innerHTML = `
            <div class="shop-item-icon"><img src="assets/pig_grinder.png" style="width: 40px; height: 40px; object-fit: contain;"></div>
            <div class="shop-item-details">
                <h3>Heo Mặc Định</h3>
                <p>Nhân viên gương mẫu.</p>
            </div>
            <div class="shop-item-cost ${isPigActive ? 'active' : 'owned'}" onclick="${isPigActive ? '' : "selectCharacter('pig')"}">
                ${isPigActive ? 'Đang Chọn' : 'Chọn'}
            </div>
        `;
        listEl.appendChild(pigEl);
        lastType = 'character';
    }

    for (let item of items) {
        const key = item.key;

        // Add Header if type changes (Assistants)
        if (type === 'recruit' && item.type !== lastType) {
            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'shop-section-title';
            sectionTitle.textContent = "Trợ Thủ";
            listEl.appendChild(sectionTitle);
            lastType = item.type;
        }

        const level = state.upgrades[key];
        const isMaxed = item.type === 'character' && level >= 1;
        const isActive = state.activeCharacter === key;

        let cost = Math.floor(item.baseCost * Math.pow(1.5, level));
        if (item.type === 'character') cost = item.baseCost;

        const itemEl = document.createElement('div');
        itemEl.className = 'shop-item';
        if (isActive) itemEl.classList.add('active-char');
        // If character not owned, add locked look?
        // User wants "để sẵn" (visible), "chưa đủ điểm thì disabled". 
        // My CSS for too-expensive handles disabled interaction.
        // Let's explicitly add a grayscale class if character not owned.
        if (item.type === 'character' && !isMaxed) {
            itemEl.classList.add('char-locked');
        }

        const affordable = state.arrows >= cost ? 'affordable' : 'too-expensive';

        let iconHtml = item.icon;
        if (item.type === 'character') {
            iconHtml = `<img src="${item.icon}" style="width: 40px; height: 40px; object-fit: contain;" class="${isMaxed ? '' : 'grayscale'}">`;
        }

        let buttonHtml = '';
        if (item.type === 'character') {
            if (isActive) {
                buttonHtml = `<div class="shop-item-cost active">Đang Chọn</div>`;
            } else if (isMaxed) {
                buttonHtml = `<div class="shop-item-cost owned" onclick="selectCharacter('${key}')">Chọn</div>`;
            } else {
                // Explicit text for cost
                buttonHtml = `<div class="shop-item-cost ${affordable}" onclick="buyUpgrade('${key}')">
                    <span>${affordable === 'too-expensive' ? '🔒' : '🔓'} ${cost}</span>
                 </div>`;
            }
        } else {
            buttonHtml = `<div class="shop-item-cost ${affordable}" onclick="buyUpgrade('${key}')"><span>💰 ${cost}</span></div>`;
        }

        itemEl.innerHTML = `
            <div class="shop-item-icon">${iconHtml}</div>
            <div class="shop-item-details">
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
            </div>
            ${buttonHtml}
            ${item.type !== 'character' ? `<div class="shop-item-level">Lv. ${level}</div>` : ''}
        `;

        listEl.appendChild(itemEl);
    }
}

function buyUpgrade(key) {
    const data = upgradeData[key];
    const level = state.upgrades[key];
    const cost = Math.floor(data.baseCost * Math.pow(1.5, level));

    // Character Logic
    if (data.type === 'character' && level >= 1) return; // Already owned

    if (state.arrows >= cost) {
        state.arrows -= cost;
        state.upgrades[key]++;

        // Immediate Effects
        if (key === 'ant') state.autoClickers++;

        // Auto-equip character
        if (data.type === 'character') {
            selectCharacter(key);
        }

        updateUI();
        renderShop(data.type === 'character' ? 'recruit' : data.type);
        updateStatsDisplay();

        playSound('coin');
        spawnFeedback(
            data.type === 'recruit' || data.type === 'character' ? els.recruitBtn.getBoundingClientRect().left : els.furnitureBtn.getBoundingClientRect().left,
            window.innerHeight - 100,
            "Unlocked!",
            true
        );
    } else {
        playSound('ui');
    }
}

function selectCharacter(key) {
    state.activeCharacter = key;

    // Update visual by class
    const pigEl = document.getElementById('pig-char');
    if (!pigEl) return;

    // Clear all character classes
    pigEl.className = '';

    // Add the new character class
    pigEl.classList.add(`char-${key}`);

    // Force style recalculation
    void pigEl.offsetWidth;

    // Enhanced feedback
    if (typeof Effects !== 'undefined') {
        Effects.sealStamp(pigEl);
        Effects.particleBurst(
            window.innerWidth / 2,
            window.innerHeight / 2,
            12,
            '#bf360c'
        );
    }

    // Audio cue
    playSound('fanfare');

    // Re-render shop to show "Active" state
    renderShop('recruit');
    updateUI();

    console.log(`Switched to character: ${key}, class: char-${key}`);
}


// Stats
function toggleInventory() {
    playSound('ui');
    if (els.inventoryModal.classList.contains('hidden')) {
        els.inventoryModal.classList.remove('hidden');
        updateInventoryDisplay();
    } else {
        els.inventoryModal.classList.add('hidden');
    }
}

function updateInventoryDisplay() {
    els.inventoryGrid.innerHTML = '';

    const counts = {};
    const itemMap = {};
    for (let item of state.inventory) {
        counts[item.name] = (counts[item.name] || 0) + 1;
        itemMap[item.name] = item;
    }

    // Categories
    const categories = {
        "Vật Phẩm": [],
        "Rác": []
    };

    for (let name in counts) {
        const item = itemMap[name];
        if (item.type === 'scrap') categories["Rác"].push(name);
        else categories["Vật Phẩm"].push(name);
    }

    // Render Categories
    for (let [catName, itemNames] of Object.entries(categories)) {
        if (itemNames.length === 0) continue;

        const title = document.createElement('div');
        title.className = 'inventory-section-title';
        title.textContent = catName;
        els.inventoryGrid.appendChild(title);

        itemNames.forEach(name => {
            const item = itemMap[name];
            const count = counts[name];

            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.textContent = item.icon;
            div.setAttribute('data-tooltip', `${name}: ${item.desc}`);
            if (item.type === 'legendary') div.style.borderColor = '#ffd700';

            const countBadge = document.createElement('span');
            countBadge.className = 'count';
            countBadge.textContent = count > 1 ? `x${count}` : '';
            div.appendChild(countBadge);

            els.inventoryGrid.appendChild(div);
        });
    }

    if (state.inventory.length === 0) {
        els.inventoryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Túi rỗng tuếch...</p>';
    }

    // Fill empty slots for look
    const slotsNeeded = Math.max(0, 8 - state.inventory.length);
    // Just a visual filler if desired, or skip to keep clean
}

function calculateClickPower() {
    let power = 1;
    // Spider Bonus
    if (state.upgrades.spider > 0) {
        power += state.upgrades.spider * 5;
    }
    for (let item of state.inventory) {
        if (item.name === 'Vụn sắt vụn') power += 1;
        if (item.name === 'Đá mài xịn') power += 5;
    }
    return power;
}

function calculateCritChance() {
    let chance = 0.05; // Base 5%
    // Mirror Bonus
    if (state.upgrades.mirror > 0) {
        chance += state.upgrades.mirror * 0.05;
    }
    for (let item of state.inventory) {
        if (item.name === 'Bình rượu') chance += 0.05;
        if (item.name === 'Mũ rơm') chance += 0.01;
    }
    return chance;
}

function updateStatsDisplay() {
    const power = calculateClickPower();
    els.clickPowerDisp.textContent = power;
    els.autoPowerDisp.textContent = state.autoClickers;
}

function updateProgressBar() {
    const goal = GACHA_COST; // Simple goal: Next Gacha
    // Or goal could be Next Hire if Gacha affordable
    const percentage = Math.min(100, (state.arrows / goal) * 100);
    const bar = document.getElementById('level-progress');
    if (bar) bar.style.width = `${percentage}%`;
}

// Init
// Wait for image to load before processing
// ... (rest of init)

// Init
// removeBackground removed as we use sprites

els.hitbox.addEventListener('click', clickGrind);
els.shopBtn.addEventListener('click', openShop);
els.closeModal.addEventListener('click', closeShop);
els.rollBtn.addEventListener('click', rollGacha);

// New Listeners
els.recruitBtn.addEventListener('click', () => {
    els.recruitModal.classList.remove('hidden');
    renderShop('recruit');
    playSound('ui');
});
els.furnitureBtn.addEventListener('click', () => {
    els.furnitureModal.classList.remove('hidden');
    renderShop('furniture');
    playSound('ui');
});
els.closeRecruit.addEventListener('click', () => els.recruitModal.classList.add('hidden'));
els.closeFurniture.addEventListener('click', () => els.furnitureModal.classList.add('hidden'));

els.inventoryBtn.addEventListener('click', toggleInventory);
els.closeInventory.addEventListener('click', toggleInventory);

// Stress Relief Actions
let screamInterval;
els.screamBtn.addEventListener('mousedown', () => {
    if (state.isBurnedOut) return;
    els.screamBtn.classList.add('active');
    screamInterval = setInterval(() => {
        relieveStress(2);
        // Maybe scream sound?
        spawnFeedback(
            els.screamBtn.getBoundingClientRect().left,
            els.screamBtn.getBoundingClientRect().top - 50,
            "AHHH!",
            false
        );
    }, 200);
});

['mouseup', 'mouseleave'].forEach(evt =>
    els.screamBtn.addEventListener(evt, () => {
        clearInterval(screamInterval);
        els.screamBtn.classList.remove('active');
    })
);

els.eatBtn.addEventListener('click', () => {
    if (state.arrows >= 10) { // Cost 10 arrows to buy bun? Or free? Let's make it free but cooldown?
        // Let's just make it reduce instant stress
        relieveStress(15);
        // Eat sound
        spawnFeedback(
            els.eatBtn.getBoundingClientRect().left,
            els.eatBtn.getBoundingClientRect().top - 50,
            "Yum!",
            false
        );
    }
});

// Close modal on outside click
window.onclick = function (event) {
    if (event.target == els.modal) {
        closeShop();
    }
    if (event.target == els.inventoryModal) els.inventoryModal.classList.add('hidden');
    if (event.target == els.recruitModal) els.recruitModal.classList.add('hidden');
    if (event.target == els.furnitureModal) els.furnitureModal.classList.add('hidden');
}

// Utility: Remove White Background
function removeBackground(img) {
    if (img.dataset.processed) return; // Prevent infinite loop

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Get pixels
    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Loop and remove white
        const threshold = 240;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // If pixel is light (white-ish)
            if (r > threshold && g > threshold && b > threshold) {
                data[i + 3] = 0; // Alpha = 0
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Replace image src
        const newSrc = canvas.toDataURL();
        img.src = newSrc;
        img.dataset.processed = "true";

    } catch (e) {
        console.warn("Cannot remove background (CORS or other error):", e);
    }
}

// =========================================
// PHASE 5: MINI-GAME SYSTEMS
// =========================================

// 1. Combo System
function updateCombo() {
    state.combo++;

    // Clear existing timer
    if (state.comboTimer) {
        clearTimeout(state.comboTimer);
    }

    // Show combo display
    els.comboDisplay.classList.remove('hidden');
    els.comboCount.textContent = state.combo;

    // Add mega effect at high combos
    if (state.combo >= 10) {
        els.comboDisplay.classList.add('mega');
        // Screen shake on every hit above 10
        shakeScreen('mild');
    } else {
        els.comboDisplay.classList.remove('mega');
    }

    // Reset combo after 2 seconds of no clicking
    state.comboTimer = setTimeout(() => {
        state.combo = 0;
        els.comboDisplay.classList.add('hidden');
        els.comboDisplay.classList.remove('mega');
    }, 2000);
}

function shakeScreen(type) {
    const container = document.getElementById('game-container');
    container.classList.remove('shake-screen');
    void container.offsetWidth; // Trigger reflow
    container.classList.add('shake-screen');

    // Type handling if we want different shakes later
    // current CSS .shake-screen is generic
}

// 2. Frenzy Heat System
const FRENZY_THRESHOLD = 100;
const FRENZY_DURATION = 10000; // 10 seconds

function updateFrenzyHeat() {
    // Add heat on click
    state.frenzyHeat = Math.min(FRENZY_THRESHOLD, state.frenzyHeat + 8);

    // Update bar
    const percentage = (state.frenzyHeat / FRENZY_THRESHOLD) * 100;
    els.frenzyBar.style.width = `${percentage}%`;

    // Trigger frenzy mode
    if (state.frenzyHeat >= FRENZY_THRESHOLD && !state.frenzyActive) {
        activateFrenzy();
    }
}

// Decay heat over time
setInterval(() => {
    if (!state.frenzyActive && state.frenzyHeat > 0) {
        state.frenzyHeat = Math.max(0, state.frenzyHeat - 2);
        const percentage = (state.frenzyHeat / FRENZY_THRESHOLD) * 100;
        els.frenzyBar.style.width = `${percentage}%`;
    }
}, 100);

function activateFrenzy() {
    state.frenzyActive = true;
    state.frenzyHeat = 0;

    // Visual effects
    document.body.classList.add('frenzy-mode');
    els.frenzyBar.classList.add('active');
    els.frenzyBar.style.width = '100%';

    // Start arrow rain
    const rainInterval = setInterval(() => {
        if (state.frenzyActive) {
            spawnArrowRain();
        }
    }, 200);

    // Play intense sound
    playSound('fanfare');

    // End frenzy after duration
    setTimeout(() => {
        state.frenzyActive = false;
        document.body.classList.remove('frenzy-mode');
        els.frenzyBar.classList.remove('active');
        clearInterval(rainInterval);

        // Show completion message
        spawnFeedback(
            window.innerWidth / 2,
            window.innerHeight / 2,
            0,
            false
        );
        const msg = document.createElement('div');
        msg.className = 'floating-text';
        msg.textContent = 'FRENZY END!';
        msg.style.left = '50%';
        msg.style.top = '50%';
        msg.style.fontSize = '48px';
        els.feedback.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
    }, FRENZY_DURATION);
}

function spawnArrowRain() {
    const arrow = document.createElement('div');
    arrow.className = 'arrow-rain';
    arrow.textContent = '🏹';
    arrow.style.left = `${Math.random() * 100}%`;
    arrow.style.top = '-50px';

    document.getElementById('game-container').appendChild(arrow);
    setTimeout(() => arrow.remove(), 2000);
}

// 3. Flying Spirit Mini-Game
function spawnSpirit() {
    const spirit = document.createElement('div');
    spirit.className = 'flying-spirit';
    spirit.textContent = '✨'; // Could be 🧚 or custom sprite
    spirit.style.top = `${20 + Math.random() * 40}%`;

    // Click handler for bonus
    spirit.addEventListener('click', () => {
        const bonus = 100 + Math.floor(Math.random() * 100);
        state.arrows += bonus;
        updateUI();

        // Celebration effect
        const rect = spirit.getBoundingClientRect();
        spawnFeedback(rect.left, rect.top, bonus, true);
        playSound('fanfare');

        // Show special message
        const msg = document.createElement('div');
        msg.className = 'floating-text crit';
        msg.textContent = `TINH LINH! +${bonus}`;
        msg.style.left = `${rect.left}px`;
        msg.style.top = `${rect.top}px`;
        els.feedback.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);

        spirit.remove();
    });

    els.spiritLayer.appendChild(spirit);

    // Auto-remove after animation
    setTimeout(() => {
        if (spirit.parentElement) {
            spirit.remove();
        }
    }, 8000);
}
// Rhythm Game Logic
let meetingInterval;
let noteSpeed = 3; // px per frame
const TARGET_X = 100; // Left position of target zone

// Main Meeting Trigger
function startMeeting() {
    if (state.meetingActive || state.isBurnedOut) return;

    // High Chance (80%) for Mini-game to showcase new features
    if (typeof MiniGames !== 'undefined' && Math.random() < 0.8) {
        startMiniGameMeeting();
        return;
    }

    // Default Rhythm Game Logic (Existing code)
    state.meetingActive = true;
    state.meetingScore = 0;
    state.meetingNotesSpawned = 0;
    state.combo = 0;
    updateCombo();

    els.meetingOverlay.classList.remove('hidden');
    els.meetingFeedback.classList.add('hidden');
    els.comboStreak.textContent = "0";
    els.notesContainer.innerHTML = '';

    // Instructions
    const instructions = document.createElement('div');
    instructions.id = 'meeting-instructions';
    instructions.innerHTML = `
        <div style="
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.95);
            padding: 20px 40px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 10;
            animation: bounce-in 0.5s ease-out;
        ">
            <h2 style="margin: 0 0 10px 0; color: #bf360c; font-size: 28px;">🎭 HỌP GIAO BAN ĐỘT XUẤT!</h2>
            <p style="margin: 0; color: #3e2723; font-size: 18px; font-weight: bold;">
                👏 VỖ TAY THEO NHỊP KHI DẤU 👏 VÀO VÙNG SÁNG!
            </p>
            <p style="margin: 5px 0 0 0; color: #5d4037; font-size: 14px;">
                Nhấn SPACE hoặc Click màn hình đúng lúc!
            </p>
        </div>
    `;
    els.meetingOverlay.appendChild(instructions);
    setTimeout(() => instructions.remove(), 3000);

    playSound('ui');

    meetingInterval = setInterval(() => {
        if (!state.meetingActive) return;

        if (state.meetingNotesSpawned < state.meetingMaxNotes) {
            spawnNote();
            state.meetingNotesSpawned++;
        } else {
            const remaining = document.querySelectorAll('.rhythm-note');
            if (remaining.length === 0) {
                endMeeting();
            }
        }
    }, 1200);
}

// Wrapper for new MiniGames
function startMiniGameMeeting() {
    state.meetingActive = true;
    els.meetingOverlay.classList.remove('hidden');
    // Clear rhythm specific things if any
    els.notesContainer.innerHTML = '';

    // Inject MiniGame Container inside overlay
    const container = document.createElement('div');
    container.id = 'minigame-container';
    container.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    `;
    els.meetingOverlay.appendChild(container);

    // Start Random Game
    MiniGames.startRandom(container);
}

function spawnNote() {
    const note = document.createElement('div');
    note.className = 'rhythm-note';
    note.innerHTML = '👏'; // Clapping hands emoji
    note.style.fontSize = '40px';
    note.style.left = '550px';
    els.notesContainer.appendChild(note);

    // Animate
    let pos = 550;
    function move() {
        if (!state.meetingActive || !note.parentNode) return;

        pos -= 4; // Speed
        note.style.left = `${pos}px`;

        // Check if missed (passed target zone)
        if (pos < 60 && !note.dataset.hit && !note.dataset.missed) {
            note.dataset.missed = 'true';
            scoreRhythm('miss', note);
        }

        // Remove when off-screen
        if (pos < -50) {
            note.remove();
            if (state.meetingNotesSpawned >= state.meetingMaxNotes && els.notesContainer.children.length === 0) {
                endMeeting();
            }
        } else {
            requestAnimationFrame(move);
        }
    }
    requestAnimationFrame(move);
}

function checkRhythmInput() {
    if (!state.meetingActive) return;
    if (state.inputBuffer) return;

    state.inputBuffer = true;
    setTimeout(() => state.inputBuffer = false, 200); // Debounce

    // Check for note in zone
    // Target Zone: 100px to 160px
    // Note Center should be within this?
    // Let's use left position.
    // Perfect: Note Left is approx 110px (center of zone aligns with center of note)
    // Note width 40, Target width 60.
    // Center of Target: 100 + 30 = 130.
    // Center of Note: pos + 20.
    // Delta = |(pos + 20) - 130| = |pos - 110|

    const notes = Array.from(document.querySelectorAll('.rhythm-note'));
    /* Find closest note that hasn't been hit/missed */
    const playableNotes = notes.filter(n => !n.dataset.hit && !n.dataset.missed);

    if (playableNotes.length === 0) return;

    // Sort by proximity to target (110)
    playableNotes.sort((a, b) => {
        const posA = parseFloat(a.style.left);
        const posB = parseFloat(b.style.left);
        return Math.abs(posA - 110) - Math.abs(posB - 110);
    });

    const targetNote = playableNotes[0];
    const pos = parseFloat(targetNote.style.left);
    const diff = Math.abs(pos - 110);

    if (diff < 15) {
        scoreRhythm('perfect', targetNote);
    } else if (diff < 40) {
        scoreRhythm('good', targetNote);
    } else {
        scoreRhythm('miss', targetNote); // Too early/late
    }
}

function scoreRhythm(rating, note) {
    els.meetingFeedback.classList.remove('hidden', 'perfect', 'good', 'miss');
    void els.meetingFeedback.offsetWidth;
    els.meetingFeedback.classList.add(rating);

    if (rating === 'perfect') {
        state.meetingScore += 2;
        els.meetingFeedback.textContent = "👏 ĐÚNG NHỊP! 👏";
        els.comboStreak.textContent = parseInt(els.comboStreak.textContent) + 1;
        if (note) {
            note.dataset.hit = true;
            note.classList.add('hit');
            playSound('crit');
            // Particle effect
            if (typeof Effects !== 'undefined') {
                const rect = note.getBoundingClientRect();
                Effects.particleBurst(rect.left, rect.top, 8, '#4caf50');
            }
        }
        els.targetZone.classList.add('hit');
        setTimeout(() => els.targetZone.classList.remove('hit'), 100);
    } else if (rating === 'good') {
        state.meetingScore += 1;
        els.meetingFeedback.textContent = "👍 ỔN ĐẤY!";
        els.comboStreak.textContent = parseInt(els.comboStreak.textContent) + 1;
        if (note) {
            note.dataset.hit = true;
            note.classList.add('hit');
            playSound('grind');
        }
        els.targetZone.classList.add('hit');
        setTimeout(() => els.targetZone.classList.remove('hit'), 100);
    } else {
        state.meetingScore -= 1;
        els.meetingFeedback.textContent = "😅 TRƯỢT RỒI!";
        els.comboStreak.textContent = "0";
        if (note) {
            note.dataset.missed = true;
            note.style.opacity = '0.3';
        }
        els.targetZone.classList.add('miss');
        setTimeout(() => els.targetZone.classList.remove('miss'), 100);
        playSound('ui');

        // Shake effect
        if (typeof Effects !== 'undefined') {
            Effects.shake(els.targetZone);
        }
    }
}

function grind() {
    // If Meeting is active, clicks might be for the minigame (if not handled by overlay)
    // But usually overlay covers everything.

    if (state.stress >= 100) {
        // Trigger Meeting immediately if not active
        if (!state.meetingActive) {
            startMeeting();
        }
        return;
    }

    const amount = state.clickPower;
    const isCrit = Math.random() < state.critChance;
    const finalAmount = isCrit ? amount * state.critMultiplier : amount;

    state.arrows += finalAmount;
    state.totalClicks++;

    // Enhanced visual feedback
    animatePig();

    if (typeof Effects !== 'undefined') {
        if (isCrit) {
            Effects.particleBurst(
                window.innerWidth / 2,
                window.innerHeight / 2,
                16,
                '#ffd700'
            );
            Effects.screenFlash('rgba(255, 215, 0, 0.3)', 150);
        }
    }

    spawnFeedback(
        window.innerWidth / 2,
        window.innerHeight / 2 - 100,
        finalAmount,
        isCrit
    );

    playSound(isCrit ? 'crit' : 'grind');

    // Stress increase
    state.stress += 0.5;
    updateStressUI();

    updateUI();
}

// End Meeting Logic updated for MiniGames cleanup
function endMeeting() {
    state.meetingActive = false;
    clearInterval(meetingInterval);

    // Cleanup MiniGames DOM if exists updated
    const mgContainer = document.getElementById('minigame-container');
    if (mgContainer) mgContainer.remove();

    els.meetingOverlay.classList.add('hidden');

    // Hide rhythm game elements
    els.meetingFeedback.classList.add('hidden');
    els.comboStreak.classList.add('hidden');
    els.notesContainer.classList.add('hidden');
    els.targetZone.classList.add('hidden');
    els.comboLabel.classList.add('hidden');

    // Calculate Reward based on Score (Unified for Rhythm and MiniGames)
    // MiniGames usually return higher scores (e.g. 150), Rhythm max is 20.
    // Normalize: Rhythm Pass > 5. MiniGame Pass > 50.

    let isSuccess = false;
    if (state.meetingScore > 50) isSuccess = true; // Minigame threshold
    else if (state.meetingScore > 5 && state.meetingScore <= 20) isSuccess = true; // Rhythm threshold

    // Rewards
    if (isSuccess) {
        // Success
        state.arrows += 100;
        relieveStress(30);
        spawnFeedback(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Họp thành công!",
            true
        );
        playSound('fanfare');
        if (typeof Effects !== 'undefined') {
            Effects.showSuccess("THƯỞNG GIAO BAN!", window.innerWidth / 2, window.innerHeight / 2 - 100);
            Effects.screenFlash('#4caf50', 200);
        }
    } else {
        // Failure
        state.stress += 20;
        updateStressUI();
        spawnFeedback(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Bị sếp mắng...",
            false
        );
        playSound('ui');
        if (typeof Effects !== 'undefined') {
            Effects.showError("BỊ TRỪ LƯƠNG!", els.pig);
        }
    }
    updateUI();
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Systems
    if (typeof LivingWorld !== 'undefined') LivingWorld.init();

    // DEBUG: Add Manual Meeting Button for Testing
    const testBtn = document.createElement('button');
    testBtn.textContent = "🚨 HỌP KHẨN CẤP (TEST)";
    testBtn.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        z-index: 9999;
        background: #d32f2f;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 5px;
        font-weight: bold;
        cursor: pointer;
        opacity: 0.7;
    `;
    testBtn.addEventListener('click', () => {
        state.stress = 100; // Force full stress
        updateStressUI();
        startMeeting();
    });
    testBtn.addEventListener('mouseenter', () => testBtn.style.opacity = '1');
    testBtn.addEventListener('mouseleave', () => testBtn.style.opacity = '0.7');
    document.body.appendChild(testBtn);

    // Init UI
    updateUI();
    updateTime();
});

// Intro Logic
const introScreen = document.getElementById('intro-screen');
const startBtn = document.getElementById('start-game-btn');

if (startBtn && introScreen) {
    startBtn.addEventListener('click', () => {
        // Init Audio Context on user gesture
        if (AudioMixer.ctx.state === 'suspended') {
            AudioMixer.ctx.resume();
        }

        playSound('fanfare'); // Gong sound sim

        introScreen.classList.add('fade-out');

        // Remove after transition
        setTimeout(() => {
            introScreen.style.display = 'none';
        }, 1500);
    });
}

// Event Listeners for Rhythm
document.addEventListener('keydown', (e) => {
    if (state.meetingActive && e.code === 'Space') {
        checkRhythmInput();
        e.preventDefault();
    }
});

els.meetingOverlay.addEventListener('mousedown', (e) => {
    if (state.meetingActive) {
        checkRhythmInput();
    }
});

// Random Meeting Trigger
setInterval(() => {
    // 5% chance every 10s if not burned out and playing reasonably active
    if (!state.meetingActive && !state.isBurnedOut && Math.random() < 0.05) {
        startMeeting();
    }
}, 10000);

// Spawn spirit randomly every 30-60 seconds
function scheduleNextSpirit() {
    const delay = 30000 + Math.random() * 30000; // 30-60s
    setTimeout(() => {
        spawnSpirit();
        scheduleNextSpirit();
    }, delay);
}

// Start spirit spawning
scheduleNextSpirit();

// 4. Enhanced Sweat Drops
function spawnSweatDrop() {
    const sweat = document.createElement('div');
    sweat.className = 'sweat-drop';

    const rect = els.pig.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 60;
    const y = rect.top + 80;

    sweat.style.left = `${x}px`;
    sweat.style.top = `${y}px`;

    els.feedback.appendChild(sweat);
    setTimeout(() => sweat.remove(), 800);
}

// Initialize UI
updateUI();
updateTime();
