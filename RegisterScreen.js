import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const RegisterScreen = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("./logoh.png")} style={styles.logo} /> 
        <Text style={styles.headerText}>MTB 67CS1</Text>
        <TouchableOpacity>
          <Text style={styles.registerText}>Đăng kí</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <Text style={styles.label}>
        Họ và tên <Text style={styles.required}>*</Text>
      </Text>
      <TextInput style={styles.input} />

      <Text style={styles.label}>
        Số điện thoại <Text style={styles.required}>*</Text>
      </Text>
      <TextInput style={styles.input} keyboardType="phone-pad" />

      <Text style={styles.label}>
        Email <Text style={styles.required}>*</Text>
      </Text>
      <TextInput style={styles.input} keyboardType="email-address" />

      <Text style={styles.label}>
        Mật khẩu <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.passwordContainer}>
        <TextInput style={styles.passwordInput} secureTextEntry={!showPassword} />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
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
            <Text>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
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
              selectedValue={selectedGender}
              onValueChange={(itemValue) => setSelectedGender(itemValue)}
              style={styles.picker}
            >
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
        <Picker style={styles.picker}>
          <Picker.Item label="Chọn khu vực" value="" />
        </Picker>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.registerButton}>
        <Text style={styles.registerButtonText}>Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
};

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
    color: "white",
    marginRight: 10,
  },
  label: {
    marginTop: 15,
    color: "#6D4C41",
  },
  required: {
    color: "red",
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    paddingVertical: 5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 15,
    paddingVertical: 5,
  },
  passwordInput: {
    flex: 1,
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
    paddingVertical: 10,
  },
  registerButton: {
    backgroundColor: "#BDBDBD",
    padding: 15,
    alignItems: "center",
    borderRadius: 20,
    marginTop: 10,
    width: "80%",
    alignSelf: "center",
  },
  registerButtonText: {
    color: "#FFFFFF",
  },
});

export default RegisterScreen;