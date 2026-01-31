// ==========================================
// MINIGAME SYSTEM
// ==========================================

const MiniGames = {
    currentGame: null,
    score: 0,
    timer: null,
    timeLeft: 0,
    interval: null,

    // Define Games
    games: {
        scrub: {
            title: "BÀN CHẢI HEO CON",
            desc: "Dùng chuột/tay chà sạch vết bẩn!",
            duration: 15,
            init: (container) => MiniGames.scrub.setup(container)
        },
        // stack: { ... }, // Placeholder for now
        // fly: { ... },   // Placeholder for now
        steal_bun: {
            title: "ĂN VỤNG BÁNH BAO",
            desc: "Giữ chuột/tay để ăn bánh. Thả ra khi Sếp quay lại!",
            duration: 20,
            init: (container) => MiniGames.steal_bun.setup(container)
        },
        catch_arrow: {
            title: "HỨNG TÊN TẬP KÍCH",
            desc: "Di chuyển Heo để hứng tên, né đá!",
            duration: 20,
            init: (container) => MiniGames.catch_arrow.setup(container)
        }
    },

    // Start a Random Game
    startRandom(container) {
        const keys = Object.keys(this.games);
        // const randomKey = keys[Math.floor(Math.random() * keys.length)];
        // For testing, cycle or pick Scrub first
        const randomKey = Math.random() > 0.5 ? 'steal_bun' : 'catch_arrow';

        this.start(randomKey, container);
    },

    start(gameKey, container) {
        this.currentGame = this.games[gameKey];
        this.score = 0;
        this.timeLeft = this.currentGame.duration;

        // Setup UI
        container.innerHTML = `
            <div id="minigame-header" style="text-align: center; margin-bottom: 10px;">
                <h3 style="color: #bf360c; margin: 0;">${this.currentGame.title}</h3>
                <p style="margin: 0; font-size: 14px;">${this.currentGame.desc}</p>
                <div class="minigame-timer">${this.timeLeft}s</div>
                <div class="minigame-score">SCORE: 0</div>
            </div>
            <div id="minigame-viewport"></div>
        `;

        const viewport = container.querySelector('#minigame-viewport');

        // Init logic
        this.currentGame.init(viewport);

        // Start Timer
        this.interval = setInterval(() => {
            this.timeLeft--;
            container.querySelector('.minigame-timer').textContent = this.timeLeft + 's';

            if (this.timeLeft <= 0) {
                this.end(true);
            }
        }, 1000);
    },

    end(success) {
        clearInterval(this.interval);
        if (this.currentGame.cleanup) this.currentGame.cleanup();

        // Callback to main script (assumed global 'endMeeting')
        if (typeof endMeeting === 'function') {
            // Only pass logic, UI handling in main script
            // Maybe set a global score state
            state.meetingScore = this.score;
            endMeeting();
        }
    },

    // Update Score UI
    addScore(points) {
        this.score += points;
        const el = document.querySelector('.minigame-score');
        if (el) el.textContent = `SCORE: ${this.score}`;
    },

    // ===============================
    // GAME 1: CAULDRON SCRUB
    // ===============================
    scrub: {
        setup(container) {
            container.innerHTML = `
                <div id="minigame-scrub">
                    <div id="pig-brush"></div>
                </div>
            `;
            const gameArea = container.querySelector('#minigame-scrub');
            const brush = container.querySelector('#pig-brush');

            // Spawn Stains
            for (let i = 0; i < 15; i++) {
                const stain = document.createElement('div');
                stain.className = 'stain';
                stain.style.left = Math.random() * 260 + 'px';
                stain.style.top = Math.random() * 260 + 'px';
                gameArea.appendChild(stain);
            }

            // Drag Logic
            let isDragging = false;

            const moveBrush = (e) => {
                if (!isDragging) return;
                e.preventDefault(); // Prevent scrolling on touch

                const rect = gameArea.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                // Calculate position relative to container
                let x = clientX - rect.left - 30; // Center offset (60px/2)
                let y = clientY - rect.top - 30;

                // Clamp within bounds
                x = Math.max(0, Math.min(x, 220)); // 280 - 60
                y = Math.max(0, Math.min(y, 220));

                brush.style.left = `${x}px`;
                brush.style.top = `${y}px`;
                brush.style.transform = `scale(0.9) rotate(${Math.random() * 20 - 10}deg)`;

                // Check Collision with Stains
                // We use center point of brush for better feel
                const brushCenterX = x + 30;
                const brushCenterY = y + 30;

                const stains = gameArea.querySelectorAll('.stain');

                stains.forEach(stain => {
                    const sx = parseFloat(stain.style.left);
                    const sy = parseFloat(stain.style.top);
                    const size = 40;

                    // Simple distance check (Circle to Circle)
                    const dx = brushCenterX - (sx + size / 2);
                    const dy = brushCenterY - (sy + size / 2);
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 40) { // Radius sum approx
                        // Clean stain
                        let op = parseFloat(stain.style.opacity || 0.9);
                        op -= 0.15; // Faster cleaning
                        stain.style.opacity = op;

                        // FX
                        if (Math.random() > 0.8 && typeof Effects !== 'undefined') {
                            Effects.inkSplash(rect.left + sx + 20, rect.top + sy + 20);
                        }

                        if (op <= 0) {
                            stain.remove();
                            // Pop sound
                            if (typeof playSound === 'function') playSound('grind');
                            MiniGames.addScore(10);

                            // Check win immediately
                            if (gameArea.querySelectorAll('.stain').length === 0) {
                                MiniGames.addScore(50); // Completion Bonus
                                MiniGames.end(true);
                            }
                        }
                    }
                });
            };

            const startDrag = (e) => {
                isDragging = true;
                brush.style.transform = 'scale(0.9)';
                moveBrush(e); // Move immediately to click
            };

            const stopDrag = () => {
                isDragging = false;
                brush.style.transform = 'scale(1)';
            };

            // Bind Events
            gameArea.addEventListener('mousedown', startDrag);
            gameArea.addEventListener('touchstart', startDrag, { passive: false });

            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchend', stopDrag);

            gameArea.addEventListener('mousemove', moveBrush);
            gameArea.addEventListener('touchmove', moveBrush, { passive: false });

            // Store cleanup function
            this.cleanup = () => {
                document.removeEventListener('mouseup', stopDrag);
                document.removeEventListener('touchend', stopDrag);
                // Listeners on elements are removed when element is removed
            };
        }
    },

    // ===============================
    // GAME 4: PHONE SNEAK
    // ===============================
    // ===============================
    // GAME 2: BUN STEALING (Renamed from Sneak)
    // ===============================
    steal_bun: {
        bossInterval: null,
        isBossWatching: false,

        setup(container) {
            container.innerHTML = `
                <div id="minigame-steal">
                    <div id="pig-eating" style="font-size:60px; position:absolute; bottom:20px; left:50%; transform:translateX(-50%); transition:all 0.1s;">🐷</div>
                    <div id="bun-basket" style="font-size:40px; position:absolute; bottom:20px; left:20px;">🥟</div>
                    <div id="boss-watcher" style="font-size:80px; position:absolute; top:20px; right:20px; opacity:0.3; transition: opacity 0.3s;">🐺</div>
                    <div id="danger-indicator" style="position:absolute; top:10px; right:10px; width:100px; height:100px; border:5px solid red; border-radius:50%; display:none;"></div>
                </div>
            `;

            const pig = container.querySelector('#pig-eating');
            const boss = container.querySelector('#boss-watcher');
            const danger = container.querySelector('#danger-indicator');
            let isEating = false;

            // Input Handlers
            const startEat = (e) => {
                e.preventDefault();
                isEating = true;
                pig.textContent = "🤤"; // Eating face
                pig.style.transform = "translateX(-50%) scale(1.1)";

                // Score while holding
                if (!MiniGames.steal_bun.isBossWatching) {
                    MiniGames.addScore(1);
                    if (Math.random() < 0.1) spawnFeedback(e.clientX || 150, e.clientY || 150, "Ngon!", false);
                } else {
                    // CAUGHT!
                    MiniGames.end(false); // Fail immediately
                    if (typeof Effects !== 'undefined') Effects.showError("BỊ BẮT QUẢ TANG!", pig);
                    if (typeof playSound === 'function') playSound('ui'); // Scream
                }
            };

            const stopEat = (e) => {
                e.preventDefault();
                isEating = false;
                pig.textContent = "🐷"; // Normal face
                pig.style.transform = "translateX(-50%) scale(1)";
            };

            const gameArea = container.querySelector('#minigame-steal');
            gameArea.addEventListener('mousedown', startEat);
            gameArea.addEventListener('touchstart', startEat, { passive: false });
            gameArea.addEventListener('mouseup', stopEat);
            gameArea.addEventListener('touchend', stopEat);
            gameArea.addEventListener('mouseleave', stopEat);

            // Boss Logic
            this.bossInterval = setInterval(() => {
                // Warning Phase
                boss.style.opacity = 0.6;
                // Chance to look
                if (Math.random() < 0.4) {
                    // 1s Warning
                    danger.style.display = 'block';
                    danger.style.borderColor = 'yellow';

                    setTimeout(() => {
                        // Look Now!
                        boss.style.opacity = 1;
                        boss.textContent = "👀"; // Eyes open
                        danger.style.borderColor = 'red';
                        this.isBossWatching = true;

                        if (isEating) {
                            MiniGames.end(false);
                        }

                        // Look for 1.5s
                        setTimeout(() => {
                            boss.style.opacity = 0.3;
                            boss.textContent = "🐺";
                            danger.style.display = 'none';
                            this.isBossWatching = false;
                        }, 1500);

                    }, 1000);
                } else {
                    setTimeout(() => { boss.style.opacity = 0.3; }, 500);
                }
            }, 3500);

            // Score Loop
            this.scoreInterval = setInterval(() => {
                if (isEating && !this.isBossWatching) {
                    MiniGames.addScore(1);
                }
            }, 100);
        },

        cleanup() {
            clearInterval(this.bossInterval);
            clearInterval(this.scoreInterval);
        }
    },

    // ===============================
    // GAME 3: CATCH ARROWS
    // ===============================
    catch_arrow: {
        spawnInterval: null,
        items: [],

        setup(container) {
            container.innerHTML = `
                <div id="minigame-catch" style="position:relative; width:100%; height:250px; overflow:hidden; background:#e0f7fa;">
                    <div id="pig-catcher" style="font-size:50px; position:absolute; bottom:10px; left:50%; transform:translateX(-50%);">🧺</div>
                </div>
            `;
            const area = container.querySelector('#minigame-catch');
            const pig = container.querySelector('#pig-catcher');
            let pigX = 50; // Percentage

            // Movement
            const updatePig = (xPercent) => {
                pigX = Math.max(10, Math.min(90, xPercent));
                pig.style.left = `${pigX}%`;
            };

            area.addEventListener('mousemove', (e) => {
                const rect = area.getBoundingClientRect();
                updatePig(((e.clientX - rect.left) / rect.width) * 100);
            });

            area.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const rect = area.getBoundingClientRect();
                const touch = e.touches[0];
                updatePig(((touch.clientX - rect.left) / rect.width) * 100);
            }, { passive: false });

            // Spawner
            this.spawnInterval = setInterval(() => {
                const item = document.createElement('div');
                const isGood = Math.random() > 0.3; // 70% Arrows
                item.textContent = isGood ? '🏹' : '🪨';
                item.className = isGood ? 'catch-item good' : 'catch-item bad';
                item.style.position = 'absolute';
                item.style.top = '-30px';
                item.style.left = `${Math.random() * 90 + 5}%`;
                item.style.fontSize = '30px';
                area.appendChild(item);

                // Fall Animation
                let top = -30;
                const fallSpeed = 3 + Math.random() * 3;

                const fall = setInterval(() => {
                    top += fallSpeed;
                    item.style.top = `${top}px`;

                    // Catch Check
                    if (top > 200 && top < 230) {
                        const itemLeft = parseFloat(item.style.left);
                        if (Math.abs(itemLeft - pigX) < 10) { // Hit
                            if (isGood) {
                                MiniGames.addScore(10);
                                if (typeof playSound === 'function') playSound('coin');
                                item.remove();
                                clearInterval(fall);
                            } else {
                                // Hit rock
                                if (typeof playSound === 'function') playSound('ui');
                                MiniGames.end(false); // Immediate fail on rock? Or penalize? Let's penalize.
                                MiniGames.addScore(-50);
                                item.remove();
                                clearInterval(fall);
                            }
                        }
                    }

                    if (top > 260) {
                        item.remove();
                        clearInterval(fall);
                    }
                }, 20);

            }, 800); // Spawn every 800ms
        },

        cleanup() {
            clearInterval(this.spawnInterval);
            // Clear falling items logic if strictly needed, but DOM clearing handles visual removal
        }
    }
};
