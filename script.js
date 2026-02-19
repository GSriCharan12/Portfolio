// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Integrate GSAP specific ticker for Lenis
gsap.registerPlugin(ScrollTrigger);

// Custom Cursor Logic
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

let posX = 0, posY = 0;
let mouseX = 0, mouseY = 0;

gsap.to({}, {
    duration: 0.016,
    repeat: -1,
    onRepeat: function () {
        posX += (mouseX - posX) / 9;
        posY += (mouseY - posY) / 9;

        gsap.set(follower, {
            css: {
                left: posX - 12,
                top: posY - 12
            }
        });

        gsap.set(cursor, {
            css: {
                left: mouseX,
                top: mouseY
            }
        });
    }
});

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Cursor Hover Effects
const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-item');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('hover-active');
        // Magnetic effect for buttons
        if (el.classList.contains('magnetic-btn')) {
            gsap.to(el, { scale: 1.1, duration: 0.3 });
        }
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('hover-active');
        if (el.classList.contains('magnetic-btn')) {
            gsap.to(el, { scale: 1, duration: 0.3 });
        }
        gsap.to(el, { x: 0, y: 0, duration: 0.3 }); // Reset magnetic pull
    });

    // Magnetic Pull on Move
    if (el.classList.contains('magnetic-btn')) {
        el.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 768) return;
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.3 });
            gsap.to(el.querySelector('.btn-fill'), { x: x * 0.2, y: y * 0.2, duration: 0.3 }); // Parallax fill
        });
    }
});


// Loader Animation
const loaderTl = gsap.timeline();

loaderTl
    .to('.loader-text', {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.5,
        ease: 'power3.out'
    })
    .to('.loader-text', {
        y: -50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.2,
        delay: 0.5
    })
    .to('.loader', {
        y: '-100%',
        duration: 1,
        ease: 'power4.inOut'
    })
    .to('body', {
        overflow: 'auto', // Enable scrolling
        onComplete: () => document.body.classList.remove('loading')
    }, "-=0.5")
    .from('.hero-title .line span', {
        y: "100%",
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out'
    }, "-=0.5")
    .to('.hero-sub', {
        opacity: 1,
        duration: 1
    }, "-=0.5");


// Scroll Color Change
const sections = document.querySelectorAll('[data-color]');
sections.forEach(section => {
    ScrollTrigger.create({
        trigger: section,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => updateColors(section),
        onEnterBack: () => updateColors(section)
    });
});

function updateColors(section) {
    const bgColor = getComputedStyle(section).getPropertyValue('--bg-color');
    const txtColor = getComputedStyle(section).getPropertyValue('--text-color');

    gsap.to('body', {
        backgroundColor: bgColor,
        color: txtColor,
        duration: 0.5
    });
}

// About Text Reveal (Manual Split)
const aboutText = document.querySelector('.reveal-text');
const words = aboutText.innerText.split(' ');
aboutText.innerHTML = '';
words.forEach(word => {
    const span = document.createElement('span');
    span.innerText = word + ' ';
    aboutText.appendChild(span);
});

gsap.fromTo('.reveal-text span',
    { opacity: 0.1 },
    {
        opacity: 1,
        stagger: 0.1,
        scrollTrigger: {
            trigger: '.about',
            start: 'top 60%',
            end: 'bottom 60%',
            scrub: true
        }
    }
);

// Marquee Logic (Manual Drag + Infinite Flow)
const marqueeWrapper = document.querySelector('.marquee-wrapper');
const marqueeContent = document.querySelector('.marquee-content');

if (marqueeWrapper && marqueeContent) {
    let isDragging = false;
    let startX;
    let scrollLeft;
    let autoScrollSpeed = 1.0;
    let animationId;

    const startAutoScroll = () => {
        marqueeWrapper.scrollLeft += autoScrollSpeed;

        // Loop back to start when reaching the end of the content
        // (scrollWidth - clientWidth) is the maximum possible scrollLeft
        if (marqueeWrapper.scrollLeft >= (marqueeWrapper.scrollWidth - marqueeWrapper.clientWidth)) {
            marqueeWrapper.scrollLeft = 0;
        }
        animationId = requestAnimationFrame(startAutoScroll);
    };

    startAutoScroll();

    const stopAuto = () => cancelAnimationFrame(animationId);
    const resumeAuto = () => {
        if (!isDragging) startAutoScroll();
    };

    marqueeWrapper.addEventListener('mouseenter', stopAuto);
    marqueeWrapper.addEventListener('mouseleave', resumeAuto);

    // Mouse Drag
    marqueeWrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        marqueeWrapper.style.scrollBehavior = 'auto';
        startX = e.pageX - marqueeWrapper.offsetLeft;
        scrollLeft = marqueeWrapper.scrollLeft;
        stopAuto();
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        marqueeWrapper.style.scrollBehavior = 'smooth';
        resumeAuto();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - marqueeWrapper.offsetLeft;
        const walk = (x - startX) * 2;
        marqueeWrapper.scrollLeft = scrollLeft - walk;
    });

    // Touch support for swiping
    marqueeWrapper.addEventListener('touchstart', (e) => {
        stopAuto();
        marqueeWrapper.style.scrollBehavior = 'auto';
        startX = e.touches[0].pageX - marqueeWrapper.offsetLeft;
        scrollLeft = marqueeWrapper.scrollLeft;
    }, { passive: true });

    marqueeWrapper.addEventListener('touchend', resumeAuto, { passive: true });

    marqueeWrapper.addEventListener('touchmove', (e) => {
        const x = e.touches[0].pageX - marqueeWrapper.offsetLeft;
        const walk = (x - startX) * 2;
        marqueeWrapper.scrollLeft = scrollLeft - walk;
    }, { passive: true });
}






