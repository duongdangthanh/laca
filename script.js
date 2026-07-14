// ===== LACA ZOMBIE Championship — landing interactions =====

const ROSTER_KEY = 'laca_roster_v7'
const SCORE_STATE_KEY = 'laca_group_score_state_v1'
const KNOCKOUT_SCORE_STATE_KEY = 'laca_knockout_score_state_v1'
const ROSTER_LIMIT = 16

const DEFAULT_ROSTER = {
  male: [
    'Thanh Thật Thà',
    'Nguyễn Quốc Ân',
    'Thuận Sovo',
    'Tùng Nè',
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
    'Mai Trân',
    'Ánh Lê',
    'Hoa Vũ',
    'Vân Nguyễn',
    'Minh Thảo',
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
let timer = null
function tick() {
  const diff = target - Date.now()
  if (diff <= 0) {
    els.d.textContent =
      els.h.textContent =
      els.m.textContent =
      els.s.textContent =
        '00'
    if (timer) clearInterval(timer)
    return
  }
  const sec = Math.floor(diff / 1000)
  els.d.textContent = pad(Math.floor(sec / 86400))
  els.h.textContent = pad(Math.floor((sec % 86400) / 3600))
  els.m.textContent = pad(Math.floor((sec % 3600) / 60))
  els.s.textContent = pad(sec % 60)
}
tick()
timer = setInterval(tick, 1000)

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
  } catch (_e) {
    /* use default */
  }
  return {
    male: DEFAULT_ROSTER.male.map(name => ({ id: uid(), name })),
    female: DEFAULT_ROSTER.female.map(name => ({ id: uid(), name }))
  }
}

function loadScoreState() {
  try {
    const raw = localStorage.getItem(SCORE_STATE_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : {}
  } catch (_e) {
    return {}
  }
}

function saveScoreState() {
  localStorage.setItem(SCORE_STATE_KEY, JSON.stringify(scoreState))
}

function loadKnockoutScoreState() {
  try {
    const raw = localStorage.getItem(KNOCKOUT_SCORE_STATE_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : {}
  } catch (_e) {
    return {}
  }
}

function saveKnockoutScoreState() {
  localStorage.setItem(
    KNOCKOUT_SCORE_STATE_KEY,
    JSON.stringify(knockoutScoreState)
  )
}

let roster = loadRoster()
let scoreState = loadScoreState()
let knockoutScoreState = loadKnockoutScoreState()

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
const bracketEl = document.querySelector('.bracket')

let currentPairs = []
let currentGroups = []
let currentGroupSchedules = []
let qualifierSignature = ''
let knockoutMatchSides = {}

function renderRosterList(listEl, players, gender) {
  listEl.innerHTML = ''
  if (!players.length) {
    const empty = document.createElement('li')
    empty.className = 'roster-list__empty'
    empty.textContent =
      gender === 'male' ? 'Chưa có VĐV nam.' : 'Chưa có VĐV nữ.'
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
    block.innerHTML = `
      <h4>Bảng ${GROUP_LABELS[gi]}</h4>
      <ol></ol>
      <div class="group-standings">
        <h5>Bảng xếp hạng</h5>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Đội</th>
              <th>Tr</th>
              <th>T</th>
              <th>B</th>
              <th>HS</th>
              <th>Điểm</th>
            </tr>
          </thead>
          <tbody data-standings-body="${gi}"></tbody>
        </table>
      </div>
    `
    const ol = block.querySelector('ol')
    matches.forEach((match, mi) => {
      const matchId = `G${gi + 1}-M${mi + 1}`
      const saved = scoreState[matchId] || {}
      const scoreA = Number.isInteger(saved.a) ? saved.a : ''
      const scoreB = Number.isInteger(saved.b) ? saved.b : ''
      const status = getGroupMatchStatus(saved)
      const li = document.createElement('li')
      li.className = 'is-visible'
      li.innerHTML = `
        <span class="schedule-group__no">${pad(mi + 1)}</span>
        <span class="schedule-group__match">
          <strong>${escapeHtml(teamLabel(match.a))}</strong>
          <span class="schedule-group__score-inputs">
            <input type="number" min="0" step="1" inputmode="numeric" data-match-id="${matchId}" data-side="a" value="${scoreA}" />
            <span>-</span>
            <input type="number" min="0" step="1" inputmode="numeric" data-match-id="${matchId}" data-side="b" value="${scoreB}" />
          </span>
          <strong>${escapeHtml(teamLabel(match.b))}</strong>
        </span>
        <span class="schedule-group__status ${status.cls}" data-match-status="${matchId}" title="${status.title}" aria-label="${status.title}">
          ${status.icon}
        </span>
      `
      ol.appendChild(li)
    })
    scheduleGrid.appendChild(block)
    renderStandingsForGroup(gi)
  })
  applyKnockoutBracket(false)
}

function isCompletedGroupMatchScore(a, b) {
  return Number.isInteger(a) && Number.isInteger(b) && (a >= 11 || b >= 11)
}

function getGroupMatchStatus(saved) {
  const a = saved && Number.isInteger(saved.a) ? saved.a : null
  const b = saved && Number.isInteger(saved.b) ? saved.b : null

  if (isCompletedGroupMatchScore(a, b)) {
    return { cls: 'is-complete', icon: '✓', title: 'Hoan thanh' }
  }
  if (a !== null || b !== null) {
    return { cls: 'is-live', icon: '●', title: 'Dang thi dau' }
  }
  return { cls: 'is-pending', icon: '○', title: 'Chua thi dau' }
}

function getTeamStatsMap(groupIndex) {
  const teams = currentGroups[groupIndex] || []
  const schedules = currentGroupSchedules[groupIndex] || []
  const stats = new Map()

  teams.forEach(team => {
    stats.set(team.id, {
      id: team.id,
      name: teamLabel(team),
      played: 0,
      wins: 0,
      losses: 0,
      scored: 0,
      conceded: 0,
      diff: 0,
      points: 0
    })
  })

  schedules.forEach((match, matchIndex) => {
    const matchId = `G${groupIndex + 1}-M${matchIndex + 1}`
    const saved = scoreState[matchId]
    if (!saved || !isCompletedGroupMatchScore(saved.a, saved.b)) return

    const a = stats.get(match.a.id)
    const b = stats.get(match.b.id)
    if (!a || !b) return

    a.played += 1
    b.played += 1
    a.scored += saved.a
    a.conceded += saved.b
    b.scored += saved.b
    b.conceded += saved.a

    if (saved.a > saved.b) {
      a.wins += 1
      b.losses += 1
      a.points += 3
    } else if (saved.b > saved.a) {
      b.wins += 1
      a.losses += 1
      b.points += 3
    } else {
      a.points += 1
      b.points += 1
    }
  })

  for (const row of stats.values()) {
    row.diff = row.scored - row.conceded
  }

  return [...stats.values()].sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points
    if (y.diff !== x.diff) return y.diff - x.diff
    if (y.scored !== x.scored) return y.scored - x.scored
    return x.name.localeCompare(y.name, 'vi')
  })
}

