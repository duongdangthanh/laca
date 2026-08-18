// ===== MOCK DATA — toàn bộ dữ liệu trong file này là giả lập cho prototype. =====
// Không có API/backend thật. Cấu trúc bám theo laca-team-webapp-spec.md để dễ
// đối chiếu khi chuyển sang dữ liệu thật sau này.

const CLUB = {
  name: 'Laca Team',
  founded: 2022,
  location: 'Đà Nẵng',
  address: 'KingKong Pickleball Court, 589 Hoàng Diệu, TP. Đà Nẵng',
  mission:
    'Xây dựng một cộng đồng Pickleball gắn kết, nơi mọi thành viên — từ người mới cầm vợt đến VĐV thi đấu — đều có sân chơi để rèn luyện sức khỏe, kết nối bạn bè và cùng nhau tiến bộ.',
  values: [
    { icon: '🤝', title: 'Gắn kết', desc: 'Một cộng đồng thân thiện, chào đón mọi trình độ.' },
    { icon: '📈', title: 'Tiến bộ', desc: 'Rating và xếp hạng minh bạch, tạo động lực luyện tập.' },
    { icon: '🏆', title: 'Tranh tài', desc: 'Giải đấu nội bộ định kỳ, đầy tính cạnh tranh lành mạnh.' },
    { icon: '📸', title: 'Lưu giữ', desc: 'Ghi lại từng khoảnh khắc, từng cột mốc của cả đội.' }
  ],
  organizers: [
    { name: 'Mr Quy', role: 'Chủ nhiệm CLB' },
    { name: 'Thảo Hiếu', role: 'Phụ trách sự kiện' },
    { name: 'Minh Dương', role: 'Phụ trách kỹ thuật & rating' }
  ],
  schedule: [
    { day: 'Thứ Ba / Thứ Năm', time: '18h30 – 20h30', note: 'Buổi tập thường kỳ' },
    { day: 'Chủ nhật', time: '08h00 – 11h00', note: 'Giao lưu cuối tuần / Mini Game' }
  ]
}

const LEVELS = ['Mới bắt đầu', 'Phong trào', 'Trung cấp', 'Nâng cao']
function levelFromRating(r) {
  if (r >= 2000) return 'Nâng cao'
  if (r >= 1600) return 'Trung cấp'
  if (r >= 1300) return 'Phong trào'
  return 'Mới bắt đầu'
}

const FORMAT_LABELS = {
  singles: 'Đánh đơn',
  mens_doubles: 'Đôi nam',
  womens_doubles: 'Đôi nữ',
  mixed_doubles: 'Đôi nam nữ',
  team_3v3: 'Đồng đội 3v3',
  team_4v4: 'Đồng đội 4v4',
  team_6v6: 'Đồng đội 6v6'
}

