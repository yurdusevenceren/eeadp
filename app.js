/* =========================================
   EEADP - app.js
   Entegre E-Ticaret Analiz ve Destek Platformu
   ========================================= */

// ---- DEMO DATA ----
const DEMO_USER = { email: 'demo@eeadp.com', password: 'demo123', name: 'Demo Kullanıcı' };
let users = JSON.parse(localStorage.getItem('eeadp_users') || '[]');
let currentUser = JSON.parse(localStorage.getItem('eeadp_session') || 'null');

// =====================
//  AUTH
// =====================
function switchTab(tab) {
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab !== 'login');
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  const err   = document.getElementById('login-error');
  err.textContent = '';

  // Demo account
  if (email === DEMO_USER.email && pass === DEMO_USER.password) {
    loginSuccess(DEMO_USER);
    return;
  }
  // Registered users
  const user = users.find(u => u.email === email && u.password === pass);
  if (user) { loginSuccess(user); return; }

  err.textContent = 'E-posta veya şifre hatalı.';
}

function handleRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-password').value;
  const err   = document.getElementById('reg-error');
  err.textContent = '';

  if (pass.length < 6) { err.textContent = 'Şifre en az 6 karakter olmalıdır.'; return; }
  if (users.find(u => u.email === email) || email === DEMO_USER.email) {
    err.textContent = 'Bu e-posta zaten kayıtlı.'; return;
  }
  const newUser = { name, email, password: pass };
  users.push(newUser);
  localStorage.setItem('eeadp_users', JSON.stringify(users));
  loginSuccess(newUser);
}

function loginSuccess(user) {
  currentUser = user;
  localStorage.setItem('eeadp_session', JSON.stringify(user));
  document.getElementById('auth-overlay').classList.remove('active');
  document.getElementById('app').classList.remove('hidden');
  initApp(user);
}

function handleLogout() {
  localStorage.removeItem('eeadp_session');
  currentUser = null;
  document.getElementById('auth-overlay').classList.add('active');
  document.getElementById('app').classList.add('hidden');
}

// =====================
//  INIT APP
// =====================
function initApp(user) {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('user-avatar-top').textContent = initials;
  document.getElementById('user-info-sidebar').textContent = user.name;
  document.getElementById('welcome-heading').textContent = `Hoş Geldiniz, ${user.name.split(' ')[0]}! 👋`;
  buildMiniChart();
}

// =====================
//  NAVIGATION
// =====================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.getElementById('nav-' + id).classList.add('active');
  const titles = { dashboard:'Genel Bakış', price:'Fiyat Takibi', review:'Yorum Analizi', cargo:'Kargo Tahmini', size:'Beden Önerisi' };
  document.getElementById('page-title').textContent = titles[id] || '';
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const mc = document.querySelector('.main-content');
  sb.classList.toggle('collapsed');
  mc.classList.toggle('expanded');
}

// =====================
//  DASHBOARD MINI CHART
// =====================
function buildMiniChart() {
  const container = document.getElementById('mini-chart');
  if (!container) return;
  container.innerHTML = '';
  const vals = [60,75,55,80,70,90,65,88,72,95,80,100];
  const max = Math.max(...vals);
  vals.forEach(v => {
    const bar = document.createElement('div');
    bar.className = 'mini-bar';
    bar.style.height = (v / max * 100) + '%';
    container.appendChild(bar);
  });
}

// =====================
//  PRICE MODULE
// =====================
const priceHistory = {
  'trendyol': {
    name: 'Nike Air Max 270 Spor Ayakkabı',
    platform: 'Trendyol',
    current: 2499,
    old: 3299,
    dates: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
    prices: [3299,3299,3100,2999,2900,3099,2750,2600,2499,2499,2499,2499]
  },
  'hepsiburada': {
    name: 'Samsung 65" QLED 4K Smart TV',
    platform: 'Hepsiburada',
    current: 18499,
    old: 24999,
    dates: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
    prices: [24999,24500,23000,21000,20500,19999,19000,18999,18499,18499,18499,18499]
  },
  'amazon': {
    name: 'Apple iPhone 15 Pro Max 256GB',
    platform: 'Amazon TR',
    current: 52499,
    old: 59999,
    dates: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
    prices: [59999,59000,57500,56000,55000,54000,53500,53000,52499,52499,52499,52499]
  }
};

