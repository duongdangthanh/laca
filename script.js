// ===== LACA ZOMBIE Championship — landing interactions =====

const ROSTER_KEY = 'laca_roster_v7'
const SCORE_STATE_KEY = 'laca_group_score_state_v1'
const KNOCKOUT_SCORE_STATE_KEY = 'laca_knockout_score_state_v1'
const REMOTE_STATE_URL =
  'https://script.google.com/macros/s/AKfycbxbMjRvwc3gKKVm4xxS6vlS1aAhca9CKpLH4uRu17PQULAKR5u52LtTDcH3FIT9PHNERw/exec'
const REMOTE_SYNC_INTERVAL_MS = 3000
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
let remoteSaveTimer = null
let lastRemoteUpdatedAt = 0

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
const drawStatus = document.getElementById('drawStatus')

let currentPairs = []
let currentGroups = []
let currentGroupSchedules = []
let qualifierSignature = ''

function getDefaultRemoteState() {
  return {
    pairs: currentPairs,
    groups: currentGroups,
    groupSchedules: currentGroupSchedules,
    scoreState,
    knockoutScoreState,
    updatedAt: Date.now()
  }
}

async function fetchRemoteState() {
  const url = `${REMOTE_STATE_URL}?action=getState&t=${Date.now()}`
  const response = await fetch(url, { method: 'GET', cache: 'no-store' })
  if (!response.ok) throw new Error(`getState_failed_${response.status}`)
  const data = await response.json()
  if (!data || data.ok !== true) throw new Error('getState_invalid_payload')
  return data.state || null
}

async function saveRemoteState(state) {
  const response = await fetch(REMOTE_STATE_URL, {
    method: 'POST',
    // Use text/plain to avoid CORS preflight issues with Apps Script Web Apps.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'saveState', state })
  })
  if (!response.ok) throw new Error(`saveState_failed_${response.status}`)
  const data = await response.json()
  if (!data || data.ok !== true) throw new Error('saveState_invalid_payload')
}

function scheduleRemoteSave() {
  if (remoteSaveTimer) clearTimeout(remoteSaveTimer)
  remoteSaveTimer = setTimeout(async () => {
    try {
      const state = getDefaultRemoteState()
      await saveRemoteState(state)
      lastRemoteUpdatedAt = Number(state.updatedAt || 0)
      if (drawStatus) {
        drawStatus.classList.remove('is-error')
      }
    } catch (_e) {
      if (drawStatus) {
        drawStatus.classList.add('is-error')
        drawStatus.textContent =
          'Lưu online thất bại, dữ liệu vẫn được giữ local.'
      }
    }
  }, 500)
}

function applyRemoteState(remoteState) {
  if (!remoteState || typeof remoteState !== 'object') return
  lastRemoteUpdatedAt = Number(
    remoteState.updatedAt || lastRemoteUpdatedAt || 0
  )
  if (remoteState.scoreState && typeof remoteState.scoreState === 'object') {
    scoreState = remoteState.scoreState
    saveScoreState()
  }
  if (
    remoteState.knockoutScoreState &&
    typeof remoteState.knockoutScoreState === 'object'
  ) {
    knockoutScoreState = remoteState.knockoutScoreState
    saveKnockoutScoreState()
  }
}

async function pullRemoteStateIfNewer() {
  try {
    const remoteState = await fetchRemoteState()
    if (!remoteState) return
    const remoteUpdatedAt = Number(remoteState.updatedAt || 0)
    if (remoteUpdatedAt > lastRemoteUpdatedAt) {
      applyRemoteState(remoteState)
      renderSchedule(currentGroupSchedules)
      applyKnockoutBracket(false)
    }
  } catch (_e) {
    // Keep UI functional with local state if remote is unavailable.
  }
}

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

function normalizeKnockoutScoreInput(code) {
  const pair = knockoutScoreState[code] || {}
  const a = Number.isInteger(pair.a) ? pair.a : null
  const b = Number.isInteger(pair.b) ? pair.b : null
  return { a, b }
}