// ----- Members -----
const MEMBERS_RAW = [
  { id: 'm1', name: 'Minh Dương', full: 'Nguyễn Minh Dương', gender: 'male', hand: 'Thuận tay phải', rating: 2180, joined: '2022-03-01', region: 'Hải Châu, Đà Nẵng', bio: 'Phụ trách kỹ thuật CLB. Thích đôi nam tốc độ cao, chuyên trị lối đánh lên lưới.', formats: ['mens_doubles', 'mixed_doubles'], wins: 61, losses: 22 },
  { id: 'm2', name: 'Mr Quy', full: 'Trần Văn Quy', gender: 'male', hand: 'Thuận tay phải', rating: 2245, joined: '2022-01-15', region: 'Sơn Trà, Đà Nẵng', bio: 'Chủ nhiệm CLB Laca Team. "Ra sân là phải vui trước, thắng thua tính sau."', formats: ['mens_doubles', 'singles'], wins: 74, losses: 19 },
  { id: 'm3', name: 'Thảo Hiếu', full: 'Lê Thị Thảo Hiếu', gender: 'female', hand: 'Thuận tay phải', rating: 2050, joined: '2022-02-20', region: 'Hải Châu, Đà Nẵng', bio: 'Phụ trách sự kiện. Đam mê đôi nữ, đang tập thêm đôi nam nữ.', formats: ['womens_doubles', 'mixed_doubles'], wins: 55, losses: 24 },
  { id: 'm4', name: 'Phương Nam', full: 'Đặng Phương Nam', gender: 'male', hand: 'Thuận tay trái', rating: 1890, joined: '2023-05-10', region: 'Thanh Khê, Đà Nẵng', bio: 'Tay trái hiếm gặp trong CLB — đối thủ hay bối rối vì góc đánh.', formats: ['mens_doubles', 'mixed_doubles'], wins: 38, losses: 27 },
  { id: 'm5', name: 'Mai Nguyễn', full: 'Nguyễn Thị Mai', gender: 'female', hand: 'Thuận tay phải', rating: 1760, joined: '2023-06-18', region: 'Cẩm Lệ, Đà Nẵng', bio: 'Mới chuyển từ cầu lông sang, tiến bộ nhanh nhờ tập đều 3 buổi/tuần.', formats: ['womens_doubles', 'mixed_doubles'], wins: 29, losses: 25 },
  { id: 'm6', name: 'Tùng Nè', full: 'Phạm Anh Tùng', gender: 'male', hand: 'Thuận tay phải', rating: 1710, joined: '2023-07-02', region: 'Liên Chiểu, Đà Nẵng', bio: 'Vui vẻ, hay chọc cười cả sân — nhưng vào trận thì nghiêm túc bất ngờ.', formats: ['mens_doubles'], wins: 24, losses: 26 },
  { id: 'm7', name: 'Tiên', full: 'Võ Thị Tiên', gender: 'female', hand: 'Thuận tay phải', rating: 2010, joined: '2022-09-11', region: 'Hải Châu, Đà Nẵng', bio: 'Đôi nữ chủ lực, phòng thủ chắc, ít khi mắc lỗi tự đánh hỏng.', formats: ['womens_doubles', 'mixed_doubles'], wins: 47, losses: 20 },
  { id: 'm8', name: 'Quang Khánh', full: 'Bùi Quang Khánh', gender: 'male', hand: 'Thuận tay phải', rating: 1650, joined: '2023-11-05', region: 'Ngũ Hành Sơn, Đà Nẵng', bio: 'Mới gia nhập CLB được nửa năm, chăm chỉ luyện giao bóng mỗi buổi.', formats: ['mens_doubles', 'singles'], wins: 15, losses: 18 },
  { id: 'm9', name: 'Mai Trân', full: 'Hồ Mai Trân', gender: 'female', hand: 'Thuận tay phải', rating: 1580, joined: '2024-01-20', region: 'Hải Châu, Đà Nẵng', bio: 'Từng chơi tennis, đang chuyển hướng hẳn sang Pickleball.', formats: ['womens_doubles'], wins: 12, losses: 14 },
  { id: 'm10', name: 'Vạn Duyên', full: 'Trịnh Vạn Duyên', gender: 'female', hand: 'Thuận tay phải', rating: 1420, joined: '2024-03-08', region: 'Thanh Khê, Đà Nẵng', bio: 'Thành viên mới, đang làm quen luật double-bounce.', formats: ['womens_doubles', 'mixed_doubles'], wins: 8, losses: 13 },
  { id: 'm11', name: 'Chú Vương', full: 'Nguyễn Chí Vương', gender: 'male', hand: 'Thuận tay phải', rating: 1980, joined: '2022-05-30', region: 'Sơn Trà, Đà Nẵng', bio: 'Kinh nghiệm nhất nhì CLB, hay chia sẻ mẹo chiến thuật cho lứa sau.', formats: ['mens_doubles', 'mixed_doubles', 'team_4v4'], wins: 52, losses: 30 },
  { id: 'm12', name: 'Khánh Diệp', full: 'Lâm Khánh Diệp', gender: 'female', hand: 'Thuận tay trái', rating: 1340, joined: '2024-06-14', region: 'Cẩm Lệ, Đà Nẵng', bio: 'Tay trái, mới tập 3 tháng nhưng học chiến thuật rất nhanh.', formats: ['womens_doubles'], wins: 5, losses: 9 },
  { id: 'm13', name: 'Thuận Sovo', full: 'Đỗ Văn Thuận', gender: 'male', hand: 'Thuận tay phải', rating: 1560, joined: '2023-09-01', region: 'Liên Chiểu, Đà Nẵng', bio: 'Chơi đều đặn cuối tuần, mục tiêu năm nay lên hạng Trung cấp.', formats: ['mens_doubles'], wins: 17, losses: 21 },
  { id: 'm14', name: 'Diệu', full: 'Trần Thị Diệu', gender: 'female', hand: 'Thuận tay phải', rating: 1210, joined: '2024-07-22', region: 'Hải Châu, Đà Nẵng', bio: 'Thành viên mới nhất — buổi tập đầu tiên là hôm... hôm qua!', formats: ['womens_doubles'], wins: 1, losses: 3 },
  { id: 'm15', name: 'Hùng', full: 'Lê Quang Hùng', gender: 'male', hand: 'Thuận tay phải', rating: 1830, joined: '2023-04-19', region: 'Ngũ Hành Sơn, Đà Nẵng', bio: 'Đánh singles là chính, thích rally dài hơi.', formats: ['singles', 'mens_doubles'], wins: 33, losses: 28 },
  { id: 'm16', name: 'Khắc Trà', full: 'Nguyễn Khắc Trà', gender: 'male', hand: 'Thuận tay phải', rating: 1480, joined: '2024-02-02', region: 'Thanh Khê, Đà Nẵng', bio: 'Fan cứng của các buổi giao lưu cuối tuần, ít bỏ buổi nào.', formats: ['mens_doubles', 'team_4v4'], wins: 11, losses: 16 }
]

const MEMBERS = MEMBERS_RAW.map((m, i) => {
  const total = m.wins + m.losses
  return {
    ...m,
    displayName: m.name,
    level: levelFromRating(m.rating),
    status: 'active',
    avatarColor: null, // computed at render time
    privacy: {
      showAge: i % 3 !== 0,
      showPhone: false,
      showEmail: false,
      showRegion: true,
      showRatingChart: i % 4 !== 1,
      showMatchHistory: true,
      showEvents: true
    },
    ratingHistory: buildRatingHistory(m.rating),
    winRate: total ? Math.round((m.wins / total) * 100) : 0,
    achievements: []
  }
})

