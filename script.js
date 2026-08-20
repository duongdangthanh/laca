// ===== LACA TEAM CHAMPIONSHIP — SEASON 4 — landing interactions =====
// 08 đội (A–H) · 2 bảng (A: A·B·C·D | B: E·F·G·H) · vòng bảng vòng tròn 1 lượt
// + vòng loại trực tiếp (bán kết – chung kết). Mỗi "trận lớn" gồm 3 "trận con"
// theo thứ tự Đôi nam → Đôi nữ → Đôi nam nữ, xoay cặp cố định theo Điều lệ mục VII.

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

// --- Countdown to match day: Sat 12 Sep 2026, 09:00 (local, khai cuộc) ---
const target = new Date('2026-09-12T09:00:00').getTime()
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
  '.sec-head, .pillar, .fcard, .rules-note, .venue__info, .venue__map, .stat, .guide-flow__step, .guide-card, .gender-block, .bigmatch, .timeline li, .prize, .ref-table-wrap'
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
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ===== Tournament data model (Điều lệ LACA TEAM CHAMPIONSHIP — SEASON 4) =====
// BOARD_TEAMS / BOARDS / TEAMS nằm ở seed-data.js (nạp trước file này trong
// index.html).

// Xoay cặp mục VII — áp dụng đồng nhất cho cả 8 đội theo lượt vòng bảng của đội đó.
const ROTATION = [
  { nam: ['M1', 'M2'], nu: ['W1', 'W2'], mix: ['M3', 'W3'] }, // Trận vòng bảng 1
  { nam: ['M1', 'M3'], nu: ['W1', 'W3'], mix: ['M2', 'W2'] }, // Trận vòng bảng 2
  { nam: ['M2', 'M3'], nu: ['W2', 'W3'], mix: ['M1', 'W1'] } // Trận vòng bảng 3
]

// Sân cố định theo vị trí trận lớn trong lượt (mục IX): trận lớn thứ nhất /
// thứ hai của mỗi bảng luôn dùng cùng cặp sân, bất kể hai đội nào gặp nhau.
const BOARD_COURTS = {
  A: [
    [1, 5],
    [2, 6]
  ],
  B: [
    [3, 7],
    [4, 8]
  ]
}

// Giờ thi đấu theo lượt (mục XI) — mỗi trận con 20 phút: sub 1&2 (đôi nam/đôi
// nữ) đấu song song, sub 3 (đôi nam nữ) đấu sau đó trên sân thứ nhất của cặp
// sân.
const ROUND_TIME = [
  { ab: '09:00 – 09:20', c: '09:25 – 09:45' },
  { ab: '09:55 – 10:15', c: '10:20 – 10:40' },
  { ab: '10:50 – 11:10', c: '11:15 – 11:35' }
]

const SUB_LABELS = {
  nam: 'Trận 1 · Đôi nam',
  nu: 'Trận 2 · Đôi nữ',
  mix: 'Trận 3 · Đôi nam nữ'
}

// Vòng tròn 1 lượt, 4 đội [t0,t1,t2,t3]: R1 t0-t1 & t2-t3, R2 t0-t2 & t1-t3,
// R3 t0-t3 & t1-t2 — đúng sơ đồ đối đầu mục V.2 / lịch chi tiết mục XI.
function buildBoardBigMatches(board) {
  const t = BOARD_TEAMS[board]
  const rounds = [
    [
      [t[0], t[1]],
      [t[2], t[3]]
    ],
    [
      [t[0], t[2]],
      [t[1], t[3]]
    ],
    [
      [t[0], t[3]],
      [t[1], t[2]]
    ]
  ]
  const matches = []
  rounds.forEach((pair, roundIdx) => {
    pair.forEach((teams, posIdx) => {
      matches.push({
        id: `${board}-R${roundIdx + 1}-${posIdx}`,
        board,
        round: roundIdx + 1,
        pos: posIdx,
        home: teams[0],
        away: teams[1],
        courts: BOARD_COURTS[board][posIdx]
      })
    })
  })
  return matches
}

