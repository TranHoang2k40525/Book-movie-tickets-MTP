<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Icon from "react-native-vector-icons/FontAwesome";
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

  const [quantities, setQuantities] = useState({
    premium: 0,
    jujutsuSingle: 0,
    jujutsuSet: 0,
    myCombo: 0,
    kakaoFriends: 0,
    kakaoFriendsSet: 0,
    cgvCombo: 0,
    familyCombo: 0,
    demonSlayerCombo: 0,
    studentCombo: 0,
    popcornLover: 0,
    birthdaySpecial: 0,
  });
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  // Add prices for each combo
  const prices = {
    premium: 135000,
    jujutsuSingle: 299000,
    jujutsuSet: 1099000,
    myCombo: 95000,
    kakaoFriends: 229000,
    kakaoFriendsSet: 499000,
    cgvCombo: 125000,
    familyCombo: 249000,
    demonSlayerCombo: 279000,
    studentCombo: 79000,
    popcornLover: 105000,
    birthdaySpecial: 189000,
  };

  // Sử dụng giá vé từ màn hình trước
  const [totalPrice, setTotalPrice] = useState(seatTotalPrice);

  // Update total price when quantities change
  useEffect(() => {
    let comboTotal = 0;
    
    // Calculate total price for all combos
    Object.keys(quantities).forEach(combo => {
      comboTotal += quantities[combo] * prices[combo];
    });
    
    // Set total price (base ticket price + combo total)
    setTotalPrice(seatTotalPrice + comboTotal);
  }, [quantities, seatTotalPrice]);

  const updateQuantity = (combo, change) => {
    setQuantities(prev => {
      const newValue = Math.max(0, prev[combo] + change);
      return { ...prev, [combo]: newValue };
    });
  };

  // Format price with comma separators
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => navigation.goBack()}
                    >
                      <Text style={{ color: "#fff" }}>
                        <Icon name="arrow-left" size={24} color="#fff" /> Quay lại
                      </Text>
                    </TouchableOpacity>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{cinemaName || 'MTB Cinema'}</Text>
            <Text style={styles.headerSubtitle}>{showDate} {showTime}</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <FontAwesome name="bars" size={24} color="#888" />
=======
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
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
          </TouchableOpacity>
        </View>
      </View>

