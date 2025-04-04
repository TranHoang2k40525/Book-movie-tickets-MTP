import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import { UserContext } from "./User/UserContext";

import { getAccount, getCustomer, updateCustomer, deleteAccount } from "./api";

export default function AccountInfoScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    AccountName: "",
    AccountPhone: "",
    AccountEmail: "",
    AccountDate: "",
    AccountGender: "",
    Province: "",
    District: "",
    AccountCinema: "CGV Indochina Plaza Hà Nội",
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get("https://provinces.open-api.vn/api/p/");
        setProvinces(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách tỉnh/thành!");
      }
    };

    const fetchAccountInfo = async () => {
      if (!user) {
        navigation.navigate("Login", { from: "AccountInfo" });
        return;
      }

      try {
        const response = await getAccount({ accountID: user.AccountID });
        const customerResponse = await getCustomer({ accountID: user.AccountID });

        const accountData = response.data.account;
        const customerData = customerResponse.data.customer;

        const province = customerData.CustomerAddress ? customerData.CustomerAddress.split(", ")[0] : "";
        const district = customerData.CustomerAddress ? customerData.CustomerAddress.split(", ")[1] : "";

        setAccountInfo({
          AccountName: customerData.CustomerName || "Không có thông tin",
          AccountPhone: customerData.CustomerPhone || "Không có thông tin",
          AccountEmail: customerData.CustomerEmail || "Không có thông tin",
          AccountDate: customerData.CustomerDate || "",
          AccountGender: customerData.CustomerGender || "",
          Province: province,
          District: district,
          AccountCinema: "CGV Indochina Plaza Hà Nội",
        });
        setSelectedProvince(province);
        setSelectedDistrict(district);

        if (province) {
          const selectedProvinceData = provinces.find((p) => p.name === province);
          if (selectedProvinceData) {
            const districtResponse = await axios.get(
              `https://provinces.open-api.vn/api/p/${selectedProvinceData.code}?depth=2`
            );
            setDistricts(districtResponse.data.districts);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin tài khoản:", error);
        setAccountInfo({
          AccountName: "Không có thông tin",
          AccountPhone: "Không có thông tin",
          AccountEmail: "Không có thông tin",
          AccountDate: "",
          AccountGender: "",
          Province: "",
          District: "",
          AccountCinema: "CGV Indochina Plaza Hà Nội",
        });
      }
    };

    fetchProvinces();
    fetchAccountInfo();
  }, [user, navigation]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvince) {
        const selectedProvinceData = provinces.find((p) => p.name === selectedProvince);
        if (selectedProvinceData) {
          try {
            const response = await axios.get(
              `https://provinces.open-api.vn/api/p/${selectedProvinceData.code}?depth=2`
            );
            setDistricts(response.data.districts);
            setSelectedDistrict("");
          } catch (error) {
            console.error("Lỗi khi lấy danh sách quận/huyện:", error);
            Alert.alert("Lỗi", "Không thể tải danh sách quận/huyện!");
          }
        }
      } else {
        setDistricts([]);
        setSelectedDistrict("");
      }
    };

    fetchDistricts();
  }, [selectedProvince, provinces]);

  const handleSave = async () => {
    if (
      !accountInfo.AccountName ||
      !accountInfo.AccountPhone ||
      !accountInfo.AccountEmail ||
      !selectedProvince ||
      !selectedDistrict
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    try {
      const updatedData = {
        accountID: user.AccountID,
        customerName: accountInfo.AccountName,
        customerPhone: accountInfo.AccountPhone,
        customerEmail: accountInfo.AccountEmail,
        customerDate: accountInfo.AccountDate || null,
        customerGender: accountInfo.AccountGender || null,
        customerAddress: `${selectedProvince}, ${selectedDistrict}`,
      };

      const response = await updateCustomer(updatedData);
      Alert.alert("Thành công", response.data.message, [
        { text: "OK", onPress: () => setIsEditing(false) },
      ]);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      Alert.alert("Lỗi", "Cập nhật thông tin thất bại!");
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Xác nhận xóa tài khoản",
      "Bạn sẽ mất toàn bộ số điểm, Voucher, và các quyền lợi thành viên khác của tài khoản\n" +
        "Sau khi xóa thành công, tài khoản sẽ không thể khôi phục. Đồng thời bạn sẽ không thể đăng nhập lại khi tài khoản đã xóa.\n" +
        "Các thông tin cá nhân liên quan đến tài khoản MTB 67CS1 sẽ bị xóa, MTB 67CS1 sẽ không chịu bất kì trách nhiệm cho bất kỳ mất mát nào về thông tin, dữ liệu sau khi xóa tài khoản\n" +
        "Cảm ơn quý khách đã lắng nghe",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await deleteAccount({ accountID: user.AccountID });
              Alert.alert("Thành công", "Tài khoản đã được xóa!", [
                {
                  text: "OK",
                  onPress: () => {
                    setUser(null);
                    navigation.navigate("Home");
                  },
                },
              ]);
            } catch (error) {
              console.error("Lỗi khi xóa tài khoản:", error);
              Alert.alert("Lỗi", "Xóa tài khoản thất bại!");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Thông tin tài khoản</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Họ tên *</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={accountInfo.AccountName}
              onChangeText={(text) => setAccountInfo({ ...accountInfo, AccountName: text })}
            />
          ) : (
            <Text style={styles.value}>{accountInfo.AccountName}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Số điện thoại *</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={accountInfo.AccountPhone}
              onChangeText={(text) => setAccountInfo({ ...accountInfo, AccountPhone: text })}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{accountInfo.AccountPhone}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email *</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={accountInfo.AccountEmail}
              onChangeText={(text) => setAccountInfo({ ...accountInfo, AccountEmail: text })}
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.value}>{accountInfo.AccountEmail}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày sinh</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={accountInfo.AccountDate}
              onChangeText={(text) => setAccountInfo({ ...accountInfo, AccountDate: text })}
              placeholder="YYYY-MM-DD"
            />
          ) : (
            <View style={styles.valueRow}>
              <Text style={styles.value}>{accountInfo.AccountDate || "Không có thông tin"}</Text>
              <Icon name="caret-down" size={16} color="#000" />
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Giới tính</Text>
          {isEditing ? (
            <Picker
              selectedValue={accountInfo.AccountGender}
              style={styles.picker}
              onValueChange={(itemValue) => setAccountInfo({ ...accountInfo, AccountGender: itemValue })}
            >
              <Picker.Item label="Chọn giới tính" value="" />
              <Picker.Item label="Nam" value="male" />
              <Picker.Item label="Nữ" value="female" />
            </Picker>
          ) : (
            <View style={styles.valueRow}>
              <Text style={styles.value}>{accountInfo.AccountGender || "Không có thông tin"}</Text>
              <Icon name="caret-down" size={16} color="#000" />
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Tỉnh/Thành phố *</Text>
          {isEditing ? (
            <Picker
              selectedValue={selectedProvince}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedProvince(itemValue)}
            >
              <Picker.Item label="Chọn tỉnh/thành" value="" />
              {provinces.map((province) => (
                <Picker.Item key={province.code} label={province.name} value={province.name} />
              ))}
            </Picker>
          ) : (
            <View style={styles.valueRow}>
              <Text style={styles.value}>{selectedProvince || "Không có thông tin"}</Text>
              <Icon name="caret-down" size={16} color="#000" />
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Quận/Huyện *</Text>
          {isEditing ? (
            <Picker
              selectedValue={selectedDistrict}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
              enabled={!!selectedProvince}
            >
              <Picker.Item label="Chọn quận/huyện" value="" />
              {districts.map((district) => (
                <Picker.Item key={district.code} label={district.name} value={district.name} />
              ))}
            </Picker>
          ) : (
            <View style={styles.valueRow}>
              <Text style={styles.value}>{selectedDistrict || "Không có thông tin"}</Text>
              <Icon name="caret-down" size={16} color="#000" />
            </View>
          )}
        </View>

        <Text style={styles.note}>* Thông tin bắt buộc</Text>
      </View>

      {isEditing ? (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>LƯU THÔNG TIN</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.saveButtonText}>SỬA THÔNG TIN</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
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
    backgroundColor: "#e74c3c",
    padding: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  infoContainer: {
    padding: 20,
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 15,
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#000",
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    fontSize: 16,
    color: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 5,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  note: {
    fontSize: 14,
    color: "#e74c3c",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  deleteButton: {
    paddingVertical: 15,
    marginHorizontal: 20,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#1E90FF",
  },
});