function analyzePriceURL() {
  const url = document.getElementById('price-url').value.trim();
  if (!url) { alert('Lütfen bir ürün linki girin.'); return; }

  let data;
  if (url.toLowerCase().includes('hepsiburada')) data = priceHistory.hepsiburada;
  else if (url.toLowerCase().includes('amazon')) data = priceHistory.amazon;
  else data = priceHistory.trendyol;

  document.getElementById('price-product-name').textContent = data.name;
  document.getElementById('price-platform').textContent = data.platform;
  document.getElementById('price-current').textContent = '₺' + data.current.toLocaleString('tr-TR');
  document.getElementById('price-old').textContent = '₺' + data.old.toLocaleString('tr-TR');

  const hoursLeft = Math.floor(Math.random() * 20) + 4;
  document.getElementById('price-protection-text').textContent =
    `Bu fiyat ${hoursLeft} saat boyunca korunmaktadır.`;

  drawPriceChart(data);
  buildPriceAlerts(data);

  document.getElementById('price-result').classList.remove('hidden');
}

function drawPriceChart(data) {
  const canvas = document.getElementById('price-chart');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const min = Math.min(...data.prices) * 0.95;
  const max = Math.max(...data.prices) * 1.02;
  const pad = { top:10, right:20, bottom:30, left:60 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const toX = i => pad.left + (i / (data.prices.length-1)) * cw;
  const toY = v => pad.top + ch - ((v - min) / (max - min)) * ch;

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i=0; i<=4; i++) {
    const y = pad.top + (ch/4)*i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W-pad.right, y); ctx.stroke();
  }

  // Area fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, H);
  grad.addColorStop(0, 'rgba(108,99,255,0.35)');
  grad.addColorStop(1, 'rgba(108,99,255,0)');
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(data.prices[0]));
  data.prices.forEach((v,i) => ctx.lineTo(toX(i), toY(v)));
  ctx.lineTo(toX(data.prices.length-1), H-pad.bottom);
  ctx.lineTo(toX(0), H-pad.bottom);
  ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(data.prices[0]));
  data.prices.forEach((v,i) => ctx.lineTo(toX(i), toY(v)));
  ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round'; ctx.stroke();

  // Labels (X axis)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px Inter';
  ctx.textAlign = 'center';
  data.dates.forEach((d,i) => ctx.fillText(d, toX(i), H-8));

  // Current price marker
  const last = data.prices.length-1;
  ctx.beginPath();
  ctx.arc(toX(last), toY(data.prices[last]), 5, 0, Math.PI*2);
  ctx.fillStyle = '#43e97b'; ctx.fill();
}

function buildPriceAlerts(data) {
  const container = document.getElementById('price-alerts-list');
  const discount = Math.round((1 - data.current/data.old)*100);
  const alerts = [
    { icon:'🎉', text:`Fiyat ${discount}% düştü! Başlangıç fiyatına göre ₺${(data.old-data.current).toLocaleString('tr-TR')} tasarruf.`, badge:'badge-green', badgeText:'İndirim' },
    { icon:'📉', text:`Son 30 gün içinde en düşük fiyata ulaştı.`, badge:'badge-orange', badgeText:'Dikkat' },
    { icon:'🔔', text:`Fiyat hedefi: ₺${Math.round(data.current*0.9).toLocaleString('tr-TR')} altına düşünce bildirim alacaksınız.`, badge:'', badgeText:'' },
  ];
  container.innerHTML = alerts.map(a => `
    <div class="price-alert-item">
      <span style="font-size:20px">${a.icon}</span>
      <span style="flex:1;font-size:13px">${a.text}</span>
      ${a.badge ? `<span class="badge ${a.badge}">${a.badgeText}</span>` : ''}
    </div>
  `).join('');
}

