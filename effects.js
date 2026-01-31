// ==========================================
// ENHANCED UI/UX EFFECTS SYSTEM
// ==========================================

const Effects = {
    // Create ink splash effect at position
    inkSplash(x, y) {
        const splash = document.createElement('div');
        splash.className = 'ink-splash';
        splash.style.left = `${x}px`;
        splash.style.top = `${y}px`;
        document.body.appendChild(splash);
        setTimeout(() => splash.remove(), 800);
    },

    // Create ripple effect
    ripple(element, event) {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        element.style.position = 'relative';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    },

    // Shake element (for errors)
    shake(element) {
        element.classList.add('shake-error');
        setTimeout(() => element.classList.remove('shake-error'), 500);
    },

    // Bounce in animation
    bounceIn(element) {
        element.classList.add('bounce-in');
        setTimeout(() => element.classList.remove('bounce-in'), 600);
    },

    // Glow pulse effect
    glowPulse(element, duration = 2000) {
        element.classList.add('glow-pulse');
        setTimeout(() => element.classList.remove('glow-pulse'), duration);
    },

    // Seal stamp effect
    sealStamp(element) {
        element.classList.add('seal-stamp');
        setTimeout(() => element.classList.remove('seal-stamp'), 400);
    },

    // Particle burst at position
    particleBurst(x, y, count = 12, color = '#ffd700') {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle-burst';

            const angle = (360 / count) * i;
            const velocity = 50 + Math.random() * 50;
            const tx = Math.cos(angle * Math.PI / 180) * velocity;
            const ty = Math.sin(angle * Math.PI / 180) * velocity;

            particle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 8px;
                height: 8px;
                background: ${color};
                border-radius: 50%;
                --tx: ${tx}px;
                --ty: ${ty}px;
                pointer-events: none;
                z-index: 1000;
            `;

            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 800);
        }
    },

    // Ink drip effect
    inkDrip(x, y, count = 3) {
        for (let i = 0; i < count; i++) {
            const drip = document.createElement('div');
            drip.className = 'ink-drip';
            drip.style.left = `${x + (Math.random() - 0.5) * 20}px`;
            drip.style.top = `${y}px`;
            drip.style.animationDelay = `${i * 0.1}s`;
            document.body.appendChild(drip);
            setTimeout(() => drip.remove(), 1500 + i * 100);
        }
    },

    // Success feedback with checkmark
    showSuccess(message, x, y) {
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 1000;
        `;

        container.innerHTML = `
            <div class="bounce-in" style="
                background: rgba(76, 175, 80, 0.95);
                color: white;
                padding: 15px 30px;
                border-radius: 8px;
                font-weight: bold;
                font-size: 18px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            ">
                ✓ ${message}
            </div>
        `;

        document.body.appendChild(container);
        this.particleBurst(x, y, 8, '#4caf50');

        setTimeout(() => {
            container.style.transition = 'opacity 0.3s';
            container.style.opacity = '0';
            setTimeout(() => container.remove(), 300);
        }, 2000);
    },

    // Error feedback
    showError(message, element) {
        this.shake(element);

        const error = document.createElement('div');
        error.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background: rgba(244, 67, 54, 0.95);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
        `;
        error.textContent = message;
        error.classList.add('bounce-in');

        document.body.appendChild(error);

        setTimeout(() => {
            error.style.transition = 'opacity 0.3s';
            error.style.opacity = '0';
            setTimeout(() => error.remove(), 300);
        }, 2000);
    },

    // Floating text with custom animation
    floatingText(text, x, y, options = {}) {
        const {
            color = '#ffd700',
            fontSize = '24px',
            duration = 1000,
            distance = 100
        } = options;

        const textEl = document.createElement('div');
        textEl.textContent = text;
        textEl.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-size: ${fontSize};
            font-weight: bold;
            pointer-events: none;
            z-index: 1000;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        `;

        document.body.appendChild(textEl);

        // Animate
        textEl.animate([
            { transform: 'translate(-50%, 0) scale(0.5)', opacity: 0 },
            { transform: `translate(-50%, -${distance}px) scale(1)`, opacity: 1, offset: 0.3 },
            { transform: `translate(-50%, -${distance * 1.5}px) scale(1)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        setTimeout(() => textEl.remove(), duration);
    },

    // Screen flash effect
    screenFlash(color = 'rgba(255, 255, 255, 0.5)', duration = 200) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${color};
            z-index: 9999;
            pointer-events: none;
            animation: fadeOut ${duration}ms ease-out forwards;
        `;

        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), duration);
    },

    // Coin flip animation
    coinFlip(element, callback) {
        element.classList.add('coin-flip');
        setTimeout(() => {
            element.classList.remove('coin-flip');
            if (callback) callback();
        }, 1000);
    }
};

// Auto-apply effects to interactive elements
document.addEventListener('DOMContentLoaded', () => {
    // Add ripple to all buttons
    document.querySelectorAll('.btn-primary, .btn-action, .dock-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            Effects.ripple(this, e);
        });
    });

    // Add ink splash to grind button
    const grindBtn = document.getElementById('grind-stone-hitbox');
    if (grindBtn) {
        grindBtn.addEventListener('click', (e) => {
            Effects.inkSplash(e.clientX, e.clientY);
        });
    }

    // Add hover lift to cards
    document.querySelectorAll('.shop-item, .modal-content').forEach(el => {
        if (!el.classList.contains('hover-lift')) {
            el.classList.add('hover-lift');
        }
    });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Effects;
}
