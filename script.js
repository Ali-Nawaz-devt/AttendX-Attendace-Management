/* ============================================================
   AttendX — Attendance Management System
   script.js — Full Application Logic
   ============================================================ */

'use strict';

// ============================================================
// STATE & CONSTANTS
// ============================================================
const CREDS = { user: 'admin', pass: 'admin123' };
const CLASSES = ['Class A', 'Class B', 'Class C', 'Class D'];
const DEPARTMENTS = ['Computer Science', 'Mathematics', 'Physics', 'English', 'Biology', 'Chemistry'];

let state = {
  students: [],
  attendance: {},   // { 'YYYY-MM-DD_ClassName': { studentId: 'present'|'absent'|'late' } }
  settings: { theme: 'dark', accent: '#00f5d4' },
  activity: [],
  notifications: [],
  currentPage: 1,
  itemsPerPage: 8,
  editingId: null,
  currentSection: 'dashboard',
};

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  initSplash();
  initKeyboardShortcuts();
  setInterval(updateClock, 1000);
  updateClock();
  applySettings();
  document.getElementById('att-date').valueAsDate = new Date();
  document.getElementById('rep-date').valueAsDate = new Date();
  checkSession();
});

function initSplash() {
  setTimeout(() => {
    document.getElementById('splash-screen').style.opacity = '0';
    document.getElementById('splash-screen').style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      document.getElementById('splash-screen').style.display = 'none';
      checkSession();
    }, 500);
  }, 2400);
}

function checkSession() {
  if (localStorage.getItem('attendx_session')) {
    showDashboard();
  } else {
    showLogin();
    initLoginCanvas();
  }
}

// ============================================================
// LOCAL STORAGE
// ============================================================
function saveToStorage() {
  localStorage.setItem('attendx_students', JSON.stringify(state.students));
  localStorage.setItem('attendx_attendance', JSON.stringify(state.attendance));
  localStorage.setItem('attendx_settings', JSON.stringify(state.settings));
  localStorage.setItem('attendx_activity', JSON.stringify(state.activity.slice(0, 50)));
  localStorage.setItem('attendx_notifications', JSON.stringify(state.notifications.slice(0, 20)));
}

function loadFromStorage() {
  try {
    state.students = JSON.parse(localStorage.getItem('attendx_students')) || generateDefaultStudents();
    state.attendance = JSON.parse(localStorage.getItem('attendx_attendance')) || {};
    state.settings = JSON.parse(localStorage.getItem('attendx_settings')) || { theme: 'dark', accent: '#00f5d4' };
    state.activity = JSON.parse(localStorage.getItem('attendx_activity')) || [];
    state.notifications = JSON.parse(localStorage.getItem('attendx_notifications')) || generateDefaultNotifications();
  } catch(e) {
    state.students = generateDefaultStudents();
  }
  if (!state.students.length) state.students = generateDefaultStudents();
}

// ============================================================
// DEMO DATA GENERATION
// ============================================================
function generateDefaultStudents() {
  const names = [
    'Alice Johnson','Bob Martinez','Carol White','David Kim','Emma Davis',
    'Frank Wilson','Grace Lee','Henry Brown','Isabella Taylor','James Anderson',
    'Kayla Thomas','Liam Jackson','Mia Harris','Noah Martin','Olivia Thompson',
    'Paul Garcia','Quinn Robinson','Rachel Clark','Samuel Lewis','Tina Hall',
    'Uma Allen','Victor Young','Wendy King','Xavier Wright','Yara Scott',
    'Zach Green','Amy Adams','Brian Nelson','Chloe Carter','Derek Mitchell'
  ];
  return names.map((name, i) => ({
    id: 'S' + String(i + 1).padStart(3, '0'),
    name,
    roll: `${CLASSES[i % 4].replace(' ', '')}-${String(i + 1).padStart(3, '0')}`,
    class: CLASSES[i % 4],
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    email: name.split(' ')[0].toLowerCase() + '@school.edu',
    attendance: Math.floor(Math.random() * 35) + 65,
    createdAt: new Date(Date.now() - Math.random() * 30 * 864e5).toISOString()
  }));
}

function generateDefaultNotifications() {
  return [
    { text: 'Attendance report ready for Class A', time: '2 min ago', type: 'info' },
    { text: 'New student Emma Davis enrolled', time: '1 hr ago', type: 'success' },
    { text: '3 students absent for 3+ days', time: '3 hrs ago', type: 'warning' },
  ];
}

function addActivity(text) {
  state.activity.unshift({ text, time: new Date().toLocaleTimeString() });
  state.activity = state.activity.slice(0, 30);
  renderActivityFeed();
  saveToStorage();
}

// ============================================================
// AUTH
// ============================================================
function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  const btn = document.querySelector('.login-btn');
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');
  btn.querySelector('.btn-text').style.opacity = '0';
  btn.querySelector('.btn-loader').classList.remove('hidden');
  setTimeout(() => {
    if (u === CREDS.user && p === CREDS.pass) {
      localStorage.setItem('attendx_session', JSON.stringify({ user: u, time: Date.now() }));
      addActivity(`<b>Admin</b> logged in`);
      btn.querySelector('.btn-text').style.opacity = '1';
      btn.querySelector('.btn-loader').classList.add('hidden');
      showDashboard();
    } else {
      btn.querySelector('.btn-text').style.opacity = '1';
      btn.querySelector('.btn-loader').classList.add('hidden');
      errEl.classList.remove('hidden');
    }
  }, 1200);
}

function doLogout() {
  localStorage.removeItem('attendx_session');
  document.getElementById('dashboard').classList.add('hidden');
  showLogin();
  initLoginCanvas();
  showToast('Logged out successfully', 'success');
}

function showLogin() {
  document.getElementById('login-page').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  initDashboard();
}

function togglePass() {
  const inp = document.getElementById('login-pass');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ============================================================
// LOGIN CANVAS ANIMATION
// ============================================================
function initLoginCanvas() {
  const canvas = document.getElementById('login-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    alpha: Math.random() * 0.5 + 0.1
  }));

  function drawFrame() {
    if (document.getElementById('login-page').classList.contains('hidden')) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,245,212,${p.alpha})`;
      ctx.fill();
    });
    // Draw lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,245,212,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawFrame);
  }
  drawFrame();
  document.getElementById('login-user').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('login-pass').focus(); });
  document.getElementById('login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
}

// ============================================================
// DASHBOARD INIT
// ============================================================
function initDashboard() {
  renderStudentBadge();
  renderDashboardStats();
  renderWeeklyChart();
  renderPieChart();
  renderTodaysClasses();
  renderRightPanel();
  renderActivityFeed();
  renderNotifList();
  updateSessionTime();
  navigate('dashboard');
}

// ============================================================
// NAVIGATION
// ============================================================
function navigate(section) {
  state.currentSection = section;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-section="${section}"]`).classList.add('active');
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  document.getElementById(`section-${section}`).classList.add('active');
  document.getElementById('page-title').textContent = section.charAt(0).toUpperCase() + section.slice(1);
  document.getElementById('page-breadcrumb').textContent = `Home / ${section.charAt(0).toUpperCase() + section.slice(1)}`;

  if (section === 'students') renderStudentTable();
  if (section === 'reports') renderReports();
  if (section === 'analytics') initAnalytics();
  if (section === 'settings') updateSessionTime();
}