// Animations for new sections
const fadables = document.querySelectorAll('.timeline-item, .project-row, .case-study-grid, .diff-card, .reveal-card, .service-item');

fadables.forEach(el => {
    gsap.from(el, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: el,
            start: "top 80%"
        }
    });
});

// Animate Skill Bars
gsap.utils.toArray('.skill-bar-container').forEach(bar => {
    const fill = bar.querySelector('.progress-fill');
    const width = fill.style.width; // Get target width

    gsap.fromTo(fill,
        { width: 0 },
        {
            width: width,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: bar,
                start: "top 85%"
            }
        }
    );
});



// --- Advanced Hero Effects ---

// 1. Noise/Starfield Canvas Effect
const canvas = document.getElementById('hero-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');

    function setCanvasSize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.scale(dpr, dpr);
    }

    setCanvasSize();

    let particles = [];
    const particleCount = 100; // Adjust for density

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;
            this.alpha = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Mouse interaction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
                this.x -= dx * 0.01;
                this.y -= dy * 0.01;
            }
        }
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Init Particles
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function animateCanvas() {
        // Trail effect
        ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animateCanvas);
    }
    animateCanvas();

    window.addEventListener('resize', () => {
        setCanvasSize();
        // Reset particles on resize to avoid positioning bugs
        particles = [];
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    });
}

// 2. 3D Tilt Effect for Hero Text
const heroSection = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content-3d');

if (heroSection && heroContent) {
    heroSection.addEventListener('mousemove', (e) => {
        // Disable on mobile/tablet for performance and UX
        if (window.innerWidth <= 768) return;

        const xPos = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
        const yPos = (e.clientY / window.innerHeight - 0.5) * 2;

        gsap.to(heroContent, {
            rotationY: xPos * 20, // Rotate Y based on X mouse
            rotationX: -yPos * 20, // Rotate X based on Y mouse (inverted)
            ease: 'power2.out',
            duration: 1
        });
    });
}

// 3. Glitch / Scramble Text Effect
const glitchTexts = document.querySelectorAll('.hero-title span');
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

glitchTexts.forEach(target => {
    target.onmouseover = event => {
        let iteration = 0;
        let originalText = event.target.dataset.value;

        clearInterval(event.target.interval);

        event.target.interval = setInterval(() => {
            event.target.innerText = originalText
                .split("")
                .map((letter, index) => {
                    if (index < iteration) {
                        return originalText[index];
                    }
                    return letters[Math.floor(Math.random() * 26)]
                })
                .join("");

            if (iteration >= originalText.length) {
                clearInterval(event.target.interval);
            }

            iteration += 1 / 3;
        }, 30);
    }
});

// Full Screen Menu Logic
document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById('menu-toggle');
    const fsMenu = document.querySelector('.fs-menu');
    const menuItems = document.querySelectorAll('.menu-item');

    if (menuBtn && fsMenu) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            fsMenu.classList.toggle('active');
        });

        // Navigate and Close
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.dataset.target;

                // Close Menu
                menuBtn.classList.remove('active');
                fsMenu.classList.remove('active');

                // Lenis Smooth Scroll to Target
                if (typeof lenis !== 'undefined') {
                    lenis.scrollTo(target, { duration: 2 });
                } else {
                    document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // Contact Form Submission (AJAX)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('.magnetic-btn');
            const btnText = btn.querySelector('.btn-text');
            const originalText = btnText.innerText;

            // Loading State
            btnText.innerText = 'SENDING...';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success State
                    btnText.innerText = 'SENT!';
                    btn.style.borderColor = 'var(--accent-color)';
                    contactForm.reset();
                    setTimeout(() => {
                        btnText.innerText = originalText;
                        btn.style.borderColor = 'rgba(255,255,255,0.2)';
                    }, 3000);
                } else {
                    throw new Error("Form submission failed");
                }
            } catch (error) {
                btnText.innerText = 'ERROR';
                setTimeout(() => {
                    btnText.innerText = originalText;
                }, 3000);
            }
        });
    }
});

