// job_mechanics.js - Core Job Gameplay Implementation
// Dependencies: Matter.js, effects.js, script.js (state)

const JobMechanics = {
    engine: null,
    render: null,
    runner: null,
    activeJob: null, // 'grind', 'wood', 'cook'

    // Canvas context for drawing overlay effects (sparks, smoke, bodies)
    canvas: null,
    ctx: null,
    container: null,

    // Loop
    animationFrameId: null,

    init() {
        console.log("JobMechanics: Initializing...");

        // 1. Setup Overlay Canvas
        this.container = document.getElementById('character-wrapper');
        if (!this.container) {
            console.error("JobMechanics: character-wrapper not found!");
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.id = 'job-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none'; // Click-through initially
        canvas.style.zIndex = '20'; // On top of sprite but below UI
        this.container.appendChild(canvas);

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Resize Handler
        const resize = () => {
            this.canvas.width = this.container.clientWidth;
            this.canvas.height = this.container.clientHeight;
        };
        new ResizeObserver(resize).observe(this.container);
        resize(); // Initial

        // 2. Setup Matter.js Engine
        this.engine = Matter.Engine.create();
        this.runner = Matter.Runner.create();

        // Hook into update loop for visual sync
        Matter.Events.on(this.engine, 'afterUpdate', () => {
            // Any post-physics logic
        });
    },

    startJob(jobName) {
        if (this.activeJob === jobName) return;
        this.stopJob(); // Cleanup previous

        this.activeJob = jobName;
        console.log(`JobMechanics: Starting ${jobName}`);

        // Enable Canvas Interaction based on job
        this.canvas.style.pointerEvents = 'auto';

        if (jobName === 'grind') this.Grind.start();
        else if (jobName === 'wood') this.Wood.start();
        else if (jobName === 'cook') this.Cook.start();
        else {
            // Default / None
            this.canvas.style.pointerEvents = 'none';
        }

        // Global Loop
        if (!this.animationFrameId) {
            this.loop();
        }
    },

    stopJob() {
        if (!this.activeJob) return;

        console.log(`JobMechanics: Stopping ${this.activeJob}`);

        if (this.activeJob === 'grind') this.Grind.stop();
        if (this.activeJob === 'wood') this.Wood.stop();
        if (this.activeJob === 'cook') this.Cook.stop();

        // Clear Physics World
        Matter.Composite.clear(this.engine.world);
        Matter.Engine.clear(this.engine);

        // Context Clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.activeJob = null;
        this.canvas.style.pointerEvents = 'none';
    },

    loop() {
        this.animationFrameId = requestAnimationFrame(this.loop.bind(this));

        // Clear Canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.activeJob) return;

        // Run Logic
        if (this.activeJob === 'grind') this.Grind.update(this.ctx);
        if (this.activeJob === 'wood') this.Wood.update(this.ctx);
        if (this.activeJob === 'cook') this.Cook.update(this.ctx);

        // Tick Physics
        // Matter.Runner.tick(this.runner, this.engine, 1000/60); 
        // We use Runner.run usually, but manual tick gives more control in sync with requestAnimationFrame
        Matter.Engine.update(this.engine, 1000 / 60);
    },

    // ===========================================
    // GAME 1: ARROW SHARPENING (Mài Tên)
    // ===========================================
    Grind: {
        arrow: null,
        mouseConstraint: null,
        lastSparkTime: 0,

        start() {
            const engine = JobMechanics.engine;
            const width = JobMechanics.canvas.width;
            const height = JobMechanics.canvas.height;

            // 1. Static Grindstone (Invisible Base)
            const stone = Matter.Bodies.rectangle(width / 2, height - 20, width, 60, {
                isStatic: true,
                friction: 1.0, // High friction for resistance
                label: 'stone'
            });

            // 2. Arrow (The heavy object)
            this.arrow = Matter.Bodies.rectangle(width / 2, height / 2, 120, 10, {
                mass: 5, // Heavy
                friction: 0.1, // Slippery wood
                frictionAir: 0.05,
                restitution: 0.2, // Low bounce
                label: 'arrow'
            });

            // 3. Walls to keep arrow in bounds
            const leftWall = Matter.Bodies.rectangle(0, height / 2, 20, height, { isStatic: true, render: { visible: false } });
            const rightWall = Matter.Bodies.rectangle(width, height / 2, 20, height, { isStatic: true, render: { visible: false } });
            // Ceiling
            const ceil = Matter.Bodies.rectangle(width / 2, -100, width, 50, { isStatic: true });

            Matter.Composite.add(engine.world, [stone, this.arrow, leftWall, rightWall, ceil]);

            // 4. Mouse Control
            const mouse = Matter.Mouse.create(JobMechanics.canvas);
            this.mouseConstraint = Matter.MouseConstraint.create(engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.05, // Looser control for "heavy" feel
                    damping: 0.1,
                    render: { visible: false }
                }
            });
            Matter.Composite.add(engine.world, this.mouseConstraint);

            // Sync mouse with canvas pixel ratio if needed? 
            // Usually fine handled by Matter.Mouse.create
        },

        update(ctx) {
            if (!this.arrow) return;

            // Draw Stone (Visual Hint)
            // ctx.fillStyle = 'rgba(0,0,0,0.1)';
            // ctx.fillRect(0, JobMechanics.canvas.height - 50, JobMechanics.canvas.width, 50);

            // Draw Arrow
            const pos = this.arrow.position;
            const angle = this.arrow.angle;

            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(angle);

            // Ink Style Drawing
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(-60, -5, 120, 10);

            // Tip
            ctx.beginPath();
            ctx.moveTo(60, -5);
            ctx.lineTo(80, 0);
            ctx.lineTo(60, 5);
            ctx.closePath();
            ctx.fillStyle = '#b0bec5'; // Metal tip
            ctx.fill();

            ctx.restore();

            // Logic: Check if grinding (Velocity + Contact with Stone)
            // Simplified: Check Y pos and Velocity X
            if (pos.y > JobMechanics.canvas.height - 80) {
                const speed = Math.abs(this.arrow.velocity.x);
                if (speed > 5) {
                    // Spark!
                    if (Date.now() - this.lastSparkTime > 50) {
                        this.lastSparkTime = Date.now();
                        // Logic call to script.js for score?
                        // Better: Accumulate local progress then push
                        state.arrows += 1; // Direct update
                        updateUI();

                        // SFX
                        if (typeof SoundFX !== 'undefined') SoundFX.grind();

                        // Visuals
                        spawnInkParticle(pos.x + 60, pos.y); // At tip approx
                    }
                }
            }
        },

        stop() {
            this.arrow = null;
            this.mouseConstraint = null;
        }
    },

    // ===========================================
    // GAME 2: FIRE STARTER (Nhóm Lửa)
    // ===========================================
    Cook: {
        temperature: 50, // 0-100
        targetZone: [60, 80],
        decayRate: 0.3,
        tapPower: 15,
        smokeParticles: [],

        start() {
            this.temperature = 50;
            this.smokeParticles = [];

            // Add Tap Listener
            this.tapHandler = (e) => {
                this.temperature += this.tapPower;
                if (this.temperature > 100) this.temperature = 100;

                // Spawn puff
                this.smokeParticles.push({
                    x: JobMechanics.canvas.width / 2,
                    y: JobMechanics.canvas.height - 50,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -3 - Math.random() * 2,
                    life: 1.0,
                    scale: 1.0
                });

                if (typeof playSound === 'function') playSound('uiClick');
            };
            JobMechanics.canvas.addEventListener('mousedown', this.tapHandler);
            JobMechanics.canvas.addEventListener('touchstart', this.tapHandler);
        },

        update(ctx) {
            // Logic
            this.temperature -= this.decayRate;
            if (this.temperature < 0) this.temperature = 0;

            // UI: Draw Temp Bar Overlay
            const w = 20;
            const h = 200;
            const x = JobMechanics.canvas.width - 40;
            const y = JobMechanics.canvas.height / 2 - 100;

            // Container
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(x, y, w, h);

            // Target Zone
            const zoneTop = y + h - (this.targetZone[1] / 100) * h;
            const zoneHeight = ((this.targetZone[1] - this.targetZone[0]) / 100) * h;
            ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
            ctx.fillRect(x, zoneTop, w, zoneHeight);

            // Bar
            const barHeight = (this.temperature / 100) * h;
            const barTop = y + h - barHeight;

            // Color based on zone
            let color = '#ff9800';
            if (this.temperature < this.targetZone[0]) color = '#2196f3'; // Cold
            else if (this.temperature > this.targetZone[1]) color = '#f44336'; // Hot
            else {
                color = '#4caf50'; // Perfect
                state.arrows += 0.2; // Passive gain if perfect
                updateUI();
            }

            ctx.fillStyle = color;
            ctx.fillRect(x, barTop, w, barHeight);

            // Particles
            for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
                let p = this.smokeParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                p.scale += 0.05;

                if (p.life <= 0) {
                    this.smokeParticles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.scale(p.scale, p.scale);
                ctx.fillStyle = `rgba(100, 100, 100, ${p.life})`;
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        },

        stop() {
            JobMechanics.canvas.removeEventListener('mousedown', this.tapHandler);
            JobMechanics.canvas.removeEventListener('touchstart', this.tapHandler);
        }
    },

    // ===========================================
    // GAME 3: WOOD CHOPPING (Chặt Củi)
    // ===========================================
    Wood: {
        logs: [],
        spawnTimer: 0,
        axeBody: null,

        start() {
            // 1. Setup Axe (Mouse Follower)
            const engine = JobMechanics.engine;
            // Small circle for axe head collider
            this.axeBody = Matter.Bodies.circle(0, 0, 20, {
                isStatic: true, // We move it manually, so physics doesn't pull it
                label: 'axe',
                render: { visible: false }
            });
            Matter.Composite.add(engine.world, this.axeBody);

            // Mouse Move Handler
            this.moveHandler = (e) => {
                const rect = JobMechanics.canvas.getBoundingClientRect();
                const x = (e.clientX || e.touches[0].clientX) - rect.left;
                const y = (e.clientY || e.touches[0].clientY) - rect.top;
                Matter.Body.setPosition(this.axeBody, { x, y });

                // Check collisions manually or let engine handle?
                // Engine handles collision response (bouncing), but we want to "Cut"
                // So we need to detect overlap and split
            };

            JobMechanics.canvas.addEventListener('mousemove', this.moveHandler);
            JobMechanics.canvas.addEventListener('touchmove', this.moveHandler);

            this.clickDetector = (e) => {
                // Trigger Chop Animation / Force
                // For now, chopping happens on contact if velocity is high?
                // Or Click to Chop? User said "Click" in requirements.
                this.chop();
            };
            JobMechanics.canvas.addEventListener('mousedown', this.clickDetector);
            JobMechanics.canvas.addEventListener('touchstart', this.clickDetector);
        },

        chop() {
            // Logic: Find logs overlapping with axeBody
            const engine = JobMechanics.engine;
            const allBodies = Matter.Composite.allBodies(engine.world);
            const logs = allBodies.filter(b => b.label === 'log');

            const axePos = this.axeBody.position;

            logs.forEach(log => {
                // Distance Check (Simple)
                const dx = log.position.x - axePos.x;
                const dy = log.position.y - axePos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 50) { // Radius of log + axe
                    // CUT!
                    // Remove old log
                    Matter.Composite.remove(engine.world, log);

                    // Spawn 2 halves (Physics bodies)
                    const half1 = Matter.Bodies.rectangle(log.position.x - 10, log.position.y, 20, 40, {
                        velocity: { x: -5, y: -5 },
                        frictionAir: 0.05,
                        label: 'chip'
                    });
                    const half2 = Matter.Bodies.rectangle(log.position.x + 10, log.position.y, 20, 40, {
                        velocity: { x: 5, y: -5 },
                        frictionAir: 0.05,
                        label: 'chip'
                    });

                    Matter.Composite.add(engine.world, [half1, half2]);

                    // Score
                    state.arrows += 10;
                    updateUI();

                    // Sound
                    if (typeof playSound === 'function') playSound('grind'); // Reuse chop sound if generic
                    spawnFeedback(log.position.x, log.position.y, "CỐP!", true);
                }
            });
        },

        update(ctx) {
            // Spawner
            if (Math.random() < 0.02) { // Chance per frame
                const w = JobMechanics.canvas.width;
                const h = JobMechanics.canvas.height;

                const log = Matter.Bodies.rectangle(
                    w * 0.2 + Math.random() * w * 0.6, // Random X
                    h + 50, // Below screen
                    40, 80,
                    {
                        force: { x: (Math.random() - 0.5) * 0.05, y: -0.15 - Math.random() * 0.05 }, // Throw up
                        torque: Math.random() * 0.1, // Spin
                        label: 'log',
                        frictionAir: 0.01
                    }
                );
                Matter.Composite.add(JobMechanics.engine.world, log);
            }

            // Renderer
            const bodies = Matter.Composite.allBodies(JobMechanics.engine.world);
            bodies.forEach(b => {
                ctx.save();
                ctx.translate(b.position.x, b.position.y);
                ctx.rotate(b.angle);

                if (b.label === 'log') {
                    ctx.fillStyle = '#795548';
                    ctx.fillRect(-20, -40, 40, 80);
                    // Bark texture
                    ctx.strokeStyle = '#3e2723';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(-20, -40, 40, 80);
                } else if (b.label === 'chip') {
                    ctx.fillStyle = '#a1887f';
                    ctx.fillRect(-10, -20, 20, 40);
                } else if (b.label === 'axe') {
                    // Debug axe
                    // ctx.fillStyle = 'red';
                    // ctx.beginPath(); ctx.arc(0,0,20,0,Math.PI*2); ctx.fill();
                }

                ctx.restore();

                // Cleanup out of bounds
                if (b.position.y > JobMechanics.canvas.height + 100 && b.velocity.y > 0) {
                    Matter.Composite.remove(JobMechanics.engine.world, b);
                }
            });

            // Draw Axe at mouse position (Custom Visual)
            if (this.axeBody) {
                ctx.save();
                ctx.translate(this.axeBody.position.x, this.axeBody.position.y);
                ctx.fillStyle = '#b71c1c'; // Red Axe Head
                ctx.beginPath();
                ctx.moveTo(0, -20);
                ctx.lineTo(20, 10);
                ctx.lineTo(0, 20);
                ctx.lineTo(-20, 10);
                ctx.fill();
                ctx.restore();
            }
        },

        stop() {
            JobMechanics.canvas.removeEventListener('mousemove', this.moveHandler);
            JobMechanics.canvas.removeEventListener('touchmove', this.moveHandler);
            JobMechanics.canvas.removeEventListener('mousedown', this.clickDetector);
            JobMechanics.canvas.removeEventListener('touchstart', this.clickDetector);
            this.axeBody = null;
        }
    }
};
