import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    navigation.navigate("HomeScreen");
  };
  

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require("./assets/images/anh_dangnhap.jpg")} style={styles.logo} />
      </View>
      
      {/* Email Input */}
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
      />
      
      {/* Password Input */}
      <TextInput 
        style={styles.input} 
        placeholder="Mật khẩu" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
      />
      
      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Đăng nhập</Text>
      </TouchableOpacity>
      
      {/* Forgot Password */}
      <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
      
      {/* Register */}
      <TouchableOpacity>
        <Text style={styles.registerText}>Đăng ký tài khoản MTB 67CS1</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  logoContainer: { marginBottom: 20 },
  logo: { width: 100, height: 100 },
  input: { width: "80%", height: 40, borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10 },
  loginButton: { backgroundColor: "#d43f57", padding: 12, borderRadius: 10, width: "80%", alignItems: "center" },
  loginButtonText: { color: "#fff", fontWeight: "bold" },
  forgotPassword: { marginTop: 10, color: "#555" },
  registerText: { marginTop: 10, fontWeight: "bold", color: "#d43f57" },
});

export default LoginScreen;
