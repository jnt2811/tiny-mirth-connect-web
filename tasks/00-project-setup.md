# Task 00: Khởi tạo dự án

## Mô tả
Khởi tạo project React + TypeScript với Rsbuild, cài đặt tất cả dependencies cần thiết.

## Chi tiết

### 1. Khởi tạo project với Rsbuild
- Sử dụng `@rsbuild/create` hoặc tạo thủ công
- Cấu hình TypeScript strict mode
- Cấu hình path alias (`@/` trỏ tới `src/`)

### 2. Cài đặt dependencies

**Core:**
- `react`, `react-dom`
- `@mantine/core`, `@mantine/hooks` (v8)
- `@mantine/notifications` (toast/notification)
- `mantine-datatable` (bảng dữ liệu)
- `@tanstack/react-router` (routing)
- `@tanstack/react-query` (data fetching)
- `axios` (HTTP client)

**Dev dependencies:**
- `typescript`
- `@tanstack/router-plugin` (route tree generation)
- `@rsbuild/core`, `@rsbuild/plugin-react`
- `@types/react`, `@types/react-dom`

### 3. Cấu hình Rsbuild (`rsbuild.config.ts`)
- Plugin React
- Plugin TanStack Router (route tree gen)
- Proxy API tới Mirth Connect server (`/api` -> `https://localhost:8443/api`)

### 4. Cấu hình TypeScript (`tsconfig.json`)
- Strict mode
- Path alias
- JSX react-jsx

### 5. Cấu trúc thư mục
```
src/
├── main.tsx                  # Entry point
├── App.tsx                   # App root (providers)
├── routeTree.gen.ts          # Auto-generated route tree
├── routes/                   # TanStack Router file-based routes
├── components/               # Shared components
├── hooks/                    # Custom hooks
├── lib/                      # Utilities (axios instance, helpers)
├── types/                    # TypeScript types
└── styles/                   # Global styles
```

## Definition of Done
- [ ] Project build thành công không lỗi
- [ ] Dev server chạy được
- [ ] Mantine theme hoạt động
- [ ] TanStack Router route tree gen hoạt động