function buildRatingHistory(finalRating) {
  const points = []
  let r = finalRating - 120 - Math.round(Math.random() * 80)
  const months = 8
  for (let i = 0; i < months; i++) {
    r += Math.round((finalRating - r) / (months - i) + (Math.random() * 30 - 15))
    points.push(r)
  }
  points[points.length - 1] = finalRating
  return points
}

// Rank + rank change computed from rating (descending)
function computeRanks() {
  const sorted = [...MEMBERS].sort((a, b) => b.rating - a.rating)
  sorted.forEach((m, i) => {
    m.rank = i + 1
    m.rankChange = [1, -1, 0, 2, -2, 0, 1, 0][i % 8]
  })
}
computeRanks()

function memberById(id) {
  return MEMBERS.find(m => m.id === id) || null
}

// ----- Achievements catalog -----
const ACHIEVEMENTS_CATALOG = [
  { id: 'a1', icon: '🥇', name: 'Trận đấu đầu tiên', desc: 'Hoàn thành trận đấu đầu tiên tại CLB.' },
  { id: 'a2', icon: '🏅', name: 'Chiến thắng đầu tiên', desc: 'Giành chiến thắng đầu tiên.' },
  { id: 'a3', icon: '🔟', name: 'Cột mốc 10 trận', desc: 'Hoàn thành 10 trận đấu.' },
  { id: 'a4', icon: '5️⃣0️⃣', name: 'Cột mốc 50 trận', desc: 'Hoàn thành 50 trận đấu.' },
  { id: 'a5', icon: '🔥', name: 'Chuỗi thắng x5', desc: 'Thắng 5 trận liên tiếp.' },
  { id: 'a6', icon: '📅', name: 'Chiến binh sự kiện', desc: 'Tham gia 10 sự kiện của CLB.' },
  { id: 'a7', icon: '📈', name: 'Lọt Top 10', desc: 'Lần đầu tiên xuất hiện trong Top 10 bảng xếp hạng.' },
  { id: 'a8', icon: '👑', name: 'Nhà vô địch', desc: 'Vô địch một giải đấu chính thức của CLB.' }
]
// Gán thành tích demo cho một số thành viên
memberById('m1').achievements = ['a1', 'a2', 'a3', 'a4', 'a7']
memberById('m2').achievements = ['a1', 'a2', 'a3', 'a4', 'a5', 'a7', 'a8']
memberById('m3').achievements = ['a1', 'a2', 'a3', 'a6', 'a7']
memberById('m4').achievements = ['a1', 'a2', 'a3']
memberById('m7').achievements = ['a1', 'a2', 'a3', 'a4', 'a6']
memberById('m11').achievements = ['a1', 'a2', 'a3', 'a4', 'a8']

