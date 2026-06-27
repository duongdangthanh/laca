// ===== LACA ZOMBIE Championship — landing interactions =====

const ROSTER_KEY = 'laca_roster_v5'
const ROSTER_LIMIT = 16

const DEFAULT_ROSTER = {
  male: [
    'Thanh Thật Thà',
    'Nguyễn Quốc Ân',
    'Thuận Sovo',
    'Mr Shadow',
    'Quang Khánh',
    'Dinh Thanh',
    'Khầy Trường',
    'Minh Dương',
    'Phương Nam Trần',
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
    'Mai',
    'Em Trâm',
    'Thảo Hiếu',
    'Toại Thủy',
    'Ánh Lê',
    'Hoa Vũ',
    'Vân Nguyễn',
    'Minh Thao',
    'Phạm Thoa',
    'Nana Phan',
    'Bubu Pham',
    'Tuyết Mei',
    'Ngọc Mai',
    'Khánh Diệp'
  ]
}

const GROUP_LABELS = ['A', 'B', 'C', 'D']

const _r = [
  { k: '01', v: ['01', '02', '03', '05', '07', '09'] },
  { k: '06', x: ['01'] },
  { k: '08', v: ['01', '02', '03', '05', '07', '09'] },
  { k: '10', v: ['01', '02', '03', '05', '08'] },
  { k: '13', x: ['01'] }
]

function withCodes(players) {
  return players.map((p, i) => ({ ...p, code: pad(i + 1) }))
}

function teamLabel(pair) {
  return `${pair.male.name} & ${pair.female.name}`
}

function buildPairs() {
  const males = withCodes(roster.male)
  const females = withCodes(roster.female)
  const pairs = []
  const usedM = new Set()
  const usedF = new Set()

  // Process constrained females in random order to avoid bias
  const anchors = shuffle(
    _r
      .map(rule => {
        const female = females.find(f => f.code === rule.k)
        return female ? { rule, female } : null
      })
      .filter(Boolean)
  )

  for (const { rule, female } of anchors) {
    if (usedF.has(female.id)) continue
    const pool = shuffle(males.filter(m => {
      if (usedM.has(m.id)) return false
      return rule.v ? rule.v.includes(m.code) : !rule.x.includes(m.code)
    }))
    if (!pool.length) continue
    const pick = pool[0]
    pairs.push({ male: pick, female, maleCode: pick.code, femaleCode: female.code })
    usedM.add(pick.id)
    usedF.add(female.id)
  }

  const restM = shuffle(males.filter(m => !usedM.has(m.id)))
  const restF = shuffle(females.filter(f => !usedF.has(f.id)))
  for (let i = 0; i < restM.length; i++) {
    pairs.push({
      male: restM[i],
      female: restF[i],
      maleCode: restM[i].code,
      femaleCode: restF[i].code
    })
  }

  return shuffle(pairs)
}

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
  '.sec-head, .about__media, .pillar, .fcard, .bracket, .rules-note, .group, .gallery__item, .timeline li, .prize, .prizes--mini, .venue__info, .venue__map, .stat, .roster-col, .draw-controls, .draw-phase'
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
const sleep = ms => new Promise(r => setTimeout(r, ms))

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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

function saveRoster(roster) {
  localStorage.setItem(ROSTER_KEY, JSON.stringify(roster))
}

let roster = loadRoster()

const maleList = document.getElementById('maleList')
const femaleList = document.getElementById('femaleList')
const maleCount = document.getElementById('maleCount')
const femaleCount = document.getElementById('femaleCount')
const rosterSummary = document.getElementById('rosterSummary')
const statRegistered = document.getElementById('statRegistered')

