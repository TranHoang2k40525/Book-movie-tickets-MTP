import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Icon from "react-native-vector-icons/FontAwesome";
import { getProducts } from '../../Api/api';
import Menu from '../../components/Menu';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Đối ứng ảnh dự phòng cho từng loại sản phẩm khi không có hình ảnh từ API
const getFallbackImage = (productName) => {
  const name = productName.toLowerCase();
  if (name.includes('premium')) return require('../../assets/douong/Anh3.jpeg');
  if (name.includes('kakao')) return require('../../assets/douong/Anh7.jpeg');
  if (name.includes('snake')) return require('../../assets/douong/Anh11.jpeg');
  if (name.includes('family')) return require('../../assets/douong/Anh6.jpeg');
  if (name.includes('combo')) return require('../../assets/douong/Anh3.jpeg');
  return require('../../assets/douong/Anh3.jpeg'); // Mặc định
};

export default function DatVeThanhToan({ navigation, route }) {
  // Lấy thông tin từ màn hình trước
  const { 
    selectedSeats = [], 
    totalPrice: seatTotalPrice = 0, 
    showId, 
    cinemaId, 
    cinemaName, 
    showDate, 
    showTime, 
    movieTitle, 
    movieId 
  } = route.params || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Tổng tiền ban đầu từ ghế
  const [totalPrice, setTotalPrice] = useState(seatTotalPrice);

  // Kiểm tra người dùng đã đăng nhập chưa
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        setIsLoggedIn(true);
      } else {
        // Nếu không có token, nghĩa là người dùng chưa đăng nhập
        setIsLoggedIn(false);
        // Thông báo và chuyển người dùng đến trang đăng nhập
        Alert.alert(
          "Yêu cầu đăng nhập",
          "Bạn cần đăng nhập để đặt vé và thanh toán",
          [
            {
              text: "Đăng nhập ngay",
              onPress: () => navigation.navigate('Login', { 
                returnScreen: 'DatVeThanhToan', 
                returnParams: route.params 
              })
            },
            {
              text: "Quay lại",
              onPress: () => navigation.goBack(),
              style: "cancel"
            }
          ]
        );
      }
    } catch (error) {
      console.error('Lỗi kiểm tra trạng thái đăng nhập:', error);
      setIsLoggedIn(false);
    }
  };

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Đang lấy danh sách sản phẩm...");
      
      // Sử dụng hàm getProducts từ api.js
      const productsData = await getProducts();
      
      console.log("Số lượng sản phẩm nhận được:", productsData.length);
      
      // Đảm bảo mỗi sản phẩm có đủ thông tin
      const formattedProducts = productsData.map(product => ({
        ...product,
        ProductID: product.ProductID,
        ProductName: product.ProductName || 'Sản phẩm không tên',
        ProductDescription: product.ProductDescription || 'Không có mô tả',
        ProductPrice: product.ProductPrice || 0,
        // Ưu tiên sử dụng ImageUrl từ API, nếu không có thì dùng ImageProduct
        ImageSource: product.ImageUrl || product.ImageProduct || null,
        Notes: product.Notes || [
          'Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết'
        ]
      }));
      
      setProducts(formattedProducts);
      
      // Khởi tạo quantities với các sản phẩm từ API
      const initialQuantities = {};
      formattedProducts.forEach(product => {
        initialQuantities[product.ProductID] = 0;
      });
      setQuantities(initialQuantities);
      
      setLoading(false);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', err);
      
      // Sử dụng dữ liệu mẫu khi gặp lỗi mạng
      console.log("Sử dụng dữ liệu mẫu do lỗi mạng");
      
      setError('Không thể kết nối đến máy chủ. Đang sử dụng dữ liệu ngoại tuyến.');
      setLoading(false);
    }
  };

  // Update total price when quantities change
  useEffect(() => {
    let comboTotal = 0;
    
    // Calculate total price for all products
    if (products.length > 0) {
      Object.keys(quantities).forEach(productId => {
        const product = products.find(p => p.ProductID.toString() === productId.toString());
        if (product) {
          comboTotal += quantities[productId] * product.ProductPrice;
        }
      });
    }
    
    // Set total price (base ticket price + combo total)
    setTotalPrice(seatTotalPrice + comboTotal);
  }, [quantities, seatTotalPrice, products]);

  const updateQuantity = (productId, change) => {
    setQuantities(prev => {
      const prevValue = prev[productId] || 0;
      const newValue = Math.max(0, prevValue + change);
      return { ...prev, [productId]: newValue };
    });
  };

  // Format price with comma separators
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Hàm xử lý hiển thị hình ảnh của sản phẩm
  const renderProductImage = (product) => {
    // Nếu có đường dẫn hình ảnh từ API
    if (product.ImageSource && typeof product.ImageSource === 'string') {
      return (
        <Image 
          source={{ uri: product.ImageSource }}
          style={styles.comboImage} 
          resizeMode="contain"
          defaultSource={getFallbackImage(product.ProductName)}
          onError={(e) => console.log("Lỗi tải ảnh:", e.nativeEvent.error)}
        />
      );
    }
    
    // Nếu không có đường dẫn, sử dụng ảnh mặc định dựa trên tên sản phẩm
    return (
      <Image 
        source={getFallbackImage(product.ProductName)}
        style={styles.comboImage} 
        resizeMode="contain"
      />
    );
  };

  // Xử lý nút thanh toán
  const handlePayment = async () => {
    try {
      // Kiểm tra lại xác thực người dùng trước khi thanh toán
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        // Nếu không có token, yêu cầu đăng nhập
        Alert.alert(
          "Yêu cầu đăng nhập",
          "Bạn cần đăng nhập để đặt vé và thanh toán",
          [
            {
              text: "Đăng nhập ngay",
              onPress: () => navigation.navigate('Login', { 
                returnScreen: 'DatVeThanhToan', 
                returnParams: route.params 
              })
            },
            {
              text: "Hủy",
              style: "cancel"
            }
          ]
        );
        return;
      }

      // Tạo mảng các sản phẩm đã chọn
      const selectedProducts = Object.keys(quantities)
        .filter(productId => quantities[productId] > 0)
        .map(productId => {
          const product = products.find(p => p.ProductID.toString() === productId.toString());
          return {
            ...product,
            quantity: quantities[productId],
            subtotal: product.ProductPrice * quantities[productId]
          };
        });
      
      // Điều hướng đến màn hình thanh toán
      navigation.navigate('ChiTietThanhToan', {
        selectedSeats,
        seatTotalPrice,
        totalPrice,
        selectedProducts,
        showId, 
        cinemaId, 
        cinemaName, 
        showDate, 
        showTime, 
        movieTitle, 
        movieId
      });
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại sau.");
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e71a0f" />
        <Text style={styles.loadingText}>Đang tải danh sách sản phẩm...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: "#fff" }}>
              <Icon name="arrow-left" size={24} color="#fff" /> Quay lại
            </Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{cinemaName || 'MTB Cinema'}</Text>
            <Text style={styles.headerSubtitle}>{showDate} {showTime}</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Menu navigation={navigation} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Image 
          source={require('../../assets/douong/Anh2.jpeg')} 
          style={styles.popcornIcon} 
          resizeMode="contain"
        />
        <Text style={styles.bannerText}>
          Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết.
        </Text>
      </View>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Thông báo đăng nhập nếu chưa đăng nhập */}
      {!isLoggedIn && (
        <View style={styles.loginRequiredBanner}>
          <Text style={styles.loginRequiredText}>
            Bạn cần đăng nhập để đặt vé và thanh toán
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login', { 
              returnScreen: 'DatVeThanhToan', 
              returnParams: route.params 
            })}
          >
            <Text style={styles.loginButtonText}>ĐĂNG NHẬP NGAY</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Thêm phần hiển thị thông tin ghế đã chọn */}
      <View style={styles.selectedSeatsInfo}>
        <Text style={styles.selectedSeatsTitle}>Ghế đã chọn:</Text>
        <Text style={styles.selectedSeatsText}>
          {selectedSeats.map(seat => seat.seatNumber).join(', ')}
        </Text>
        <Text style={styles.selectedSeatsPrice}>
          Tổng tiền vé: {formatPrice(seatTotalPrice)} đ
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Render sản phẩm từ API hoặc dữ liệu mẫu */}
        {products.map(product => (
          <View key={product.ProductID} style={styles.comboItem}>
            <View style={styles.comboImageContainer}>
              {renderProductImage(product)}
            </View>
            <View style={styles.comboDetails}>
              <Text style={styles.comboTitle}>{product.ProductName} - {formatPrice(product.ProductPrice)} đ</Text>
              <Text style={styles.comboDescription}>{product.ProductDescription}</Text>
              
              {/* Hiển thị các ghi chú */}
              {product.Notes && product.Notes.map((note, index) => (
                <Text key={index} style={styles.comboNote}>- {note}</Text>
              ))}
              
              <View style={styles.quantitySelector}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(product.ProductID, -1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityText}>{quantities[product.ProductID] || 0}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(product.ProductID, 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Tổng giá tiền và nút thanh toán */}
      <View style={styles.footer}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPriceLabel}>Tổng tiền:</Text>
          <Text style={styles.totalPriceValue}>{formatPrice(totalPrice)} đ</Text>
        </View>
        <TouchableOpacity 
          style={[styles.paymentButton, !isLoggedIn && styles.paymentButtonDisabled]}
          disabled={!isLoggedIn}
          onPress={handlePayment}
        >
          <Text style={styles.paymentButtonText}>
            {isLoggedIn ? "THANH TOÁN" : "CẦN ĐĂNG NHẬP ĐỂ THANH TOÁN"}
          </Text>
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
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  errorBanner: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#e71a0f',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#e71a0f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#222',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  menuButton: {
    padding: 8,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  popcornIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  bannerText: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
  },
  selectedSeatsInfo: {
    padding: 10,
    backgroundColor: '#222',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedSeatsTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedSeatsText: {
    color: '#e71a0f',
    fontSize: 14,
    marginVertical: 5,
  },
  selectedSeatsPrice: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  comboItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  comboImageContainer: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  comboImage: {
    width: '100%',
    height: '100%',
  },
  comboDetails: {
    flex: 1,
  },
  comboTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  comboDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  comboNote: {
    color: '#999',
    fontSize: 12,
    marginBottom: 3,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityDisplay: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityText: {
    color: '#fff',
    fontSize: 16,
  },
  footer: {
    backgroundColor: '#222',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  totalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalPriceLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPriceValue: {
    color: '#e71a0f',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentButton: {
    backgroundColor: '#e71a0f',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginRequiredBanner: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 5,
    margin: 10,
    alignItems: 'center',
  },
  loginRequiredText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#e71a0f',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
});