// ============================================================
// SIDEBAR TOGGLE
// ============================================================
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (window.innerWidth <= 900) {
    sb.classList.toggle('mobile-open');
    overlay.style.display = sb.classList.contains('mobile-open') ? 'block' : 'none';
  } else {
    sb.classList.toggle('collapsed');
  }
}

// ============================================================
// CLOCK
// ============================================================
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  const el = document.getElementById('rp-time');
  const de = document.getElementById('rp-date');
  if (el) el.textContent = `${h}:${m}:${s}`;
  if (de) de.textContent = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
}

// ============================================================
// DASHBOARD STATS
// ============================================================
function renderDashboardStats() {
  const today = getTodayKey();
  let present = 0, absent = 0, late = 0;
  Object.values(state.attendance).forEach(rec => {
    if (Object.keys(rec).length) {
      const dateKey = Object.keys(state.attendance).find(k => state.attendance[k] === rec);
      if (dateKey && dateKey.startsWith(today)) {
        Object.values(rec).forEach(status => {
          if (status === 'present') present++;
          else if (status === 'absent') absent++;
          else if (status === 'late') late++;
        });
      }
    }
  });

  // Aggregate from ALL today's class records
  present = 0; absent = 0; late = 0;
  CLASSES.forEach(cls => {
    const key = `${today}_${cls}`;
    const rec = state.attendance[key] || {};
    Object.values(rec).forEach(s => {
      if (s === 'present') present++;
      else if (s === 'absent') absent++;
      else if (s === 'late') late++;
    });
  });

  animateCounter('dash-total', state.students.length);
  animateCounter('dash-present', present);
  animateCounter('dash-absent', absent);
  animateCounter('dash-late', late);
  renderStudentBadge();

  // Circular progress
  const total = present + absent + late;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const circ = document.getElementById('circ-fill');
  const circumference = 2 * Math.PI * 32;
  if (circ) {
    circ.setAttribute('stroke-dasharray', circumference);
    circ.setAttribute('stroke-dashoffset', circumference - (pct / 100) * circumference);
  }
  const cpct = document.getElementById('circ-pct');
  if (cpct) cpct.textContent = pct + '%';

  const rpPresent = document.getElementById('rp-present');
  const rpAbsent = document.getElementById('rp-absent');
  const rpLate = document.getElementById('rp-late');
  if (rpPresent) rpPresent.textContent = present;
  if (rpAbsent) rpAbsent.textContent = absent;
  if (rpLate) rpLate.textContent = late;

  drawMiniSpark('spark-total', generateSparkData(state.students.length), '#00f5d4');
  drawMiniSpark('spark-present', generateSparkData(present), '#4ade80');
  drawMiniSpark('spark-absent', generateSparkData(absent), '#f87171');
  drawMiniSpark('spark-late', generateSparkData(late), '#facc15');
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const duration = 800;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.round(progress * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function generateSparkData(peak) {
  return Array.from({ length: 7 }, (_, i) => Math.max(0, peak * (0.5 + Math.random() * 0.5)));
}

function drawMiniSpark(id, data, color) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - (v / max) * (H - 4) }));
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, color + '80');
  grad.addColorStop(1, color);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

// ============================================================
// WEEKLY CHART (Canvas)
// ============================================================
function renderWeeklyChart() {
  const canvas = document.getElementById('weekly-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 600;
  canvas.width = W;
  const H = canvas.height;

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const presentData = [22, 25, 20, 28, 24, 18, 26];
  const absentData  = [8,  5,  10, 2,  6,  12, 4 ];

  ctx.clearRect(0, 0, W, H);
  const pad = { top: 20, bottom: 36, left: 36, right: 16 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxVal = 35;
  const barW = (chartW / days.length) * 0.35;
  const gap = (chartW / days.length);

  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.font = '10px DM Sans';
    ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), 2, y + 4);
  }

  days.forEach((day, i) => {
    const x = pad.left + gap * i + gap / 2;
    // Present bar
    const ph = (presentData[i] / maxVal) * chartH;
    const grad1 = ctx.createLinearGradient(0, pad.top + chartH - ph, 0, pad.top + chartH);
    grad1.addColorStop(0, '#00f5d4cc');
    grad1.addColorStop(1, '#00f5d420');
    ctx.fillStyle = grad1;
    ctx.beginPath();
    ctx.roundRect(x - barW - 2, pad.top + chartH - ph, barW, ph, [4, 4, 0, 0]);
    ctx.fill();

    // Absent bar
    const ah = (absentData[i] / maxVal) * chartH;
    const grad2 = ctx.createLinearGradient(0, pad.top + chartH - ah, 0, pad.top + chartH);
    grad2.addColorStop(0, '#f87171cc');
    grad2.addColorStop(1, '#f8717120');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.roundRect(x + 2, pad.top + chartH - ah, barW, ah, [4, 4, 0, 0]);
    ctx.fill();

    // Day label
    ctx.fillStyle = 'rgba(148,163,184,0.8)';
    ctx.font = '11px DM Sans';
    ctx.textAlign = 'center';
    ctx.fillText(day, x, H - 10);
  });
}

