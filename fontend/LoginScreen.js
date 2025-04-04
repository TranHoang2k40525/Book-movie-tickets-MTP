import React, { useState, useEffect, useContext } from "react";
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
import { UserContext } from "./User/UserContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { login, getCustomer } from "./api"; // Import các hàm từ api.js


function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { setUser } = useContext(UserContext);

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

    const trimmedEmail = email.trim();
    console.log('Dữ liệu gửi đi:', { email: trimmedEmail, password });
    try {
      // Gọi API đăng nhập từ api.js - mật khẩu sẽ được mã hóa ở backend
      const response = await login({ email: trimmedEmail, password });
      const userData = response.data.user;

      // Gọi API để lấy thông tin khách hàng từ api.js
      const customerResponse = await getCustomer({ accountID: userData.AccountID });
      const customerData = customerResponse.data.customer;

      const userWithCustomer = {
        ...userData,
        customerID: customerData.CustomerID,
        customerName: customerData.CustomerName,
      };

      setUser(userWithCustomer);
      Alert.alert("Thành công", response.data.message);

      if (route.params?.from === "Member") {
        navigation.navigate("Member");
      } else {
        navigation.navigate("Home", { user: userWithCustomer });
      }
    } catch (error) {
      console.error('Lỗi đăng nhập từ frontend:', error);
      if (error?.response) {
        Alert.alert("Lỗi", error.response.data?.message || "Đăng nhập thất bại!");
      } else if (error?.request) {
        Alert.alert("Lỗi", "Không thể kết nối đến server. Vui lòng kiểm tra mạng hoặc địa chỉ server!");
      } else {
        Alert.alert("Lỗi", "Đã xảy ra lỗi: " + error?.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("./assets/images/anh_dangnhap.jpg")}
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
                source={require("./assets/images/logo.png")}
                style={styles.logo}
              />
            </View>
          </View>
        </View>
      </ImageBackground>

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
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.registerButtonText}>
            Đăng ký tài khoản MTB 67CS1
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerBackground: {
    height: 200,
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
    width: 170,
    height: 170,
    left: 90,
    backgroundColor: "#FF4D6D",
    borderWidth: 2,
    borderColor: "#black",
    transform: [{ rotate: "-5deg" }],
    justifyContent: "center",
    alignItems: "center",
  },
  innerSquare: {
    width: 150,
    height: 150,
    backgroundColor: "#FF4D6D",
    borderWidth: 2,
    borderColor: "#fff",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    width: 100,
    textAlign: "center",
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  inputContainer: {
    position: "relative",
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "transparent",
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
    color: "#1E90FF",
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