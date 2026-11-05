# Laca Team & Laca Pickleball 3D

- `/`: website LACA TEAM CHAMPIONSHIP hiện có, giữ nguyên nội dung.
- `/pickleball/`: câu lạc bộ pickleball 3D, vào bằng trình duyệt và không có trang đăng nhập ChatGPT ở giao diện.

## Đưa lên Netlify

1. Trong Netlify chọn **Add new project → Import an existing project → GitHub**.
2. Chọn repository `duongdangthanh/laca`, branch `main`.
3. Để **Base directory** trống. `netlify.toml` đã khai báo:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
   - Node.js: `22`
4. Deploy. Website cũ nằm ở `https://TEN-SITE.netlify.app/`; sân 3D ở `https://TEN-SITE.netlify.app/pickleball/`.

Không cần API key hoặc biến môi trường để dùng backend hiện có. Nếu đã có Netlify site nối repo này thì push vào `main` sẽ dùng cấu hình trên trong lần deploy tiếp theo.

## Backend và dữ liệu

Giao diện game được host trên Netlify. Netlify Function `club.mjs` chuyển tiếp `/api/club/*` đến máy chủ sân hiện tại:

`https://pickle-yard-051126.duongdangthanh01.chatgpt.site`

**Đây chưa phải chuyển toàn bộ máy chủ/cơ sở dữ liệu sang Netlify.** Phòng đánh đôi, chat, trạng thái người chơi và đồ uống vẫn dùng API công khai và cơ sở dữ liệu D1 hiện có. Backend phải tiếp tục chạy và giữ quyền public. Function không gửi cookie ChatGPT và không chứa khóa bí mật; mỗi người chơi có một mã phiên riêng do API tạo.

Có thể đổi backend bằng biến môi trường **LACA_API_ORIGIN**, đặt thành HTTPS origin của máy chủ API tương thích, rồi deploy lại. Bản sao mã backend trong `backend/` cùng các SQL migration được giữ để có thể chuyển máy chủ sau này; các tệp đó không được publish trong thư mục `dist`.

## Chơi

- WASD / mũi tên hoặc chạm nền để di chuyển; kéo chuột để xoay góc nhìn.
- Đến quầy cà phê rồi bấm **E** để gọi và nhận đồ uống ảo.
- Đến gần ghế rồi bấm **E** để ngồi, chat hoặc uống đồ đã nhận.
- Vào sân rồi bấm **E** để tập với máy bắn bóng hoặc mở phòng đánh đôi.
- Phòng đôi cần đủ **4 người**. Link mời trỏ đúng `/pickleball/?room=...`.
- **SPACE** hoặc nút Đánh bóng để giao/đánh trả. Trận dùng luật arcade đơn giản, không phải mô phỏng đầy đủ luật thi đấu chính thức.

## Chạy và kiểm tra

Dùng Node.js >=22:

```sh
npm test
npm run build
npx netlify-cli dev
```

Netlify Dev cần mạng để các hoạt động trực tuyến kết nối backend; tập một mình chạy trong trình duyệt. Để test tích hợp backend mà không tạo dữ liệu production, dùng môi trường D1 local của mã nguồn Sites gốc.

Hình logo thỏ và màu nhận diện Laca lấy từ tài liệu thiết kế của nhóm. Three.js được lưu trong `pickleball/vendor/` để giao diện không phụ thuộc vào JavaScript CDN.
