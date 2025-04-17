# Book Movie Tickets MTP - Ứng Dụng Đặt Vé Xem Phim

## Cấu trúc thư mục

```
fontend/
├── assets/                   # Tài nguyên tĩnh (hình ảnh, fonts...)
├── index.js                  # Entry point
├── app.json                  # Cấu hình Expo
├── package.json              # Cấu hình dependencies
└── src/
    ├── App.js                # Component gốc
    ├── api/                  # API calls & fetching
    ├── components/           # Các component dùng chung
    │   ├── common/           # Component chung (Button, Input...)
    │   └── layout/           # Component layout (Header, Footer...)
    ├── config/               # Cấu hình dự án
    ├── constants/            # Hằng số và enumeration
    ├── contexts/             # React contexts
    ├── hooks/                # Custom hooks
    ├── navigation/           # Cấu hình navigation
    ├── screens/              # Các màn hình
    │   ├── auth/             # Màn hình xác thực (Login, Register...)
    │   ├── booking/          # Màn hình đặt vé
    │   ├── cinemas/          # Màn hình rạp chiếu
    │   ├── home/             # Màn hình trang chủ
    │   ├── movies/           # Màn hình thông tin phim
    │   ├── profile/          # Màn hình thông tin người dùng
    │   └── promotions/       # Màn hình khuyến mãi
    ├── services/             # Các dịch vụ (authentication, API gateway...)
    ├── theme/                # Giao diện và phong cách (colors, typography, spacing...)
    └── utils/                # Các tiện ích (formatters, validators...)
```

## Hướng dẫn sử dụng

### Cài đặt dependencies
```bash
npm install
```

### Chạy ứng dụng
```bash
npm start
```

### Chạy trên Android
```bash
npm run android
```

### Chạy trên iOS
```bash
npm run ios
```

## Quy tắc đặt tên

- **Components**: PascalCase (VD: MovieCard, BookingForm)
- **Files và folders**: camelCase (VD: apiUtils.js, userContext.js)
- **Constants**: UPPER_SNAKE_CASE (VD: API_BASE_URL, DEFAULT_TIMEOUT)
- **Functions**: camelCase (VD: fetchMovies, handleBooking)

## Conventions

1. Sử dụng arrow functions cho component React
2. Sử dụng hooks thay vì class components
3. Sử dụng destructuring để truy cập props
4. Tách logic phức tạp ra custom hooks
5. Sử dụng Context API cho state management
6. Sử dụng React Navigation cho điều hướng