function getKnockoutOutcome(code, sideA, sideB) {
  const { a, b } = normalizeKnockoutScoreInput(code)
  if (!sideA || !sideB || a === null || b === null || a === b) {
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
    TK1A: rankedA[0] ? teamLabel(rankedA[0]) : 'Nhất A',
    TK1B: rankedB[1] ? teamLabel(rankedB[1]) : 'Nhì B',
    TK2A: rankedC[0] ? teamLabel(rankedC[0]) : 'Nhất C',
    TK2B: rankedD[1] ? teamLabel(rankedD[1]) : 'Nhì D',
    TK3A: rankedB[0] ? teamLabel(rankedB[0]) : 'Nhất B',
    TK3B: rankedA[1] ? teamLabel(rankedA[1]) : 'Nhì A',
    TK4A: rankedD[0] ? teamLabel(rankedD[0]) : 'Nhất D',
    TK4B: rankedC[1] ? teamLabel(rankedC[1]) : 'Nhì C'
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
  ].join('|')

  if (
    resetIfQualifierChanged &&
    qualifierSignature &&
    qualifierSignature !== nextSignature
  ) {
    knockoutScoreState = {}
    saveKnockoutScoreState()
  }
  qualifierSignature = nextSignature

  setBracketSlot('TK1-A', qf.TK1A)
  setBracketSlot('TK1-B', qf.TK1B)
  setBracketSlot('TK2-A', qf.TK2A)
  setBracketSlot('TK2-B', qf.TK2B)
  setBracketSlot('TK3-A', qf.TK3A)
  setBracketSlot('TK3-B', qf.TK3B)
  setBracketSlot('TK4-A', qf.TK4A)
  setBracketSlot('TK4-B', qf.TK4B)

  const q1 = getKnockoutOutcome('TK1', qf.TK1A, qf.TK1B)
  const q2 = getKnockoutOutcome('TK2', qf.TK2A, qf.TK2B)
  const q3 = getKnockoutOutcome('TK3', qf.TK3A, qf.TK3B)
  const q4 = getKnockoutOutcome('TK4', qf.TK4A, qf.TK4B)

  const bk1a = q1.winner || 'Thắng TK1'
  const bk1b = q2.winner || 'Thắng TK2'
  const bk2a = q3.winner || 'Thắng TK3'
  const bk2b = q4.winner || 'Thắng TK4'

  setBracketSlot('BK1-A', bk1a)
  setBracketSlot('BK1-B', bk1b)
  setBracketSlot('BK2-A', bk2a)
  setBracketSlot('BK2-B', bk2b)

  const s1 = getKnockoutOutcome('BK1', bk1a, bk1b)
  const s2 = getKnockoutOutcome('BK2', bk2a, bk2b)

  setBracketSlot('CK-A', s1.winner || 'Thắng BK1')
  setBracketSlot('CK-B', s2.winner || 'Thắng BK2')
  setBracketSlot('BR-A', s1.loser || 'Thua BK1')
  setBracketSlot('BR-B', s2.loser || 'Thua BK2')

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
  scheduleRemoteSave()
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
  scheduleRemoteSave()
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
    mk('Mr Shadow', 'Minh Anh'),
    mk('Quang Khánh', 'Mai Thu'),
    mk('Dinh Thanh', 'Toại Thủy'),
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
      v(groups[0][0], groups[0][3]),
      v(groups[0][1], groups[0][2]),
      v(groups[0][1], groups[0][3]),
      v(groups[0][0], groups[0][2])
    ],
    // Bảng B
    [
      v(groups[1][0], groups[1][3]),
      v(groups[1][1], groups[1][2]),
      v(groups[1][1], groups[1][3]),
      v(groups[1][0], groups[1][2]),
      v(groups[1][2], groups[1][3]),
      v(groups[1][0], groups[1][1])
    ],
    // Bảng C
    [
      v(groups[2][1], groups[2][2]),
      v(groups[2][0], groups[2][3]),
      v(groups[2][0], groups[2][2]),
      v(groups[2][1], groups[2][3]),
      v(groups[2][0], groups[2][1]),
      v(groups[2][2], groups[2][3])
    ],
    // Bảng D
    [
      v(groups[3][0], groups[3][3]),
      v(groups[3][1], groups[3][2]),
      v(groups[3][1], groups[3][3]),
      v(groups[3][0], groups[3][2]),
      v(groups[3][0], groups[3][1]),
      v(groups[3][2], groups[3][3])
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
;(async function syncFromRemote() {
  try {
    const remoteState = await fetchRemoteState()
    if (remoteState) {
      applyRemoteState(remoteState)
      renderSchedule(currentGroupSchedules)
      applyKnockoutBracket(false)
      if (drawStatus) {
        drawStatus.classList.remove('is-error')
      }
    } else {
      await saveRemoteState(getDefaultRemoteState())
    }
  } catch (_e) {
    // Fallback to local-only when remote is unavailable.
  }
})()

setInterval(pullRemoteStateIfNewer, REMOTE_SYNC_INTERVAL_MS)

updateRosterUI()
