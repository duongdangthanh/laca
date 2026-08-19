// ===== LACA TEAM CHAMPIONSHIP — SEASON 4 — dữ liệu đội & danh sách đăng ký =====
// BOARD_TEAMS/BOARDS/TEAMS dùng cho lịch thi đấu ở script.js. Đội hình chính
// thức từng đội (A–H) nằm ở ROSTER trong script.js.

// ===== Đội & bảng đấu (Điều lệ mục V.1) =====
// Bảng A: Đội A·B·C·D — Bảng B: Đội E·F·G·H
const BOARD_TEAMS = {
  A: ['A', 'B', 'C', 'D'],
  B: ['E', 'F', 'G', 'H']
}
const BOARDS = ['A', 'B']
const TEAMS = [...BOARD_TEAMS.A, ...BOARD_TEAMS.B]

// ===== Danh sách VĐV đăng ký (bản nháp trước khi có danh sách chính thức) =====
// Mục III trên trang hiện hiển thị danh sách ĐỘI (ROSTER ở script.js), không
// còn dùng dữ liệu này nữa — giữ lại làm tham khảo/đối chiếu, chưa xoá vì đây
// là danh sách gốc trước khi Ban tổ chức chốt danh sách đăng ký chính thức.
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
      'Quân Trần',
      'Hiếu Trương'
    ],
    T4: ['Mạnh Ngô', 'Khầy Trường', 'Chen', 'Khắc Trà'],
    T5: ['Phương Nam', 'Quang V', 'Xuân Trường', 'Mr Mountain']
  }
}
const TIER_ORDER = ['T1', 'T2', 'T3', 'T4', 'T5']

function flattenTiers(tiers) {
  return TIER_ORDER.flatMap(t => tiers[t])
}

const REGISTERED = {
  nu: flattenTiers(SEED_TIERS.nu),
  nam: flattenTiers(SEED_TIERS.nam)
}
const REGISTERED_LIMIT = 24