// =====================
//  REVIEW MODULE
// =====================
const sampleReviewData = [
  { author:'Mehmet K.', stars:5, text:'Ürün tam istediğim gibi. Kalitesi çok iyi, kesinlikle tavsiye ederim.', score:92, verdict:'Güvenilir' },
  { author:'Kullanıcı12345', stars:1, text:'SÜPER ÜRÜN!! BU MARKA EN İYİ!! HERKESE ÖNERİRİM!! ALMAYAN KAYIBEDIR!!', score:18, verdict:'Şüpheli' },
  { author:'Ayşe T.', stars:4, text:'Genel olarak memnunum, kargo biraz geç geldi ama ürün güzel.', score:85, verdict:'Güvenilir' },
  { author:'Sadık kullanıcı', stars:5, text:'Dün aldım, henüz kullanmadım ama çok güzel, herkese öneririm mükemmel.', score:31, verdict:'Şüpheli' },
];

function analyzeReview() {
  const text = document.getElementById('review-text').value.trim();
  const url  = document.getElementById('review-url').value.trim();

  if (!text && !url) { alert('Lütfen bir yorum metni veya ürün linki girin.'); return; }

  let score, verdict, color, details;

  if (text) {
    score = calculateReviewScore(text);
  } else {
    score = Math.floor(Math.random() * 40) + 55;
  }

  if (score >= 75) { verdict = '✅ Güvenilir Yorum'; color = '#43e97b'; }
  else if (score >= 50) { verdict = '⚠️ Kısmen Güvenilir'; color = '#f7971e'; }
  else { verdict = '🚨 Şüpheli / Sahte'; color = '#ff6584'; }

  details = getReviewDetails(text || 'url-analizi', score);

  // Update score arc
  const offset = 314 - (score/100)*314;
  document.getElementById('score-arc').style.strokeDashoffset = offset;
  document.getElementById('review-score').textContent = score + '%';
  document.getElementById('review-verdict').textContent = verdict;
  document.getElementById('review-verdict').style.color = color;

  // Details
  document.getElementById('review-details').innerHTML = details.map(d => `
    <div class="review-detail-item">
      <span>${d.label}</span>
      <span class="badge ${d.ok ? 'badge-green' : 'badge-red'}">${d.value}</span>
    </div>
  `).join('');

  // Sample reviews
  document.getElementById('sample-reviews').innerHTML = sampleReviewData.map(r => {
    const sc = r.score;
    const col = sc >= 75 ? '#43e97b' : sc >= 50 ? '#f7971e' : '#ff6584';
    return `
      <div class="sample-review" style="border-color:${col}">
        <div class="sample-review-header">
          <strong style="font-size:13px">${r.author}</strong>
          <div style="display:flex;align-items:center;gap:10px">
            <span>${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</span>
            <span class="badge" style="background:${col}22;color:${col};border:1px solid ${col}44">
              Güven: ${r.score}%
            </span>
          </div>
        </div>
        <p class="sample-review-text">"${r.text}"</p>
      </div>
    `;
  }).join('');

  document.getElementById('review-result').classList.remove('hidden');
}

function calculateReviewScore(text) {
  let score = 70;
  const upper = (text.match(/[A-ZÜÖÇŞİĞ]/g)||[]).length;
  const ratio = upper / text.length;
  if (ratio > 0.3) score -= 25;
  const exclamation = (text.match(/!/g)||[]).length;
  if (exclamation > 2) score -= 15;
  if (text.length < 30) score -= 10;
  if (text.length > 100) score += 10;
  const suspicious = ['mükemmel','şahane','dünyanın en','kesinlikle alın','hayatımın en'];
  suspicious.forEach(w => { if (text.toLowerCase().includes(w)) score -= 8; });
  return Math.max(5, Math.min(99, score));
}

function getReviewDetails(text, score) {
  return [
    { label:'Dil Doğallığı', ok: score > 60, value: score > 60 ? 'Normal' : 'Şüpheli' },
    { label:'Yazım Kalitesi', ok: score > 50, value: score > 50 ? 'İyi' : 'Düşük' },
    { label:'Aşırı Övgü', ok: score > 65, value: score > 65 ? 'Yok' : 'Tespit Edildi' },
    { label:'Hesap Güvenilirliği', ok: score > 55, value: score > 55 ? 'Güvenilir' : 'Yeni/Şüpheli' },
    { label:'İçerik Özgünlüğü', ok: score > 70, value: score > 70 ? 'Özgün' : 'Kopyalanmış Olabilir' },
    { label:'Genel Değerlendirme', ok: score >= 75, value: score >= 75 ? 'Güvenilir' : score >= 50 ? 'Nötr' : 'Sahte Olabilir' },
  ];
}