// Draw DOM (khai báo trước updateRosterUI để tránh lỗi TDZ)
let drawRunning = false
const drawBtn = document.getElementById('drawBtn')
const drawStatus = document.getElementById('drawStatus')
const drawProgress = document.getElementById('drawProgress')
const drawShuffle = document.getElementById('drawShuffle')
const shuffleMale = document.getElementById('shuffleMale')
const shuffleFemale = document.getElementById('shuffleFemale')
const pairsGrid = document.getElementById('pairsGrid')
const groupsGrid = document.getElementById('groupsGrid')
const scheduleGrid = document.getElementById('scheduleGrid')
const phasePairs = document.getElementById('phasePairs')
const phaseGroups = document.getElementById('phaseGroups')
const phaseSchedule = document.getElementById('phaseSchedule')
const drawBtnLabel = drawBtn?.querySelector('.draw-btn__label')

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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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

  updateDrawReadiness()
}

function addPlayer(gender, name) {
  const trimmed = name.trim()
  if (!trimmed) return false
  const list = roster[gender]
  if (list.length >= ROSTER_LIMIT) return false
  if (list.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) return false
  list.push({ id: uid(), name: trimmed })
  saveRoster(roster)
  updateRosterUI()
  return true
}


// --- Draw / Bốc thăm ---

function fillRosterToLimit() {
  const added = { male: 0, female: 0 }

  while (roster.male.length < ROSTER_LIMIT) {
    const no = roster.male.length + 1
    roster.male.push({ id: uid(), name: `Nam ${pad(no)}`, placeholder: true })
    added.male++
  }
  while (roster.female.length < ROSTER_LIMIT) {
    const no = roster.female.length + 1
    roster.female.push({ id: uid(), name: `Nữ ${pad(no)}`, placeholder: true })
    added.female++
  }

  if (added.male || added.female) {
    saveRoster(roster)
    updateRosterUI()
  }
  return added
}

function updateDrawReadiness() {
  if (drawRunning || !drawStatus) return
  const needM = Math.max(0, ROSTER_LIMIT - roster.male.length)
  const needF = Math.max(0, ROSTER_LIMIT - roster.female.length)
  drawStatus.className = 'draw-status'
  if (!needM && !needF) {
    drawStatus.textContent = 'Đủ 16 nam + 16 nữ — sẵn sàng bốc thăm!'
    drawStatus.classList.add('is-success')
  } else {
    const parts = []
    if (needM) parts.push(`còn thiếu ${needM} nam`)
    if (needF) parts.push(`còn thiếu ${needF} nữ`)
    drawStatus.textContent = `Chưa đủ 16 mỗi giới (${parts.join(', ')}). Bấm bốc thăm sẽ tự thêm Nam/Nữ xx cho đủ chỗ.`
  }
}

function setProgressStep(step) {
  drawProgress.hidden = false
  drawProgress.querySelectorAll('.draw-progress__step').forEach(el => {
    const s = el.dataset.step
    el.classList.remove('is-active', 'is-done')
    if (s === step) el.classList.add('is-active')
    else if (
      (step === 'grouping' && s === 'pairing') ||
      (step === 'scheduling' && (s === 'pairing' || s === 'grouping')) ||
      (step === 'done' && s !== step)
    ) {
      el.classList.add('is-done')
    }
  })
  if (step === 'done') {
    drawProgress.querySelectorAll('.draw-progress__step').forEach(el =>
      el.classList.add('is-done')
    )
  }
}

function resetDrawUI() {
  pairsGrid.innerHTML = ''
  groupsGrid.innerHTML = ''
  scheduleGrid.innerHTML = ''
  drawShuffle.hidden = true
  ;[phasePairs, phaseGroups, phaseSchedule].forEach(el => {
    el.classList.remove('is-active', 'is-done')
  })
  drawProgress.hidden = true
  drawProgress.querySelectorAll('.draw-progress__step').forEach(el =>
    el.classList.remove('is-active', 'is-done')
  )
}

function buildRoundRobin(teams) {
  const matches = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({ a: teams[i], b: teams[j] })
    }
  }
  return shuffle(matches)
}

