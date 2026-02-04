document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Firebase (Ensure firebaseConfig is loaded)
    if (typeof firebase !== 'undefined' && window.firebaseConfig) {
        if(window.firebaseConfig.apiKey === "YOUR_API_KEY") {
            console.warn("Firebase not configured yet. Using dummy mode.");
        } else {
            firebase.initializeApp(window.firebaseConfig);
            // const db = firebase.firestore();
            // const auth = firebase.auth();
        }
    }

    // 2. Navigation Handling
    const menuItems = document.querySelectorAll('.menu-item');
    const pageViews = document.querySelectorAll('.page-view');
    const pageTitle = document.getElementById('pageTitle');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = item.getAttribute('data-page');

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

    // 3. Login Handling (Simulation for now)
    const loginOverlay = document.getElementById('loginOverlay');
    const loginForm = document.getElementById('loginForm');
    
    // Check local storage for session
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        loginOverlay.style.display = 'none';
        loadDashboardData();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        // Simple check (In production, use Firebase Auth)
        if (email === 'admin@caysontech.com' && password === 'admin1234') {
            localStorage.setItem('adminLoggedIn', 'true');
            loginOverlay.style.display = 'none';
            loadDashboardData();
        } else {
            document.getElementById('loginError').innerText = "이메일 또는 비밀번호가 잘못되었습니다.";
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('adminLoggedIn');
        window.location.reload();
    });

    // 4. Load Dummy Data (To visualize dashboard)
    function loadDashboardData() {
        // Stats
        document.getElementById('todayNewStudent').innerText = "3";
        document.getElementById('activeCourses').innerText = "4";
        document.getElementById('pendingInquiries').innerText = "2";
        document.getElementById('monthlyGraduates').innerText = "12";

        // Course List
        const courseTable = document.getElementById('courseTableBody');
        if(courseTable) {
            courseTable.innerHTML = `
                <tr>
                    <td><strong>AI Practical Intelligence</strong><br><span style="font-size:0.8rem;color:#888;">#AI #Basic</span></td>
                    <td>AI 활용</td>
                    <td><span class="status-badge status-active">모집중</span></td>
                    <td>15명</td>
                    <td><button class="action-btn" style="padding:0.3rem;"><i class="fas fa-ellipsis-v"></i></button></td>
                </tr>
                <tr>
                    <td><strong>Web & Digital Production</strong><br><span style="font-size:0.8rem;color:#888;">#Web #Project</span></td>
                    <td>웹 개발</td>
                    <td><span class="status-badge status-active">진행중</span></td>
                    <td>8명</td>
                    <td><button class="action-btn" style="padding:0.3rem;"><i class="fas fa-ellipsis-v"></i></button></td>
                </tr>
            `;
        }

        // Activity Log
        const activityList = document.getElementById('activityList');
        if(activityList) {
            activityList.innerHTML = `
                <div style="padding:1rem; border-bottom:1px solid #2d2d3a;">
                    <span style="color:var(--accent);font-weight:600;">[신청]</span> 김철수님이 'AI Practical' 과정을 신청했습니다.
                    <div style="font-size:0.8rem;color:#888;margin-top:0.3rem;">10분 전</div>
                </div>
                <div style="padding:1rem; border-bottom:1px solid #2d2d3a;">
                    <span style="color:var(--warning);font-weight:600;">[문의]</span> 기업 교육 견적 요청이 도착했습니다. (삼성전자)
                    <div style="font-size:0.8rem;color:#888;margin-top:0.3rem;">1시간 전</div>
                </div>
            `;
        }
    }
});
