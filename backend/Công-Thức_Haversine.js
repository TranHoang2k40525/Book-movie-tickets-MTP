function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function tinhKhoangCach(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính Trái Đất (km)

    // Chuyển độ sang radian
    lat1 = toRadians(lat1);
    lon1 = toRadians(lon1);
    lat2 = toRadians(lat2);
    lon2 = toRadians(lon2);

    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;

    const a = Math.sin(dlat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const khoangCach = R * c;
    return khoangCach; // đơn vị: km
}