// ============================================================
// PIE CHART (Canvas)
// ============================================================
function renderPieChart() {
  const canvas = document.getElementById('pie-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 260;
  canvas.width = W;
  const H = canvas.height;

  const today = getTodayKey();
  let present = 0, absent = 0, late = 0;
  CLASSES.forEach(cls => {
    const rec = state.attendance[`${today}_${cls}`] || {};
    Object.values(rec).forEach(s => {
      if (s === 'present') present++;
      else if (s === 'absent') absent++;
      else if (s === 'late') late++;
    });
  });

  const total = present + absent + late || 1;
  const slices = [
    { label: 'Present', value: present || 0, color: '#00f5d4' },
    { label: 'Absent', value: absent || 0, color: '#f87171' },
    { label: 'Late', value: late || 0, color: '#facc15' },
    { label: 'Unmarked', value: Math.max(0, state.students.length - present - absent - late), color: '#334155' }
  ].filter(s => s.value > 0);

  const cx = W / 2, cy = H / 2 - 10, radius = Math.min(W, H) / 2 - 20;
  let startAngle = -Math.PI / 2;
  ctx.clearRect(0, 0, W, H);

  slices.forEach(slice => {
    const angle = (slice.value / (total + Math.max(0, state.students.length - total))) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    ctx.strokeStyle = '#080d1a';
    ctx.lineWidth = 2;
    ctx.stroke();
    startAngle += angle;
  });

  // Center hole
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = '#0d1426';
  ctx.fill();

  // Legend
  const legend = document.getElementById('pie-legend');
  if (legend) {
    legend.innerHTML = slices.map(s =>
      `<div class="pie-leg-row"><div class="pie-leg-dot" style="background:${s.color}"></div>${s.label}: <b>${s.value}</b></div>`
    ).join('');
  }
}

// ============================================================
// TODAY'S CLASSES
// ============================================================
function renderTodaysClasses() {
  const times = ['08:00 AM', '09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM'];
  const wrap = document.getElementById('today-classes-list');
  if (!wrap) return;
  wrap.innerHTML = CLASSES.map((cls, i) => `
    <div class="class-item">
      <div class="class-dot" style="background:${['#00f5d4','#7c3aed','#facc15','#f87171'][i]}"></div>
      <span>${cls}</span>
      <span class="class-time">${times[i % times.length]}</span>
    </div>
  `).join('');
}

// ============================================================
// RIGHT PANEL
// ============================================================
function renderRightPanel() {
  renderDashboardStats();
  renderMiniCalendar();
  renderActivityFeed();
  renderNotifList();
}

function renderActivityFeed() {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;
  const colors = ['#00f5d4', '#4ade80', '#facc15', '#f87171', '#7c3aed'];
  if (!state.activity.length) {
    feed.innerHTML = '<div style="color:var(--text3);font-size:0.8rem;text-align:center;padding:12px 0">No activity yet</div>';
    return;
  }
  feed.innerHTML = state.activity.slice(0, 8).map((a, i) => `
    <div class="activity-item">
      <div class="act-dot" style="background:${colors[i % colors.length]}"></div>
      <div>
        <div class="act-text">${a.text}</div>
        <div class="act-time">${a.time}</div>
      </div>
    </div>
  `).join('');
}

function renderNotifList() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (!state.notifications.length) {
    list.innerHTML = '<div style="color:var(--text3);font-size:0.8rem">No notifications</div>';
    return;
  }
  list.innerHTML = state.notifications.slice(0, 4).map(n => `
    <div class="notif-item">
      <p>${n.text}</p>
      <small>${n.time}</small>
    </div>
  `).join('');
}

// ============================================================
// MINI CALENDAR
// ============================================================
function renderMiniCalendar() {
  const wrap = document.getElementById('mini-calendar');
  if (!wrap) return;
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  let cells = '';
  let d = 1;
  for (let row = 0; row < 6; row++) {
    if (d > daysInMonth) break;
    for (let col = 0; col < 7; col++) {
      const cellNum = row * 7 + col;
      if (cellNum < firstDay || d > daysInMonth) {
        cells += `<div class="mc-day other-month">${cellNum < firstDay ? new Date(year, month, -(firstDay - cellNum - 1)).getDate() : ''}</div>`;
      } else {
        const isToday = d === now.getDate();
        cells += `<div class="mc-day${isToday ? ' today' : ''}">${d}</div>`;
        d++;
      }
    }
  }

  wrap.innerHTML = `
    <div class="mc-header"><span class="mc-title">${monthName}</span></div>
    <div class="mc-grid">
      ${dayLabels.map(l => `<div class="mc-day-header">${l}</div>`).join('')}
      ${cells}
    </div>
  `;
}

// ============================================================
// STUDENT MANAGEMENT
// ============================================================
function renderStudentBadge() {
  const badge = document.getElementById('student-count-badge');
  if (badge) badge.textContent = state.students.length;
}

function renderStudentTable() {
  const search = (document.getElementById('student-search')?.value || '').toLowerCase();
  const filterClass = document.getElementById('student-filter-class')?.value || '';
  let filtered = state.students.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search) || s.roll.toLowerCase().includes(search) || s.email.toLowerCase().includes(search);
    const matchClass = !filterClass || s.class === filterClass;
    return matchSearch && matchClass;
  });

  const total = filtered.length;
  const pages = Math.ceil(total / state.itemsPerPage);
  if (state.currentPage > pages) state.currentPage = 1;
  const start = (state.currentPage - 1) * state.itemsPerPage;
  const paginated = filtered.slice(start, start + state.itemsPerPage);

  const tbody = document.getElementById('student-tbody');
  if (!tbody) return;
  tbody.innerHTML = paginated.map(s => {
    const pct = s.attendance;
    const cls = pct >= 80 ? 'high' : pct >= 60 ? 'mid' : 'low';
    return `
      <tr>
        <td>${s.id}</td>
        <td><b>${s.name}</b></td>
        <td>${s.roll}</td>
        <td>${s.class}</td>
        <td>${s.department}</td>
        <td style="color:var(--text2)">${s.email}</td>
        <td><span class="att-pct ${cls}">${pct}%</span></td>
        <td>
          <div class="action-btns">
            <button class="icon-btn edit" onclick="editStudent('${s.id}')" title="Edit">
              <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </button>
            <button class="icon-btn del" onclick="deleteStudent('${s.id}')" title="Delete">
              <svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="8" style="text-align:center;color:var(--text2);padding:32px">No students found</td></tr>`;

  // Pagination
  const paginationEl = document.getElementById('student-pagination');
  if (!paginationEl) return;
  paginationEl.innerHTML = '';
  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === state.currentPage ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => { state.currentPage = i; renderStudentTable(); };
    paginationEl.appendChild(btn);
  }
}

function openStudentModal(id = null) {
  state.editingId = id;
  const modal = document.getElementById('student-modal');
  document.getElementById('modal-title').textContent = id ? 'Edit Student' : 'Add Student';
  document.getElementById('f-edit-id').value = id || '';
  if (id) {
    const s = state.students.find(s => s.id === id);
    if (s) {
      document.getElementById('f-name').value = s.name;
      document.getElementById('f-roll').value = s.roll;
      document.getElementById('f-class').value = s.class;
      document.getElementById('f-dept').value = s.department;
      document.getElementById('f-email').value = s.email;
    }
  } else {
    document.getElementById('f-name').value = '';
    document.getElementById('f-roll').value = '';
    document.getElementById('f-class').value = 'Class A';
    document.getElementById('f-dept').value = '';
    document.getElementById('f-email').value = '';
  }
  modal.classList.remove('hidden');
}

function closeStudentModal(event) {
  if (!event || event.target === document.getElementById('student-modal')) {
    document.getElementById('student-modal').classList.add('hidden');
  }
}

