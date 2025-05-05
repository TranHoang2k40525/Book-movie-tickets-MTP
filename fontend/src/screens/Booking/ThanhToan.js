import React, { useState, useEffect, useContext, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Modal,
  Alert,
  BackHandler,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getVouchers, useVoucher, getProducts, cancelBooking } from "../../Api/api";
import { UserContext } from "../../contexts/User/UserContext";

export default function ThanhToan({ navigation, route }) {
  const {
    bookingId,
    expirationTime,
    selectedSeats = [],
    selectedProducts = [],
    seatTotalPrice = 0,
    productTotal = 0,
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
    fromScreen,
  } = route.params || {};

  const { user, checkSession, refreshAccessToken } = useContext(UserContext);

  const [selectedPayment, setSelectedPayment] = useState("QR");
  const [termsChecked, setTermsChecked] = useState(false);
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [products, setProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [countdown, setCountdown] = useState(0);
  const [totalPrice, setTotalPrice] = useState(seatTotalPrice + productTotal);
  const [discount, setDiscount] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !user.customerID) {
          Alert.alert("Lỗi", "Vui lòng đăng nhập để tiếp tục.");
          navigation.navigate("Login");
          return;
        }

        const isSessionValid = await checkSession();
        if (!isSessionValid) {
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            Alert.alert("Lỗi", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            navigation.navigate("Login");
            return;
          }
        }

        try {
          const voucherResponse = await getVouchers();
          setVouchers(voucherResponse.vouchers || []);
        } catch (error) {
          setVouchers([]);
        }

        const productResponse = await getProducts();
        setProducts(productResponse || []);
        const initialQuantities = {};
        productResponse.forEach((product) => {
          const preSelected = selectedProducts.find(
            (p) => p.productId === product.ProductID
          );
          initialQuantities[product.ProductID] = preSelected ? preSelected.quantity : 0;
        });
        setProductQuantities(initialQuantities);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        Alert.alert("Lỗi", "Không thể tải dữ liệu từ server.");
      }
    };

    fetchData();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiration = new Date(expirationTime).getTime();
      const diff = Math.floor((expiration - now) / 1000);
      return diff > 0 ? diff : 0;
    };

    setCountdown(updateCountdown());
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0 && !isCancelled) {
          clearInterval(timerRef.current);
          handleCancelBooking().catch((error) => {
            console.error("Lỗi khi hủy tự động:", error);
          }).finally(() => {
            Alert.alert("Hết thời gian", "Thời gian giữ ghế đã hết.", [
              {
                text: "OK",
                onPress: () => {
                  if (fromScreen === "MovieBookingScreen") {
                    navigation.navigate("MovieBookingScreen", { movieId });
                  } else if (fromScreen === "ChonRap_TheoKhuVuc") {
                    navigation.navigate("ChonRap_TheoKhuVuc", { cinemaId, cinemaName });
                  } else {
                    navigation.navigate("SoDoGheNgoi1", { showId });
                  }
                },
              },
            ]);
          });
          return 0;
        }
        return updateCountdown();
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [
    expirationTime,
    navigation,
    showId,
    selectedProducts,
    user,
    checkSession,
    refreshAccessToken,
    ImageUrl,
    fromScreen,
    movieId,
    cinemaId,
    cinemaName,
    isCancelled,
  ]);

  useEffect(() => {
    const backAction = () => {
      handleGoBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [isCancelled]);

  const handleCancelBooking = async () => {
    if (!bookingId || isCancelled) return;
    setIsCancelled(true);
    clearInterval(timerRef.current);
    try {
      await cancelBooking(bookingId);
      console.log("Đã hủy đặt vé:", bookingId);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Không thể hủy đặt vé";
      console.error("Lỗi khi hủy đặt vé:", error);
      if (
        errorMessage === "Đặt vé đã được hủy trước đó" ||
        error.response?.status === 400 ||
        error.response?.status === 403 ||
        error.response?.status === 410
      ) {
        console.log(`Bỏ qua lỗi: ${errorMessage}`);
      } else {
        Alert.alert("Lỗi", errorMessage);
      }
    }
  };

  const handleGoBack = () => {
    if (isCancelled) return;
    Alert.alert(
      "Hủy giao dịch",
      "Bạn có muốn hủy quá trình đặt vé không? Ghế đã giữ sẽ được giải phóng.",
      [
        {
          text: "Tiếp tục",
          style: "cancel",
        },
        {
          text: "Hủy",
          onPress: async () => {
            await handleCancelBooking();
            if (fromScreen === "MovieBookingScreen") {
              navigation.navigate("MovieBookingScreen", { movieId });
            } else if (fromScreen === "ChonRap_TheoKhuVuc") {
              navigation.navigate("ChonRap_TheoKhuVuc", { cinemaId, cinemaName });
            } else {
              navigation.goBack();
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    let currentProductTotal = 0;
    products.forEach((product) => {
      const quantity = productQuantities[product.ProductID] || 0;
      currentProductTotal += quantity * product.ProductPrice;
    });

    const newDiscount = selectedVoucherId
      ? (vouchers.find((v) => v.VoucherID.toString() === selectedVoucherId.toString())?.DiscountValue || 0)
      : 0;

    setDiscount(newDiscount);
    setTotalPrice(Math.max(0, seatTotalPrice + currentProductTotal - newDiscount));
  }, [productQuantities, selectedVoucherId, products, vouchers, seatTotalPrice]);

  const handleAddProduct = (productId) => {
    if (isCancelled) return;
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const handleRemoveProduct = (productId, removeAll = false) => {
    if (isCancelled) return;
    setProductQuantities((prev) => {
      const newQuantities = { ...prev };
      if (removeAll) {
        newQuantities[productId] = 0;
      } else {
        newQuantities[productId] = Math.max(0, (prev[productId] || 0) - 1);
      }
      return newQuantities;
    });
  };

  const formatPrice = (price) =>
    price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "0";

  const handleApplyVoucher = async () => {
    if (isCancelled || !selectedVoucherId) return;
    try {
      await useVoucher(selectedVoucherId);
      setVoucherModalVisible(false);
      Alert.alert("Thành công", "Voucher đã được áp dụng!");
    } catch (error) {
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể áp dụng voucher.");
    }
  };

  const handleContinue = () => {
    if (isCancelled || !(selectedPayment === "QR" && termsChecked)) {
      Alert.alert(
        "Lỗi",
        "Vui lòng chọn phương thức thanh toán QR và đồng ý với điều khoản."
      );
      return;
    }

    clearInterval(timerRef.current);

    const updatedSelectedProducts = Object.keys(productQuantities)
      .filter((productId) => productQuantities[productId] > 0)
      .map((productId) => {
        const product = products.find((p) => p.ProductID.toString() === productId);
        return {
          productId: product.ProductID,
          quantity: productQuantities[productId],
          price: product.ProductPrice,
        };
      });

    navigation.navigate("ThanhToanQR", {
      bookingId,
      totalPrice,
      expirationTime,
      selectedSeats,
      selectedProducts: updatedSelectedProducts,
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
      selectedVoucherId,
      fromScreen,
    });
  };

  const renderComboItem = ({ item }) => (
    <View style={styles.comboItem}>
      <Image
        source={
          item.ImageUrl
            ? { uri: item.ImageUrl }
            : require("../../assets/images/giaohangchoma.jpg")
        }
        style={styles.comboImage}
        resizeMode="cover"
      />
      <View style={styles.comboDetails}>
        <Text style={styles.comboTitle}>{item.ProductName || "Không có tên"}</Text>
        <Text style={styles.comboPrice}>{formatPrice(item.ProductPrice)} đ</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddProduct(item.ProductID)}
        disabled={isCancelled}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSelectedComboItem = ({ item }) => {
    const product = products.find((p) => p.ProductID.toString() === item.productId.toString());
    if (!product || item.quantity === 0) return null;
    return (
      <View style={styles.selectedComboItem}>
        <Text style={styles.selectedComboName}>{product.ProductName}</Text>
        <Text style={styles.selectedComboPrice}>
          {formatPrice(product.ProductPrice * item.quantity)} đ
        </Text>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleRemoveProduct(product.ProductID)}
            disabled={isCancelled}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleAddProduct(product.ProductID)}
            disabled={isCancelled}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveProduct(product.ProductID, true)}
            disabled={isCancelled}
          >
            <Text style={styles.removeButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderVoucherItem = ({ item }) => {
    const code = item.Code || "Không có mã";
    const description = item.Description || "Không có mô tả";
    const endDate = item.EndDate ? new Date(item.EndDate).toLocaleDateString("vi-VN") : "Không xác định";

    return (
      <View style={[styles.couponCard, { flexDirection: "row", alignItems: "center" }]}>
        <Image
          source={
            item.ImageVoucher
              ? { uri: item.ImageVoucher }
              : require("../../assets/images/kedonghanh.png")
          }
          style={{ width: 60, height: 60, borderRadius: 8, marginRight: 15 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.couponCardTitle}>{code}</Text>
          <Text style={styles.couponCardId}>{description}</Text>
          <Text style={styles.couponCardExpiry}>HSD: {endDate}</Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: selectedVoucherId === item.VoucherID ? "#8e0000" : "#eee",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginLeft: 10,
          }}
          onPress={() => {
            if (isCancelled) return;
            setSelectedVoucherId(
              selectedVoucherId === item.VoucherID ? null : item.VoucherID
            );
          }}
          disabled={isCancelled}
        >
          <Text
            style={{
              color: selectedVoucherId === item.VoucherID ? "white" : "#8e0000",
              fontWeight: "bold",
            }}
          >
            {selectedVoucherId === item.VoucherID ? "Đã chọn" : "Chọn"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const selectedCombos = Object.keys(productQuantities)
    .filter((productId) => productQuantities[productId] > 0)
    .map((productId) => ({
      productId,
      quantity: productQuantities[productId],
    }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigationHeader}>
        <TouchableOpacity onPress={handleGoBack} disabled={isCancelled}>
          <Ionicons name="arrow-back" size={24} color={isCancelled ? "grey" : "#8e0000"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.movieInfoSection}>
          <View style={styles.movieCard}>
            <Image
              source={
                moviePoster
                  ? { uri: moviePoster }
                  : require("../../assets/images/giaohangchoma.jpg")
              }
              style={styles.moviePoster}
              resizeMode="cover"
            />
            <View style={styles.movieDetails}>
              <View style={styles.movieTitleContainer}>
                <Text style={styles.movieTitle}>{movieTitle || "Không có tiêu đề"}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>T13</Text>
                </View>
              </View>
              <Text style={styles.movieDescription}>
                T13 - Phim được phổ biến đến người xem từ ...
              </Text>
              <Text style={styles.movieDate}>{showDate || "Không xác định"}</Text>
              <Text style={styles.movieTime}>{showTime || "Không xác định"}</Text>
              <Text style={styles.movieLocation}>{cinemaName || "Không xác định"}</Text>
              <Text style={styles.movieSeats}>
                Ghế: {selectedSeats.map((s) => s.seatNumber).join(", ") || "Chưa chọn ghế"}
              </Text>
              <Text style={styles.totalPrice}>
                Tổng thanh toán: {formatPrice(totalPrice)} đ
              </Text>
              <Text style={styles.countdownText}>
                Thời gian còn lại: {Math.floor(countdown / 60)}:
                {(countdown % 60).toString().padStart(2, "0")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.quantitySection}>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Số lượng vé</Text>
            <Text style={styles.rowValue}>{selectedSeats.length}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Tổng giá vé</Text>
            <Text style={styles.rowValue}>{formatPrice(seatTotalPrice)} đ</Text>
          </View>
        </View>

        <View style={styles.comboSection}>
          <Text style={styles.sectionTitle}>Thêm combo/bắp nước:</Text>
          <FlatList
            data={products}
            renderItem={renderComboItem}
            keyExtractor={(item) => item.ProductID.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.comboListContainer}
          />
        </View>

        {selectedCombos.length > 0 && (
          <View style={styles.selectedCombosSection}>
            <Text style={styles.sectionTitle}>Combo đã chọn:</Text>
            {selectedCombos.map((item) => (
              <View key={item.productId}>{renderSelectedComboItem({ item })}</View>
            ))}
          </View>
        )}

        <View style={styles.discountSection}>
          <Text style={styles.sectionTitle}>PHƯƠNG THỨC GIẢM GIÁ</Text>
          <TouchableOpacity
            style={styles.discountItem}
            onPress={() => !isCancelled && setVoucherModalVisible(true)}
            disabled={isCancelled}
          >
            <Text style={styles.discountLabel}>MTB Voucher</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#777" />
          </TouchableOpacity>
          <View style={styles.separator} />
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>TỔNG KẾT</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Giá vé</Text>
            <Text style={styles.summaryValue}>{formatPrice(seatTotalPrice)} đ</Text>
          </View>
          {selectedCombos.map((combo) => {
            const product = products.find((p) => p.ProductID.toString() === combo.productId.toString());
            return product ? (
              <View key={combo.productId} style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{product.ProductName} (x{combo.quantity})</Text>
                <Text style={styles.summaryValue}>{formatPrice(product.ProductPrice * combo.quantity)} đ</Text>
              </View>
            ) : null;
          })}
          <View style={styles.separator} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tổng cộng bao gồm VAT</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(
                seatTotalPrice +
                  Object.keys(productQuantities).reduce(
                    (sum, productId) =>
                      sum +
                      (productQuantities[productId] || 0) *
                        (products.find((p) => p.ProductID.toString() === productId)?.ProductPrice || 0),
                    0
                  )
              )} đ
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Giảm giá</Text>
            <Text style={styles.summaryValue}>{formatPrice(discount)} đ</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Còn lại</Text>
            <Text style={styles.summaryValue}>{formatPrice(totalPrice)} đ</Text>
          </View>
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>THANH TOÁN</Text>
          <TouchableOpacity
            style={styles.paymentMethod}
            onPress={() => !isCancelled && setSelectedPayment("QR")}
            disabled={isCancelled}
          >
            <View style={styles.paymentMethodLeft}>
              <Image
                source={require("../../assets/images/giaohangchoma.jpg")}
                style={styles.paymentIcon}
                resizeMode="cover"
              />
              <Text style={styles.paymentMethodText}>Quét mã QR sau để thanh toán</Text>
            </View>
            {selectedPayment === "QR" && <Ionicons name="checkmark" size={24} color="red" />}
          </TouchableOpacity>
        </View>

        <View style={styles.termsSection}>
          <View style={styles.termsRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => !isCancelled && setTermsChecked(!termsChecked)}
              disabled={isCancelled}
            >
              {termsChecked && <Ionicons name="checkmark" size={18} color="red" />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              Tôi đồng ý với <Text style={styles.termsLink}>Điều Khoản Sử Dụng</Text> và đang mua vé
              cho người có độ tuổi phù hợp với từng loại vé.{" "}
              <Text style={styles.termsLink}>Chi tiết xem tại đây!</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !(selectedPayment === "QR" && termsChecked) && styles.confirmButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!(selectedPayment === "QR" && termsChecked) || isCancelled}
          >
            <Text style={styles.confirmButtonText}>TÔI ĐỒNG Ý VÀ TIẾP TỤC</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={voucherModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.voucherModalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setVoucherModalVisible(false)}>
                <Ionicons name="arrow-back" size={24} color="#8e0000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>MTB Voucher</Text>
              <View style={styles.modalHeaderPlaceholder} />
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.voucherSectionTitle}>Danh sách Voucher của bạn</Text>
              <ScrollView style={{ marginBottom: 20 }}>
                {vouchers.length === 0 ? (
                  <Text style={styles.noVoucherText}>Bạn không có voucher nào khả dụng.</Text>
                ) : (
                  vouchers.map((item) => (
                    <View key={item.VoucherID.toString()}>{renderVoucherItem({ item })}</View>
                  ))
                )}
              </ScrollView>
              {selectedVoucherId && (
                <TouchableOpacity
                  style={[styles.registerButton, { marginTop: 0 }]}
                  onPress={handleApplyVoucher}
                  disabled={isCancelled}
                >
                  <Text style={styles.registerButtonText}>Áp dụng voucher</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  navigationHeader: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  movieInfoSection: {
    backgroundColor: "white",
    padding: 15,
  },
  movieCard: {
    flexDirection: "row",
    height: 190,
  },
  moviePoster: {
    width: 120,
    height: 190,
    borderRadius: 5,
  },
  movieDetails: {
    flex: 1,
    marginLeft: 15,
  },
  movieTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginRight: 8,
  },
  ratingBadge: {
    backgroundColor: "#fcdd2e",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  movieDescription: {
    fontSize: 12,
    color: "#8e0000",
    marginBottom: 5,
  },
  movieDate: {
    fontSize: 14,
    marginBottom: 3,
  },
  movieTime: {
    fontSize: 14,
    marginBottom: 3,
  },
  movieLocation: {
    fontSize: 14,
    marginBottom: 3,
  },
  movieSeats: {
    fontSize: 14,
    marginBottom: 5,
  },
  totalPrice: {
    fontSize: 16,
    color: "#8e0000",
    fontWeight: "bold",
  },
  countdownText: {
    fontSize: 14,
    color: "#8e0000",
    marginTop: 5,
  },
  quantitySection: {
    backgroundColor: "white",
    marginTop: 10,
  },
  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: "#333",
  },
  rowValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 15,
  },
  comboSection: {
    backgroundColor: "white",
    marginTop: 10,
    padding: 15,
  },
  selectedCombosSection: {
    backgroundColor: "white",
    marginTop: 10,
    padding: 15,
  },
  selectedComboItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  selectedComboName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  selectedComboPrice: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    marginRight: 10,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#8e0000",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  quantityButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 14,
    color: "#333",
    marginHorizontal: 5,
  },
  removeButton: {
    backgroundColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  removeButtonText: {
    color: "#333",
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  comboListContainer: {
    paddingRight: 15,
  },
  comboItem: {
    flexDirection: "row",
    alignItems: "center",
    width: 180,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    height: 80,
  },
  comboImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  comboDetails: {
    flex: 1,
    marginLeft: 10,
  },
  comboTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  comboPrice: {
    fontSize: 14,
    color: "#333",
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#8e0000",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 22,
  },
  discountSection: {
    backgroundColor: "white",
    marginTop: 10,
    padding: 15,
  },
  discountItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  discountLabel: {
    fontSize: 16,
    color: "#333",
  },
  summarySection: {
    backgroundColor: "white",
    marginTop: 10,
    padding: 15,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#333",
  },
  summaryValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  paymentSection: {
    backgroundColor: "white",
    marginTop: 10,
    padding: 15,
  },
  paymentMethod: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIcon: {
    width: 50,
    height: 35,
    borderRadius: 3,
  },
  paymentMethodText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  termsSection: {
    backgroundColor: "white",
    marginTop: 10,
    padding: 15,
    marginBottom: 20,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  termsLink: {
    color: "#8e0000",
    textDecorationLine: "underline",
  },
  confirmButton: {
    backgroundColor: "#8e0000",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  voucherModalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "70%",
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalHeaderPlaceholder: {
    width: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContent: {
    padding: 15,
  },
  voucherSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  noVoucherText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  registerButton: {
    backgroundColor: "#d91f28",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginVertical: 20,
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  couponCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  couponCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  couponCardId: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  couponCardExpiry: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
});