function buildSubDefs(match) {
  const r = ROTATION[match.round - 1]
  const rt = ROUND_TIME[match.round - 1]
  const courts = match.courts
  return [
    {
      idx: 1,
      kind: 'nam',
      label: SUB_LABELS.nam,
      time: rt.ab,
      court: courts[0],
      roles: r.nam
    },
    {
      idx: 2,
      kind: 'nu',
      label: SUB_LABELS.nu,
      time: rt.ab,
      court: courts[1],
      roles: r.nu
    },
    {
      idx: 3,
      kind: 'mix',
      label: SUB_LABELS.mix,
      time: rt.c,
      court: courts[0],
      roles: r.mix
    }
  ]
}

// Vòng loại trực tiếp (mục VIII/XI) — không có xoay cặp cố định, đội tự sắp xếp.
const KO_DEFS = {
  BK1: {
    label: 'Bán kết 1',
    homeSlot: { board: 'A', rank: 1 },
    awaySlot: { board: 'B', rank: 2 },
    time: '12:00 – 12:20',
    courts: [1, 5, 6]
  },
  BK2: {
    label: 'Bán kết 2',
    homeSlot: { board: 'B', rank: 1 },
    awaySlot: { board: 'A', rank: 2 },
    time: '12:00 – 12:20',
    courts: [4, 7, 8]
  },
  CK: {
    label: 'Chung kết',
    homeFrom: 'BK1',
    awayFrom: 'BK2',
    time: '12:40 – 13:00',
    courts: [5, 6, 7]
  }
}

// ===== Danh sách chính thức (mục III) =====
// Đội 1–4 = Bảng A (mã A–D) · Đội 5–8 = Bảng B (mã E–H) — đúng danh sách đội
// chính thức đã chốt (không phải kết quả của công cụ bốc thăm ngẫu nhiên).
// Cập nhật trực tiếp tại đây nếu có thay đổi nhân sự.
const ROSTER = {
  A: {
    M1: 'Hùng',
    M2: 'Thuy Dang',
    M3: 'Quang V',
    W1: 'Mai Nguyễn',
    W2: 'Trang Lê',
    W3: 'Thanh Tâm'
  },
  B: {
    M1: 'Quốc Ân',
    M2: 'Châu Đỗ',
    M3: 'Chen',
    W1: 'Mai Trân',
    W2: 'Thảo Hiếu',
    W3: 'Hoa Vũ'
  },
  C: {
    M1: 'Khoa',
    M2: 'Tiến Hoàng',
    M3: 'Xuân Trường',
    W1: 'Tyna Trương',
    W2: 'Hoàng Phúc',
    W3: 'Ngọc'
  },
  D: {
    M1: 'Huy Lưu',
    M2: 'Quân Trần',
    M3: 'Mạnh Ngô',
    W1: 'Diệp Ann',
    W2: 'Mai Thu',
    W3: 'Lyxynk'
  },
  E: {
    M1: 'Đình Tiến',
    M2: 'Thanh Mập',
    M3: 'Sơn Núi',
    W1: 'Vạn Duyên',
    W2: 'Phạm Thoa',
    W3: 'Thao Flyer'
  },
  F: {
    M1: 'Quang Khánh',
    M2: 'Lukita',
    M3: 'Khắc Trà',
    W1: 'Loan Nguyễn',
    W2: 'Minh Anh',
    W3: 'Trúc Quyên'
  },
  G: {
    M1: 'Minh Pandora',
    M2: 'Thuận Sovo',
    M3: 'Phương Nam',
    W1: 'Ánh Lê',
    W2: 'Ukly Hiền',
    W3: 'Khanh'
  },
  H: {
    M1: 'Tùng Nè',
    M2: 'Hiếu Trương',
    M3: 'Khầy Trường',
    W1: 'Toại Thủy',
    W2: 'Minh Thảo',
    W3: 'Thiên Hà'
  }
}

