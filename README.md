# Hệ Thống Đặt Vé Xem Phim MTP

## Tổng Quan
Hệ thống đặt vé xem phim MTP là một ứng dụng web và mobile cho phép người dùng đặt vé xem phim trực tuyến. Hệ thống được xây dựng với kiến trúc microservices, bao gồm backend API, frontend web và ứng dụng mobile.

## Cấu Trúc Dự Án
```
├── backend/           # Backend API Server
├── fontend/          # Mobile App Frontend
└── WebQuanLyDatVe/   # Web Admin Dashboard
```

## Tính Năng Chính
1. **Quản Lý Phim**
   - Thêm/sửa/xóa thông tin phim
   - Quản lý lịch chiếu
   - Upload poster và trailer

2. **Quản Lý Rạp Chiếu**
   - Quản lý thông tin rạp
   - Quản lý phòng chiếu
   - Quản lý sơ đồ ghế

3. **Đặt Vé**
   - Chọn phim và suất chiếu
   - Chọn ghế ngồi
   - Thanh toán trực tuyến
   - Gửi vé qua email

4. **Quản Lý Người Dùng**
   - Đăng ký/đăng nhập
   - Quản lý thông tin cá nhân
   - Lịch sử đặt vé

5. **Tính Năng Thời Gian Thực**
   - Cập nhật trạng thái ghế realtime
   - Thông báo khi có người đặt ghế
   - Giới hạn thời gian giữ ghế

## Công Nghệ Sử Dụng

### Backend
- Node.js
- Express.js
- SQL Server
- WebSocket
- JWT Authentication

### Frontend Mobile
- React Native
- Redux
- WebSocket Client
- AsyncStorage

### Web Admin
- HTML/CSS/JavaScript
- Bootstrap
- jQuery
- Chart.js

## Cài Đặt và Chạy

### Yêu Cầu Hệ Thống
- Node.js >= 14.x
- SQL Server 2019
- React Native CLI
- Android Studio (cho mobile app)

### Cài Đặt Backend
```bash
cd backend
npm install
npm start
```

### Cài Đặt Frontend Mobile
```bash
cd fontend
npm install
npx react-native run-android
```

### Cài Đặt Web Admin
```bash
cd WebQuanLyDatVe
# Mở file index.html trong trình duyệt
```

## Cấu Hình
1. Tạo file `.env` trong thư mục backend:
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=mtp_cinema
JWT_SECRET=your_jwt_secret
```

2. Cấu hình SQL Server:
- Tạo database `mtp_cinema`
- Import file `database.sql`

## API Documentation
API documentation được tạo tự động bằng Swagger UI, truy cập tại:
```
http://localhost:3000/api-docs
```

## Bảo Mật
- JWT Authentication
- Password Hashing
- SQL Injection Prevention
- XSS Protection
- CORS Configuration

## Hiệu Suất
- Database Indexing
- Query Optimization
- Connection Pooling
- Caching Strategy

## Monitoring
- Error Logging
- Performance Metrics
- User Activity Tracking
- System Health Checks

## Deployment
- Docker Containerization
- CI/CD Pipeline
- Load Balancing
- Auto-scaling

## Contributing
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License
MIT License

## Contact
- Email: support@mtpcinema.com
- Website: www.mtpcinema.com
- Phone: +84 123 456 789
