import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { NavigationProp } from '@react-navigation/native';
import { sendOtp } from "./api"; 

export default function ForgotPasswordScreen({ navigation, route }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const otpInputs = useRef([]);
  const [generatedOtp, setGeneratedOtp] = useState("");

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  useEffect(() => {
    let interval;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      Alert.alert("Hết thời gian", "Mã OTP đã hết hạn. Vui lòng thử lại!", [
        {
          text: "OK",
          onPress: () => {
            setIsOtpSent(false);
            setOtp(["", "", "", "", "", ""]);
            setTimer(60);
            setGeneratedOtp("");
          },
        },
      ]);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ!");
      return;
    }

    try {
      const response = await sendOtp({ email });
      const newOtp = generateOtp();
      setGeneratedOtp(newOtp);
      setIsOtpSent(true);
      console.log(`Mã OTP được tạo: ${newOtp}`);
      Alert.alert("Thành công", response.data.message);
    } catch (error) {
      Alert.alert("Không thể kết nối đến server!");
      console.error(error);
    }
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("");
    if (!enteredOtp || enteredOtp.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ 6 chữ số OTP!");
      return;
    }

    if (enteredOtp !== generatedOtp) {
      Alert.alert("Lỗi", "Mã OTP không đúng!");
      return;
    }
    console.log("Route params in ForgotPasswordScreen:", route.params);
    navigation.navigate("ResetPassword", { email, from: route.params?.from });
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      otpInputs.current[index + 1]?.focus();
    } else if (!text && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>
            <Icon name="arrow-left" size={20} color="#fff" /> Quay lại
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Quên mật khẩu</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Nhập email hoặc số điện thoại</Text>
        <TextInput
          style={styles.input}
          placeholder="Email hoặc số điện thoại"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!isOtpSent}
        />

        {isOtpSent && (
          <>
            <Text style={styles.label}>Nhập mã OTP đã gửi đến {email}</Text>
            <Text style={styles.timer}>Thời gian còn lại: {timer}s</Text>
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
  timer: {
    color: "#FF4D6D",
    fontSize: 14,
    marginBottom: 10,
  },
  continueButton: {
    backgroundColor: "#FF4D6D",
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