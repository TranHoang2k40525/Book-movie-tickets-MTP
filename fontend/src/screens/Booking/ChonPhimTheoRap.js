import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from '../../contexts/User/UserContext';
import Menu from "../../components/Menu";
import { getCities, getCinemas } from '../../Api/api';
import * as Location from 'expo-location';

// Tính khoảng cách bằng công thức Haversine
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

export default function ChonPhimTheoRap({ navigation }) {
  const scrollViewRef = useRef();
  const { user } = useContext(UserContext);
  const [expandedRegions, setExpandedRegions] = useState({});
  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Lấy vị trí người dùng từ định vị
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Không được cấp quyền truy cập vị trí. Danh sách rạp sẽ hiển thị nhưng không có khoảng cách.');
        console.log('Quyền vị trí bị từ chối');
        return false;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const userLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      setUserLocation(userLoc);
      console.log('Vị trí người dùng:', userLoc);
      return true;
    } catch (err) {
      setError('Lỗi khi lấy vị trí người dùng: ' + err.message + '. Danh sách rạp sẽ hiển thị nhưng không có khoảng cách.');
      console.log('Lỗi lấy vị trí:', err);
      return false;
    }
  };

  // Lấy dữ liệu từ API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const citiesResponse = await getCities();
      setCities(citiesResponse.data.cities);
      console.log('Dữ liệu thành phố:', citiesResponse.data.cities);

      const cinemasResponse = await getCinemas();
      setCinemas(cinemasResponse.data.cinemas);
      console.log('Dữ liệu rạp:', cinemasResponse.data.cinemas);
    } catch (err) {
      setError('Không thể tải dữ liệu từ server: ' + err.message);
      console.error('Lỗi khi lấy dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra đăng nhập và lấy dữ liệu
  useEffect(() => {
    if (!user) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập để sử dụng dịch vụ',
        [
          { text: 'Hủy', style: 'cancel', onPress: () => navigation.goBack() },
          {
            text: 'Xác nhận',
            onPress: () => navigation.navigate('Login', { from: 'ChonPhimTheoRap' }),
            style: 'default',
          },
        ],
        { cancelable: false }
      );
    } else {
      getUserLocation().then(() => fetchData());
    }
  }, [user, navigation]);

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

  // Chuẩn bị danh sách rạp gợi ý
  const suggestedCinemas = cinemas
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
    }))
    .sort((a, b) => {
      if (a.distance === 'N/A' && b.distance === 'N/A') return 0;
      if (a.distance === 'N/A') return 1;
      if (b.distance === 'N/A') return -1;
      return parseFloat(a.distance) - parseFloat(b.distance);
    })
    .slice(0, 5);

  // Chuẩn bị danh sách khu vực
  const regions = cities.map(city => ({
    id: city.CityID,
    name: city.CityName,
    count: cinemas.filter(cinema => cinema.CityID === city.CityID).length,
    subRegions: cinemas
      .filter(cinema => cinema.CityID === city.CityID)
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
      }))
      .sort((a, b) => {
        if (a.distance === 'N/A' && b.distance === 'N/A') return 0;
        if (a.distance === 'N/A') return 1;
        if (b.distance === 'N/A') return -1;
        return parseFloat(a.distance) - parseFloat(b.distance);
      }),
  }));

  // Định dạng tên rạp
  const formatCinemaName = (name) => ` ${name}`;

  // Mở rộng/thu gọn khu vực
  const toggleRegion = (id) => {
    setExpandedRegions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Cuộn lên đầu
  const scrollToTop = () => {
    scrollViewRef.current.scrollTo({ y: 0, animated: true });
  };

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

  // Trạng thái đang tải
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // Trạng thái lỗi
  if (error && cinemas.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text>Có lỗi: {error}</Text>
        <TouchableOpacity onPress={() => getUserLocation().then(fetchData)} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Kiểm tra dữ liệu rạp
  const validCinemas = cinemas.filter(cinema => isValidCoordinate(cinema.Latitude, cinema.Longitude));
  if (cinemas.length === 0 || validCinemas.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text>Không tìm thấy rạp phim với tọa độ hợp lệ. Vui lòng kiểm tra dữ liệu trong bảng Cinemas (SQL Server).</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn rạp</Text>
        <View style={styles.headerRightButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="location-sharp" size={24} color="red" style={styles.locationIcon} />
          </TouchableOpacity>
          <Menu navigation={navigation} />
        </View>
      </View>

      {/* Thông báo nếu không có vị trí */}
      {error && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>{error}</Text>
        </View>
      )}

      {/* Nội dung chính */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Phần rạp gợi ý */}
        {suggestedCinemas.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>GỢI Ý CHO BẠN</Text>
            </View>
            {suggestedCinemas.map(cinema => (
              <TouchableOpacity
                key={cinema.id}
                style={styles.cinemaItem}
                onPress={() => handleCinemaPress(cinema)}
              >
                <Text style={styles.cinemaName}>{formatCinemaName(cinema.name)}</Text>
                <Text style={styles.distanceText}>
                  {cinema.distance === 'N/A' ? 'Không có khoảng cách' : `${cinema.distance} km`}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Phần khu vực */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>KHU VỰC</Text>
        </View>
        {regions.map(region => (
          <View key={region.id}>
            <TouchableOpacity style={styles.regionItem} onPress={() => toggleRegion(region.id)}>
              <Text style={styles.regionName}>{region.name}</Text>
              <View style={styles.regionCountContainer}>
                <Text style={styles.regionCount}>{region.count}</Text>
                <Ionicons
                  name={expandedRegions[region.id] ? 'chevron-down' : 'chevron-forward'}
                  size={14}
                  color="#666"
                />
              </View>
            </TouchableOpacity>
            {expandedRegions[region.id] &&
              region.subRegions.map(subRegion => (
                <TouchableOpacity
                  key={subRegion.id}
                  style={styles.subRegionItem}
                  onPress={() => handleCinemaPress(subRegion)}
                >
                  <Text style={styles.subRegionName}>{formatCinemaName(subRegion.name)}</Text>
                  <Text style={styles.distanceText}>
                    {subRegion.distance === 'N/A' ? 'Không có khoảng cách' : `${subRegion.distance} km`}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        ))}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.scrollToTopButton} onPress={scrollToTop}>
            <Ionicons name="arrow-up" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginLeft: -120,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  locationIcon: {
    marginRight: 8,
  },
  warningContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
    alignItems: 'center',
  },
  warningText: {
    color: '#c62828',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cinemaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cinemaName: {
    fontSize: 16,
    color: '#8B0000',
    flex: 1,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
  },
  regionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  regionName: {
    fontSize: 16,
    color: '#333',
  },
  regionCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regionCount: {
    fontSize: 16,
    marginRight: 8,
    color: '#666',
  },
  subRegionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  subRegionName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  scrollToTopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#ff4d6d',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});