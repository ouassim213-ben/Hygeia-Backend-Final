/**
 * HYGEIA - Premium Startup Interaction Logic
 * Handles global navbar blur, scroll reveal animations, button ripples, and AI mocks.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Sticky Navbar on Scroll --- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* --- 2. Scroll Reveal Animations --- */
    // Ensure CSS has .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease; } .reveal.active { opacity: 1; transform: translateY(0); }
    const revealElements = document.querySelectorAll('.section, .feature-box, .post-card, .video-card, .nutritionist-card');
    
    // Add initial reveal class
    revealElements.forEach(el => {
        if (!el.classList.contains('animate-fade')) {
            el.classList.add('reveal');
        }
    });

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 100;
        
        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on load

    /* --- 3. Click Feedback (Ripples & Pop) --- */
    const interactiveElements = document.querySelectorAll('.btn, .plan-card, .macro-box, .dash-link');
    interactiveElements.forEach(el => {
        el.addEventListener('mousedown', function(e) {
            this.style.transform = (this.classList.contains('glass-card') || this.classList.contains('plan-card')) ? 'scale(0.97)' : 'scale(0.95)';
        });
        el.addEventListener('mouseup', function(e) {
            this.style.transform = '';
            // Allow CSS to take over the hover scaling smoothly
        });
        el.addEventListener('mouseleave', function(e) {
            this.style.transform = '';
        });
    });

    /* --- 4. AI Tracker Simulator (For ai-tracker.html) --- */
    const fileUpload = document.getElementById('file-upload');
    if (fileUpload) {
        fileUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const uploadArea = document.querySelector('.upload-area');
                const premiumBox = document.querySelector('.premium-box');
                const resultsContainer = document.querySelector('.results-container');
                
                // Read the file and preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    uploadArea.innerHTML = `
                        <img src="${e.target.result}" class="preview-img" style="margin-bottom: 20px;">
                        <h3 style="color: var(--color-primary);">Analyzing image...</h3>
                        <div style="width: 100%; max-width: 300px; height: 8px; background: rgba(25, 68, 89, 0.1); border-radius: 4px; overflow: hidden; margin: 15px auto;">
                            <div id="ai-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--color-secondary), var(--color-highlight)); transition: width 0.3s ease;"></div>
                        </div>
                    `;
                    
                    // Simulate loading
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += Math.random() * 20;
                        if (progress > 100) progress = 100;
                        document.getElementById('ai-progress').style.width = progress + '%';
                        
                        if (progress === 100) {
                            clearInterval(interval);
                            uploadArea.innerHTML = `
                                <img src="${e.target.result}" class="preview-img" style="border: 2px solid var(--color-secondary); box-shadow: var(--shadow-md);">
                                <h3 style="color: var(--color-secondary); margin-top: 20px;"><i class="fas fa-check-circle"></i> Analysis Complete</h3>
                            `;
                            // Fade in results
                            if (premiumBox) premiumBox.style.display = 'block';
                            if (resultsContainer) {
                                resultsContainer.style.opacity = '0';
                                resultsContainer.style.display = 'block';
                                setTimeout(() => {
                                    resultsContainer.style.transition = 'opacity 0.8s ease';
                                    resultsContainer.style.opacity = '1';
                                }, 100);
                            }
                        }
                    }, 400);
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    /* --- 5. Theme Toggle Mock --- */
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const icon = themeToggle.querySelector('i');
            if (document.body.classList.contains('dark-theme')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }
    /* --- 6. Premium Lock --- */
    const isPremium = localStorage.getItem('isPremium') === 'true';
    if (!isPremium) {
        // Grey out premium links
        const premiumLinks = document.querySelectorAll('a[href="ai-tracker.html"], a[href="appointments.html"], a[href="dashboard.html"], a[href="profile.html"], a[href="doctor-details.html"]');
        premiumLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'subscription.html';
            });
            link.style.opacity = '0.5';
            link.style.cursor = 'not-allowed';
            link.title = 'Premium Access Required';
        });
        
        // Protect private pages
        const currentPath = window.location.pathname;
        const protectedPages = ['ai-tracker.html', 'appointments.html', 'dashboard.html', 'profile.html', 'doctor-details.html'];
        if (protectedPages.some(page => currentPath.includes(page))) {
            window.location.href = 'subscription.html';
        }
    }
});


/* --- 7. Global Logout Function --- */
window.logout = function() {
    localStorage.removeItem('isPremium');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:rgba(25,68,89,0.95); color:white; padding:15px 30px; border-radius:30px; z-index:9999; backdrop-filter:blur(10px); box-shadow:0 10px 30px rgba(0,0,0,0.3); font-weight:bold; font-family:var(--font-heading, sans-serif); border:1px solid rgba(133,181,153,0.3); display:flex; align-items:center; gap:10px; transition: opacity 0.5s;';
    toast.innerHTML = '<i class="fas fa-sign-out-alt" style="color:#ef4444; font-size:1.2rem;"></i> Logout successful. See you soon!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            window.location.href = 'index (3).html';
        }, 500);
    }, 1000);
};