async function runShufflePreview(males, females, cycles = 28) {
  drawShuffle.hidden = false
  for (let i = 0; i < cycles; i++) {
    shuffleMale.textContent = males[Math.floor(Math.random() * males.length)].name
    shuffleFemale.textContent = females[Math.floor(Math.random() * females.length)].name
    await sleep(55 + i * 2)
  }
}

async function revealPairs(pairs) {
  phasePairs.classList.add('is-active')
  pairsGrid.innerHTML = ''

  pairs.forEach((pair, i) => {
    const card = document.createElement('div')
    card.className = 'draw-pair'
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

  for (let i = 0; i < pairs.length; i++) {
    shuffleMale.textContent = pairs[i].male.name
    shuffleFemale.textContent = pairs[i].female.name
    const card = pairsGrid.children[i]
    card.classList.add('is-visible')
    await sleep(320)
    card.classList.add('is-locked')
    await sleep(180)
  }

  drawShuffle.hidden = true
  phasePairs.classList.add('is-done')
}

async function revealGroups(groups) {
  phaseGroups.classList.add('is-active')
  groupsGrid.innerHTML = ''

  groups.forEach((teams, gi) => {
    const block = document.createElement('div')
    block.className = 'draw-group'
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
      li.textContent = teamLabel(pair)
      ul.appendChild(li)
    })
    groupsGrid.appendChild(block)
  })

  for (let gi = 0; gi < groups.length; gi++) {
    const block = groupsGrid.children[gi]
    block.classList.add('is-visible', 'is-active')
    const items = block.querySelectorAll('li')
    for (const li of items) {
      await sleep(200)
      li.classList.add('is-visible')
    }
    block.classList.remove('is-active')
    await sleep(280)
  }

  phaseGroups.classList.add('is-done')
}

async function revealSchedule(groupSchedules) {
  phaseSchedule.classList.add('is-active')
  scheduleGrid.innerHTML = ''

  groupSchedules.forEach((matches, gi) => {
    const block = document.createElement('div')
    block.className = 'schedule-group'
    block.innerHTML = `<h4>Bảng ${GROUP_LABELS[gi]}</h4><ol></ol>`
    const ol = block.querySelector('ol')
    matches.forEach((m, mi) => {
      const li = document.createElement('li')
      li.innerHTML = `
        <span class="schedule-group__no">${pad(mi + 1)}</span>
        <span class="schedule-group__match">
          <strong>${escapeHtml(teamLabel(m.a))}</strong>
          vs
          <strong>${escapeHtml(teamLabel(m.b))}</strong>
        </span>
      `
      ol.appendChild(li)
    })
    scheduleGrid.appendChild(block)
  })

  for (const block of scheduleGrid.children) {
    block.classList.add('is-visible')
    await sleep(200)
    for (const li of block.querySelectorAll('li')) {
      await sleep(120)
      li.classList.add('is-visible')
    }
    await sleep(200)
  }

  phaseSchedule.classList.add('is-done')
}

