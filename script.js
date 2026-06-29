// ===== LACA ZOMBIE Championship — landing interactions =====

const ROSTER_KEY = 'laca_roster_v7'
const ROSTER_LIMIT = 16

const DEFAULT_ROSTER = {
  male: [
    'Thanh Thật Thà',
    'Nguyễn Quốc Ân',
    'Thuận Sovo',
    'Mr Shadow',
    'Quang Khánh',
    'Dinh Thanh',
    'Trường Trong Trắng',
    'Minh Dương',
    'Phương Nam',
    'Tomm',
    'Lê Minh Trí',
    'Chen',
    'Mr Quy',
    'Mr Mountain',
    'Phúc Phan',
    'Xuân Trường'
  ],
  female: [
    'Mai Thu',
    'Tiên',
    'Mai Nguyễn',
    'Em Trâm',
    'Thảo Hiếu',
    'Toại Thủy',
    'Ánh Lê',
    'Hoa Vũ',
    'Vân Nguyễn',
    'Minh Thao',
    'Phạm Thoa',
    'Nana Phan',
    'Tuyết Mei',
    'Minh Anh',
    'Diệu',
    'Diệp Ann'
  ]
}

const GROUP_LABELS = ['A', 'B', 'C', 'D']

// --- Sticky nav background on scroll ---
const nav = document.getElementById('nav')
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30)
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

// --- Mobile menu ---
const burger = document.getElementById('burger')
const navLinks = document.getElementById('navLinks')
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open')
  burger.classList.toggle('open', open)
})
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('open')
    burger.classList.remove('open')
  })
)

// --- Countdown to match day: Sun 12 Jul 2026, 07:00 (local) ---
const target = new Date('2026-07-12T07:00:00').getTime()
const pad = n => String(n).padStart(2, '0')
const els = {
  d: document.getElementById('cdD'),
  h: document.getElementById('cdH'),
  m: document.getElementById('cdM'),
  s: document.getElementById('cdS')
}
function tick() {
  const diff = target - Date.now()
  if (diff <= 0) {
    els.d.textContent =
      els.h.textContent =
      els.m.textContent =
      els.s.textContent =
        '00'
    clearInterval(timer)
    return
  }
  const sec = Math.floor(diff / 1000)
  els.d.textContent = pad(Math.floor(sec / 86400))
  els.h.textContent = pad(Math.floor((sec % 86400) / 3600))
  els.m.textContent = pad(Math.floor((sec % 3600) / 60))
  els.s.textContent = pad(sec % 60)
}
tick()
const timer = setInterval(tick, 1000)

// --- Scroll reveal ---
const revealTargets = document.querySelectorAll(
  '.sec-head, .about__media, .pillar, .fcard, .bracket, .rules-note, .group, .gallery__item, .timeline li, .prize, .prizes--mini, .venue__info, .venue__map, .stat, .roster-col, .draw-phase'
)
revealTargets.forEach(el => el.classList.add('reveal'))
const io = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in')
        io.unobserve(e.target)
      }
    })
  },
  { threshold: 0.12 }
)
revealTargets.forEach(el => io.observe(el))

// --- Animated stat counters ---
const counters = document.querySelectorAll('.stat__num[data-count]')
const cio = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return
      const el = e.target
      const end = parseInt(el.dataset.count, 10)
      let cur = 0
      const step = Math.max(1, Math.round(end / 40))
      const run = () => {
        cur = Math.min(end, cur + step)
        el.textContent = cur
        if (cur < end) requestAnimationFrame(run)
      }
      run()
      cio.unobserve(el)
    })
  },
  { threshold: 0.5 }
)
counters.forEach(el => cio.observe(el))

// --- Utilities ---
function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function teamLabel(pair) {
  return `${pair.male.name} & ${pair.female.name}`
}