// ===== Danh sách đội =====
function teamCardHTML(team) {
  const nam = ['M1', 'M2', 'M3'].map(r => memberName(team, r)).join(', ')
  const nu = ['W1', 'W2', 'W3'].map(r => memberName(team, r)).join(', ')
  return `<div class="schedule-group is-visible team-card">
      <div class="team-card__code">Đội ${team}</div>
      <div class="team-card__roster">
        <div><span class="team-card__label">Nam</span> ${escapeHtml(nam)}</div>
        <div><span class="team-card__label">Nữ</span> ${escapeHtml(nu)}</div>
      </div>
    </div>`
}

function renderTeamRoster() {
  const el = document.getElementById('teamRosterGrid')
  if (!el) return
  el.innerHTML = TEAMS.map(teamCardHTML).join('')
}

// ===== Persisted state (chỉ lưu tỷ số — không lưu đăng ký) =====
const SCORE_KEY = 'laca_s4_scores_v1'

function loadJson(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : {}
  } catch (_e) {
    return {}
  }
}

const roster = ROSTER
let scores = loadJson(SCORE_KEY)

function saveScores() {
  localStorage.setItem(SCORE_KEY, JSON.stringify(scores))
}

function memberName(team, role) {
  const v = roster[team] && roster[team][role]
  return v && v.trim() ? v.trim() : `${team}-${role}`
}
function pairLabel(team, roles) {
  return roles.map(r => memberName(team, r)).join(' + ')
}

// ===== Scoring rule: 01 ván đến 11, cách biệt 2, tối đa chạm 15 (mục VI) =====
function isGameDone(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return false
  const hi = Math.max(a, b)
  const diff = Math.abs(a - b)
  if (hi >= 15) return true
  return hi >= 11 && diff >= 2
}

// ===== View-model builders =====
function buildGroupMatchVM(match) {
  const subs = buildSubDefs(match).map(s => ({
    idx: s.idx,
    kind: s.kind,
    label: s.label,
    time: s.time,
    court: s.court,
    homePair: pairLabel(match.home, s.roles),
    awayPair: pairLabel(match.away, s.roles)
  }))
  return {
    id: match.id,
    code: `Lượt ${match.round} · Trận lớn ${match.pos + 1}`,
    home: { code: match.home, label: `Đội ${match.home}` },
    away: { code: match.away, label: `Đội ${match.away}` },
    subs,
    freeLineup: false
  }
}

function getMatchAggregate(vm) {
  const subs = vm.subs.map(s => {
    const key = `${vm.id}#${s.idx}`
    const sc = scores[key] || {}
    const a = Number.isInteger(sc.a) ? sc.a : null
    const b = Number.isInteger(sc.b) ? sc.b : null
    const done = isGameDone(a, b)
    return {
      ...s,
      key,
      a,
      b,
      done,
      winner: done ? (a > b ? 'home' : 'away') : null
    }
  })
  const homeWins = subs.filter(s => s.winner === 'home').length
  const awayWins = subs.filter(s => s.winner === 'away').length
  const doneCount = subs.filter(s => s.done).length
  // Với vòng loại trực tiếp, chỉ tính kết quả khi cả 2 đội đã được xác định
  // (Nhất/Nhì bảng hoặc đội thắng bán kết) — tránh gán sai thắng/thua khi mã
  // đội còn là chỗ trống ("Nhất bảng A"...).
  const unresolved = vm.freeLineup && (!vm.home.code || !vm.away.code)
  const complete = !unresolved && doneCount === 3
  const homeScored = subs.reduce((sum, s) => sum + (s.a || 0), 0)
  const awayScored = subs.reduce((sum, s) => sum + (s.b || 0), 0)
  const winner = complete
    ? homeWins > awayWins
      ? vm.home.code
      : vm.away.code
    : null
  return {
    subs,
    homeWins,
    awayWins,
    doneCount,
    complete,
    homeScored,
    awayScored,
    winner
  }
}

