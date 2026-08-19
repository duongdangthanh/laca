// ===== Lễ Bốc Thăm Chia Đội — trình chiếu (page con của LACA TEAM CHAMPIONSHIP) =====
// Dùng đúng dữ liệu + thuật toán bốc thăm thật ở seed-data.js (nạp trước file
// này) — không phải một bản demo random riêng, nên kết quả trình chiếu ở đây
// và công cụ bốc thăm ở trang chính luôn cùng một cơ chế công bằng.

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const GENDER_LABEL = { nam: 'NAM', nu: 'NỮ' }

const els = {
  introScreen: document.getElementById('introScreen'),
  drawScreen: document.getElementById('drawScreen'),
  doneBanner: document.getElementById('doneBanner'),
  startBtn: document.getElementById('startBtn'),
  restartBtn: document.getElementById('restartBtn'),
  closeDoneBtn: document.getElementById('closeDoneBtn'),
  basketRow: document.getElementById('basketRow'),
  teamBoards: document.getElementById('teamBoards'),
  phaseLabel: document.getElementById('phaseLabel'),
  stepLabel: document.getElementById('stepLabel'),
  confetti: document.getElementById('confetti')
}

// Đếm số ô đã điền theo từng đội/giới, để biết ô trống kế tiếp cần điền.
const filledCount = {}
function nextSlotEl(team, gender) {
  const key = team + gender
  const idx = filledCount[key] || 0
  filledCount[key] = idx + 1
  return document.querySelector(
    `.bt-team__slot[data-team="${team}"][data-gender="${gender}"][data-index="${idx}"]`
  )
}

function buildTeamBoardsHTML() {
  return BOARDS.map(board => {
    const teams = BOARD_TEAMS[board]
    const cards = teams
      .map(team => {
        const slots = gender =>
          [0, 1, 2]
            .map(
              i =>
                `<div class="bt-team__slot" data-team="${team}" data-gender="${gender}" data-index="${i}">···</div>`
            )
            .join('')
        return `<div class="bt-team">
            <div class="bt-team__head">
              <span class="bt-team__letter">${team}</span>
              <span class="bt-team__name">Đội ${team}</span>
            </div>
            <div class="bt-team__cols">
              <div>
                <div class="bt-team__col-label">Nam</div>
                ${slots('nam')}
              </div>
              <div>
                <div class="bt-team__col-label">Nữ</div>
                ${slots('nu')}
              </div>
            </div>
          </div>`
      })
      .join('')
    return `<div class="bt-board">
        <div class="bt-board__label">Bảng ${board} · Đội ${teams.join(' · ')}</div>
        <div class="bt-board__grid">${cards}</div>
      </div>`
  }).join('')
}

// 10 giỏ hạt giống tổng cộng — 5 giỏ Nam (HM-1 → HM-5) + 5 giỏ Nữ
// (HW-1 → HW-5), đúng tên gọi ở mục IV của trang chính. Dựng cả 10 giỏ ngay
// từ đầu (không xoá đi dựng lại khi đổi giới) để người xem thấy rõ có 10
// nhóm hạt giống, không phải 5.
const BASKET_PREFIX = { nam: 'HM', nu: 'HW' }

function buildBasketGroupHTML(genderKey, tiers) {
  const prefix = BASKET_PREFIX[genderKey]
  const baskets = TIER_ORDER.map(key => {
    const count = tiers[key].length
    return `<div class="bt-basket" data-gender="${genderKey}" data-tier="${key}" data-remaining="${count}">
        <span class="bt-basket__icon">🧺</span>
        <div class="bt-basket__tier">${prefix}-${key.slice(1)}</div>
        <div class="bt-basket__count" data-count-label>còn ${count}</div>
      </div>`
  }).join('')
  return `<div class="bt-basket-group" data-gender-group="${genderKey}">
      <div class="bt-basket-group__label">Giỏ hạt giống ${GENDER_LABEL[genderKey]} (${prefix}-1 → ${prefix}-5)</div>
      <div class="bt-basket-group__row">${baskets}</div>
    </div>`
}

function buildAllBasketsHTML() {
  return buildBasketGroupHTML('nam', SEED_TIERS.nam) + buildBasketGroupHTML('nu', SEED_TIERS.nu)
}

function setActiveGenderGroup(genderKey) {
  els.basketRow.querySelectorAll('.bt-basket-group').forEach(el => {
    el.classList.toggle('is-active', el.dataset.genderGroup === genderKey)
  })
}

function basketEl(gender, tierKey) {
  return els.basketRow.querySelector(
    `.bt-basket[data-gender="${gender}"][data-tier="${tierKey}"]`
  )
}

function setBasketActive(gender, tierKey, active) {
  const el = basketEl(gender, tierKey)
  if (el) el.classList.toggle('is-active', active)
}

