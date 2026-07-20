// ===== LACA MINI GAME · TEAM RELAY — landing interactions =====

const GENDERS = ['nam', 'nu']
const GENDER_LABELS = { nam: 'Nam', nu: 'Nữ' }
const TEAM_LABELS = ['A', 'B', 'C', 'D']

// Standard single round-robin for 4 teams: each team plays once per round.
const TEAM_ROUND_ROBIN = [
  { match: 1, round: 1, home: 'A', away: 'B' },
  { match: 2, round: 1, home: 'C', away: 'D' },
  { match: 3, round: 2, home: 'A', away: 'C' },
  { match: 4, round: 2, home: 'B', away: 'D' },
  { match: 5, round: 3, home: 'A', away: 'D' },
  { match: 6, round: 3, home: 'B', away: 'C' }
]

// The 3 possible sub-pairs from a team's own 3 members (slot indices).
// Captains pick which of these plays each chặng (leg).
const PAIR3_DEFS = [
  [0, 1],
  [1, 2],
  [2, 0]
]

// Cumulative score checkpoints ("chặng" boundaries); the last value is the
// match target (18, không cách 2 điểm).
const RELAY_CHECKPOINTS = [6, 12, 18]

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

// --- Countdown to match day: Fri 24 Jul 2026, 19:00 (local) ---
const target = new Date('2026-07-24T19:00:00').getTime()
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
  '.sec-head, .pillar, .fcard, .guide-card, .rules-note, .venue__info, .venue__map, .stat, .team-form__card, .gender-block'
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

function isCompletedScore(a, b, targetScore) {
  return Number.isInteger(a) && Number.isInteger(b) && (a >= targetScore || b >= targetScore)
}

// ===== Team roster (manual entry, per nhóm Nam/Nữ) =====
function rosterKey(gender) {
  return `laca_minigame_roster_${gender}_v1`
}
function scoreKey(gender) {
  return `laca_minigame_score_${gender}_v1`
}
function orderKey(gender) {
  return `laca_minigame_order_${gender}_v1`
}

function loadTeamRoster(gender) {
  try {
    const raw = localStorage.getItem(rosterKey(gender))
    if (raw) {
      const data = JSON.parse(raw)
      if (data && TEAM_LABELS.every(t => Array.isArray(data[t]) && data[t].length === 3))
        return data
    }
  } catch (_e) {
    /* fall through to default */
  }
  const empty = {}
  TEAM_LABELS.forEach(t => {
    empty[t] = ['', '', '']
  })
  return empty
}

function saveTeamRoster(gender) {
  localStorage.setItem(rosterKey(gender), JSON.stringify(teamRoster[gender]))
}

function loadRelayScoreState(gender) {
  try {
    const raw = localStorage.getItem(scoreKey(gender))
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : {}
  } catch (_e) {
    return {}
  }
}

function saveRelayScoreState(gender) {
  localStorage.setItem(scoreKey(gender), JSON.stringify(relayScoreState[gender]))
}

function loadTeamOrder(gender) {
  try {
    const raw = localStorage.getItem(orderKey(gender))
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : {}
  } catch (_e) {
    return {}
  }
}

function saveTeamOrder(gender) {
  localStorage.setItem(orderKey(gender), JSON.stringify(teamOrder[gender]))
}

let teamRoster = { nam: loadTeamRoster('nam'), nu: loadTeamRoster('nu') }
let relayScoreState = { nam: loadRelayScoreState('nam'), nu: loadRelayScoreState('nu') }
let teamOrder = { nam: loadTeamOrder('nam'), nu: loadTeamOrder('nu') }

function teamMemberName(gender, team, slot) {
  const raw = (teamRoster[gender][team] || [])[slot]
  return raw && raw.trim() ? raw.trim() : `TV${slot + 1}`
}

function rosterFormEl(gender) {
  return document.getElementById(gender === 'nam' ? 'teamRosterFormNam' : 'teamRosterFormNu')
}

