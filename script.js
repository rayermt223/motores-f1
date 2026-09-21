/* ═══════════════════════════════════════════
   FORMULA 1 — INICIO SCRIPT
   - Loading screen overlay
   - Speed particles canvas (Teal & White)
   ═══════════════════════════════════════════ */

// ═══════════════════════════════════════
// 1. LOADING SCREEN
// ═══════════════════════════════════════
window.addEventListener('load', () => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 1200);
    }
});

// ═══════════════════════════════════════
// 2. SPEED PARTICLES CANVAS
// ═══════════════════════════════════════
(function initSpeedCanvas() {
    const canvas = document.getElementById('speed-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 90;
    let mouseX = 0;
    let mouseY = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    // Track mouse for subtle parallax
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 1.5;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 1.5;
    });

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.z = Math.random() * 2.5 + 0.5;
            this.size = Math.random() * 1.8 + 0.5;
            this.speedX = -(Math.random() * 3.5 + 1.8) * this.z;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.35 + 0.1;
            this.length = Math.random() * 28 + 8;
            this.isTeal = Math.random() < 0.4;
        }

        update() {
            this.x += this.speedX + mouseX * this.z * 0.3;
            this.y += this.speedY + mouseY * this.z * 0.2;

            if (this.x + this.length < 0) {
                this.x = canvas.width + this.length;
                this.y = Math.random() * canvas.height;
            }
            if (this.y < -10 || this.y > canvas.height + 10) {
                this.y = Math.random() * canvas.height;
            }
        }

        draw() {
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.length, this.y);

            if (this.isTeal) {
                gradient.addColorStop(0, `rgba(0, 141, 142, ${this.opacity * 0.85})`);
                gradient.addColorStop(1, `rgba(0, 141, 142, 0)`);
            } else {
                gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.4})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            }

            ctx.beginPath();
            ctx.moveTo(this.x + this.length, this.y);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.size;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }

    // Init particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Center speed radial glow
        const centerGlow = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width * 0.55
        );
        centerGlow.addColorStop(0, 'rgba(0, 141, 142, 0.025)');
        centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = centerGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
})();
