# BÁO CÁO CHI TIẾT HỆ THỐNG ĐẶT VÉ XEM PHIM MTP

## Mục Lục
1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Phân Tích Chi Tiết](#3-phân-tích-chi-tiết)
4. [Tính Năng Chính](#4-tính-năng-chính)
5. [Công Nghệ Sử Dụng](#5-công-nghệ-sử-dụng)
6. [Cơ Sở Dữ Liệu](#6-cơ-sở-dữ-liệu)
7. [API Documentation](#7-api-documentation)
8. [Xử Lý Thời Gian Thực](#8-xử-lý-thời-gian-thực)
9. [Bảo Mật](#9-bảo-mật)
10. [Hiệu Suất](#10-hiệu-suất)
11. [Triển Khai](#11-triển-khai)
12. [Kết Luận](#12-kết-luận)

## 1. Tổng Quan Dự Án

### 1.1 Giới Thiệu
Hệ thống đặt vé xem phim MTP là một giải pháp toàn diện cho việc quản lý và đặt vé xem phim trực tuyến. Hệ thống được xây dựng với kiến trúc microservices, bao gồm:
- Backend API Server
- Mobile App Frontend
- Web Admin Dashboard

### 1.2 Mục Tiêu
- Tự động hóa quy trình đặt vé xem phim
- Cung cấp trải nghiệm người dùng mượt mà
- Quản lý hiệu quả hệ thống rạp chiếu
- Tối ưu hóa doanh thu và vận hành

### 1.3 Phạm Vi
- Quản lý phim và lịch chiếu
- Đặt vé và thanh toán trực tuyến
- Quản lý rạp và phòng chiếu
- Báo cáo và thống kê

## 2. Kiến Trúc Hệ Thống

### 2.1 Sơ Đồ Kiến Trúc
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │     │  Backend API    │     │  Web Admin      │
│   (React Native)│◄───►│   (Node.js)     │◄───►│   (Web)         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  SQL Server     │
                       │  Database       │
                       └─────────────────┘
```

### 2.2 Cấu Trúc Thư Mục
```
├── backend/           # Backend API Server
│   ├── config/       # Cấu hình
│   ├── controllers/  # Xử lý logic
│   ├── middleware/   # Middleware
│   ├── routes/       # API routes
│   └── utils/        # Helper functions
├── fontend/          # Mobile App
│   ├── src/
│   │   ├── Api/     # API calls
│   │   ├── components/
│   │   ├── screens/
│   │   └── utils/
└── WebQuanLyDatVe/   # Web Admin
    ├── assets/
    ├── css/
    └── js/
```

## 3. Phân Tích Chi Tiết

### 3.1 Backend API

#### 3.1.1 Công Nghệ
- Node.js & Express.js
- SQL Server
- WebSocket
- JWT Authentication

#### 3.1.2 API Endpoints
1. Authentication
   - POST /api/auth/login
   - POST /api/auth/register
   - POST /api/auth/refresh-token

2. Movies
   - GET /api/movies
   - GET /api/movies/:id
   - POST /api/movies
   - PUT /api/movies/:id

3. Booking
   - POST /api/booking/hold-seats
   - POST /api/booking/cancel
   - GET /api/booking/:id

4. Payment
   - POST /api/payment/momo
   - POST /api/payment/vnpay

### 3.2 Mobile App

#### 3.2.1 Công Nghệ
- React Native
- Redux
- React Navigation
- WebSocket Client

#### 3.2.2 Tính Năng
1. Authentication
   - Đăng nhập/Đăng ký
   - Quên mật khẩu
   - OAuth 2.0

2. Movie Browsing
   - Danh sách phim
   - Chi tiết phim
   - Trailer

3. Booking
   - Chọn ghế
   - Thanh toán
   - Vé điện tử

### 3.3 Web Admin

#### 3.3.1 Công Nghệ
- HTML/CSS/JavaScript
- Bootstrap
- jQuery
- Chart.js

#### 3.3.2 Tính Năng
1. Dashboard
   - Thống kê doanh thu
   - Báo cáo vé
   - Quản lý người dùng

2. Movie Management
   - Thêm/Sửa/Xóa phim
   - Quản lý lịch chiếu
   - Upload media

## 4. Tính Năng Chính

### 4.1 Quản Lý Phim
- Thêm/sửa/xóa thông tin phim
- Upload poster và trailer
- Quản lý lịch chiếu
- Phân loại phim

### 4.2 Quản Lý Rạp
- Thông tin rạp chiếu
- Quản lý phòng chiếu
- Sơ đồ ghế ngồi
- Giá vé

### 4.3 Đặt Vé
- Chọn phim và suất chiếu
- Chọn ghế ngồi
- Thanh toán trực tuyến
- Gửi vé qua email

### 4.4 Thời Gian Thực
- Cập nhật trạng thái ghế
- Thông báo đặt vé
- Giới hạn thời gian giữ ghế

## 5. Công Nghệ Sử Dụng

### 5.1 Backend
- Node.js & Express.js
- SQL Server
- WebSocket
- JWT Authentication
- Redis (caching)

### 5.2 Frontend Mobile
- React Native
- Redux
- React Navigation
- WebSocket Client
- AsyncStorage

### 5.3 Web Admin
- HTML5/CSS3
- JavaScript
- Bootstrap
- jQuery
- Chart.js

## 6. Cơ Sở Dữ Liệu

### 6.1 Schema Design
1. Movies
   ```sql
   CREATE TABLE Movies (
     MovieID INT PRIMARY KEY,
     Title NVARCHAR(255),
     Description NVARCHAR(MAX),
     Duration INT,
     ReleaseDate DATE,
     Genre NVARCHAR(100),
     Rating FLOAT,
     PosterURL NVARCHAR(255),
     TrailerURL NVARCHAR(255)
   );
   ```

2. Cinemas
   ```sql
   CREATE TABLE Cinemas (
     CinemaID INT PRIMARY KEY,
     Name NVARCHAR(255),
     Address NVARCHAR(255),
     City NVARCHAR(100),
     Phone NVARCHAR(20),
     Email NVARCHAR(255)
   );
   ```

3. Bookings
   ```sql
   CREATE TABLE Bookings (
     BookingID INT PRIMARY KEY,
     CustomerID INT,
     ShowID INT,
     BookingDate DATETIME,
     Status NVARCHAR(50),
     TotalAmount DECIMAL(10,2)
   );
   ```

### 6.2 Relationships
- Movies -> Shows (1:N)
- Cinemas -> Halls (1:N)
- Shows -> Bookings (1:N)
- Bookings -> BookingSeats (1:N)

## 7. API Documentation

### 7.1 Authentication
```javascript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

### 7.2 Movies
```javascript
// Get Movies
GET /api/movies
Query Parameters:
- page: number
- limit: number
- genre: string
- search: string

// Response
{
  "movies": [
    {
      "id": 1,
      "title": "Movie Title",
      "description": "Description",
      "duration": 120,
      "releaseDate": "2024-03-20",
      "genre": "Action",
      "rating": 4.5,
      "posterUrl": "url",
      "trailerUrl": "url"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

## 8. Xử Lý Thời Gian Thực

### 8.1 WebSocket Implementation
```javascript
// Server-side
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    switch(data.type) {
      case 'SEAT_UPDATE':
        broadcastSeatUpdate(data.showId, data.seatLayout);
        break;
      case 'BOOKING_UPDATE':
        broadcastBookingUpdate(data.bookingId, data.status);
        break;
    }
  });
});
```

### 8.2 Client-side Integration
```javascript
// Mobile App
const setupWebSocket = (showId) => {
  const ws = new WebSocket(`${ENV.WS_URL}?showId=${showId}`);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch(data.type) {
      case 'SEAT_UPDATE':
        updateSeatLayout(data.seatLayout);
        break;
      case 'BOOKING_UPDATE':
        updateBookingStatus(data.bookingId, data.status);
        break;
    }
  };
};
```

## 9. Bảo Mật

### 9.1 Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Token refresh mechanism
- Session management

### 9.2 Authorization
- Role-based access control
- Resource ownership validation
- API key validation
- Permission management

### 9.3 Data Protection
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Input validation

## 10. Hiệu Suất

### 10.1 Database Optimization
- Index optimization
- Query optimization
- Connection pooling
- Caching strategy

### 10.2 API Optimization
- Response compression
- Request validation
- Error handling
- Logging
- Caching

### 10.3 Mobile App Optimization
- Image optimization
- List virtualization
- Memory management
- Network optimization

## 11. Triển Khai

### 11.1 Backend Deployment
1. Server Requirements
   - Node.js >= 14.x
   - SQL Server 2019
   - PM2
   - Nginx

2. Environment Setup
   ```bash
   # Install dependencies
   npm install

   # Configure environment
   cp .env.example .env
   # Edit .env file

   # Start server
   pm2 start server.js
   ```

### 11.2 Mobile App Deployment
1. Android
   ```bash
   # Generate keystore
   keytool -genkey -v -keystore mtp.keystore -alias mtp -keyalg RSA -keysize 2048 -validity 10000

   # Build release
   cd android
   ./gradlew assembleRelease
   ```

2. iOS
   ```bash
   # Install pods
   cd ios
   pod install

   # Build archive
   xcodebuild -workspace MTP.xcworkspace -scheme MTP -configuration Release
   ```

## 12. Kết Luận

### 12.1 Thành Tựu
- Hệ thống đặt vé tự động
- Cập nhật thời gian thực
- Trải nghiệm người dùng tốt
- Bảo mật cao
- Hiệu suất tối ưu

### 12.2 Hướng Phát Triển
- AI/ML cho đề xuất phim
- VR/AR cho xem trước phòng chiếu
- Blockchain cho vé điện tử
- Mở rộng dịch vụ

### 12.3 Đề Xuất
- Tăng cường bảo mật
- Tối ưu hiệu suất
- Mở rộng tính năng
- Cải thiện UX/UI 