// --- Roster state ---
function loadRoster() {
  try {
    const raw = localStorage.getItem(ROSTER_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (Array.isArray(data.male) && Array.isArray(data.female)) return data
    }
  } catch (_e) { /* use default */ }
  return {
    male: DEFAULT_ROSTER.male.map(name => ({ id: uid(), name })),
    female: DEFAULT_ROSTER.female.map(name => ({ id: uid(), name }))
  }
}

let roster = loadRoster()

const maleList = document.getElementById('maleList')
const femaleList = document.getElementById('femaleList')
const maleCount = document.getElementById('maleCount')
const femaleCount = document.getElementById('femaleCount')
const rosterSummary = document.getElementById('rosterSummary')
const statRegistered = document.getElementById('statRegistered')

const pairsGrid = document.getElementById('pairsGrid')
const groupsGrid = document.getElementById('groupsGrid')
const scheduleGrid = document.getElementById('scheduleGrid')
const phasePairs = document.getElementById('phasePairs')
const phaseGroups = document.getElementById('phaseGroups')
const phaseSchedule = document.getElementById('phaseSchedule')

function renderRosterList(listEl, players, gender) {
  listEl.innerHTML = ''
  if (!players.length) {
    const empty = document.createElement('li')
    empty.className = 'roster-list__empty'
    empty.textContent = gender === 'male' ? 'Chưa có VĐV nam.' : 'Chưa có VĐV nữ.'
    listEl.appendChild(empty)
    return
  }
  players.forEach((p, i) => {
    const li = document.createElement('li')
    li.dataset.id = p.id
    li.innerHTML = `
      <span class="pair__no">${pad(i + 1)}</span>
      <span class="roster__name">
        <small class="roster__code">${gender === 'male' ? 'Nam' : 'Nữ'} ${pad(i + 1)}</small>
        ${escapeHtml(p.name)}
      </span>
    `
    listEl.appendChild(li)
  })
}

function updateRosterUI() {
  renderRosterList(maleList, roster.male, 'male')
  renderRosterList(femaleList, roster.female, 'female')

  const m = roster.male.length
  const f = roster.female.length
  const total = m + f

  maleCount.textContent = `${m}/${ROSTER_LIMIT}`
  femaleCount.textContent = `${f}/${ROSTER_LIMIT}`
  maleCount.classList.toggle('is-full', m >= ROSTER_LIMIT)
  femaleCount.classList.toggle('is-full', f >= ROSTER_LIMIT)
  rosterSummary.textContent = `${total}/32 suất`

  if (statRegistered) {
    statRegistered.textContent = total
    statRegistered.dataset.count = String(total)
  }
}

// --- Draw render ---

function renderPairs(pairs) {
  phasePairs.classList.add('is-active', 'is-done')
  pairsGrid.innerHTML = ''
  pairs.forEach((pair, i) => {
    const card = document.createElement('div')
    card.className = 'draw-pair is-visible is-locked'
    card.innerHTML = `
      <span class="draw-pair__no">Cặp ${pad(i + 1)}</span>
      <div class="draw-pair__names">
        ${escapeHtml(pair.male.name)}
        <span>+</span>
        ${escapeHtml(pair.female.name)}
      </div>
    `
    pairsGrid.appendChild(card)
  })
}

function renderGroups(groups) {
  phaseGroups.classList.add('is-active', 'is-done')
  groupsGrid.innerHTML = ''
  groups.forEach((teams, gi) => {
    const block = document.createElement('div')
    block.className = 'draw-group is-visible'
    block.innerHTML = `
      <div class="draw-group__head">
        <span class="draw-group__badge">${GROUP_LABELS[gi]}</span>
        <h4>Bảng ${GROUP_LABELS[gi]}</h4>
      </div>
      <ul class="draw-group__teams"></ul>
    `
    const ul = block.querySelector('.draw-group__teams')
    teams.forEach(pair => {
      const li = document.createElement('li')
      li.className = 'is-visible'
      li.textContent = teamLabel(pair)
      ul.appendChild(li)
    })
    groupsGrid.appendChild(block)
  })
}

