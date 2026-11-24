# Thiệp mời Kỉ yếu · Minecraft Edition

Thiệp mời online một trang, chủ đề Minecraft: bầu trời hoàng hôn dạng khối, mây trôi, đom đóm,
khối cỏ 3D xoay nhẹ, texture pixel sinh tự động, nhạc nền phát lặp lại và đồng hồ đếm ngược.

Không cần cài đặt, không cần build. Chỉ là HTML + CSS + JS thuần.

---

## 1. Trong thư mục có gì

| File | Vai trò |
|------|---------|
| `index.html` | Toàn bộ nội dung chữ (tên lớp, tiêu đề, địa điểm, lời ngỏ, footer) |
| `style.css` | Giao diện, màu sắc, hiệu ứng |
| `app.js` | Thời gian, link xác nhận, nhạc, đếm ngược |
| `assets/otherside-kuraine.mp3` | Nhạc nền (7,8 MB) |
| `xem-truoc/` | Ảnh chụp giao diện để xem nhanh (xoá cũng được, không ảnh hưởng) |
| `README.md` | File này |

---

## 2. Bản đồ chỉnh sửa — sửa ở đâu?

Mỗi chỗ cần sửa đều có đánh số **✏️ [n]** trong file. Mở file bằng Notepad / VS Code rồi tìm `✏️`.

| ✏️ | Muốn sửa gì | Mở file | Tìm / sửa |
|----|-------------|---------|-----------|
| **[1]** | Tên lớp, niên khoá ở màn hình mở đầu | `index.html` | `splash__year` và `splash__title` |
| **[2]** | Dòng nhỏ, tiêu đề lớn, câu giới thiệu | `index.html` | `hero__eyebrow` → `hero__lede` |
| **[3]** | **Thời gian sự kiện** | `app.js` | `eventStart`, `eventEnd` |
| **[3b]** | **Mốc đồng hồ đếm ngược** | `app.js` | `countdownTo` |
| **[4]** | **Địa điểm** (2 dòng) | `index.html` | hai thẻ có `data-address` |
| **[5]** | Trang phục | `index.html` | trong khối `[5]` |
| **[6]** | Hạn xác nhận | `index.html` | `Xác nhận trước 10.06.2027` |
| **[7]** | Lời ngỏ + chữ ký | `index.html` | `letter__text` và `letter__sign` |
| **[8]** | Dòng cuối trang | `index.html` | `footer__title`, `footer__meta` |
| **[9]** | Dòng toạ độ trang trí | `index.html` | `coords` (xoá cả dòng cũng được) |
| **[10]** | Nút **Xác nhận tham dự** (chỉ đổi màu vàng, không mở link) | `index.html` | `data-rsvp` |
| **[11]** | **Nhạc nền** | `app.js` | `musicFile`, `musicVolume` |

### 2.1. Thời gian (✏️ [3]) — quan trọng nhất

Mở `app.js`, sửa 2 dòng đầu của `CONFIG`:

```js
eventStart: '2027-06-20T17:00:00+07:00',   // ngày + giờ bắt đầu
eventEnd:   '2027-06-20T21:00:00+07:00',   // giờ kết thúc
```

Đổi ở đây là **tự động** đổi luôn:
- thẻ ngày dưới tiêu đề,
- dòng "Thời gian" trong bảng thông tin,
- đồng hồ đếm ngược.

Giữ nguyên phần `+07:00` (giờ Việt Nam) để người xem ở nước ngoài vẫn thấy đúng giờ.

### 2.2. Địa điểm (✏️ [4])

```html
<p class="fact__value" data-address>Hội trường A · Trường THPT ...</p>
<p class="fact__value fact__value--muted" data-address>123 Đường ..., Quận 1, TP. Hồ Chí Minh</p>
```

Chỉ cần sửa chữ trong 2 dòng này (không còn nút "Xem bản đồ" nên không phải dán link gì thêm).

### 2.3. Nút "Xác nhận tham dự" (✏️ [10])

Nút này **không mở link nào** — bấm vào là nút chuyển sang **vàng kim loại** (có ánh sáng quét qua)
để tạo hiệu ứng cho đẹp. Muốn đổi chữ thì sửa trong `index.html` tại chỗ có `data-rsvp`.