function buildKoMatchVM(id) {
  const def = KO_DEFS[id]
  let home, away
  if (def.homeSlot) {
    home = resolveBoardRank(def.homeSlot.board, def.homeSlot.rank)
  } else {
    const srcVm = buildKoMatchVM(def.homeFrom)
    const agg = getMatchAggregate(srcVm)
    home = agg.complete
      ? {
          code: agg.winner,
          label:
            agg.winner === srcVm.home.code ? srcVm.home.label : srcVm.away.label
        }
      : { code: null, label: `Thắng ${KO_DEFS[def.homeFrom].label}` }
  }
  if (def.awaySlot) {
    away = resolveBoardRank(def.awaySlot.board, def.awaySlot.rank)
  } else {
    const srcVm = buildKoMatchVM(def.awayFrom)
    const agg = getMatchAggregate(srcVm)
    away = agg.complete
      ? {
          code: agg.winner,
          label:
            agg.winner === srcVm.home.code ? srcVm.home.label : srcVm.away.label
        }
      : { code: null, label: `Thắng ${KO_DEFS[def.awayFrom].label}` }
  }
  const kinds = ['nam', 'nu', 'mix']
  const subs = [1, 2, 3].map(idx => ({
    idx,
    kind: kinds[idx - 1],
    label: SUB_LABELS[kinds[idx - 1]],
    time: def.time,
    court: def.courts[idx - 1],
    homePair: null,
    awayPair: null
  }))
  return { id, code: def.label, home, away, subs, freeLineup: true }
}

// ===== Standings (mục V.3): Hiệu số → Đối đầu trực tiếp → Tổng điểm trận =====
function getBoardStandings(board) {
  const teams = BOARD_TEAMS[board]
  const matches = buildBoardBigMatches(board)
  const stats = new Map(
    teams.map(t => [
      t,
      { team: t, played: 0, scored: 0, conceded: 0, diff: 0, subW: 0, subL: 0 }
    ])
  )
  let completedCount = 0
  matches.forEach(m => {
    const agg = getMatchAggregate(buildGroupMatchVM(m))
    if (!agg.complete) return
    completedCount += 1
    const h = stats.get(m.home)
    const a = stats.get(m.away)
    h.played += 1
    a.played += 1
    h.scored += agg.homeScored
    h.conceded += agg.awayScored
    a.scored += agg.awayScored
    a.conceded += agg.homeScored
    h.subW += agg.homeWins
    h.subL += agg.awayWins
    a.subW += agg.awayWins
    a.subL += agg.homeWins
  })
  stats.forEach(row => {
    row.diff = row.scored - row.conceded
  })

  function headToHeadWinner(x, y) {
    const m = matches.find(
      mm => (mm.home === x && mm.away === y) || (mm.home === y && mm.away === x)
    )
    if (!m) return null
    const agg = getMatchAggregate(buildGroupMatchVM(m))
    return agg.complete ? agg.winner : null
  }

  const rows = [...stats.values()].sort((x, y) => {
    if (y.diff !== x.diff) return y.diff - x.diff
    const w = headToHeadWinner(x.team, y.team)
    if (w === x.team) return -1
    if (w === y.team) return 1
    if (y.scored !== x.scored) return y.scored - x.scored
    return x.team.localeCompare(y.team)
  })

  let tieNote = ''
  if (completedCount === matches.length) {
    for (let i = 0; i < rows.length - 1; i++) {
      if (
        rows[i].diff === rows[i + 1].diff &&
        rows[i].scored === rows[i + 1].scored &&
        !headToHeadWinner(rows[i].team, rows[i + 1].team)
      ) {
        tieNote = `Đội ${rows[i].team} và Đội ${rows[i + 1].team} (Bảng ${board}) vẫn ngang nhau ở mọi chỉ số — Ban tổ chức sẽ quyết định theo hình thức bốc thăm (mục V.3).`
        break
      }
    }
  }
  return { rows, tieNote, completedCount, totalMatches: matches.length }
}