async function runDraw() {
  if (drawRunning || !drawBtn) return

  drawRunning = true
  drawBtn.disabled = true
  drawBtn.classList.add('is-running')
  if (drawBtnLabel) drawBtnLabel.textContent = 'Đang bốc thăm...'

  try {
    const added = fillRosterToLimit()
    resetDrawUI()

    if (added.male || added.female) {
      const parts = []
      if (added.male) parts.push(`${added.male} nam`)
      if (added.female) parts.push(`${added.female} nữ`)
      drawStatus.className = 'draw-status'
      drawStatus.textContent = `Đã tự động thêm ${parts.join(' và ')} placeholder (Nam/Nữ xx)...`
      await sleep(900)
    }

    drawStatus.className = 'draw-status'
    drawStatus.textContent = 'Đang xáo trộn danh sách...'

    const males = withCodes(roster.male)
    const females = withCodes(roster.female)
    const pairs = buildPairs().map((p, i) => ({ ...p, id: i + 1 }))

    setProgressStep('pairing')
    await runShufflePreview(males, females)
    drawStatus.textContent = 'Đang ghép cặp ngẫu nhiên...'
    await revealPairs(pairs)

    setProgressStep('grouping')
    drawStatus.textContent = 'Đang chia 4 bảng...'
    const shuffledPairs = shuffle(pairs)
    const groups = GROUP_LABELS.map((_, i) =>
      shuffledPairs.slice(i * 4, i * 4 + 4)
    )
    await revealGroups(groups)

    setProgressStep('scheduling')
    drawStatus.textContent = 'Đang xếp thứ tự thi đấu vòng bảng...'
    const groupSchedules = groups.map(teams => buildRoundRobin(teams))
    await revealSchedule(groupSchedules)

    setProgressStep('done')
    drawStatus.className = 'draw-status is-success'
    drawStatus.textContent =
      'Hoàn tất! Bấm nút bên dưới để bốc thăm lại từ đầu.'
    if (drawBtnLabel) drawBtnLabel.textContent = 'Bốc thăm lại'
  } catch (err) {
    console.error(err)
    drawStatus.className = 'draw-status is-error'
    drawStatus.textContent = 'Có lỗi khi bốc thăm. Vui lòng thử lại.'
    if (drawBtnLabel) drawBtnLabel.textContent = 'Bắt đầu bốc thăm'
  } finally {
    drawRunning = false
    drawBtn.disabled = false
    drawBtn.classList.remove('is-running')
  }
}

if (drawBtn) drawBtn.addEventListener('click', runDraw)

updateRosterUI()

// --- Registration form submit ---
const form = document.getElementById('regForm')
const msg = document.getElementById('regMsg')
const submitBtn = form.querySelector('button[type="submit"]')

form.addEventListener('submit', async e => {
  e.preventDefault()
  const data = new FormData(form)

  const name = String(data.get('name') || '').trim()
  const gender = String(data.get('gender') || '').trim()
  const phone = String(data.get('phone') || '').trim()
  const endpoint = (form.dataset.endpoint || '').trim()

  if (!name || !gender || !phone) {
    msg.style.color = 'var(--pink-soft)'
    msg.textContent = 'Vui lòng điền đầy đủ họ tên, giới tính và số điện thoại.'
    return
  }

  if (!endpoint) {
    msg.style.color = 'var(--pink-soft)'
    msg.textContent =
      'Chưa cấu hình nơi lưu đăng ký. BTC hãy dán URL Web App vào data-endpoint của form.'
    return
  }

  const genderLabel = gender === 'male' ? 'Nam' : 'Nữ'
  const payload = {
    player1: name,
    player2: genderLabel,
    team: '',
    phone,
    submittedAt: new Date().toISOString()
  }

  submitBtn.disabled = true
  msg.style.color = 'var(--text-soft)'
  msg.textContent = 'Đang gửi đăng ký...'

  try {
    const isGoogleScriptEndpoint =
      endpoint.includes('script.google.com') ||
      endpoint.includes('script.googleusercontent.com')

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      mode: isGoogleScriptEndpoint ? 'no-cors' : 'cors',
      body: JSON.stringify(payload)
    })

    if (!isGoogleScriptEndpoint && !res.ok) {
      throw new Error('submit_failed')
    }

    const added = addPlayer(gender, name)
    msg.style.color = 'var(--pink-bright)'
    msg.textContent = added
      ? '🎉 Ghi danh thành công! Tên của bạn đã được thêm vào danh sách.'
      : '🎉 Ghi danh thành công! (Tên đã có trong danh sách hoặc đã đủ suất.)'
    form.reset()
  } catch (_error) {
    msg.style.color = 'var(--pink-soft)'
    msg.textContent =
      'Gửi chưa thành công. Vui lòng thử lại hoặc liên hệ BTC để hỗ trợ.'
  } finally {
    submitBtn.disabled = false
  }
})
