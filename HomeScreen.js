import React from "react";
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView } from "react-native";

const HomeScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 40 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#d43f57" }}>MTB</Text>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#d43f57" }}>67CS1</Text>
        <TouchableOpacity>
          <Text style={{ fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#d43f57" }}>Đang Chiếu</Text>
        <Text style={{ fontSize: 16 }}>Đặc Biệt</Text>
        <Text style={{ fontSize: 16 }}>Sắp Chiếu</Text>
      </View>

      {/* Search Bar */}
      <View style={{ marginHorizontal: 20, marginBottom: 20, borderWidth: 1, borderRadius: 10, padding: 10 }}>
        <TextInput placeholder="Tìm rạp gần bạn" style={{ fontSize: 16 }} />
      </View>

      {/* Movie List */}
      <ScrollView>
        <View style={{ alignItems: "center", paddingBottom: 20 }}>
          <Image 
            source={{ uri: "https://example.com/poster.jpg" }}
            style={{ width: 250, height: 350, borderRadius: 10 }}
          />
          <View style={{ backgroundColor: "#fff", padding: 10, alignItems: "center", marginTop: -30, borderRadius: 10, width: 250, shadowOpacity: 0.1, shadowRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Nhà gia tiên</Text>
            <Text>Đạo diễn: Huỳnh Lập</Text>
            <Text>Thể loại: Gia đình, Hài</Text>
            <Text>Khởi chiếu: 21/02/2025</Text>
            <Text>Thời lượng: 117 phút</Text>
            <Text>Ngôn ngữ: Tiếng Việt - Phụ đề Tiếng Anh</Text>
            <TouchableOpacity style={{ backgroundColor: "#d43f57", padding: 10, borderRadius: 10, marginTop: 10 }}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Đặt vé</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
