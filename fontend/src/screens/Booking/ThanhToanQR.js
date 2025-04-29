import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
  BackHandler,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { confirmPayment, cancelBooking } from "../../Api/api";

export default function ThanhToanQR({ navigation, route }) {
  const {
    bookingId,
    totalPrice,
    expirationTime,
    selectedSeats,
    selectedProducts,
    showId,
    cinemaId,
    cinemaName,
    showDate,
    showTime,
    movieTitle,
    movieId,
    moviePoster,
    MovieLanguage,
    selectedVoucherId,
    fromScreen,
  } = route.params;

  const [countdown, setCountdown] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false); // Thêm trạng thái isCancelling

  // Xử lý đếm ngược và hủy khi hết thời gian
  useEffect(() => {
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
          handleCancelBooking().finally(() => {
            Alert.alert("Hết thời gian", "Thời gian thanh toán đã hết.", [
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

    return () => clearInterval(timer);
  }, [expirationTime, navigation, showId, fromScreen, movieId, cinemaId, cinemaName]);

  // Xử lý hủy đặt vé
  const handleCancelBooking = async () => {
    if (!bookingId || isCancelling) return;
    setIsCancelling(true);
    try {
      await cancelBooking(bookingId);
      console.log("Đã hủy đặt vé:", bookingId);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Không thể hủy đặt vé";
      const status = error.response?.status;
      console.error("Lỗi khi hủy đặt vé:", error);
      if (
        errorMessage === "Đặt vé đã được hủy trước đó" ||
        status === 403 || // Không có quyền
        status === 410 // Đặt vé đã hết hạn (nếu backend trả về)
      ) {
        console.log(`Bỏ qua lỗi: ${errorMessage}`);
      } else {
        Alert.alert("Lỗi", errorMessage);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  // Gộp logic quay lại và hủy
  const handleGoBack = () => {
    if (isCancelling) return;
    Alert.alert(
      "Hủy giao dịch",
      "Bạn có muốn hủy quá trình thanh toán không? Ghế đã giữ sẽ được giải phóng.",
      [
        {
          text: "Hủy",
          onPress: async () => {
            await handleCancelBooking();
            if (fromScreen === "MovieBookingScreen") {
              navigation.navigate("MovieBookingScreen", { movieId });
            } else if (fromScreen === "ChonRap_TheoKhuVuc") {
              navigation.navigate("ChonRap_TheoKhuVuc", { cinemaId, cinemaName });
            } else {
              navigation.navigate("SoDoGheNgoi1", { showId });
            }
          },
          style: "destructive",
        },
        { text: "Tiếp tục", style: "cancel" },
      ],
      { cancelable: false }
    );
  };

  // Xử lý BackHandler
  useEffect(() => {
    const backAction = () => {
      handleGoBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [handleGoBack, isCancelling]);

  // Xử lý thanh toán thành công
  const handlePaymentSuccess = async () => {
    if (isCancelling) return;
    try {
      const paymentData = {
        paymentMethod: "QR",
        amount: totalPrice,
        selectedProducts,
        voucherId: selectedVoucherId,
      };
      const response = await confirmPayment(bookingId, paymentData);
      if (response.success) {
        // Cập nhật trạng thái ghế thành booked
        await fetch("http://your-api-url/api/update-seats-booked", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ bookingId }),
        });
        Alert.alert("Thành công", "Thanh toán thành công!", [
          { text: "OK", onPress: () => navigation.navigate("Home") },
        ]);
      }
    } catch (error) {
      Alert.alert("Lỗi", error.response?.data?.message || "Thanh toán thất bại. Vui lòng thử lại.");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          disabled={isCancelling}
        >
          <Ionicons name="arrow-back" size={24} color={isCancelling ? "grey" : "#c33"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.paymentHeader}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/giaohangchoma.jpg")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Số tiền thanh toán</Text>
            <TouchableOpacity
              style={styles.amountRow}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.amount}>{totalPrice.toLocaleString()} VND</Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#0088CC" />
            </TouchableOpacity>

            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setModalVisible(false)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Thông tin đơn hàng</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalSubtitle}>Đơn vị chấp nhận thanh toán</Text>
                  <Text style={styles.modalCompany}>{cinemaName || "CJ MTB VIETNAM"}</Text>
                  <Text style={styles.modalLabel}>Mã đơn hàng</Text>
                  <Text style={styles.modalOrderId}>{bookingId || "N/A"}</Text>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoContainer}>
          <View style={styles.instructionContainer}>
            <Text style={styles.paymentMethodText}>Vui lòng quét mã sau:</Text>
            <View style={styles.atmBadge}>
              <Text style={styles.atmText}>QR</Text>
            </View>
          </View>

          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={20} color="#000" />
            <Text style={styles.timeText}>{formatTime(countdown)}</Text>
          </View>
        </View>

        <View style={styles.paymentImageContainer}>
          <Image
            source={require("../../assets/QR.jpg")}
            style={styles.paymentImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.confirmButton, isCancelling && styles.disabledButton]}
            onPress={handlePaymentSuccess}
            disabled={isCancelling}
          >
            <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelContainer}
            onPress={handleGoBack}
            disabled={isCancelling}
          >
            <Text style={[styles.cancelText, isCancelling && { color: "grey" }]}>✕ Hủy giao dịch</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.supportContainer}>
          <View style={styles.phoneContainer}>
            <Ionicons name="call-outline" size={18} color="#555" />
            <Text style={styles.supportText}>1******** (vui lòng gọi khi khác)</Text>
          </View>
          <View style={styles.emailContainer}>
            <Ionicons name="mail-outline" size={18} color="#555" />
            <Text style={styles.supportText}>nhom5@67CS1.edu.huce.vn</Text>
          </View>
        </View>

        <View style={styles.copyrightContainer}>
          <Text style={styles.copyrightText}>© 2006-2025 Bản quyền thuộc về chúng tôi</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  logoContainer: {
    width: 70,
    height: 40,
  },
  logo: {
    width: "100%",
    height: 50,
  },
  amountContainer: {
    alignItems: "flex-end",
    flexDirection: "column",
  },
  amountLabel: {
    fontSize: 12,
    color: "#666",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0088CC",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  instructionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 35,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  timeText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  atmBadge: {
    backgroundColor: "#fff",
    borderColor: "#0088CC",
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginLeft: 10,
  },
  atmText: {
    color: "#0088CC",
    fontWeight: "bold",
    fontSize: 12,
  },
  paymentImageContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    alignItems: "center",
  },
  paymentImage: {
    width: "100%",
    height: 400,
    borderRadius: 5,
  },
  actionContainer: {
    alignItems: "center",
    paddingVertical: 15,
  },
  confirmButton: {
    backgroundColor: "#0088CC",
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
  },
  supportContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  supportText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#555",
  },
  copyrightContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 15,
    width: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 18,
    color: "#666",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  modalCompany: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  modalOrderId: {
    fontSize: 16,
    fontWeight: "bold",
  },
});