# Task 03: Layout & Routing

## Mô tả
Thiết kế layout chung (header + content) và cấu hình routing với TanStack Router file-based routes.

## Chi tiết

### 1. Route Structure (file-based routing)
```
src/routes/
├── __root.tsx              # Root layout (MantineProvider, QueryClientProvider)
├── login.tsx               # /login - trang đăng nhập
├── _authenticated.tsx      # Layout route cho các trang cần auth (beforeLoad check)
├── _authenticated/
│   ├── dashboard.tsx       # /dashboard - trang bảng điều khiển
│   └── channels.tsx        # /channels - trang kênh
└── index.tsx               # / - redirect tới /dashboard
```

### 2. Root Layout (`__root.tsx`)
- Wrap toàn bộ app với MantineProvider, QueryClientProvider
- Outlet cho child routes

### 3. Authenticated Layout (`_authenticated.tsx`)
- `beforeLoad`: kiểm tra auth, redirect về `/login` nếu chưa đăng nhập
- Header component ở trên
- Content (Outlet) ở dưới
- Layout: `AppShell` của Mantine

### 4. Header Component (`src/components/Header.tsx`)
- Logo/tên app: "Mirth Connect" (bên trái)
- Menu items (navigation):
  - **Bảng điều khiển** (`/dashboard`) - icon: IconDashboard
  - **Kênh** (`/channels`) - icon: IconArrowsExchange
- Active state: highlight menu item đang active dựa trên route hiện tại
- User menu (bên phải):
  - Hiển thị username
  - Nút "Đăng xuất"
- Responsive: collapse menu trên mobile

### 5. Redirect
- `/` → redirect tới `/dashboard`
- Bất kỳ route không tồn tại → redirect về `/dashboard`

## Definition of Done
- [ ] Route tree gen hoạt động (`routeTree.gen.ts` được tạo tự động)
- [ ] Chuyển trang giữa Dashboard và Kênh mượt mà
- [ ] Header hiển thị đúng, active state hoạt động
- [ ] Đăng xuất hoạt động, redirect về login
- [ ] Layout responsive trên mobile
