import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
import { UserContext } from "../contexts/User/UserContext";

export default function Menu({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { user, setUser } = useContext(UserContext);

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
  const closeMenuAndNavigate = (screen, params) => {
    setMenuVisible(false);
    navigation.navigate(screen, params);
  };
  const handleNewsAndEventsPress = () => {
    setMenuVisible(false);
    navigation.navigate("TinMoiUuDaiTatCa");
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
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu}>
          <View style={styles.menu}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity style={styles.notificationButton}>
                <Icon1 name="bell" size={24} color="#fff" />
              </TouchableOpacity>
              {user ? (
                <>
                  <Image
                    source={
                      user.AvatarUrl
                        ? { uri: user.AvatarUrl }
                        : require("../assets/images/transformers.jpg")
                    }
                    style={styles.avatar}
                  />
                  <Text style={styles.userName}>{user.customerName}</Text>
                </>
              ) : (
                <Icon1 name="account-circle" size={60} color="#fff" />
              )}
              <TouchableOpacity style={styles.settingsButton}>
                <Icon1 name="cog" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Hiển thị nút đăng nhập/đăng ký hoặc đăng xuất */}
            {user ? (
              <TouchableOpacity
                style={styles.authButton}
                onPress={handleLogout}
              >
                <Text style={styles.authButtonText}>Đăng xuất</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={styles.authButton}
                  onPress={() => navigation.navigate("Login")}
                >
                  <Text style={styles.authButtonText}>Đăng nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.authButton}
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text style={styles.authButtonText}>Đăng ký</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Các mục đặt vé */}
            <View style={styles.menuSection}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={handleBookByMoviePress}
              >
                <Icon1
                  name="movie"
                  size={24}
                  color="#fff"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItem}>Đặt vé theo phim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={handleBookByCinemaPress}
              >
                <Icon1
                  name="map-marker"
                  size={24}
                  color="#fff"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItem}>Đặt vé theo rạp</Text>
              </TouchableOpacity>
            </View>

            {/* Các mục menu chính */}
            <View style={styles.menuSection}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => closeMenuAndNavigate("Home")}
              >
                <Icon1
                  name="home"
                  size={24}
                  color="#fff"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItem}>Trang chủ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={handleMemberPress}
              >
                <Icon1
                  name="account"
                  size={24}
                  color="#fff"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItem}>Thành viên</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuRow} onPress={handleCinemaPress}>
                <Icon1 name="map-marker" size={24} color="#fff" style={styles.menuIcon} />
                <Text style={styles.menuItem}>Rạp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={handleSpecialExperiencesPress} 
              >
                <Icon1
                  name="star"
                  size={24}
                  color="#fff"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItem}>Rạp đặc biệt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuRow}>
                <Icon1
                  name="ticket-confirmation"
                  size={24}
                  color="#fff"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItem}>Vé của tôi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuRow}>
                <Icon1
                  name="store"
                  size={24}
                  color="#fff"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItem}>Store</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuRow}>
                <Icon1
                  name="gift"
                  size={24}
                  color="#fff"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItem}>eGift</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuRow}>
                <Icon1
                  name="sale"
                  size={24}
                  color="#fff"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItem}>Đổi ưu đãi</Text>
              </TouchableOpacity>
            </View>

            {/* Tin tức & Sự kiện */}
            <View style={styles.menuSection}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={handleNewsAndEventsPress} // Điều hướng đến TinMoiVaUuDai
              >
                <Icon1
                  name="newspaper"
                  size={24}
                  color="#fff"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItem}>Tin tức & Sự kiện</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>NEW</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(45, 43, 43, 0.41)",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  menu: {
    backgroundColor: "rgba(47, 44, 44, 0.72)",
    width: "80%",
    height: "100%",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  notificationButton: {
    position: "absolute",
    left: 50,
    top: 20,
  },
  settingsButton: {
    position: "absolute",
    top: 20,
    right: 50,
  },
  authButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  authButton: {
    backgroundColor: "#FF4D6D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  authButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  menuSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuItem: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    flex: 1,
  },
  badge: {
    backgroundColor: "#FF4D6D",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