function renderTeamRosterForm(gender) {
  const container = rosterFormEl(gender)
  if (!container) return
  container.innerHTML = ''
  TEAM_LABELS.forEach(t => {
    const card = document.createElement('div')
    card.className = 'team-form__card'
    card.innerHTML = `
      <div class="team-form__head">
        <span class="group__badge">${t}</span>
        <h4>Đội ${t}</h4>
      </div>
      <div class="team-form__inputs"></div>
    `
    const inputsWrap = card.querySelector('.team-form__inputs')
    for (let i = 0; i < 3; i++) {
      const inp = document.createElement('input')
      inp.type = 'text'
      inp.maxLength = 40
      inp.placeholder = `Thành viên ${i + 1}`
      inp.value = teamRoster[gender][t][i] || ''
      inp.dataset.team = t
      inp.dataset.slot = String(i)
      inputsWrap.appendChild(inp)
    }
    container.appendChild(card)
  })
}

function onTeamRosterInput(gender) {
  return event => {
    const input = event.target
    if (!(input instanceof HTMLInputElement)) return
    const t = input.dataset.team
    const slot = parseInt(input.dataset.slot, 10)
    if (!t || Number.isNaN(slot)) return
    teamRoster[gender][t][slot] = input.value
    saveTeamRoster(gender)
    renderTeamMatches(gender)
    updateStats()
  }
}

GENDERS.forEach(g => {
  const form = rosterFormEl(g)
  if (form) form.addEventListener('input', onTeamRosterInput(g))
})

// ===== Relay scoring (cumulative across 3 chặng, per nhóm) =====
function getRelayMatch(gender, matchId) {
  const state = relayScoreState[gender]
  if (!state[matchId]) state[matchId] = { completedLegs: [], current: { a: 0, b: 0 } }
  return state[matchId]
}

function relayCumulative(matchState) {
  const off = matchState.completedLegs.reduce(
    (acc, leg) => ({ a: acc.a + leg.a, b: acc.b + leg.b }),
    { a: 0, b: 0 }
  )
  return { a: off.a + matchState.current.a, b: off.b + matchState.current.b }
}

// Status of the CURRENT chặng: whether its checkpoint has been reached, and
// whether that means the whole match is over (final chặng) or just that the
// next pair should take over (cumulative score carries forward unchanged).
function relayStatus(matchState) {
  const legIndex = matchState.completedLegs.length
  const cumulative = relayCumulative(matchState)
  if (legIndex >= RELAY_CHECKPOINTS.length) {
    return { done: true, legJustFinished: false, legIndex: RELAY_CHECKPOINTS.length - 1, cumulative }
  }
  const checkpoint = RELAY_CHECKPOINTS[legIndex]
  const legDone = cumulative.a >= checkpoint || cumulative.b >= checkpoint
  const isFinalLeg = legIndex === RELAY_CHECKPOINTS.length - 1
  return {
    done: legDone && isFinalLeg,
    legJustFinished: legDone && !isFinalLeg,
    legIndex,
    checkpoint,
    cumulative
  }
}

function applyRelayDelta(gender, matchId, side, delta) {
  const m = getRelayMatch(gender, matchId)
  const status = relayStatus(m)
  if (status.done) return
  m.current[side] = Math.max(0, m.current[side] + delta)
  const after = relayStatus(m)
  if (after.legJustFinished) {
    m.completedLegs.push({ a: m.current.a, b: m.current.b })
    m.current = { a: 0, b: 0 }
  }
  saveRelayScoreState(gender)
}

function resetRelayMatch(gender, matchId) {
  delete relayScoreState[gender][matchId]
  saveRelayScoreState(gender)
  delete teamOrder[gender][matchId]
  saveTeamOrder(gender)
}

// ===== Team standings & schedule rendering (per nhóm) =====
function matchStatusIcon(matchState) {
  const status = relayStatus(matchState)
  if (status.done) return { cls: 'is-complete', icon: '✓', title: 'Hoàn thành' }
  if (status.legIndex > 0 || matchState.current.a > 0 || matchState.current.b > 0) {
    return { cls: 'is-live', icon: '●', title: 'Đang thi đấu' }
  }
  return { cls: 'is-pending', icon: '○', title: 'Chưa thi đấu' }
}

