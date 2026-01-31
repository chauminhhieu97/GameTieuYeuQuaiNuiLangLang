
// =========================================
// PARALLAX EFFECT (Disabled on Mobile)
// =========================================
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (!isMobile) {
    document.addEventListener('mousemove', (e) => {
        try {
            const w = window.innerWidth;
            const h = window.innerHeight;

            // Calculate normalized mouse position (-1 to 1)
            const x = (e.clientX - w / 2) / (w / 2);
            const y = (e.clientY - h / 2) / (h / 2);

            // 1. Mountain Layer - Slow movement
            const mountain = document.getElementById('mountain-layer');
            if (mountain) {
                mountain.style.transform = `translate(${x * 15}px, ${y * 5}px)`;
            }

            // 2. Character Layer - Medium movement (Parallax)
            // Ensure character stays centered!
            const character = document.getElementById('character-area');
            if (character) {
                // We use a safe-guard to ensure it never flies off screen
                const safeX = Math.max(-30, Math.min(30, x * 20)); // Limit to +/- 30px
                const safeY = Math.max(-15, Math.min(15, y * 10));

                character.style.transform = `translateX(calc(-50% + ${-safeX}px)) translateY(${-safeY}px)`;
            }

            // 3. Arrow Pile - Foreground - Fast movement
            const arrows = document.getElementById('arrow-pile');
            if (arrows) {
                arrows.style.transform = `translate(${x * -30}px, ${y * -15}px)`;
            }
        } catch (err) {
            // Silently fail to prevent console spam
        }
    });
} else {
    // On mobile, ensure elements are in default position
    console.log('Mobile device detected - Parallax disabled for performance');
}
