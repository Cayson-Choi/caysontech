// ===== UI Helpers =====
document.addEventListener('DOMContentLoaded', () => {
    setupAnimations();
    setupNavbar();
    setupContactForm();
});

// ===== Google Login Handling =====
function handleCredentialResponse(response) {
    // Decode JWT for display purposes
    const responsePayload = decodeJwtResponse(response.credential);
    console.log('Encoded JWT ID token: ' + response.credential);
    
    // Update UI to show profile
    const signInBtn = document.querySelector('.g_id_signin');
    const userProfile = document.getElementById('userProfile');
    
    if (signInBtn) signInBtn.style.display = 'none';
    if (userProfile) {
        userProfile.style.display = 'flex';
        document.getElementById('userImage').src = responsePayload.picture;
        document.getElementById('userName').innerText = responsePayload.name;
    }

    showToast(`환영합니다, ${responsePayload.name}님! 👋`, 'success');
}

function handleSignOut() {
    // Reset UI
    const signInBtn = document.querySelector('.g_id_signin');
    const userProfile = document.getElementById('userProfile');
    
    if (signInBtn) signInBtn.style.display = 'block';
    if (userProfile) userProfile.style.display = 'none';
    
    google.accounts.id.disableAutoSelect(); // Sign out from Google
    showToast('로그아웃 되었습니다.', 'info');
}

function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// ===== Initial Setup Helpers =====
function setupNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links'); // This might need adjustment if using CSS selector for links container
    // Assuming .nav-links is the UL. If structure changed, verify
    const navUl = document.querySelector('.nav-links');

    if (mobileBtn && navUl) {
        mobileBtn.addEventListener('click', () => {
            mobileBtn.classList.toggle('active');
            navUl.classList.toggle('active'); // Toggle class on UL
        });
    }
}

function setupAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // JS로 강제 숨김 처리하던 로직 제거 (CSS 클래스로 제어 권장)
    document.querySelectorAll('.feature-card, .about-content, .contact-card').forEach(el => {
        el.classList.add('fade-element'); // 스타일에서 처리하도록 클래스 추가
        observer.observe(el);
    });
    
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow) {
        let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
        document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
        function animateGlow() {
            glowX += (mouseX - glowX) * 0.1;
            glowY += (mouseY - glowY) * 0.1;
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    }
}

function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending...';
            btn.disabled = true;
            setTimeout(() => {
                showToast('메시지가 전송되었습니다! 🚀', 'success');
                form.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1500);
        });
    }
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;margin-left:auto;cursor:pointer;">&times;</button>`;
    
    toast.style.cssText = `
        position: fixed; top: 100px; right: 20px; padding: 1rem 1.5rem; 
        background: rgba(20, 20, 30, 0.95); border: 1px solid rgba(255,255,255,0.1); 
        border-radius: 12px; backdrop-filter: blur(10px); 
        display: flex; align-items: center; gap: 1rem; z-index: 9999; 
        color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.3); animation: slideIn 0.3s ease;
        border-left: 4px solid ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    
    if (!document.getElementById('toast-keyframes')) {
        const s = document.createElement('style');
        s.id = 'toast-keyframes';
        s.textContent = `@keyframes slideIn { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }`;
        document.head.appendChild(s);
    }
    
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}