// ----- Events -----
const EVENTS = [
  {
    id: 'e1',
    slug: 'giao-luu-cuoi-tuan-t8',
    name: 'Giao lưu cuối tuần — Tuần 3 tháng 8',
    type: 'mini_game',
    status: 'registration_open',
    banner: '../assets/hero-bg.jpg',
    startAt: '2026-08-23T08:00:00',
    endAt: '2026-08-23T11:00:00',
    location: 'KingKong Pickleball Court, Đà Nẵng',
    organizer: 'Thảo Hiếu',
    registrationOpensAt: '2026-08-14T08:00:00',
    registrationClosesAt: '2026-08-22T20:00:00',
    capacity: 24,
    waitlistEnabled: true,
    fee: 'Miễn phí (thành viên CLB)',
    formats: ['mens_doubles', 'womens_doubles', 'mixed_doubles'],
    description: 'Buổi giao lưu cuối tuần thường kỳ — ghép cặp linh hoạt, không tính rating chính thức trừ khi có thông báo riêng.',
    schedule: [
      { time: '08:00 – 08:15', title: 'Điểm danh, khởi động' },
      { time: '08:15 – 10:30', title: 'Thi đấu vòng tròn các nội dung' },
      { time: '10:30 – 11:00', title: 'Giao lưu tự do, chụp hình cả team' }
    ],
    rules: ['Áp dụng luật Pickleball tiêu chuẩn.', 'Ghép cặp theo trình độ để cân bằng trận đấu.', 'Ưu tiên thành viên đăng ký trước nếu quá số chỗ.'],
    participants: ['m1', 'm3', 'm4', 'm5', 'm6', 'm7', 'm9', 'm10', 'm13'],
    resultIds: []
  },
  {
    id: 'e2',
    slug: 'mini-game-team-relay-season-2',
    name: 'Mini Game · Team Relay — Season 2',
    type: 'mini_game',
    status: 'registration_open',
    banner: '../assets/gallery-court.jpg',
    startAt: '2026-08-30T08:00:00',
    endAt: '2026-08-30T12:00:00',
    location: 'KingKong Pickleball Court, Đà Nẵng',
    organizer: 'Minh Dương',
    registrationOpensAt: '2026-08-10T08:00:00',
    registrationClosesAt: '2026-08-28T20:00:00',
    capacity: 30,
    waitlistEnabled: true,
    fee: 'Miễn phí',
    formats: ['team_3v3'],
    description: 'Thi đấu đồng đội tiếp sức 3v3, chia bảng theo trình độ, có bảng xếp hạng riêng cho Mini Game.',
    schedule: [
      { time: '08:00 – 08:30', title: 'Check-in, bốc thăm chia đội' },
      { time: '08:30 – 11:30', title: 'Vòng bảng + loại trực tiếp' },
      { time: '11:30 – 12:00', title: 'Trao giải' }
    ],
    rules: ['Mỗi đội 3 thành viên cố định.', 'Thi đấu tiếp sức theo cặp xoay vòng.', 'Đội thắng 2/3 trận con thắng chung cuộc.'],
    participants: ['m2', 'm3', 'm7', 'm8', 'm11', 'm12', 'm14', 'm15', 'm16'],
    resultIds: []
  },
  {
    id: 'e3',
    slug: 'buoi-tap-thuong-ky-t3-t5',
    name: 'Buổi tập thường kỳ — Thứ Ba/Thứ Năm',
    type: 'practice',
    status: 'registration_open',
    banner: '../assets/gallery-paddle.jpg',
    startAt: '2026-08-18T18:30:00',
    endAt: '2026-08-18T20:30:00',
    location: 'KingKong Pickleball Court, Đà Nẵng',
    organizer: 'Minh Dương',
    registrationOpensAt: '2026-08-11T08:00:00',
    registrationClosesAt: '2026-08-18T17:00:00',
    capacity: 16,
    waitlistEnabled: false,
    fee: 'Theo giờ sân (chia đều)',
    formats: ['singles', 'mens_doubles', 'womens_doubles', 'mixed_doubles'],
    description: 'Buổi tập tự do — tự ghép cặp, phù hợp cho thành viên muốn luyện kỹ thuật và thể lực.',
    schedule: [{ time: '18:30 – 20:30', title: 'Tập tự do, ghép cặp linh hoạt' }],
    rules: ['Không bắt buộc thi đấu tính điểm.', 'Ưu tiên nhường sân cho người đăng ký trước nếu đông.'],
    participants: ['m1', 'm6', 'm8', 'm10', 'm13', 'm16'],
    resultIds: []
  },
  {
    id: 'e4',
    slug: 'laca-championship-season-4',
    name: 'LACA TEAM CHAMPIONSHIP — Season 4',
    type: 'tournament',
    status: 'published',
    banner: '../assets/gallery-crowd.jpg',
    startAt: '2026-09-12T09:00:00',
    endAt: '2026-09-12T13:30:00',
    location: 'KingKong Pickleball Court, 589 Hoàng Diệu, Đà Nẵng',
    organizer: 'Ban tổ chức Laca Team',
    registrationOpensAt: '2026-08-20T08:00:00',
    registrationClosesAt: '2026-09-08T20:00:00',
    capacity: 48,
    waitlistEnabled: false,
    fee: 'Miễn phí (VĐV đã đăng ký đội hình)',
    formats: ['team_6v6'],
    description:
      'Giải đấu đồng đội lớn nhất năm của Laca Team — 08 đội, 48 vận động viên (24 nam · 24 nữ) thi đấu vòng bảng kết hợp vòng loại trực tiếp, toàn bộ diễn ra trong 01 ngày trên 08 sân tại KingKong Pickleball Court. Mỗi cuộc đối đầu giữa 2 đội là 1 "trận lớn" gồm 3 "trận con" theo thứ tự Đôi nam – Đôi nữ – Đôi nam nữ.',
    schedule: [
      { time: '08:15 – 09:00', title: 'Đón tiếp, khai mạc' },
      { time: '09:00 – 11:35', title: 'Vòng bảng (3 lượt)' },
      { time: '12:00 – 13:00', title: 'Bán kết & Chung kết' },
      { time: '13:00 – 13:30', title: 'Trao giải' }
    ],
    rules: [
      '08 đội, mỗi đội 06 người (03 nam + 03 nữ), mã hóa A–H; mỗi VĐV mang mã M1–M3 (nam) hoặc W1–W3 (nữ).',
      'Vòng bảng: 2 bảng × 4 đội, đấu vòng tròn 1 lượt — mỗi đội 3 trận lớn.',
      'Trận lớn gồm 3 trận con: Đôi nam – Đôi nữ – Đôi nam nữ; phải đấu đủ cả 3, kết quả chỉ có thể 3–0 hoặc 2–1.',
      'Mỗi trận con: 01 ván đến 11 điểm, cách biệt tối thiểu 2, tối đa chạm 15 điểm là kết thúc.',
      'Xoay cặp bắt buộc ở vòng bảng — mỗi cặp VĐV cùng đội chỉ ghép với nhau đúng 1 lần trong 3 trận.',
      'Xếp hạng bảng theo thứ tự ưu tiên: Hiệu số → Đối đầu trực tiếp → Tổng điểm trận.',
      'Nhất, Nhì mỗi bảng vào bán kết; ở vòng loại trực tiếp đội tự do sắp xếp đội hình (không theo xoay cặp).',
      'Đội không đủ người khi đến lượt thi đấu sẽ bị xử thua trận con/trận lớn tương ứng.'
    ],
    participants: [],
    resultIds: [],
    tournamentDetails: {
      teams: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      boards: { A: ['A', 'B', 'C', 'D'], B: ['E', 'F', 'G', 'H'] },
      courts: {
        A: [
          [1, 5],
          [2, 6]
        ],
        B: [
          [3, 7],
          [4, 8]
        ]
      },
      subMatchOrder: ['Đôi nam', 'Đôi nữ', 'Đôi nam nữ'],
      rotation: [
        { nam: 'M1+M2', nu: 'W1+W2', mix: 'M3+W3' },
        { nam: 'M1+M3', nu: 'W1+W3', mix: 'M2+W2' },
        { nam: 'M2+M3', nu: 'W2+W3', mix: 'M1+W1' }
      ],
      roundTimes: [
        { ab: '09:00 – 09:20', c: '09:25 – 09:45' },
        { ab: '09:55 – 10:15', c: '10:20 – 10:40' },
        { ab: '10:50 – 11:10', c: '11:15 – 11:35' }
      ],
      knockout: {
        BK1: { label: 'Bán kết 1', home: 'Nhất bảng A', away: 'Nhì bảng B', time: '12:00 – 12:20', courts: [1, 5, 6] },
        BK2: { label: 'Bán kết 2', home: 'Nhất bảng B', away: 'Nhì bảng A', time: '12:00 – 12:20', courts: [4, 7, 8] },
        CK: { label: 'Chung kết', home: 'Thắng Bán kết 1', away: 'Thắng Bán kết 2', time: '12:40 – 13:00', courts: [5, 6, 7] }
      },
      prizes: [
        { rank: 'Giải Nhất', count: 6, desc: 'Cúp vô địch + quà tặng từ nhà tài trợ (nếu có) — trao cho 06 thành viên đội vô địch.' },
        { rank: 'Giải Nhì', count: 6, desc: 'Cúp giải Nhì + quà tặng từ nhà tài trợ (nếu có) — trao cho 06 thành viên đội á quân.' }
      ],
      fullTimeline: [
        { time: '08:15 – 08:45', title: 'Đón tiếp, điểm danh vận động viên, xác nhận danh sách đội hình' },
        { time: '08:45 – 09:00', title: 'Lễ khai mạc, phổ biến điều lệ và thể thức' },
        { time: '09:00 – 09:45', title: 'Vòng bảng — Lượt 1 (04 trận lớn diễn ra song song)' },
        { time: '09:45 – 09:55', title: 'Nghỉ giữa lượt' },
        { time: '09:55 – 10:40', title: 'Vòng bảng — Lượt 2 (04 trận lớn diễn ra song song)' },
        { time: '10:40 – 10:50', title: 'Nghỉ giữa lượt' },
        { time: '10:50 – 11:35', title: 'Vòng bảng — Lượt 3 (04 trận lớn diễn ra song song)' },
        { time: '11:35 – 12:00', title: 'Nghỉ giải lao, tổng hợp kết quả, công bố 04 đội vào bán kết' },
        { time: '12:00 – 12:20', title: 'Bán kết 1 và Bán kết 2 (diễn ra song song)' },
        { time: '12:20 – 12:40', title: 'Nghỉ, chuẩn bị chung kết' },
        { time: '12:40 – 13:00', title: 'Chung kết' },
        { time: '13:00 – 13:30', title: 'Lễ trao giải và bế mạc' }
      ]
    }
  },
  {
    id: 'e5',
    slug: 'giao-luu-t7',
    name: 'Giao lưu cuối tuần — Tuần 2 tháng 8',
    type: 'mini_game',
    status: 'completed',
    banner: '../assets/gallery-smash.jpg',
    startAt: '2026-08-09T08:00:00',
    endAt: '2026-08-09T11:00:00',
    location: 'KingKong Pickleball Court, Đà Nẵng',
    organizer: 'Thảo Hiếu',
    registrationOpensAt: '2026-08-01T08:00:00',
    registrationClosesAt: '2026-08-08T20:00:00',
    capacity: 24,
    waitlistEnabled: true,
    fee: 'Miễn phí',
    formats: ['mens_doubles', 'womens_doubles', 'mixed_doubles'],
    description: 'Đã diễn ra thành công với 18 thành viên tham gia — cảm ơn cả nhà đã nhiệt tình!',
    schedule: [{ time: '08:00 – 11:00', title: 'Thi đấu vòng tròn các nội dung' }],
    rules: ['Áp dụng luật Pickleball tiêu chuẩn.'],
    participants: ['m1', 'm2', 'm3', 'm4', 'm7', 'm8', 'm9', 'm11'],
    resultIds: ['x1', 'x2', 'x3']
  },
  {
    id: 'e6',
    slug: 'buoi-tap-t3-t5-tuan-truoc',
    name: 'Buổi tập thường kỳ — Thứ Ba/Thứ Năm (tuần trước)',
    type: 'practice',
    status: 'completed',
    banner: '../assets/gallery-paddle.jpg',
    startAt: '2026-08-06T18:30:00',
    endAt: '2026-08-06T20:30:00',
    location: 'KingKong Pickleball Court, Đà Nẵng',
    organizer: 'Minh Dương',
    registrationOpensAt: '2026-07-30T08:00:00',
    registrationClosesAt: '2026-08-06T17:00:00',
    capacity: 16,
    waitlistEnabled: false,
    fee: 'Theo giờ sân (chia đều)',
    formats: ['singles', 'mens_doubles'],
    description: 'Buổi tập tự do đã diễn ra bình thường.',
    schedule: [{ time: '18:30 – 20:30', title: 'Tập tự do' }],
    rules: ['Không bắt buộc thi đấu tính điểm.'],
    participants: ['m6', 'm15', 'm16'],
    resultIds: ['x4']
  },
  {
    id: 'e7',
    slug: 'laca-championship-season-3',
    name: 'LACA TEAM CHAMPIONSHIP — Season 3',
    type: 'tournament',
    status: 'completed',
    banner: '../assets/about-season1.jpg',
    startAt: '2026-05-10T09:00:00',
    endAt: '2026-05-10T13:00:00',
    location: 'KingKong Pickleball Court, Đà Nẵng',
    organizer: 'Ban tổ chức Laca Team',
    registrationOpensAt: '2026-04-20T08:00:00',
    registrationClosesAt: '2026-05-05T20:00:00',
    capacity: 32,
    waitlistEnabled: false,
    fee: 'Miễn phí',
    formats: ['mixed_doubles'],
    description: 'Giải đôi nam-nữ Season 3 — đội của Mr Quy & Thảo Hiếu vô địch thuyết phục.',
    schedule: [{ time: '09:00 – 13:00', title: 'Vòng bảng + loại trực tiếp' }],
    rules: ['16 cặp đôi nam-nữ, chia 4 bảng.'],
    participants: ['m1', 'm2', 'm3', 'm4', 'm7', 'm11'],
    resultIds: ['x5']
  },
  {
    id: 'e8',
    slug: 'giao-luu-thang-9-sap-mo',
    name: 'Giao lưu cuối tuần — Tuần 1 tháng 9',
    type: 'mini_game',
    status: 'draft',
    banner: '../assets/hero-bg.jpg',
    startAt: '2026-09-06T08:00:00',
    endAt: '2026-09-06T11:00:00',
    location: 'KingKong Pickleball Court, Đà Nẵng',
    organizer: 'Thảo Hiếu',
    registrationOpensAt: '2026-08-25T08:00:00',
    registrationClosesAt: '2026-09-05T20:00:00',
    capacity: 24,
    waitlistEnabled: true,
    fee: 'Miễn phí',
    formats: ['mens_doubles', 'womens_doubles', 'mixed_doubles'],
    description: 'Đang chuẩn bị nội dung, sẽ mở đăng ký sau khi công bố chính thức.',
    schedule: [],
    rules: [],
    participants: [],
    resultIds: []
  }
]

