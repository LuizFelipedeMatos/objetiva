// Objetiva Labs - Main JavaScript File
// Author: Objetiva Labs Development Team
// Version: 1.0.0

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initMobileNavigation();
    initSmoothScrolling();
    initContactForm();
    initFAQ();
    initScrollAnimations();
    initServiceNavigation();
    initLazyLoading();
    initAnalytics();
    initBackToTop();
});

// Mobile Navigation
function initMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });

        // Close menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('nav-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
        });
    }
}

// Smooth Scrolling
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Contact Form
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (validateContactForm(data)) {
                // Show loading state
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
                submitBtn.disabled = true;
                
                // Simulate form submission (replace with actual API call)
                setTimeout(() => {
                    // Hide form and show success message
                    contactForm.style.display = 'none';
                    if (formSuccess) {
                        formSuccess.style.display = 'block';
                    }
                    
                    // Track form submission
                    trackEvent('form_submit', 'contact', 'success');
                    
                    // Send to analytics
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_submit', {
                            event_category: 'contact',
                            event_label: data.servico || 'general'
                        });
                    }
                    
                    // Facebook Pixel
                    if (typeof fbq !== 'undefined') {
                        fbq('track', 'Lead', {
                            content_name: 'Contact Form',
                            content_category: data.servico || 'general'
                        });
                    }
                    
                }, 2000);
            }
        });
    }
}

// Form Validation
function validateContactForm(data) {
    const errors = [];
    
    // Required fields
    if (!data.nome || data.nome.trim().length < 2) {
        errors.push('Nome é obrigatório e deve ter pelo menos 2 caracteres.');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('E-mail válido é obrigatório.');
    }
    
    if (!data.telefone || data.telefone.trim().length < 10) {
        errors.push('Telefone é obrigatório e deve ter pelo menos 10 dígitos.');
    }
    
    if (!data.mensagem || data.mensagem.trim().length < 10) {
        errors.push('Mensagem é obrigatória e deve ter pelo menos 10 caracteres.');
    }
    
  
    
    // Show errors
    if (errors.length > 0) {
        showFormErrors(errors);
        return false;
    }
    
    return true;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show form errors
function showFormErrors(errors) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.form-error');
    existingErrors.forEach(error => error.remove());
    
    // Create error container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'form-error';
    errorContainer.style.cssText = `
        background-color: #fee2e2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
    `;
    
    const errorList = document.createElement('ul');
    errorList.style.cssText = 'margin: 0; padding-left: 1.5rem;';
    
    errors.forEach(error => {
        const errorItem = document.createElement('li');
        errorItem.textContent = error;
        errorItem.style.marginBottom = '0.5rem';
        errorList.appendChild(errorItem);
    });
    
    errorContainer.appendChild(errorList);
    
    // Insert error container at the top of the form
    const contactForm = document.getElementById('contactForm');
    contactForm.insertBefore(errorContainer, contactForm.firstChild);
    
    // Scroll to error
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// FAQ Functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active', !isActive);
                
                // Track FAQ interaction
                if (!isActive) {
                    const questionText = question.querySelector('h3').textContent;
                    trackEvent('faq_open', 'engagement', questionText);
                }
            });
        }
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Animate numbers
                if (entry.target.classList.contains('number')) {
                    animateNumber(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(`
        .service-card,
        .testimonial-card,
        .feature-card,
        .mvv-card,
        .team-card,
        .process-step,
        .number-card,
        .contact-item
    `);
    
    animateElements.forEach(element => {
        observer.observe(element);
    });
    
    // Add CSS for animations
    if (!document.querySelector('#scroll-animations')) {
        const style = document.createElement('style');
        style.id = 'scroll-animations';
        style.textContent = `
            .service-card,
            .testimonial-card,
            .feature-card,
            .mvv-card,
            .team-card,
            .process-step,
            .number-card,
            .contact-item {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease;
            }
            
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Animate Numbers
function animateNumber(element) {
    const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        const suffix = element.textContent.includes('+') ? '+' : 
                      element.textContent.includes('%') ? '%' : '';
        element.textContent = Math.floor(current) + suffix;
    }, 16);
}

// Service Navigation
function initServiceNavigation() {
    const serviceNavLinks = document.querySelectorAll('.service-nav-link');
    
    serviceNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            serviceNavLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Smooth scroll to target section
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Lazy Loading for Images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Analytics and Tracking
function initAnalytics() {
    // Track page view
    trackPageView();
    
    // Track scroll depth
    trackScrollDepth();
    
    // Track button clicks
    trackButtonClicks();
    
    // Track external links
    trackExternalLinks();
}

// Track page view
function trackPageView() {
    const page = window.location.pathname;
    const title = document.title;
    
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_title: title,
            page_location: window.location.href
        });
    }
    
    trackEvent('page_view', 'navigation', page);
}

// Track scroll depth
function trackScrollDepth() {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 100];
    const tracked = [];
    
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            milestones.forEach(milestone => {
                if (scrollPercent >= milestone && !tracked.includes(milestone)) {
                    tracked.push(milestone);
                    trackEvent('scroll_depth', 'engagement', milestone + '%');
                }
            });
        }
    });
}

// Track button clicks
function trackButtonClicks() {
    const buttons = document.querySelectorAll('.btn, button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const buttonClass = this.className;
            
            trackEvent('button_click', 'engagement', buttonText);
            
            // Track CTA buttons specifically
            if (buttonClass.includes('btn-primary') || buttonClass.includes('btn-whatsapp')) {
                trackEvent('cta_click', 'conversion', buttonText);
            }
        });
    });
}

// Track external links
function trackExternalLinks() {
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
    
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            const url = this.href;
            trackEvent('external_link', 'engagement', url);
        });
    });
}

// Generic event tracking function
function trackEvent(action, category, label) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('trackCustom', action, {
            category: category,
            label: label
        });
    }
    
    // Console log for debugging
    console.log('Event tracked:', { action, category, label });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Phone number formatting
function formatPhoneNumber(input) {
    const phoneInput = input.target;
    let value = phoneInput.value.replace(/\D/g, '');
    
    if (value.length >= 11) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 7) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    
    phoneInput.value = value;
}

// Add phone formatting to phone inputs
document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', formatPhoneNumber);
    });
});

// Header scroll effect
window.addEventListener('scroll', throttle(function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}, 100));

// Add scrolled header styles
if (!document.querySelector('#header-scroll-styles')) {
    const style = document.createElement('style');
    style.id = 'header-scroll-styles';
    style.textContent = `
        .header.scrolled {
            background-color: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Service worker registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    
    // Track errors
    trackEvent('javascript_error', 'error', e.error.message);
});

// Performance monitoring
window.addEventListener('load', function() {
    setTimeout(function() {
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        
        if (loadTime > 0) {
            trackEvent('page_load_time', 'performance', Math.round(loadTime));
        }
    }, 0);
});

// Accessibility improvements
document.addEventListener('keydown', function(e) {
    // Skip to main content with Tab key
    if (e.key === 'Tab' && !e.shiftKey) {
        const focusableElements = document.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        
        // Add focus indicators
        focusableElements.forEach(element => {
            element.addEventListener('focus', function() {
                this.style.outline = '2px solid #2563eb';
                this.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', function() {
                this.style.outline = '';
                this.style.outlineOffset = '';
            });
        });
    }
});

// Print functionality
function printPage() {
    window.print();
    trackEvent('print_page', 'utility', window.location.pathname);
}

// Share functionality
function shareContent(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        }).then(() => {
            trackEvent('native_share', 'social', title);
        });
    } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copiado para a área de transferência!');
            trackEvent('copy_link', 'social', title);
        });
    }
}