function getTeamStandings(gender) {
  const state = relayScoreState[gender]
  const stats = new Map()
  TEAM_LABELS.forEach(t =>
    stats.set(t, { team: t, played: 0, wins: 0, losses: 0, scored: 0, conceded: 0, diff: 0 })
  )

  let completedCount = 0
  TEAM_ROUND_ROBIN.forEach(m => {
    const matchId = `T${m.match}`
    const ms = state[matchId]
    if (!ms) return
    const status = relayStatus(ms)
    if (!status.done) return
    completedCount += 1
    const cum = status.cumulative
    const home = stats.get(m.home)
    const away = stats.get(m.away)
    home.played += 1
    away.played += 1
    home.scored += cum.a
    home.conceded += cum.b
    away.scored += cum.b
    away.conceded += cum.a
    if (cum.a > cum.b) {
      home.wins += 1
      away.losses += 1
    } else if (cum.b > cum.a) {
      away.wins += 1
      home.losses += 1
    }
  })

  stats.forEach(row => {
    row.diff = row.scored - row.conceded
  })

  const rows = [...stats.values()].sort((x, y) => {
    if (y.wins !== x.wins) return y.wins - x.wins
    if (y.diff !== x.diff) return y.diff - x.diff
    if (y.scored !== x.scored) return y.scored - x.scored
    return x.team.localeCompare(y.team)
  })

  let tieNote = ''
  if (completedCount === TEAM_ROUND_ROBIN.length) {
    for (let i = 0; i < rows.length - 1; i++) {
      if (
        rows[i].wins === rows[i + 1].wins &&
        rows[i].diff === rows[i + 1].diff &&
        rows[i].scored === rows[i + 1].scored
      ) {
        tieNote = `Đội ${rows[i].team} và Đội ${rows[i + 1].team} (nhóm ${GENDER_LABELS[gender]}) đang ngang nhau ở mọi chỉ số — đội trưởng 2 đội chọn 2 thành viên đại diện thi đấu phân hạng (ghi nhận kết quả thủ công).`
        break
      }
    }
  }
  return { rows, tieNote }
}

function matchesGridEl(gender) {
  return document.getElementById(gender === 'nam' ? 'teamMatchesGridNam' : 'teamMatchesGridNu')
}
function standingsBodyEl(gender) {
  return document.getElementById(gender === 'nam' ? 'teamStandingsBodyNam' : 'teamStandingsBodyNu')
}
function tieNoteEl(gender) {
  return document.getElementById(gender === 'nam' ? 'teamTieNoteNam' : 'teamTieNoteNu')
}

function renderTeamMatches(gender) {
  const grid = matchesGridEl(gender)
  if (!grid) return
  grid.innerHTML = ''
  ;[1, 2, 3].forEach(r => {
    const block = document.createElement('div')
    block.className = 'schedule-group is-visible'
    block.innerHTML = `<h4>Vòng ${r}</h4><ol></ol>`
    const ol = block.querySelector('ol')
    TEAM_ROUND_ROBIN.filter(m => m.round === r).forEach(m => {
      const matchId = `T${m.match}`
      const ms = getRelayMatch(gender, matchId)
      const cum = relayCumulative(ms)
      const status = matchStatusIcon(ms)
      const li = document.createElement('li')
      li.className = 'is-visible'
      li.dataset.matchId = matchId
      li.innerHTML = `
        <span class="schedule-group__no">${matchId}</span>
        <span class="schedule-group__match">
          <strong>Đội ${m.home}</strong>
          <span class="team-match__score">${cum.a} - ${cum.b}</span>
          <strong>Đội ${m.away}</strong>
        </span>
        <span class="schedule-group__status ${status.cls}" title="${status.title}" aria-label="${status.title}">${status.icon}</span>
      `
      ol.appendChild(li)
    })
    grid.appendChild(block)
  })
  renderTeamStandings(gender)
}