function getCompletedGroupMatchCount(groupIndex) {
  const schedules = currentGroupSchedules[groupIndex] || []
  let count = 0
  schedules.forEach((_, matchIndex) => {
    const matchId = `G${groupIndex + 1}-M${matchIndex + 1}`
    const saved = scoreState[matchId]
    if (saved && isCompletedGroupMatchScore(saved.a, saved.b)) count += 1
  })
  return count
}

function renderStandingsForGroup(groupIndex) {
  const tbody = scheduleGrid.querySelector(
    `[data-standings-body="${groupIndex}"]`
  )
  if (!tbody) return
  const rows = getTeamStatsMap(groupIndex)
  tbody.innerHTML = ''

  rows.forEach((row, i) => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${escapeHtml(row.name)}</td>
      <td>${row.played}</td>
      <td>${row.wins}</td>
      <td>${row.losses}</td>
      <td>${row.diff > 0 ? '+' : ''}${row.diff}</td>
      <td>${row.points}</td>
    `
    tbody.appendChild(tr)
  })
}

function updateGroupMatchStatus(matchId) {
  const statusEl = scheduleGrid.querySelector(
    `[data-match-status="${matchId}"]`
  )
  if (!statusEl) return
  const saved = scoreState[matchId] || {}
  const status = getGroupMatchStatus(saved)
  statusEl.textContent = status.icon
  statusEl.title = status.title
  statusEl.setAttribute('aria-label', status.title)
  statusEl.classList.toggle('is-complete', status.cls === 'is-complete')
  statusEl.classList.toggle('is-live', status.cls === 'is-live')
  statusEl.classList.toggle('is-pending', status.cls === 'is-pending')
}

function findTeamById(groupIndex, teamId) {
  const teams = currentGroups[groupIndex] || []
  return teams.find(team => team.id === teamId) || null
}

function getRankedTeams(groupIndex) {
  return getTeamStatsMap(groupIndex)
    .map(row => findTeamById(groupIndex, row.id))
    .filter(Boolean)
}

function setBracketSlot(slot, value) {
  const el = document.querySelector(`[data-slot="${slot}"]`)
  if (!el) return
  el.textContent = value
}

function isResolvedTeam(v) {
  return !!(v && typeof v === 'object' && v.male && v.female)
}

function slotLabel(v) {
  return isResolvedTeam(v) ? teamLabel(v) : v
}

function normalizeKnockoutScoreInput(code) {
  const pair = knockoutScoreState[code] || {}
  const a = Number.isInteger(pair.a) ? pair.a : null
  const b = Number.isInteger(pair.b) ? pair.b : null
  return { a, b }
}

// sideA/sideB are either a resolved pair object ({id, male, female}) or a
// placeholder label string (e.g. 'Nhất A') while the qualifier isn't known yet.
function getKnockoutOutcome(code, sideA, sideB) {
  const { a, b } = normalizeKnockoutScoreInput(code)
  if (!isResolvedTeam(sideA) || !isResolvedTeam(sideB) || a === null || b === null || a === b) {
    return { winner: null, loser: null }
  }
  return a > b
    ? { winner: sideA, loser: sideB }
    : { winner: sideB, loser: sideA }
}

function setKnockoutInputsFromState() {
  if (!bracketEl) return
  bracketEl.querySelectorAll('input[data-ko-match]').forEach(input => {
    const code = input.dataset.koMatch
    const side = input.dataset.side
    if (!code || (side !== 'a' && side !== 'b')) return
    const pair = knockoutScoreState[code] || {}
    input.value = Number.isInteger(pair[side]) ? String(pair[side]) : ''
  })
}

function applyKnockoutBracket(resetIfQualifierChanged) {
  const readyA = getCompletedGroupMatchCount(0) > 0
  const readyB = getCompletedGroupMatchCount(1) > 0
  const readyC = getCompletedGroupMatchCount(2) > 0
  const readyD = getCompletedGroupMatchCount(3) > 0

  const rankedA = readyA ? getRankedTeams(0) : []
  const rankedB = readyB ? getRankedTeams(1) : []
  const rankedC = readyC ? getRankedTeams(2) : []
  const rankedD = readyD ? getRankedTeams(3) : []

  const qf = {
    TK1A: rankedA[0] || 'Nhất A',
    TK1B: rankedB[1] || 'Nhì B',
    TK2A: rankedC[0] || 'Nhất C',
    TK2B: rankedD[1] || 'Nhì D',
    TK3A: rankedB[0] || 'Nhất B',
    TK3B: rankedA[1] || 'Nhì A',
    TK4A: rankedD[0] || 'Nhất D',
    TK4B: rankedC[1] || 'Nhì C'
  }

  const nextSignature = [
    qf.TK1A,
    qf.TK1B,
    qf.TK2A,
    qf.TK2B,
    qf.TK3A,
    qf.TK3B,
    qf.TK4A,
    qf.TK4B
  ]
    .map(slotLabel)
    .join('|')

  if (
    resetIfQualifierChanged &&
    qualifierSignature &&
    qualifierSignature !== nextSignature
  ) {
    knockoutScoreState = {}
    saveKnockoutScoreState()
  }
  qualifierSignature = nextSignature

  setBracketSlot('TK1-A', slotLabel(qf.TK1A))
  setBracketSlot('TK1-B', slotLabel(qf.TK1B))
  setBracketSlot('TK2-A', slotLabel(qf.TK2A))
  setBracketSlot('TK2-B', slotLabel(qf.TK2B))
  setBracketSlot('TK3-A', slotLabel(qf.TK3A))
  setBracketSlot('TK3-B', slotLabel(qf.TK3B))
  setBracketSlot('TK4-A', slotLabel(qf.TK4A))
  setBracketSlot('TK4-B', slotLabel(qf.TK4B))

  const q1 = getKnockoutOutcome('TK1', qf.TK1A, qf.TK1B)
  const q2 = getKnockoutOutcome('TK2', qf.TK2A, qf.TK2B)
  const q3 = getKnockoutOutcome('TK3', qf.TK3A, qf.TK3B)
  const q4 = getKnockoutOutcome('TK4', qf.TK4A, qf.TK4B)

  const bk1a = q1.winner || 'Thắng TK1'
  const bk1b = q2.winner || 'Thắng TK2'
  const bk2a = q3.winner || 'Thắng TK3'
  const bk2b = q4.winner || 'Thắng TK4'

  setBracketSlot('BK1-A', slotLabel(bk1a))
  setBracketSlot('BK1-B', slotLabel(bk1b))
  setBracketSlot('BK2-A', slotLabel(bk2a))
  setBracketSlot('BK2-B', slotLabel(bk2b))

  const s1 = getKnockoutOutcome('BK1', bk1a, bk1b)
  const s2 = getKnockoutOutcome('BK2', bk2a, bk2b)

  const cka = s1.winner || 'Thắng BK1'
  const ckb = s2.winner || 'Thắng BK2'
  const bra = s1.loser || 'Thua BK1'
  const brb = s2.loser || 'Thua BK2'

  setBracketSlot('CK-A', slotLabel(cka))
  setBracketSlot('CK-B', slotLabel(ckb))
  setBracketSlot('BR-A', slotLabel(bra))
  setBracketSlot('BR-B', slotLabel(brb))

  knockoutMatchSides = {
    TK1: { a: qf.TK1A, b: qf.TK1B },
    TK2: { a: qf.TK2A, b: qf.TK2B },
    TK3: { a: qf.TK3A, b: qf.TK3B },
    TK4: { a: qf.TK4A, b: qf.TK4B },
    BK1: { a: bk1a, b: bk1b },
    BK2: { a: bk2a, b: bk2b },
    CK: { a: cka, b: ckb },
    BR: { a: bra, b: brb }
  }

  setKnockoutInputsFromState()
}

function onScheduleScoreInput(event) {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  const matchId = input.dataset.matchId
  const side = input.dataset.side
  if (!matchId || (side !== 'a' && side !== 'b')) return

  const value = input.value.trim()
  if (!scoreState[matchId]) scoreState[matchId] = {}

  if (value === '') {
    delete scoreState[matchId][side]
  } else {
    const parsed = Math.max(0, parseInt(value, 10) || 0)
    scoreState[matchId][side] = parsed
    if (String(parsed) !== value) input.value = String(parsed)
  }

  if (
    !Number.isInteger(scoreState[matchId].a) &&
    !Number.isInteger(scoreState[matchId].b)
  ) {
    delete scoreState[matchId]
  }

  saveScoreState()
  updateGroupMatchStatus(matchId)
  const groupIndex = parseInt(matchId.slice(1, matchId.indexOf('-')), 10) - 1
  renderStandingsForGroup(groupIndex)
  applyKnockoutBracket(true)
}

scheduleGrid.addEventListener('input', onScheduleScoreInput)

function onKnockoutScoreInput(event) {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  const code = input.dataset.koMatch
  const side = input.dataset.side
  if (!code || (side !== 'a' && side !== 'b')) return

  const value = input.value.trim()
  if (!knockoutScoreState[code]) knockoutScoreState[code] = {}

  if (value === '') {
    delete knockoutScoreState[code][side]
  } else {
    const parsed = Math.max(0, parseInt(value, 10) || 0)
    knockoutScoreState[code][side] = parsed
    if (String(parsed) !== value) input.value = String(parsed)
  }

  if (
    !Number.isInteger(knockoutScoreState[code].a) &&
    !Number.isInteger(knockoutScoreState[code].b)
  ) {
    delete knockoutScoreState[code]
  }

  saveKnockoutScoreState()
  applyKnockoutBracket(false)
}

if (bracketEl)
  bracketEl.addEventListener('input', onKnockoutScoreInput)

  // === Kết quả chính thức ===
;(function () {
  const mk = (m, f) => ({ male: { name: m }, female: { name: f } })
  const pairs = [
    mk('Nguyễn Quốc Ân', 'Minh Thao'),
    mk('Phúc Phan', 'Ánh Lê'),
    mk('Xuân Trường', 'Em Trâm'),
    mk('Trường Trong Trắng', 'Hoa Vũ'),
    mk('Thanh Thật Thà', 'Mai Nguyễn'),
    mk('Minh Dương', 'Tuyết Mei'),
    mk('Chen', 'Diệu'),
    mk('Tùng Nè', 'Minh Anh'),
    mk('Quang Khánh', 'Mai Thu'),
    mk('Dinh Thanh', 'Mai Trân'),
    mk('Phương Nam', 'Thảo Hiếu'),
    mk('Thuận Sovo', 'Nana Phan'),
    mk('Tomm', 'Vân Nguyễn'),
    mk('Mr Mountain', 'Phạm Thoa'),
    mk('Mr Quy', 'Tiên'),
    mk('Lê Minh Trí', 'Diệp Ann')
  ].map((p, i) => ({ ...p, id: i + 1 }))

  const G = (...ids) => ids.map(i => pairs[i - 1])
  const groups = [
    G(1, 11, 14, 12), // Bảng A
    G(7, 4, 8, 13), // Bảng B
    G(2, 6, 15, 9), // Bảng C
    G(10, 3, 16, 5) // Bảng D
  ]

  const v = (a, b) => ({ a, b })
  const groupSchedules = [
    // Bảng A
    [
      v(groups[0][2], groups[0][3]),
      v(groups[0][0], groups[0][1]),
      v(groups[0][3], groups[0][0]),
      v(groups[0][1], groups[0][2]),
      v(groups[0][3], groups[0][1]),
      v(groups[0][0], groups[0][2])
    ],
    // Bảng B
    [
      v(groups[1][0], groups[1][2]),
      v(groups[1][3], groups[1][1]),
      v(groups[1][0], groups[1][1]),
      v(groups[1][2], groups[1][3]),
      v(groups[1][1], groups[1][2]),
      v(groups[1][0], groups[1][3])
    ],
    // Bảng C
    [
      v(groups[2][0], groups[2][2]),
      v(groups[2][2], groups[2][3]),
      v(groups[2][3], groups[2][0]),
      v(groups[2][1], groups[2][2]),
      v(groups[2][1], groups[2][0]),
      v(groups[2][1], groups[2][3])
    ],
    // Bảng D
    [
      v(groups[3][2], groups[3][1]),
      v(groups[3][0], groups[3][3]),
      v(groups[3][2], groups[3][0]),
      v(groups[3][1], groups[3][3]),
      v(groups[3][2], groups[3][3]),
      v(groups[3][0], groups[3][1])
    ]
  ]

  currentPairs = pairs
  currentGroups = groups
  currentGroupSchedules = groupSchedules

  renderPairs(pairs)
  renderGroups(groups)
  renderSchedule(groupSchedules)
  applyKnockoutBracket(false)
})()

updateRosterUI()

// ===== Pickleball side-out scoring engine =====
// A team's own two players always occupy complementary courts (right/even,
// left/odd). Only the box of the CURRENT server is meaningful; it always
// matches the parity of the serving team's own score.
function otherPlayerKey(key) {
  return key === 'male' ? 'female' : 'male'
}

function otherTeamKey(team) {
  return team === 'a' ? 'b' : 'a'
}

function createInitialServeCourt(setup) {
  const servingTeam = setup.servingTeam
  const receivingTeam = otherTeamKey(servingTeam)
  const court = {}
  court[servingTeam] = {
    right: setup.firstServer,
    left: otherPlayerKey(setup.firstServer)
  }
  court[receivingTeam] = {
    right: setup.firstReceiver,
    left: otherPlayerKey(setup.firstReceiver)
  }
  return court
}

// Replays the full rally history from the initial setup so current state is
// always derived, never stored redundantly — undo is just history.pop().
function computeServeState(setup, history) {
  const score = { a: 0, b: 0 }
  let servingTeam = setup.servingTeam
  // The very first serve of the whole match is conventionally called "2"
  // (server #1's turn is skipped) so the score call reads e.g. "0-0-2".
  let serverNum = 2
  let firstServeActive = true
  const court = createInitialServeCourt(setup)

  for (const winner of history) {
    if (winner === servingTeam) {
      score[servingTeam] += 1
      const c = court[servingTeam]
      const swap = c.right
      c.right = c.left
      c.left = swap
    } else if (firstServeActive) {
      // First service of the match: only one server before the first side-out.
      servingTeam = otherTeamKey(servingTeam)
      serverNum = 1
      firstServeActive = false
    } else if (serverNum === 1) {
      serverNum = 2
    } else {
      servingTeam = otherTeamKey(servingTeam)
      serverNum = 1
    }
  }

  const parity = score[servingTeam] % 2 === 0 ? 'right' : 'left'
  return { score, servingTeam, serverNum, court, serverKey: court[servingTeam][parity] }
}

// ===== Referee Score Modal =====
;(function () {
  const refModal = document.getElementById('refModal')
  const refClose = document.getElementById('refClose')
  const refCodeEl = document.getElementById('refCode')
  const refBody = document.getElementById('refBody')
  const refStatusEl = document.getElementById('refStatus')

  let refCtx = null // { type, id, code, teamA, teamB }
  let refView = 'entry' // 'entry' | 'setup' | 'play' | 'manual'
  let setupChoices = {}
  let manualScore = { a: 0, b: 0 }
  let refTrigger = null
  let holdTimer = null
  let holdInterval = null
  let manualSaveTimer = null
  let statusTimer = null

  function getScoreStore() {
    return refCtx.type === 'group' ? scoreState : knockoutScoreState
  }

  function getSavedMatch() {
    return getScoreStore()[refCtx.id] || {}
  }

  function persistMatch(patch) {
    const store = getScoreStore()
    if (!store[refCtx.id]) store[refCtx.id] = {}
    Object.assign(store[refCtx.id], patch)
    if (refCtx.type === 'group') saveScoreState()
    else saveKnockoutScoreState()
  }

  function clearServeState() {
    const store = getScoreStore()
    if (store[refCtx.id]) delete store[refCtx.id].serve
    if (refCtx.type === 'group') saveScoreState()
    else saveKnockoutScoreState()
  }

  function syncExternalAfterScoreChange() {
    if (refCtx.type === 'group') {
      const matchId = refCtx.id
      const saved = scoreState[matchId] || {}
      const inpA = scheduleGrid.querySelector(`input[data-match-id="${matchId}"][data-side="a"]`)
      const inpB = scheduleGrid.querySelector(`input[data-match-id="${matchId}"][data-side="b"]`)
      if (inpA) inpA.value = Number.isInteger(saved.a) ? String(saved.a) : ''
      if (inpB) inpB.value = Number.isInteger(saved.b) ? String(saved.b) : ''
      updateGroupMatchStatus(matchId)
      const groupIndex = parseInt(matchId.slice(1, matchId.indexOf('-')), 10) - 1
      renderStandingsForGroup(groupIndex)
      applyKnockoutBracket(true)
    } else {
      setKnockoutInputsFromState()
      applyKnockoutBracket(false)
    }
  }

  function flashSaved() {
    refStatusEl.textContent = '✓ Đã lưu'
    refStatusEl.style.opacity = '1'
    clearTimeout(statusTimer)
    statusTimer = setTimeout(() => { refStatusEl.style.opacity = '0' }, 1800)
  }

  function render() {
    if (refView === 'setup') renderSetup()
    else if (refView === 'play') renderPlay()
    else if (refView === 'manual') renderManual()
    else renderEntry()
  }

  function renderEntry() {
    const saved = getSavedMatch()
    const hasServe = saved.serve && Array.isArray(saved.serve.history)
    const hasLegacyScore = Number.isInteger(saved.a) || Number.isInteger(saved.b)

    let html = `<div class="ref-modal__matchup">${escapeHtml(teamLabel(refCtx.teamA))} <span>vs</span> ${escapeHtml(teamLabel(refCtx.teamB))}</div>`

    if (hasServe) {
      const state = computeServeState(saved.serve.setup, saved.serve.history)
      const done = isCompletedGroupMatchScore(state.score.a, state.score.b)
      html += `<div class="ref-modal__note">Tỷ số hiện tại: ${state.score.a} - ${state.score.b}${done ? ' (đã kết thúc)' : ''}</div>
        <div class="ref-modal__actions">
          <button class="ref-modal__action-btn" data-action="continue">Tiếp tục trận đấu</button>
          <button class="ref-modal__action-btn ref-modal__action-btn--ghost" data-action="restart">Bắt đầu lại trận đấu</button>
        </div>`
    } else if (hasLegacyScore) {
      html += `<div class="ref-modal__note">Trận này đã có tỷ số nhập tay: ${Number.isInteger(saved.a) ? saved.a : 0} - ${Number.isInteger(saved.b) ? saved.b : 0}</div>
        <div class="ref-modal__actions">
          <button class="ref-modal__action-btn" data-action="start">Bắt đầu trận đấu tự động (reset 0-0)</button>
        </div>`
    } else {
      html += `<div class="ref-modal__actions">
          <button class="ref-modal__action-btn" data-action="start">Bắt đầu trận đấu</button>
        </div>`
    }

    html += `<button class="ref-modal__link" data-action="manual">Sửa tỷ số thủ công</button>`
    refBody.innerHTML = html
  }

  function renderSetup() {
    const step = setupChoices.step || 1
    let html = `<div class="ref-modal__matchup">${escapeHtml(teamLabel(refCtx.teamA))} <span>vs</span> ${escapeHtml(teamLabel(refCtx.teamB))}</div>`

    if (step === 1) {
      html += `<div class="ref-modal__step-label">Bước 1/3 · Chọn đội giao bóng</div>
        <div class="ref-modal__choice-grid">
          <button class="ref-modal__choice-btn" data-setup="team" data-value="a">${escapeHtml(teamLabel(refCtx.teamA))}</button>
          <button class="ref-modal__choice-btn" data-setup="team" data-value="b">${escapeHtml(teamLabel(refCtx.teamB))}</button>
        </div>`
    } else if (step === 2) {
      const servingPair = setupChoices.servingTeam === 'a' ? refCtx.teamA : refCtx.teamB
      html += `<div class="ref-modal__step-label">Bước 2/3 · Chọn người giao bóng đầu tiên</div>
        <div class="ref-modal__choice-grid">
          <button class="ref-modal__choice-btn" data-setup="server" data-value="male">${escapeHtml(servingPair.male.name)}</button>
          <button class="ref-modal__choice-btn" data-setup="server" data-value="female">${escapeHtml(servingPair.female.name)}</button>
        </div>`
    } else {
      const receivingPair = setupChoices.servingTeam === 'a' ? refCtx.teamB : refCtx.teamA
      html += `<div class="ref-modal__step-label">Bước 3/3 · Chọn người đỡ bóng đầu tiên</div>
        <div class="ref-modal__choice-grid">
          <button class="ref-modal__choice-btn" data-setup="receiver" data-value="male">${escapeHtml(receivingPair.male.name)}</button>
          <button class="ref-modal__choice-btn" data-setup="receiver" data-value="female">${escapeHtml(receivingPair.female.name)}</button>
        </div>`
    }

    html += `<button class="ref-modal__link" data-action="back-entry">Hủy</button>`
    refBody.innerHTML = html
  }

  function renderPlay() {
    const saved = getSavedMatch()
    const state = computeServeState(saved.serve.setup, saved.serve.history)
    const done = isCompletedGroupMatchScore(state.score.a, state.score.b)
    const teamAName = teamLabel(refCtx.teamA)
    const teamBName = teamLabel(refCtx.teamB)

    let html = `<div class="ref-modal__board">
        <div class="ref-modal__col">
          <div class="ref-modal__name">${escapeHtml(teamAName)}</div>
          <div class="ref-modal__score">${state.score.a}</div>
        </div>
        <div class="ref-modal__dash">–</div>
        <div class="ref-modal__col">
          <div class="ref-modal__name">${escapeHtml(teamBName)}</div>
          <div class="ref-modal__score">${state.score.b}</div>
        </div>
      </div>`

    if (done) {
      const winnerName = state.score.a > state.score.b ? teamAName : teamBName
      html += `<div class="ref-modal__final-banner">🏆 ${escapeHtml(winnerName)} thắng ${Math.max(state.score.a, state.score.b)}-${Math.min(state.score.a, state.score.b)}</div>`
    } else {
      const servingPair = state.servingTeam === 'a' ? refCtx.teamA : refCtx.teamB
      const servingTeamName = state.servingTeam === 'a' ? teamAName : teamBName
      const receivingScore = state.score[otherTeamKey(state.servingTeam)]
      const callText = `${state.score[state.servingTeam]}-${receivingScore}-${state.serverNum}`
      html += `<div class="ref-modal__score-call" title="Điểm đội giao - điểm đội đỡ - số giao">${callText}</div>
        <div class="ref-modal__serve-info">Đang giao: <strong>${escapeHtml(servingPair[state.serverKey].name)}</strong> (Đội ${escapeHtml(servingTeamName)})<span class="ref-modal__serve-badge">#${state.serverNum}</span></div>`
    }

    html += `<div class="ref-modal__rally-grid">
        <button class="ref-modal__rally-btn" data-rally="a" ${done ? 'disabled' : ''}>${escapeHtml(teamAName)} thắng pha</button>
        <button class="ref-modal__rally-btn" data-rally="b" ${done ? 'disabled' : ''}>${escapeHtml(teamBName)} thắng pha</button>
      </div>
      <div class="ref-modal__footer-row">
        <button class="ref-modal__action-btn ref-modal__action-btn--ghost" data-action="undo" ${saved.serve.history.length === 0 ? 'disabled' : ''}>↩ Hoàn tác</button>
        <button class="ref-modal__action-btn ref-modal__action-btn--ghost" data-action="manual">Sửa tay</button>
      </div>`

    refBody.innerHTML = html
  }

  function renderManual() {
    const teamAName = teamLabel(refCtx.teamA)
    const teamBName = teamLabel(refCtx.teamB)
    refBody.innerHTML = `
      <div class="ref-modal__board">
        <div class="ref-modal__col">
          <div class="ref-modal__name">${escapeHtml(teamAName)}</div>
          <button class="ref-modal__btn" data-manual-side="a" data-dir="up">▲</button>
          <div class="ref-modal__score" id="refManualScoreA">${manualScore.a}</div>
          <button class="ref-modal__btn" data-manual-side="a" data-dir="down">▼</button>
        </div>
        <div class="ref-modal__dash">–</div>
        <div class="ref-modal__col">
          <div class="ref-modal__name">${escapeHtml(teamBName)}</div>
          <button class="ref-modal__btn" data-manual-side="b" data-dir="up">▲</button>
          <div class="ref-modal__score" id="refManualScoreB">${manualScore.b}</div>
          <button class="ref-modal__btn" data-manual-side="b" data-dir="down">▼</button>
        </div>
      </div>
      <button class="ref-modal__link" data-action="back-entry">Quay lại</button>
    `
  }

  function goEntry() {
    refView = 'entry'
    setupChoices = {}
    render()
  }

  function startSetup() {
    setupChoices = { step: 1 }
    refView = 'setup'
    render()
  }

  function finishSetup() {
    persistMatch({
      a: 0,
      b: 0,
      serve: {
        setup: {
          servingTeam: setupChoices.servingTeam,
          firstServer: setupChoices.firstServer,
          firstReceiver: setupChoices.firstReceiver
        },
        history: []
      }
    })
    syncExternalAfterScoreChange()
    flashSaved()
    refView = 'play'
    render()
  }

  function goManual() {
    const saved = getSavedMatch()
    if (saved.serve) {
      if (!confirm('Chuyển sang sửa tay sẽ dừng chế độ tự động cho trận này. Tiếp tục?')) return
      clearServeState()
    }
    const fresh = getSavedMatch()
    manualScore = {
      a: Number.isInteger(fresh.a) ? fresh.a : 0,
      b: Number.isInteger(fresh.b) ? fresh.b : 0
    }
    refView = 'manual'
    render()
  }

  function applyRally(side) {
    const saved = getSavedMatch()
    const state = computeServeState(saved.serve.setup, saved.serve.history)
    if (isCompletedGroupMatchScore(state.score.a, state.score.b)) return
    const history = saved.serve.history.slice()
    history.push(side)
    const next = computeServeState(saved.serve.setup, history)
    persistMatch({ a: next.score.a, b: next.score.b, serve: { setup: saved.serve.setup, history } })
    syncExternalAfterScoreChange()
    flashSaved()
    render()
  }

  function undoRally() {
    const saved = getSavedMatch()
    if (!saved.serve || saved.serve.history.length === 0) return
    const history = saved.serve.history.slice(0, -1)
    const next = computeServeState(saved.serve.setup, history)
    persistMatch({ a: next.score.a, b: next.score.b, serve: { setup: saved.serve.setup, history } })
    syncExternalAfterScoreChange()
    flashSaved()
    render()
  }

  function doManualSave() {
    clearTimeout(manualSaveTimer)
    manualSaveTimer = null
    persistMatch({ a: manualScore.a, b: manualScore.b })
    syncExternalAfterScoreChange()
    flashSaved()
  }

  function debouncedManualSave() {
    clearTimeout(manualSaveTimer)
    refStatusEl.style.opacity = '0'
    manualSaveTimer = setTimeout(doManualSave, 800)
  }

  function stepManualScore(side, dir) {
    const delta = dir === 'up' ? 1 : -1
    manualScore[side] = Math.max(0, manualScore[side] + delta)
    const el = document.getElementById(side === 'a' ? 'refManualScoreA' : 'refManualScoreB')
    if (el) el.textContent = String(manualScore[side])
    debouncedManualSave()
  }

  function startHold(side, dir) {
    stepManualScore(side, dir)
    holdTimer = setTimeout(() => {
      holdInterval = setInterval(() => stepManualScore(side, dir), 100)
    }, 400)
  }

  function stopHold() {
    clearTimeout(holdTimer)
    clearInterval(holdInterval)
    holdTimer = null
    holdInterval = null
  }

  function openRefModal({ type, id, code, teamA, teamB }) {
    refTrigger = document.activeElement
    refCtx = { type, id, code, teamA, teamB }
    refView = 'entry'
    setupChoices = {}
    refCodeEl.textContent = code
    refStatusEl.style.opacity = '0'
    render()
    refModal.classList.add('is-open')
    refModal.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
    setTimeout(() => refClose.focus(), 50)
  }

  function closeRefModal() {
    if (manualSaveTimer) doManualSave()
    refModal.classList.remove('is-open')
    refModal.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
    stopHold()
    refCtx = null
    if (refTrigger) {
      refTrigger.focus()
      refTrigger = null
    }
  }

  refBody.addEventListener('click', e => {
    const setupBtn = e.target.closest('[data-setup]')
    if (setupBtn) {
      const { setup, value } = setupBtn.dataset
      if (setup === 'team') {
        setupChoices.servingTeam = value
        setupChoices.step = 2
      } else if (setup === 'server') {
        setupChoices.firstServer = value
        setupChoices.step = 3
      } else if (setup === 'receiver') {
        setupChoices.firstReceiver = value
        finishSetup()
        return
      }
      render()
      return
    }

    const rallyBtn = e.target.closest('[data-rally]')
    if (rallyBtn) {
      applyRally(rallyBtn.dataset.rally)
      return
    }

    const actionBtn = e.target.closest('[data-action]')
    if (actionBtn) {
      const action = actionBtn.dataset.action
      if (action === 'start') {
        const saved = getSavedMatch()
        if (
          (Number.isInteger(saved.a) || Number.isInteger(saved.b)) &&
          !confirm('Bắt đầu chế độ tự động sẽ đưa tỷ số về 0-0. Tiếp tục?')
        ) return
        startSetup()
      } else if (action === 'continue') {
        refView = 'play'
        render()
      } else if (action === 'restart') {
        if (!confirm('Bắt đầu lại sẽ xóa toàn bộ lịch sử trận đấu này. Tiếp tục?')) return
        startSetup()
      } else if (action === 'manual') {
        goManual()
      } else if (action === 'undo') {
        undoRally()
      } else if (action === 'back-entry') {
        goEntry()
      }
    }
  })

  // Mouse hold-to-repeat (manual mode)
  refBody.addEventListener('mousedown', e => {
    const btn = e.target.closest('[data-manual-side]')
    if (!btn) return
    e.preventDefault()
    startHold(btn.dataset.manualSide, btn.dataset.dir)
  })
  document.addEventListener('mouseup', stopHold)

  // Touch hold-to-repeat (manual mode)
  refBody.addEventListener('touchstart', e => {
    const btn = e.target.closest('[data-manual-side]')
    if (!btn) return
    startHold(btn.dataset.manualSide, btn.dataset.dir)
  }, { passive: true })
  refBody.addEventListener('touchend', stopHold)
  refBody.addEventListener('touchcancel', stopHold)

  refClose.addEventListener('click', closeRefModal)
  refModal.addEventListener('click', e => {
    if (e.target === refModal) closeRefModal()
  })
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && refModal.classList.contains('is-open')) closeRefModal()
  })

  // Open modal when clicking a group match row (not directly on an input)
  scheduleGrid.addEventListener('click', e => {
    if (e.target instanceof HTMLInputElement) return
    const li = e.target.closest('.schedule-group li')
    if (!li) return
    const inpA = li.querySelector('input[data-match-id][data-side="a"]')
    if (!inpA) return
    const matchId = inpA.dataset.matchId
    const groupIndex = parseInt(matchId.slice(1, matchId.indexOf('-')), 10) - 1
    const matchIndex = parseInt(matchId.slice(matchId.indexOf('M') + 1), 10) - 1
    const match = (currentGroupSchedules[groupIndex] || [])[matchIndex]
    if (!match) return
    openRefModal({
      type: 'group',
      id: matchId,
      code: matchId,
      teamA: match.a,
      teamB: match.b
    })
  })

  // Open modal when clicking a knockout bracket match (not directly on an input)
  if (bracketEl) {
    bracketEl.addEventListener('click', e => {
      if (e.target instanceof HTMLInputElement) return
      const matchEl = e.target.closest('.match')
      if (!matchEl) return
      const inp = matchEl.querySelector('input[data-ko-match]')
      if (!inp) return
      const code = inp.dataset.koMatch
      const sides = knockoutMatchSides[code]
      if (!sides || !isResolvedTeam(sides.a) || !isResolvedTeam(sides.b)) return
      const codeLabel = matchEl.querySelector('.match__code')?.textContent?.trim() || code
      openRefModal({
        type: 'knockout',
        id: code,
        code: codeLabel,
        teamA: sides.a,
        teamB: sides.b
      })
    })
  }
})()
