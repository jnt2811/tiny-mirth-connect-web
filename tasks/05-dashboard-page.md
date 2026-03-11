# Task 05: Trang Dashboard (Bảng điều khiển)

## Mô tả
Xây dựng trang Dashboard hiển thị tổng quan về các kênh: inbound/outbound messages, protocol, trạng thái.

## Chi tiết

### 1. Dữ liệu cần hiển thị
Kết hợp data từ 2 API:
- `GET /api/channels/statuses` → trạng thái, statistics (received/sent/error/filtered/queued)
- `GET /api/channels/statistics` → thống kê chi tiết

Mỗi channel row hiển thị:
| Cột | Nguồn | Mô tả |
|-----|-------|-------|
| Tên kênh | `DashboardStatus.name` | Tên channel |
| Trạng thái | `DashboardStatus.state` | STARTED/STOPPED/PAUSED (badge màu) |
| Protocol | Từ `Channel.sourceConnector.transportName` | HTTP, TCP, JDBC, etc. |
| Received (Inbound) | `statistics.received` | Số message nhận được |
| Sent (Outbound) | `statistics.sent` | Số message gửi đi |
| Error | `statistics.error` | Số message lỗi |
| Filtered | `statistics.filtered` | Số message bị filter |
| Queued | `statistics.queued` hoặc `DashboardStatus.queued` | Số message đang chờ |

### 2. Giao diện

#### Summary Cards (trên cùng)
- **Tổng kênh**: số lượng channels
- **Đang hoạt động**: số channels có state = STARTED (badge xanh)
- **Đã dừng**: số channels có state = STOPPED (badge đỏ)
- **Tổng lỗi**: tổng error messages

#### Toggle View (Bảng / Danh sách)
- Nút toggle giữa 2 chế độ hiển thị
- **Chế độ Bảng**: sử dụng `mantine-datatable`
  - Sortable columns
  - Searchable (tìm theo tên kênh)
  - Pagination nếu nhiều channels
- **Chế độ Danh sách (Card)**: hiển thị mỗi channel dưới dạng card
  - Card chứa tên, trạng thái badge, protocol, stats
  - Grid layout responsive (3 cột desktop, 2 tablet, 1 mobile)

### 3. Chi tiết UI
- State badge:
  - `STARTED` → xanh lá (green)
  - `STOPPED` → đỏ (red)
  - `PAUSED` → vàng (yellow)
  - `DEPLOYING` → xanh dương (blue)
- Error count > 0 → highlight đỏ
- Auto-refresh mỗi 30s (dùng TanStack Query `refetchInterval`)
- Loading skeleton khi đang fetch data

### 4. Lấy Protocol
- Cần fetch thêm `GET /api/channels` để lấy `sourceConnector.transportName`
- Hoặc kết hợp data từ channels + statuses

## Definition of Done
- [ ] Dashboard hiển thị đúng dữ liệu từ API
- [ ] Summary cards hiển thị số liệu tổng hợp
- [ ] Toggle giữa chế độ bảng và danh sách hoạt động
- [ ] Bảng có sort, search
- [ ] State badges hiển thị đúng màu
- [ ] Auto-refresh hoạt động
- [ ] Loading state hiển thị skeleton
- [ ] Responsive trên mobile
