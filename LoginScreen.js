import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
  Alert,
} from "react-native";
import { accounts } from "./User/datagiasu.json";

import Icon from "react-native-vector-icons/FontAwesome";

import { NavigationProp, RouteProp } from '@react-navigation/native';

type LoginScreenProps = {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
};

const LoginScreen = ({ navigation, route }: LoginScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  // Nhận email và mật khẩu từ ResetPasswordScreen (nếu có)
  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
    if (route.params?.password) {
      setPassword(route.params.password);
    }
  }, [route.params]);
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    
  
    const account = accounts.find((acc) => acc.AccountName === email);
    if (!account) {
      Alert.alert("Lỗi", "Tài khoản không tồn tại!");
      return;
    }

    if (account.AccountPassword !== password) {
      Alert.alert("Lỗi", "Mật khẩu không đúng!");
      return;
    }

    Alert.alert("Thành công", "Đăng nhập thành công!");
    navigation.navigate("Home", { user: account });
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={require("./assets/images/anh_dangnhap.jpg")} // Ảnh nền header
        style={styles.headerBackground}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "#fff" }}>
            <Icon name="arrow-left" size={24} color="#fff" /> Quay lại
          </Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.squareContainer}>
            <View style={styles.innerSquare}>
              <Text style={styles.headerText} numberOfLines={3}>
                Rạp chiếu phim MTB 67CS1
              </Text>
              <Image
                source={require("./assets/images/logo.png")} // Logo bên cạnh chữ
                style={styles.logo}
              />
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Form đăng nhập */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email hoặc số điện thoại"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Icon
              name={isPasswordVisible ? "eye" : "eye-slash"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>hoặc</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("Register")} // Điều hướng đến màn hình đăng ký
        >
          <Text style={styles.registerButtonText}>
            Đăng ký tài khoản MTB 67CS1
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Nền trắng cho phần còn lại
  },
  headerBackground: {
    height: 200, // Chiều cao của header
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  squareContainer: {
    width: 170, // Kích thước ô vuông lớn
    height: 170,
    left: 90,
    backgroundColor: "#FF4D6D", // Màu đỏ giống trong hình trước
    borderWidth: 2,
    borderColor: "#black",
    transform: [{ rotate: "-5deg" }], // Nghiêng 10 độ
    justifyContent: "center",
    alignItems: "center",
  },
  innerSquare: {
    width: 150, // Kích thước ô vuông nhỏ hơn
    height: 150,
    backgroundColor: "#FF4D6D",
    borderWidth: 2,
    borderColor: "#fff", // Viền trắng
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20, // Tăng kích thước chữ để dễ đọc
    fontWeight: "bold",
    color: "#fff",
    width: 100, // Giới hạn chiều rộng để chữ xuống dòng
    textAlign: "center", // Căn giữa chữ
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Lớp phủ trắng mờ
  },
  inputContainer: {
    position: "relative",
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1, // Chỉ có đường gạch dưới
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "transparent", // Không có background
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    top: 10,
  },
  loginButton: {
    backgroundColor: "#FF4D6D",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  forgotPassword: {
    alignItems: "center",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#1E90FF", // Màu xanh dương
    fontSize: 16,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 10,
  },
  orText: {
    color: "#888",
    fontSize: 16,
  },
  registerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#333",
    fontSize: 16,
  },
});

export default LoginScreen;
