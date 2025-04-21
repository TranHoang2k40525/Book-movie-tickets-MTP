import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBookings, getBookingById, checkExpiredBookings } from '../../Api/api';
import { UserContext } from '../../contexts/User/UserContext';
import  Menu from '../../components/Menu';
const VeCuaToi = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('morning');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchBookings();
    // Kiểm tra vé sắp hết hạn mỗi khi màn hình được hiển thị
    checkExpiringBookings();
  }, []);

  const checkExpiringBookings = async () => {
    try {
      const response = await checkExpiredBookings();
      // Backend sẽ tự động gửi thông báo nếu có vé sắp hết hạn
    } catch (error) {
      console.error('Lỗi khi kiểm tra vé sắp hết hạn:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách vé:', error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách vé. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleBookingPress = async (bookingId) => {
    try {
      setLoading(true);
      const response = await getBookingById(bookingId);
      setSelectedBooking(response.booking);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chi tiết vé:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin chi tiết vé. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const renderBookingCard = ({ item }) => {
    // Kiểm tra vé đã xem hay sắp xem dựa trên ngày chiếu và ngày hiện tại
    const isUpcoming = new Date(item.MovieDateTime) > new Date();
    
    // Chỉ hiển thị vé phù hợp với tab đang chọn
    if ((activeTab === 'morning' && !isUpcoming) || (activeTab === 'afternoon' && isUpcoming)) {
      return null;
    }
    
    return (
      <TouchableOpacity 
        style={styles.bookingCard}
        onPress={() => handleBookingPress(item.BookingID)}
      >
        <Image 
          source={{ uri: item.MovieImageUrl || 'https://via.placeholder.com/150' }} 
          style={styles.moviePoster} 
        />
        <View style={styles.bookingInfo}>
          <Text style={styles.movieTitle}>{item.MovieTitle}</Text>
          <Text style={styles.bookingDetail}>Ngày chiếu: {new Date(item.MovieDateTime).toLocaleDateString('vi-VN')}</Text>
          <Text style={styles.bookingDetail}>Giờ chiếu: {new Date(item.MovieDateTime).toLocaleTimeString('vi-VN')}</Text>
          <Text style={styles.bookingDetail}>Rạp: {item.CinemaName}</Text>
          <Text style={styles.bookingDetail}>Phòng: {item.RoomName}</Text>
          <Text style={styles.bookingDetail}>Ghế: {item.SeatNumbers}</Text>
          <View style={[
            styles.statusBadge, 
            {backgroundColor: item.Status === 'Confirmed' ? '#4CAF50' : item.Status === 'Expired' ? '#F44336' : '#FFC107'}
          ]}>
            <Text style={styles.statusText}>{
              item.Status === 'Confirmed' ? 'Đã xác nhận' : 
              item.Status === 'Pending' ? 'Đang chờ' : 
              item.Status === 'Expired' ? 'Đã hết hạn' : item.Status
            }</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBookingDetail = () => {
    if (!selectedBooking) return null;
    
    return (
      <View style={styles.detailOverlay}>
        <View style={styles.detailContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedBooking(null)}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          
          <Image 
            source={{ uri: selectedBooking.MovieImageUrl || 'https://via.placeholder.com/150' }} 
            style={styles.detailPoster} 
          />
          
          <Text style={styles.detailTitle}>{selectedBooking.MovieTitle}</Text>
          <Text style={styles.detailDescription}>{selectedBooking.MovieDescription}</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời lượng:</Text>
            <Text style={styles.detailValue}>{selectedBooking.MovieRuntime} phút</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày chiếu:</Text>
            <Text style={styles.detailValue}>{new Date(selectedBooking.MovieDateTime).toLocaleDateString('vi-VN')}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giờ chiếu:</Text>
            <Text style={styles.detailValue}>{new Date(selectedBooking.MovieDateTime).toLocaleTimeString('vi-VN')}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rạp:</Text>
            <Text style={styles.detailValue}>{selectedBooking.CinemaName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Địa chỉ:</Text>
            <Text style={styles.detailValue}>{selectedBooking.CinemaAddress}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phòng:</Text>
            <Text style={styles.detailValue}>{selectedBooking.RoomName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ghế:</Text>
            <Text style={styles.detailValue}>{selectedBooking.SeatNumbers}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giá vé:</Text>
            <Text style={styles.detailValue}>{selectedBooking.TicketPrice.toLocaleString('vi-VN')} VNĐ</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Người đặt:</Text>
            <Text style={styles.detailValue}>{selectedBooking.CustomerName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trạng thái:</Text>
            <View style={[
              styles.statusBadge, 
              {backgroundColor: selectedBooking.Status === 'Confirmed' ? '#4CAF50' : selectedBooking.Status === 'Expired' ? '#F44336' : '#FFC107'}
            ]}>
              <Text style={styles.statusText}>{
                selectedBooking.Status === 'Confirmed' ? 'Đã xác nhận' : 
                selectedBooking.Status === 'Pending' ? 'Đang chờ' : 
                selectedBooking.Status === 'Expired' ? 'Đã hết hạn' : selectedBooking.Status
              }</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="red" />
          <Text>Đang tải dữ liệu...</Text>
        </View>
      );
    }

    if (bookings.length === 0) {
      return (
        <View style={styles.content}>
          <Image
            source={require('../../assets/douong/Anh4.jpeg')}
            style={styles.logoImage}
            resizeMode="cover"
          />
          <Text style={styles.noDataText}>Không có vé</Text>
          <Text style={styles.instructionText}>Bạn chưa đặt vé nào. Hãy đặt vé để xem phim bạn yêu thích!</Text>
          <TouchableOpacity 
            style={styles.bookNowButton}
            onPress={() => navigation.navigate('Datvetheophim')}
          >
            <Text style={styles.bookNowText}>Đặt vé ngay</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.BookingID.toString()}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.bookingList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.title}>Vé của tôi</Text>
        <TouchableOpacity>
          <Menu navigation={navigation}/>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('morning')}>
          <Text style={[styles.tab, activeTab === 'morning' && styles.activeTab]}>
            Phim đã xem
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('afternoon')}>
          <Text style={[styles.tab, activeTab === 'afternoon' && styles.activeTab]}>
            Phim sắp xem
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
      {selectedBooking && renderBookingDetail()}

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Lịch sử quầy online</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    marginLeft: -190,
    color: 'red',
    fontSize: 18,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  tab: {
    marginLeft: 30,
    padding: 10,
    fontSize: 16,
  },
  activeTab: {
    marginLeft: 30,
    color: 'red',
    borderBottomWidth: 2,
    borderBottomColor: 'red',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeText: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  noDataText: {
    color: 'black',
    fontSize: 16,
    marginTop: 10,
  },
  logoImage: {
    width: 100, 
    height: 100,
    marginTop: 10,
  },
  button: {
    backgroundColor: 'red',
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  bookingList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  moviePoster: {
    width: 100,
    height: 150,
    resizeMode: 'cover',
  },
  bookingInfo: {
    flex: 1,
    padding: 10,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bookingDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 5,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContainer: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '90%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  detailPoster: {
    width: 150,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 15,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  detailDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  instructionText: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bookNowButton: {
    backgroundColor: 'red',
    padding: 15,
    alignItems: 'center',
  },
  bookNowText: {
    color: 'white',
    fontSize: 16,
  },
});

export default VeCuaToi;