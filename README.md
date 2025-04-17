# MTP Cinema - Ứng Dụng Đặt Vé Xem Phim

![MTP Cinema Logo](https://mtbcinema.com.vn/media/fizn2ubc/logo.png)

## Tổng Quan

MTP Cinema (MTP 67CS1) là ứng dụng di động toàn diện giúp người dùng dễ dàng đặt vé xem phim, mua đồ uống và trải nghiệm các dịch vụ đặc biệt tại chuỗi rạp phim MTP. Ứng dụng được xây dựng bằng React Native cho phần frontend và Node.js cho phần backend, với cơ sở dữ liệu Microsoft SQL Server.

## Tính Năng Chính

- **Quản lý tài khoản**: Đăng ký, đăng nhập, quản lý thông tin cá nhân
- **Duyệt phim**: Xem danh sách phim đang chiếu, sắp chiếu với thông tin chi tiết
- **Đặt vé thông minh**: Chọn rạp, phim, suất chiếu, ghế ngồi và thanh toán trực tuyến
- **Tương tác phim**: Yêu thích phim, xem trailer, đánh giá phim
- **Mua đồ uống & combo**: Đặt trước combo đồ ăn, nước uống và merchandise đặc biệt
- **Vé điện tử**: Nhận và quản lý vé điện tử
- **Tin tức và ưu đãi**: Cập nhật thông tin khuyến mãi và tin tức mới nhất
- **Trải nghiệm đặc biệt**: SweetBox và các dịch vụ cao cấp khác
- **Bản đồ rạp phim**: Tìm kiếm và định vị rạp phim gần nhất

## Công Nghệ Sử Dụng

### Frontend
- **Framework**: React Native, Expo
- **Quản lý State**: React Context API
- **Điều hướng**: React Navigation 7
- **Xử lý HTTP Request**: Axios
- **Bất đồng bộ**: Async Storage
- **UI/UX**: Native components, vector icons
- **Media**: React Native Video, YouTube iframe

### Backend
- **Nền tảng**: Node.js, Express.js
- **Cơ sở dữ liệu**: Microsoft SQL Server (mssql)
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **Caching**: Redis, Node-cache
- **Real-time**: Socket.io
- **Validation**: Joi
- **Security**: CORS, Crypto

## Kiến Trúc Hệ Thống

### Cấu Trúc Frontend
```
fontend/
├── src/
│   ├── Api/               # API calls & services
│   ├── assets/            # Hình ảnh, videos, fonts
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts (UserContext)
│   ├── screens/           # Màn hình ứng dụng
│   │   ├── Auth/          # Đăng nhập, đăng ký
│   │   ├── Booking/       # Quy trình đặt vé
│   │   ├── Cinemas/       # Thông tin rạp
│   │   ├── Home/          # Trang chủ, danh sách phim
│   │   ├── Promotions/    # Tin tức & ưu đãi
│   │   ├── SpecialExperiences/ # Trải nghiệm đặc biệt
│   │   └── User/          # Thông tin người dùng
│   ├── App.js             # Component gốc
│   └── index.js           # Entry point
```

### Cấu Trúc Backend
```
backend/
├── assets/              # Static assets (videos, images)
├── config/             # Cấu hình (database, environment)
├── controllers/        # Business logic
├── middleware/         # Middleware (authentication, validation)
├── routes/             # API endpoints
├── utils/              # Helper functions
├── .env                # Environment variables
└── server.js           # Entry point
```

## Database Schema

Cơ sở dữ liệu chính sử dụng Microsoft SQL Server với các bảng chính:

- **Account**: Quản lý thông tin tài khoản
- **Customer**: Thông tin khách hàng
- **Movie**: Thông tin phim
- **Cinema**: Thông tin rạp chiếu
- **CinemaHall**: Phòng chiếu
- **CinemaHallSeat**: Thông tin ghế ngồi
- **Show**: Lịch chiếu
- **Booking**: Đơn đặt vé
- **BookingSeat**: Chi tiết ghế đã đặt
- **Product**: Sản phẩm (đồ ăn, nước uống)

## API Endpoints

Hệ thống cung cấp nhiều API endpoints để phục vụ các chức năng khác nhau:

### Authentication
- `POST /api/login`: Đăng nhập
- `POST /api/register`: Đăng ký tài khoản
- `POST /api/refresh-token`: Làm mới token
- `POST /api/send-otp`: Gửi mã OTP
- `POST /api/reset-password`: Đặt lại mật khẩu

### Movies
- `GET /api/movies`: Lấy danh sách phim
- `GET /api/movies/:id`: Chi tiết phim
- `GET /api/movies/movies/showing-today`: Phim đang chiếu hôm nay
- `GET /api/movies/:id/showtimes`: Lịch chiếu theo phim
- `GET /api/movies/:id/cinemas`: Rạp chiếu theo phim và ngày
- `GET /api/movies/:movieId/cinemas/:cinemaId/showtimes`: Lịch chiếu theo phim, rạp và ngày
- `GET /api/movies/:showId/seats`: Sơ đồ ghế ngồi
- `POST /api/movies/:showId/hold-seats`: Giữ ghế tạm thời
- `GET /api/movies/:showId/expired-seats`: Kiểm tra và giải phóng ghế hết hạn

### User
- `POST /api/get-account`: Lấy thông tin tài khoản
- `POST /api/get-customer`: Lấy thông tin khách hàng
- `POST /api/update-avatar`: Cập nhật ảnh đại diện
- `PUT /api/update-customer`: Cập nhật thông tin khách hàng
- `DELETE /api/delete-account`: Xóa tài khoản

### Location
- `GET /api/cities`: Danh sách thành phố
- `GET /api/cinemas`: Danh sách rạp
- `GET /api/cinemas-by-city/:cityId`: Rạp theo thành phố

### Products
- `GET /api/products`: Danh sách sản phẩm

## Giá Trị & Ý Nghĩa

MTP Cinema mang đến nhiều giá trị cho người dùng và ngành công nghiệp giải trí:

- **Tiện lợi & Tiết kiệm thời gian**: Đặt vé nhanh chóng, không cần xếp hàng
- **Trải nghiệm cá nhân hóa**: Đề xuất phim dựa trên sở thích
- **Chăm sóc khách hàng**: Hệ thống thành viên với nhiều ưu đãi
- **Tối ưu hóa vận hành**: Giảm chi phí nhân sự, tăng hiệu quả cho rạp phim
- **Phân tích dữ liệu**: Thu thập insights về hành vi người dùng
- **Tiếp thị số**: Kênh marketing trực tiếp đến người dùng

## Nhu Cầu Thị Trường

Ứng dụng đáp ứng các nhu cầu quan trọng của thị trường:

1. **Số hóa dịch vụ**: Xu hướng chuyển đổi số trong ngành giải trí
2. **Trải nghiệm đồng nhất**: Tích hợp mọi dịch vụ trong một ứng dụng
3. **Thanh toán không tiền mặt**: Hỗ trợ thanh toán điện tử
4. **Thông tin thời gian thực**: Cập nhật lịch chiếu, ghế trống liên tục
5. **Tương tác đa kênh**: Kết nối qua ứng dụng, web, mạng xã hội

## Hướng Phát Triển

Dự án có nhiều tiềm năng phát triển trong tương lai:

- **Trí tuệ nhân tạo**: Đề xuất phim dựa trên AI
- **Thực tế ảo**: Xem trước phòng chiếu bằng VR
- **Loyalty program**: Hệ thống điểm thưởng và đặc quyền
- **Social features**: Chia sẻ, bình luận, tạo nhóm xem phim
- **Mở rộng dịch vụ**: Liên kết với các dịch vụ giải trí khác

## Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống
- Node.js v14+ 
- SQL Server 2019+
- Redis Server (tùy chọn)
- React Native environment

### Cài Đặt Frontend
```bash
cd fontend
npm install
npm start
```

### Cài Đặt Backend
```bash
cd backend
npm install
# Cấu hình file .env với thông tin database
npm start
```

## Đóng Góp & Phát Triển

Dự án được phát triển bởi nhóm sinh viên 67CS1 như một dự án mẫu cho ứng dụng đặt vé xem phim.

## Giấy Phép

Dự án được phát hành dưới giấy phép ISC License. 