function saveStudent() {
  const name = document.getElementById('f-name').value.trim();
  const roll = document.getElementById('f-roll').value.trim();
  const cls = document.getElementById('f-class').value;
  const dept = document.getElementById('f-dept').value.trim();
  const email = document.getElementById('f-email').value.trim();

  if (!name || !roll) { showToast('Name and Roll Number are required', 'error'); return; }

  const editId = document.getElementById('f-edit-id').value;
  if (editId) {
    const idx = state.students.findIndex(s => s.id === editId);
    if (idx > -1) {
      state.students[idx] = { ...state.students[idx], name, roll, class: cls, department: dept || 'N/A', email };
      addActivity(`<b>${name}</b> record updated`);
      showToast('Student updated successfully', 'success');
    }
  } else {
    const newId = 'S' + String(state.students.length + 1).padStart(3, '0');
    state.students.push({ id: newId, name, roll, class: cls, department: dept || 'N/A', email, attendance: 100, createdAt: new Date().toISOString() });
    addActivity(`New student <b>${name}</b> added`);
    showToast('Student added successfully', 'success');
    state.notifications.unshift({ text: `New student ${name} enrolled`, time: 'just now', type: 'success' });
  }
  saveToStorage();
  closeStudentModal();
  renderStudentTable();
  renderStudentBadge();
  renderDashboardStats();
}

function editStudent(id) { openStudentModal(id); }

function deleteStudent(id) {
  const s = state.students.find(s => s.id === id);
  if (!s) return;
  if (!confirm(`Delete ${s.name}? This cannot be undone.`)) return;
  state.students = state.students.filter(s => s.id !== id);
  addActivity(`<b>${s.name}</b> removed`);
  saveToStorage();
  renderStudentTable();
  renderStudentBadge();
  renderDashboardStats();
  showToast('Student deleted', 'error');
}