// Cookie consent (basic implementation)
function initCookieConsent() {
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (!cookieConsent) {
        const banner = document.createElement('div');
        banner.innerHTML = `
            <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #1e293b; color: white; padding: 1rem; z-index: 10000; text-align: center;">
                <p style="margin: 0 0 1rem 0;">Este site usa cookies para melhorar sua experiência. 
                <a href="#" style="color: #60a5fa;">Política de Privacidade</a></p>
                <button onclick="acceptCookies()" style="background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; margin-right: 0.5rem;">Aceitar</button>
                <button onclick="declineCookies()" style="background: transparent; color: white; border: 1px solid white; padding: 0.5rem 1rem; border-radius: 4px;">Recusar</button>
            </div>
        `;
        document.body.appendChild(banner);
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.querySelector('[style*="position: fixed; bottom: 0"]').remove();
    trackEvent('cookie_consent', 'privacy', 'accepted');
}

function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    document.querySelector('[style*="position: fixed; bottom: 0"]').remove();
    trackEvent('cookie_consent', 'privacy', 'declined');
}

// Initialize cookie consent
setTimeout(initCookieConsent, 2000);

// Back to Top Button
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        // Smooth scroll to top when clicked
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            trackEvent('back_to_top', 'navigation', 'clicked');
        });
    }
}

// Export functions for global use
window.ObjetivaLabs = {
    trackEvent,
    shareContent,
    printPage,
    formatPhoneNumber
};

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('a[href="blog.html"]').forEach(link => {
        const item = link.closest("li") || link;
        item.style.display = "none";
    });
});