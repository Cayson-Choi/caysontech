function setupAuth() {
    const loginBtn = document.getElementById('googleLoginBtn');
    const userProfile = document.getElementById('userProfile');
    const userImage = document.getElementById('userImage');
    const userName = document.getElementById('userName');
    const adminNavItem = document.getElementById('adminNavItem');

    // 1. Google Login Action (Smart In-App Handling)
    if(loginBtn) {
        loginBtn.addEventListener('click', () => {
            const agent = navigator.userAgent.toLowerCase();
            const isInApp = agent.includes('kakao') || agent.includes('instagram') || agent.includes('naver') || agent.includes('facebook') || agent.includes('line') || agent.includes('snapchat');
            const isAndroid = agent.includes('android');

            // [1] Handle In-App Browsers
            if (isInApp) {
                if (isAndroid) {
                    // Android: Attempt to auto-open in Chrome
                    const currentUrl = window.location.href.replace(/https?:\/\//i, '');
                    // Use intent scheme to open Chrome
                    const intentUrl = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
                    window.location.href = intentUrl;
                    return; // Stop execution
                } else {
                    // iOS/Others: Show Instruction (Cannot auto-open)
                    alert("🚫 [구글 보안 정책 안내]\n\n카카오톡/인스타그램 등 앱 내부 브라우저에서는 구글 로그인이 차단됩니다.\n\n✅ 해결 방법:\n화면의 [점 3개 메뉴] → [다른 브라우저로 열기]를 눌러서\nSafari나 Chrome에서 다시 시도해주세요.");
                    return; // Stop execution to prevent 403 error screen
                }
            }

            // [2] Standard Browser (Chrome, Safari, Samsung Internet, etc)
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' }); // Good practice
            firebase.auth().useDeviceLanguage();

            firebase.auth().signInWithPopup(provider)
                .then((result) => {
                     showToast(`환영합니다, ${result.user.displayName}님! 👋`, 'success');
                })
                .catch((error) => {
                    console.error("Popup Login Error:", error);
                    // Fallback to Redirect if Popup is blocked (rare in standard browsers)
                    if (error.code === 'auth/popup-blocked') {
                        firebase.auth().signInWithRedirect(provider);
                    } else {
                        alert("로그인 실패: " + error.message);
                    }
                });
        });
    }

    // Handle Redirect Result
    firebase.auth().getRedirectResult()
        .then((result) => {
            if (result.user) {
                console.log("Redirect Login Success:", result.user.email);
                showToast(`환영합니다, ${result.user.displayName}님! 👋`, 'success');
            }
        })
        .catch(e => console.error(e));

    // Handle Redirect Result (Backup)
    firebase.auth().getRedirectResult()
        .then((result) => {
            if (result.user) {
                console.log("Redirect Login Success:", result.user.email);
                showToast(`환영합니다, ${result.user.displayName}님! 👋`, 'success');
            }
        })
        .catch(e => console.error(e)); 

    // 2. Auth State Observer
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("Logged In User:", user.email);
            // Logged In Logic...
            // Logged In
            if(loginBtn) loginBtn.style.display = 'none';
            if(userProfile) {
                userProfile.style.display = 'flex';
                if(userImage) userImage.src = user.photoURL;
                if(userName) userName.innerText = user.displayName;
            }

            // Admin Check
            const ADMIN_EMAIL = "cayson0127@gmail.com";
            if (user.email === ADMIN_EMAIL && adminNavItem) {
                adminNavItem.style.display = 'block';
                console.log("Admin Access Granted");
            }

        } else {
            // Logged Out
            if(loginBtn) loginBtn.style.display = 'flex';
            if(userProfile) userProfile.style.display = 'none';
            if(adminNavItem) adminNavItem.style.display = 'none';
        }
    });
}

function handleSignOut() {
    firebase.auth().signOut().then(() => {
        showToast('로그아웃 되었습니다.', 'info');
    });
}

// Ensure setupAuth is called
document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined' && window.firebaseConfig) {
        if (!firebase.apps.length) firebase.initializeApp(window.firebaseConfig);
        setupAuth();
    }
    setupAnimations();
    setupNavbar();
    setupContactForm();
});

// ===== Initial Setup Helpers =====
function setupNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    const authContainer = document.querySelector('.auth-container');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // Mobile menu logic removed (Always visible per user request)
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