function renderSchedule(groupSchedules) {
  phaseSchedule.classList.add('is-active', 'is-done')
  scheduleGrid.innerHTML = ''
  groupSchedules.forEach((matches, gi) => {
    const block = document.createElement('div')
    block.className = 'schedule-group is-visible'
    block.innerHTML = `<h4>Bảng ${GROUP_LABELS[gi]}</h4><ol></ol>`
    const ol = block.querySelector('ol')
    matches.forEach((match, mi) => {
      const li = document.createElement('li')
      li.className = 'is-visible'
      li.innerHTML = `
        <span class="schedule-group__no">${pad(mi + 1)}</span>
        <span class="schedule-group__match">
          <strong>${escapeHtml(teamLabel(match.a))}</strong>
          vs
          <strong>${escapeHtml(teamLabel(match.b))}</strong>
        </span>
      `
      ol.appendChild(li)
    })
    scheduleGrid.appendChild(block)
  })
}

// === Kết quả chính thức ===
;(function () {
  const mk = (m, f) => ({ male: { name: m }, female: { name: f } })
  const pairs = [
    mk('Nguyễn Quốc Ân',    'Minh Thao'),
    mk('Phúc Phan',          'Ánh Lê'),
    mk('Xuân Trường',        'Em Trâm'),
    mk('Trường Trong Trắng', 'Hoa Vũ'),
    mk('Thanh Thật Thà',     'Mai Nguyễn'),
    mk('Minh Dương',         'Tuyết Mei'),
    mk('Chen',               'Diệu'),
    mk('Mr Shadow',          'Minh Anh'),
    mk('Quang Khánh',        'Mai Thu'),
    mk('Dinh Thanh',         'Toại Thủy'),
    mk('Phương Nam',         'Thảo Hiếu'),
    mk('Thuận Sovo',         'Nana Phan'),
    mk('Tomm',               'Vân Nguyễn'),
    mk('Mr Mountain',        'Phạm Thoa'),
    mk('Mr Quy',             'Tiên'),
    mk('Lê Minh Trí',        'Diệp Ann'),
  ].map((p, i) => ({ ...p, id: i + 1 }))

  const G = (...ids) => ids.map(i => pairs[i - 1])
  const groups = [
    G(1, 11, 14, 12),  // Bảng A
    G(7,  4,  8, 13),  // Bảng B
    G(2,  6, 15,  9),  // Bảng C
    G(10, 3, 16,  5),  // Bảng D
  ]

  const v = (a, b) => ({ a, b })
  const groupSchedules = [
    // Bảng A
    [v(groups[0][2], groups[0][3]), v(groups[0][0], groups[0][1]),
     v(groups[0][0], groups[0][3]), v(groups[0][1], groups[0][2]),
     v(groups[0][1], groups[0][3]), v(groups[0][0], groups[0][2])],
    // Bảng B
    [v(groups[1][0], groups[1][3]), v(groups[1][1], groups[1][2]),
     v(groups[1][1], groups[1][3]), v(groups[1][0], groups[1][2]),
     v(groups[1][2], groups[1][3]), v(groups[1][0], groups[1][1])],
    // Bảng C
    [v(groups[2][1], groups[2][2]), v(groups[2][0], groups[2][3]),
     v(groups[2][0], groups[2][2]), v(groups[2][1], groups[2][3]),
     v(groups[2][0], groups[2][1]), v(groups[2][2], groups[2][3])],
    // Bảng D
    [v(groups[3][0], groups[3][3]), v(groups[3][1], groups[3][2]),
     v(groups[3][1], groups[3][3]), v(groups[3][0], groups[3][2]),
     v(groups[3][0], groups[3][1]), v(groups[3][2], groups[3][3])],
  ]

  renderPairs(pairs)
  renderGroups(groups)
  renderSchedule(groupSchedules)
})()

updateRosterUI()