function decrementBasket(gender, tierKey, by) {
  const el = basketEl(gender, tierKey)
  if (!el) return
  const remaining = Math.max(0, Number(el.dataset.remaining) - by)
  el.dataset.remaining = String(remaining)
  el.querySelector('[data-count-label]').textContent = `còn ${remaining}`
  el.classList.toggle('is-empty', remaining === 0)
}

// Hiệu ứng "thẻ bay" từ giỏ hạt giống tới ô đội — kỹ thuật FLIP (tính toạ độ
// đầu/cuối bằng getBoundingClientRect rồi transition transform). Có timeout
// dự phòng để không bao giờ bị treo nếu trình duyệt tắt animation
// (prefers-reduced-motion) hoặc transitionend không bắn ra.
function flyCard(name, fromEl, toEl) {
  return new Promise(resolve => {
    if (!fromEl || !toEl) {
      resolve()
      return
    }
    const fromRect = fromEl.getBoundingClientRect()
    const toRect = toEl.getBoundingClientRect()
    const card = document.createElement('div')
    card.className = 'bt-flying-card'
    card.textContent = name
    document.body.appendChild(card)

    const fx = fromRect.left + fromRect.width / 2
    const fy = fromRect.top + fromRect.height / 2
    const tx = toRect.left + toRect.width / 2
    const ty = toRect.top + toRect.height / 2
    card.style.left = fx + 'px'
    card.style.top = fy + 'px'

    let done = false
    const finish = () => {
      if (done) return
      done = true
      toEl.textContent = name
      toEl.title = name
      toEl.classList.add('is-filled', 'is-just-filled')
      setTimeout(() => toEl.classList.remove('is-just-filled'), 650)
      card.style.transition = 'opacity 0.15s ease'
      card.style.opacity = '0'
      setTimeout(() => card.remove(), 160)
      resolve()
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.style.opacity = '1'
        card.style.transform = `translate(-50%, -50%) translate(${tx - fx}px, ${ty - fy}px) scale(1)`
      })
    })
    card.addEventListener('transitionend', finish, { once: true })
    setTimeout(finish, 1400) // dự phòng
  })
}

async function runStep(step, gender) {
  const prefix = BASKET_PREFIX[gender]
  const tierNo = step.tierKey.slice(1)
  const teams = Object.keys(step.dealt)
  els.stepLabel.textContent = `${prefix}-${tierNo} → Nhóm đội ${step.groupNo} (${teams.join(' · ')})`
  setBasketActive(gender, step.tierKey, true)

  await Promise.all(
    teams.map((team, i) =>
      wait(i * 260).then(() => {
        const from = basketEl(gender, step.tierKey)
        const to = nextSlotEl(team, gender)
        return flyCard(step.dealt[team], from, to)
      })
    )
  )

  setBasketActive(gender, step.tierKey, false)
  decrementBasket(gender, step.tierKey, teams.length)
  await wait(650)
}

async function runGenderPhase(genderKey, steps) {
  els.phaseLabel.textContent = `Đang bốc thăm — Vận động viên ${GENDER_LABEL[genderKey]}`
  setActiveGenderGroup(genderKey)
  for (const step of steps) {
    await runStep(step, genderKey)
  }
}

function launchConfetti() {
  const colors = ['#ec1e79', '#ff2d95', '#ff6bb3', '#ffffff']
  const pieces = []
  for (let i = 0; i < 90; i++) {
    const span = document.createElement('span')
    span.style.left = Math.random() * 100 + 'vw'
    span.style.background = colors[i % colors.length]
    span.style.animationDuration = 2.4 + Math.random() * 1.8 + 's'
    span.style.animationDelay = Math.random() * 0.6 + 's'
    span.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
    pieces.push(span)
    els.confetti.appendChild(span)
  }
  setTimeout(() => pieces.forEach(p => p.remove()), 4600)
}

let running = false
async function startShow() {
  if (running) return
  running = true
  els.startBtn.disabled = true

  els.introScreen.hidden = true
  els.drawScreen.hidden = false
  els.basketRow.innerHTML = buildAllBasketsHTML()
  els.teamBoards.innerHTML = buildTeamBoardsHTML()

  const draw = drawTeamsDetailed() // MỘT kết quả bốc thăm duy nhất, dùng cho cả hiệu ứng lẫn kết quả cuối
  await runGenderPhase('nam', draw.namSteps)
  await runGenderPhase('nu', draw.nuSteps)

  els.phaseLabel.textContent = 'Hoàn tất'
  els.stepLabel.textContent = '✓ Đã chia xong 08 đội'
  await wait(900)

  els.doneBanner.hidden = false
  launchConfetti()
}

els.startBtn.addEventListener('click', startShow)
els.restartBtn.addEventListener('click', () => location.reload())
els.closeDoneBtn.addEventListener('click', () => {
  els.doneBanner.hidden = true
})