// =====================
//  CARGO MODULE
// =====================
function analyzeCargo() {
  const code = document.getElementById('cargo-code').value.trim();
  const company = document.getElementById('cargo-company').value;
  if (!code) { alert('Lütfen takip numarası girin.'); return; }

  const companyNames = { aras:'Aras Kargo', yurtici:'Yurtiçi Kargo', mng:'MNG Kargo', ptt:'PTT Kargo', ups:'UPS' };
  const hours = ['09:00 – 12:00','12:00 – 15:00','14:00 – 17:00','16:00 – 19:00','10:00 – 13:00'];
  const timeRange = hours[Math.floor(Math.random() * hours.length)];
  const confidence = Math.floor(Math.random()*20)+75;

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  const fmt = d => d.toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'});

  document.getElementById('cargo-time-range').textContent = timeRange;
  document.getElementById('cargo-date-label').textContent = fmt(tomorrow) + ' – ' + companyNames[company];
  document.getElementById('cargo-confidence').style.width = confidence + '%';
  document.getElementById('cargo-confidence-num').textContent = confidence + '%';

  const timeline = [
    { title:'Sipariş Alındı', date: '14 May 2026, 09:30', done:true },
    { title:'Kargo Hazırlandı', date: '14 May 2026, 14:15', done:true },
    { title:'Kargoya Verildi', date: '15 May 2026, 08:00', done:true },
    { title:'Transfer Merkezinde', date: '15 May 2026, 18:30', done:true },
    { title:'Dağıtıma Çıktı', date: fmt(tomorrow) + ', 08:00', done:false },
    { title:'Teslim Edildi', date: 'Bekleniyor: ' + timeRange, done:false },
  ];

  document.getElementById('cargo-timeline').innerHTML = timeline.map(t => `
    <div class="timeline-item">
      <div class="timeline-dot" style="background:${t.done ? '#43e97b' : '#3a3a5c'}; box-shadow:${t.done ? '0 0 8px #43e97b88' : 'none'}"></div>
      <div class="timeline-content">
        <div class="timeline-title" style="color:${t.done ? 'var(--text)' : 'var(--muted)'}">${t.title}</div>
        <div class="timeline-date">${t.date}</div>
      </div>
    </div>
  `).join('');

  document.getElementById('cargo-result').classList.remove('hidden');
}

