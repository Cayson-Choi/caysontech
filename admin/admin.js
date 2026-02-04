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
        const db = firebase.firestore();

        // A. Listen for Inquiries (Real-time)
        db.collection('inquiries').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
            const inquiries = [];
            let pendingCount = 0;
            const activityList = document.getElementById('activityList');
            const inquiryList = document.getElementById('inquiryList');
            const pendingBadge = document.getElementById('inquiryBadge');

            // Clear Lists
            if(activityList) activityList.innerHTML = '';
            if(inquiryList) inquiryList.innerHTML = '';

            snapshot.forEach((doc) => {
                const data = doc.data();
                data.id = doc.id;
                inquiries.push(data);
                
                if(data.status === 'pending') pendingCount++;

                // Add to Inquiry List (Tab View)
                if(inquiryList) {
                    const date = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : 'Just now';
                    const statusClass = data.status === 'pending' ? 'status-draft' : 'status-active';
                    const statusText = data.status === 'pending' ? '대기중' : '답변완료';
                    
                    const item = document.createElement('div');
                    item.className = 'card';
                    item.style.marginBottom = '1rem';
                    item.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.8rem;">
                            <div>
                                <span class="status-badge ${statusClass}">${statusText}</span>
                                <span style="font-size:0.85rem; color:#888; margin-left:0.5rem;">${date}</span>
                            </div>
                            <button class="action-btn" onclick="toggleStatus('${doc.id}', '${data.status}')" style="padding:0.3rem 0.6rem; font-size:0.8rem;">
                                ${data.status === 'pending' ? '<i class="fas fa-check"></i> 처리완료' : '<i class="fas fa-undo"></i> 대기질'}
                            </button>
                        </div>
                        <h4 style="font-size:1.1rem; margin-bottom:0.5rem;">${data.name} <span style="font-size:0.9rem; color:#888; font-weight:400;">(${data.email})</span></h4>
                        <p style="color:#ccc; font-size:0.95rem; line-height:1.5;">${data.message}</p>
                        <div style="margin-top:0.8rem; font-size:0.9rem; color:var(--accent);"><i class="fas fa-phone"></i> ${data.phone}</div>
                    `;
                    inquiryList.appendChild(item);
                }

                // Add to Activity Log (Dashboard View - Show max 5)
                if(activityList && inquiries.length <= 5) {
                    const actItem = document.createElement('div');
                    actItem.style.padding = '1rem';
                    actItem.style.borderBottom = '1px solid #2d2d3a';
                    actItem.innerHTML = `
                        <span style="color:var(--accent);font-weight:600;">[문의]</span> ${data.name}님이 문의를 남겼습니다.
                        <div style="font-size:0.8rem;color:#888;margin-top:0.3rem;">${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : '방금 전'}</div>
                    `;
                    activityList.appendChild(actItem);
                }
            });

            // Update Counts
            document.getElementById('pendingInquiries').innerText = pendingCount;
            if(pendingBadge) pendingBadge.innerText = pendingCount;

        }, (error) => {
            console.error("Error getting inquiries:", error);
        });

        // B. Dummy Stats for other fields (Connect DB later)
        document.getElementById('todayNewStudent').innerText = "0"; // To implement
        document.getElementById('activeCourses').innerText = "0"; // To implement
        document.getElementById('monthlyGraduates').innerText = "0"; // To implement
    }

    // Global function for onclick events
    window.toggleStatus = function(id, currentStatus) {
        const newStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
        firebase.firestore().collection('inquiries').doc(id).update({
            status: newStatus
        }).then(() => {
            console.log("Status updated");
        }).catch(err => console.error(err));
    };
});
