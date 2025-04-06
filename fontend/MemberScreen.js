import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Platform,
  ActivityIndicator, // Thêm ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { UserContext } from "./User/UserContext";
import { updateAvatar } from "./api";
import * as ImagePicker from 'expo-image-picker';

export default function MemberScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [avatarSource, setAvatarSource] = useState(
    user?.AvatarUrl ? { uri: user.AvatarUrl } : require("./assets/images/transformers.jpg")
  );
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading

  useEffect(() => {
    if (!user) {
      navigation.navigate("Login", { from: "Member" });
      setLoading(false);
    } else {
      setAvatarSource(
        user.AvatarUrl ? { uri: user.AvatarUrl } : require("./assets/images/transformers.jpg")
      );
      setLoading(false);
    }
  }, [user, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  const updateAvatarInDatabase = async (imageUri) => {
    try {
      setLoading(true);
      const response = await updateAvatar({
        customerID: user.customerID,
        avatarUrl: imageUri || '/default/transformers.jpg'
      });
      if (response.data.success) {
        setUser({ ...user, AvatarUrl: imageUri || '/default/transformers.jpg' });
        setAvatarSource(imageUri ? { uri: imageUri } : require("./assets/images/transformers.jpg"));
        Alert.alert("Thành công", "Ảnh đại diện đã được cập nhật");
      } else {
        Alert.alert("Lỗi", "Không thể cập nhật ảnh đại diện");
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra khi cập nhật ảnh");
    } finally {
      setLoading(false);
    }
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!hasPermission.granted) {
      Alert.alert("Lỗi", "Vui lòng cấp quyền truy cập thư viện ảnh trong cài đặt");
      return;
    }

    console.log("Opening image library...");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newAvatarUri = result.assets[0].uri;
      updateAvatarInDatabase(newAvatarUri);
    } else if (result.canceled) {
      console.log("User cancelled image picker");
    }
    setModalVisible(false);
  };

  const takePhoto = async () => {
    const hasPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!hasPermission.granted) {
      Alert.alert("Lỗi", "Vui lòng cấp quyền truy cập camera trong cài đặt");
      return;
    }

    console.log("Opening camera...");
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newAvatarUri = result.assets[0].uri;
      updateAvatarInDatabase(newAvatarUri);
    } else if (result.canceled) {
      console.log("User cancelled camera");
    }
    setModalVisible(false);
  };

  const resetToDefault = () => {
    updateAvatarInDatabase(null);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Thành viên MTB</Text>
        <Icon name="edit" size={20} color="#000" />
      </View>

      <View style={styles.userInfo}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image source={avatarSource} style={styles.avatar} />
        </TouchableOpacity>
        <Text style={styles.userName}>{user.customerName}</Text>
        <Text style={styles.userId}>mã số thành viên MTB: {user.customerID}</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>Tổng chi tiêu 2025</Text>
          <Text style={styles.pointsText}>200000 đ</Text>
          <Text style={styles.pointsText}>điểm Thưởng</Text>
          <Text style={styles.pointsText}>0</Text>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption} onPress={pickImageFromLibrary}>
              <Text style={styles.modalOptionText}>Chọn ảnh từ thư viện</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={takePhoto}>
              <Text style={styles.modalOptionText}>Chụp ảnh từ máy ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={resetToDefault}>
              <Text style={styles.modalOptionText}>Đặt lại ảnh mặc định</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("AccountInfo")}
        >
          <Icon name="user" size={20} color="#000" />
          <Text style={styles.menuText}>Thông tin tài khoản</Text>
          <Icon name="chevron-right" size={16} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ForgotPassword", { from: "Member" })}
        >
          <Icon name="lock" size={20} color="#000" />
          <Text style={styles.menuText}>Thay đổi mật khẩu</Text>
          <Icon name="chevron-right" size={16} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="key" size={20} color="#000" />
          <Text style={styles.menuText}>Cài đặt mật mã thanh toán</Text>
          <Icon name="chevron-right" size={16} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="credit-card" size={20} color="#000" />
          <Text style={styles.menuText}>Thẻ thành viên</Text>
          <Icon name="chevron-right" size={16} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="gift" size={20} color="#000" />
          <Text style={styles.menuText}>Giới thiệu bạn mới</Text>
          <Icon name="chevron-right" size={16} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.pointsSection}>
        <Text style={styles.sectionTitle}>Điểm MTB</Text>
        <View style={styles.pointsBar}>
          <Text style={styles.pointsValue}>1</Text>
        </View>
        <Text style={styles.pointsDetails}>Voucher | Coupon | MTB eGift</Text>
      </View>

      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}>Lịch sử giao dịch</Text>
        <Icon name="chevron-right" size={16} color="#000" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  userInfo: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  modalCancel: {
    padding: 15,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  userId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  pointsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  pointsText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
  },
  menuContainer: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
    marginLeft: 15,
  },
  pointsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff9e6",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  pointsBar: {
    backgroundColor: "#ddd",
    height: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pointsValue: {
    fontSize: 12,
    color: "#000",
    position: "absolute",
  },
  pointsDetails: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});