// =====================
//  SIZE MODULE
// =====================
const brandData = {
  shirt: [
    { brand:'Zara', sizes:{'XS':[80,84],'S':[84,88],'M':[88,92],'L':[92,96],'XL':[96,100],'XXL':[100,108]} },
    { brand:'H&M', sizes:{'XS':[78,82],'S':[82,86],'M':[86,90],'L':[90,94],'XL':[94,100],'XXL':[100,110]} },
    { brand:'Mango', sizes:{'XS':[80,84],'S':[84,88],'M':[88,93],'L':[93,98],'XL':[98,104],'XXL':[104,112]} },
    { brand:'Koton', sizes:{'XS':[80,84],'S':[84,88],'M':[88,92],'L':[92,97],'XL':[97,102],'XXL':[102,110]} },
    { brand:'LCW', sizes:{'XS':[78,83],'S':[83,87],'M':[87,92],'L':[92,97],'XL':[97,103],'XXL':[103,112]} },
  ],
  pants: [
    { brand:'Zara', sizes:{'XS':[60,65],'S':[65,70],'M':[70,75],'L':[75,80],'XL':[80,86],'XXL':[86,94]} },
    { brand:'H&M', sizes:{'XS':[58,63],'S':[63,68],'M':[68,73],'L':[73,79],'XL':[79,85],'XXL':[85,93]} },
    { brand:'Mango', sizes:{'XS':[60,65],'S':[65,70],'M':[70,76],'L':[76,82],'XL':[82,88],'XXL':[88,96]} },
    { brand:'Koton', sizes:{'XS':[60,64],'S':[64,69],'M':[69,74],'L':[74,80],'XL':[80,86],'XXL':[86,94]} },
    { brand:'LCW', sizes:{'XS':[58,63],'S':[63,68],'M':[68,74],'L':[74,80],'XL':[80,87],'XXL':[87,95]} },
  ],
  dress: [
    { brand:'Zara', sizes:{'XS':[80,84],'S':[84,88],'M':[88,93],'L':[93,98],'XL':[98,104],'XXL':[104,112]} },
    { brand:'H&M', sizes:{'XS':[78,82],'S':[82,86],'M':[86,91],'L':[91,96],'XL':[96,102],'XXL':[102,110]} },
    { brand:'Mango', sizes:{'XS':[80,84],'S':[84,89],'M':[89,94],'L':[94,99],'XL':[99,105],'XXL':[105,113]} },
    { brand:'Koton', sizes:{'XS':[80,84],'S':[84,88],'M':[88,93],'L':[93,98],'XL':[98,104],'XXL':[104,112]} },
    { brand:'LCW', sizes:{'XS':[78,83],'S':[83,88],'M':[88,93],'L':[93,99],'XL':[99,105],'XXL':[105,113]} },
  ],
  jacket: [
    { brand:'Zara', sizes:{'XS':[82,86],'S':[86,90],'M':[90,95],'L':[95,100],'XL':[100,106],'XXL':[106,114]} },
    { brand:'H&M', sizes:{'XS':[80,84],'S':[84,88],'M':[88,93],'L':[93,98],'XL':[98,104],'XXL':[104,112]} },
    { brand:'Mango', sizes:{'XS':[82,86],'S':[86,91],'M':[91,96],'L':[96,101],'XL':[101,107],'XXL':[107,115]} },
    { brand:'Koton', sizes:{'XS':[82,86],'S':[86,90],'M':[90,95],'L':[95,100],'XL':[100,106],'XXL':[106,114]} },
    { brand:'LCW', sizes:{'XS':[80,85],'S':[85,90],'M':[90,95],'L':[95,101],'XL':[101,107],'XXL':[107,115]} },
  ],
};

function analyzeSize() {
  const chest  = parseFloat(document.getElementById('chest').value);
  const waist  = parseFloat(document.getElementById('waist').value);
  const hip    = parseFloat(document.getElementById('hip').value);
  const cat    = document.getElementById('category').value;

  if (!chest && !waist && !hip) { alert('Lütfen en az bir ölçü girin.'); return; }
  const measure = cat === 'pants' ? (waist || chest) : (chest || waist);

  const brands = brandData[cat] || brandData.shirt;
  let html = '';

  brands.forEach(b => {
    let bestSize = 'S', bestFit = 0;
    Object.entries(b.sizes).forEach(([sz, [lo, hi]]) => {
      const mid = (lo+hi)/2;
      const range = hi - lo;
      const dist = Math.abs(measure - mid);
      const fit = Math.max(0, Math.round(100 - (dist/range)*80));
      if (fit > bestFit) { bestFit = fit; bestSize = sz; }
    });

    const fitColor = bestFit >= 80 ? '#43e97b' : bestFit >= 60 ? '#f7971e' : '#ff6584';
    html += `
      <div class="brand-size-item">
        <div class="brand-name">${b.brand}</div>
        <div class="size-badge">${bestSize}</div>
        <div class="fit-bar-wrap">
          <div class="fit-bar-label">
            <span>Uyum Oranı</span>
            <span style="color:${fitColor};font-weight:700">${bestFit}%</span>
          </div>
          <div class="fit-bar">
            <div class="fit-fill" style="width:${bestFit}%;background:${fitColor}"></div>
          </div>
        </div>
      </div>
    `;
  });

  document.getElementById('size-brands').innerHTML = html;
  document.getElementById('size-result').classList.remove('hidden');
}

// =====================
//  BOOT
// =====================
window.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    document.getElementById('auth-overlay').classList.remove('active');
    document.getElementById('app').classList.remove('hidden');
    initApp(currentUser);
  }
});