function eventById(id) {
  return EVENTS.find(e => e.id === id) || null
}
function eventBySlug(slug) {
  return EVENTS.find(e => e.slug === slug) || null
}

const EVENT_STATUS_LABELS = {
  draft: 'Bản nháp',
  published: 'Đã công bố',
  registration_open: 'Đang mở đăng ký',
  registration_closed: 'Đã đóng đăng ký',
  in_progress: 'Đang diễn ra',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy'
}
const EVENT_TYPE_LABELS = { practice: 'Buổi tập', mini_game: 'Mini Game', tournament: 'Giải đấu' }

// ----- Matches -----
const MATCHES = [
  {
    id: 'x1',
    eventId: 'e5',
    format: 'mens_doubles',
    sideA: ['m1', 'm4'],
    sideB: ['m2', 'm11'],
    games: [
      { a: 11, b: 8 },
      { a: 9, b: 11 },
      { a: 11, b: 7 }
    ],
    status: 'rated',
    submittedBy: 'm1',
    confirmedBy: ['m2'],
    date: '2026-08-09T09:10:00',
    notes: ''
  },
  {
    id: 'x2',
    eventId: 'e5',
    format: 'womens_doubles',
    sideA: ['m3', 'm7'],
    sideB: ['m9', 'm10'],
    games: [
      { a: 11, b: 4 },
      { a: 11, b: 6 }
    ],
    status: 'rated',
    submittedBy: 'm3',
    confirmedBy: ['m9'],
    date: '2026-08-09T09:40:00',
    notes: ''
  },
  {
    id: 'x3',
    eventId: 'e5',
    format: 'mixed_doubles',
    sideA: ['m4', 'm7'],
    sideB: ['m8', 'm9'],
    games: [
      { a: 9, b: 11 },
      { a: 11, b: 9 },
      { a: 8, b: 11 }
    ],
    status: 'rated',
    submittedBy: 'm8',
    confirmedBy: ['m4'],
    date: '2026-08-09T10:20:00',
    notes: ''
  },
  {
    id: 'x4',
    eventId: 'e6',
    format: 'mens_doubles',
    sideA: ['m6', 'm16'],
    sideB: ['m15', 'm13'],
    games: [
      { a: 11, b: 9 },
      { a: 11, b: 6 }
    ],
    status: 'rated',
    submittedBy: 'm15',
    confirmedBy: ['m6'],
    date: '2026-08-06T19:00:00',
    notes: ''
  },
  {
    id: 'x5',
    eventId: 'e7',
    format: 'mixed_doubles',
    sideA: ['m2', 'm3'],
    sideB: ['m1', 'm7'],
    games: [
      { a: 11, b: 7 },
      { a: 11, b: 9 }
    ],
    status: 'rated',
    submittedBy: 'm2',
    confirmedBy: ['m1'],
    date: '2026-05-10T12:10:00',
    notes: 'Chung kết Season 3'
  },
  // Trận độc lập (không thuộc sự kiện) — trạng thái đa dạng để demo dashboard.
  {
    id: 'x6',
    eventId: null,
    format: 'mens_doubles',
    sideA: ['m1', 'm6'],
    sideB: ['m11', 'm4'],
    games: [
      { a: 11, b: 9 },
      { a: 11, b: 8 }
    ],
    status: 'submitted',
    submittedBy: 'm1',
    confirmedBy: [],
    date: '2026-08-11T19:00:00',
    notes: 'Đánh giao lưu ngoài buổi tập chính thức.'
  },
  {
    id: 'x7',
    eventId: null,
    format: 'mixed_doubles',
    sideA: ['m1', 'm7'],
    sideB: ['m4', 'm3'],
    games: [
      { a: 11, b: 6 },
      { a: 9, b: 11 },
      { a: 11, b: 9 }
    ],
    status: 'submitted',
    submittedBy: 'm4',
    confirmedBy: [],
    date: '2026-08-12T18:00:00',
    notes: ''
  },
  {
    id: 'x8',
    eventId: null,
    format: 'mens_doubles',
    sideA: ['m1', 'm2'],
    sideB: ['m11', 'm6'],
    games: [
      { a: 11, b: 5 },
      { a: 11, b: 7 }
    ],
    status: 'disputed',
    submittedBy: 'm11',
    confirmedBy: [],
    disputeReason: 'wrong_score',
    disputeNote: 'Ván 2 mình nhớ là 11-9 chứ không phải 11-7, nhờ BTC kiểm tra lại.',
    date: '2026-08-10T20:00:00',
    notes: ''
  }
]