function renderTeamStandings(gender) {
  const tbody = standingsBodyEl(gender)
  const noteEl = tieNoteEl(gender)
  if (!tbody) return
  const { rows, tieNote } = getTeamStandings(gender)
  tbody.innerHTML = ''
  rows.forEach((row, i) => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>Đội ${row.team}</td>
      <td>${row.played}</td>
      <td>${row.wins}</td>
      <td>${row.losses}</td>
      <td>${row.diff > 0 ? '+' : ''}${row.diff}</td>
      <td>${row.scored}</td>
    `
    tbody.appendChild(tr)
  })
  if (noteEl) {
    noteEl.textContent = tieNote
    noteEl.hidden = !tieNote
  }
}

// ===== Stats bar (24 VĐV / 2 nhóm / 8 đội / 12 trận) =====
const statRegistered = document.getElementById('statRegistered')

function updateStats() {
  if (!statRegistered) return
  const filled = GENDERS.reduce(
    (sum, g) =>
      sum + TEAM_LABELS.reduce((s, t) => s + teamRoster[g][t].filter(n => n && n.trim()).length, 0),
    0
  )
  statRegistered.textContent = filled
}

GENDERS.forEach(g => {
  renderTeamRosterForm(g)
  renderTeamMatches(g)
})
updateStats()

// ===== Team Relay Modal =====
;(function () {
  const teamModal = document.getElementById('teamModal')
  if (!teamModal) return
  const teamClose = document.getElementById('teamClose')
  const teamCodeEl = document.getElementById('teamCode')
  const teamBody = document.getElementById('teamBody')
  const teamStatusEl = document.getElementById('teamStatus')

  let ctx = null // { gender, matchId, home, away, round }
  let view = 'play' // 'order' | 'play'
  let orderChoices = {} // { side, home: [...], away: [...] }
  let teamTrigger = null
  let holdTimer = null
  let holdInterval = null
  let statusTimer = null

  function matchupLabel() {
    return `Đội ${ctx.home} vs Đội ${ctx.away} · Nhóm ${GENDER_LABELS[ctx.gender]}`
  }

  function flashSaved() {
    teamStatusEl.textContent = '✓ Đã lưu'
    teamStatusEl.style.opacity = '1'
    clearTimeout(statusTimer)
    statusTimer = setTimeout(() => {
      teamStatusEl.style.opacity = '0'
    }, 1800)
  }

  function syncExternal() {
    renderTeamMatches(ctx.gender)
  }

  function currentLegPairing() {
    const m = getRelayMatch(ctx.gender, ctx.matchId)
    const legIndex = m.completedLegs.length
    if (legIndex >= RELAY_CHECKPOINTS.length) return null
    const order = teamOrder[ctx.gender][ctx.matchId]
    if (!order) return null
    const homeDef = PAIR3_DEFS[order.home[legIndex]]
    const awayDef = PAIR3_DEFS[order.away[legIndex]]
    return {
      homeMembers: homeDef.map(i => teamMemberName(ctx.gender, ctx.home, i)),
      awayMembers: awayDef.map(i => teamMemberName(ctx.gender, ctx.away, i))
    }
  }

  function render() {
    if (view === 'order') renderOrder()
    else renderPlay()
  }

  function renderOrder() {
    const side = orderChoices.side
    const chosen = orderChoices[side]
    if (chosen.length >= 2) {
      if (side === 'home') {
        orderChoices.side = 'away'
        render()
        return
      }
      finishOrderSetup()
      return
    }
    const remaining = [0, 1, 2].filter(i => !chosen.includes(i))
    const teamLbl = side === 'home' ? ctx.home : ctx.away
    const stepNum = chosen.length + 1
    let html = `<div class="ref-modal__matchup">${escapeHtml(matchupLabel())}</div>
      <div class="ref-modal__step-label">Đội ${teamLbl} · Chọn cặp ra sân Chặng ${stepNum}</div>
      <div class="ref-modal__choice-grid">`
    remaining.forEach(i => {
      const members = PAIR3_DEFS[i].map(mi => teamMemberName(ctx.gender, teamLbl, mi)).join(' + ')
      html += `<button class="ref-modal__choice-btn" data-order-pick="${i}">${escapeHtml(members)}</button>`
    })
    html += `</div><button class="ref-modal__link" data-action="cancel-order">Hủy</button>`
    teamBody.innerHTML = html
  }

  function pickOrder(i) {
    orderChoices[orderChoices.side].push(i)
    render()
  }

  function finishOrderSetup() {
    const homeLeftover = [0, 1, 2].find(i => !orderChoices.home.includes(i))
    const awayLeftover = [0, 1, 2].find(i => !orderChoices.away.includes(i))
    teamOrder[ctx.gender][ctx.matchId] = {
      home: orderChoices.home.concat([homeLeftover]),
      away: orderChoices.away.concat([awayLeftover])
    }
    saveTeamOrder(ctx.gender)
    flashSaved()
    view = 'play'
    render()
  }

  function startOrderSetup() {
    orderChoices = { side: 'home', home: [], away: [] }
    view = 'order'
    render()
  }

  function renderPlay() {
    const m = getRelayMatch(ctx.gender, ctx.matchId)
    const cum = relayCumulative(m)
    const status = relayStatus(m)
    const pairing = currentLegPairing()

    let html = `<div class="ref-modal__matchup">${escapeHtml(matchupLabel())}</div>`

    if (!pairing) {
      html += `<div class="ref-modal__note">Chưa chọn thứ tự ra sân cho trận này.</div>
        <div class="ref-modal__actions">
          <button class="ref-modal__action-btn" data-action="start-order">Chọn thứ tự ra sân</button>
        </div>`
      teamBody.innerHTML = html
      return
    }

    const checkpointLabel = status.done
      ? RELAY_CHECKPOINTS[RELAY_CHECKPOINTS.length - 1]
      : status.checkpoint
    html += `<div class="ref-modal__note">Chặng ${status.legIndex + 1}/${RELAY_CHECKPOINTS.length} · mốc ${checkpointLabel} điểm<br>
      <strong>${escapeHtml(pairing.homeMembers.join(' + '))}</strong> vs <strong>${escapeHtml(pairing.awayMembers.join(' + '))}</strong></div>`

    html += `<div class="ref-modal__board">
        <div class="ref-modal__col">
          <div class="ref-modal__name">Đội ${escapeHtml(ctx.home)}</div>
          <button class="ref-modal__btn" data-step-side="a" data-dir="up" ${status.done ? 'disabled' : ''}>▲</button>
          <div class="ref-modal__score" id="teamScoreA">${cum.a}</div>
          <button class="ref-modal__btn" data-step-side="a" data-dir="down" ${status.done ? 'disabled' : ''}>▼</button>
        </div>
        <div class="ref-modal__dash">–</div>
        <div class="ref-modal__col">
          <div class="ref-modal__name">Đội ${escapeHtml(ctx.away)}</div>
          <button class="ref-modal__btn" data-step-side="b" data-dir="up" ${status.done ? 'disabled' : ''}>▲</button>
          <div class="ref-modal__score" id="teamScoreB">${cum.b}</div>
          <button class="ref-modal__btn" data-step-side="b" data-dir="down" ${status.done ? 'disabled' : ''}>▼</button>
        </div>
      </div>`

    if (status.done) {
      const winner = cum.a > cum.b ? ctx.home : ctx.away
      html += `<div class="ref-modal__final-banner">🏆 Đội ${escapeHtml(winner)} thắng ${Math.max(cum.a, cum.b)}-${Math.min(cum.a, cum.b)}</div>`
    }

    html += `<div class="ref-modal__footer-row">
        <button class="ref-modal__action-btn ref-modal__action-btn--ghost" data-action="start-order">Đổi thứ tự</button>
        <button class="ref-modal__action-btn ref-modal__action-btn--ghost" data-action="reset-match">Đặt lại trận</button>
      </div>`

    teamBody.innerHTML = html
  }

  function stepRelay(side, dir) {
    const before = getRelayMatch(ctx.gender, ctx.matchId)
    const beforeLegIndex = before.completedLegs.length
    applyRelayDelta(ctx.gender, ctx.matchId, side, dir === 'up' ? 1 : -1)
    syncExternal()
    flashSaved()
    const after = getRelayMatch(ctx.gender, ctx.matchId)
    if (after.completedLegs.length !== beforeLegIndex || relayStatus(after).done) {
      render()
    } else {
      const cum = relayCumulative(after)
      const elA = document.getElementById('teamScoreA')
      const elB = document.getElementById('teamScoreB')
      if (elA) elA.textContent = String(cum.a)
      if (elB) elB.textContent = String(cum.b)
    }
  }

  function startHold(side, dir) {
    stepRelay(side, dir)
    holdTimer = setTimeout(() => {
      holdInterval = setInterval(() => stepRelay(side, dir), 100)
    }, 400)
  }

  function stopHold() {
    clearTimeout(holdTimer)
    clearInterval(holdInterval)
    holdTimer = null
    holdInterval = null
  }

  function resetMatch() {
    if (!confirm('Đặt lại trận này sẽ xóa toàn bộ tỷ số các chặng đã đấu. Tiếp tục?')) return
    resetRelayMatch(ctx.gender, ctx.matchId)
    syncExternal()
    flashSaved()
    view = 'play'
    render()
  }

  function openTeamModal({ gender, matchId, home, away, round }) {
    teamTrigger = document.activeElement
    ctx = { gender, matchId, home, away, round }
    view = 'play'
    teamCodeEl.textContent = matchId
    teamStatusEl.style.opacity = '0'
    render()
    teamModal.classList.add('is-open')
    teamModal.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
    setTimeout(() => teamClose.focus(), 50)
  }

  function closeTeamModal() {
    teamModal.classList.remove('is-open')
    teamModal.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
    stopHold()
    ctx = null
    if (teamTrigger) {
      teamTrigger.focus()
      teamTrigger = null
    }
  }

  teamBody.addEventListener('click', e => {
    const orderBtn = e.target.closest('[data-order-pick]')
    if (orderBtn) {
      pickOrder(Number(orderBtn.dataset.orderPick))
      return
    }
    const actionBtn = e.target.closest('[data-action]')
    if (actionBtn) {
      const action = actionBtn.dataset.action
      if (action === 'start-order') startOrderSetup()
      else if (action === 'cancel-order') {
        view = 'play'
        render()
      } else if (action === 'reset-match') resetMatch()
    }
  })

  teamBody.addEventListener('mousedown', e => {
    const btn = e.target.closest('[data-step-side]')
    if (!btn || btn.disabled) return
    e.preventDefault()
    startHold(btn.dataset.stepSide, btn.dataset.dir)
  })
  document.addEventListener('mouseup', stopHold)

  teamBody.addEventListener(
    'touchstart',
    e => {
      const btn = e.target.closest('[data-step-side]')
      if (!btn || btn.disabled) return
      startHold(btn.dataset.stepSide, btn.dataset.dir)
    },
    { passive: true }
  )
  teamBody.addEventListener('touchend', stopHold)
  teamBody.addEventListener('touchcancel', stopHold)

  teamClose.addEventListener('click', closeTeamModal)
  teamModal.addEventListener('click', e => {
    if (e.target === teamModal) closeTeamModal()
  })
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && teamModal.classList.contains('is-open')) closeTeamModal()
  })

  function wireGrid(gender) {
    const grid = matchesGridEl(gender)
    if (!grid) return
    grid.addEventListener('click', e => {
      const li = e.target.closest('li[data-match-id]')
      if (!li) return
      const matchId = li.dataset.matchId
      const m = TEAM_ROUND_ROBIN.find(x => `T${x.match}` === matchId)
      if (!m) return
      openTeamModal({ gender, matchId, home: m.home, away: m.away, round: m.round })
    })
  }

  GENDERS.forEach(wireGrid)
})()
