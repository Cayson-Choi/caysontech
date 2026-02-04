document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Firebase (Ensure firebaseConfig is loaded)
    if (typeof firebase !== 'undefined' && window.firebaseConfig) {
        firebase.initializeApp(window.firebaseConfig);
        // Initialize services
        window.db = firebase.firestore();
        window.auth = firebase.auth();
        console.log("Firebase initialized successfully");
    }

    // 2. Navigation Handling
    const menuItems = document.querySelectorAll('.menu-item');
    const pageViews = document.querySelectorAll('.page-view');
    const pageTitle = document.getElementById('pageTitle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');

    // Create Overlay for Mobile
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    // Mobile Toggle Logic
    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
    }
    // Close when clicking overlay
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Check if it's an external link (Back to Home)
            if(item.getAttribute('href') && !item.getAttribute('href').startsWith('#')) {
                return; // Let standard navigation happen
            }

            e.preventDefault();
            const targetPage = item.getAttribute('data-page');

            // Close mobile menu on selection
            sidebar.classList.remove('active');
            overlay.classList.remove('active');

            // Update Active Menu
            menuItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show Target View
            pageViews.forEach(view => view.classList.remove('active'));
            const targetView = document.getElementById(`${targetPage}View`);
            if (targetView) targetView.classList.add('active');
            else document.getElementById('dashboardView').classList.add('active'); // Default

            // Update Title
            pageTitle.innerText = item.textContent.trim();
        });
    });

    // 3. Login Handling (Google Auth & Security Check)
    const loginOverlay = document.getElementById('loginOverlay');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const loginError = document.getElementById('loginError');

    // Admin Whitelist
    const ADMIN_EMAIL = "cayson0127@gmail.com";

    // Auth State Observer
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Security Check
            if (user.email === ADMIN_EMAIL) {
                console.log("Admin Authorized:", user.email);
                document.querySelector('.admin-name').innerText = user.displayName || 'Admin';
                // Load Avatar if available
                if(user.photoURL) {
                    document.querySelector('.admin-avatar').innerHTML = `<img src="${user.photoURL}" style="width:100%;height:100%;border-radius:50%;">`;
                }
                loginOverlay.style.display = 'none';
                loadDashboardData(); // Load real data
            } else {
                console.warn("Unauthorized Access Attempt:", user.email);
                loginError.innerText = "접근 권한이 없는 계정입니다. (" + user.email + ")";
                firebase.auth().signOut();
            }
        } else {
            loginOverlay.style.display = 'flex';
        }
    });

    // Google Login Action (Smart In-App Handling)
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
             const agent = navigator.userAgent.toLowerCase();
             const isInApp = agent.includes('kakao') || agent.includes('instagram') || agent.includes('naver') || agent.includes('facebook') || agent.includes('line');
             const isAndroid = agent.includes('android');

             // [1] Handle In-App Browsers
             if (isInApp) {
                 if (isAndroid) {
                     // Android: Ask user before switching to Chrome
                     if (confirm("카카오톡 등 인앱 브라우저에서는 구글 로그인이 지원되지 않습니다.\n\n원활한 로그인을 위해 Chrome 브라우저로 이동하시겠습니까?")) {
                         const currentUrl = window.location.href.replace(/https?:\/\//i, '');
                         const intentUrl = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
                         window.location.href = intentUrl;
                     }
                     return; 
                 } else {
                     // iOS: Show Guide
                     alert("🚫 [구글 보안 정책 안내]\n\n카카오톡/인스타 등 인앱 브라우저에서는 구글 로그인이 차단됩니다.\n\n✅ [점 3개 메뉴] → [다른 브라우저로 열기]를 이용해주세요.");
                     return;
                 }
             }

            // [2] Standard Browser -> Popup
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            firebase.auth().useDeviceLanguage();
            
            loginError.innerText = "Google 로그인 진행 중...";
            firebase.auth().signInWithPopup(provider)
                .catch((error) => {
                    console.error("Popup Error:", error);
                    loginError.innerText = "로그인 실패: " + error.message;
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
            if (result.user) console.log("Admin Redirect Success");
        })
        .catch((error) => {
            console.error("Redirect Error:", error);
            loginError.innerText = "오류: " + error.message;
        });

    // Handle Redirect Result
    firebase.auth().getRedirectResult()
        .then((result) => {
            if (result.user) console.log("Admin Redirect Success");
        })
        .catch((error) => {
            console.error("Redirect Error:", error);
            loginError.innerText = "오류: " + error.message;
        });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        if(confirm("정말 로그아웃 하시겠습니까?")) {
            firebase.auth().signOut().then(() => {
                window.location.reload();
            });
        }
    });

    // 4. Load Real Data (Firestore)
    function loadDashboardData() {
        if (!firebase.auth().currentUser) return;
        
        const db = firebase.firestore();

        // A. Listen for Messages (Real-time) for Dashboard Stats
        db.collection('messages').orderBy('timestamp', 'desc').limit(5).onSnapshot((snapshot) => {
            let pendingCount = 0; // In a real app, you'd allow 'marking as read'. For now, simple count.
            const activityList = document.getElementById('activityList');

            if(activityList) activityList.innerHTML = '';

            // Count 'unread' if we had that field, or just showing latest 5
            
            // Populate Recent Activity Log
            if (snapshot.empty) {
                if(activityList) activityList.innerHTML = '<div class="empty-state">최근 메시지가 없습니다.</div>';
            } else {
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : 'Just now';
                    
                    if(activityList) {
                        const div = document.createElement('div');
                        div.className = 'activity-item';
                        div.innerHTML = `
                            <div class="activity-icon icon-blue"><i class="fas fa-envelope"></i></div>
                            <div class="activity-content">
                                <strong>${data.name}</strong>님이 메시지를 보냈습니다.
                                <span class="activity-time">${date}</span>
                            </div>
                        `;
                        activityList.appendChild(div);
                    }
                    if (!data.read) pendingCount++;
                });
            }
            // Update Badge & Stat
            if(document.getElementById('pendingInquiries')) document.getElementById('pendingInquiries').innerText = pendingCount;
            if(document.getElementById('inquiryBadge')) document.getElementById('inquiryBadge').innerText = pendingCount;
            
            // Also refresh table if on inquiries page
            if(document.getElementById('inquiryTableBody')) loadInquiries();
        });
    }

    // 5. Load Inquiries Table (Called by button + Dashboard listener)
    window.loadInquiries = function() {
        const tbody = document.getElementById('inquiryTableBody');
        if (!tbody) return;

        const db = firebase.firestore();
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">로딩 중...</td></tr>';

        db.collection('messages').orderBy('timestamp', 'desc').get().then((snapshot) => {
            if (snapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">접수된 문의가 없습니다.</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            snapshot.forEach((doc) => {
                const data = doc.data();
                const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : 'Just now';
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${date}</td>
                    <td><div style="font-weight:bold;">${data.name}</div><div style="font-size:0.85rem; color:#888;">${data.org}</div></td>
                    <td><a href="mailto:${data.email}" style="color:var(--primary);">${data.email}</a></td>
                    <td><div style="white-space:pre-wrap; max-height:100px; overflow-y:auto;">${data.message}</div></td>
                `;
                tbody.appendChild(tr);
            });
        }).catch (error => {
            console.error("Error loading inquiries:", error);
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color:red;">데이터 로드 실패</td></tr>';
        });
    };
});