function resolveBoardRank(board, rank) {
  const { rows } = getBoardStandings(board)
  const row = rows[rank - 1]
  if (row) return { code: row.team, label: `Đội ${row.team}` }
  return {
    code: null,
    label: rank === 1 ? `Nhất bảng ${board}` : `Nhì bảng ${board}`
  }
}

// ===== Rendering =====
function slotHead(vm, side) {
  const v = vm[side]
  if (vm.freeLineup)
    return `<span data-slot="${vm.id}-${side}">${escapeHtml(v.label)}</span>`
  return `<span>${escapeHtml(v.label)}</span>`
}

function statusIconFor(s) {
  if (s.done) return { cls: 'is-complete', icon: '✓' }
  if (s.a != null || s.b != null) return { cls: 'is-live', icon: '●' }
  return { cls: 'is-pending', icon: '○' }
}

function matchCardHTML(vm) {
  let html = `<div class="schedule-group is-visible bigmatch${vm.freeLineup ? ' bigmatch--ko' : ''}" data-match-id="${vm.id}">
    <div class="bigmatch__head">
      <span class="bigmatch__code">${escapeHtml(vm.code)}</span>
      <h4>${slotHead(vm, 'home')} <span class="bigmatch__vs">vs</span> ${slotHead(vm, 'away')}</h4>
      <span class="bigmatch__result" data-result="${vm.id}">0/3</span>
    </div>`

  vm.subs.forEach(s => {
    const key = `${vm.id}#${s.idx}`
    const sc = scores[key] || {}
    const aVal = Number.isInteger(sc.a) ? sc.a : ''
    const bVal = Number.isInteger(sc.b) ? sc.b : ''
    html += `<div class="bigmatch__sub">
      <div class="bigmatch__sub-meta">
        <span class="bigmatch__sub-label">${escapeHtml(s.label)}</span>
        <span class="bigmatch__sub-time">${escapeHtml(s.time)} · Sân ${s.court}</span>
      </div>
      <div class="bigmatch__sub-teams${vm.freeLineup ? ' bigmatch__sub-teams--free' : ''}">`
    if (!vm.freeLineup) {
      html += `<span class="bigmatch__pair" data-pair="${vm.id}-${s.idx}-home">${escapeHtml(s.homePair)}</span>`
    }
    html += `<span class="schedule-group__score-inputs">
          <input type="number" min="0" max="15" step="1" inputmode="numeric" data-score-key="${key}" data-side="a" value="${aVal}" />
          <span>-</span>
          <input type="number" min="0" max="15" step="1" inputmode="numeric" data-score-key="${key}" data-side="b" value="${bVal}" />
        </span>`
    if (!vm.freeLineup) {
      html += `<span class="bigmatch__pair bigmatch__pair--right" data-pair="${vm.id}-${s.idx}-away">${escapeHtml(s.awayPair)}</span>`
    }
    html += `</div>
      <span class="schedule-group__status is-pending" data-status="${key}">○</span>
    </div>`
  })

  html += `<p class="bigmatch__winner" data-winner="${vm.id}" hidden></p>`
  if (vm.freeLineup) {
    html += `<p class="bigmatch__note">Đội tự sắp xếp đội hình — đủ 06 thành viên ra sân, mỗi người chỉ đánh 01 trận con.</p>`
  }
  html += `</div>`
  return html
}

