# Task 07: Xử lý lỗi & Hoàn thiện

## Mô tả
Xử lý error states, thêm notifications, loading states, và polish UI tổng thể.

## Chi tiết

### 1. Error Handling

**Global error boundary:**
- Tạo Error Boundary component bọc toàn bộ app
- Hiển thị fallback UI khi có lỗi runtime

**API error handling:**
- 401 Unauthorized → redirect về login, clear session
- 403 Forbidden → hiển thị thông báo "Không có quyền truy cập"
- 500 Server Error → hiển thị thông báo lỗi server
- Network Error → hiển thị "Không thể kết nối tới server"
- Timeout → hiển thị "Yêu cầu quá thời gian"

**Toast notifications (Mantine Notifications):**
- Login thành công → toast xanh
- Login thất bại → toast đỏ với message
- API error → toast đỏ
- Session expired → toast cảnh báo + redirect login

### 2. Loading States
- Login form: disable button + spinner khi đang submit
- Dashboard: skeleton loading cho cards và bảng
- Channels: skeleton loading cho danh sách
- Chuyển trang: loading indicator

### 3. Empty States
- Dashboard không có channel nào → thông báo "Chưa có kênh nào"
- Channels rỗng → thông báo tương tự

### 4. UI Polish
- Favicon + title: "Mirth Connect Web"
- Color scheme: dùng Mantine default theme hoặc custom tông xanh dương (medical/healthcare)
- Transition mượt khi chuyển trang
- Consistent spacing, typography
- Dark mode support (optional, dùng Mantine built-in)

### 5. Responsive kiểm tra
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Definition of Done
- [ ] Error boundary hoạt động
- [ ] Toast notifications hiển thị đúng
- [ ] Loading skeletons hiển thị khi fetch data
- [ ] Empty states hiển thị khi không có data
- [ ] UI nhất quán, không có lỗi visual
- [ ] Responsive hoạt động trên 3 breakpoints
