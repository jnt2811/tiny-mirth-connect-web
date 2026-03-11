# Task 06: Trang Kênh (Channels)

## Mô tả
Xây dựng trang hiển thị cấu hình chi tiết của các kênh dưới dạng readonly.

## Chi tiết

### 1. Dữ liệu cần hiển thị
API: `GET /api/channels` → `Channel[]`

Mỗi channel bao gồm:
- **Thông tin chung**: id, name, description, revision
- **Source Connector**: transportName (protocol), mode, enabled, các properties
- **Destination Connectors**: danh sách connectors với transportName, mode, enabled
- **Channel Properties**: initialState, messageStorageMode, encryptAttachments, etc.

### 2. Giao diện

#### Toggle View (Bảng / Danh sách)
Giống dashboard, cho phép toggle giữa 2 chế độ.

#### Chế độ Bảng (`mantine-datatable`)
Bảng chính hiển thị:
| Cột | Mô tả |
|-----|-------|
| Tên kênh | `channel.name` |
| Mô tả | `channel.description` (truncate nếu dài) |
| Source Protocol | `sourceConnector.transportName` |
| Destination Protocol(s) | Danh sách `destinationConnectors[].transportName` |
| Trạng thái khởi tạo | `properties.initialState` |
| Revision | `channel.revision` |
| Enabled | Badge enabled/disabled |

- Sortable, searchable
- Click vào row → mở panel chi tiết (expandable row hoặc modal)

#### Chế độ Danh sách (Card)
- Mỗi channel là 1 card
- Card hiển thị tên, mô tả, protocol, trạng thái
- Click card → mở chi tiết

#### Panel Chi tiết Channel (Expandable/Modal)
Khi click vào 1 channel, hiển thị chi tiết readonly:

**Tab Tổng quan:**
- ID, Name, Description, Revision
- Initial State
- Message Storage Mode

**Tab Source Connector:**
- Transport Name (protocol)
- Mode
- Enabled status
- Properties (hiển thị dạng key-value table hoặc JSON readonly)

**Tab Destination Connectors:**
- Danh sách các destination connectors
- Mỗi connector: name, transportName, mode, enabled
- Expandable để xem properties

**Tab Properties:**
- Tất cả channel properties dạng key-value
- Read-only badges/text

### 3. UI Notes
- Tất cả dữ liệu hiển thị **readonly** - KHÔNG có nút edit/save
- Readonly indicator: có note nhỏ "Chế độ chỉ xem" ở trên cùng
- Protocol badges với màu sắc khác nhau (HTTP=blue, TCP=green, JDBC=orange, etc.)
- Responsive layout

## Definition of Done
- [ ] Danh sách channels hiển thị đúng
- [ ] Toggle bảng/danh sách hoạt động
- [ ] Chi tiết channel hiển thị đầy đủ thông tin
- [ ] Tất cả readonly, không có action modify
- [ ] Sort và search hoạt động
- [ ] Responsive trên mobile
