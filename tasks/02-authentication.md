# Task 02: Xác thực (Authentication)

## Mô tả
Implement tính năng đăng nhập sử dụng Mirth Connect API (`POST /users/_login`), quản lý trạng thái auth, và bảo vệ routes.

## Chi tiết

### 1. Auth Context / Store (`src/lib/auth.ts`)
- Lưu trạng thái đăng nhập (isAuthenticated, user info)
- Hàm `login(username, password)`: gọi `POST /api/users/_login` với `application/x-www-form-urlencoded`
- Hàm `logout()`: gọi `POST /api/users/_logout`
- Hàm `checkAuth()`: gọi `GET /api/users/current` để kiểm tra session còn hợp lệ không
- Persist trạng thái auth qua sessionStorage/cookie

### 2. Login API Call
```
POST /api/users/_login
Content-Type: application/x-www-form-urlencoded

username=admin&password=admin
```
- Response: `LoginStatus { status, message, updatedUsername }`
- Nếu `status === 'SUCCESS'` hoặc `'SUCCESS_GRACE_PERIOD'` → đăng nhập thành công
- Các trường hợp FAIL → hiển thị thông báo lỗi tương ứng

### 3. Login Page (`src/routes/login.tsx`)
- Form đăng nhập với 2 field: Username, Password
- Default value: admin/admin
- Nút "Đăng nhập"
- Hiển thị lỗi khi đăng nhập thất bại
- Sau khi đăng nhập thành công → redirect tới `/dashboard`
- UI: Mantine form, centered layout, card style

### 4. Route Protection
- TanStack Router `beforeLoad`: kiểm tra auth trước khi vào routes được bảo vệ
- Nếu chưa đăng nhập → redirect về `/login`
- Nếu đã đăng nhập mà vào `/login` → redirect về `/dashboard`

## Lưu ý
- Mirth Connect API dùng session-based auth (cookie JSESSIONID)
- Cần đảm bảo `withCredentials: true` trong Axios để gửi cookie
- Login API dùng `application/x-www-form-urlencoded`, KHÔNG phải JSON

## Definition of Done
- [ ] Login page hiển thị đúng
- [ ] Đăng nhập thành công với admin/admin
- [ ] Đăng nhập thất bại hiển thị lỗi
- [ ] Redirect đúng sau login/logout
- [ ] Routes được bảo vệ, chưa login không vào được dashboard
