import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { resetPassword } from "./api"; 

export default function ResetPasswordScreen({ navigation, route }) {
  const { email = "", from = null } = route.params || {};
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  console.log("Route params in ResetPasswordScreen:", route.params);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    const payload = { email, newPassword };
    console.log("Dữ liệu gửi đi:", payload);
    try {
      const response = await resetPassword(payload);
      const targetScreen = from === "Member" ? "Member" : "Login";
      Alert.alert("Thành công", response.data.message, [
        {
          text: "OK",
          onPress: () => {
            if (from === "Member") {
              navigation.navigate("Member");
            } else {
              navigation.navigate("Login", { email, password: newPassword });
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      setError(error.response?.data?.message || "Đổi mật khẩu thất bại!");
    }
  };

  const headerTitle = from === "Member" ? "Đổi mật khẩu" : "Đặt lại mật khẩu";
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>
            <Icon name="arrow-left" size={20} color="#fff" /> Quay lại
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{headerTitle}</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Nhập mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu mới"
          placeholderTextColor="#888"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            setError("");
          }}
          secureTextEntry
        />

        <Text style={styles.label}>Nhập lại mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setError("");
          }}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleResetPassword}
        >
          <Text style={styles.continueButtonText}>Đổi mật khẩu</Text>
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
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