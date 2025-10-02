/**
 * Electro Power - Main JavaScript File
 * Modern interactive functionality for electric transport website
 */

'use strict';

// ===================================
// Utility Functions
// ===================================

const utils = {
    /**
     * Debounce function to limit function calls
     */
    debounce: function(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    /**
     * Throttle function for performance optimization
     */
    throttle: function(func, limit) {
        let lastFunc;
        let lastRan;
        return function(...args) {
            if (!lastRan) {
                func(...args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func(...args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    },

    /**
     * Check if element is in viewport
     */
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Smooth scroll to element
     */
    smoothScrollTo: function(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },

    /**
     * Get scroll percentage
     */
    getScrollPercent: function() {
        const h = document.documentElement;
        const b = document.body;
        const st = 'scrollTop';
        const sh = 'scrollHeight';
        return (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100;
    }
};

// ===================================
// Auto Scroll Component
// ===================================

class AutoScroll {
    constructor() {
        this.init();
    }

    init() {
        this.createScrollIndicator();
        this.createBackToTopButton();
        this.bindEvents();
        this.handlePageChange();
    }

    /**
     * Create scroll progress indicator
     */
    createScrollIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.id = 'scrollIndicator';
        document.body.appendChild(indicator);
        this.scrollIndicator = indicator;
    }

    /**
     * Create back to top button functionality
     */
    createBackToTopButton() {
        this.backToTopBtn = document.getElementById('backToTop');
        if (this.backToTopBtn) {
            this.backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollPercent = utils.getScrollPercent();
        
        // Update scroll indicator
        if (this.scrollIndicator) {
            this.scrollIndicator.style.width = scrollPercent + '%';
        }

        // Show/hide back to top button
        if (this.backToTopBtn) {
            if (window.pageYOffset > 300) {
                this.backToTopBtn.classList.add('show');
            } else {
                this.backToTopBtn.classList.remove('show');
            }
        }

        // Animate elements on scroll
        this.animateOnScroll();
    }

    /**
     * Animate elements when they come into view
     */
    animateOnScroll() {
        const elements = document.querySelectorAll('.section-title, .category-card, .payment-card, .team-member, .delivery-item');
        
        elements.forEach(element => {
            if (utils.isInViewport(element) && !element.classList.contains('animated')) {
                element.classList.add('fade-in-up', 'animated');
            }
        });
    }

    /**
     * Handle page changes (for SPA-like behavior)
     */
    handlePageChange() {
        // Auto scroll to top when navigating to different sections
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Only handle anchor links
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(href);
                    
                    if (targetElement) {
                        utils.smoothScrollTo(targetElement, 80); // 80px offset for header
                    }
                    
                    // Update active nav link
                    navLinks.forEach(nl => nl.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });
    }

    /**
     * Bind all scroll-related events
     */
    bindEvents() {
        const throttledScroll = utils.throttle(() => this.handleScroll(), 16);
        window.addEventListener('scroll', throttledScroll, { passive: true });
        
        // Handle window resize
        const throttledResize = utils.throttle(() => this.handleResize(), 250);
        window.addEventListener('resize', throttledResize, { passive: true });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.animateOnScroll();
    }
}

// ===================================
// Mobile Navigation
// ===================================

class MobileNav {
    constructor() {
        this.init();
    }

    init() {
        this.menuToggle = document.querySelector('.mobile-menu-toggle');
        this.navList = document.querySelector('.nav-list');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.bindEvents();
    }

    bindEvents() {
        if (this.menuToggle && this.navList) {
            this.menuToggle.addEventListener('click', () => this.toggleMenu());
            
            // Close menu when clicking on nav links
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-toggle')) {
                    this.closeMenu();
                }
            });
        }
    }

    toggleMenu() {
        this.navList.classList.toggle('active');
        this.menuToggle.classList.toggle('active');
        
        // Animate hamburger menu
        this.animateHamburger();
    }

    closeMenu() {
        this.navList.classList.remove('active');
        this.menuToggle.classList.remove('active');
        this.animateHamburger();
    }

    animateHamburger() {
        const spans = this.menuToggle.querySelectorAll('span');
        if (this.menuToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'rotate(0deg) translate(0px, 0px)';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'rotate(0deg) translate(0px, 0px)';
        }
    }
}

// ===================================
// Product Tabs
// ===================================

class ProductTabs {
    constructor() {
        this.init();
    }

    init() {
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.bindEvents();
        this.loadDefaultTab();
    }

    bindEvents() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button));
        });
    }

    switchTab(activeButton) {
        const targetTab = activeButton.getAttribute('data-tab');
        
        // Remove active class from all buttons
        this.tabButtons.forEach(button => button.classList.remove('active'));
        
        // Add active class to clicked button
        activeButton.classList.add('active');
        
        // Load content for the selected tab
        this.loadTabContent(targetTab);
    }

    loadTabContent(tabType) {
        const modelsGrid = document.querySelector('.models-grid');
        if (!modelsGrid) return;

        // Sample product data (in real application, this would come from API)
        const products = this.getProductData(tabType);
        
        modelsGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = this.createProductCard(product);
            modelsGrid.appendChild(productCard);
        });
    }

    getProductData(type) {
        const productData = {
            scooters: [
                { name: 'Kugoo C1', price: '450 BYN', image: '../assets/images/products/kugoo-c1.jpg', features: ['25 км/ч', '25 км запас хода', '7.5 Ач батарея'] },
                { name: 'Kugoo M2', price: '650 BYN', image: '../assets/images/products/kugoo-m2.jpg', features: ['35 км/ч', '35 км запас хода', '10.4 Ач батарея'] },
                { name: 'Kugoo M4 Pro', price: '850 BYN', image: '../assets/images/products/kugoo-m4-pro.jpg', features: ['45 км/ч', '50 км запас хода', '18 Ач батарея'] }
            ],
            bikes: [
                { name: 'GT V6', price: '1200 BYN', image: '../assets/images/products/gt-v6.jpg', features: ['25 км/ч', '60 км запас хода', '13 Ач батарея'] },
                { name: 'CAMRY 3.5', price: '1500 BYN', image: '../assets/images/products/camry-35.jpg', features: ['25 км/ч', '70 км запас хода', '16 Ач батарея'] },
                { name: 'Kugoo Kirin C2', price: '1800 BYN', image: '../assets/images/products/kugoo-kirin-c2.jpg', features: ['25 км/ч', '80 км запас хода', '20 Ач батарея'] }
            ],
            mopeds: [
                { name: 'CityCoco GT X-11', price: '2500 BYN', image: '../assets/images/products/citycoco-gt-x11.jpg', features: ['45 км/ч', '60 км запас хода', '20 Ач батарея'] },
                { name: 'GT EV3', price: '3200 BYN', image: '../assets/images/products/gt-ev3.jpg', features: ['60 км/ч', '80 км запас хода', '32 Ач батарея'] },
                { name: 'IKINGI X7 PRO', price: '4500 BYN', image: '../assets/images/products/ikingi-x7-pro.jpg', features: ['80 км/ч', '120 км запас хода', '60 Ач батарея'] }
            ]
        };

        return productData[type] || productData.scooters;
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-badge">Хит продаж</div>
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-features">
                    ${product.features.map(feature => `<span class="feature">${feature}</span>`).join('')}
                </div>
                <div class="product-price">${product.price}</div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-small">Купить</button>
                    <button class="btn btn-outline btn-small">Подробнее</button>
                </div>
            </div>
        `;
        
        return card;
    }

    loadDefaultTab() {
        const defaultButton = document.querySelector('.tab-button.active');
        if (defaultButton) {
            this.loadTabContent(defaultButton.getAttribute('data-tab'));
        }
    }
}

// ===================================
// Form Handler
// ===================================

class FormHandler {
    constructor() {
        this.init();
    }

    init() {
        this.consultationForm = document.querySelector('.consultation-form');
        this.bindEvents();
    }

    bindEvents() {
        if (this.consultationForm) {
            this.consultationForm.addEventListener('submit', (e) => this.handleConsultationSubmit(e));
        }

        // Consultation buttons
        const consultationBtns = document.querySelectorAll('.consultation-btn, .quiz-btn');
        consultationBtns.forEach(btn => {
            btn.addEventListener('click', () => this.openConsultationModal());
        });
    }

    handleConsultationSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.consultationForm);
        const name = formData.get('name') || this.consultationForm.querySelector('input[type="text"]').value;
        const phone = formData.get('phone') || this.consultationForm.querySelector('input[type="tel"]').value;

        // Basic validation
        if (!name || !phone) {
            this.showNotification('Пожалуйста, заполните все поля', 'error');
            return;
        }

        // Simulate form submission
        this.submitConsultationRequest({ name, phone });
    }

    async submitConsultationRequest(data) {
        try {
            // Show loading state
            const submitBtn = this.consultationForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправляем...';
            submitBtn.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Success
            this.showNotification('Заявка отправлена! Мы свяжемся с вами в течение 10 минут.', 'success');
            this.consultationForm.reset();

            // Restore button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

        } catch (error) {
            this.showNotification('Произошла ошибка. Попробуйте еще раз.', 'error');
        }
    }

    openConsultationModal() {
        // Scroll to consultation form
        const consultationSection = document.querySelector('.consultation-section');
        if (consultationSection) {
            utils.smoothScrollTo(consultationSection, 80);
            
            // Focus on first input after scroll
            setTimeout(() => {
                const firstInput = consultationSection.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 500);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            color: white;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);

        // Close button handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.removeNotification(notification));
    }

    removeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// ===================================
// Performance Optimization
// ===================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.preloadCriticalResources();
    }

    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            lazyImages.forEach(img => {
                img.classList.add('lazy');
                imageObserver.observe(img);
            });
        }
    }

    preloadCriticalResources() {
        // Preload hero image
        const heroImg = document.querySelector('.hero-image img');
        if (heroImg) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = heroImg.src;
            document.head.appendChild(link);
        }
    }
}

// ===================================
// Analytics & Tracking
// ===================================

class Analytics {
    constructor() {
        this.init();
    }

    init() {
        this.trackPageView();
        this.trackUserInteractions();
    }

    trackPageView() {
        // Track page view (integrate with Google Analytics, Yandex.Metrica, etc.)
        console.log('Page view tracked:', window.location.pathname);
    }

    trackUserInteractions() {
        // Track button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn, .nav-link, .social-link')) {
                const elementText = e.target.textContent.trim();
                const elementClass = e.target.className;
                console.log('User interaction:', { elementText, elementClass });
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const formClass = e.target.className;
            console.log('Form submission:', { formClass });
        });
    }
}

// ===================================
// Main App Initialization
// ===================================

class ElectroPowerApp {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize all components
            this.components.autoScroll = new AutoScroll();
            this.components.mobileNav = new MobileNav();
            this.components.productTabs = new ProductTabs();
            this.components.formHandler = new FormHandler();
            this.components.performanceOptimizer = new PerformanceOptimizer();
            this.components.analytics = new Analytics();

            console.log('✅ Electro Power App initialized successfully');
            
            // Add loaded class to body for CSS transitions
            document.body.classList.add('loaded');

        } catch (error) {
            console.error('❌ Error initializing Electro Power App:', error);
        }
    }

    // Public API methods
    scrollToTop() {
        return this.components.autoScroll?.backToTopBtn?.click();
    }

    openMobileMenu() {
        return this.components.mobileNav?.toggleMenu();
    }

    switchTab(tabName) {
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabButton) {
            return this.components.productTabs?.switchTab(tabButton);
        }
    }
}

// ===================================
// CSS for JavaScript-created elements
// ===================================

// Add dynamic styles for JavaScript components
const dynamicStyles = `
    <style>
    .product-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        transition: all 0.3s ease;
        position: relative;
    }

    .product-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
    }

    .product-image {
        position: relative;
        height: 250px;
        overflow: hidden;
    }

    .product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .product-card:hover .product-image img {
        transform: scale(1.05);
    }

    .product-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        background: linear-gradient(135deg, #ff6600, #ff0066);
        color: white;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }

    .product-content {
        padding: 20px;
    }

    .product-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #212529;
        margin-bottom: 12px;
    }

    .product-features {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 15px;
    }

    .feature {
        background: #f8f9fa;
        color: #6c757d;
        padding: 4px 10px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: 500;
    }

    .product-price {
        font-size: 1.5rem;
        font-weight: 700;
        color: #0066ff;
        margin-bottom: 15px;
    }

    .product-actions {
        display: flex;
        gap: 10px;
    }

    .btn-small {
        padding: 8px 16px;
        font-size: 14px;
        flex: 1;
    }

    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }

    .lazy.loaded {
        opacity: 1;
    }

    .loaded .fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
    }

    @media (max-width: 768px) {
        .product-actions {
            flex-direction: column;
        }
        
        .btn-small {
            flex: none;
        }
    }
    </style>
`;

// Inject dynamic styles
document.head.insertAdjacentHTML('beforeend', dynamicStyles);

// Initialize the app
const electroPowerApp = new ElectroPowerApp();

// Expose app to global scope for debugging
window.ElectroPowerApp = electroPowerApp;