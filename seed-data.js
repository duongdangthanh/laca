// ===== LACA TEAM CHAMPIONSHIP — SEASON 4 — dữ liệu & thuật toán bốc thăm =====
// File dùng chung giữa trang chính (index.html/script.js) và trang "Lễ bốc
// thăm" (boc-tham.html/boc-tham.js) — CHỈ một nguồn dữ liệu duy nhất để hai
// trang không bao giờ cho ra kết quả lệch nhau. Không có DOM ở đây, chỉ dữ
// liệu thuần + hàm thuần (pure), có thể tái sử dụng ở bất kỳ trang nào.

// ===== Đội & bảng đấu (Điều lệ mục V.1) =====
// Bảng A: Đội A·B·C·D — Bảng B: Đội E·F·G·H
const BOARD_TEAMS = {
  A: ['A', 'B', 'C', 'D'],
  B: ['E', 'F', 'G', 'H']
}
const BOARDS = ['A', 'B']
const TEAMS = [...BOARD_TEAMS.A, ...BOARD_TEAMS.B]

// ===== Nhóm hạt giống (mục IV) =====
// Mỗi giới 5 tier; tier có 08 người là tier dùng chung, được chia đều 4–4 cho
// 2 nhóm đội khi bốc thăm. Cập nhật trực tiếp các mảng này khi danh sách hạt
// giống thay đổi — chỉ cần sửa ở đây, cả 2 trang tự động đồng bộ theo.
const SEED_TIERS = {
  nu: {
    T1: ['Diệp Ann', 'Mai Trân', 'Toại Thuỷ', 'Diệu'],
    T2: ['Tyna Trương', 'Mai Nguyễn', 'Vạn Duyên', 'Ánh Lê'],
    T3: [
      'Hoàng Phúc',
      'Utky Hiền',
      'Minh Anh',
      'Phạm Thoa',
      'Mai Thu',
      'Thảo Hiếu',
      'Trang Lê',
      'Minh Thảo'
    ],
    T4: ['Ngọc', 'Thanh Tâm', 'Thảo', 'Khanh'],
    T5: ['Ly Xynk', 'Thiên Hà', 'Hoa Vũ', 'Trúc Quyên']
  },
  nam: {
    T1: ['Minh Pandora', 'Khoa', 'Hùng', 'Đình Tiến'],
    T2: ['Tùng Nè', 'Quang Khánh', 'Huy Lưu', 'Quốc Ân'],
    T3: [
      'Tiến Hoàng',
      'Thanh Mập',
      'Lukita',
      'Thuận Sovo',
      'Thuy Dang',
      'Châu Đỗ',
      'Quân Trần'
    ],
    T4: ['Mạnh Ngô', 'Khầy Trường', 'Chen', 'Khắc Trà'],
    T5: ['Phương Nam', 'Quang V', 'Xuân Trường', 'Mr Mountain']
  }
}
const TIER_ORDER = ['T1', 'T2', 'T3', 'T4', 'T5']

function flattenTiers(tiers) {
  return TIER_ORDER.flatMap(t => tiers[t])
}

// ===== Danh sách đã đăng ký (hiển thị công khai — không lộ tier/hạt giống) =====
const REGISTERED = {
  nu: flattenTiers(SEED_TIERS.nu),
  nam: flattenTiers(SEED_TIERS.nam)
}
const REGISTERED_LIMIT = 24

// Nhóm đội theo mục IV.2 — khác với Bảng A/B (mục V.1) ở trên. Đây là 2 "nhóm
// hạt giống" để cân bằng trình độ khi bốc thăm (không phải 2 bảng đấu).
const NHOM_TEAMS = { 1: ['A', 'C', 'E', 'G'], 2: ['B', 'D', 'F', 'H'] }

// Phân nhóm tier theo mục IV.2. Nữ dùng sơ đồ đảo với nam để HM-2 và HW-2
// không bao giờ được xếp vào cùng một đội.
const TIER_GROUPS = {
  nam: { 1: ['T1', 'T5'], 2: ['T2', 'T4'] },
  nu: { 1: ['T2', 'T4'], 2: ['T1', 'T5'] }
}

function shuffle(list) {
  const a = list.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Chia đều 1 tier cho các đội của 1 nhóm đội — mỗi đội bốc đúng 01 người.
function dealTier(people, teams) {
  const shuffled = shuffle(people)
  const map = {}
  teams.forEach((team, i) => {
    map[team] = shuffled[i]
  })
  return map
}

// Bốc thăm 1 giới theo cơ chế mục IV, đồng thời TRẢ VỀ từng bước bốc theo tier
// (dùng để trình chiếu hiệu ứng "bốc thẻ từ giỏ" theo đúng thứ tự thật —
// không phải một random riêng cho hiệu ứng, mà chính là kết quả cuối cùng).
function drawGenderDetailed(tiers, tierGroups) {
  const sharedKey = TIER_ORDER.find(t => tiers[t].length === 8)
  const sharedShuffled = shuffle(tiers[sharedKey])
  const sharedByGroup = {
    1: sharedShuffled.slice(0, 4),
    2: sharedShuffled.slice(4, 8)
  }

  const steps = [] // [{ groupNo, tierKey, dealt: {team: name} }, ...] theo đúng thứ tự bốc
  const perTeamRaw = {}
  ;[1, 2].forEach(groupNo => {
    const teams = NHOM_TEAMS[groupNo]
    const dealtList = []
    tierGroups[groupNo].forEach(key => {
      const dealt = dealTier(tiers[key], teams)
      steps.push({ groupNo, tierKey: key, dealt })
      dealtList.push(dealt)
    })
    const sharedDealt = dealTier(sharedByGroup[groupNo], teams)
    steps.push({ groupNo, tierKey: sharedKey, dealt: sharedDealt })
    dealtList.push(sharedDealt)
    teams.forEach(team => {
      perTeamRaw[team] = dealtList.map(d => d[team])
    })
  })

  // Xáo lại thứ tự 3 người/đội trước khi gán M1-M3/W1-W3 — vị trí không còn
  // phản ánh tier nữa, đúng yêu cầu giữ bí mật hạt giống.
  const perTeam = {}
  Object.keys(perTeamRaw).forEach(team => {
    perTeam[team] = shuffle(perTeamRaw[team])
  })
  return { steps, perTeam }
}

function drawTeamsDetailed() {
  const nam = drawGenderDetailed(SEED_TIERS.nam, TIER_GROUPS.nam)
  const nu = drawGenderDetailed(SEED_TIERS.nu, TIER_GROUPS.nu)
  const result = {}
  TEAMS.forEach(team => {
    result[team] = {
      M1: nam.perTeam[team][0],
      M2: nam.perTeam[team][1],
      M3: nam.perTeam[team][2],
      W1: nu.perTeam[team][0],
      W2: nu.perTeam[team][1],
      W3: nu.perTeam[team][2]
    }
  })
  return { result, namSteps: nam.steps, nuSteps: nu.steps }
}

// Giữ nguyên chữ ký cũ (result 8 đội × 6 người) cho code đang dùng ở script.js.
function drawTeams() {
  return drawTeamsDetailed().result
}