function refreshMatchDerived(vm) {
  const agg = getMatchAggregate(vm)
  agg.subs.forEach(s => {
    const statusEl = document.querySelector(`[data-status="${s.key}"]`)
    if (statusEl) {
      const st = statusIconFor(s)
      statusEl.textContent = st.icon
      statusEl.className = `schedule-group__status ${st.cls}`
    }
    const homeSpan = document.querySelector(
      `[data-pair="${vm.id}-${s.idx}-home"]`
    )
    const awaySpan = document.querySelector(
      `[data-pair="${vm.id}-${s.idx}-away"]`
    )
    if (homeSpan) homeSpan.classList.toggle('is-winner', s.winner === 'home')
    if (awaySpan) awaySpan.classList.toggle('is-winner', s.winner === 'away')
  })
  const resultEl = document.querySelector(`[data-result="${vm.id}"]`)
  const resultText = agg.complete
    ? `${Math.max(agg.homeWins, agg.awayWins)}–${Math.min(agg.homeWins, agg.awayWins)}`
    : `${agg.doneCount}/3`
  if (resultEl) {
    resultEl.textContent = resultText
    resultEl.classList.toggle('is-done', agg.complete)
  }
  const winnerEl = document.querySelector(`[data-winner="${vm.id}"]`)
  if (winnerEl) {
    if (agg.complete) {
      const label = agg.winner === vm.home.code ? vm.home.label : vm.away.label
      winnerEl.textContent = `🏆 ${label} thắng trận lớn ${resultText}`
      winnerEl.hidden = false
    } else {
      winnerEl.hidden = true
      winnerEl.textContent = ''
    }
  }
  return agg
}

function setSlotText(name, text) {
  const el = document.querySelector(`[data-slot="${name}"]`)
  if (el) el.textContent = text
}

function refreshKnockoutDerived() {
  const bk1 = buildKoMatchVM('BK1')
  const bk2 = buildKoMatchVM('BK2')
  const ck = buildKoMatchVM('CK')
  setSlotText('BK1-home', bk1.home.label)
  setSlotText('BK1-away', bk1.away.label)
  setSlotText('BK2-home', bk2.home.label)
  setSlotText('BK2-away', bk2.away.label)
  setSlotText('CK-home', ck.home.label)
  setSlotText('CK-away', ck.away.label)
  refreshMatchDerived(bk1)
  refreshMatchDerived(bk2)
  refreshMatchDerived(ck)
}

function boardScheduleEl(board) {
  return document.getElementById(
    board === 'A' ? 'scheduleBoardA' : 'scheduleBoardB'
  )
}
function boardStandingsBodyEl(board) {
  return document.getElementById(
    board === 'A' ? 'standingsBodyA' : 'standingsBodyB'
  )
}
function boardTieNoteEl(board) {
  return document.getElementById(board === 'A' ? 'tieNoteA' : 'tieNoteB')
}

// Tổng quan lịch thi đấu trận lớn (chưa đi vào chi tiết trận con) — mỗi thẻ
// là 1 trận lớn: lượt, giờ, sân, và đội hình 2 đội đối đầu.
function teamRosterLine(team) {
  const nam = ['M1', 'M2', 'M3'].map(r => memberName(team, r)).join(', ')
  const nu = ['W1', 'W2', 'W3'].map(r => memberName(team, r)).join(', ')
  return `Nam: ${escapeHtml(nam)} · Nữ: ${escapeHtml(nu)}`
}

function timeRangeLabel(round) {
  const rt = ROUND_TIME[round - 1]
  const start = rt.ab.split(' – ')[0]
  const end = rt.c.split(' – ')[1]
  return `${start}–${end}`
}

function overviewMatchCardHTML(m) {
  return `<div class="schedule-group is-visible bigmatch bigmatch--overview">
      <div class="bigmatch__head">
        <span class="bigmatch__code">Lượt ${m.round} · ${timeRangeLabel(m.round)} · Sân ${m.courts.join(' & ')}</span>
        <h4>Đội ${m.home} <span class="bigmatch__vs">vs</span> Đội ${m.away}</h4>
      </div>
      <div class="overview-teams">
        <div class="overview-team">
          <div class="overview-team__code">Đội ${m.home}</div>
          <div class="overview-team__roster">${teamRosterLine(m.home)}</div>
        </div>
        <div class="overview-team overview-team--right">
          <div class="overview-team__code">Đội ${m.away}</div>
          <div class="overview-team__roster">${teamRosterLine(m.away)}</div>
        </div>
      </div>
    </div>`
}