---

## 3. Nhạc nền (✏️ [11])

- File nhạc nằm ở `assets/otherside-kuraine.mp3`, được phát **lặp lại liên tục** khi trang còn mở
  (`loop = true`), tự bắt đầu khi người xem bấm **Mở thiệp** (đúng quy định autoplay của trình duyệt).
- **Đổi bài khác:** chép file mới vào `assets/`, rồi sửa `musicFile` cho đúng tên:

  ```js
  musicFile: 'assets/bai-moi.mp3',
  musicVolume: 0.5,     // 0 → 1
  ```

- Nút loa ở góc phải dưới để tắt/bật. Nếu file sai đường dẫn, nút sẽ tự chuyển sang trạng thái tắt.
- File hiện tại nặng 7,8 MB. Nếu muốn nhẹ hơn, nén về 128 kbps (còn ~3-4 MB) bằng
  Audacity / bất kỳ trang convert mp3 nào — chất lượng nghe trên điện thoại vẫn ổn.

---

## 4. Xem thử trên máy

Cách nhanh nhất: **bấm đôi vào `index.html`**.

Nếu muốn xem như khi đã đăng mạng (đầy đủ font, nhạc, hiệu ứng):

```powershell
cd duong-dan-toi-thu-muc
python -m http.server 8123
# rồi mở http://localhost:8123
```

> Lưu ý: mở trực tiếp bằng `file://` thì một số trình duyệt chặn phát nhạc — dùng cách server ở trên
> hoặc đăng lên mạng để nghe nhạc.

---

## 5. Đăng lên internet

### 5.1. Netlify Drop — nhanh nhất (1 phút, không cần tài khoản GitHub)

1. Vào <https://app.netlify.com/drop>
2. Kéo **cả thư mục** này (gồm `assets/`) vào khung.
3. Nhận link dạng `https://ten-ngau-nhien.netlify.app` → dùng được ngay.
4. *Site settings → Change site name* để đổi thành `thiep-ky-yeu-12a1`.

### 5.2. GitHub Pages — miễn phí, link ổn định

1. Tạo repo mới (Public), ví dụ `thiep-ky-yeu`.
2. **Add file → Upload files**: `index.html`, `style.css`, `app.js` và thư mục `assets/`.
3. **Settings → Pages** → *Source*: `Deploy from a branch` → Branch `main`, folder `/ (root)` → **Save**.
4. Đợi ~1 phút: `https://tên-tài-khoản.github.io/thiep-ky-yeu/`.

> Gửi qua Zalo/Facebook sẽ hiện tiêu đề + mô tả (đã cài trong `<head>`).
> Muốn có ảnh preview khi chia sẻ, thêm:
> `<meta property="og:image" content="https://.../anh-preview.jpg">` (ảnh 1200×630).

---

## 6. Vài ghi chú kỹ thuật

- **Font:** *Handjet* (pixel, đủ dấu tiếng Việt) cho tiêu đề/số, *Be Vietnam Pro* cho nội dung dài — tải từ Google Fonts.
- **Texture pixel:** sinh bằng `<canvas>` lúc tải trang (đất, cỏ, đá, giấy da) nên không cần file ảnh.
- **Nhạc:** chỉ là một thẻ `<audio>` với `loop`, không dùng thư viện ngoài.
- **Tôn trọng người xem:** tự tắt chuyển động nếu hệ điều hành bật "giảm chuyển động";
  tắt JavaScript vẫn đọc được đầy đủ nội dung.
- Toàn bộ code ~35 KB + file nhạc.

## 7. Checklist trước khi gửi thiệp

- [ ] `eventStart`, `eventEnd` (✏️ [3]) và `countdownTo` (✏️ [3b])
- [ ] Địa chỉ 2 dòng `data-address` (✏️ [4])
- [ ] Bấm thử nút "Xác nhận tham dự" xem đã hoá vàng chưa (✏️ [10])
- [ ] Tên lớp, hạn xác nhận, lời ngỏ, footer (✏️ [1], [6], [7], [8])
- [ ] Mở trên điện thoại, bấm thử 2 nút, nghe thử nhạc và nút loa
- [ ] (Tuỳ chọn) Xoá thư mục `xem-truoc/` cho nhẹ web trước khi upload