<<<<<<< HEAD
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
        {/* Premium CGV Combo */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('../../assets/douong/Anh3.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>PREMIUM MTB COMBO - 135.000 đ</Text>
            <Text style={styles.comboDescription}>1 Bắp Ngọt Lớn + 2 Nước Siêu Lớn + 1 Snack</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <Text style={styles.comboNote}>- Nhận hàng trong ngày xem phim (khi mua cùng vé)</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('premium', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.premium}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('premium', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* CGV COMBO */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('../../assets/douong/Anh3.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>MTB COMBO - 125.000 đ</Text>
            <Text style={styles.comboDescription}>1 Bắp Ngọt Lớn + 2 Nước Siêu Lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <Text style={styles.comboNote}>- Nhận hàng trong ngày xem phim (khi mua cùng vé)</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('cgvCombo', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.cgvCombo}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('cgvCombo', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Family Combo - New */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('../../assets/douong/Anh3.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>FAMILY COMBO - 249.000 đ</Text>
            <Text style={styles.comboDescription}>2 Bắp Ngọt Lớn + 4 Nước Siêu Lớn + 2 Snack</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <Text style={styles.comboNote}>- Nhận hàng trong ngày xem phim (khi mua cùng vé)</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('familyCombo', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.familyCombo}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('familyCombo', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Jujutsu Kaisen Single Combo */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('../../assets/douong/Anh11.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>JUJUTSU KAISEN SINGLE COMBO - 299.000 đ</Text>
            <Text style={styles.comboDescription}>01 ly nhân vật Jujutsu Kaisen + 01 nước ngọt lớn + 01 bắp ngọt lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('jujutsuSingle', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.jujutsuSingle}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('jujutsuSingle', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Demon Slayer Combo - New */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('../../assets/douong/Anh1.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>DEMON SLAYER COMBO - 279.000 đ</Text>
            <Text style={styles.comboDescription}>01 ly nhân vật Demon Slayer + 01 nước ngọt lớn + 01 bắp ngọt lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('demonSlayerCombo', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.demonSlayerCombo}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('demonSlayerCombo', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Jujutsu Kaisen Set Combo */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('../../assets/douong/Anh5.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>JUJUTSU KAISEN SET COMBO - 1.099.000 đ</Text>
            <Text style={styles.comboDescription}>Bộ 04 ly nhân vật Jujutsu Kaisen + 02 nước ngọt siêu lớn + 01 bắp ngọt lớn</Text>
            <Text style={styles.comboNote}>- Combo sẽ mặc định 04 mẫu ly nhân vật khác nhau, không được chọn trùng mẫu ly nhân vật</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('jujutsuSet', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.jujutsuSet}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('jujutsuSet', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Student Combo - New */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('../../assets/douong/Anh7.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>STUDENT COMBO - 79.000 đ</Text>
            <Text style={styles.comboDescription}>1 Bắp Ngọt Vừa + 1 Nước Lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng cho học sinh, sinh viên có thẻ hợp lệ</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('studentCombo', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.studentCombo}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('studentCombo', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* My Combo */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('../../assets/douong/Anh6.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>MY COMBO - 95.000 đ</Text>
            <Text style={styles.comboDescription}>1 Bắp Ngọt Lớn + 1 Nước Siêu Lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <Text style={styles.comboNote}>- Nhận hàng trong ngày xem phim (khi mua cùng vé)</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('myCombo', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.myCombo}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('myCombo', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Popcorn Lover - New */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('../../assets/douong/Anh6.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>POPCORN LOVER - 105.000 đ</Text>
            <Text style={styles.comboDescription}>2 Bắp Ngọt Lớn + 1 Nước Siêu Lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <Text style={styles.comboNote}>- Nhận hàng trong ngày xem phim (khi mua cùng vé)</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('popcornLover', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.popcornLover}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('popcornLover', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Kakao Friends Single Combo */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('../../assets/douong/Anh7.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>KAKAO FRIENDS 2024 SINGLE COMBO - 229.000 đ</Text>
            <Text style={styles.comboDescription}>01 ly thiết kế nhân vật Kakao kèm nước - Thêm 01 bắp ngọt lớn với 29.000VND</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('kakaoFriends', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.kakaoFriends}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('kakaoFriends', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Kakao Friends Set Combo */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('../../assets/douong/Anh6.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>KAKAO FRIEND 2024 SET - 499.000 đ</Text>
            <Text style={styles.comboDescription}>03 ly nhân vật Kakao Friend + 02 nước ngọt siêu lớn</Text>
            <Text style={styles.comboNote}>- Thêm 29.000đ nhận ngay 01 bắp ngọt lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('kakaoFriendsSet', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.kakaoFriendsSet}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('kakaoFriendsSet', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Birthday Special - New */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('../../assets/douong/Anh7.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>BIRTHDAY SPECIAL - 189.000 đ</Text>
            <Text style={styles.comboDescription}>1 Bắp Ngọt Lớn + 2 Nước Siêu Lớn + 1 Bánh Kem Mini</Text>
            <Text style={styles.comboNote}>- Đặt trước ít nhất 24 giờ</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('birthdaySpecial', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.birthdaySpecial}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('birthdaySpecial', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle}>
            {movieTitle} <View style={styles.ratingTag}><Text style={styles.ratingText}>T13</Text></View>
          </Text>
          <Text style={styles.movieDetails}>2D Phụ Đề Việt</Text>
          <Text style={styles.ticketPrice}>{formatPrice(totalPrice)} đ  {selectedSeats.length} ghế</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>THANH TOÁN</Text>
=======
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
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
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
<<<<<<< HEAD
  header: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
=======
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
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
=======
    justifyContent: 'space-between',
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
<<<<<<< HEAD
    paddingLeft: 10,
  },
  headerTitle: {
    color: '#a81e1e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#888',
    fontSize: 14,
=======
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
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
  },
  menuButton: {
    padding: 5,
  },
<<<<<<< HEAD
  banner: {
    backgroundColor: '#f35151',
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  popcornIcon: {
    width: 56,
    height: 56,
    marginRight: 10,
  },
  bannerText: {
    color: 'white',
    flex: 1,
    fontSize: 14,
=======
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
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
  },
  scrollView: {
    flex: 1,
  },
<<<<<<< HEAD
=======
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
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
  comboItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
<<<<<<< HEAD
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  comboImageContainer: {
    width: 100,
    height: 100,
    alignItems: 'flex-start',
=======
    borderBottomColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  comboImageContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
    justifyContent: 'center',
    marginRight: 15,
  },
  comboImage: {
<<<<<<< HEAD
    marginLeft: -10,
    width: 120,
    height: 140,
=======
    width: 80,
    height: 80,
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
  },
  comboDetails: {
    flex: 1,
  },
  comboTitle: {
<<<<<<< HEAD
    color: 'white',
=======
    color: '#333',
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  comboDescription: {
<<<<<<< HEAD
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
    marginTop: 10,
    alignSelf: 'flex-start',
=======
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
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
  },
  quantityButton: {
    width: 30,
    height: 30,
<<<<<<< HEAD
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 18,
  },
  quantityDisplay: {
    width: 40,
    height: 30,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  quantityText: {
    color: 'white',
    fontSize: 16,
=======
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
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
<<<<<<< HEAD
    borderTopColor: '#333',
    alignItems: 'center',
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingTag: {
    backgroundColor: '#ffd700',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 5,
  },
  ratingText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  movieDetails: {
    color: '#ccc',
    fontSize: 14,
  },
  ticketPrice: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkoutButton: {
=======
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
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
    backgroundColor: '#a81e1e',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
<<<<<<< HEAD
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedSeatsInfo: {
    backgroundColor: '#222',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedSeatsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedSeatsText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  selectedSeatsPrice: {
    color: '#ff4d6d',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
=======
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
