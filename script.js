// Page transition handling for smoother navigation
// Uses View Transitions API when available, falls back to opacity fade
(function() {
    // Check if View Transitions API is supported
    const supportsViewTransitions = 'startViewTransition' in document;
    
    if (!supportsViewTransitions) {
        // Fallback: Add smooth fade transition for page navigations
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            // Only handle internal navigation links (not external, hash, or javascript links)
            if (href && 
                !href.startsWith('#') && 
                !href.startsWith('http') && 
                !href.startsWith('mailto:') &&
                !href.startsWith('javascript:') &&
                !link.hasAttribute('target')) {
                
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    document.body.classList.add('page-transitioning');
                    
                    setTimeout(() => {
                        window.location.href = href;
                    }, 300);
                });
            }
        });
    }
})();

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add active state to navigation based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

// Add subtle parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        hero.style.opacity = Math.max(0.3, 1 - (scrolled * 0.002));
    }
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
        window.scrollBy({ top: 100, behavior: 'smooth' });
    } else if (e.key === 'ArrowUp') {
        window.scrollBy({ top: -100, behavior: 'smooth' });
    }
});

// Add loading state
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});


