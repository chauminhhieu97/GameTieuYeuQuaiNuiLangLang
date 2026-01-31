// ==========================================
// LIVING WORLD SYSTEM
// 1. Messenger Birds
// 2. Idle Chatter
// ==========================================

const LivingWorld = {
    birdInterval: null,
    idleTimer: null,

    // Funny Chatter Lines
    chatterLines: [
        "Chà, hôm nay mài được bao nhiêu tên rồi nhỉ?",
        "Không biết Mẹ ở nhà có khỏe không...",
        "Boss Sói hôm nay nhìn hầm hố ghê.",
        "Ước gì được ăn một bữa no...",
        "Có ai thấy cái hồ lô nước của mình đâu không?",
        "Bao giờ mới được nghỉ phép đây trời...",
        "Sắp tới giờ cơm chưa nhỉ?",
        "Tay mỏi quá... nhưng vẫn phải mài!",
        "Nghe nói Đại Vương sắp đi tuần...",
        "Mình muốn làm một con heo có ích!"
    ],

    // Message Contents
    messages: [
        { type: 'mom', text: "Mẹ gửi ít bánh bao nè!", effect: 'heal', val: 20 },
        { type: 'boss', text: "KPI tháng này tăng gấp đôi nhé!", effect: 'stress', val: 10 },
        { type: 'spam', text: "Bán vé xem kịch rối bóng giá rẻ!", effect: 'gold', val: 50 },
        { type: 'friend', text: "Tối nay đi trộm bí ngô không?", effect: 'gold', val: 100 },
        { type: 'system', text: "Hệ thống bảo trì... đùa đấy!", effect: 'none', val: 0 }
    ],

    init() {
        // Start Bird Loop (Every 45-90 seconds)
        this.birdInterval = setInterval(() => {
            if (document.hidden) return; // Don't spawn if tab inactive
            if (Math.random() < 0.4) { // 40% chance every check
                this.spawnBird();
            }
        }, 15000); // Check every 15s

        // Setup Idle Chatter
        this.resetIdleTimer();
        document.addEventListener('mousemove', () => this.resetIdleTimer());
        document.addEventListener('click', () => this.resetIdleTimer());
        document.addEventListener('keydown', () => this.resetIdleTimer());
    },

    spawnBird() {
        const bird = document.createElement('div');
        bird.className = 'bird-messenger fallback';

        // Random Height
        const top = 10 + Math.random() * 40; // 10% to 50%
        bird.style.top = `${top}%`;

        // Random Animation Duration
        const duration = 5 + Math.random() * 5; // 5s to 10s
        bird.style.animation = `flyAcross ${duration}s linear forwards`;

        // Click Handler
        bird.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dropMessage(bird);
            bird.remove();
        });

        document.getElementById('sky-layer').appendChild(bird); // Append to Sky if possible, else Body

        // Formatting check
        setTimeout(() => { if (bird.parentNode) bird.remove(); }, duration * 1000);
    },

    dropMessage(birdEl) {
        const rect = birdEl.getBoundingClientRect();
        const drop = document.createElement('div');
        drop.className = 'dropped-item';
        drop.textContent = '📜'; // Scroll emoji
        drop.style.left = `${rect.left}px`;
        drop.style.top = `${rect.top}px`;

        document.body.appendChild(drop);

        // Trigger Event logic immediately
        this.triggerRandomEvent(rect.left, rect.top);

        if (typeof playSound === 'function') playSound('ui');
    },

    triggerRandomEvent(x, y) {
        const msg = this.messages[Math.floor(Math.random() * this.messages.length)];

        // Show Floating Text
        if (typeof Effects !== 'undefined') {
            Effects.floatingText(msg.text, x, y, {
                color: msg.effect === 'stress' ? '#ff5252' : '#ffffff',
                fontSize: '20px',
                distance: 150,
                duration: 2000
            });

            // Apply Effects
            if (msg.effect === 'heal') {
                if (typeof relieveStress === 'function') relieveStress(msg.val);
                Effects.particleBurst(x, y, 10, '#4caf50');
            } else if (msg.effect === 'stress') {
                if (typeof state !== 'undefined') {
                    state.stress += msg.val;
                    if (typeof updateStressUI === 'function') updateStressUI();
                }
                Effects.shake(document.body);
            } else if (msg.effect === 'gold') {
                if (typeof state !== 'undefined') {
                    state.arrows += msg.val;
                    if (typeof updateUI === 'function') updateUI();
                }
                Effects.particleBurst(x, y, 10, '#ffd700');
            }
        }
    },

    resetIdleTimer() {
        clearTimeout(this.idleTimer);
        const chatterEl = document.getElementById('chatter-bubble');
        if (chatterEl) chatterEl.classList.remove('show');

        // If idle for 10 seconds, talk
        this.idleTimer = setTimeout(() => {
            this.showChatter();
        }, 10000);
    },

    showChatter() {
        // Only if no meeting active
        if (typeof state !== 'undefined' && state.meetingActive) return;

        const line = this.chatterLines[Math.floor(Math.random() * this.chatterLines.length)];

        let bubble = document.getElementById('chatter-bubble');
        if (!bubble) {
            bubble = document.createElement('div');
            bubble.id = 'chatter-bubble';
            bubble.className = 'chatter-bubble';
            // Attach to character area
            const charArea = document.getElementById('character-area');
            if (charArea) charArea.appendChild(bubble);
            else document.body.appendChild(bubble);
        }

        bubble.textContent = line;
        bubble.classList.add('show');

        // Hide after 3s
        setTimeout(() => {
            bubble.classList.remove('show');
        }, 3000);
    }
};
