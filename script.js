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

        // Scroll Events
        window.addEventListener('scroll', debounce(handleScroll, 100));

        // Back to Top
        DOM.backToTop?.addEventListener('click', scrollToTop);

        // Flip Cards
        DOM.flipCards?.forEach(card => {
            card.addEventListener('click', () => flipCard(card));
            card.addEventListener('keydown', handleCardKeyPress);
        });

        // Checklist
        DOM.checklistItems?.forEach(item => {
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

        // Example Buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn?.addEventListener('click', (e) => showExample(e.target.dataset.example));
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
        document.body.classList.toggle('theme-light');
        const isDark = !document.body.classList.contains('theme-light');
        localStorage.setItem('darkMode', isDark);
        updateThemeIcon();
    }

    function updateThemeIcon() {
        const isDark = !document.body.classList.contains('theme-light');
        DOM.themeToggle.innerHTML = isDark ? 
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

        // Reveal animations
        DOM.sections?.forEach(section => {
            if (isElementInViewport(section)) {
                section.querySelectorAll('.reveal').forEach(el => {
                    el.classList.add('active');
                });
            }
        });
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
            flipCard(e.target);
        }
    }

    // Progress Functions
    function updateProgress() {
        const total = DOM.checklistItems?.length || 0;
        const checked = Array.from(DOM.checklistItems || []).filter(item => item.checked).length;
        const percentage = (checked / total) * 100;

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
            trapFocus(DOM.modal);
        }
    }

    function closeModal() {
        DOM.modal?.classList.remove('active');
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

    function trapFocus(element) {
        lastFocusedElement = document.activeElement;
        const focusableEls = element.querySelectorAll('a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select');
        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];

        firstFocusableEl?.focus();

        element.addEventListener('keydown', function(e) {
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
        });
    }

    function restoreFocus() {
        lastFocusedElement?.focus();
    }

    // Initialize on DOM Load
    document.addEventListener('DOMContentLoaded', () => {
        // Load saved theme
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.remove('theme-light');
        }
        updateThemeIcon();

        // Initialize components
        initializeEventListeners();
        updateProgress();
        handleScroll();
    });
})();