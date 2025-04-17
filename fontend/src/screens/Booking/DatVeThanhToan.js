import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getProducts, holdSeats } from '../../Api/api';

export default function DatVeThanhToan() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    selectedSeats,
    totalPrice: totalTicketPrice,
    showId,
    cinemaId,
    cinemaName,
    showDate,
    showTime,
    movieTitle,
    movieId,
    moviePoster,
    movieLanguage,
  } = route.params;

  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [totalComboPrice, setTotalComboPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60); // Đếm ngược 60 giây
  const [expirationTime, setExpirationTime] = useState(null);
  const [holdingSeats, setHoldingSeats] = useState(false);

  // Xử lý đếm ngược thời gian
  useEffect(() => {
    let interval;
    
    if (expirationTime) {
      const updateCountdown = () => {
        const now = new Date();
        const expiry = new Date(expirationTime);
        const diffInSeconds = Math.max(0, Math.floor((expiry - now) / 1000));
        
        setTimeRemaining(diffInSeconds);
        
        // Nếu hết thời gian, quay về màn hình chọn ghế
        if (diffInSeconds === 0) {
          clearInterval(interval);
          Alert.alert(
            'Hết thời gian đặt vé',
            'Thời gian giữ ghế đã hết. Vui lòng chọn ghế lại.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      };
      
      // Cập nhật ngay lập tức lần đầu
      updateCountdown();
      
      // Cập nhật mỗi giây
      interval = setInterval(updateCountdown, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [expirationTime, navigation]);

  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setHoldingSeats(true);

      // Kiểm tra selectedSeats
      console.log('selectedSeats:', selectedSeats);
      console.log('showId:', showId);

      // Kiểm tra kỹ selectedSeats
      if (!selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
        throw new Error('Không có ghế nào được chọn');
      }

      const seatIds = selectedSeats.map(seat => {
        if (!seat || !seat.seatId) {
          throw new Error('Một hoặc nhiều ghế không hợp lệ');
        }
        return seat.seatId;
      });
      console.log('seatIds:', seatIds);

      if (!showId || isNaN(showId)) {
        throw new Error('Suất chiếu không hợp lệ');
      }

      // Gọi API holdSeats
      const holdResponse = await holdSeats(showId, seatIds);
      console.log('Hold response:', holdResponse);
      
      // Lưu thời gian hết hạn
      if (holdResponse && holdResponse.expirationTime) {
        setExpirationTime(holdResponse.expirationTime);
      }
      
      // Lấy danh sách sản phẩm
      const productData = await getProducts();
      setProducts(productData);

      // Khởi tạo quantities
      const initialQuantities = {};
      productData.forEach(product => {
        initialQuantities[product.ProductID] = 0;
      });
      setQuantities(initialQuantities);
      setHoldingSeats(false);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu hoặc đặt ghế');
      console.error('Error in initializeData:', err);
      
      // Nếu lỗi liên quan đến ghế đã có người đặt, hiển thị thông báo và quay lại
      if (err.response?.data?.unavailableSeats) {
        const unavailableSeats = err.response.data.unavailableSeats;
        Alert.alert(
          'Ghế đã có người đặt',
          `Ghế ${unavailableSeats.join(', ')} đã được người khác đặt. Vui lòng quay lại chọn ghế khác.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } finally {
      setLoading(false);
    }
  }, [selectedSeats, showId, navigation]);

  // Lấy danh sách sản phẩm và đặt ghế tạm thời
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Cập nhật tổng giá combo
  useEffect(() => {
    const comboTotal = Object.keys(quantities).reduce((sum, productId) => {
      const product = products.find(p => p.ProductID === parseInt(productId));
      return sum + (product ? quantities[productId] * product.ProductPrice : 0);
    }, 0);
    setTotalComboPrice(comboTotal);
  }, [quantities, products]);

  const updateQuantity = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, prev[productId] + change),
    }));
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const proceedToFinalPayment = () => {
    const selectedProducts = Object.keys(quantities)
      .filter(productId => quantities[productId] > 0)
      .map(productId => ({
        productId: parseInt(productId),
        quantity: quantities[productId],
        price: products.find(p => p.ProductID === parseInt(productId)).ProductPrice,
      }));

    navigation.navigate('FinalPayment', {
      selectedSeats,
      totalTicketPrice,
      selectedProducts,
      totalComboPrice,
      totalPrice: totalTicketPrice + totalComboPrice,
      showId,
      cinemaId,
      cinemaName,
      showDate,
      showTime,
      movieTitle,
      movieId,
      moviePoster,
      movieLanguage,
      expirationTime, // Truyền thời gian hết hạn
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
        <Text style={styles.loadingText}>
          {holdingSeats ? 'Đang giữ ghế cho bạn...' : 'Đang tải dữ liệu...'}
        </Text>
      </View>
    );
  }

  if (error && !expirationTime) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => initializeData()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Thanh thời gian còn lại */}
      <View style={styles.timerContainer}>
        <Ionicons name="time-outline" size={20} color="#fff" />
        <Text style={styles.timerText}>
          Thời gian còn lại: {formatTime(timeRemaining)}
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{cinemaName}</Text>
            <Text style={styles.headerSubtitle}>
              {`${showDate} ${showTime}`}
            </Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <FontAwesome name="bars" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Thông tin vé */}
      <View style={styles.ticketInfo}>
        <Text style={styles.movieTitle}>{movieTitle}</Text>
        <Text style={styles.movieDetails}>Ngôn ngữ: {movieLanguage}</Text>
        <Text style={styles.ticketDetails}>
          Ghế: {selectedSeats.map(seat => seat.seatNumber).join(', ')}
        </Text>
        <Text style={styles.ticketPrice}>
          Giá vé: {formatPrice(totalTicketPrice)} đ
        </Text>
      </View>

      {/* Danh sách combo */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Combo Đồ Uống</Text>
        </View>

        {products.map(product => (
          <View key={product.ProductID} style={styles.comboItem}>
            <View style={styles.comboImageContainer}>
              <Image
                source={{
                  uri: product.ImageProduct
                    ? `data:image/jpeg;base64,${product.ImageProduct}`
                    : 'https://via.placeholder.com/100',
                }}
                style={styles.comboImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.comboDetails}>
              <Text style={styles.comboTitle}>
                {product.ProductName} - {formatPrice(product.ProductPrice)} đ
              </Text>
              <Text style={styles.comboDescription}>
                {product.ProductDescription}
              </Text>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Số lượng:</Text>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(product.ProductID, -1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>
                    {quantities[product.ProductID]}
                  </Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(product.ProductID, 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer thanh toán */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalPrice}>{formatPrice(totalTicketPrice + totalComboPrice)} đ</Text>
        </View>
        <TouchableOpacity style={styles.payButton} onPress={proceedToFinalPayment}>
          <Text style={styles.payButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 20,
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#ff4d6d',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ff4d6d',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#141414',
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#bbb',
    fontSize: 12,
  },
  menuButton: {
    padding: 5,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c62828',
    paddingVertical: 5,
  },
  timerText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  ticketInfo: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  movieTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  movieDetails: {
    color: '#666',
    fontSize: 14,
    marginVertical: 2,
  },
  ticketDetails: {
    color: '#666',
    fontSize: 14,
    marginVertical: 2,
  },
  ticketPrice: {
    color: '#a81e1e',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sectionTitleText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  comboItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  comboImageContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  comboImage: {
    width: 80,
    height: 80,
  },
  comboDetails: {
    flex: 1,
  },
  comboTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  comboDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityLabel: {
    color: '#333',
    fontSize: 14,
    marginRight: 10,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: '#a81e1e',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    color: '#333',
    fontSize: 16,
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPrice: {
    color: '#a81e1e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#a81e1e',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});