function matchById(id) {
  return MATCHES.find(x => x.id === id) || null
}

function matchWinnerSide(match) {
  let aWins = 0
  let bWins = 0
  match.games.forEach(g => {
    if (g.a > g.b) aWins++
    else if (g.b > g.a) bWins++
  })
  if (aWins === bWins) return null
  return aWins > bWins ? 'A' : 'B'
}

const MATCH_STATUS_LABELS = {
  draft: 'Nháp',
  submitted: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  disputed: 'Tranh chấp',
  rated: 'Đã tính rating',
  cancelled: 'Đã hủy'
}

const DISPUTE_REASONS = [
  { id: 'wrong_score', label: 'Sai tỷ số' },
  { id: 'wrong_players', label: 'Sai người chơi' },
  { id: 'not_played', label: 'Trận này chưa diễn ra' },
  { id: 'other', label: 'Lý do khác' }
]

// ----- Articles / News -----
const ARTICLES = [
  {
    id: 'n1',
    title: 'Tổng kết Giao lưu cuối tuần — Tuần 2 tháng 8',
    cover: '../assets/gallery-smash.jpg',
    author: 'Thảo Hiếu',
    publishedAt: '2026-08-10T09:00:00',
    excerpt: '18 thành viên góp mặt trong buổi giao lưu đầy tiếng cười và những pha bóng đẹp mắt.',
    content:
      'Buổi giao lưu cuối tuần Tuần 2 tháng 8 đã khép lại thành công với sự tham gia của 18 thành viên. Nhiều trận đấu căng thẳng đã diễn ra ở cả 3 nội dung đôi nam, đôi nữ và đôi nam nữ. Cảm ơn tất cả anh chị em đã dành thời gian tham gia — hẹn gặp lại vào cuối tuần tới!'
  },
  {
    id: 'n2',
    title: 'Mở đăng ký LACA TEAM CHAMPIONSHIP — Season 4',
    cover: '../assets/gallery-crowd.jpg',
    author: 'Ban tổ chức',
    publishedAt: '2026-08-05T10:00:00',
    excerpt: 'Giải đấu đồng đội lớn nhất năm chính thức mở đăng ký — 8 đội, 48 VĐV tranh tài trong 1 ngày.',
    content:
      'LACA TEAM CHAMPIONSHIP Season 4 sẽ diễn ra vào Thứ Bảy 12/09/2026 tại KingKong Pickleball Court. Giải năm nay quy tụ 8 đội với tổng cộng 48 vận động viên (24 nam, 24 nữ), thi đấu vòng bảng kết hợp vòng loại trực tiếp. Đăng ký ngay tại trang sự kiện!'
  },
  {
    id: 'n3',
    title: 'Chúc mừng đội vô địch LACA TEAM CHAMPIONSHIP — Season 3',
    cover: '../assets/about-season1.jpg',
    author: 'Ban tổ chức',
    publishedAt: '2026-05-11T09:00:00',
    excerpt: 'Sau một ngày tranh tài kịch tính, đội của Mr Quy và Thảo Hiếu đã lên ngôi vô địch.',
    content:
      'Chung kết Season 3 đã diễn ra hết sức kịch tính khi đội của Mr Quy & Thảo Hiếu vượt qua đội của Minh Dương & Tiên với tỷ số 2-0. Xin chúc mừng nhà vô địch mới của Laca Team!'
  },
  {
    id: 'n4',
    title: 'Góc kỹ thuật: 3 lỗi thường gặp khi mới chơi Pickleball',
    cover: '../assets/gallery-paddle.jpg',
    author: 'Minh Dương',
    publishedAt: '2026-07-28T14:00:00',
    excerpt: 'Đứng sai vị trí, giao bóng sai luật và... quên mất double-bounce rule — cùng điểm qua 3 lỗi phổ biến.',
    content:
      '1. Đứng quá sát kitchen khi đối thủ chuẩn bị giao bóng. 2. Giao bóng không dưới hông hoặc sai chân trụ. 3. Quên luật double-bounce (mỗi bên phải để bóng nảy 1 lần trước khi volley). Cùng luyện tập để tránh những lỗi này nhé!'
  }
]