function renderBigMatchOverview() {
  const container = document.getElementById('bigMatchOverview')
  if (!container) return
  const rounds = [1, 2, 3]
  container.innerHTML = BOARDS.map(board => {
    const matches = buildBoardBigMatches(board)
    return `<div class="overview-board">
        <h4 class="overview-board__title">Bảng ${board}</h4>
        ${rounds
          .map(round => {
            const roundMatches = matches.filter(m => m.round === round)
            return `<div class="bigmatch-round">
                <h5 class="bigmatch-round__title">Lượt ${round}</h5>
                <div class="bigmatch-round__grid">
                  ${roundMatches.map(overviewMatchCardHTML).join('')}
                </div>
              </div>`
          })
          .join('')}
      </div>`
  }).join('')
}

function renderBoardSchedule(board) {
  const container = boardScheduleEl(board)
  if (!container) return
  const matches = buildBoardBigMatches(board)
  const rounds = [1, 2, 3]
  container.innerHTML = rounds
    .map(round => {
      const roundMatches = matches.filter(m => m.round === round)
      return `<div class="bigmatch-round">
          <h4 class="bigmatch-round__title">Lượt ${round}</h4>
          <div class="bigmatch-round__grid">
            ${roundMatches.map(m => matchCardHTML(buildGroupMatchVM(m))).join('')}
          </div>
        </div>`
    })
    .join('')
}

function renderStandings(board) {
  const tbody = boardStandingsBodyEl(board)
  if (!tbody) return
  const { rows, tieNote } = getBoardStandings(board)
  tbody.innerHTML = rows
    .map(
      (r, i) => `<tr>
      <td>${i + 1}</td>
      <td>Đội ${r.team}</td>
      <td>${r.played}</td>
      <td>${r.subW}-${r.subL}</td>
      <td>${r.diff > 0 ? '+' : ''}${r.diff}</td>
      <td>${r.scored}</td>
    </tr>`
    )
    .join('')
  const noteEl = boardTieNoteEl(board)
  if (noteEl) {
    noteEl.textContent = tieNote
    noteEl.hidden = !tieNote
  }
}

function renderKnockout() {
  const bkGrid = document.getElementById('knockoutBk')
  const ckSlot = document.getElementById('knockoutCk')
  if (bkGrid)
    bkGrid.innerHTML =
      matchCardHTML(buildKoMatchVM('BK1')) +
      matchCardHTML(buildKoMatchVM('BK2'))
  if (ckSlot) ckSlot.innerHTML = matchCardHTML(buildKoMatchVM('CK'))
}

function refreshAllDerived() {
  BOARDS.forEach(board => {
    buildBoardBigMatches(board).forEach(m =>
      refreshMatchDerived(buildGroupMatchVM(m))
    )
    renderStandings(board)
  })
  refreshKnockoutDerived()
}

// ===== Event wiring =====
document.addEventListener('input', e => {
  const input = e.target
  if (!(input instanceof HTMLInputElement)) return

  const key = input.dataset.scoreKey
  const side = input.dataset.side
  if (!key || (side !== 'a' && side !== 'b')) return

  const val = input.value.trim()
  if (!scores[key]) scores[key] = {}
  if (val === '') {
    delete scores[key][side]
  } else {
    let n = parseInt(val, 10)
    if (!Number.isFinite(n)) n = 0
    n = Math.max(0, Math.min(15, n))
    scores[key][side] = n
    if (String(n) !== val) input.value = String(n)
  }
  if (!Number.isInteger(scores[key].a) && !Number.isInteger(scores[key].b))
    delete scores[key]
  saveScores()

  const matchId = key.slice(0, key.indexOf('#'))
  if (KO_DEFS[matchId]) {
    refreshKnockoutDerived()
  } else {
    const board = matchId.startsWith('A-') ? 'A' : 'B'
    const match = buildBoardBigMatches(board).find(m => m.id === matchId)
    if (match) refreshMatchDerived(buildGroupMatchVM(match))
    renderStandings(board)
    refreshKnockoutDerived()
  }
})

// ===== Init =====
renderTeamRoster()
renderBigMatchOverview()
BOARDS.forEach(renderBoardSchedule)
renderKnockout()
refreshAllDerived()
