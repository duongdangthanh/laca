// ===== Laca Team Web App — PROTOTYPE (mockup, không có API/backend thật) =====
// Toàn bộ dữ liệu tới từ data.js. File này chỉ xử lý routing + render bằng
// vanilla JS (hash router) + Tailwind (qua CDN) cho phần trình bày.

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const AUTH_KEY = 'laca_proto_auth_v1'

const state = {
  user: null, // member object (tham chiếu MEMBERS) hoặc null nếu là guest
  notifications: [],
  loadTimer: null,
  membersFilter: { q: '', gender: '', level: '' },
  eventsFilter: { type: '', status: '' },
  resultsFilter: { format: '', eventId: '' },
  leaderboardFilter: { gender: '', format: '' }
}

const MEMBER_ONLY_ROUTES = new Set([
  'dashboard',
  'profile',
  'rating',
  'my-matches',
  'my-events',
  'achievements',
  'submit-result',
  'pending',
  'notifications',
  'settings'
])

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fmtDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtDateTime(iso) {
  const d = new Date(iso)
  return `${fmtDate(iso)} · ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
}
function fmtTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function initials(name) {
  const parts = String(name).trim().split(/\s+/)
  return parts[parts.length - 1].slice(0, 1).toUpperCase()
}
// Ảnh demo dùng tạm cho avatar — chưa có ảnh thật từng thành viên nên lấy
// vòng vòng trong ảnh có sẵn ở assets/ (không cần đúng là ảnh của người đó,
// chỉ để bản demo lúc nào cũng có hình thay vì để trống).
const AVATAR_PHOTO_POOL = [
  '../assets/gallery-smash.jpg',
  '../assets/about-season1.jpg',
  '../assets/hero-bg.jpg',
  '../assets/gallery-court.jpg',
  '../assets/gallery-paddle.jpg',
  '../assets/gallery-crowd.jpg'
]
function pickFromString(str, pool) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return pool[Math.abs(hash) % pool.length]
}
function avatarHTML(member, size) {
  size = size || 40
  const photo = pickFromString(member.id, AVATAR_PHOTO_POOL)
  return `<span class="inline-flex items-center justify-center rounded-full overflow-hidden shrink-0" style="width:${size}px;height:${size}px;background:#EFEAEC">
      <img src="${photo}" alt="${escapeHtml(member.displayName)}" class="w-full h-full object-cover" />
    </span>`
}

function levelBadgeHTML(level) {
  const map = {
    'Mới bắt đầu': 'bg-slate-100 text-slate-600',
    'Phong trào': 'bg-slate-200 text-slate-700',
    'Trung cấp': 'bg-amber-100 text-amber-700',
    'Nâng cao': 'bg-brand-100 text-brand-700'
  }
  return `<span class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${map[level] || 'bg-slate-100 text-slate-600'}">${escapeHtml(level)}</span>`
}

function genderIcon(gender) {
  return gender === 'female' ? '♀' : '♂'
}

const EVENT_STATUS_STYLE = {
  draft: 'bg-slate-100 text-slate-500',
  published: 'bg-slate-200 text-slate-700',
  registration_open: 'bg-emerald-100 text-emerald-700',
  registration_closed: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-brand-100 text-brand-700',
  completed: 'bg-slate-200 text-slate-600',
  cancelled: 'bg-rose-100 text-rose-600'
}
function eventStatusBadge(status) {
  return `<span class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${EVENT_STATUS_STYLE[status]}">${escapeHtml(EVENT_STATUS_LABELS[status])}</span>`
}

const MATCH_STATUS_STYLE = {
  draft: 'bg-slate-100 text-slate-500',
  submitted: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-slate-200 text-slate-700',
  disputed: 'bg-rose-100 text-rose-600',
  rated: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-200 text-slate-500'
}
function matchStatusBadge(status) {
  return `<span class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${MATCH_STATUS_STYLE[status]}">${escapeHtml(MATCH_STATUS_LABELS[status])}</span>`
}

function rankChangeHTML(change) {
  if (!change) return `<span class="text-slate-400 text-xs">— 0</span>`
  if (change > 0) return `<span class="text-emerald-600 text-xs font-semibold">▲ ${change}</span>`
  return `<span class="text-rose-500 text-xs font-semibold">▼ ${Math.abs(change)}</span>`
}

function sparklineSVG(points, opts) {
  opts = opts || {}
  const w = opts.width || 320
  const h = opts.height || 90
  const pad = 8
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const stepX = (w - pad * 2) / (points.length - 1)
  const coords = points.map((p, i) => {
    const x = pad + i * stepX
    const y = h - pad - ((p - min) / range) * (h - pad * 2)
    return [x, y]
  })
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c[0].toFixed(1)},${c[1].toFixed(1)}`).join(' ')
  const areaPath = `${path} L${coords[coords.length - 1][0].toFixed(1)},${h} L${coords[0][0].toFixed(1)},${h} Z`
  const last = coords[coords.length - 1]
  return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <path d="${areaPath}" fill="rgba(241,16,91,0.12)" stroke="none"></path>
      <path d="${path}" fill="none" stroke="#F1105B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
      <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="4" fill="#F1105B"></circle>
    </svg>`
}

function emptyState(icon, title, desc, actionHTML) {
  return `<div class="text-center py-14 px-6 border border-dashed border-slate-300 rounded-2xl bg-white">
      <div class="text-4xl mb-3">${icon}</div>
      <h3 class="font-display font-bold text-slate-700 mb-1">${escapeHtml(title)}</h3>
      <p class="text-sm text-slate-500 max-w-sm mx-auto">${escapeHtml(desc)}</p>
      ${actionHTML ? `<div class="mt-4">${actionHTML}</div>` : ''}
    </div>`
}

function skeletonBlock(h) {
  return `<div class="skeleton rounded-xl" style="height:${h || 16}px"></div>`
}

function sectionHead(kicker, title, sub) {
  return `<div class="max-w-2xl mx-auto text-center mb-8 md:mb-10">
      <span class="inline-block text-xs font-bold tracking-widest uppercase text-brand-600 mb-2">${escapeHtml(kicker)}</span>
      <h2 class="font-display text-2xl md:text-3xl font-extrabold text-slate-900">${title}</h2>
      ${sub ? `<p class="text-slate-500 mt-2">${sub}</p>` : ''}
    </div>`
}

function toast(msg, kind) {
  const el = document.getElementById('toast')
  if (!el) return
  el.textContent = msg
  el.className = `toast is-visible${kind ? ' is-' + kind : ''}`
  el.hidden = false
  clearTimeout(state.toastTimer)
  state.toastTimer = setTimeout(() => {
    el.classList.remove('is-visible')
  }, 2600)
}

function openLightbox(src, caption) {
  const box = document.getElementById('lightbox')
  const img = document.getElementById('lightboxImg')
  const cap = document.getElementById('lightboxCaption')
  img.src = src
  img.alt = caption || ''
  cap.textContent = caption || ''
  box.hidden = false
  document.body.style.overflow = 'hidden'
}
function closeLightbox() {
  const box = document.getElementById('lightbox')
  box.hidden = true
  document.body.style.overflow = ''
}

