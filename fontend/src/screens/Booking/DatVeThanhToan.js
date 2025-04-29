import React, { useState, useEffect } from "react";
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
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProducts, cancelBooking } from "../../Api/api";
import Menu from "../../components/Menu";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getFallbackImage = (productName) => {
  const name = productName.toLowerCase();
  if (name.includes("premium")) return require("../../assets/douong/Anh3.jpeg");
  if (name.includes("kakao")) return require("../../assets/douong/Anh7.jpeg");
  if (name.includes("snake")) return require("../../assets/douong/Anh11.jpeg");
  if (name.includes("family")) return require("../../assets/douong/Anh6.jpeg");
  if (name.includes("combo")) return require("../../assets/douong/Anh3.jpeg");
  return require("../../assets/douong/Anh3.jpeg");
};

export default function DatVeThanhToan({ navigation, route }) {
  const {
    bookingId,
    expirationTime,
    selectedSeats = [],
    totalPrice: seatTotalPrice = 0,
    showId,
    cinemaId,
    cinemaName,
    showDate,
    showTime,
    movieTitle,
    movieId,
    ImageUrl,
    moviePoster,
    MovieLanguage,
    fromScreen, // Thêm tham số nguồn gốc
  } = route.params || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [totalPrice, setTotalPrice] = useState(seatTotalPrice);
  const [countdown, setCountdown] = useState(0);

  // Thêm state isCancelling
  const [isCancelling, setIsCancelling] = useState(false);
  useEffect(() => {
    checkAuthStatus();
    fetchProducts();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiration = new Date(expirationTime).getTime();
      const diff = Math.floor((expiration - now) / 1000);
      return diff > 0 ? diff : 0;
    };

    setCountdown(updateCountdown());
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleCancelBooking();
          Alert.alert("Hết thời gian", "Thời gian giữ ghế đã hết.", [
            {
              text: "OK",
              onPress: () => {
                if (fromScreen === 'MovieBookingScreen') {
                  navigation.navigate('MovieBookingScreen', { movieId });
                } else if (fromScreen === 'ChonRap_TheoKhuVuc') {
                  navigation.navigate('ChonRap_TheoKhuVuc', { cinemaId, cinemaName });
                } else {
                  navigation.navigate("SoDoGheNgoi1", { showId });
                }
              },
            },
          ]);
          return 0;
        }
        return updateCountdown();
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expirationTime, navigation, showId, fromScreen, ImageUrl, movieId, cinemaId, cinemaName]);

  // Xử lý sự kiện quay lại
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Hủy giao dịch',
        'Bạn có muốn hủy quá trình đặt vé không? Ghế đã giữ sẽ được giải phóng.',
        [
          {
            text: 'Hủy',
            onPress: () => {
              handleCancelBooking();
              if (fromScreen === 'MovieBookingScreen') {
                navigation.navigate('MovieBookingScreen', { movieId });
              } else if (fromScreen === 'ChonRap_TheoKhuVuc') {
                navigation.navigate('ChonRap_TheoKhuVuc', { cinemaId, cinemaName });
              } else {
                navigation.goBack();
              }
            },
            style: 'cancel',
          },
          { text: 'Tiếp tục', style: 'cancel' },
        ],
        { cancelable: false }
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation, bookingId, fromScreen, movieId, cinemaId, cinemaName]);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        setIsLoggedIn(true);
      } else {
        Alert.alert(
          "Yêu cầu đăng nhập",
          "Bạn cần đăng nhập để đặt vé và thanh toán",
          [
            {
              text: "Đăng nhập ngay",
              onPress: () =>
                navigation.navigate("Login", {
                  returnScreen: "DatVeThanhToan",
                  returnParams: route.params,
                }),
            },
            { text: "Quay lại", onPress: () => navigation.goBack(), style: "cancel" },
          ]
        );
      }
    } catch (error) {
      console.error("Lỗi kiểm tra trạng thái đăng nhập:", error);
      setIsLoggedIn(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      const formattedProducts = productsData.map((product) => ({
        ...product,
        ProductID: product.ProductID,
        ProductName: product.ProductName || "Sản phẩm không tên",
        ProductDescription: product.ProductDescription || "Không có mô tả",
        ProductPrice: product.ProductPrice || 0,
        ImageSource: product.ImageUrl || null,
        Notes: product.Notes || [
          "Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết",
          "Nhận hàng trong ngày xem phim (khi mua cùng vé)",
        ],
      }));
      setProducts(formattedProducts);
      const initialQuantities = {};
      formattedProducts.forEach((product) => (initialQuantities[product.ProductID] = 0));
      setQuantities(initialQuantities);
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm:", err);
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật handleCancelBooking
  const handleCancelBooking = async () => {
    if (!bookingId || isCancelling) return;
    setIsCancelling(true);
    try {
      await cancelBooking(bookingId);
      console.log("Đã hủy đặt vé:", bookingId);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể hủy đặt vé';
      console.error("Lỗi khi hủy đặt vé:", error);
      if (errorMessage === 'Đặt vé đã được hủy trước đó') {
        console.log('Giao dịch đã được hủy trước đó, bỏ qua.');
      } else {
        Alert.alert('Lỗi', errorMessage);
      }
    } finally {
      setIsCancelling(false);
    }
  };
  // Thêm handleGoBack
  const handleGoBack = () => {
    if (isCancelling) return;
    Alert.alert(
      'Hủy giao dịch',
      'Bạn có muốn hủy quá trình đặt vé không? Ghế đã giữ sẽ được giải phóng.',
      [
        {
          text: 'Hủy',
          onPress: async () => {
            await handleCancelBooking();
            if (fromScreen === 'MovieBookingScreen') {
              navigation.navigate('MovieBookingScreen', { movieId });
            } else if (fromScreen === 'ChonRap_TheoKhuVuc') {
              navigation.navigate('ChonRap_TheoKhuVuc', { cinemaId, cinemaName });
            } else {
              navigation.goBack();
            }
          },
          style: 'destructive',
        },
        { text: 'Tiếp tục', style: 'cancel' },
      ],
      { cancelable: false }
    );
  };

  // Cập nhật BackHandler
  useEffect(() => {
    const backAction = () => {
      handleGoBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [handleGoBack, isCancelling]);

  const updateQuantity = (productId, change) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change),
    }));
  };

  const formatPrice = (price) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const renderProductImage = (product) => {
    if (product.ImageSource && typeof product.ImageSource === "string") {
      return (
        <Image
          source={{ uri: product.ImageSource }}
          style={styles.comboImage}
          resizeMode="contain"
          defaultSource={getFallbackImage(product.ProductName)}
        />
      );
    }
    return (
      <Image
        source={getFallbackImage(product.ProductName)}
        style={styles.comboImage}
        resizeMode="contain"
      />
    );
  };

  const handlePayment = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để tiếp tục thanh toán",
        [
          {
            text: "Đăng nhập ngay",
            onPress: () =>
              navigation.navigate("Login", {
                returnScreen: "DatVeThanhToan",
                returnParams: route.params,
              }),
          },
          { text: "Đóng", style: "cancel" },
        ]
      );
      return;
    }

    try {
      const productsToProcess = Object.keys(quantities)
        .filter((productId) => quantities[productId] > 0)
        .map((productId) => {
          const product = products.find((p) => p.ProductID.toString() === productId);
          return {
            productId: product.ProductID,
            quantity: quantities[productId],
            price: product.ProductPrice,
          };
        });

      navigation.navigate("ThanhToan", {
        bookingId,
        expirationTime,
        selectedSeats,
        selectedProducts: productsToProcess,
        totalPrice,
        showId,
        cinemaId,
        cinemaName,
        showDate,
        showTime,
        movieTitle,
        ImageUrl,
        movieId,
        moviePoster,
        MovieLanguage,
        fromScreen, // Truyền tham số nguồn gốc
      });
    } catch (error) {
      console.error("Lỗi khi chuyển sang trang thanh toán:", error);
      Alert.alert("Lỗi", "Không thể chuyển sang trang thanh toán. Vui lòng thử lại.");
    }
  };

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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            disabled={isCancelling}
          >
            <Ionicons name="arrow-back" size={24} color={isCancelling ? 'grey' : '#fff'} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{cinemaName || "MTB Cinema"}</Text>
            <Text style={styles.headerSubtitle}>
              {showDate} {showTime}
            </Text>
          </View>
          <Menu navigation={navigation} />
        </View>
      </View>

      <View style={styles.banner}>
        <Image
          source={require("../../assets/douong/Anh2.jpeg")}
          style={styles.popcornIcon}
          resizeMode="contain"
        />
        <Text style={styles.bannerText}>
          Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ,
          Tết.
        </Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.selectedSeatsInfo}>
        <Text style={styles.selectedSeatsTitle}>
          Ghế đã chọn: {selectedSeats.map((seat) => seat.seatNumber).join(", ") || "Chưa chọn ghế"}
        </Text>
        <Text style={styles.selectedSeatsPrice}>Tổng tiền vé: {formatPrice(seatTotalPrice)} đ</Text>
        <Text style={styles.countdownText}>
          Thời gian còn lại: {Math.floor(countdown / 60)}:
          {(countdown % 60).toString().padStart(2, "0")}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {products.map((product) => (
          <View key={product.ProductID} style={styles.comboItem}>
            <View style={styles.comboImageContainer}>{renderProductImage(product)}</View>
            <View style={styles.comboDetails}>
              <Text style={styles.comboTitle}>
                {product.ProductName} - {formatPrice(product.ProductPrice)} đ
              </Text>
              <Text style={styles.comboDescription}>{product.ProductDescription}</Text>
              {product.Notes &&
                product.Notes.map((note, index) => (
                  <Text key={index} style={styles.comboNote}>
                    - {note}
                  </Text>
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
          <Text style={styles.paymentButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
  },
  errorBanner: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  errorText: {
    color: "#e71a0f",
    fontSize: 14,
    textAlign: "center",
  },
  header: {
    backgroundColor: "#222",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  popcornIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  bannerText: {
    flex: 1,
    color: "#fff",
    fontSize: 12,
  },
  selectedSeatsInfo: {
    padding: 10,
    backgroundColor: "#222",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  selectedSeatsTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  selectedSeatsPrice: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 5,
  },
  countdownText: {
    color: "#e71a0f",
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  comboItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  comboImageContainer: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  comboImage: {
    width: "100%",
    height: "100%",
  },
  comboDetails: {
    flex: 1,
  },
  comboTitle: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  comboDescription: {
    color: "#666",
    fontSize: 14,
    marginBottom: 5,
  },
  comboNote: {
    color: "#666",
    fontSize: 12,
    marginBottom: 3,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e71a0f",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityDisplay: {
    width: 40,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  quantityText: {
    color: "#000",
    fontSize: 16,
  },
  footer: {
    backgroundColor: "#222",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  totalPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  totalPriceLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalPriceValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  paymentButton: {
    backgroundColor: "#e71a0f",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  paymentButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.7,
  },
});