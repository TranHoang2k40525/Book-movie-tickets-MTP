import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBookings, getBookingById } from '../../Api/api';
import { UserContext } from '../../contexts/User/UserContext';
import Menu from '../../components/Menu';

const VeCuaToi = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('tickets'); // Chỉ giữ 1 tab 'tickets'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [noBookingsMessage, setNoBookingsMessage] = useState('Bạn không có vé');
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching bookings...');
      const response = await getBookings();
      setBookings(response.bookings || []);
      if (response.bookings.length === 0) {
        setNoBookingsMessage(response.message || 'Bạn không có vé');
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách vé:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setBookings([]);
      setNoBookingsMessage('Bạn không có vé');
      Alert.alert('Lỗi', 'Không thể tải danh sách vé. Vui lòng thử lại sau.');
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
      console.log(`Fetching booking details for BookingID: ${bookingId}`);
      const response = await getBookingById(bookingId);
      if (!response.success) {
        throw new Error(response.message || 'Không thể lấy chi tiết vé');
      }
      setSelectedBooking(response.booking);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chi tiết vé:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      Alert.alert('Lỗi', error.message || 'Không thể lấy thông tin chi tiết vé. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const renderBookingCard = ({ item }) => {
    const isUpcoming = new Date(item.Show?.ShowDate) > new Date();
    
    // Hiển thị tất cả vé, không phân biệt tab nữa
    const holdUntil = item.HoldUntil ? new Date(item.HoldUntil).toLocaleString('vi-VN') : 'N/A';

    return (
      <TouchableOpacity 
        style={styles.bookingCard}
        onPress={() => handleBookingPress(item.BookingID)}
      >
        <View style={styles.bookingInfo}>
          <Text style={styles.movieTitle}>{item.Movie?.Title || 'Không có thông tin'}</Text>
          <Text style={styles.bookingDetail}>Ngày chiếu: {new Date(item.Show?.ShowDate).toLocaleDateString('vi-VN')}</Text>
          <Text style={styles.bookingDetail}>Giờ chiếu: {item.Show?.ShowTime || 'N/A'}</Text>
          <Text style={styles.bookingDetail}>Rạp: {item.CinemaHall?.CinemaName || 'Không có thông tin'}</Text>
          <Text style={styles.bookingDetail}>Phòng: {item.CinemaHall?.HallName || 'Không có thông tin'}</Text>
          <Text style={styles.bookingDetail}>Ghế: {item.BookingSeats?.map(seat => seat.SeatNumber).join(', ') || 'Không có thông tin'}</Text>
          <Text style={styles.bookingDetail}>Giá vé: {item.Payment?.Amount?.toLocaleString('vi-VN') || 'N/A'} VNĐ</Text>
          <Text style={styles.bookingDetail}>Hết hạn: {holdUntil}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.Status === 'Confirmed' ? '#4CAF50' : item.Status === 'Expired' ? '#F44336' : '#FFC107' }
          ]}>
            <Text style={styles.statusText}>
              {item.Status === 'Confirmed' ? 'Đã xác nhận' : 
               item.Status === 'Pending' ? 'Đang chờ' : 
               item.Status === 'Expired' ? 'Đã hết hạn' : item.Status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBookingDetail = () => {
    if (!selectedBooking) return null;
    
    const holdUntil = selectedBooking.HoldUntil ? new Date(selectedBooking.HoldUntil).toLocaleString('vi-VN') : 'N/A';

    return (
      <View style={styles.detailOverlay}>
        <View style={styles.detailContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedBooking(null)}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          
          <Text style={styles.detailTitle}>{selectedBooking.Movie?.Title || 'Không có thông tin'}</Text>
          <Text style={styles.detailDescription}>{selectedBooking.Movie?.Description || 'Không có mô tả'}</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời lượng:</Text>
            <Text style={styles.detailValue}>{selectedBooking.Movie?.Runtime || 'N/A'} phút</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày chiếu:</Text>
            <Text style={styles.detailValue}>{new Date(selectedBooking.Show?.ShowDate).toLocaleDateString('vi-VN')}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giờ chiếu:</Text>
            <Text style={styles.detailValue}>{selectedBooking.Show?.ShowTime || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rạp:</Text>
            <Text style={styles.detailValue}>{selectedBooking.CinemaHall?.CinemaName || 'Không có thông tin'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Địa chỉ:</Text>
            <Text style={styles.detailValue}>{selectedBooking.CinemaHall?.CinemaAddress || 'Không có thông tin'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phòng:</Text>
            <Text style={styles.detailValue}>{selectedBooking.CinemaHall?.HallName || 'Không có thông tin'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ghế:</Text>
            <Text style={styles.detailValue}>{selectedBooking.BookingSeats?.map(seat => seat.SeatNumber).join(', ') || 'Không có thông tin'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giá vé:</Text>
            <Text style={styles.detailValue}>{selectedBooking.Payment?.Amount?.toLocaleString('vi-VN') || 'N/A'} VNĐ</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Người đặt:</Text>
            <Text style={styles.detailValue}>{selectedBooking.Customer?.CustomerName || 'Không có thông tin'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{selectedBooking.Customer?.CustomerEmail || 'Không có thông tin'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hết hạn:</Text>
            <Text style={styles.detailValue}>{holdUntil}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trạng thái:</Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: selectedBooking.Status === 'Confirmed' ? '#4CAF50' : selectedBooking.Status === 'Expired' ? '#F44336' : '#FFC107' }
            ]}>
              <Text style={styles.statusText}>
                {selectedBooking.Status === 'Confirmed' ? 'Đã xác nhận' : 
                 selectedBooking.Status === 'Pending' ? 'Đang chờ' : 
                 selectedBooking.Status === 'Expired' ? 'Đã hết hạn' : selectedBooking.Status}
              </Text>
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
          <Text style={styles.noDataText}>{noBookingsMessage}</Text>
          <Text style={styles.instructionText}>Hãy đặt vé để xem phim bạn yêu thích!</Text>
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
          <Menu navigation={navigation} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('tickets')}>
          <Text style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}>
            Danh sách vé của tôi
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
      {selectedBooking && renderBookingDetail()}
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