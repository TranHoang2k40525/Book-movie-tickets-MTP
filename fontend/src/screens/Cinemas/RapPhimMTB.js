import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCinemas } from "../../Api/api";
import Menu from "../../components/Menu";
import * as Location from 'expo-location';

// Hàm tính khoảng cách bằng công thức Haversine
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Khoảng cách (km)
};

export default function RapPhimMTB({ navigation }) {
  const [cinemas, setCinemas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef(null);

  // Lấy vị trí người dùng
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Không được cấp quyền truy cập vị trí. Danh sách rạp sẽ hiển thị nhưng không có khoảng cách.');
        return false;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const userLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(userLoc);
      return true;
    } catch (err) {
      setError('Lỗi khi lấy vị trí người dùng: ' + err.message);
      return false;
    }
  };

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        await getUserLocation();
        const response = await getCinemas();
        const cinemaData = response.data.cinemas;

        // Kiểm tra tọa độ hợp lệ
        const isValidCoordinate = (lat, lon) => {
          return (
            lat != null &&
            lon != null &&
            !isNaN(lat) &&
            !isNaN(lon) &&
            lat >= -90 &&
            lat <= 90 &&
            lon >= -180 &&
            lon <= 180
          );
        };

        // Gợi ý cho bạn: Lấy các rạp gần nhất
        const suggestedCinemas = cinemaData
          .filter(cinema => isValidCoordinate(cinema.Latitude, cinema.Longitude))
          .map(cinema => ({
            id: cinema.CinemaID,
            name: cinema.CinemaName,
            distance: userLocation
              ? getDistanceFromLatLonInKm(
                  userLocation.latitude,
                  userLocation.longitude,
                  cinema.Latitude,
                  cinema.Longitude
                ).toFixed(2)
              : 'N/A',
            latitude: cinema.Latitude,
            longitude: cinema.Longitude,
            favorite: false,
          }))
          .sort((a, b) => {
            if (a.distance === 'N/A' && b.distance === 'N/A') return 0;
            if (a.distance === 'N/A') return 1;
            if (b.distance === 'N/A') return -1;
            return parseFloat(a.distance) - parseFloat(b.distance);
          })
          .slice(0, 5);

        // Nhóm rạp theo thành phố
        const groupedByCity = cinemaData.reduce((acc, cinema) => {
          const cityId = cinema.CityID;
          if (!acc[cityId]) {
            acc[cityId] = {
              name: cinema.CityAddress,
              count: 0,
              cinemas: [],
            };
          }
          if (isValidCoordinate(cinema.Latitude, cinema.Longitude)) {
            acc[cityId].cinemas.push({
              id: cinema.CinemaID,
              name: cinema.CinemaName,
              distance: userLocation
                ? getDistanceFromLatLonInKm(
                    userLocation.latitude,
                    userLocation.longitude,
                    cinema.Latitude,
                    cinema.Longitude
                  ).toFixed(2)
                : 'N/A',
              latitude: cinema.Latitude,
              longitude: cinema.Longitude,
            });
            acc[cityId].count = acc[cityId].cinemas.length;
          }
          return acc;
        }, {});

        setCinemas(suggestedCinemas);
        setAreas(Object.values(groupedByCity).filter(area => area.count > 0));
      } catch (error) {
        console.error("Lỗi khi lấy danh sách rạp:", error);
        Alert.alert(
          "Lỗi",
          "Không thể tải danh sách rạp phim. Vui lòng thử lại sau."
        );
      }
    };

    fetchCinemas();
  }, [userLocation]);

  // Định dạng tên rạp
  const formatCinemaName = (name) => ` ${name}`;

  // Xử lý khi chọn rạp
  const handleCinemaPress = (cinema) => {
    console.log('Chọn rạp:', cinema);
    navigation.navigate('Map', {
      cinemaId: cinema.id,
      cinemaName: formatCinemaName(cinema.name),
      cinemaLat: cinema.latitude,
      cinemaLng: cinema.longitude,
    });
  };

  // Mở rộng/thu gọn khu vực
  const toggleExpand = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Cuộn lên đầu
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Xử lý nút quay lại
  const handleBackPress = () => {
    navigation.goBack();
  };

  // Xử lý nút vị trí
  const handleLocationPress = () => {
    Alert.alert(
      "Thông báo",
      "Chức năng bản đồ hiện đang cập nhật, vui lòng chờ đợi vài năm!."
    );
  };

  return (
    <View style={styles.container}>
      {/* Header cố định */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rạp phim MTB</Text>
        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={handleLocationPress}>
            <Ionicons
              name="location-sharp"
              size={24}
              color="red"
              style={styles.locationIcon}
            />
          </TouchableOpacity>
          <Menu navigation={navigation} />
        </View>
      </View>

      {/* Thông báo nếu có lỗi */}
      {error && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>{error}</Text>
        </View>
      )}

      {/* Nội dung cuộn bên dưới header */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>GỢI Ý CHO BẠN</Text>
        </View>
        {cinemas.map((item, index) => (
          <TouchableOpacity
            key={`suggested-${index}`}
            style={styles.cinemaItem}
            onPress={() => handleCinemaPress(item)}
          >
            <View style={styles.cinemaNameContainer}>
              <Text style={styles.cinemaName}>{formatCinemaName(item.name)}</Text>
            </View>
            <View style={styles.cinemaInfo}>
              {item.favorite && (
                <Ionicons name="heart" size={20} color="black" />
              )}
              <Text style={styles.distance}>
                {item.distance === 'N/A' ? 'Không có khoảng cách' : `${item.distance} km`}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>KHU VỰC MTB</Text>
        </View>
        {areas.map((area, index) => (
          <View key={`area-${index}`}>
            <TouchableOpacity
              style={styles.areaItem}
              onPress={() => toggleExpand(index)}
            >
              <View style={styles.areaNameContainer}>
                <Text style={styles.areaName}>{area.name}</Text>
              </View>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={expanded[index] ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="black"
                />
                <Text style={styles.areaCount}>{area.count}</Text>
              </View>
            </TouchableOpacity>
            {expanded[index] && (
              <View style={styles.subList}>
                {area.cinemas.map((cinema, idx) => (
                  <TouchableOpacity
                    key={`sub-${idx}`}
                    style={[
                      styles.subItemContainer,
                      idx !== area.cinemas.length - 1 && styles.subItemBorder,
                    ]}
                    onPress={() => handleCinemaPress(cinema)}
                  >
                    <View style={styles.subItemNameContainer}>
                      <Text style={styles.subItem}>{formatCinemaName(cinema.name)}</Text>
                    </View>
                    <Text style={styles.subItemDistance}>
                      {cinema.distance === 'N/A' ? 'Không có khoảng cách' : `${cinema.distance} km`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.scrollToTopButton}
          onPress={scrollToTop}
        >
          <Ionicons name="arrow-up-circle" size={40} color="#ccc" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    position: "absolute",
    top: -11,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginLeft: -110,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: { marginRight: 10 },
  warningContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
    alignItems: 'center',
    marginTop: 60,
  },
  warningText: {
    color: '#c62828',
    fontSize: 14,
  },
  scrollContent: {
    flex: 1,
    marginTop: 60,
  },
  sectionHeader: { backgroundColor: "#E6C36A", padding: 10, marginTop: 10 },
  sectionHeaderText: { fontWeight: "bold" },
  cinemaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cinemaNameContainer: {
    flex: 1,
    flexShrink: 1,
  },
  cinemaName: {
    fontSize: 16,
    color: "red",
    flexWrap: "wrap",
  },
  cinemaInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  distance: {
    fontSize: 14,
    color: "red",
    marginLeft: 10,
    flexWrap: "wrap",
  },
  areaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  areaNameContainer: {
    flex: 1,
    flexShrink: 1,
  },
  areaName: {
    fontSize: 16,
    flexWrap: "wrap",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  areaCount: {
    fontSize: 16,
    marginLeft: 5,
  },
  subList: {
    paddingLeft: 20,
    paddingTop: 5,
  },
  subItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  subItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  subItemNameContainer: {
    flex: 1,
    flexShrink: 1,
  },
  subItem: {
    fontSize: 14,
    color: "gray",
    flexWrap: "wrap",
  },
  subItemDistance: {
    fontSize: 14,
    color: "gray",
    marginLeft: 10,
    flexWrap: "wrap",
  },
  scrollToTopButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
});