import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserContext } from "./User/UserContext";
import { login } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (accessToken) {
          navigation.navigate("Home");
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái đăng nhập:", error);
      }
    };
    checkLoginStatus();
  }, [navigation]);

  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
    if (route.params?.password) {
      setPassword(route.params.password);
    }
  }, [route.params?.email, route.params?.password]);

  const validateInput = () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu!");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ!");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự!");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateInput()) return;

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();
      const loginResponse = await login(trimmedEmail, trimmedPassword);
      if (loginResponse.user && loginResponse.accessToken) {
        await AsyncStorage.setItem("accessToken", loginResponse.accessToken);
        await AsyncStorage.setItem("refreshToken", loginResponse.refreshToken);
        setUser(loginResponse.user);
        const fromScreen = route.params?.from || "Home";
        navigation.navigate(fromScreen);
      } else {
        Alert.alert("Lỗi", loginResponse.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      const message =
        error.response?.status === 401
          ? "Email hoặc mật khẩu không đúng!"
          : error.response?.status === 404
          ? "Tài khoản không tồn tại!"
          : "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại!";
      Alert.alert("Lỗi", message);
      console.error("Lỗi đăng nhập:", error);
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
          <Text style={styles.backButtonText}>
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
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? "eye" : "eye-slash"}
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
};

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
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  squareContainer: {
    width: 170,
    height: 170,
    backgroundColor: "#FF4D6D",
    borderWidth: 2,
    borderColor: "black",
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
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    width: 100,
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
    color: "#fff",
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
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#333",
    fontSize: 16,
  },
});

export default LoginScreen;
