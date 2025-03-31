import React from 'react';
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

// Main App Component
export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E74C3C" />
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <Header />
      </View>
      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>SWEETBOX</Text>
          <Text style={styles.subtitle}>Sweet Time</Text>
          <Image source={require('./assets/Anh1.png')} style={styles.promoImage} />
        </View>
        <PromoSection />
        <LocationsList />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

// Header Component (chỉ chứa phần cố định)
function Header() {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#E74C3C" />
            <Text style={styles.backText}>
              Rạp phim <Text style={styles.mtbText}>MTB</Text>
            </Text>
          </TouchableOpacity>
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

// PromoSection Component
function PromoSection() {
  return (
    <View style={styles.promoContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.descriptionText}>
          Vui lòng lưu ý không mang đồ ăn hoặc thức uống từ bên ngoài vào rạp. MTB cho phép lựa chọn ghế đặc biệt dành riêng cho các cặp đôi yêu nhau, đánh dấu bằng biểu tượng ghế SWEETBOX ngọt ngào.
        </Text>
        <Text style={styles.moreInfoText}>
          Bạn sẽ tìm thấy ghế SWEETBOX trong hầu hết các phòng chiếu tại hệ thống rạp SWEETBOX. Đặc biệt hơn, bạn có thể nhận biết rạp SWEETBOX với.{' '}
          <Text style={styles.seeMoreLink}>Xem thêm</Text>
        </Text>
      </View>
    </View>
  );
}

// LocationsList Component (giữ nguyên)
function LocationsList() {
  const locations = [
    { id: '1', name: 'Reson Canary', distance: '1,286m' },
    { id: '2', name: 'Vincom Center Bà Triệu', distance: '1,286m' },
    { id: '3', name: 'Trương Định Plaza', distance: '1,286m' },
    { id: '4', name: 'Sun Grand Lương Yên', distance: '1,286m' },
    { id: '5', name: 'Tràng Tiền Plaza', distance: '1,286m' },
    { id: '6', name: 'Vincom Times City', distance: '1,296m' },
  ];

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
        data={locations}
        renderItem={renderLocation}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// Footer Component (giữ nguyên)
function Footer() {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerContent}>
        <Text style={styles.footerTitle}>Tin mới & Ưu đãi</Text>
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

// Styles
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
    marginTop: 60, // Khoảng cách để tránh đè lên fixed header
  },
  headerContainer: {
    marginTop:15,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 5,
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
  // Các style còn lại giữ nguyên
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
  moreInfoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    textAlign: 'justify',
  },
  seeMoreLink: {
    color: '#E74C3C',
    textDecorationLine: 'underline',
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
    color: '#999',
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
});