function articleById(id) {
  return ARTICLES.find(a => a.id === id) || null
}

// ----- Albums / Gallery -----
const ALBUMS = [
  {
    id: 'al1',
    title: 'Giao lưu cuối tuần — Tuần 2 tháng 8',
    eventId: 'e5',
    cover: '../assets/gallery-smash.jpg',
    photos: [
      { src: '../assets/gallery-smash.jpg', caption: 'Cú smash dứt điểm' },
      { src: '../assets/gallery-court.jpg', caption: 'Không khí trên sân' },
      { src: '../assets/gallery-paddle.jpg', caption: 'Sẵn sàng vào trận' },
      { src: '../assets/gallery-crowd.jpg', caption: 'Cả team cổ vũ' }
    ]
  },
  {
    id: 'al2',
    title: 'LACA TEAM CHAMPIONSHIP — Season 3',
    eventId: 'e7',
    cover: '../assets/about-season1.jpg',
    photos: [
      { src: '../assets/about-season1.jpg', caption: 'Cháy hết mình trên từng đường bóng' },
      { src: '../assets/hero-bg.jpg', caption: 'Toàn cảnh giải đấu' },
      { src: '../assets/gallery-crowd.jpg', caption: 'Khán đài cổ vũ' }
    ]
  },
  {
    id: 'al3',
    title: 'Sân đấu KingKong Pickleball Court',
    eventId: null,
    cover: '../assets/venue.jpg',
    photos: [
      { src: '../assets/venue.jpg', caption: 'Hệ thống sân tiêu chuẩn' },
      { src: '../assets/gallery-court.jpg', caption: 'Góc nhìn từ khán đài' }
    ]
  },
  {
    id: 'al4',
    title: 'Buổi tập thường kỳ',
    eventId: 'e6',
    cover: '../assets/gallery-paddle.jpg',
    photos: [
      { src: '../assets/gallery-paddle.jpg', caption: 'Khởi động trước buổi tập' },
      { src: '../assets/gallery-smash.jpg', caption: 'Luyện smash' }
    ]
  }
]

