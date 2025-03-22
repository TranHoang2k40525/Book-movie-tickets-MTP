import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

import { NavigationProp } from '@react-navigation/native';

export default function ForgotPasswordScreen({ navigation }: { navigation: NavigationProp<any> }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // Mảng 6 ô cho OTP
  const [generatedOtp, setGeneratedOtp] = useState(""); // Lưu mã OTP giả lập
  const [isOtpSent, setIsOtpSent] = useState(false); // Trạng thái để hiển thị phần nhập OTP
  const otpInputs = useRef([]); // Ref để điều khiển focus giữa các ô OTP

  // Hàm tạo mã OTP 6 số ngẫu nhiên
  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo số ngẫu nhiên 6 chữ số
    return otp;
  };

  const handleSendOtp = () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email hoặc số điện thoại!");
      return;
    }

    // Kiểm tra định dạng email (cơ bản)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ!");
      return;
    }

    // Tạo mã OTP
    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    setIsOtpSent(true);

    // In mã OTP ra terminal
    console.log(`Mã OTP đã được gửi đến ${email}: ${newOtp}`);

    // Giả lập gửi email
    Alert.alert("Thành công", `Mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra email!`, [
      { text: "OK" },
    ]);
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join(""); // Ghép 6 ô OTP thành một chuỗi
    if (!enteredOtp || enteredOtp.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ 6 chữ số OTP!");
      return;
    }

    if (enteredOtp !== generatedOtp) {
      Alert.alert("Lỗi", "Mã OTP không đúng!");
      return;
    }

    // Nếu mã OTP đúng, điều hướng đến màn hình đặt lại mật khẩu
    try {
      navigation.navigate("ResetPassword", { email });
    } catch (error) {
      Alert.alert("Lỗi", "Không thể điều hướng đến màn hình đặt lại mật khẩu!");
      console.error("Navigation error:", error);
    }
  };

  // Xử lý khi người dùng nhập OTP
  const handleOtpChange = (text: string, index: number) => {
    // Chỉ cho phép nhập số
    if (text && !/^[0-9]$/.test(text)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Chuyển focus sang ô tiếp theo nếu đã nhập 1 ký tự
    if (text && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    // Chuyển focus về ô trước đó nếu xóa ký tự
    if (!text && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>
            <Icon name="arrow-left" size={20} color="#fff" /> Quay lại
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Quên mật khẩu</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Nhập email hoặc số điện thoại</Text>
        <TextInput
          style={styles.input}
          placeholder="Email hoặc số điện thoại"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!isOtpSent} // Không cho chỉnh sửa email sau khi gửi OTP
        />

        {isOtpSent && (
          <>
            <Text style={styles.label}>Nhập mã OTP đã gửi đến {email}</Text>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  ref={(ref) => (otpInputs.current[index] = ref)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === "Backspace" && !digit && index > 0) {
                      otpInputs.current[index - 1]?.focus();
                    }
                  }}
                />
              ))}
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.continueButton}
          onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
        >
          <Text style={styles.continueButtonText}>
            {isOtpSent ? "Xác nhận" : "Tiếp tục"}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4D6D",
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
  headerText: {
    flex: 1,
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    color: "#6D4C41",
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: 40,
    height: 40,
    textAlign: "center",
    fontSize: 18,
    color: "#000",
  },
  continueButton: {
    backgroundColor: "#ccc",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  continueButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});