// ===== LACA ZOMBIE Championship — landing interactions =====

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

// --- Countdown to match day: Sat 18 Jul 2026, 07:00 (local) ---
const target = new Date('2026-07-18T07:00:00').getTime()
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
  '.sec-head, .about__media, .pillar, .fcard, .bracket, .rules-note, .group, .gallery__item, .timeline li, .prize, .prizes--mini, .venue__info, .venue__map, .stat'
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
const counters = document.querySelectorAll('.stat__num')
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

// --- Registration form submit ---
const form = document.getElementById('regForm')
const msg = document.getElementById('regMsg')
const submitBtn = form.querySelector('button[type="submit"]')

form.addEventListener('submit', async e => {
  e.preventDefault()
  const data = new FormData(form)

  const player1 = String(data.get('player1') || '').trim()
  const player2 = String(data.get('player2') || '').trim()
  const team = String(data.get('team') || '').trim()
  const phone = String(data.get('phone') || '').trim()
  const endpoint = (form.dataset.endpoint || '').trim()

  if (!player1 || !player2 || !phone) {
    msg.style.color = 'var(--pink-soft)'
    msg.textContent = 'Vui lòng điền tên cả 2 VĐV và số điện thoại liên hệ.'
    return
  }

  if (!endpoint) {
    msg.style.color = 'var(--pink-soft)'
    msg.textContent =
      'Chưa cấu hình nơi lưu đăng ký. BTC hãy dán URL Web App vào data-endpoint của form.'
    return
  }

  const payload = {
    player1,
    player2,
    team,
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

    msg.style.color = 'var(--pink-bright)'
    msg.textContent =
      '🎉 Ghi danh thành công! Dữ liệu đã được lưu, BTC sẽ liên hệ xác nhận.'
    form.reset()
  } catch (_error) {
    msg.style.color = 'var(--pink-soft)'
    msg.textContent =
      'Gửi chưa thành công. Vui lòng thử lại hoặc liên hệ BTC để hỗ trợ.'
  } finally {
    submitBtn.disabled = false
  }
})
