window.onload = () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Lock scrolling while preloader runs
    document.body.classList.add('preloading');

    // Jump straight to Hero Animations now that Preloader is removed
    initHeroAnimations();

    // 3. Custom Fluid Cursor
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let posX = mouseX, posY = mouseY;

    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0 });
    });

    gsap.ticker.add(() => {
        posX += (mouseX - posX) * 0.15;
        posY += (mouseY - posY) * 0.15;
        gsap.set(follower, { x: posX, y: posY });
    });

    const interactiveElements = document.querySelectorAll('a, button, .hover-trigger, .social-btn, .email-button, .exp-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // 4. Hover Media (Cursor Attached)
    const hoverMedia = document.querySelector('.hover-media');
    const hoverTriggers = document.querySelectorAll('.hover-trigger');
    const hoverImg = hoverMedia.querySelector('img');

    hoverTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', (e) => {
            hoverMedia.classList.add('show');
        });
        trigger.addEventListener('mousemove', (e) => {
            gsap.to(hoverMedia, { x: e.clientX, y: e.clientY, duration: 0.5, ease: "power3.out" });
        });
        trigger.addEventListener('mouseleave', () => {
            hoverMedia.classList.remove('show');
        });
    });

    // 5. Interactive WebGL/Canvas Particles
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Mouse interaction
                let dx = mouseX - this.x;
                let dy = mouseY - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 120) {
                    this.x -= dx / 25;
                    this.y -= dy / 25;
                }

                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            }
            draw() {
                ctx.fillStyle = 'rgba(255, 94, 0, 0.4)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < 70; i++) particles.push(new Particle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Connect nodes
                for (let j = i; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 94, 0, ${0.15 - distance / 800})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateParticles);
        }
        initParticles();
        animateParticles();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        });
    }

    // Setup SplitText for decode paragraphs FIRST before layout happens
    const decodeTexts = document.querySelectorAll('.decode-text');
    decodeTexts.forEach(text => {
        // We use split-type
        const split = new SplitType(text, { types: 'chars, words' });
        text.dataset.chars = Array.from(text.querySelectorAll('.char'));
    });

    function initHeroAnimations() {
        const bgTextElem = document.querySelector('.ref-bg-text');

        // Simple fade up for the whole text, preserving CSS Glitch!
        if (bgTextElem) {
            gsap.from(bgTextElem, {
                y: window.innerHeight / 2,
                opacity: 0,
                duration: 1.5,
                ease: "back.out(1.2)"
            });
        }

        gsap.from(".ref-image-wrapper", {
            opacity: 0,
            y: 100,
            duration: 1.5,
            ease: "power3.out",
            delay: 0.5
        });

        // Tilt Init globally
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
        }
    }

    // 7. Dynamic Scroll Animations for Hero
    const refImageWrapper = document.querySelector('.ref-image-wrapper');
    const refBgText = document.querySelector('.ref-bg-text');

    // Wait slightly to let the initial load animations finish before registering the scroll triggers.
    // This prevents the scroll scrub from snapping to the `opacity: 0` start state of the load animation when scrolling back up.
    setTimeout(() => {
        // Hero Image Scroll Animation: scales down, blurs, and fades slightly, while moving down to prevent the bottom edge from lifting
        gsap.to(refImageWrapper, {
            y: () => window.innerHeight * 0.3,
            scale: 0.85,
            opacity: 0.5,
            filter: "blur(10px)",
            ease: "none",
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: 1, // smooth scrubbing
                invalidateOnRefresh: true
            }
        });

        // Hero Text Scroll Animation: moves opposite direction and fades out
        // Note: Removed scale animation so it doesn't overwrite the CSS scale(1, 2.7) vertical stretch!
        gsap.to(refBgText, {
            y: () => window.innerHeight * 0.4,
            opacity: 0,
            filter: "blur(15px)",
            ease: "none",
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: 1, // smooth scrubbing
                invalidateOnRefresh: false // Prevent harsh jumping recalculations on simple resize
            }
        });
    }, 1500);

    // Navbar Scroll Blur
    ScrollTrigger.create({
        start: "top -50",
        onUpdate: (self) => {
            const nav = document.querySelector('.global-nav');
            if (nav) {
                if (self.direction === 1) nav.classList.add('scrolled'); // down
                else if (window.scrollY <= 50) nav.classList.remove('scrolled');
            }
        }
    });

    // 8. Horizontal Scroll Section - Remnant Cleanup
    const horizontalContainer = document.querySelector('.horizontal-scroll-container');
    const horizontalWrapper = document.querySelector('.horizontal-scroll-wrapper');
    // Using native CSS snap scrolling now so no GSAP pinning is needed here!

    // 9. Scroll-Linked Background Color Shift
    const auroraBg = document.querySelector('.aurora-bg');
    if (auroraBg) {
        gsap.to(auroraBg, {
            background: "radial-gradient(circle at 10% 20%, rgba(138, 43, 226, 0.5), transparent 40%), radial-gradient(circle at 90% 80%, rgba(75, 0, 130, 0.4), transparent 40%), radial-gradient(circle at 50% 50%, rgba(148, 0, 211, 0.1), transparent 60%)",
            ease: "none",
            scrollTrigger: {
                trigger: "#about",
                start: "top center",
                end: "bottom center",
                scrub: true
            }
        });

        gsap.to(auroraBg, {
            background: "radial-gradient(circle at 10% 20%, rgba(0, 191, 255, 0.4), transparent 40%), radial-gradient(circle at 90% 80%, rgba(30, 144, 255, 0.3), transparent 40%), radial-gradient(circle at 50% 50%, rgba(0, 0, 139, 0.1), transparent 60%)",
            ease: "none",
            scrollTrigger: {
                trigger: "#skills",
                start: "top center",
                end: "bottom center",
                scrub: true
            }
        });
    }

    // 10. Smooth Text Word Reveal & 11. Staggered Highlight Drawing
    decodeTexts.forEach(text => {
        const words = text.querySelectorAll('.word');

        ScrollTrigger.create({
            trigger: text,
            start: "top 85%",
            onEnter: () => {
                gsap.fromTo(words,
                    { opacity: 0, y: 15 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.02,
                        ease: "power2.out"
                    }
                );

                // Trigger highlights in this paragraph
                text.classList.add('section-visible');
            },
            once: true
        });
    });

    // Standard Reveals (Enhanced)
    gsap.utils.toArray('.reveal:not(.decode-text):not(.exp-card):not(.ref-bg-text)').forEach(reveal => {
        gsap.fromTo(reveal,
            { y: 50, opacity: 0, scale: 0.95 },
            {
                y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power4.out",
                scrollTrigger: {
                    trigger: reveal,
                    start: "top 85%",
                    toggleActions: "play reverse play reverse" // Makes it dynamic on up/down scroll
                }
            }
        );
    });

    // Removed the opacity:0 scroll trigger on .exp-card because native CSS horizontal scroll 
    // means they enter from the right, not the bottom, making vertical scroll triggers unreliable.

    // Spotlight Hover
    document.querySelectorAll('.spotlight').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 12. Magnetic Generic Effect & Nav Buttons
    const magBtns = document.querySelectorAll('.magnetic-btn, .email-button');
    magBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            let strength = btn.dataset.strength ? parseFloat(btn.dataset.strength) : 40;
            gsap.to(btn, {
                x: (x / rect.width) * strength,
                y: (y / rect.height) * strength,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
        });
    });

    window.scrollToSection = function (id) {
        gsap.to(window, { duration: 1, scrollTo: { y: id, offsetY: 80 }, ease: "power3.inOut" });
    }
};
