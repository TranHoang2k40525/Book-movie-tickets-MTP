import React, { useState, useEffect, useRef } from "react";
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
import { confirmPayment, cancelBooking, generateQRCode, simulateMomoPayment, checkPaymentStatus } from "../../Api/api";

export default function ThanhToanQR({ navigation, route }) {
  const {
    bookingId,
    totalPrice: ticketPrice, // Renamed to clarify it's only ticket price
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
    paymentMethod = "Momo",
  } = route.params;

  const [countdown, setCountdown] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [transactionInfo, setTransactionInfo] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [finalAmount, setFinalAmount] = useState(ticketPrice); // State for final amount
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        // Pass selectedProducts and selectedVoucherId to generateQRCode
        const response = await generateQRCode(bookingId, {
          paymentMethod,
          selectedProducts,
          selectedVoucherId,
        });
        if (response.success) {
          setQrCodeImage(response.qrCode);
          setTransactionInfo(response.transactionInfo);
          setFinalAmount(response.totalPrice); // Update final amount from backend
        } else {
          Alert.alert("Lỗi", response.message || "Không thể tạo mã QR");
        }
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tạo mã QR. Vui lòng thử lại.");
      }
    };
    fetchQRCode();
  }, [bookingId, paymentMethod, selectedProducts, selectedVoucherId]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiration = new Date(expirationTime).getTime();
      const diff = Math.floor((expiration - now) / 1000);
      return diff > 0 ? diff : 0;
    };

    setCountdown(updateCountdown());
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0 || isCancelled) {
          clearInterval(timerRef.current);
          if (!isCancelled) {
            handleCancelBooking().catch(() => {
              Alert.alert("Lỗi", "Không thể hủy giao dịch khi hết thời gian.");
            }).finally(() => {
              Alert.alert("Hết thời gian", "Thời gian thanh toán đã hết.", [
                {
                  text: "OK",
                  onPress: () => navigateBack(),
                },
              ]);
            });
          }
          return 0;
        }
        return updateCountdown();
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [expirationTime, isCancelled]);

  const navigateBack = () => {
    if (fromScreen === "MovieBookingScreen") {
      navigation.navigate("MovieBookingScreen", { movieId });
    } else if (fromScreen === "ChonRap_TheoKhuVuc") {
      navigation.navigate("ChonRap_TheoKhuVuc", { cinemaId, cinemaName });
    } else {
      navigation.navigate("SoDoGheNgoi1", { showId });
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingId || isCancelled) return;
    setIsCancelled(true);
    clearInterval(timerRef.current);
    try {
      await cancelBooking(bookingId);
      console.log("Đã hủy đặt vé:", bookingId);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Không thể hủy đặt vé";
      const status = error.response?.status;
      if (
        errorMessage === "Đặt vé đã được hủy trước đó" ||
        status === 403 ||
        status === 410
      ) {
        console.log(`Bỏ qua lỗi: ${errorMessage}`);
      } else {
        throw new Error(errorMessage);
      }
    }
  };

  const handleGoBack = () => {
    if (isCancelled) return;
    Alert.alert(
      "Hủy giao dịch",
      "Bạn có muốn hủy quá trình thanh toán không? Ghế đã giữ sẽ được giải phóng.",
      [
        { text: "Tiếp tục", style: "cancel" },
        {
          text: "Hủy",
          onPress: async () => {
            try {
              await handleCancelBooking();
              navigateBack();
            } catch (error) {
              Alert.alert("Lỗi", error.message || "Không thể hủy giao dịch.");
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    const backAction = () => {
      handleGoBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [handleGoBack, isCancelled]);

  const handleSimulatePayment = async () => {
    if (isCancelled || isSimulating) return;
    setIsSimulating(true);
    try {
      const response = await simulateMomoPayment(bookingId, { selectedProducts, selectedVoucherId });
      if (response.success) {
        const paymentStatus = await checkPaymentStatus(bookingId);
        if (paymentStatus.data.booking.Status === "Confirmed") {
          setIsCancelled(true);
          clearInterval(timerRef.current);
          Alert.alert("Thành công", "Thanh toán giả lập thành công!", [
            { text: "OK", onPress: () => navigation.navigate("Home") },
          ]);
        } else {
          Alert.alert("Lỗi", "Thanh toán chưa được xác nhận. Vui lòng thử lại.");
        }
      } else {
        Alert.alert("Lỗi", response.message || "Giả lập thanh toán thất bại.");
      }
    } catch (error) {
      Alert.alert("Lỗi", error.response?.data?.message || "Giả lập thanh toán thất bại.");
    } finally {
      setIsSimulating(false);
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
          disabled={isCancelled}
        >
          <Ionicons name="arrow-back" size={24} color={isCancelled ? "grey" : "#c33"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán qua Momo</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.paymentHeader}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/momo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Số tiền thanh toán</Text>
            <TouchableOpacity
              style={styles.amountRow}
              onPress={() => !isCancelled && setModalVisible(true)}
              disabled={isCancelled}
            >
              <Text style={styles.amount}>{finalAmount.toLocaleString()} VND</Text>
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
                  {transactionInfo && (
                    <>
                      <Text style={styles.modalLabel}>Thông tin chuyển khoản</Text>
                      <Text style={styles.modalText}>Ngân hàng: {transactionInfo.bankName}</Text>
                      <Text style={styles.modalText}>Số tài khoản: {transactionInfo.accountNumber}</Text>
                      <Text style={styles.modalText}>Tên tài khoản: {transactionInfo.accountName}</Text>
                      <Text style={styles.modalText}>Số tiền: {transactionInfo.amount.toLocaleString()} VND</Text>
                      <Text style={styles.modalText}>Nội dung: {transactionInfo.content}</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoContainer}>
          <View style={styles.instructionContainer}>
            <Text style={styles.paymentMethodText}>Vui lòng quét mã QR:</Text>
            <View style={styles.atmBadge}>
              <Text style={styles.atmText}>Momo QR</Text>
            </View>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={20} color="#000" />
            <Text style={styles.timeText}>{formatTime(countdown)}</Text>
          </View>
        </View>

        <View style={styles.paymentImageContainer}>
          {qrCodeImage ? (
            <Image
              source={{ uri: qrCodeImage }}
              style={styles.paymentImage}
              resizeMode="contain"
            />
          ) : (
            <Text>Đang tải mã QR...</Text>
          )}
        </View>

        {transactionInfo && (
          <View style={styles.transactionInfoContainer}>
            <Text style={styles.transactionInfoTitle}>Thông tin chuyển khoản</Text>
            <Text style={styles.transactionInfoText}>Ngân hàng: {transactionInfo.bankName}</Text>
            <Text style={styles.transactionInfoText}>Số tài khoản: {transactionInfo.accountNumber}</Text>
            <Text style={styles.transactionInfoText}>Tên tài khoản: {transactionInfo.accountName}</Text>
            <Text style={styles.transactionInfoText}>Số tiền: {transactionInfo.amount.toLocaleString()} VND</Text>
            <Text style={styles.transactionInfoText}>Nội dung: {transactionInfo.content}</Text>
          </View>
        )}

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.confirmButton, (isCancelled || isSimulating) && styles.disabledButton]}
            onPress={handleSimulatePayment}
            disabled={isCancelled || isSimulating}
          >
            <Text style={styles.confirmButtonText}>Giả lập thanh toán thành công</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelContainer}
            onPress={handleGoBack}
            disabled={isCancelled}
          >
            <Text style={[styles.cancelText, isCancelled && { color: "grey" }]}>✕ Hủy giao dịch</Text>
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
  transactionInfoContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  transactionInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  transactionInfoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
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
  modalText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
});