// ============================================================
// ATTENDANCE MARKING
// ============================================================
function loadAttendanceStudents() {
  const cls = document.getElementById('att-class').value;
  const date = document.getElementById('att-date').value;
  const wrap = document.getElementById('att-table-wrap');
  if (!cls || !date) { wrap.classList.add('hidden'); return; }

  const students = state.students.filter(s => s.class === cls);
  const key = `${date}_${cls}`;
  const existing = state.attendance[key] || {};

  wrap.classList.remove('hidden');
  document.getElementById('att-table-title').textContent = `${cls} — ${formatDate(date)}`;

  const tbody = document.getElementById('att-tbody');
  tbody.innerHTML = students.map((s, i) => {
    const status = existing[s.id] || 'present';
    return `
      <tr id="att-row-${s.id}">
        <td>${i + 1}</td>
        <td><b>${s.name}</b></td>
        <td>${s.roll}</td>
        <td>
          <div class="att-status">
            <button class="status-btn present ${status === 'present' ? 'active' : ''}" onclick="setStatus('${s.id}','present')">✓ Present</button>
            <button class="status-btn absent ${status === 'absent' ? 'active' : ''}" onclick="setStatus('${s.id}','absent')">✗ Absent</button>
            <button class="status-btn late ${status === 'late' ? 'active' : ''}" onclick="setStatus('${s.id}','late')">⏰ Late</button>
          </div>
        </td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text2)">No students in ${cls}</td></tr>`;

  updateAttSummary();
}

function setStatus(studentId, status) {
  const cls = document.getElementById('att-class').value;
  const date = document.getElementById('att-date').value;
  const key = `${date}_${cls}`;
  if (!state.attendance[key]) state.attendance[key] = {};
  state.attendance[key][studentId] = status;

  const row = document.getElementById(`att-row-${studentId}`);
  if (row) {
    row.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active'));
    row.querySelector(`.status-btn.${status}`).classList.add('active');
  }
  updateAttSummary();
}

function markAllPresent() {
  const cls = document.getElementById('att-class').value;
  const date = document.getElementById('att-date').value;
  if (!cls || !date) { showToast('Please select class and date first', 'error'); return; }
  const key = `${date}_${cls}`;
  if (!state.attendance[key]) state.attendance[key] = {};
  const students = state.students.filter(s => s.class === cls);
  students.forEach(s => { state.attendance[key][s.id] = 'present'; });
  loadAttendanceStudents();
  showToast('All students marked present', 'success');
}

function updateAttSummary() {
  const cls = document.getElementById('att-class').value;
  const date = document.getElementById('att-date').value;
  const key = `${date}_${cls}`;
  const rec = state.attendance[key] || {};
  let p = 0, a = 0, l = 0;
  Object.values(rec).forEach(s => { if (s === 'present') p++; else if (s === 'absent') a++; else if (s === 'late') l++; });
  const el = document.getElementById('att-summary');
  if (el) el.innerHTML = `<span class="att-sum-item">Present: <span style="color:#4ade80">${p}</span></span><span class="att-sum-item">Absent: <span style="color:#f87171">${a}</span></span><span class="att-sum-item">Late: <span style="color:#facc15">${l}</span></span>`;
}

function saveAttendance() {
  const cls = document.getElementById('att-class').value;
  const date = document.getElementById('att-date').value;
  if (!cls || !date) { showToast('Select class and date first', 'error'); return; }
  const key = `${date}_${cls}`;
  if (!state.attendance[key] || !Object.keys(state.attendance[key]).length) {
    // Auto-mark all as present if nothing selected
    const students = state.students.filter(s => s.class === cls);
    if (!state.attendance[key]) state.attendance[key] = {};
    students.forEach(s => { if (!state.attendance[key][s.id]) state.attendance[key][s.id] = 'present'; });
  }

  // Update student attendance percentages
  updateStudentAttendancePcts();
  saveToStorage();
  addActivity(`Attendance saved for <b>${cls}</b> on ${formatDate(date)}`);
  renderDashboardStats();
  renderPieChart();
  showToast(`Attendance saved for ${cls}`, 'success');
}

function updateStudentAttendancePcts() {
  state.students.forEach(student => {
    let total = 0, present = 0;
    Object.entries(state.attendance).forEach(([key, rec]) => {
      if (key.includes(student.class) && rec[student.id]) {
        total++;
        if (rec[student.id] === 'present' || rec[student.id] === 'late') present++;
      }
    });
    if (total > 0) student.attendance = Math.round((present / total) * 100);
  });
}

// ============================================================
// REPORTS
// ============================================================
// Store last rendered records for export
let _lastReportRecords = [];
let _lastReportMeta = {};

function renderReports() {
  const type = document.getElementById('rep-type')?.value || 'daily';
  const date = document.getElementById('rep-date')?.value || getTodayKey();
  const cls = document.getElementById('rep-class')?.value || '';
  const search = (document.getElementById('rep-search')?.value || '').toLowerCase();
  const content = document.getElementById('reports-content');
  if (!content) return;

  let records = [];
  if (type === 'daily') {
    const keys = CLASSES.filter(c => !cls || c === cls).map(c => `${date}_${c}`);
    keys.forEach(key => {
      const rec = state.attendance[key];
      if (rec) {
        Object.entries(rec).forEach(([sid, status]) => {
          const s = state.students.find(st => st.id === sid);
          if (s && (!search || s.name.toLowerCase().includes(search) || s.roll.toLowerCase().includes(search))) {
            records.push({ name: s.name, roll: s.roll, class: s.class, department: s.department || 'N/A', status, date });
          }
        });
      }
    });
  } else if (type === 'weekly') {
    const weekDates = getWeekDates(date);
    weekDates.forEach(d => {
      CLASSES.filter(c => !cls || c === cls).forEach(c => {
        const rec = state.attendance[`${d}_${c}`];
        if (rec) {
          Object.entries(rec).forEach(([sid, status]) => {
            const s = state.students.find(st => st.id === sid);
            if (s && (!search || s.name.toLowerCase().includes(search) || s.roll.toLowerCase().includes(search))) {
              records.push({ name: s.name, roll: s.roll, class: s.class, department: s.department || 'N/A', status, date: d });
            }
          });
        }
      });
    });
  } else {
    const [yr, mo] = date.split('-').map(Number);
    const daysInMonth = new Date(yr, mo, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${yr}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      CLASSES.filter(c => !cls || c === cls).forEach(c => {
        const rec = state.attendance[`${dateStr}_${c}`];
        if (rec) {
          Object.entries(rec).forEach(([sid, status]) => {
            const s = state.students.find(st => st.id === sid);
            if (s && (!search || s.name.toLowerCase().includes(search) || s.roll.toLowerCase().includes(search))) {
              records.push({ name: s.name, roll: s.roll, class: s.class, department: s.department || 'N/A', status, date: dateStr });
            }
          });
        }
      });
    }
  }

  const totalRec = records.length;
  const presentRec = records.filter(r => r.status === 'present').length;
  const absentRec = records.filter(r => r.status === 'absent').length;
  const lateRec = records.filter(r => r.status === 'late').length;
  const pct = totalRec ? Math.round((presentRec / totalRec) * 100) : 0;
  const attendancePct = totalRec ? Math.round(((presentRec + lateRec) / totalRec) * 100) : 0;

  // Store for export
  _lastReportRecords = records;
  _lastReportMeta = { type, date, cls, totalRec, presentRec, absentRec, lateRec, pct, attendancePct };

  // Type label for display
  const typeLabels = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };
  const typeLabel = typeLabels[type] || type;

  // Period display
  let periodLabel = formatDate(date);
  if (type === 'weekly') {
    const wk = getWeekDates(date);
    periodLabel = `${formatDate(wk[0])} – ${formatDate(wk[6])}`;
  } else if (type === 'monthly') {
    const [yr, mo] = date.split('-');
    periodLabel = new Date(yr, mo - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // Per-student summary for monthly/weekly
  const studentSummary = {};
  records.forEach(r => {
    if (!studentSummary[r.roll]) studentSummary[r.roll] = { name: r.name, roll: r.roll, class: r.class, department: r.department, present: 0, absent: 0, late: 0, total: 0 };
    studentSummary[r.roll].total++;
    if (r.status === 'present') studentSummary[r.roll].present++;
    else if (r.status === 'absent') studentSummary[r.roll].absent++;
    else if (r.status === 'late') studentSummary[r.roll].late++;
  });
  const summaryRows = Object.values(studentSummary);

  const pctBar = (val) => `
    <div class="pct-bar-wrap">
      <div class="pct-bar-bg"><div class="pct-bar-fill" style="width:${val}%;background:${val >= 75 ? '#4ade80' : val >= 50 ? '#facc15' : '#f87171'}"></div></div>
      <span class="pct-bar-label">${val}%</span>
    </div>`;

  content.innerHTML = `
    <div class="professional-report" id="printable-report">
      <!-- REPORT HEADER -->
      <div class="rep-header">
        <div class="rep-header-left">
          <div class="rep-logo">
            <svg viewBox="0 0 48 48" fill="none" width="44" height="44"><circle cx="24" cy="24" r="22" stroke="url(#rg)" stroke-width="2.5"/><path d="M14 24l7 7 13-14" stroke="#00f5d4" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="rg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse"><stop stop-color="#00f5d4"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs></svg>
            <div>
              <div class="rep-logo-name">Attend<em>X</em></div>
              <div class="rep-logo-sub">Academic Attendance Intelligence</div>
            </div>
          </div>
        </div>
        <div class="rep-header-right">
          <div class="rep-title-badge">${typeLabel} Report</div>
          <div class="rep-meta-info">
            <div class="rep-meta-row"><span class="rep-meta-label">Period</span><span class="rep-meta-val">${periodLabel}</span></div>
            <div class="rep-meta-row"><span class="rep-meta-label">Class</span><span class="rep-meta-val">${cls || 'All Classes'}</span></div>
            <div class="rep-meta-row"><span class="rep-meta-label">Generated</span><span class="rep-meta-val">${new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span></div>
          </div>
        </div>
      </div>
      <div class="rep-divider"></div>

      <!-- SUMMARY CARDS -->
      <div class="rep-summary-row">
        <div class="rep-sum-card total">
          <div class="rep-sum-icon">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/></svg>
          </div>
          <div class="rep-sum-body">
            <div class="rep-sum-num">${totalRec}</div>
            <div class="rep-sum-label">Total Records</div>
          </div>
        </div>
        <div class="rep-sum-card present">
          <div class="rep-sum-icon">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" stroke-width="1.8"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="1.8"/></svg>
          </div>
          <div class="rep-sum-body">
            <div class="rep-sum-num">${presentRec}</div>
            <div class="rep-sum-label">Present</div>
          </div>
        </div>
        <div class="rep-sum-card absent">
          <div class="rep-sum-icon">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </div>
          <div class="rep-sum-body">
            <div class="rep-sum-num">${absentRec}</div>
            <div class="rep-sum-label">Absent</div>
          </div>
        </div>
        <div class="rep-sum-card late">
          <div class="rep-sum-icon">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </div>
          <div class="rep-sum-body">
            <div class="rep-sum-num">${lateRec}</div>
            <div class="rep-sum-label">Late</div>
          </div>
        </div>
        <div class="rep-sum-card rate">
          <div class="rep-sum-icon">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="rep-sum-body">
            <div class="rep-sum-num" style="color:${attendancePct >= 75 ? '#4ade80' : attendancePct >= 50 ? '#facc15' : '#f87171'}">${attendancePct}%</div>
            <div class="rep-sum-label">Attendance Rate</div>
          </div>
        </div>
      </div>

      <!-- OVERALL PROGRESS BAR -->
      <div class="rep-overall-bar">
        <div class="rep-bar-label">
          <span>Overall Attendance Rate</span>
          <span class="rep-bar-pct">${attendancePct}%</span>
        </div>
        <div class="rep-bar-track">
          <div class="rep-bar-fill present-fill" style="width:${(presentRec/Math.max(totalRec,1))*100}%"></div>
          <div class="rep-bar-fill late-fill" style="width:${(lateRec/Math.max(totalRec,1))*100}%;margin-left:${(presentRec/Math.max(totalRec,1))*100}%;position:absolute;left:0"></div>
        </div>
        <div class="rep-bar-legend">
          <span><i class="leg-dot" style="background:#4ade80"></i>Present (${presentRec})</span>
          <span><i class="leg-dot" style="background:#facc15"></i>Late (${lateRec})</span>
          <span><i class="leg-dot" style="background:#f87171"></i>Absent (${absentRec})</span>
        </div>
      </div>

      ${records.length ? `
      <!-- DETAILED TABLE -->
      ${type === 'daily' ? `
      <div class="rep-section-title">
        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="1.8"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="1.8"/></svg>
        Attendance Records
      </div>
      <div class="rep-table-wrap">
        <table class="rep-data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Roll No.</th>
              <th>Class</th>
              <th>Department</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${records.map((r, i) => `
              <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
                <td class="rep-serial">${i + 1}</td>
                <td class="rep-name">${r.name}</td>
                <td class="rep-roll">${r.roll}</td>
                <td>${r.class}</td>
                <td class="rep-dept">${r.department}</td>
                <td class="rep-date">${formatDate(r.date)}</td>
                <td><span class="rep-status-badge ${r.status}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="rep-total-row">
              <td colspan="5"><strong>TOTAL</strong></td>
              <td><strong>${totalRec} records</strong></td>
              <td><span class="rep-status-badge present">${presentRec}P</span> <span class="rep-status-badge absent">${absentRec}A</span> <span class="rep-status-badge late">${lateRec}L</span></td>
            </tr>
          </tfoot>
        </table>
      </div>
      ` : `
      <!-- STUDENT SUMMARY TABLE FOR WEEKLY/MONTHLY -->
      <div class="rep-section-title">
        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="1.8"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="1.8"/></svg>
        Student Summary
      </div>
      <div class="rep-table-wrap">
        <table class="rep-data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Roll No.</th>
              <th>Class</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
              <th>Total Days</th>
              <th>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            ${summaryRows.map((r, i) => {
              const spct = r.total ? Math.round(((r.present + r.late) / r.total) * 100) : 0;
              return `
                <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
                  <td class="rep-serial">${i + 1}</td>
                  <td class="rep-name">${r.name}</td>
                  <td class="rep-roll">${r.roll}</td>
                  <td>${r.class}</td>
                  <td class="rep-present-num">${r.present}</td>
                  <td class="rep-absent-num">${r.absent}</td>
                  <td class="rep-late-num">${r.late}</td>
                  <td>${r.total}</td>
                  <td>${pctBar(spct)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr class="rep-total-row">
              <td colspan="4"><strong>CLASS TOTALS</strong></td>
              <td><strong class="rep-present-num">${presentRec}</strong></td>
              <td><strong class="rep-absent-num">${absentRec}</strong></td>
              <td><strong class="rep-late-num">${lateRec}</strong></td>
              <td><strong>${totalRec}</strong></td>
              <td><strong style="color:${attendancePct>=75?'#4ade80':attendancePct>=50?'#facc15':'#f87171'}">${attendancePct}%</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      `}
      ` : `<div class="report-empty">
        <svg viewBox="0 0 24 24" fill="none" width="48" height="48" style="opacity:0.3"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="1.5"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <p>No attendance records found for the selected criteria.</p>
        <span>Try marking attendance in the Attendance section first.</span>
      </div>`}

      <!-- REPORT FOOTER -->
      <div class="rep-footer">
        <div class="rep-footer-left">
          <span>AttendX — Academic Attendance Intelligence</span>
        </div>
        <div class="rep-footer-right">
          <span>Generated: ${new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}</span>
          <span class="rep-footer-dot">•</span>
          <span>Total Records: ${totalRec}</span>
          <span class="rep-footer-dot">•</span>
          <span>Attendance Rate: ${attendancePct}%</span>
        </div>
      </div>
    </div>
  `;
}

function printReport() {
  navigate('reports');
  setTimeout(() => {
    const printContent = document.getElementById('printable-report');
    if (!printContent) { window.print(); return; }
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>AttendX Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a2e; font-size: 13px; }
  .professional-report { padding: 32px; max-width: 960px; margin: 0 auto; }
  .rep-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
  .rep-logo { display: flex; align-items: center; gap: 12px; }
  .rep-logo-name { font-size: 22px; font-weight: 800; color: #0f172a; }
  .rep-logo-name em { color: #7c3aed; font-style: normal; }
  .rep-logo-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
  .rep-title-badge { background: #7c3aed; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; display: inline-block; }
  .rep-meta-info { text-align: right; }
  .rep-meta-row { display: flex; gap: 8px; justify-content: flex-end; margin-bottom: 3px; font-size: 12px; }
  .rep-meta-label { color: #64748b; font-weight: 500; }
  .rep-meta-val { color: #1e293b; font-weight: 600; }
  .rep-divider { height: 2px; background: linear-gradient(90deg, #7c3aed, #00c9a7); border-radius: 1px; margin: 16px 0 20px; }
  .rep-summary-row { display: flex; gap: 12px; margin-bottom: 20px; }
  .rep-sum-card { flex: 1; display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-radius: 10px; border: 1px solid #e2e8f0; }
  .rep-sum-card.total { border-left: 4px solid #7c3aed; background: #faf5ff; }
  .rep-sum-card.present { border-left: 4px solid #22c55e; background: #f0fdf4; }
  .rep-sum-card.absent { border-left: 4px solid #ef4444; background: #fef2f2; }
  .rep-sum-card.late { border-left: 4px solid #f59e0b; background: #fffbeb; }
  .rep-sum-card.rate { border-left: 4px solid #3b82f6; background: #eff6ff; }
  .rep-sum-num { font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1; }
  .rep-sum-label { font-size: 10px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px; }
  .rep-overall-bar { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
  .rep-bar-label { display: flex; justify-content: space-between; font-size: 12px; color: #475569; font-weight: 500; margin-bottom: 8px; }
  .rep-bar-pct { font-weight: 800; color: #1e293b; font-size: 14px; }
  .rep-bar-track { height: 10px; background: #ef4444; border-radius: 5px; overflow: hidden; position: relative; }
  .rep-bar-fill.present-fill { height: 100%; background: #22c55e; position: absolute; left: 0; top: 0; border-radius: 5px; }
  .rep-bar-fill.late-fill { height: 100%; background: #f59e0b; position: absolute; top: 0; border-radius: 5px; }
  .rep-bar-legend { display: flex; gap: 16px; margin-top: 8px; font-size: 11px; color: #64748b; }
  .leg-dot { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 4px; }
  .rep-section-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
  .rep-data-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .rep-data-table thead tr { background: #1e1b4b; }
  .rep-data-table thead th { color: #fff; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .rep-data-table tbody tr.row-even { background: #fff; }
  .rep-data-table tbody tr.row-odd { background: #f8fafc; }
  .rep-data-table tbody tr:hover { background: #eef2ff; }
  .rep-data-table td { padding: 9px 12px; color: #374151; border-bottom: 1px solid #f1f5f9; }
  .rep-serial { color: #9ca3af; font-weight: 600; width: 36px; }
  .rep-name { font-weight: 700; color: #1e293b; }
  .rep-roll { font-family: monospace; color: #7c3aed; font-weight: 600; }
  .rep-dept { color: #64748b; font-size: 11px; }
  .rep-date { color: #64748b; font-size: 11px; }
  .rep-present-num { color: #16a34a; font-weight: 700; text-align: center; }
  .rep-absent-num { color: #dc2626; font-weight: 700; text-align: center; }
  .rep-late-num { color: #d97706; font-weight: 700; text-align: center; }
  .rep-status-badge { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
  .rep-status-badge.present { background: #dcfce7; color: #16a34a; }
  .rep-status-badge.absent { background: #fee2e2; color: #dc2626; }
  .rep-status-badge.late { background: #fef9c3; color: #b45309; }
  tfoot.rep-total-row td, .rep-total-row td { background: #1e1b4b; color: #fff; font-weight: 700; padding: 10px 12px; }
  .pct-bar-wrap { display: flex; align-items: center; gap: 8px; }
  .pct-bar-bg { flex: 1; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; }
  .pct-bar-fill { height: 100%; border-radius: 3px; }
  .pct-bar-label { font-size: 11px; font-weight: 700; width: 34px; text-align: right; color: #374151; }
  .rep-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
  .rep-footer-dot { margin: 0 6px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>${printContent.outerHTML}</body>
</html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  }, 300);
}

function exportReportCSV() {
  if (!_lastReportRecords.length) {
    showToast('No records to export. Generate a report first.', 'error');
    return;
  }
  const meta = _lastReportMeta;
  const headers = ['#', 'Name', 'Roll No.', 'Class', 'Department', 'Date', 'Status'];
  const rows = _lastReportRecords.map((r, i) => [
    i + 1, `"${r.name}"`, r.roll, r.class, `"${r.department}"`, r.date, r.status
  ]);
  // Add totals row
  rows.push([]);
  rows.push(['', 'TOTALS', '', '', '', `Records: ${meta.totalRec}`, `Present: ${meta.presentRec} | Absent: ${meta.absentRec} | Late: ${meta.lateRec} | Rate: ${meta.attendancePct}%`]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AttendX_Report_${meta.type}_${meta.date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Report exported as CSV', 'success');
}

function markAllAbsent() {
  const cls = document.getElementById('att-class').value;
  const date = document.getElementById('att-date').value;
  if (!cls || !date) { showToast('Please select class and date first', 'error'); return; }
  const key = `${date}_${cls}`;
  if (!state.attendance[key]) state.attendance[key] = {};
  const students = state.students.filter(s => s.class === cls);
  students.forEach(s => { state.attendance[key][s.id] = 'absent'; });
  loadAttendanceStudents();
  showToast('All students marked absent', 'warning');
}

function getWeekDates(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ============================================================
// ANALYTICS
// ============================================================
function initAnalytics() {
  renderMonthlyChart();
  renderClassChart();
  renderHeatmap();
  renderTopPerformers();
}

function renderMonthlyChart() {
  const canvas = document.getElementById('monthly-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 700;
  canvas.width = W;
  const H = canvas.height;

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const data = [72, 78, 65, 82, 88, 75, 70, 84, 91, 79, 86, 83];

  ctx.clearRect(0, 0, W, H);
  const pad = { top: 20, bottom: 36, left: 40, right: 16 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(148,163,184,0.6)'; ctx.font = '10px DM Sans';
    ctx.fillText((100 - i * 25) + '%', 2, y + 4);
  }

  // Area fill
  const pts = data.map((v, i) => ({
    x: pad.left + (i / (data.length - 1)) * chartW,
    y: pad.top + chartH - (v / 100) * chartH
  }));

  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grad.addColorStop(0, 'rgba(0,245,212,0.3)');
  grad.addColorStop(1, 'rgba(0,245,212,0.01)');

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pad.top + chartH);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length-1].x, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = '#00f5d4';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Dots
  pts.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00f5d4';
    ctx.fill();
    ctx.strokeStyle = '#0d1426';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(148,163,184,0.8)';
    ctx.font = '10px DM Sans'; ctx.textAlign = 'center';
    ctx.fillText(months[i], p.x, H - 10);
  });
}

function renderClassChart() {
  const canvas = document.getElementById('class-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 300;
  canvas.width = W;
  const H = canvas.height;
  const colors = ['#00f5d4', '#7c3aed', '#facc15', '#f87171'];

  const classData = CLASSES.map(cls => {
    let total = 0, present = 0;
    Object.entries(state.attendance).forEach(([key, rec]) => {
      if (key.includes(cls)) {
        Object.values(rec).forEach(s => { total++; if (s !== 'absent') present++; });
      }
    });
    return { cls, pct: total > 0 ? Math.round((present / total) * 100) : Math.floor(Math.random() * 30) + 70 };
  });

  ctx.clearRect(0, 0, W, H);
  const pad = { top: 20, bottom: 36, left: 36, right: 16 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const barW = (chartW / CLASSES.length) * 0.5;
  const gap = chartW / CLASSES.length;

  classData.forEach((d, i) => {
    const x = pad.left + gap * i + gap / 2;
    const h = (d.pct / 100) * chartH;
    const grad = ctx.createLinearGradient(0, pad.top + chartH - h, 0, pad.top + chartH);
    grad.addColorStop(0, colors[i] + 'ee');
    grad.addColorStop(1, colors[i] + '22');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x - barW/2, pad.top + chartH - h, barW, h, [6,6,0,0]);
    ctx.fill();
    ctx.fillStyle = colors[i];
    ctx.font = 'bold 11px DM Sans'; ctx.textAlign = 'center';
    ctx.fillText(d.pct + '%', x, pad.top + chartH - h - 6);
    ctx.fillStyle = 'rgba(148,163,184,0.8)';
    ctx.font = '11px DM Sans';
    ctx.fillText(d.cls, x, H - 10);
  });
}

function renderHeatmap() {
  const wrap = document.getElementById('heatmap-wrap');
  if (!wrap) return;
  const today = new Date();
  const cells = Array.from({ length: 56 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (55 - i));
    const dateStr = d.toISOString().split('T')[0];
    let count = 0;
    CLASSES.forEach(cls => {
      const rec = state.attendance[`${dateStr}_${cls}`] || {};
      count += Object.values(rec).filter(s => s === 'present').length;
    });
    return { date: dateStr, count };
  });

  const maxCount = Math.max(...cells.map(c => c.count), 1);
  const dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  wrap.innerHTML = `
    <div class="hm-label-row">${dayLabels.map(l => `<span>${l}</span>`).join('')}</div>
    <div class="heatmap">
      ${cells.map(cell => {
        const intensity = cell.count / maxCount;
        const alpha = cell.count > 0 ? 0.15 + intensity * 0.85 : 0.05;
        const color = `rgba(0,245,212,${alpha})`;
        return `<div class="hm-cell" style="background:${color}" title="${cell.date}: ${cell.count} present"></div>`;
      }).join('')}
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:0.7rem;color:var(--text3)">
      <span>Less</span>
      ${[0.05,0.25,0.5,0.75,1].map(a => `<div style="width:12px;height:12px;border-radius:3px;background:rgba(0,245,212,${a})"></div>`).join('')}
      <span>More</span>
    </div>
  `;
}

function renderTopPerformers() {
  const wrap = document.getElementById('top-performers');
  if (!wrap) return;
  const sorted = [...state.students].sort((a, b) => b.attendance - a.attendance).slice(0, 8);
  const rankClass = ['gold', 'silver', 'bronze'];
  wrap.innerHTML = sorted.map((s, i) => `
    <div class="performer-item">
      <div class="perf-rank ${rankClass[i] || ''}">${i + 1}</div>
      <div class="perf-bar-wrap">
        <div class="perf-name">${s.name}</div>
        <div class="perf-bar-bg"><div class="perf-bar-fill" style="width:${s.attendance}%"></div></div>
      </div>
      <div class="perf-pct">${s.attendance}%</div>
    </div>
  `).join('');
}

// ============================================================
// SETTINGS
// ============================================================
function setTheme(theme) {
  state.settings.theme = theme;
  document.body.classList.toggle('light-mode', theme === 'light');
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === theme);
  });
  saveToStorage();
  showToast(`${theme.charAt(0).toUpperCase() + theme.slice(1)} mode activated`, 'success');
}

function setAccent(color) {
  state.settings.accent = color;
  document.documentElement.style.setProperty('--accent', color);
  document.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('active', s.style.getPropertyValue('--c') === color);
  });
  saveToStorage();
  showToast('Accent color updated', 'success');
}

function applySettings() {
  if (state.settings.theme === 'light') document.body.classList.add('light-mode');
  if (state.settings.accent) document.documentElement.style.setProperty('--accent', state.settings.accent);
}

function updateSessionTime() {
  const sess = JSON.parse(localStorage.getItem('attendx_session') || '{}');
  const el = document.getElementById('sess-time');
  if (el && sess.time) {
    const mins = Math.round((Date.now() - sess.time) / 60000);
    el.textContent = mins < 1 ? 'Just now' : `${mins} min ago`;
  }
}

function resetAllData() {
  if (!confirm('This will delete ALL student and attendance data. Are you sure?')) return;
  state.students = generateDefaultStudents();
  state.attendance = {};
  state.activity = [];
  saveToStorage();
  renderDashboardStats();
  renderStudentBadge();
  showToast('All data has been reset', 'success');
}

// ============================================================
// SEARCH PALETTE
// ============================================================
function openSearch() {
  document.getElementById('search-palette').classList.remove('hidden');
  setTimeout(() => document.getElementById('sp-input')?.focus(), 50);
}

function closeSearch(event) {
  if (!event || event.target === document.getElementById('search-palette')) {
    document.getElementById('search-palette').classList.add('hidden');
    if (document.getElementById('sp-input')) document.getElementById('sp-input').value = '';
    document.getElementById('sp-results').innerHTML = '';
  }
}

function handleSearch(query) {
  const results = document.getElementById('sp-results');
  if (!query.trim()) { results.innerHTML = ''; return; }
  const q = query.toLowerCase();

  const pages = [
    { title: 'Dashboard', sub: 'Overview & stats', icon: '⊞', action: () => navigate('dashboard') },
    { title: 'Students', sub: 'Manage student records', icon: '👤', action: () => navigate('students') },
    { title: 'Attendance', sub: 'Mark attendance', icon: '✓', action: () => navigate('attendance') },
    { title: 'Reports', sub: 'View reports', icon: '📄', action: () => navigate('reports') },
    { title: 'Analytics', sub: 'Charts & insights', icon: '📊', action: () => navigate('analytics') },
    { title: 'Settings', sub: 'Configure system', icon: '⚙', action: () => navigate('settings') },
  ].filter(p => p.title.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q));

  const students = state.students
    .filter(s => s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q))
    .slice(0, 5)
    .map(s => ({
      title: s.name, sub: `${s.roll} • ${s.class}`, icon: s.name[0].toUpperCase(),
      action: () => { navigate('students'); closeSearch(); }
    }));

  const all = [...pages, ...students];
  results.innerHTML = all.length
    ? all.map((r, i) => `
      <div class="sp-result-item" onclick="(${r.action.toString()})();closeSearch()">
        <div class="sp-result-icon">${r.icon}</div>
        <div class="sp-result-text">
          <div class="sp-result-title">${r.title}</div>
          <div class="sp-result-sub">${r.sub}</div>
        </div>
      </div>`).join('')
    : '<div style="text-align:center;padding:24px;color:var(--text2);font-size:0.875rem">No results found</div>';
}

// ============================================================
// NOTIFICATIONS TOGGLE
// ============================================================
function toggleNotifs() {
  navigate('settings');
  showToast('Check the right panel for notifications', 'success');
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✗', warning: '⚠' };
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || '●'}</div>
    <span class="toast-msg">${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'none';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K — search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    // Cmd/Ctrl + 1-5 — navigate
    if ((e.metaKey || e.ctrlKey) && ['1','2','3','4','5'].includes(e.key)) {
      e.preventDefault();
      const sections = ['dashboard','students','attendance','reports','analytics'];
      navigate(sections[parseInt(e.key) - 1]);
    }
    // Escape
    if (e.key === 'Escape') {
      closeSearch();
      closeStudentModal();
    }
  });
}

// ============================================================
// WINDOW RESIZE
// ============================================================
window.addEventListener('resize', () => {
  if (state.currentSection === 'dashboard') {
    renderWeeklyChart();
    renderPieChart();
  }
  if (state.currentSection === 'analytics') {
    renderMonthlyChart();
    renderClassChart();
  }
});

// Expose global functions
window.togglePass = togglePass;
window.doLogin = doLogin;
window.doLogout = doLogout;
window.navigate = navigate;
window.toggleSidebar = toggleSidebar;
window.openStudentModal = openStudentModal;
window.closeStudentModal = closeStudentModal;
window.saveStudent = saveStudent;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.renderStudentTable = renderStudentTable;
window.loadAttendanceStudents = loadAttendanceStudents;
window.setStatus = setStatus;
window.markAllPresent = markAllPresent;
window.markAllAbsent = markAllAbsent;
window.saveAttendance = saveAttendance;
window.renderReports = renderReports;
window.printReport = printReport;
window.exportReportCSV = exportReportCSV;
window.setTheme = setTheme;
window.setAccent = setAccent;
window.resetAllData = resetAllData;
window.openSearch = openSearch;
window.closeSearch = closeSearch;
window.handleSearch = handleSearch;
window.toggleNotifs = toggleNotifs;