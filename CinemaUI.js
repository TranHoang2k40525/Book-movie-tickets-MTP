import React from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { useNavigation } from "@react-navigation/native";

// Import ảnh từ thư mục assets
import dep1 from "./assets/dep1.png";
import dep2 from "./assets/dep2.png";
import dep3 from "./assets/dep3.png";
import dep4 from "./assets/dep4.png";
import dep5 from "./assets/dep5.png";
import dep6 from "./assets/dep6.png";
import dep7 from "./assets/dep7.png";
import dep8 from "./assets/dep8.png";
import dep9 from "./assets/dep9.png";
import dep10 from "./assets/dep10.png";

const specialExperiences = [
  { name: "SWEETBOX", description: "Chỗ ngồi Phù Hợp Cặp Đôi", image: dep1 },
  { name: "4DX", description: "", image: dep2 },
  { name: "IMAX", description: "Live It", image: dep3 },
  { name: "GOLDCLASS", description: "Phòng Chiếu Hạng Thương Gia", image: dep4 },
  { name: "L'AMOUR", description: "Rạp Chiếu Phim Giường Nằm", image: dep5 },
  { name: "STARIUM", description: "Màn hình cong lớn, chuẩn quốc tế", image: dep6 },
  { name: "SCREENX", description: "", image: dep7 },
  { name: "CINE & FORÊT", description: "Rạp Phim Trong Rừng", image: dep8 },
  { name: "CINE & SUITE", description: "", image: dep9 },
  { name: "CINE VIP", description: "Trải nghiệm sang trọng bậc nhất", image: dep10 },
];

export default function SpecialExperiencesUI() {
  const navigation = useNavigation(); 

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Rạp phim MTB</Text>

        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconButton}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Phần tiêu đề màu vàng */}
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Trải Nghiệm Sự Đặc Biệt</Text>
        <Text style={styles.subtitleText}>
          Đến với MTB để thưởng thức những điều đặc biệt trên cả sự mong đợi của bạn!
        </Text>
      </View>

      {/* Danh sách trải nghiệm (biến thành các button) */}
      <FlatList
        data={specialExperiences}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => console.log(`Nhấn vào: ${item.name}`)} // Có thể thay bằng navigation.navigate(...)
          >
            <Image source={item.image} style={styles.image} />
            <View style={styles.overlay}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingTop: 50, // Đẩy xuống một chút để không bị sát mép trên
  },
  iconButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red", 
    marginLeft: -150, 
  },

  /* Ô màu vàng */
  titleSection: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  subtitleText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
  },

  /* Danh sách trải nghiệm */
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: 120,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    color: "white",
    fontSize: 12,
  },
});