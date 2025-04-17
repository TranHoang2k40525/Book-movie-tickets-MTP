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
import { getCities, getCinemas } from '../../Api/api'; // Import API functions

export default function ChonPhimTheoRap({ navigation }) {
  const scrollViewRef = useRef();
  const { user } = useContext(UserContext);
  const [expandedRegions, setExpandedRegions] = useState({});
  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra người dùng ngay khi vào màn hình
  useEffect(() => {
    if (!user) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Xin vui lòng đăng nhập để sử dụng dịch vụ',
        [
          {
            text: 'Hủy',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Xác nhận',
            onPress: () => navigation.navigate('Login', { from: 'ChonPhimTheoRap' }),
            style: 'default',
          },
        ],
        { cancelable: false }
      );
    } else {
      fetchData();
    }
  }, [user, navigation]);

  // Lấy dữ liệu từ API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy danh sách thành phố
      const citiesResponse = await getCities();
      setCities(citiesResponse.data.cities);

      // Lấy danh sách rạp chiếu phim
      const cinemasResponse = await getCinemas();
      setCinemas(cinemasResponse.data.cinemas);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };


  const suggestedCinemas = cinemas.slice(0, 5).map(cinema => ({
    id: cinema.CinemaID,
    name: cinema.CinemaName,
    distance: cinema.CityAddress ? `${(Math.random() * 10).toFixed(2)}Km` : null,
    isFavorite: cinema.CinemaID === 1, // Ví dụ: rạp đầu tiên là yêu thích
  }));

  // Tạo danh sách khu vực (thành phố) và rạp con
  const regions = cities.map(city => ({
    id: city.CityID,
    name: city.CityName,
    count: cinemas.filter(cinema => cinema.CityID === city.CityID).length,
    subRegions: cinemas
      .filter(cinema => cinema.CityID === city.CityID)
      .map(cinema => ({
        id: cinema.CinemaID,
        name: cinema.CinemaName,
        distance: cinema.CityAddress ? `${(Math.random() * 10).toFixed(2)}Km` : null,
      })),
  }));

  // Chuyển đổi tên rạp để giống với ảnh (thêm "CGV" vào trước tên rạp)
  const formatCinemaName = (name) => ` ${name}`;

  // Mở rộng/thu gọn khu vực
  const toggleRegion = (id) => {
    setExpandedRegions(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Cuộn lên đầu
  const scrollToTop = () => {
    scrollViewRef.current.scrollTo({ y: 0, animated: true });
  };


  // Xử lý khi nhấn vào rạp con
  const handleCinemaPress = (cinema) => {
    navigation.navigate('ChonRap_TheoKhuVuc', {
      cinemaId: cinema.id,
      cinemaName: formatCinemaName(cinema.name),
    });
  };

  // Xử lý khi đang loading hoặc có lỗi
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Có lỗi xảy ra: {error}</Text>
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

      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Suggested Cinemas Section */}
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
            {cinema.isFavorite ? (
              <TouchableOpacity>
                <Text style={styles.favoriteIcon}>❤️</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.distanceText}>{cinema.distance}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Regions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>KHU VỰC MTP</Text>
        </View>

        {regions.map(region => (
          <View key={region.id}>
            <TouchableOpacity
              style={styles.regionItem}
              onPress={() => toggleRegion(region.id)}
            >
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

            {/* SubRegions - will show when expanded */}
            {expandedRegions[region.id] &&
              region.subRegions.map(subRegion => (
                <TouchableOpacity
                  key={subRegion.id}
                  style={styles.subRegionItem}
                  onPress={() => handleCinemaPress(subRegion)}
                >
                  <Text style={styles.subRegionName}>{formatCinemaName(subRegion.name)}</Text>
                  {subRegion.distance && (
                    <Text style={styles.distanceText}>{subRegion.distance}</Text>
                  )}
                </TouchableOpacity>
              ))}
          </View>
        ))}

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.scrollToTopButton}
            onPress={scrollToTop}
          >
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
    paddingVertical: 0,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 28,
    color: '#8B0000',
    marginLeft: -200,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginLeft: -170,
  },
  headerRightButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 16,
  },
  headerButtonText: {
    fontSize: 20,
    color: '#8B0000',
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 1,
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
  },
  favoriteIcon: {
    fontSize: 20,
  },
  distanceText: {
    fontSize: 16,
    color: '#8B0000',
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
  expandIcon: {
    fontSize: 14,
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
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  scrollToTopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  scrollToTopButtonText: {
    fontSize: 20,
    color: '#666',
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