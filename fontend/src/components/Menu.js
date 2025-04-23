import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import { UserContext } from "../contexts/User/UserContext";

export default function Menu({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const [totalSpending, setTotalSpending] = useState("0"); // Đặt giá trị mặc định

  useEffect(() => {
    // Tính tổng chi tiêu của người dùng từ dữ liệu thanh toán
    if (user) {
      // TODO: Lấy tổng chi tiêu từ API từ bảng Payment
      // Hiện tại đang giữ giá trị mặc định là 200000
    }
  }, [user]);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogout = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          onPress: () => {
            setUser(null);
            setMenuVisible(false);
            navigation.navigate("Home");
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };
  

  const handleMemberPress = () => {
    setMenuVisible(false);
    if (!user) {
      navigation.navigate("Login", { from: "Member" });
    } else {
      navigation.navigate("Member");
    }
  };

  const handleBookByMoviePress = () => {
    setMenuVisible(false);
    if (!user) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để đặt vé theo phim. Bạn có muốn đăng nhập ngay bây giờ không?",
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Đăng nhập",
            onPress: () =>
              navigation.navigate("Login", { from: "Datvetheophim" }),
            style: "default",
          },
        ],
        { cancelable: false }
      );
    } else {
      navigation.navigate("Datvetheophim");
    }
  };

  const handleBookByCinemaPress = () => {
    setMenuVisible(false);
    if (!user) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để đặt vé theo rạp. Bạn có muốn đăng nhập ngay bây giờ không?",
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Đăng nhập",
            onPress: () =>
              navigation.navigate("Login", { from: "ChonPhimTheoRap" }),
            style: "default",
          },
        ],
        { cancelable: false }
      );
    } else {
      navigation.navigate("ChonPhimTheoRap");
    }
  };

  const handleSpecialExperiencesPress = () => {
    setMenuVisible(false);
    navigation.navigate("SpecialExperiencesUI");
  };

  const handleCinemaPress = () => {
    setMenuVisible(false);
    navigation.navigate("RapPhimMTB");
  };

  const handleNewsAndEventsPress = () => {
    setMenuVisible(false);
    navigation.navigate("TinMoiUuDaiTatCa");
  };
  
  const handleNotificationPress = () => {
    setMenuVisible(false);
    if (!user) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để xem thông báo. Bạn có muốn đăng nhập ngay bây giờ không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng nhập",
            onPress: () => navigation.navigate("Login", { from: "ThongBao" }),
          },
        ]
      );
    } else {
      navigation.navigate("ThongBao");
    }
  };
  
  const handleMyTicketsPress = () => {
    setMenuVisible(false);
    if (!user) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để xem vé của mình. Bạn có muốn đăng nhập ngay bây giờ không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng nhập",
            onPress: () => navigation.navigate("Login", { from: "VeCuaToi" }),
          },
        ]
      );
    } else {
      // Đi đến trang Vé của tôi để hiển thị các Booking, BookingSeat và Show từ CSDL
      navigation.navigate("VeCuaToi");
    }
  };

  const handleStorePress = () => {
    setMenuVisible(false);
    // Đi đến trang Store để hiển thị các Product từ CSDL
    navigation.navigate("Store");
  };

  const handleRegisterPress = () => {
    setMenuVisible(false);
    navigation.navigate("Register");
  };

  const handleVoucherPress = () => {
    setMenuVisible(false);
    if (!user) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để xem voucher của mình. Bạn có muốn đăng nhập ngay bây giờ không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng nhập",
            onPress: () => navigation.navigate("Login", { from: "Voucher" }),
          },
        ]
      );
    } else {
      // Đi đến trang Voucher để hiển thị các Voucher từ CSDL
      navigation.navigate("Voucher");
    }
  };

  return (
    <>
      {/* Nút mở menu */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Text style={styles.menuText}>≡</Text>
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
          <View style={styles.menu}>
            {/* Phần profile người dùng */}
            <View style={styles.userProfileSection}>
              {/* Hàng chứa icon thông báo và cài đặt */}
              <View style={styles.iconRow}>
                <TouchableOpacity 
                  style={styles.notificationButton}
                  onPress={handleNotificationPress}
                >
                  <Icon1 name="bell" size={24} color="#fff" />
                  {/* Badge thông báo mới */}
                  
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsButton}>
                  <Icon1 name="cog" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              {/* Avatar và thông tin người dùng */}
              {user ? (
                <View style={styles.profileContainer}>
                  <Image
                    source={
                      user.AvatarUrl
                        ? { uri: user.AvatarUrl }
                        : require("../assets/images/transformers.jpg")
                    }
                    style={styles.avatar}
                  />
                  <Text style={styles.userName}>{user.customerName}</Text>
                  <Text style={styles.userPoints}>Tổng chi tiêu: {totalSpending.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} đ</Text>
                </View>
              ) : (
                <View style={styles.profileContainer}>
                  <Icon1 name="account-circle" size={80} color="#fff" />
                  <View style={styles.authButtonsContainer}>
                    <TouchableOpacity 
                      style={styles.loginButton}
                      onPress={() => navigation.navigate("Login")}
                    >
                      <Text style={styles.loginButtonText}>Đăng nhập</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.registerButton}
                      onPress={handleRegisterPress}
                    >
                      <Text style={styles.loginButtonText}>Đăng ký</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              {/* Các nút đặt vé */}
              <View style={styles.bookingOptions}>
                <TouchableOpacity
                  style={styles.bookingButton}
                  onPress={handleBookByMoviePress}
                >
                  <Text style={styles.bookingButtonText}>Đặt vé theo phim</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bookingButton}
                  onPress={handleBookByCinemaPress}
                >
                  <Text style={styles.bookingButtonText}>Đặt vé theo rạp</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Thanh điều hướng chính */}
            <View style={styles.bottomNavigation}>
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => navigation.navigate("Home")}
              >
                <Icon1 name="home" size={24} color="#fff" />
                <Text style={styles.navText}>Trang chủ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={handleMemberPress}
              >
                <Icon1 name="account" size={24} color="#fff" />
                <Text style={styles.navText}>Thành viên</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navItem}
                onPress={handleCinemaPress}
              >
                <Icon1 name="information" size={24} color="#fff" />
                <Text style={styles.navText}>Rạp</Text>
              </TouchableOpacity>
            </View>
            
            {/* Hàng biểu tượng đầu tiên - 3 nút */}
            <View style={styles.iconRow3}>
              <TouchableOpacity 
                style={styles.iconItem}
                onPress={handleSpecialExperiencesPress}
              >
                <Icon1 name="star" size={28} color="#fff" />
                <Text style={styles.iconText}>Rạp đặc biệt</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.iconItem}
                onPress={handleNewsAndEventsPress}
              >
                <Icon1 name="gift" size={28} color="#fff" />
                <Text style={styles.iconText}>Tin tức & Ưu đãi</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.iconItem}
                onPress={handleMyTicketsPress}
              >
                <Icon1 name="ticket-confirmation" size={28} color="#fff" />
                <Text style={styles.iconText}>Vé của tôi</Text>
              </TouchableOpacity>
            </View>

            {/* Hàng biểu tượng thứ hai - 3 nút hoặc ít hơn */}
            <View style={styles.iconRow3}>
              <TouchableOpacity 
                style={styles.iconItem}
                onPress={handleStorePress}
              >
                <Icon1 name="popcorn" size={28} color="#fff" />
                <Text style={styles.iconText}>Store</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.iconItem}
                onPress={handleVoucherPress}
              >
                <Icon1 name="ticket-percent" size={28} color="#fff" />
                <Text style={styles.iconText}>Voucher</Text>
              </TouchableOpacity>
              
              <View style={styles.iconItem}>
                <View style={styles.emptyIcon}></View>
              </View>
            </View>

            {/* Nút đăng xuất (chỉ hiển thị khi đã đăng nhập) */}
            {user && (
              <View style={styles.logoutContainer}>
                <TouchableOpacity 
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <Icon1 name="logout" size={28} color="#fff" />
                  <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 5,
  },
  menuText: {
    fontSize: 30,
    color: "red",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menu: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    width: "80%",
    height: "100%",
    justifyContent: 'flex-start',
  },
  userProfileSection: {
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  settingsButton: {},
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userPoints: {
    color: 'white',
    fontSize: 14,
  },
  authButtonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    width: '80%',
    justifyContent: 'space-between',
  },
  loginButton: {
    backgroundColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
  },
  registerButton: {
    backgroundColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bookingOptions: {
    paddingHorizontal: 20,
  },
  bookingButton: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
  },
  bookingButtonText: {
    color: 'white',
    fontSize: 16,
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 20,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    color: 'white',
    marginTop: 5,
    fontSize: 10,
  },
  iconRow3: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  iconItem: {
    alignItems: 'center',
    width: '33%',
  },
  iconText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
  emptyIcon: {
    width: 28,
    height: 28,
  },
  logoutContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
});