// ---------------------------------------------------------------------------
// Auth (mock)
// ---------------------------------------------------------------------------
function loadAuth() {
  try {
    const id = localStorage.getItem(AUTH_KEY)
    if (id && memberById(id)) return memberById(id)
  } catch (_e) {
    /* ignore */
  }
  return null
}
function login(memberId) {
  state.user = memberById(memberId)
  state.notifications = buildNotificationsFor(memberId)
  try {
    localStorage.setItem(AUTH_KEY, memberId)
  } catch (_e) {
    /* ignore */
  }
}
function logout() {
  state.user = null
  state.notifications = []
  try {
    localStorage.removeItem(AUTH_KEY)
  } catch (_e) {
    /* ignore */
  }
}
function unreadCount() {
  return state.notifications.filter(n => !n.read).length
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
function parseHash() {
  const raw = (location.hash || '#/home').replace(/^#\/?/, '')
  const segs = raw.split('/').filter(Boolean)
  return { route: segs[0] || 'home', id: segs[1] || null }
}
function navigate(hash) {
  location.hash = hash
}

function render() {
  const { route, id } = parseHash()
  renderNav(route)
  renderFooter()
  const appEl = document.getElementById('app')

  if (MEMBER_ONLY_ROUTES.has(route) && !state.user) {
    appEl.innerHTML = viewLoginRequired(route)
    window.scrollTo(0, 0)
    return
  }

  appEl.innerHTML = skeletonForRoute(route)
  clearTimeout(state.loadTimer)
  state.loadTimer = setTimeout(() => {
    let html = ''
    try {
      html = viewFor(route, id)
    } catch (err) {
      console.error(err)
      html = emptyState('⚠️', 'Không hiển thị được trang này', 'Đã có lỗi xảy ra khi dựng giao diện (đây là bản mockup).')
    }
    appEl.innerHTML = `<div class="view-enter">${html}</div>`
    window.scrollTo(0, 0)
    afterRender(route, id)
  }, 200)
}

// Một số view cần khởi tạo thêm sau khi HTML đã gắn vào DOM (đổ danh sách lọc
// được, khởi tạo wizard nhiều bước...).
function afterRender(route) {
  if (route === 'members') renderMembersGrid()
  if (route === 'events') renderEventsGrid()
  if (route === 'results') renderResultsList()
  if (route === 'submit-result') initSubmitResultWizard()
}

function skeletonForRoute() {
  return `<div class="max-w-6xl mx-auto px-4 py-10 space-y-4">
      ${skeletonBlock(160)}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${skeletonBlock(120)}${skeletonBlock(120)}${skeletonBlock(120)}
      </div>
      ${skeletonBlock(220)}
    </div>`
}

function viewFor(route, id) {
  switch (route) {
    case 'home':
      return viewHome()
    case 'about':
      return viewAbout()
    case 'members':
      return viewMembers()
    case 'member':
      return viewMemberProfile(id)
    case 'leaderboard':
      return viewLeaderboard()
    case 'events':
      return viewEvents()
    case 'event':
      return viewEventDetail(id)
    case 'results':
      return viewResults()
    case 'gallery':
      return viewGallery()
    case 'news':
      return id ? viewNewsDetail(id) : viewNewsList()
    case 'contact':
      return viewContact()
    case 'login':
      return viewLogin()
    case 'dashboard':
      return viewDashboard()
    case 'profile':
      return viewProfileEdit()
    case 'rating':
      return viewRating()
    case 'my-matches':
      return viewMyMatches()
    case 'my-events':
      return viewMyEvents()
    case 'achievements':
      return viewAchievements()
    case 'submit-result':
      return viewSubmitResult()
    case 'pending':
      return viewPendingConfirmations()
    case 'notifications':
      return viewNotifications()
    case 'settings':
      return viewSettings()
    default:
      return view404()
  }
}

function view404() {
  return `<div class="max-w-3xl mx-auto px-4 py-20">${emptyState('🧭', 'Không tìm thấy trang', 'Đường dẫn này không tồn tại trong bản prototype.', `<a href="#/home" class="btn-primary">Về trang chủ</a>`)}</div>`
}

// ---------------------------------------------------------------------------
// Layout: Nav + Footer
// ---------------------------------------------------------------------------
function navLink(hash, label, route, extra) {
  const active = route === hash.replace(/^#\/?/, '').split('/')[0]
  return `<a href="${hash}" class="px-3 py-2 rounded-lg text-sm font-semibold transition ${active ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'} ${extra || ''}">${label}</a>`
}

function renderNav(route) {
  const el = document.getElementById('nav')
  const publicLinks = [
    ['#/about', 'Giới thiệu'],
    ['#/members', 'Thành viên'],
    ['#/events', 'Sự kiện'],
    ['#/results', 'Kết quả'],
    ['#/leaderboard', 'Xếp hạng'],
    ['#/news', 'Tin tức'],
    ['#/gallery', 'Ảnh'],
    ['#/contact', 'Liên hệ']
  ]

  const accountArea = state.user
    ? `<details class="relative dropdown">
        <summary class="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-slate-50">
          ${avatarHTML(state.user, 32)}
          <span class="hidden sm:block text-sm font-semibold text-slate-700">${escapeHtml(state.user.displayName)}</span>
          ${unreadCount() > 0 ? `<span class="w-2 h-2 rounded-full bg-brand-500"></span>` : ''}
        </summary>
        <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 text-sm z-50">
          <a href="#/dashboard" class="block px-4 py-2 hover:bg-slate-50">📊 Dashboard</a>
          <a href="#/profile" class="block px-4 py-2 hover:bg-slate-50">👤 Hồ sơ của tôi</a>
          <a href="#/notifications" class="flex items-center justify-between px-4 py-2 hover:bg-slate-50">🔔 Thông báo ${unreadCount() > 0 ? `<span class="text-xs bg-brand-500 text-white rounded-full px-1.5">${unreadCount()}</span>` : ''}</a>
          <a href="#/settings" class="block px-4 py-2 hover:bg-slate-50">⚙️ Cài đặt</a>
          <hr class="my-1 border-slate-100" />
          <button type="button" data-action="logout" class="w-full text-left px-4 py-2 hover:bg-slate-50 text-rose-600">🚪 Đăng xuất</button>
        </div>
      </details>`
    : `<a href="#/login" class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition">Đăng nhập</a>`

  el.innerHTML = `
    <nav class="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <a href="#/home" class="flex items-center gap-2 font-display font-extrabold text-lg text-slate-900 shrink-0">
          <img src="../assets/logo-small.png" class="h-8 w-auto" alt="Laca Team" onerror="this.style.display='none'" />
          Laca Team
        </a>
        <div class="hidden lg:flex items-center gap-1">
          ${publicLinks.map(([href, label]) => navLink(href, label, route)).join('')}
        </div>
        <div class="flex items-center gap-2">
          ${accountArea}
          <details class="lg:hidden dropdown">
            <summary class="cursor-pointer w-10 h-10 grid place-items-center rounded-lg border border-slate-200 text-slate-600">☰</summary>
            <div class="absolute right-4 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 text-sm z-50">
              ${publicLinks.map(([href, label]) => `<a href="${href}" class="block px-4 py-2 hover:bg-slate-50">${label}</a>`).join('')}
            </div>
          </details>
        </div>
      </div>
      ${MEMBER_ONLY_ROUTES.has(route) && state.user ? `<div class="border-t border-slate-100 bg-slate-50"><div class="max-w-6xl mx-auto px-4 py-2.5"><div class="member-tabs">${memberSubNav(route)}</div></div></div>` : ''}
    </nav>`
}

const MEMBER_TABS = [
  { route: 'dashboard', label: '📊 Dashboard' },
  { route: 'profile', label: '👤 Hồ sơ' },
  { route: 'rating', label: '📈 Rating' },
  { route: 'my-matches', label: '🎾 Trận đấu' },
  { route: 'my-events', label: '📅 Sự kiện của tôi' },
  { route: 'achievements', label: '🏅 Thành tích' },
  { route: 'submit-result', label: '➕ Nhập kết quả' },
  { route: 'pending', label: '⏳ Chờ xác nhận' },
  { route: 'notifications', label: '🔔 Thông báo' },
  { route: 'settings', label: '⚙️ Cài đặt' }
]

function memberSubNav(activeRoute) {
  return MEMBER_TABS.map(t => {
    const active = t.route === activeRoute
    const badge =
      t.route === 'notifications' && unreadCount() > 0
        ? `<span class="ml-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] rounded-full bg-brand-500 text-white">${unreadCount()}</span>`
        : ''
    return `<a href="#/${t.route}" class="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${active ? 'bg-brand-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'}">${t.label}${badge}</a>`
  }).join('')
}

function renderFooter() {
  const el = document.getElementById('footer')
  el.innerHTML = `
    <footer class="bg-slate-900 text-slate-300 mt-16">
      <div class="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div class="font-display font-extrabold text-white text-lg mb-2">Laca Team</div>
          <p class="text-sm text-slate-400">CLB Pickleball tại Đà Nẵng — gắn kết, tiến bộ, tranh tài.</p>
        </div>
        <div>
          <div class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Khám phá</div>
          <ul class="space-y-2 text-sm">
            <li><a href="#/events" class="hover:text-white">Sự kiện</a></li>
            <li><a href="#/leaderboard" class="hover:text-white">Bảng xếp hạng</a></li>
            <li><a href="#/results" class="hover:text-white">Kết quả thi đấu</a></li>
            <li><a href="#/gallery" class="hover:text-white">Thư viện ảnh</a></li>
          </ul>
        </div>
        <div>
          <div class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">CLB</div>
          <ul class="space-y-2 text-sm">
            <li><a href="#/about" class="hover:text-white">Giới thiệu</a></li>
            <li><a href="#/members" class="hover:text-white">Thành viên</a></li>
            <li><a href="#/news" class="hover:text-white">Tin tức</a></li>
            <li><a href="#/contact" class="hover:text-white">Liên hệ / Gia nhập</a></li>
          </ul>
        </div>
        <div>
          <div class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Địa điểm</div>
          <p class="text-sm text-slate-400">${escapeHtml(CLUB.address)}</p>
        </div>
      </div>
      <div class="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        © ${new Date().getFullYear()} Laca Team · Đây là bản prototype demo, không phải sản phẩm chính thức.
      </div>
    </footer>`
}

// ---------------------------------------------------------------------------
// Shared card builders
// ---------------------------------------------------------------------------
function eventCardHTML(ev) {
  return `<a href="#/event/${ev.id}" class="card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition block">
      <div class="h-36 bg-slate-100 overflow-hidden">
        <img src="${ev.banner}" alt="" class="w-full h-full object-cover" onerror="this.style.opacity=0" />
      </div>
      <div class="p-4">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <span class="text-xs font-semibold text-slate-400">${escapeHtml(EVENT_TYPE_LABELS[ev.type])}</span>
          ${eventStatusBadge(ev.status)}
        </div>
        <h3 class="font-display font-bold text-slate-900 leading-snug mb-1">${escapeHtml(ev.name)}</h3>
        <p class="text-sm text-slate-500">📅 ${fmtDateTime(ev.startAt)}</p>
        <p class="text-sm text-slate-500">📍 ${escapeHtml(ev.location)}</p>
      </div>
    </a>`
}

function memberCardHTML(m) {
  return `<a href="#/member/${m.id}" class="card p-4 hover:shadow-lg hover:-translate-y-0.5 transition flex items-center gap-3">
      ${avatarHTML(m, 52)}
      <div class="min-w-0">
        <div class="font-display font-bold text-slate-900 truncate">${escapeHtml(m.displayName)} <span class="text-slate-400 font-normal text-sm">${genderIcon(m.gender)}</span></div>
        <div class="flex items-center gap-2 mt-1 flex-wrap">${levelBadgeHTML(m.level)}<span class="text-xs text-slate-400">#${m.rank} · ${m.rating}</span></div>
      </div>
    </a>`
}

function matchRowHTML(match) {
  const a = match.sideA.map(id => memberById(id)).filter(Boolean)
  const b = match.sideB.map(id => memberById(id)).filter(Boolean)
  const winner = matchWinnerSide(match)
  const ev = match.eventId ? eventById(match.eventId) : null
  const scoreStr = match.games.map(g => `${g.a}-${g.b}`).join(', ')
  return `<div class="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap text-sm">
          <span class="font-semibold ${winner === 'A' ? 'text-emerald-600' : 'text-slate-700'}">${a.map(p => escapeHtml(p.displayName)).join(' + ')}</span>
          <span class="text-slate-400">vs</span>
          <span class="font-semibold ${winner === 'B' ? 'text-emerald-600' : 'text-slate-700'}">${b.map(p => escapeHtml(p.displayName)).join(' + ')}</span>
        </div>
        <div class="text-xs text-slate-400 mt-1">
          ${escapeHtml(FORMAT_LABELS[match.format])} · ${fmtDateTime(match.date)}${ev ? ` · <a href="#/event/${ev.id}" class="hover:text-brand-600 underline">${escapeHtml(ev.name)}</a>` : ''}
        </div>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <span class="font-display font-extrabold text-slate-800">${scoreStr}</span>
        ${matchStatusBadge(match.status)}
      </div>
    </div>`
}

function leaderboardRowDesktopHTML(m, i) {
  return `<tr class="border-b border-slate-100 hover:bg-slate-50">
      <td class="py-3 px-3 font-display font-bold text-slate-700">${i + 1}</td>
      <td class="py-3 px-3">${rankChangeHTML(m.rankChange)}</td>
      <td class="py-3 px-3">
        <a href="#/member/${m.id}" class="flex items-center gap-2.5 hover:text-brand-600">
          ${avatarHTML(m, 32)}
          <span class="font-semibold">${escapeHtml(m.displayName)}</span>
        </a>
      </td>
      <td class="py-3 px-3">${levelBadgeHTML(m.level)}</td>
      <td class="py-3 px-3 font-display font-bold text-brand-600">${m.rating}</td>
      <td class="py-3 px-3 text-slate-500">${m.wins + m.losses}</td>
      <td class="py-3 px-3 text-slate-500">${m.winRate}%</td>
    </tr>`
}
function leaderboardRowMobileHTML(m, i) {
  return `<a href="#/member/${m.id}" class="card p-3 flex items-center gap-3">
      <div class="w-8 text-center font-display font-extrabold text-slate-400">${i + 1}</div>
      ${avatarHTML(m, 44)}
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-slate-800 truncate">${escapeHtml(m.displayName)}</div>
        <div class="flex items-center gap-2 mt-0.5">${levelBadgeHTML(m.level)}${rankChangeHTML(m.rankChange)}</div>
      </div>
      <div class="text-right shrink-0">
        <div class="font-display font-extrabold text-brand-600">${m.rating}</div>
        <div class="text-xs text-slate-400">${m.wins + m.losses} trận</div>
      </div>
    </a>`
}

// ---------------------------------------------------------------------------
// Views — public
// ---------------------------------------------------------------------------
function viewHome() {
  const upcoming = EVENTS.filter(e => ['registration_open', 'published'].includes(e.status))
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    .slice(0, 3)
  const recentMatches = [...MATCHES]
    .filter(x => x.status === 'rated')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)
  const topMembers = [...MEMBERS].sort((a, b) => b.rating - a.rating).slice(0, 4)
  const topBoard = [...MEMBERS].sort((a, b) => b.rating - a.rating).slice(0, 5)
  const photos = ALBUMS.flatMap(a => a.photos).slice(0, 6)

  return `
    <section class="relative overflow-hidden">
      <div class="absolute inset-0">
        <img src="../assets/hero-bg.jpg" class="w-full h-full object-cover" alt="" />
        <div class="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-50"></div>
      </div>
      <div class="relative max-w-5xl mx-auto px-4 pt-24 pb-40 text-center text-white">
        <p class="text-brand-200 font-semibold tracking-widest text-xs uppercase mb-3">Laca Team · Pickleball Club</p>
        <h1 class="font-display text-4xl md:text-6xl font-extrabold leading-[1.05] mb-4">Gắn kết. Tiến bộ.<br />Cùng nhau tranh tài.</h1>
        <p class="text-slate-200 max-w-xl mx-auto mb-8">Cộng đồng Pickleball tại Đà Nẵng — nơi mọi trình độ đều có sân chơi để luyện tập, kết bạn và chinh phục thứ hạng của chính mình.</p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <a href="#/about" class="btn-primary">Khám phá CLB</a>
          <a href="#/contact" class="btn-ghost">Tham gia CLB</a>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 -mt-24 relative z-10 mb-16">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card p-5 text-center"><div class="font-display text-3xl font-extrabold text-brand-600">${MEMBERS.length}</div><div class="text-xs text-slate-500 mt-1">Thành viên</div></div>
        <div class="card p-5 text-center"><div class="font-display text-3xl font-extrabold text-brand-600">${MATCHES.length}</div><div class="text-xs text-slate-500 mt-1">Trận đấu</div></div>
        <div class="card p-5 text-center"><div class="font-display text-3xl font-extrabold text-brand-600">${EVENTS.length}</div><div class="text-xs text-slate-500 mt-1">Sự kiện</div></div>
        <div class="card p-5 text-center"><div class="font-display text-3xl font-extrabold text-brand-600">${new Date().getFullYear() - CLUB.founded}+</div><div class="text-xs text-slate-500 mt-1">Năm hoạt động</div></div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 mb-16">
      ${sectionHead('Sắp diễn ra', 'Sự kiện sắp tới', 'Đừng bỏ lỡ — đăng ký ngay để giữ chỗ.')}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        ${upcoming.map(eventCardHTML).join('') || emptyState('📅', 'Chưa có sự kiện sắp tới', 'Quay lại sau nhé!')}
      </div>
      <div class="text-center mt-6"><a href="#/events" class="btn-ghost">Xem tất cả sự kiện →</a></div>
    </section>

    <section class="max-w-6xl mx-auto px-4 mb-16">
      ${sectionHead('Vừa diễn ra', 'Kết quả nổi bật', '')}
      <div class="space-y-3">${recentMatches.map(matchRowHTML).join('') || emptyState('🎾', 'Chưa có kết quả', '')}</div>
      <div class="text-center mt-6"><a href="#/results" class="btn-ghost">Xem tất cả kết quả →</a></div>
    </section>

    <section class="max-w-6xl mx-auto px-4 mb-16">
      ${sectionHead('Cộng đồng', 'Thành viên nổi bật', '')}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">${topMembers.map(memberCardHTML).join('')}</div>
    </section>

    <section class="max-w-4xl mx-auto px-4 mb-16">
      ${sectionHead('Xếp hạng', 'Bảng xếp hạng rút gọn', '')}
      <div class="card overflow-hidden">
        <table class="w-full text-sm hidden md:table">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase"><tr><th class="py-2 px-3 text-left">#</th><th></th><th class="py-2 px-3 text-left">Thành viên</th><th class="py-2 px-3 text-left">Level</th><th class="py-2 px-3 text-left">Rating</th></tr></thead>
          <tbody>${topBoard.map((m, i) => `<tr class="border-b border-slate-100 last:border-0"><td class="py-2.5 px-3 font-display font-bold">${i + 1}</td><td class="px-1">${rankChangeHTML(m.rankChange)}</td><td class="py-2.5 px-3"><a href="#/member/${m.id}" class="flex items-center gap-2 hover:text-brand-600">${avatarHTML(m, 28)}${escapeHtml(m.displayName)}</a></td><td class="py-2.5 px-3">${levelBadgeHTML(m.level)}</td><td class="py-2.5 px-3 font-bold text-brand-600">${m.rating}</td></tr>`).join('')}</tbody>
        </table>
        <div class="md:hidden divide-y divide-slate-100">${topBoard.map((m, i) => `<a href="#/member/${m.id}" class="flex items-center gap-3 p-3"><span class="w-6 text-center font-display font-bold text-slate-400">${i + 1}</span>${avatarHTML(m, 36)}<span class="flex-1 font-semibold">${escapeHtml(m.displayName)}</span><span class="font-bold text-brand-600">${m.rating}</span></a>`).join('')}</div>
      </div>
      <div class="text-center mt-6"><a href="#/leaderboard" class="btn-ghost">Xem bảng xếp hạng đầy đủ →</a></div>
    </section>

    <section class="max-w-6xl mx-auto px-4 mb-16">
      ${sectionHead('Khoảnh khắc', 'Album hoạt động', '')}
      <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
        ${photos.map(p => `<button type="button" class="aspect-square rounded-lg overflow-hidden" data-lightbox data-src="${p.src}" data-caption="${escapeHtml(p.caption)}"><img src="${p.src}" class="w-full h-full object-cover hover:scale-105 transition" alt="" /></button>`).join('')}
      </div>
      <div class="text-center mt-6"><a href="#/gallery" class="btn-ghost">Xem thư viện ảnh →</a></div>
    </section>

    <section class="max-w-3xl mx-auto px-4 mb-20 text-center">
      <div class="card p-10 bg-gradient-to-br from-brand-500 to-brand-700 text-white border-0">
        <h2 class="font-display text-2xl md:text-3xl font-extrabold mb-3">Sẵn sàng gia nhập Laca Team?</h2>
        <p class="text-brand-50 mb-6">Không cần trình độ cao — chỉ cần tinh thần vui vẻ và ham học hỏi.</p>
        <a href="#/contact" class="inline-flex items-center justify-center gap-2 bg-white text-brand-600 font-semibold px-6 py-3 rounded-xl hover:bg-brand-50 transition">Gửi yêu cầu gia nhập</a>
      </div>
    </section>`
}

function viewAbout() {
  return `<div class="max-w-5xl mx-auto px-4 py-14">
      <div class="card p-6 md:p-10 mb-14">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div>
            <span class="inline-block text-xs font-bold tracking-widest uppercase text-brand-600 mb-2">Câu chuyện Laca</span>
            <h2 class="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">Về Laca Team</h2>
            <p class="text-slate-600 leading-relaxed mb-2">${escapeHtml(CLUB.mission)}</p>
            <p class="text-sm text-slate-400 mb-5">Thành lập năm ${CLUB.founded} tại ${CLUB.location}.</p>
            <div class="flex flex-wrap gap-2">
              ${CLUB.values.map(v => `<span class="px-3.5 py-2 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">${v.icon} ${escapeHtml(v.title)}</span>`).join('')}
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3" style="grid-template-rows:130px 130px">
            <div class="rounded-2xl overflow-hidden row-span-2"><img src="../assets/gallery-smash.jpg" class="w-full h-full object-cover" alt="Thành viên Laca Team thi đấu" /></div>
            <div class="rounded-2xl overflow-hidden"><img src="../assets/about-season1.jpg" class="w-full h-full object-cover" alt="Đội Laca Team ăn mừng" /></div>
            <div class="rounded-2xl overflow-hidden"><img src="../assets/gallery-paddle.jpg" class="w-full h-full object-cover" alt="Vợt và bóng pickleball" /></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        ${CLUB.values.map(v => `<div class="card p-5 text-center"><div class="text-3xl mb-2">${v.icon}</div><div class="font-display font-bold text-slate-800 mb-1">${escapeHtml(v.title)}</div><div class="text-xs text-slate-500">${escapeHtml(v.desc)}</div></div>`).join('')}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        <div class="card p-6">
          <h3 class="font-display font-bold text-lg mb-4">Ban điều hành</h3>
          <ul class="space-y-3">
            ${CLUB.organizers.map(o => `<li class="flex items-center gap-3"><span class="w-10 h-10 rounded-full overflow-hidden shrink-0" style="background:#EFEAEC"><img src="${pickFromString(o.name, AVATAR_PHOTO_POOL)}" alt="${escapeHtml(o.name)}" class="w-full h-full object-cover" /></span><div><div class="font-semibold text-slate-800">${escapeHtml(o.name)}</div><div class="text-xs text-slate-500">${escapeHtml(o.role)}</div></div></li>`).join('')}
          </ul>
        </div>
        <div class="card overflow-hidden">
          <div class="h-28"><img src="../assets/venue.jpg" class="w-full h-full object-cover" alt="Sân tập của Laca Team" /></div>
          <div class="p-6">
            <h3 class="font-display font-bold text-lg mb-4">Lịch sinh hoạt thường kỳ</h3>
            <ul class="space-y-3">
              ${CLUB.schedule.map(s => `<li class="flex items-start gap-3"><span class="text-lg">🗓️</span><div><div class="font-semibold text-slate-800">${escapeHtml(s.day)} · ${escapeHtml(s.time)}</div><div class="text-xs text-slate-500">${escapeHtml(s.note)}</div></div></li>`).join('')}
            </ul>
            <p class="text-sm text-slate-500 mt-4">📍 ${escapeHtml(CLUB.address)}</p>
          </div>
        </div>
      </div>

      <div class="card p-8 text-center">
        <h3 class="font-display font-bold text-lg mb-2">Muốn gia nhập Laca Team?</h3>
        <p class="text-slate-500 mb-4 text-sm">Gửi yêu cầu, đội ngũ CLB sẽ liên hệ hướng dẫn buổi tập thử đầu tiên.</p>
        <a href="#/contact" class="btn-primary">Gửi yêu cầu gia nhập</a>
      </div>
    </div>`
}
function filteredMembers() {
  const { q, gender, level } = state.membersFilter
  return MEMBERS.filter(m => {
    if (q && !m.displayName.toLowerCase().includes(q.toLowerCase())) return false
    if (gender && m.gender !== gender) return false
    if (level && m.level !== level) return false
    return true
  }).sort((a, b) => b.rating - a.rating)
}
function renderMembersGrid() {
  const grid = document.getElementById('membersGrid')
  if (!grid) return
  const list = filteredMembers()
  grid.innerHTML = list.length
    ? list.map(memberCardHTML).join('')
    : `<div class="sm:col-span-2 md:col-span-3">${emptyState('🔍', 'Không tìm thấy thành viên', 'Thử từ khóa hoặc bộ lọc khác.')}</div>`
}

function viewMembers() {
  return `<div class="max-w-6xl mx-auto px-4 py-14">
      ${sectionHead('Cộng đồng', 'Thành viên Laca Team', `${MEMBERS.length} thành viên đang hoạt động`)}
      <div class="flex flex-col sm:flex-row gap-3 mb-8">
        <input id="memberSearch" type="text" placeholder="🔍 Tìm theo tên..." value="${escapeHtml(state.membersFilter.q)}" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
        <select id="memberGenderFilter" class="px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
          <option value="">Tất cả giới tính</option>
          <option value="male" ${state.membersFilter.gender === 'male' ? 'selected' : ''}>Nam</option>
          <option value="female" ${state.membersFilter.gender === 'female' ? 'selected' : ''}>Nữ</option>
        </select>
        <select id="memberLevelFilter" class="px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
          <option value="">Tất cả level</option>
          ${LEVELS.map(l => `<option value="${l}" ${state.membersFilter.level === l ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>
      <div id="membersGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"></div>
    </div>`
}

function viewMemberProfile(id) {
  const m = memberById(id)
  if (!m) {
    return `<div class="max-w-3xl mx-auto px-4 py-20">${emptyState('🙈', 'Không tìm thấy thành viên', 'Hồ sơ này không tồn tại hoặc đã bị ẩn.', `<a href="#/members" class="btn-primary">Xem danh sách thành viên</a>`)}</div>`
  }
  const p = m.privacy
  const isSelf = state.user && state.user.id === m.id
  const recent = MATCHES.filter(x => (x.sideA.includes(m.id) || x.sideB.includes(m.id)) && x.status === 'rated')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
  const myEvents = EVENTS.filter(e => e.participants.includes(m.id))
  const achievements = m.achievements.map(aid => ACHIEVEMENTS_CATALOG.find(a => a.id === aid)).filter(Boolean)

  return `<div class="max-w-4xl mx-auto px-4 pb-14">
      <div class="relative h-36 md:h-44 rounded-b-2xl overflow-hidden -mx-4 md:mx-0 md:rounded-2xl mb-8">
        <img src="../assets/about-season1.jpg" class="w-full h-full object-cover" alt="" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-slate-900/10"></div>
      </div>
      <div class="card p-6 md:p-8 mb-8 -mt-24 md:-mt-28 relative z-10">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          ${avatarHTML(m, 84)}
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="font-display text-2xl font-extrabold text-slate-900">${escapeHtml(m.displayName)}</h1>
              <span class="text-slate-400">${genderIcon(m.gender)}</span>
              ${isSelf ? `<span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Đây là bạn</span>` : ''}
            </div>
            <div class="flex items-center gap-2 flex-wrap mt-2">${levelBadgeHTML(m.level)}<span class="text-sm text-slate-500">Hạng #${m.rank} · ${rankChangeHTML(m.rankChange)}</span></div>
            <p class="text-sm text-slate-500 mt-2">
              Gia nhập ${fmtDate(m.joined)} · ${escapeHtml(m.hand)}${p.showRegion ? ` · 📍 ${escapeHtml(m.region)}` : ''}
            </p>
          </div>
          <div class="text-right shrink-0">
            <div class="font-display text-3xl font-extrabold text-brand-600">${m.rating}</div>
            <div class="text-xs text-slate-400">Rating hiện tại</div>
          </div>
        </div>
        <p class="text-slate-600 mt-5 text-sm leading-relaxed">${escapeHtml(m.bio)}</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card p-4 text-center"><div class="font-display text-xl font-extrabold text-slate-800">${m.wins}</div><div class="text-xs text-slate-500">Thắng</div></div>
        <div class="card p-4 text-center"><div class="font-display text-xl font-extrabold text-slate-800">${m.losses}</div><div class="text-xs text-slate-500">Thua</div></div>
        <div class="card p-4 text-center"><div class="font-display text-xl font-extrabold text-slate-800">${m.winRate}%</div><div class="text-xs text-slate-500">Tỷ lệ thắng</div></div>
        <div class="card p-4 text-center"><div class="font-display text-xl font-extrabold text-slate-800">${m.wins + m.losses}</div><div class="text-xs text-slate-500">Tổng số trận</div></div>
      </div>

      <div class="card p-6 mb-8">
        <h3 class="font-display font-bold mb-3">Nội dung thi đấu thường tham gia</h3>
        <div class="flex flex-wrap gap-2">${m.formats.map(f => `<span class="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">${escapeHtml(FORMAT_LABELS[f])}</span>`).join('')}</div>
      </div>

      ${p.showRatingChart ? `<div class="card p-6 mb-8">
        <h3 class="font-display font-bold mb-3">Lịch sử rating</h3>
        ${sparklineSVG(m.ratingHistory)}
      </div>` : ''}

      ${p.showMatchHistory ? `<div class="card p-6 mb-8">
        <h3 class="font-display font-bold mb-3">Trận gần đây</h3>
        <div class="space-y-3">${recent.map(matchRowHTML).join('') || emptyState('🎾', 'Chưa có trận đấu', '')}</div>
      </div>` : `<div class="mb-8">${emptyState('🔒', 'Lịch sử trận đấu ở chế độ riêng tư', 'Thành viên này chưa công khai lịch sử thi đấu.')}</div>`}

      ${p.showEvents ? `<div class="card p-6 mb-8">
        <h3 class="font-display font-bold mb-3">Sự kiện đã tham gia</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${myEvents.map(e => `<a href="#/event/${e.id}" class="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-brand-200"><span class="text-xl">📅</span><div><div class="font-semibold text-sm text-slate-800">${escapeHtml(e.name)}</div><div class="text-xs text-slate-400">${fmtDate(e.startAt)}</div></div></a>`).join('') || emptyState('📅', 'Chưa tham gia sự kiện nào', '')}</div>
      </div>` : ''}

      <div class="card p-6">
        <h3 class="font-display font-bold mb-3">Thành tích</h3>
        <div class="flex flex-wrap gap-3">
          ${achievements.map(a => `<div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100" title="${escapeHtml(a.desc)}"><span class="text-lg">${a.icon}</span><span class="text-xs font-semibold text-amber-700">${escapeHtml(a.name)}</span></div>`).join('') || emptyState('🏅', 'Chưa có thành tích', 'Thi đấu nhiều hơn để mở khóa thành tích!')}
        </div>
      </div>
    </div>`
}

function viewLeaderboard() {
  const { gender, format } = state.leaderboardFilter
  const list = MEMBERS.filter(m => (!gender || m.gender === gender) && (!format || m.formats.includes(format))).sort((a, b) => b.rating - a.rating)
  return `<div class="max-w-5xl mx-auto px-4 py-14">
      ${sectionHead('Xếp hạng', 'Bảng xếp hạng Laca Team', 'Xếp theo rating — cập nhật sau mỗi trận đấu đã xác nhận.')}

      <div class="flex flex-wrap gap-2 mb-6 justify-center">
        <button type="button" class="tab-btn ${!gender ? 'is-active' : ''}" data-action="lb-filter" data-key="gender" data-value="">Tất cả</button>
        <button type="button" class="tab-btn ${gender === 'male' ? 'is-active' : ''}" data-action="lb-filter" data-key="gender" data-value="male">Nam</button>
        <button type="button" class="tab-btn ${gender === 'female' ? 'is-active' : ''}" data-action="lb-filter" data-key="gender" data-value="female">Nữ</button>
      </div>

      <div class="card p-4 mb-6 text-xs text-slate-500 leading-relaxed">
        ℹ️ <strong>Cách xếp hạng:</strong> rating được tính theo thuật toán Elo điều chỉnh, chỉ áp dụng cho các trận đã được cả hai bên xác nhận. Thành viên cần tối thiểu 5 trận đã xác nhận để xuất hiện chính thức trên bảng xếp hạng (bản demo bỏ qua ngưỡng này để dễ minh họa).
      </div>

      <div class="card overflow-hidden">
        <table class="w-full text-sm hidden md:table">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr><th class="py-2.5 px-3 text-left">#</th><th class="py-2.5 px-3 text-left">Biến động</th><th class="py-2.5 px-3 text-left">Thành viên</th><th class="py-2.5 px-3 text-left">Level</th><th class="py-2.5 px-3 text-left">Rating</th><th class="py-2.5 px-3 text-left">Số trận</th><th class="py-2.5 px-3 text-left">Tỷ lệ thắng</th></tr>
          </thead>
          <tbody>${list.map(leaderboardRowDesktopHTML).join('')}</tbody>
        </table>
        <div class="md:hidden divide-y divide-slate-100">${list.map(leaderboardRowMobileHTML).join('')}</div>
      </div>
    </div>`
}

function filteredEvents() {
  const { type, status } = state.eventsFilter
  return EVENTS.filter(e => {
    if (type && e.type !== type) return false
    if (status === 'upcoming' && !['registration_open', 'published', 'in_progress'].includes(e.status)) return false
    if (status === 'completed' && e.status !== 'completed') return false
    return true
  }).sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
}
function renderEventsGrid() {
  const grid = document.getElementById('eventsGrid')
  if (!grid) return
  const list = filteredEvents()
  grid.innerHTML = list.length
    ? list.map(eventCardHTML).join('')
    : `<div class="md:col-span-3">${emptyState('📅', 'Không có sự kiện phù hợp', 'Thử bộ lọc khác.')}</div>`
}

function filterTabsHTML(action, key, current, options) {
  return options
    .map(
      ([value, label]) =>
        `<button type="button" class="tab-btn ${current === value ? 'is-active' : ''}" data-action="${action}" data-key="${key}" data-value="${value}">${label}</button>`
    )
    .join('')
}

function viewEvents() {
  return `<div class="max-w-6xl mx-auto px-4 py-14">
      ${sectionHead('Lịch hoạt động', 'Sự kiện Laca Team', 'Buổi tập, Mini Game và giải đấu — đăng ký chỉ trong vài thao tác.')}
      <div class="flex flex-wrap items-center justify-center gap-2 mb-2">
        ${filterTabsHTML('events-filter', 'status', state.eventsFilter.status, [
          ['', 'Tất cả'],
          ['upcoming', 'Sắp diễn ra'],
          ['completed', 'Đã diễn ra']
        ])}
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2 mb-8">
        ${filterTabsHTML('events-filter', 'type', state.eventsFilter.type, [
          ['', 'Mọi loại'],
          ['practice', 'Buổi tập'],
          ['mini_game', 'Mini Game'],
          ['tournament', 'Giải đấu']
        ])}
      </div>
      <div id="eventsGrid" class="grid grid-cols-1 md:grid-cols-3 gap-5"></div>
    </div>`
}

// ---------------------------------------------------------------------------
// Nội dung chi tiết cho sự kiện dạng "giải đấu đồng đội" (ev.tournamentDetails)
// — vòng bảng, vòng loại trực tiếp, giải thưởng, đội hình theo mã VĐV.
// Đây là hiển thị thông tin (read-only), không phải công cụ chấm điểm trực
// tiếp — dữ liệu đã có công cụ bốc thăm/chấm điểm riêng ở site giải đấu.
// ---------------------------------------------------------------------------
function trBuildBoardMatches(td, board) {
  const teams = td.boards[board]
  const rounds = [
    [[teams[0], teams[1]], [teams[2], teams[3]]],
    [[teams[0], teams[2]], [teams[1], teams[3]]],
    [[teams[0], teams[3]], [teams[1], teams[2]]]
  ]
  const matches = []
  rounds.forEach((pair, ri) => {
    pair.forEach((t, pi) => {
      matches.push({ round: ri + 1, pos: pi, home: t[0], away: t[1], courts: td.courts[board][pi] })
    })
  })
  return matches
}
function trSubDefs(td, match) {
  const r = td.rotation[match.round - 1]
  const rt = td.roundTimes[match.round - 1]
  const courts = match.courts
  return [
    { label: `Trận 1 · ${td.subMatchOrder[0]}`, time: rt.ab, court: courts[0], pairing: r.nam },
    { label: `Trận 2 · ${td.subMatchOrder[1]}`, time: rt.ab, court: courts[1], pairing: r.nu },
    { label: `Trận 3 · ${td.subMatchOrder[2]}`, time: rt.c, court: courts[0], pairing: r.mix }
  ]
}
function trPairLabel(team, pairStr) {
  return pairStr
    .split('+')
    .map(slot => `${team}-${slot.trim()}`)
    .join(' + ')
}

function tournamentGroupsHTML(td) {
  return Object.keys(td.boards)
    .map(board => {
      const matches = trBuildBoardMatches(td, board)
      const rows = matches
        .flatMap(m =>
          trSubDefs(td, m).map(
            s => `<tr class="border-b border-slate-100">
              <td class="py-2 px-3 text-slate-500 whitespace-nowrap">Lượt ${m.round}</td>
              <td class="py-2 px-3 text-slate-500 whitespace-nowrap">${escapeHtml(s.time)}</td>
              <td class="py-2 px-3 text-slate-500 whitespace-nowrap">Sân ${s.court}</td>
              <td class="py-2 px-3 whitespace-nowrap">${escapeHtml(s.label)}</td>
              <td class="py-2 px-3 font-semibold text-right">${escapeHtml(trPairLabel(m.home, s.pairing))}</td>
              <td class="py-2 px-3 text-slate-400 text-center">vs</td>
              <td class="py-2 px-3 font-semibold">${escapeHtml(trPairLabel(m.away, s.pairing))}</td>
            </tr>`
          )
        )
        .join('')
      return `<div class="mb-8 last:mb-0">
          <h4 class="font-display font-bold mb-1">Bảng ${board} · Đội ${td.boards[board].join(' · ')}</h4>
          <p class="text-xs text-slate-400 mb-3">Vòng tròn 1 lượt — mỗi đội thi đấu 3 trận lớn. Xoay cặp theo mã M1–M3/W1–W3 của chính đội đó.</p>
          <div class="overflow-x-auto rounded-xl border border-slate-100">
            <table class="w-full text-xs min-w-[560px]">
              <thead class="bg-slate-50 text-slate-500 uppercase"><tr><th class="py-2 px-3 text-left">Lượt</th><th class="py-2 px-3 text-left">Giờ</th><th class="py-2 px-3 text-left">Sân</th><th class="py-2 px-3 text-left">Trận con</th><th class="py-2 px-3 text-right">Đội nhà</th><th></th><th class="py-2 px-3 text-left">Đội khách</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>`
    })
    .join('')
}

function tournamentKnockoutHTML(td) {
  return `<div class="space-y-3">
      ${Object.values(td.knockout)
        .map(
          m => `<div class="card p-4">
            <div class="flex items-center justify-between mb-2 flex-wrap gap-1">
              <span class="font-display font-bold text-sm">${escapeHtml(m.label)}</span>
              <span class="text-xs text-slate-400">${escapeHtml(m.time)} · Sân ${m.courts.join(', ')}</span>
            </div>
            <div class="flex items-center justify-center gap-3 text-sm font-semibold text-slate-700">
              <span>${escapeHtml(m.home)}</span><span class="text-slate-400 text-xs">vs</span><span>${escapeHtml(m.away)}</span>
            </div>
          </div>`
        )
        .join('')}
      <p class="text-xs text-slate-400">Mỗi trận lớn ở vòng loại trực tiếp dùng 3 sân riêng biệt — cả 3 trận con thi đấu cùng thời điểm, đội thắng 2/3 trận con đi tiếp. Ở chung kết, các đội được phép lặp lại cặp đấu đã dùng ở bán kết.</p>
    </div>`
}

function tournamentPrizesHTML(td) {
  return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      ${td.prizes
        .map(
          p => `<div class="card p-5 text-center">
            <div class="text-3xl mb-2">${p.rank.includes('Nhất') ? '🥇' : '🥈'}</div>
            <div class="font-display font-bold mb-1">${escapeHtml(p.rank)} · ${p.count} giải</div>
            <div class="text-xs text-slate-500">${escapeHtml(p.desc)}</div>
          </div>`
        )
        .join('')}
    </div>`
}

function tournamentRosterHTML(td) {
  const roles = ['M1', 'M2', 'M3', 'W1', 'W2', 'W3']
  return `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
      ${td.teams
        .map(
          t => `<div class="card p-4">
            <div class="flex items-center gap-2 mb-2.5"><span class="w-8 h-8 rounded-full bg-brand-100 text-brand-600 grid place-items-center font-display font-bold text-sm">${t}</span><span class="font-semibold text-sm">Đội ${t}</span></div>
            <div class="text-xs text-slate-500 grid grid-cols-2 gap-y-0.5">${roles.map(r => `<div>${t}-${r}</div>`).join('')}</div>
          </div>`
        )
        .join('')}
    </div>
    <p class="text-xs text-slate-400 mt-3">Đội hình hiển thị theo mã số M1–M3 (nam) / W1–W3 (nữ) — tên VĐV sẽ hiện tự động sau khi các đội chốt danh sách và bốc thăm chia đội theo nhóm hạt giống.</p>`
}

function viewEventDetail(id) {
  const ev = eventById(id)
  if (!ev) {
    return `<div class="max-w-3xl mx-auto px-4 py-20">${emptyState('📅', 'Không tìm thấy sự kiện', 'Sự kiện này không tồn tại.', `<a href="#/events" class="btn-primary">Xem tất cả sự kiện</a>`)}</div>`
  }
  const participants = ev.participants.map(id2 => memberById(id2)).filter(Boolean)
  const results = ev.resultIds.map(matchById).filter(Boolean)
  const album = ALBUMS.find(a => a.eventId === ev.id)
  const isRegistered = state.user && ev.participants.includes(state.user.id)
  const isFull = ev.participants.length >= ev.capacity
  const td = ev.tournamentDetails
  const isTournament = !!td

  let ctaHTML = ''
  if (isTournament) {
    ctaHTML = `<span class="text-sm text-slate-500">Đăng ký theo đội qua đội trưởng (mã M1–M3/W1–W3), không đăng ký cá nhân.</span>`
  } else if (!state.user) {
    ctaHTML = `<a href="#/login" class="btn-primary">Đăng nhập để đăng ký</a>`
  } else if (ev.status !== 'registration_open') {
    ctaHTML = `<span class="text-sm text-slate-500">Sự kiện hiện không mở đăng ký.</span>`
  } else if (isRegistered) {
    ctaHTML = `<button type="button" class="btn-danger" data-action="unregister-event" data-event="${ev.id}">Hủy đăng ký</button>`
  } else if (isFull && !ev.waitlistEnabled) {
    ctaHTML = `<button class="btn-primary is-disabled" disabled>Đã đủ chỗ</button>`
  } else {
    ctaHTML = `<div class="flex flex-wrap items-center gap-2">
        ${ev.formats.length > 1 ? `<select id="regFormatSelect-${ev.id}" class="px-3 py-2.5 rounded-xl border border-slate-200 text-sm">${ev.formats.map(f => `<option value="${f}">${escapeHtml(FORMAT_LABELS[f])}</option>`).join('')}</select>` : `<input type="hidden" id="regFormatSelect-${ev.id}" value="${ev.formats[0] || ''}" />`}
        <button type="button" class="btn-primary" data-action="register-event" data-event="${ev.id}">${isFull ? 'Vào danh sách chờ' : 'Đăng ký tham gia'}</button>
      </div>`
  }

  return `<div>
      <div class="h-56 md:h-72 bg-slate-800 relative overflow-hidden">
        <img src="${ev.banner}" class="w-full h-full object-cover opacity-70" alt="" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-4 pb-6 text-white">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-semibold text-slate-200">${escapeHtml(EVENT_TYPE_LABELS[ev.type])}</span>
            ${eventStatusBadge(ev.status)}
          </div>
          <h1 class="font-display text-2xl md:text-3xl font-extrabold">${escapeHtml(ev.name)}</h1>
        </div>
      </div>

      <div class="max-w-5xl mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2" data-tabs-root>
            <div class="flex flex-wrap gap-2 mb-6">
              ${(isTournament ? ['desc', 'schedule', 'rules', 'groups', 'knockout', 'prizes', 'participants', 'results', 'album'] : ['desc', 'schedule', 'rules', 'participants', 'results', 'album'])
                .map((t, i) => {
                  const labels = {
                    desc: 'Mô tả',
                    schedule: 'Lịch trình',
                    rules: 'Thể lệ',
                    groups: 'Vòng bảng',
                    knockout: 'Vòng loại',
                    prizes: 'Giải thưởng',
                    participants: isTournament ? 'Đội thi đấu' : `Tham gia (${participants.length})`,
                    results: `Kết quả (${results.length})`,
                    album: 'Album'
                  }
                  return `<button type="button" class="tab-btn ${i === 0 ? 'is-active' : ''}" data-tab-btn="${t}">${labels[t]}</button>`
                })
                .join('')}
            </div>
            <div>
              <div data-tab-panel="desc" class="space-y-2 text-sm text-slate-600 leading-relaxed">${escapeHtml(ev.description)}</div>
              <div data-tab-panel="schedule" hidden class="space-y-3">${
                (isTournament ? td.fullTimeline : ev.schedule)
                  .map(s => `<div class="flex gap-3"><span class="font-display font-bold text-brand-600 shrink-0 w-32">${escapeHtml(s.time)}</span><span class="text-sm text-slate-600">${escapeHtml(s.title)}</span></div>`)
                  .join('') || emptyState('🗓️', 'Chưa có lịch trình chi tiết', '')
              }</div>
              <div data-tab-panel="rules" hidden><ul class="list-disc pl-5 space-y-1.5 text-sm text-slate-600">${ev.rules.map(r => `<li>${escapeHtml(r)}</li>`).join('') || '<li>Chưa cập nhật.</li>'}</ul></div>
              ${isTournament ? `<div data-tab-panel="groups" hidden>${tournamentGroupsHTML(td)}</div>` : ''}
              ${isTournament ? `<div data-tab-panel="knockout" hidden>${tournamentKnockoutHTML(td)}</div>` : ''}
              ${isTournament ? `<div data-tab-panel="prizes" hidden>${tournamentPrizesHTML(td)}</div>` : ''}
              <div data-tab-panel="participants" hidden>${
                isTournament
                  ? tournamentRosterHTML(td)
                  : `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${participants.map(m => `<a href="#/member/${m.id}" class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 hover:border-brand-200">${avatarHTML(m, 34)}<span class="text-sm font-semibold">${escapeHtml(m.displayName)}</span><span class="ml-auto text-xs text-emerald-600">Đã đăng ký</span></a>`).join('') || emptyState('👥', 'Chưa có ai đăng ký', '')}</div>`
              }</div>
              <div data-tab-panel="results" hidden class="space-y-3">${results.map(matchRowHTML).join('') || emptyState('🎾', 'Chưa có kết quả', '')}</div>
              <div data-tab-panel="album" hidden class="grid grid-cols-3 gap-2">${
                album
                  ? album.photos.map(p => `<button type="button" class="aspect-square rounded-lg overflow-hidden" data-lightbox data-src="${p.src}" data-caption="${escapeHtml(p.caption)}"><img src="${p.src}" class="w-full h-full object-cover" alt="" /></button>`).join('')
                  : emptyState('📸', 'Chưa có album', '')
              }</div>
            </div>
          </div>

          <div class="card p-5 h-fit sticky top-24 space-y-3 text-sm">
            <div class="flex gap-2"><span>📅</span><div><div class="font-semibold">${fmtDateTime(ev.startAt)}</div><div class="text-xs text-slate-400">đến ${fmtTime(ev.endAt)}</div></div></div>
            <div class="flex gap-2"><span>📍</span><div>${escapeHtml(ev.location)}</div></div>
            <div class="flex gap-2"><span>🧑‍💼</span><div>Phụ trách: ${escapeHtml(ev.organizer)}</div></div>
            <div class="flex gap-2"><span>👥</span><div>${isTournament ? `${td.teams.length} đội · ${ev.capacity} VĐV` : `${ev.participants.length}/${ev.capacity} đã đăng ký${ev.waitlistEnabled ? ' · có danh sách chờ' : ''}`}</div></div>
            <div class="flex gap-2"><span>💵</span><div>${escapeHtml(ev.fee)}</div></div>
            <div class="flex gap-2"><span>⏰</span><div>Đăng ký: ${fmtDate(ev.registrationOpensAt)} – ${fmtDate(ev.registrationClosesAt)}</div></div>
            <hr class="border-slate-100" />
            ${ctaHTML}
          </div>
        </div>
      </div>
    </div>`
}

function filteredResults() {
  const { format, eventId } = state.resultsFilter
  return MATCHES.filter(x => x.status === 'rated')
    .filter(x => (!format || x.format === format) && (!eventId || x.eventId === eventId))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}
function renderResultsList() {
  const el = document.getElementById('resultsList')
  if (!el) return
  const list = filteredResults()
  el.innerHTML = list.length ? list.map(matchRowHTML).join('') : emptyState('🎾', 'Không có kết quả phù hợp', 'Thử bộ lọc khác.')
}

function viewResults() {
  return `<div class="max-w-4xl mx-auto px-4 py-14">
      ${sectionHead('Thi đấu', 'Kết quả thi đấu', 'Chỉ hiển thị các trận đã được xác nhận và tính rating.')}
      <div class="flex flex-wrap items-center justify-center gap-2 mb-8">
        ${filterTabsHTML(
          'results-filter',
          'format',
          state.resultsFilter.format,
          [['', 'Tất cả nội dung']].concat(Object.entries(FORMAT_LABELS).map(([k, v]) => [k, v]))
        )}
      </div>
      <div id="resultsList" class="space-y-3"></div>
    </div>`
}

function viewGallery() {
  return `<div class="max-w-6xl mx-auto px-4 py-14">
      ${sectionHead('Khoảnh khắc', 'Thư viện ảnh', 'Album theo từng sự kiện của Laca Team.')}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${ALBUMS.map(
          al => `<div class="card overflow-hidden">
            <div class="h-40 bg-slate-100"><img src="${al.cover}" class="w-full h-full object-cover" alt="" /></div>
            <div class="p-4">
              <h3 class="font-display font-bold mb-3">${escapeHtml(al.title)}</h3>
              <div class="grid grid-cols-4 gap-1.5">
                ${al.photos
                  .map(
                    p =>
                      `<button type="button" class="aspect-square rounded-md overflow-hidden" data-lightbox data-src="${p.src}" data-caption="${escapeHtml(p.caption)}"><img src="${p.src}" class="w-full h-full object-cover hover:scale-105 transition" alt="" /></button>`
                  )
                  .join('')}
              </div>
            </div>
          </div>`
        ).join('')}
      </div>
    </div>`
}

function viewNewsList() {
  return `<div class="max-w-4xl mx-auto px-4 py-14">
      ${sectionHead('Tin tức', 'Hoạt động & tin tức Laca Team', '')}
      <div class="space-y-5">
        ${[...ARTICLES]
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .map(
            a => `<a href="#/news/${a.id}" class="card p-4 flex gap-4 hover:shadow-lg transition">
              <div class="w-28 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100"><img src="${a.cover}" class="w-full h-full object-cover" alt="" /></div>
              <div class="min-w-0">
                <h3 class="font-display font-bold text-slate-900 leading-snug mb-1">${escapeHtml(a.title)}</h3>
                <p class="text-sm text-slate-500 line-clamp-2">${escapeHtml(a.excerpt)}</p>
                <p class="text-xs text-slate-400 mt-1.5">${escapeHtml(a.author)} · ${fmtDate(a.publishedAt)}</p>
              </div>
            </a>`
          )
          .join('')}
      </div>
    </div>`
}

function viewNewsDetail(id) {
  const a = articleById(id)
  if (!a) return `<div class="max-w-3xl mx-auto px-4 py-20">${emptyState('📰', 'Không tìm thấy bài viết', '', `<a href="#/news" class="btn-primary">Xem tất cả tin tức</a>`)}</div>`
  return `<article class="max-w-2xl mx-auto px-4 py-14">
      <a href="#/news" class="text-sm text-brand-600 font-semibold">← Tất cả tin tức</a>
      <h1 class="font-display text-3xl font-extrabold text-slate-900 mt-3 mb-2">${escapeHtml(a.title)}</h1>
      <p class="text-sm text-slate-400 mb-6">${escapeHtml(a.author)} · ${fmtDate(a.publishedAt)}</p>
      <div class="rounded-2xl overflow-hidden mb-6"><img src="${a.cover}" class="w-full object-cover max-h-96" alt="" /></div>
      <p class="text-slate-600 leading-relaxed">${escapeHtml(a.content)}</p>
    </article>`
}

function viewContact() {
  return `<div class="max-w-lg mx-auto px-4 py-14">
      ${sectionHead('Kết nối', 'Liên hệ / Gia nhập CLB', 'Điền form bên dưới, đội ngũ Laca Team sẽ phản hồi sớm nhất.')}
      <form id="contactForm" class="card p-6 space-y-4">
        <div>
          <label class="text-sm font-semibold text-slate-700 block mb-1.5">Họ tên</label>
          <input required name="name" type="text" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" placeholder="Nguyễn Văn A" />
        </div>
        <div>
          <label class="text-sm font-semibold text-slate-700 block mb-1.5">Số điện thoại</label>
          <input required name="phone" type="tel" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" placeholder="09xx xxx xxx" />
        </div>
        <div>
          <label class="text-sm font-semibold text-slate-700 block mb-1.5">Lời nhắn</label>
          <textarea name="message" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" placeholder="Mình muốn tham gia tập thử..."></textarea>
        </div>
        <button type="submit" class="btn-primary w-full">Gửi yêu cầu</button>
        <p class="text-xs text-slate-400 text-center">📞 Kênh liên hệ chính thức: Fanpage Laca Team · Zalo nhóm CLB</p>
      </form>
      <div id="contactSuccess" hidden class="card p-8 text-center">
        <div class="text-4xl mb-3">✅</div>
        <h3 class="font-display font-bold text-lg mb-1">Đã gửi yêu cầu!</h3>
        <p class="text-sm text-slate-500">Cảm ơn bạn đã quan tâm tới Laca Team — chúng mình sẽ liên hệ lại sớm nhất.</p>
      </div>
    </div>`
}

function viewLogin() {
  return `<div class="max-w-md mx-auto px-4 py-14">
      ${sectionHead('Đăng nhập', 'Chào mừng trở lại', '')}
      <form id="loginForm" class="card p-6 space-y-4 mb-6">
        <div>
          <label class="text-sm font-semibold text-slate-700 block mb-1.5">Email</label>
          <input type="email" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" placeholder="ban@laca.team" />
        </div>
        <div>
          <label class="text-sm font-semibold text-slate-700 block mb-1.5">Mật khẩu</label>
          <input type="password" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" placeholder="••••••••" />
        </div>
        <button type="submit" class="btn-primary w-full">Đăng nhập</button>
        <p class="text-xs text-slate-400 text-center">Bản prototype không xác thực thật — dùng tài khoản demo bên dưới để trải nghiệm.</p>
      </form>

      <div class="card p-6">
        <h3 class="font-display font-bold mb-1">🎭 Đăng nhập demo</h3>
        <p class="text-xs text-slate-500 mb-4">Chọn 1 tài khoản mẫu để trải nghiệm đầy đủ tính năng thành viên.</p>
        <div class="space-y-2">
          ${DEMO_ACCOUNTS.map(d => {
            const m = memberById(d.memberId)
            return `<button type="button" class="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition text-left" data-action="demo-login" data-member="${m.id}">
                ${avatarHTML(m, 40)}
                <div class="min-w-0">
                  <div class="font-semibold text-sm text-slate-800">${escapeHtml(m.displayName)} <span class="text-slate-400 font-normal">· ${escapeHtml(m.level)}</span></div>
                  <div class="text-xs text-slate-500">${escapeHtml(d.tagline)}</div>
                </div>
              </button>`
          }).join('')}
        </div>
      </div>
    </div>`
}
function viewLoginRequired(route) {
  return `<div class="max-w-3xl mx-auto px-4 py-20">${emptyState(
    '🔒',
    'Cần đăng nhập để xem trang này',
    'Đây là khu vực dành cho thành viên. Đăng nhập (hoặc dùng tài khoản demo) để tiếp tục.',
    `<a href="#/login" class="btn-primary">Đăng nhập</a>`
  )}</div>`
}

// ---------------------------------------------------------------------------
// Views — member area (filled in part 4)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Member-scoped data helpers
// ---------------------------------------------------------------------------
function myMatches(userId) {
  return MATCHES.filter(x => x.sideA.includes(userId) || x.sideB.includes(userId)).sort((a, b) => new Date(b.date) - new Date(a.date))
}
function pendingForUser(userId) {
  return MATCHES.filter(
    x => x.status === 'submitted' && (x.sideA.includes(userId) || x.sideB.includes(userId)) && x.submittedBy !== userId && !x.confirmedBy.includes(userId)
  )
}
function awaitingOpponentForUser(userId) {
  return MATCHES.filter(x => x.status === 'submitted' && x.submittedBy === userId)
}
function disputedInvolving(userId) {
  return MATCHES.filter(x => x.status === 'disputed' && (x.sideA.includes(userId) || x.sideB.includes(userId)))
}
function myRegisteredEvents(userId) {
  return EVENTS.filter(e => e.participants.includes(userId)).sort((a, b) => new Date(b.startAt) - new Date(a.startAt))
}
function ratingTransactionsForMember(id) {
  const m = memberById(id)
  const matches = MATCHES.filter(x => x.status === 'rated' && (x.sideA.includes(id) || x.sideB.includes(id))).sort((a, b) => new Date(a.date) - new Date(b.date))
  let running = m.rating - matches.length * 11
  const rows = matches.map(x => {
    const side = x.sideA.includes(id) ? 'A' : 'B'
    const win = matchWinnerSide(x) === side
    const delta = win ? 10 + ((x.id.length * 3) % 12) : -(8 + ((x.id.length * 2) % 10))
    const before = running
    running += delta
    return { match: x, before, delta, after: running }
  })
  rows[rows.length - 1] && (rows[rows.length - 1].after = m.rating)
  return rows.reverse()
}

// ---------------------------------------------------------------------------
// Views — member area
// ---------------------------------------------------------------------------
function viewDashboard() {
  const u = state.user
  const pending = pendingForUser(u.id)
  const disputed = disputedInvolving(u.id)
  const recent = myMatches(u.id).slice(0, 4)
  const upcomingEvents = myRegisteredEvents(u.id).filter(e => new Date(e.startAt) > new Date())
  const lastTx = ratingTransactionsForMember(u.id)[0]
  const unread = state.notifications.filter(n => !n.read).slice(0, 3)

  return `<div class="max-w-6xl mx-auto px-4 py-10">
      <div class="flex items-center gap-4 mb-8">
        ${avatarHTML(u, 64)}
        <div>
          <h1 class="font-display text-2xl font-extrabold text-slate-900">Chào ${escapeHtml(u.displayName)} 👋</h1>
          <p class="text-slate-500 text-sm">Đây là tổng quan hoạt động của bạn tại Laca Team.</p>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card p-5"><div class="text-xs text-slate-400 mb-1">Rating</div><div class="font-display text-2xl font-extrabold text-brand-600">${u.rating}</div>${lastTx ? `<div class="text-xs mt-1 ${lastTx.delta > 0 ? 'text-emerald-600' : 'text-rose-500'}">${lastTx.delta > 0 ? '+' : ''}${lastTx.delta} gần nhất</div>` : ''}</div>
        <div class="card p-5"><div class="text-xs text-slate-400 mb-1">Level</div><div class="mt-1">${levelBadgeHTML(u.level)}</div></div>
        <div class="card p-5"><div class="text-xs text-slate-400 mb-1">Hạng</div><div class="font-display text-2xl font-extrabold text-slate-800">#${u.rank}</div><div class="mt-1">${rankChangeHTML(u.rankChange)}</div></div>
        <div class="card p-5"><div class="text-xs text-slate-400 mb-1">Thắng / Thua</div><div class="font-display text-2xl font-extrabold text-slate-800">${u.wins}/${u.losses}</div></div>
      </div>

      ${
        pending.length
          ? `<div class="card p-5 mb-8 border-amber-200 bg-amber-50 flex items-center justify-between flex-wrap gap-3">
              <div><span class="text-2xl mr-2">⏳</span><strong>${pending.length} kết quả</strong> đang chờ bạn xác nhận.</div>
              <a href="#/pending" class="btn-primary">Xem ngay</a>
            </div>`
          : ''
      }
      ${
        disputed.length
          ? `<div class="card p-5 mb-8 border-rose-200 bg-rose-50">
              <span class="text-xl mr-2">⚠️</span><strong>${disputed.length} trận đang tranh chấp</strong> — chờ Ban tổ chức xử lý.
            </div>`
          : ''
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="card p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-display font-bold">Trận gần đây</h3>
              <a href="#/my-matches" class="text-xs text-brand-600 font-semibold">Xem tất cả →</a>
            </div>
            <div class="space-y-3">${recent.map(matchRowHTML).join('') || emptyState('🎾', 'Chưa có trận đấu nào', 'Bấm "Nhập kết quả" để ghi nhận trận đầu tiên!')}</div>
          </div>
          <div class="card p-5 text-center">
            <h3 class="font-display font-bold mb-2">Vừa thi đấu xong?</h3>
            <p class="text-sm text-slate-500 mb-4">Ghi lại kết quả ngay tại sân chỉ trong vài bước.</p>
            <a href="#/submit-result" class="btn-primary">➕ Nhập kết quả trận đấu</a>
          </div>
        </div>
        <div class="space-y-6">
          <div class="card p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-display font-bold">Sự kiện sắp tới</h3>
              <a href="#/my-events" class="text-xs text-brand-600 font-semibold">Tất cả →</a>
            </div>
            <div class="space-y-2">${
              upcomingEvents
                .map(e => `<a href="#/event/${e.id}" class="block p-3 rounded-xl border border-slate-100 hover:border-brand-200"><div class="font-semibold text-sm">${escapeHtml(e.name)}</div><div class="text-xs text-slate-400">${fmtDateTime(e.startAt)}</div></a>`)
                .join('') || emptyState('📅', 'Chưa đăng ký sự kiện nào', '')
            }</div>
          </div>
          <div class="card p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-display font-bold">Thông báo</h3>
              <a href="#/notifications" class="text-xs text-brand-600 font-semibold">Tất cả →</a>
            </div>
            <div class="space-y-2">${unread.map(n => `<a href="${n.link}" class="block text-sm p-2.5 rounded-lg hover:bg-slate-50">${escapeHtml(n.text)}</a>`).join('') || emptyState('🔔', 'Không có thông báo mới', '')}</div>
          </div>
        </div>
      </div>
    </div>`
}

function viewProfileEdit() {
  const u = state.user
  return `<div class="max-w-2xl mx-auto px-4 py-10">
      ${sectionHead('Hồ sơ', 'Hồ sơ cá nhân', 'Thông tin này (trừ mục đã đặt riêng tư) sẽ hiển thị trên hồ sơ công khai của bạn.')}
      <form id="profileForm" class="card p-6 space-y-5">
        <div class="flex items-center gap-4">
          ${avatarHTML(u, 64)}
          <div class="text-sm text-slate-500">Avatar demo được tạo tự động từ tên hiển thị.</div>
        </div>
        <div>
          <label class="text-sm font-semibold text-slate-700 block mb-1.5">Tên hiển thị</label>
          <input name="displayName" type="text" value="${escapeHtml(u.displayName)}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
        </div>
        <div>
          <label class="text-sm font-semibold text-slate-700 block mb-1.5">Giới thiệu ngắn</label>
          <textarea name="bio" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm">${escapeHtml(u.bio)}</textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-semibold text-slate-700 block mb-1.5">Tay thuận</label>
            <select name="hand" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
              <option ${u.hand.includes('phải') ? 'selected' : ''}>Thuận tay phải</option>
              <option ${u.hand.includes('trái') ? 'selected' : ''}>Thuận tay trái</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-semibold text-slate-700 block mb-1.5">Khu vực</label>
            <input name="region" type="text" value="${escapeHtml(u.region)}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
        </div>
        <div class="flex items-center justify-between pt-2">
          <a href="#/member/${u.id}" class="text-sm text-slate-500 hover:text-brand-600">Xem hồ sơ công khai →</a>
          <button type="submit" class="btn-primary">Lưu thay đổi</button>
        </div>
      </form>
    </div>`
}

function viewRating() {
  const u = state.user
  const tx = ratingTransactionsForMember(u.id)
  return `<div class="max-w-3xl mx-auto px-4 py-10">
      ${sectionHead('Tiến bộ', 'Rating & thứ hạng', '')}
      <div class="card p-6 mb-8 text-center">
        <div class="font-display text-5xl font-extrabold text-brand-600 mb-1">${u.rating}</div>
        <div class="flex items-center justify-center gap-3 mb-5">${levelBadgeHTML(u.level)}<span class="text-sm text-slate-500">Hạng #${u.rank}</span>${rankChangeHTML(u.rankChange)}</div>
        ${sparklineSVG(u.ratingHistory, { height: 120 })}
      </div>
      <div class="card overflow-hidden">
        <div class="p-4 border-b border-slate-100 font-display font-bold">Lịch sử thay đổi rating</div>
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase"><tr><th class="py-2 px-4 text-left">Trận</th><th class="py-2 px-4 text-left">Ngày</th><th class="py-2 px-4 text-left">Trước</th><th class="py-2 px-4 text-left">Thay đổi</th><th class="py-2 px-4 text-left">Sau</th></tr></thead>
          <tbody>
            ${
              tx
                .map(
                  t => `<tr class="border-b border-slate-100 last:border-0">
                  <td class="py-2.5 px-4">${escapeHtml(FORMAT_LABELS[t.match.format])}</td>
                  <td class="py-2.5 px-4 text-slate-500">${fmtDate(t.match.date)}</td>
                  <td class="py-2.5 px-4 text-slate-500">${t.before}</td>
                  <td class="py-2.5 px-4 font-semibold ${t.delta > 0 ? 'text-emerald-600' : 'text-rose-500'}">${t.delta > 0 ? '+' : ''}${t.delta}</td>
                  <td class="py-2.5 px-4 font-semibold">${t.after}</td>
                </tr>`
                )
                .join('') || `<tr><td colspan="5" class="py-8 text-center text-slate-400">Chưa có trận nào được tính rating.</td></tr>`
            }
          </tbody>
        </table>
      </div>
      <p class="text-xs text-slate-400 mt-3">* Số liệu minh họa cho bản prototype — thuật toán rating chính thức (K-factor, rating khởi tạo...) sẽ được chốt ở Phase 0 theo tài liệu đặc tả.</p>
    </div>`
}

function viewMyMatches() {
  const list = myMatches(state.user.id)
  return `<div class="max-w-4xl mx-auto px-4 py-10">
      ${sectionHead('Cá nhân', 'Lịch sử trận đấu của tôi', `${list.length} trận đã ghi nhận`)}
      <div class="space-y-3">${list.map(matchRowHTML).join('') || emptyState('🎾', 'Chưa có trận đấu nào', 'Nhập kết quả trận đầu tiên của bạn ngay!', `<a href="#/submit-result" class="btn-primary">Nhập kết quả</a>`)}</div>
    </div>`
}

function viewMyEvents() {
  const list = myRegisteredEvents(state.user.id)
  return `<div class="max-w-4xl mx-auto px-4 py-10">
      ${sectionHead('Cá nhân', 'Sự kiện của tôi', '')}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${
          list
            .map(e => {
              const canCancel = e.status === 'registration_open'
              return `<div class="card p-4">
              <div class="flex items-center gap-2 mb-2">${eventStatusBadge(e.status)}<span class="text-xs text-slate-400">${escapeHtml(EVENT_TYPE_LABELS[e.type])}</span></div>
              <a href="#/event/${e.id}" class="font-display font-bold text-slate-900 hover:text-brand-600">${escapeHtml(e.name)}</a>
              <p class="text-xs text-slate-500 mt-1">📅 ${fmtDateTime(e.startAt)}</p>
              ${canCancel ? `<button type="button" class="btn-danger text-xs mt-3" data-action="unregister-event" data-event="${e.id}">Hủy đăng ký</button>` : ''}
            </div>`
            })
            .join('') || `<div class="sm:col-span-2">${emptyState('📅', 'Chưa đăng ký sự kiện nào', 'Khám phá lịch hoạt động và đăng ký ngay!', `<a href="#/events" class="btn-primary">Xem sự kiện</a>`)}</div>`
        }
      </div>
    </div>`
}

function viewAchievements() {
  const u = state.user
  return `<div class="max-w-4xl mx-auto px-4 py-10">
      ${sectionHead('Cá nhân', 'Thành tích của tôi', `${u.achievements.length}/${ACHIEVEMENTS_CATALOG.length} đã mở khóa`)}
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        ${ACHIEVEMENTS_CATALOG.map(a => {
          const unlocked = u.achievements.includes(a.id)
          return `<div class="card p-4 text-center ${unlocked ? '' : 'opacity-40 grayscale'}">
              <div class="text-3xl mb-2">${a.icon}</div>
              <div class="font-display font-bold text-sm mb-1">${escapeHtml(a.name)}</div>
              <div class="text-xs text-slate-500">${escapeHtml(a.desc)}</div>
              ${unlocked ? `<div class="text-xs text-emerald-600 font-semibold mt-2">✓ Đã đạt</div>` : `<div class="text-xs text-slate-400 mt-2">🔒 Chưa mở khóa</div>`}
            </div>`
        }).join('')}
      </div>
    </div>`
}

// ---------------------------------------------------------------------------
// "Nhập kết quả" — wizard nhiều bước (12.2 trong đặc tả)
// ---------------------------------------------------------------------------
const FORMAT_SLOT_COUNT = { singles: 1, mens_doubles: 2, womens_doubles: 2, mixed_doubles: 2, team_3v3: 3 }
const WIZARD_FORMATS = ['singles', 'mens_doubles', 'womens_doubles', 'mixed_doubles', 'team_3v3']
const WIZARD_STEP_LABELS = ['Trận đấu', 'Thể thức', 'Người chơi', 'Tỷ số', 'Xem lại']

const wizard = {
  step: 1,
  eventId: '',
  format: '',
  sideA: [],
  sideB: [],
  games: [{ a: '', b: '' }],
  notes: ''
}

function resetWizard() {
  wizard.step = 1
  wizard.eventId = ''
  wizard.format = ''
  wizard.sideA = state.user ? [state.user.id] : []
  wizard.sideB = []
  wizard.games = [{ a: '', b: '' }]
  wizard.notes = ''
}

function initSubmitResultWizard() {
  resetWizard()
  renderWizardStep()
}

function renderWizardStep() {
  const root = document.getElementById('wizardRoot')
  if (!root) return
  root.innerHTML = wizardProgressHTML() + wizardPanelHTML()
}

function wizardProgressHTML() {
  return `<div class="flex items-center gap-1 mb-8">
      ${WIZARD_STEP_LABELS.map((label, i) => {
        const n = i + 1
        const state_ = wizard.step === n ? 'current' : wizard.step > n ? 'done' : 'todo'
        return `<div class="flex-1 text-center">
            <div class="w-8 h-8 mx-auto rounded-full grid place-items-center text-xs font-bold ${state_ === 'current' ? 'bg-brand-500 text-white' : state_ === 'done' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}">${state_ === 'done' ? '✓' : n}</div>
            <div class="text-[11px] mt-1 text-slate-500 hidden sm:block">${label}</div>
          </div>`
      }).join('')}
    </div>`
}

function memberOptionsHTML(filterFn, selectedId) {
  return MEMBERS.filter(filterFn)
    .map(m => `<option value="${m.id}" ${m.id === selectedId ? 'selected' : ''}>${escapeHtml(m.displayName)}</option>`)
    .join('')
}

function wizardNavButtons(nextLabel) {
  return `<div class="flex items-center justify-between mt-6">
      ${wizard.step > 1 ? `<button type="button" class="btn-ghost" data-action="wizard-back">← Quay lại</button>` : `<a href="#/dashboard" class="btn-ghost">Hủy</a>`}
      <button type="button" class="btn-primary" data-action="wizard-next" id="wizardNextBtn">${nextLabel || 'Tiếp tục →'}</button>
    </div>`
}

function wizardPanelHTML() {
  if (wizard.step === 1) {
    const options = EVENTS.filter(e => ['registration_open', 'registration_closed', 'in_progress', 'completed'].includes(e.status))
    return `<div class="card p-6">
        <h3 class="font-display font-bold mb-1">Trận đấu này thuộc sự kiện nào?</h3>
        <p class="text-sm text-slate-500 mb-4">Chọn sự kiện nếu trận đấu diễn ra trong khuôn khổ 1 sự kiện của CLB, hoặc để trống nếu là trận tự phát.</p>
        <select id="wizardEventSelect" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
          <option value="">— Trận độc lập (không thuộc sự kiện) —</option>
          ${options.map(e => `<option value="${e.id}" ${wizard.eventId === e.id ? 'selected' : ''}>${escapeHtml(e.name)}</option>`).join('')}
        </select>
        ${wizardNavButtons()}
      </div>`
  }

  if (wizard.step === 2) {
    return `<div class="card p-6">
        <h3 class="font-display font-bold mb-1">Chọn thể thức</h3>
        <p class="text-sm text-slate-500 mb-4">Đồng đội 4v4/6v6 hiện được quản lý riêng theo từng giải đấu — dùng trang giải đấu tương ứng để nhập kết quả các nội dung này.</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          ${WIZARD_FORMATS.map(
            f => `<label class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer ${wizard.format === f ? 'border-brand-400 bg-brand-50' : 'border-slate-200'}">
                <input type="radio" name="wizardFormat" value="${f}" ${wizard.format === f ? 'checked' : ''} class="accent-[#F1105B]" />
                <span class="text-sm font-semibold">${escapeHtml(FORMAT_LABELS[f])}</span>
              </label>`
          ).join('')}
        </div>
        ${wizardNavButtons()}
      </div>`
  }

  if (wizard.step === 3) {
    const count = FORMAT_SLOT_COUNT[wizard.format] || 2
    const genderFor = i => {
      if (wizard.format === 'mens_doubles') return 'male'
      if (wizard.format === 'womens_doubles') return 'female'
      if (wizard.format === 'mixed_doubles') return i === 0 ? 'male' : 'female'
      return null
    }
    const slotLabel = g => (g === 'male' ? ' (nam)' : g === 'female' ? ' (nữ)' : '')
    const sideASelects = []
    for (let i = 1; i < count; i++) {
      const g = genderFor(i)
      sideASelects.push(`<select data-wizard-slot="A-${i}" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mb-2">
          <option value="">— Chọn đồng đội${slotLabel(g)} —</option>
          ${memberOptionsHTML(g ? m => m.gender === g : () => true, wizard.sideA[i])}
        </select>`)
    }
    const sideBSelects = []
    for (let i = 0; i < count; i++) {
      const g = genderFor(i)
      sideBSelects.push(`<select data-wizard-slot="B-${i}" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mb-2">
          <option value="">— Chọn VĐV${slotLabel(g)} —</option>
          ${memberOptionsHTML(g ? m => m.gender === g : () => true, wizard.sideB[i])}
        </select>`)
    }
    return `<div class="card p-6">
        <h3 class="font-display font-bold mb-4">Chọn người chơi 2 bên</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div class="text-xs font-bold uppercase text-slate-400 mb-2">Bên A (có bạn)</div>
            <div class="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 mb-2">${avatarHTML(state.user, 28)}<span class="text-sm font-semibold">${escapeHtml(state.user.displayName)} (bạn)</span></div>
            ${sideASelects.join('')}
          </div>
          <div>
            <div class="text-xs font-bold uppercase text-slate-400 mb-2">Bên B (đối thủ)</div>
            ${sideBSelects.join('')}
          </div>
        </div>
        ${wizardNavButtons()}
      </div>`
  }

  if (wizard.step === 4) {
    return `<div class="card p-6">
        <h3 class="font-display font-bold mb-1">Nhập tỷ số từng ván</h3>
        <p class="text-sm text-slate-500 mb-4">Mỗi ván phải xác định được bên thắng (không hòa).</p>
        <div id="wizardGamesWrap" class="space-y-3">
          ${wizard.games
            .map(
              (g, i) => `<div class="flex items-center gap-3" data-game-row data-idx="${i}">
                <span class="text-xs font-bold text-slate-400 w-14">Ván ${i + 1}</span>
                <input type="number" min="0" data-side="a" value="${g.a}" class="w-20 px-3 py-2 rounded-lg border border-slate-200 text-sm text-center" placeholder="Bên A" />
                <span class="text-slate-400">–</span>
                <input type="number" min="0" data-side="b" value="${g.b}" class="w-20 px-3 py-2 rounded-lg border border-slate-200 text-sm text-center" placeholder="Bên B" />
                ${wizard.games.length > 1 ? `<button type="button" class="text-rose-500 text-sm" data-action="wizard-remove-game" data-idx="${i}">Xóa</button>` : ''}
              </div>`
            )
            .join('')}
        </div>
        <button type="button" class="btn-ghost text-sm mt-3" data-action="wizard-add-game">+ Thêm ván</button>
        <div class="mt-4">
          <label class="text-sm font-semibold text-slate-700 block mb-1.5">Ghi chú (không bắt buộc)</label>
          <textarea id="wizardNotes" rows="2" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm">${escapeHtml(wizard.notes)}</textarea>
        </div>
        ${wizardNavButtons()}
      </div>`
  }

  // Step 5 — review
  const sideAMembers = wizard.sideA.map(memberById).filter(Boolean)
  const sideBMembers = wizard.sideB.map(memberById).filter(Boolean)
  const ev = wizard.eventId ? eventById(wizard.eventId) : null
  return `<div class="card p-6">
      <h3 class="font-display font-bold mb-4">Xem lại trước khi gửi</h3>
      <div class="space-y-2 text-sm mb-5">
        <div class="flex justify-between"><span class="text-slate-400">Sự kiện</span><span class="font-semibold">${ev ? escapeHtml(ev.name) : 'Trận độc lập'}</span></div>
        <div class="flex justify-between"><span class="text-slate-400">Thể thức</span><span class="font-semibold">${escapeHtml(FORMAT_LABELS[wizard.format])}</span></div>
        <div class="flex justify-between"><span class="text-slate-400">Bên A</span><span class="font-semibold">${sideAMembers.map(m => escapeHtml(m.displayName)).join(' + ')}</span></div>
        <div class="flex justify-between"><span class="text-slate-400">Bên B</span><span class="font-semibold">${sideBMembers.map(m => escapeHtml(m.displayName)).join(' + ')}</span></div>
        <div class="flex justify-between"><span class="text-slate-400">Tỷ số</span><span class="font-semibold">${wizard.games.map(g => `${g.a}-${g.b}`).join(', ')}</span></div>
      </div>
      <div class="p-4 rounded-xl bg-amber-50 text-xs text-amber-700 mb-5">⏳ Sau khi gửi, đối thủ sẽ nhận thông báo để xác nhận kết quả. Rating chỉ được cập nhật sau khi trận đấu được xác nhận.</div>
      <div class="flex items-center justify-between">
        <button type="button" class="btn-ghost" data-action="wizard-back">← Quay lại</button>
        <button type="button" class="btn-primary" id="wizardSubmitBtn" data-action="wizard-submit">Gửi kết quả</button>
      </div>
    </div>`
}

function syncWizardGamesFromDOM() {
  const rows = document.querySelectorAll('[data-game-row]')
  if (!rows.length) return
  wizard.games = Array.from(rows).map(row => ({
    a: row.querySelector('[data-side="a"]').value,
    b: row.querySelector('[data-side="b"]').value
  }))
  const notesEl = document.getElementById('wizardNotes')
  if (notesEl) wizard.notes = notesEl.value
}

function handleWizardNext() {
  if (wizard.step === 1) {
    wizard.eventId = document.getElementById('wizardEventSelect').value
  } else if (wizard.step === 2) {
    const checked = document.querySelector('input[name="wizardFormat"]:checked')
    if (!checked) return toast('Vui lòng chọn thể thức.', 'error')
    wizard.format = checked.value
    wizard.sideA = [state.user.id]
    wizard.sideB = []
  } else if (wizard.step === 3) {
    const count = FORMAT_SLOT_COUNT[wizard.format] || 2
    const sideA = [state.user.id]
    for (let i = 1; i < count; i++) {
      const v = document.querySelector(`[data-wizard-slot="A-${i}"]`).value
      if (!v) return toast('Vui lòng chọn đủ người chơi cho bên A.', 'error')
      sideA.push(v)
    }
    const sideB = []
    for (let i = 0; i < count; i++) {
      const v = document.querySelector(`[data-wizard-slot="B-${i}"]`).value
      if (!v) return toast('Vui lòng chọn đủ người chơi cho bên B.', 'error')
      sideB.push(v)
    }
    const allIds = [...sideA, ...sideB]
    if (new Set(allIds).size !== allIds.length) return toast('Một người không thể xuất hiện ở cả hai bên.', 'error')
    wizard.sideA = sideA
    wizard.sideB = sideB
  } else if (wizard.step === 4) {
    syncWizardGamesFromDOM()
    const valid = wizard.games.every(g => {
      const a = parseInt(g.a, 10)
      const b = parseInt(g.b, 10)
      return Number.isInteger(a) && Number.isInteger(b) && a >= 0 && b >= 0 && a !== b
    })
    if (!valid) return toast('Tỷ số không hợp lệ — không được âm, để trống hoặc hòa.', 'error')
    wizard.games = wizard.games.map(g => ({ a: parseInt(g.a, 10), b: parseInt(g.b, 10) }))
  }
  wizard.step = Math.min(5, wizard.step + 1)
  renderWizardStep()
}

function handleWizardBack() {
  if (wizard.step === 4) syncWizardGamesFromDOM()
  wizard.step = Math.max(1, wizard.step - 1)
  renderWizardStep()
}

function handleWizardAddGame() {
  syncWizardGamesFromDOM()
  wizard.games.push({ a: '', b: '' })
  renderWizardStep()
}
function handleWizardRemoveGame(idx) {
  syncWizardGamesFromDOM()
  if (wizard.games.length > 1) wizard.games.splice(idx, 1)
  renderWizardStep()
}

function handleWizardSubmit() {
  const btn = document.getElementById('wizardSubmitBtn')
  if (btn) {
    btn.setAttribute('disabled', 'disabled')
    btn.classList.add('is-disabled')
    btn.textContent = 'Đang gửi...'
  }
  setTimeout(() => {
    const newId = `xnew-${MATCHES.length + 1}`
    MATCHES.push({
      id: newId,
      eventId: wizard.eventId || null,
      format: wizard.format,
      sideA: wizard.sideA,
      sideB: wizard.sideB,
      games: wizard.games,
      status: 'submitted',
      submittedBy: state.user.id,
      confirmedBy: [],
      date: new Date().toISOString(),
      notes: wizard.notes || ''
    })
    toast('Đã gửi kết quả — chờ đối thủ xác nhận!', 'success')
    navigate('#/my-matches')
  }, 700)
}

function viewSubmitResult() {
  return `<div class="max-w-2xl mx-auto px-4 py-10">
      ${sectionHead('Cá nhân', 'Nhập kết quả trận đấu', '')}
      <div id="wizardRoot"></div>
    </div>`
}

function viewPendingConfirmations() {
  const u = state.user
  const pending = pendingForUser(u.id)
  const awaiting = awaitingOpponentForUser(u.id)
  const disputed = disputedInvolving(u.id)

  function pendingRowHTML(match) {
    const side = match.sideA.includes(u.id) ? 'A' : 'B'
    const oppIds = side === 'A' ? match.sideB : match.sideA
    const opp = oppIds.map(id => memberById(id)?.displayName).filter(Boolean).join(' + ')
    return `<div class="card p-4">
        ${matchRowHTML(match)}
        <div class="flex items-center gap-2 mt-3">
          <button type="button" class="btn-primary text-sm" data-action="confirm-match" data-match="${match.id}">✅ Xác nhận kết quả</button>
          <button type="button" class="btn-danger text-sm" data-action="toggle-dispute" data-match="${match.id}">🚫 Phản đối</button>
        </div>
        <div id="disputeForm-${match.id}" hidden class="mt-3 p-4 bg-rose-50 rounded-xl border border-rose-100 space-y-3">
          <p class="text-xs text-slate-500">Bạn đang phản đối kết quả do <strong>${escapeHtml(memberById(match.submittedBy)?.displayName || '')}</strong> gửi (đối thủ: ${escapeHtml(opp)}).</p>
          <select data-dispute-reason="${match.id}" class="w-full px-3 py-2 rounded-lg border border-rose-200 text-sm">
            ${DISPUTE_REASONS.map(r => `<option value="${r.id}">${r.label}</option>`).join('')}
          </select>
          <textarea data-dispute-note="${match.id}" rows="2" class="w-full px-3 py-2 rounded-lg border border-rose-200 text-sm" placeholder="Mô tả thêm (không bắt buộc)..."></textarea>
          <div class="flex gap-2">
            <button type="button" class="btn-danger" data-action="submit-dispute" data-match="${match.id}">Gửi phản đối</button>
            <button type="button" class="btn-ghost" data-action="toggle-dispute" data-match="${match.id}">Hủy</button>
          </div>
        </div>
      </div>`
  }

  return `<div class="max-w-4xl mx-auto px-4 py-10">
      ${sectionHead('Cá nhân', 'Kết quả chờ xác nhận', '')}

      <h3 class="font-display font-bold mb-3">Cần bạn xác nhận (${pending.length})</h3>
      <div class="space-y-4 mb-10">${pending.map(pendingRowHTML).join('') || emptyState('✅', 'Không có kết quả nào cần xác nhận', 'Mọi thứ đã cập nhật!')}</div>

      <h3 class="font-display font-bold mb-3">Đang chờ đối thủ xác nhận (${awaiting.length})</h3>
      <div class="space-y-3 mb-10">${awaiting.map(matchRowHTML).join('') || emptyState('⏳', 'Không có kết quả nào đang chờ', '')}</div>

      ${
        disputed.length
          ? `<h3 class="font-display font-bold mb-3">Đang tranh chấp (${disputed.length})</h3><div class="space-y-3">${disputed.map(matchRowHTML).join('')}</div>`
          : ''
      }
    </div>`
}

function viewNotifications() {
  const list = [...state.notifications].sort((a, b) => new Date(b.date) - new Date(a.date))
  return `<div class="max-w-2xl mx-auto px-4 py-10">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="inline-block text-xs font-bold tracking-widest uppercase text-brand-600 mb-1">Cá nhân</span>
          <h2 class="font-display text-2xl font-extrabold text-slate-900">Thông báo</h2>
        </div>
        ${unreadCount() > 0 ? `<button type="button" class="btn-ghost text-sm" data-action="mark-all-read">Đánh dấu tất cả đã đọc</button>` : ''}
      </div>
      <div class="space-y-2">
        ${
          list
            .map(
              n => `<a href="${n.link}" data-action="mark-read" data-id="${n.id}" class="flex items-start gap-3 p-4 rounded-xl border ${n.read ? 'border-slate-100' : 'border-brand-200 bg-brand-50'}">
              <span class="text-xl">${notifIcon(n.type)}</span>
              <div class="flex-1"><p class="text-sm ${n.read ? 'text-slate-600' : 'text-slate-800 font-semibold'}">${escapeHtml(n.text)}</p><p class="text-xs text-slate-400 mt-0.5">${fmtDateTime(n.date)}</p></div>
              ${!n.read ? `<span class="w-2 h-2 rounded-full bg-brand-500 mt-1.5"></span>` : ''}
            </a>`
            )
            .join('') || emptyState('🔔', 'Không có thông báo', '')
        }
      </div>
    </div>`
}
function notifIcon(type) {
  return { match_pending: '⏳', event_reminder: '📅', rating_change: '📈', achievement: '🏅', registration_confirmed: '✅' }[type] || '🔔'
}

function viewSettings() {
  const u = state.user
  const p = u.privacy
  const rows = [
    ['showAge', 'Ngày sinh / tuổi'],
    ['showPhone', 'Số điện thoại'],
    ['showEmail', 'Email'],
    ['showRegion', 'Khu vực sinh sống'],
    ['showRatingChart', 'Biểu đồ rating'],
    ['showMatchHistory', 'Lịch sử trận đấu'],
    ['showEvents', 'Sự kiện đã tham gia']
  ]
  return `<div class="max-w-2xl mx-auto px-4 py-10">
      ${sectionHead('Cá nhân', 'Cài đặt & quyền riêng tư', 'Chọn thông tin nào được hiển thị trên hồ sơ công khai của bạn.')}
      <div class="card p-6 divide-y divide-slate-100">
        ${rows
          .map(
            ([key, label]) => `<label class="flex items-center justify-between py-3 cursor-pointer">
              <span class="text-sm text-slate-700">${label}</span>
              <input type="checkbox" data-action="toggle-privacy" data-key="${key}" ${p[key] ? 'checked' : ''} class="w-5 h-5 accent-[#F1105B]" />
            </label>`
          )
          .join('')}
      </div>
      <p class="text-xs text-slate-400 mt-3">Thông tin nhạy cảm mặc định ở trạng thái riêng tư theo đúng đặc tả sản phẩm.</p>

      <div class="card p-6 mt-6">
        <h3 class="font-display font-bold mb-3">Email thông báo</h3>
        <label class="flex items-center justify-between py-2"><span class="text-sm text-slate-700">Kết quả cần xác nhận</span><input type="checkbox" checked class="w-5 h-5 accent-[#F1105B]" /></label>
        <label class="flex items-center justify-between py-2"><span class="text-sm text-slate-700">Sự kiện sắp diễn ra</span><input type="checkbox" checked class="w-5 h-5 accent-[#F1105B]" /></label>
        <label class="flex items-center justify-between py-2"><span class="text-sm text-slate-700">Bản tin hàng tuần</span><input type="checkbox" class="w-5 h-5 accent-[#F1105B]" /></label>
      </div>
    </div>`
}

// ---------------------------------------------------------------------------
// Event delegation
// ---------------------------------------------------------------------------
document.addEventListener('click', e => {
  // ----- Chrome: banner / lightbox -----
  if (e.target.closest('[data-action="dismiss-banner"]')) {
    document.querySelector('.proto-banner').classList.add('is-hidden')
    return
  }
  const lightboxTrigger = e.target.closest('[data-lightbox]')
  if (lightboxTrigger) {
    openLightbox(lightboxTrigger.dataset.src, lightboxTrigger.dataset.caption)
    return
  }
  if (e.target.closest('[data-action="close-lightbox"]') || e.target.id === 'lightbox') {
    closeLightbox()
    return
  }

  // ----- Auth -----
  if (e.target.closest('[data-action="logout"]')) {
    logout()
    toast('Đã đăng xuất.')
    navigate('#/home')
    return
  }
  const demoBtn = e.target.closest('[data-action="demo-login"]')
  if (demoBtn) {
    login(demoBtn.dataset.member)
    toast(`Đã đăng nhập demo — chào ${memberById(demoBtn.dataset.member).displayName}!`, 'success')
    navigate('#/dashboard')
    render()
    return
  }

  // ----- Filters (đọc lại rồi render riêng phần danh sách, không reload cả trang) -----
  const lbFilter = e.target.closest('[data-action="lb-filter"]')
  if (lbFilter) {
    state.leaderboardFilter[lbFilter.dataset.key] = lbFilter.dataset.value
    render()
    return
  }
  const evFilter = e.target.closest('[data-action="events-filter"]')
  if (evFilter) {
    state.eventsFilter[evFilter.dataset.key] = evFilter.dataset.value
    render()
    return
  }
  const resFilter = e.target.closest('[data-action="results-filter"]')
  if (resFilter) {
    state.resultsFilter[resFilter.dataset.key] = resFilter.dataset.value
    render()
    return
  }

  // ----- Event detail tabs -----
  const tabBtn = e.target.closest('[data-tab-btn]')
  if (tabBtn) {
    const root = tabBtn.closest('[data-tabs-root]')
    root.querySelectorAll('[data-tab-btn]').forEach(b => b.classList.toggle('is-active', b === tabBtn))
    root.querySelectorAll('[data-tab-panel]').forEach(p => {
      p.hidden = p.dataset.tabPanel !== tabBtn.dataset.tabBtn
    })
    return
  }

  // ----- Event registration -----
  const regBtn = e.target.closest('[data-action="register-event"]')
  if (regBtn) {
    const ev = eventById(regBtn.dataset.event)
    if (ev && state.user && !ev.participants.includes(state.user.id)) {
      ev.participants.push(state.user.id)
      toast(ev.participants.length > ev.capacity ? 'Đã thêm vào danh sách chờ!' : 'Đăng ký thành công!', 'success')
      render()
    }
    return
  }
  const unregBtn = e.target.closest('[data-action="unregister-event"]')
  if (unregBtn) {
    const ev = eventById(unregBtn.dataset.event)
    if (ev && state.user) {
      ev.participants = ev.participants.filter(id => id !== state.user.id)
      toast('Đã hủy đăng ký.')
      render()
    }
    return
  }

  // ----- Match confirmation / dispute -----
  const confirmBtn = e.target.closest('[data-action="confirm-match"]')
  if (confirmBtn) {
    const m = matchById(confirmBtn.dataset.match)
    if (m) {
      m.confirmedBy.push(state.user.id)
      m.status = 'rated'
      toast('Đã xác nhận kết quả — rating vừa được cập nhật!', 'success')
      render()
    }
    return
  }
  const toggleDisputeBtn = e.target.closest('[data-action="toggle-dispute"]')
  if (toggleDisputeBtn) {
    const panel = document.getElementById(`disputeForm-${toggleDisputeBtn.dataset.match}`)
    if (panel) panel.hidden = !panel.hidden
    return
  }
  const submitDisputeBtn = e.target.closest('[data-action="submit-dispute"]')
  if (submitDisputeBtn) {
    const matchId = submitDisputeBtn.dataset.match
    const m = matchById(matchId)
    const reasonEl = document.querySelector(`[data-dispute-reason="${matchId}"]`)
    const noteEl = document.querySelector(`[data-dispute-note="${matchId}"]`)
    if (m) {
      m.status = 'disputed'
      m.disputeReason = reasonEl ? reasonEl.value : ''
      m.disputeNote = noteEl ? noteEl.value : ''
      toast('Đã gửi phản đối — Ban tổ chức sẽ xem xét.', 'success')
      render()
    }
    return
  }

  // ----- Notifications -----
  const notifLink = e.target.closest('[data-action="mark-read"]')
  if (notifLink) {
    const n = state.notifications.find(x => x.id === notifLink.dataset.id)
    if (n) n.read = true
    // không preventDefault — để link vẫn điều hướng tới đích liên quan
  }
  const markAllBtn = e.target.closest('[data-action="mark-all-read"]')
  if (markAllBtn) {
    state.notifications.forEach(n => (n.read = true))
    render()
    return
  }

  // ----- Wizard: Nhập kết quả -----
  if (e.target.closest('[data-action="wizard-next"]')) {
    handleWizardNext()
    return
  }
  if (e.target.closest('[data-action="wizard-back"]')) {
    handleWizardBack()
    return
  }
  if (e.target.closest('[data-action="wizard-add-game"]')) {
    handleWizardAddGame()
    return
  }
  const removeGameBtn = e.target.closest('[data-action="wizard-remove-game"]')
  if (removeGameBtn) {
    handleWizardRemoveGame(parseInt(removeGameBtn.dataset.idx, 10))
    return
  }
  if (e.target.closest('[data-action="wizard-submit"]')) {
    handleWizardSubmit()
    return
  }
})

// ----- Toggle switches (quyền riêng tư) — dùng change, không phải click -----
document.addEventListener('change', e => {
  const privacyToggle = e.target.closest('[data-action="toggle-privacy"]')
  if (privacyToggle) {
    state.user.privacy[privacyToggle.dataset.key] = privacyToggle.checked
    toast('Đã lưu.', 'success')
    return
  }

  // Bộ lọc thành viên (select) — không cần debounce vì đây là change, không phải input
  if (e.target.id === 'memberGenderFilter') {
    state.membersFilter.gender = e.target.value
    renderMembersGrid()
  }
  if (e.target.id === 'memberLevelFilter') {
    state.membersFilter.level = e.target.value
    renderMembersGrid()
  }
})

// ----- Ô tìm kiếm thành viên (input, debounce nhẹ để không giật khi gõ) -----
let memberSearchDebounce = null
document.addEventListener('input', e => {
  if (e.target.id === 'memberSearch') {
    clearTimeout(memberSearchDebounce)
    const value = e.target.value
    memberSearchDebounce = setTimeout(() => {
      state.membersFilter.q = value
      renderMembersGrid()
    }, 150)
  }
})

// ----- Forms -----
document.addEventListener('submit', e => {
  if (e.target.id === 'contactForm') {
    e.preventDefault()
    e.target.hidden = true
    const successEl = document.getElementById('contactSuccess')
    if (successEl) successEl.hidden = false
    return
  }
  if (e.target.id === 'loginForm') {
    e.preventDefault()
    toast('Bản prototype chưa có xác thực thật — hãy dùng tài khoản demo bên dưới.', 'error')
    return
  }
  if (e.target.id === 'profileForm') {
    e.preventDefault()
    const fd = new FormData(e.target)
    state.user.displayName = fd.get('displayName') || state.user.displayName
    state.user.bio = fd.get('bio') || state.user.bio
    state.user.hand = fd.get('hand') || state.user.hand
    state.user.region = fd.get('region') || state.user.region
    toast('Đã lưu hồ sơ!', 'success')
    render()
  }
})

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
state.user = loadAuth()
if (state.user) state.notifications = buildNotificationsFor(state.user.id)
window.addEventListener('hashchange', render)
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#/home'
  render()
})
