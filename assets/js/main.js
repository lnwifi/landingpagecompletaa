/**
 * PETOCLUB - Landing Page JavaScript
 * Funcionalidades interactivas
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {

    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ============================================
    // MOBILE MENU TOGGLE (con accesibilidad ARIA)
    // ============================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', function() {
        const isExpanded = hamburger.classList.contains('active');
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');

        // Actualizar atributos ARIA
        hamburger.setAttribute('aria-expanded', !isExpanded);
        hamburger.setAttribute('aria-label', isExpanded ? 'Abrir menú' : 'Cerrar menú');

        // Bloquear scroll del body
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';

        // Enfocar el primer enlace del menú
        if (!isExpanded) {
            setTimeout(() => {
                navLinks[0]?.focus();
            }, 100);
        }
    });

    // Cerrar menú al hacer click en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            // Restaurar atributos ARIA
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Abrir menú');
        });
    });

    // Cerrar menú al hacer click fuera (con ARIA)
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            if (navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                // Restaurar atributos ARIA
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.setAttribute('aria-label', 'Abrir menú');
            }
        }
    });

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            // Restaurar atributos ARIA
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Abrir menú');
            // Devolver focus al botón hamburguesa
            hamburger.focus();
        }
    });

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ============================================
    // STATS COUNTER ANIMATION
    // ============================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateStats() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    stat.textContent = formatNumber(Math.floor(current));
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = formatNumber(target);
                }
            };

            updateCounter();
        });
    }

    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K+';
        }
        return num + '+';
    }

    // Observar cuando las estadísticas son visibles
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                animateStats();
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }

    // ============================================
    // SCROLL REVEAL ANIMATIONS (AOS)
    // ============================================
    const animatedElements = document.querySelectorAll('[data-aos]');

    const aosObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => aosObserver.observe(el));

    // ============================================
    // FEATURE CARDS HOVER EFFECT
    // ============================================
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Efecto adicional al hacer hover
            this.style.transform = 'translateY(-12px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // ============================================
    // PARALLAX EFFECT ON HERO
    // ============================================
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero-bg');

    window.addEventListener('scroll', function() {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
            const parallaxValue = scrolled * 0.5;
            heroBg.style.transform = `translateY(${parallaxValue}px)`;
        }
    });

    // ============================================
    // TESTIMONIAL CARDS AUTO ROTATE (opcional)
    // ============================================
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    let currentTestimonial = 0;

    function highlightTestimonial(index) {
        testimonialCards.forEach((card, i) => {
            if (i === index) {
                card.style.transform = 'scale(1.05)';
                card.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
            } else {
                card.style.transform = '';
                card.style.boxShadow = '';
            }
        });
    }

    // Auto resaltar cada 5 segundos (opcional, descomentar para activar)
    /*
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
        highlightTestimonial(currentTestimonial);
    }, 5000);
    */

    // ============================================
    // DOWNLOAD BUTTONS TRACKING
    // ============================================
    const downloadBtns = document.querySelectorAll('.download-btn, .btn');

    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const platform = this.classList.contains('apple') ? 'iOS' : 'Android';
            console.log(`Click en botón de descarga: ${platform}`);
            // Aquí puedes agregar analytics tracking
        });
    });

    // ============================================
    // LAZY LOADING FOR IMAGES (si se agregan imágenes reales)
    // ============================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ============================================
    // DYNAMIC YEAR IN FOOTER
    // ============================================
    const yearElements = document.querySelectorAll('.current-year');
    yearElements.forEach(el => {
        el.textContent = new Date().getFullYear();
    });

    // ============================================
    // PERFORMANCE: Debounce resize events
    // ============================================
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Recalcular animaciones o layouts si es necesario
            console.log('Resize completado');
        }, 250);
    });

    // ============================================
    // CONSOLE WELCOME MESSAGE
    // ============================================
    console.log('%c🐾 PetoClub', 'font-size: 24px; font-weight: bold; color: #FF6B35;');
    console.log('%c¡Bienvenido a la landing page de PetoClub!', 'font-size: 14px; color: #666;');
    console.log('%c¿Interesado en el código? Contáctanos 🚀', 'font-size: 12px; color: #999;');
});

// ============================================
// PAGE LOADER (opcional)
// ============================================
window.addEventListener('load', function() {
    document.body.classList.add('loaded');

    // Animación de entrada suave
    setTimeout(() => {
        document.querySelector('.hero').style.opacity = '1';
        document.querySelector('.hero').style.transform = 'translateY(0)';
    }, 100);
});

// Agregar estilos iniciales para animación de carga
const style = document.createElement('style');
style.textContent = `
    body {
        opacity: 1;
        transition: opacity 0.3s ease;
    }
    .hero {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    body.loaded .hero {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);
