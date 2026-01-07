document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Sticky Header
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Standard Fade Up Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeUpElements = document.querySelectorAll('.fade-up');
    fadeUpElements.forEach(el => observer.observe(el));

    // 3. The "Lusion" Slide-In Animation
    const heroTextLines = document.querySelectorAll('.line-wrapper');
    if (heroTextLines.length > 0) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    heroObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        heroTextLines.forEach((line, index) => {
            const textSpan = line.querySelector('.line-text');
            if (textSpan) {
                textSpan.style.transitionDelay = `${index * 0.15}s`;
            }
            heroObserver.observe(line);
        });
    }

    // 4. Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // 5. Multi-Step Form Logic
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const emailInput = document.getElementById('contact-email');
    const emailError = document.getElementById('email-error');
    const messageInput = document.getElementById('contact-message');
    
    // Helper: Move from current step to next step
    function switchStep(current, next) {
        current.classList.remove('active-step');
        current.classList.add('exited-step');
        
        setTimeout(() => {
            current.style.visibility = 'hidden'; 
            next.style.visibility = 'visible';
            next.classList.remove('hidden-step');
            next.classList.add('active-step');
        }, 400); 
    }

    // Step 1: Validate Email & Go Next
    if(nextBtn) {
        nextBtn.addEventListener('click', () => {
            if(emailInput.checkValidity() && emailInput.value !== "") {
                emailError.classList.remove('visible');
                switchStep(step1, step2);
                
                // Auto-focus the message area after transition
                setTimeout(() => document.getElementById('contact-message').focus(), 500);
            } else {
                emailError.classList.add('visible');
                emailInput.focus();
            }
        });
    }

    if(emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); 
                nextBtn.click();
            }
        });
    }

    // 6. Textarea Expanding & Font Scaling Logic (FIXED)
    if (messageInput) {
        const MAX_HEIGHT = 300; 
        const BASE_FONT_SIZE = 2.5; 
        const MIN_FONT_SIZE = 1.0; 
        
        messageInput.addEventListener('input', function() {
            // 1. Reset Height to auto to get correct scrollHeight
            this.style.height = 'auto'; 
            this.style.overflowY = 'hidden'; 
            
            // 2. CRITICAL: Reset Font Size to Base before measuring.
            // This prevents the "Oscillation" bug where small font makes the box think it fits,
            // resetting it to big font, which then makes it overflow again.
            this.style.fontSize = `${BASE_FONT_SIZE}rem`;
            
            // 3. Measure the "True" height of content at base size
            let scrollH = this.scrollHeight;
            
            if (scrollH <= MAX_HEIGHT) {
                // Case A: Fits within max height at base font size
                this.style.height = scrollH + 'px';
                // Font size is already reset to 2.5rem above
            } else {
                // Case B: Exceeds max height -> Lock Height & Shrink Font
                this.style.height = `${MAX_HEIGHT}px`;
                
                // Calculate scale ratio based on the TRUE height
                let ratio = MAX_HEIGHT / scrollH;
                let newSize = BASE_FONT_SIZE * ratio;
                
                // Clamp font size
                if (newSize < MIN_FONT_SIZE) newSize = MIN_FONT_SIZE;
                
                this.style.fontSize = `${newSize}rem`;
                
                // Case C: If font is at minimum and still overflowing -> Enable Scroll
                // We perform a check to see if we are really overflowing at min font
                if (newSize <= MIN_FONT_SIZE + 0.1) {
                    this.style.overflowY = 'auto'; 
                }
            }
        });
    }

// Existing Step 2: "Send" the form
    const form = document.getElementById('multi-step-form');
    if(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            // 1. Capture the form data
            const formData = new FormData(form);
            
            // 2. Send data to Formspree (Replace URL with your actual endpoint)
            fetch("https://formspree.io/f/mrebnprk", {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    // 3. ONLY switch steps if the email was actually sent
                    switchStep(step2, step3);
                    form.reset(); // Optional: Clear the form
                } else {
                    console.log("Oops! There was a problem sending your form.");
                }
            }).catch(error => {
                console.log("Oops! There was a problem sending your form.");
            });
        });
    }
});