function albumById(id) {
  return ALBUMS.find(a => a.id === id) || null
}

// ----- Notifications (demo, gắn theo currentUser khi đăng nhập) -----
function buildNotificationsFor(memberId) {
  return [
    { id: 'no1', type: 'match_pending', read: false, date: '2026-08-12T18:05:00', text: 'Có kết quả trận đấu cần bạn xác nhận.', link: '#/pending' },
    { id: 'no2', type: 'event_reminder', read: false, date: '2026-08-11T09:00:00', text: 'Giao lưu cuối tuần — Tuần 3 tháng 8 sắp mở đăng ký.', link: '#/events/e1' },
    { id: 'no3', type: 'rating_change', read: true, date: '2026-08-09T11:00:00', text: 'Rating của bạn vừa được cập nhật sau trận đấu ngày 09/08.', link: '#/rating' },
    { id: 'no4', type: 'achievement', read: true, date: '2026-08-01T08:00:00', text: 'Bạn vừa mở khóa thành tích "Lọt Top 10"!', link: '#/achievements' },
    { id: 'no5', type: 'registration_confirmed', read: true, date: '2026-07-30T10:00:00', text: 'Đăng ký tham gia Buổi tập thường kỳ đã được xác nhận.', link: '#/my-events' }
  ]
}

// ----- Demo accounts để "đăng nhập thử" -----
const DEMO_ACCOUNTS = [
  { memberId: 'm1', tagline: 'Có kết quả chờ xác nhận + đang tranh chấp 1 trận' },
  { memberId: 'm3', tagline: 'Vừa đăng ký sự kiện, ít thông báo hơn' },
  { memberId: 'm5', tagline: 'Thành viên mới, chưa có nhiều dữ liệu' }
]
