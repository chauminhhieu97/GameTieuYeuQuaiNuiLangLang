/**
 * Game Effects Manager
 * Handles Particles, Lottie Animations, and Visual Feedback
 */

const visuals = {
    particles: [],

    init: function () {
        this.container = document.getElementById('particles-container');
        this.loop();
        console.log("Effects System Initialized 🌸");
    },

    /**
     * Spawn a floating text or icon at specific coordinates
     * @param {number} x - Screen X percentage or pixels
     * @param {number} y - Screen Y percentage or pixels
     * @param {string} content - Text or Emoji
     * @param {string} type - 'normal', 'crit', 'heal'
     */
    spawnText: function (x, y, content, type = 'normal') {
        const el = document.createElement('div');
        el.className = `particle text-popup ${type}`;
        el.innerText = content;

        // Randomize position slightly for natural feel
        const randomX = (Math.random() - 0.5) * 20;

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.transform = `translateX(${randomX}px)`; // Initial offset

        this.container.appendChild(el);

        // Auto remove after animation
        setTimeout(() => {
            el.remove();
        }, 1000); // Matches CSS animation duration
    },

    /**
     * Spawn sweat drops on the character when stressed
     */
    spawnSweat: function () {
        const charRect = document.getElementById('pig-char').getBoundingClientRect();
        if (!charRect) return;

        const el = document.createElement('div');
        el.className = 'particle sweat';

        const offsetX = (Math.random() * 60) + 20; // Within character width

        el.style.left = `${charRect.left + offsetX}px`;
        el.style.top = `${charRect.top + 20}px`;

        this.container.appendChild(el);

        setTimeout(() => el.remove(), 1500);
    },

    /**
     * Play a Lottie animation
     * @param {string} elementId - Target DOM ID
     * @param {string} path - JSON URL or Path
     * @param {boolean} loop
     */
    playLottie: function (elementId, path, loop = false) {
        if (!window.lottie) {
            console.warn("Lottie library not loaded yet.");
            return;
        }

        const container = document.getElementById(elementId);
        if (!container) return;

        container.innerHTML = ''; // Clear previous

        return lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: loop,
            autoplay: true,
            path: path
        });
    },

    loop: function () {
        // Future complex physics updates go here
        requestAnimationFrame(() => this.loop());
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    visuals.init();
});

// Export global for other scripts
window.visuals = visuals;
