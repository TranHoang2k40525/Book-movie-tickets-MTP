import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  StatusBar,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getCinemas } from './api';

export default function SweetBox({ navigation }) {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getCinemas();
        const allCinemas = response.data.cinemas;
        const sweetboxCinemas = allCinemas.map(cinema => ({
          id: cinema.CinemaID.toString(),
          name: cinema.CinemaName,
          distance: `${(Math.random() * 10).toFixed(2)}Km`,
        }));
        setCinemas(sweetboxCinemas);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách rạp:', err);
        setError(err.message || 'Không thể lấy dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Có lỗi xảy ra: {error}</Text>
        <TouchableOpacity onPress={() => fetchCinemas()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E74C3C" />
      <View style={styles.fixedHeader}>
        <Header navigation={navigation} />
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>SWEETBOX</Text>
          <Text style={styles.subtitle}>Sweet Time</Text>
          <Image style={styles.promoImage} />
        </View>
        <PromoSection expanded={expanded} setExpanded={setExpanded} />
        <LocationsList cinemas={cinemas} />
        <Footer navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ navigation }) {
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#E74C3C" />
          </TouchableOpacity>
          <Text style={styles.backText}>
            Rạp phim <Text style={styles.mtbText}>MTB</Text>
          </Text>
        </View>
        <View style={styles.iconSection}>
          <TouchableOpacity style={styles.headerIcon}>
            <Feather name="send" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Feather name="menu" size={24} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function PromoSection({ expanded, setExpanded }) {
  const fullDescription = "Vui lòng lưu ý không mang đồ ăn hoặc thức uống từ bên ngoài vào rạp. MTB cho phép lựa chọn ghế đặc biệt dành riêng cho các cặp đôi yêu nhau, đánh dấu bằng biểu tượng ghế SWEETBOX ngọt ngào. Bạn sẽ tìm thấy ghế SWEETBOX trong hầu hết các phòng chiếu tại hệ thống rạp SWEETBOX. Đặc biệt hơn, bạn có thể nhận biết rạp SWEETBOX với logo đặc trưng màu đỏ và trắng.";
  const shortDescription = "Vui lòng lưu ý không mang đồ ăn hoặc thức uống từ bên ngoài vào rạp. MTB cho phép lựa chọn ghế đặc biệt dành riêng cho các cặp đôi yêu nhau, đánh dấu bằng biểu tượng ghế SWEETBOX ngọt ngào.";

  return (
    <View style={styles.promoContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.descriptionText}>
          {expanded ? fullDescription : shortDescription}
        </Text>
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.seeMoreLink}>
            {expanded ? 'Thu gọn' : 'Xem thêm'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LocationsList({ cinemas }) {
  const renderLocation = ({ item }) => (
    <TouchableOpacity style={styles.locationItem}>
      <View style={styles.locationInfo}>
        <Text style={styles.locationPrefix}>MTB</Text>
        <Text style={styles.locationName}>{item.name}</Text>
      </View>
      <Text style={styles.distance}>{item.distance}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.locationsContainer}>
      <FlatList
        data={cinemas}
        renderItem={renderLocation}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

function Footer({ navigation }) {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerContent}>
        <TouchableOpacity onPress={() => navigation.navigate('TinMoiVaUuDai')}>
          <Text style={styles.footerTitle}>Tin mới & Ưu đãi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.allButton}>
          <Text style={styles.allButtonText}>Tất cả</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>TÌM VÉ & ĐẶT VÉ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  scrollView: {
    flex: 1,
    marginTop: 60,
  },
  headerContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 5,
  },
  backText: {
    fontSize: 16,
    color: '#000',
  },
  mtbText: {
    color: '#E74C3C',
    fontSize: 16,
  },
  iconSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 20,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  promoImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  promoContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0CC6A',
  },
  textContainer: {
    padding: 15,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 10,
    textAlign: 'justify',
  },
  seeMoreLink: {
    color: '#E74C3C',
    textDecorationLine: 'underline',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  locationsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0CC6A',
    borderBottomWidth: 1,
    borderBottomColor: '#F0CC6A',
    backgroundColor: '#FFF',
  },
  listContent: {
    backgroundColor: '#FFF',
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPrefix: {
    color: '#E74C3C',
    fontWeight: 'bold',
    fontSize: 14,
    width: 35,
  },
  locationName: {
    color: '#666',
    fontSize: 14,
  },
  distance: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: '300',
  },
  footerContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#ECECEC',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  allButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
  },
  allButtonText: {
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
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