// Wrap everything in an IIFE to avoid global scope pollution
(() => {
    'use strict';

    // DOM Elements Cache
    const DOM = {
        header: document.querySelector('.site-header'),
        navToggle: document.querySelector('.nav-toggle'),
        mainNav: document.querySelector('.main-nav'),
        themeToggle: document.querySelector('.theme-toggle'),
        backToTop: document.querySelector('.back-to-top'),
        flipCards: document.querySelectorAll('.flip-card'),
        checklistItems: document.querySelectorAll('.checklist-item input'),
        progressBar: document.querySelector('.progress-fill'),
        progressText: document.querySelector('.progress-text'),
        resetButton: document.querySelector('#resetChecklist'),
        modal: document.querySelector('.modal'),
        quizForm: document.querySelector('#quizForm'),
        sections: document.querySelectorAll('.section')
    };

    // Quiz Questions Data
    const quizData = [
        {
            question: "What is a key aspect of protecting your digital identity?",
            options: [
                "Sharing passwords with trusted friends",
                "Using the same password everywhere",
                "Enabling two-factor authentication",
                "Accepting all friend requests"
            ],
            correct: 2
        },
        {
            question: "Which is a common sign of a phishing attempt?",
            options: [
                "Official company logo",
                "Urgent action required message",
                "Professional design",
                "Clear contact information"
            ],
            correct: 1
        },
        {
            question: "What should you do if you suspect identity theft?",
            options: [
                "Ignore it and wait",
                "Only tell your friends",
                "Change passwords and notify relevant authorities",
                "Post about it on social media"
            ],
            correct: 2
        }
    ];

    // Event Listeners Setup
    function initializeEventListeners() {
        // Navigation Toggle
        DOM.navToggle?.addEventListener('click', toggleNavigation);

        // Theme Toggle
        DOM.themeToggle?.addEventListener('click', toggleTheme);

    // Scroll Events (passive for better performance) and debounced
    window.addEventListener('scroll', debounce(handleScroll, 100), { passive: true });

        // Back to Top
        DOM.backToTop?.addEventListener('click', scrollToTop);

        // Flip Cards
        // Use currentTarget in key handlers so inner elements don't break keyboard interaction
        DOM.flipCards?.forEach(card => {
            card.addEventListener('click', () => flipCard(card));
            card.addEventListener('keydown', handleCardKeyPress);
        });

        // Checklist
        // Ensure each checkbox has a stable id so localStorage keys are consistent
        Array.from(DOM.checklistItems || []).forEach((item, idx) => {
            if (!item.id) {
                // generate a predictable id
                item.id = `checklist-item-${idx}`;
            }
            item.addEventListener('change', updateProgress);
            // Load saved state
            const saved = localStorage.getItem(`checklist-${item.id}`);
            if (saved === 'true') {
                item.checked = true;
            }
        });

        // Reset Button
        DOM.resetButton?.addEventListener('click', resetProgress);

        // Modal Close
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
            el?.addEventListener('click', closeModal);
        });

        // Example Buttons (use currentTarget so inner elements don't break dataset access)
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn?.addEventListener('click', (e) => showExample(e.currentTarget.dataset.example));
        });

        // Initialize Quiz
        initializeQuiz();
    }

    // Navigation Functions
    function toggleNavigation() {
        DOM.mainNav?.classList.toggle('active');
        const isExpanded = DOM.mainNav?.classList.contains('active');
        DOM.navToggle?.setAttribute('aria-expanded', isExpanded);
    }

    // Theme Functions
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon();
    }

    function updateThemeIcon() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        DOM.themeToggle.innerHTML = current === 'dark' ?
            '<i class="fas fa-moon"></i>' :
            '<i class="fas fa-sun"></i>';
    }

    // Scroll Functions
    function handleScroll() {
        // Back to Top visibility
        if (window.pageYOffset > window.innerHeight / 2) {
            DOM.backToTop?.classList.add('visible');
        } else {
            DOM.backToTop?.classList.remove('visible');
        }

        // Reveal animations: cache reveal elements and check them individually
        if (!window._revealElements) {
            window._revealElements = Array.from(document.querySelectorAll('.reveal'));
        }

        if (window._revealElements.length) {
            // Filter out elements that become active so we stop checking them
            window._revealElements = window._revealElements.filter(el => {
                if (isElementPartiallyInViewport(el)) {
                    el.classList.add('active');
                    return false; // remove from list
                }
                return true;
            });
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Card Functions
    function flipCard(card) {
        card.classList.toggle('flipped');
        const isFlipped = card.classList.contains('flipped');
        card.setAttribute('aria-expanded', isFlipped);
    }

    function handleCardKeyPress(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Use currentTarget to get the flip-card element
            flipCard(e.currentTarget || e.target);
        }
    }

    // Progress Functions
    function updateProgress() {
        const total = DOM.checklistItems?.length || 0;
        const checked = Array.from(DOM.checklistItems || []).filter(item => item.checked).length;
    const percentage = total === 0 ? 0 : (checked / total) * 100;

        // Update progress bar
        if (DOM.progressBar) {
            DOM.progressBar.style.width = `${percentage}%`;
        }

        // Update text
        if (DOM.progressText) {
            DOM.progressText.textContent = `${Math.round(percentage)}% Complete`;
        }

        // Save to localStorage
        DOM.checklistItems?.forEach(item => {
            localStorage.setItem(`checklist-${item.id}`, item.checked);
        });

        // Show completion message if all items are checked
        if (percentage === 100) {
            showCompletionMessage();
        }
    }

    function showCompletionMessage() {
        if (document.querySelector('.completion-toast')) return;
        const toast = document.createElement('div');
        toast.className = 'completion-toast';
        toast.textContent = 'Checklist complete — great job!';
        Object.assign(toast.style, {
            position: 'fixed',
            right: '1rem',
            bottom: '4.5rem',
            background: 'var(--primary)',
            color: '#fff',
            padding: '0.6rem 1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
            zIndex: 2000
        });
        document.body.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 3000);
    }

    function resetProgress() {
        // Clear checkboxes
        DOM.checklistItems?.forEach(item => {
            item.checked = false;
            localStorage.removeItem(`checklist-${item.id}`);
        });

        // Reset progress bar
        updateProgress();
    }

    // Modal Functions
    function showExample(type) {
        const examples = {
            phishing: {
                title: "Phishing Example",
                content: "An email claiming to be from your bank asks you to 'verify your account' by clicking a suspicious link."
            },
            scams: {
                title: "Common Scam Example",
                content: "A 'tech support' caller claims your computer is infected and needs immediate expensive repairs."
            },
            theft: {
                title: "Identity Theft Warning Signs",
                content: "You notice unfamiliar charges on your credit card and receive bills for accounts you never opened."
            }
        };

        const example = examples[type];
        if (example && DOM.modal) {
            DOM.modal.querySelector('#modalTitle').textContent = example.title;
            DOM.modal.querySelector('.modal-body').textContent = example.content;
            DOM.modal.classList.add('active');
            DOM.modal.setAttribute('aria-hidden', 'false');
            trapFocus(DOM.modal);
        }
    }

    function closeModal() {
        if (DOM.modal) {
            DOM.modal.classList.remove('active');
            DOM.modal.setAttribute('aria-hidden', 'true');
        }
        restoreFocus();
    }

    // Quiz Functions
    function initializeQuiz() {
        if (!DOM.quizForm) return;

        // Generate quiz HTML
        const quizHTML = quizData.map((q, i) => `
            <div class="quiz-question">
                <h3>Question ${i + 1}</h3>
                <p>${q.question}</p>
                <div class="quiz-options">
                    ${q.options.map((opt, j) => `
                        <label>
                            <input type="radio" name="q${i}" value="${j}">
                            ${opt}
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');

        DOM.quizForm.innerHTML = quizHTML + `
            <button type="submit" class="btn">Submit Quiz</button>
            <div class="quiz-results" hidden></div>
        `;

        // Add submit handler
        DOM.quizForm.addEventListener('submit', handleQuizSubmit);
    }

    function handleQuizSubmit(e) {
        e.preventDefault();
        
        let score = 0;
        const results = [];

        quizData.forEach((q, i) => {
            const answer = document.querySelector(`input[name="q${i}"]:checked`);
            if (answer && parseInt(answer.value) === q.correct) {
                score++;
                results.push(true);
            } else {
                results.push(false);
            }
        });

        showQuizResults(score, results);
    }

    function showQuizResults(score, results) {
        const resultDiv = DOM.quizForm.querySelector('.quiz-results');
        const total = quizData.length;
        const percentage = (score / total) * 100;

        let feedback = '';
        if (percentage === 100) feedback = "Perfect! You're a digital security expert!";
        else if (percentage >= 70) feedback = "Good job! Just a few more things to learn.";
        else feedback = "Keep learning! Security awareness is a journey.";

        resultDiv.innerHTML = `
            <h3>Your Score: ${score}/${total}</h3>
            <p>${feedback}</p>
            <button class="btn btn-secondary" onclick="location.reload()">Try Again</button>
        `;
        resultDiv.hidden = false;
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

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Focus Management
    let lastFocusedElement;
    let _modalKeydownHandler = null;

    function trapFocus(element) {
        lastFocusedElement = document.activeElement;
        const focusableEls = element.querySelectorAll('a[href], button, textarea, input, select');
        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];

        firstFocusableEl?.focus();

        // Create a named handler so we can remove it later
        _modalKeydownHandler = function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableEl) {
                        e.preventDefault();
                        lastFocusableEl?.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusableEl) {
                        e.preventDefault();
                        firstFocusableEl?.focus();
                    }
                }
            }
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        element.addEventListener('keydown', _modalKeydownHandler);
    }

    function restoreFocus() {
        // Remove modal keydown handler if present
        if (_modalKeydownHandler && DOM.modal) {
            DOM.modal.removeEventListener('keydown', _modalKeydownHandler);
            _modalKeydownHandler = null;
        }
        lastFocusedElement?.focus();
    }

    // Partial-visibility helper used by reveal logic
    function isElementPartiallyInViewport(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
        const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
        const verticallyInView = rect.top <= windowHeight && (rect.top + rect.height) >= 0;
        const horizontallyInView = rect.left <= windowWidth && (rect.left + rect.width) >= 0;
        return verticallyInView && horizontallyInView;
    }

    // Initialize on DOM Load
    document.addEventListener('DOMContentLoaded', () => {
        // Load saved theme (data-theme on <html>)
        const saved = localStorage.getItem('theme');
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
        } else if (!document.documentElement.hasAttribute('data-theme')) {
            document.documentElement.setAttribute('data-theme', 'light');
        }
        updateThemeIcon();

        // Initialize components
        initializeEventListeners();
        updateProgress();
        handleScroll();
    });
})();