# Giải pháp đặt ghế xem phim thời gian thực

Hệ thống đặt ghế xem phim cần giải quyết các vấn đề quan trọng về đồng bộ hóa và trải nghiệm người dùng:
- Đảm bảo không có hai người cùng đặt một ghế
- Tạo trải nghiệm đặt vé mượt mà, thời gian thực
- Cho phép người dùng "giữ" ghế trong thời gian thanh toán
- Tự động giải phóng ghế không được thanh toán sau thời gian chờ

## Kiến trúc giải pháp

Chúng tôi đã triển khai giải pháp kết hợp Redis và Socket.IO để xử lý các yêu cầu thời gian thực và đồng bộ hóa trạng thái ghế:

### 1. Redis làm hệ thống khóa phân tán

- Sử dụng Redis để lưu trữ trạng thái "khóa" của ghế với cơ chế TTL (Time-To-Live)
- Mỗi khóa ghế có thông tin người dùng và thời gian hết hạn
- Redis tự động giải phóng khóa sau khi hết thời gian TTL
- Đảm bảo tính nhất quán ngay cả khi có nhiều instance của ứng dụng (khả năng mở rộng)

### 2. Socket.IO cho cập nhật thời gian thực

- Người dùng kết nối vào "phòng" của suất chiếu khi xem trang đặt vé
- Khi có người khóa ghế, xác nhận hay hủy khóa, thông tin được phát trực tiếp đến tất cả người dùng
- Trạng thái ghế được cập nhật ngay lập tức trên giao diện người dùng
- Người dùng luôn thấy được ghế nào đã bị đặt, đang được giữ

### 3. Quy trình đặt vé

1. **Chọn ghế và khóa tạm thời:**
   - Người dùng chọn ghế trên giao diện
   - Hệ thống kiểm tra và khóa ghế trong Redis với TTL là 10 phút
   - Lưu thông tin đặt chỗ tạm thời trong cơ sở dữ liệu với trạng thái "Pending"
   - Thông báo cho tất cả người dùng khác về ghế đã bị khóa

2. **Thanh toán:**
   - Người dùng có 10 phút để hoàn tất thanh toán
   - Trong thời gian này, ghế được hiển thị là "đã khóa" cho tất cả người dùng
   - Người dùng có thể nhìn thấy thời gian còn lại để thanh toán

3. **Xác nhận hoặc hết hạn:**
   - Nếu thanh toán thành công: cập nhật trạng thái ghế thành "Confirmed" trong DB
   - Nếu hết thời gian: khóa Redis tự động giải phóng, trạng thái "Pending" sẽ bị xóa bởi tiến trình dọn dẹp
   - Cả hai trường hợp đều được thông báo thời gian thực đến tất cả người dùng

4. **Gia hạn thời gian giữ ghế:**
   - Người dùng có thể gia hạn thời gian giữ ghế thêm tối đa 5 phút nếu cần thêm thời gian thanh toán

## API Endpoints

| Phương thức | Endpoint | Mô tả |
|-------------|----------|-------|
| GET | /api/shows/:showId/seats | Lấy tất cả ghế và trạng thái hiện tại của một suất chiếu |
| POST | /api/shows/:showId/hold-seats | Khóa tạm thời một hoặc nhiều ghế |
| POST | /api/shows/:showId/check-availability | Kiểm tra ghế có còn trống không |
| GET | /api/:bookingId | Lấy thông tin đặt vé |
| POST | /api/:bookingId/confirm | Xác nhận đặt vé sau khi thanh toán thành công |
| PUT | /api/:bookingId/extend | Gia hạn thời gian giữ ghế |
| DELETE | /api/:bookingId | Hủy đặt vé |

## Sự kiện Socket.IO

| Sự kiện | Mô tả |
|---------|-------|
| join-showroom | Tham gia vào phòng của suất chiếu cụ thể |
| leave-showroom | Rời khỏi phòng suất chiếu |
| seat-status-change | Nhận thông báo khi trạng thái ghế thay đổi |

## Trạng thái ghế

- **available**: Ghế còn trống và có thể đặt
- **locked**: Ghế đang bị khóa tạm thời (đang trong quá trình thanh toán)
- **confirmed/booked**: Ghế đã được đặt thành công

## Lợi ích của giải pháp

1. **Trải nghiệm người dùng tốt hơn**:
   - Người dùng có thời gian để điền thông tin thanh toán mà không lo mất ghế
   - Cập nhật thời gian thực giúp người dùng thấy được trạng thái ghế hiện tại
   - Giảm khả năng xung đột và lỗi khi đặt vé

2. **Bảo vệ tính nhất quán dữ liệu**:
   - Không có khả năng xảy ra đặt trùng ghế
   - Hệ thống khóa phân tán hoạt động đáng tin cậy trong môi trường có tải cao

3. **Khả năng mở rộng**:
   - Redis và Socket.IO dễ dàng mở rộng để đáp ứng lượng truy cập lớn
   - Kiến trúc phù hợp cho việc triển khai nhiều instance ứng dụng 
