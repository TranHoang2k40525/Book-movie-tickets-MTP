import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { NavigationProp } from "@react-navigation/native";
import { UserContext } from "./User/UserContext";
export default function RegisterScreen({
  navigation,
}: {
  navigation: NavigationProp<any>,
}) {
  // Trạng thái cho các input
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [password, setPassword] = useState(""); // Thêm trạng thái cho mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [customerDate, setCustomerDate] = useState(new Date()); // Đổi tên từ `date` thành `customerDate` cho rõ ràng
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customerGender, setCustomerGender] = useState(""); // Thêm trạng thái cho giới tính

  // Danh sách khu vực
  const areas = [
    { label: "Chọn khu vực", value: "" },
    { label: "Hà Nội", value: "Hà Nội" },
    { label: "TP. Hồ Chí Minh", value: "TP. Hồ Chí Minh" },
    { label: "Đà Nẵng", value: "Đà Nẵng" },
    { label: "Cần Thơ", value: "Cần Thơ" },
  ];

  // Hàm xử lý khi nhấn nút Đăng ký
  const handleRegister = async () => {
    // Kiểm tra các trường bắt buộc
    if (
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !password ||
      !customerGender ||
      !customerAddress ||
      !customerDate
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      Alert.alert("Lỗi", "Email không hợp lệ!");
      return;
    }

    // Kiểm tra số điện thoại (10 chữ số)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(customerPhone)) {
      Alert.alert("Lỗi", "Số điện thoại phải có 10 chữ số!");
      return;
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      const response = await axios.post(
        "http://192.168.1.102:3000/api/register",
        {
          customerName,
          customerEmail,
          customerPhone,
          password,
          customerGender,
          customerDate: customerDate.toISOString().split("T")[0],
          customerAddress,
        }
      );
      Alert.alert("Thành công", response.data.message, [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", error.response?.data?.message || "Đăng ký thất bại!");
    }

    Alert.alert("Thành công", "Đăng ký thành công!", [
      { text: "OK", onPress: () => navigation.navigate("Login") }, // Chuyển về màn hình đăng nhập
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("./assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>MTB 67CS1</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.registerText}>
            <Icon name="arrow-back" size={20} color="white" /> Đăng ký
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <Text style={styles.label}>
        Họ và tên <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập họ và tên"
        value={customerName}
        onChangeText={setCustomerName}
      />

      <Text style={styles.label}>
        Số điện thoại <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập số điện thoại"
        value={customerPhone}
        onChangeText={setCustomerPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>
        Email <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập email"
        value={customerEmail}
        onChangeText={setCustomerEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>
        Mật khẩu <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Nhập mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword} // Sửa để toggle hiển thị mật khẩu
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {/* Pickers */}
      <View style={styles.row}>
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>
            Ngày sinh <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePicker}
          >
            <Text style={styles.dateText}>
              {customerDate.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={customerDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios"); // Giữ picker mở trên iOS
                if (selectedDate) setCustomerDate(selectedDate);
              }}
            />
          )}
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>
            Giới tính <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={customerGender}
              onValueChange={(itemValue) => setCustomerGender(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Chọn giới tính" value="" />
              <Picker.Item label="Nam" value="male" />
              <Picker.Item label="Nữ" value="female" />
            </Picker>
          </View>
        </View>
      </View>

      <Text style={styles.label}>
        Khu vực <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={customerAddress}
          onValueChange={(itemValue) => setCustomerAddress(itemValue)}
          style={styles.picker}
        >
          {areas.map((area) => (
            <Picker.Item
              key={area.value}
              label={area.label}
              value={area.value}
            />
          ))}
        </Picker>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E57373",
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: "space-between",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    flex: 1,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },
  registerText: {
    top: 0,
    color: "white",
    marginRight: 10,
  },
  label: {
    marginTop: 15,
    color: "#6D4C41",
    fontSize: 16,
  },
  required: {
    color: "red",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 15,
    paddingVertical: 8,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 15,
    paddingVertical: 8,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  pickerContainer: {
    flex: 1,
    marginRight: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  datePicker: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  registerButton: {
    backgroundColor: "#E57373",
    padding: 15,
    alignItems: "center",
    borderRadius: 20,
    marginTop: 20,
    width: "80%",
    alignSelf: "center",
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
