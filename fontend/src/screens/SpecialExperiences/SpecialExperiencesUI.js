import React, { useState } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Menu from "../../components/Menu"; // Import component Menu

const specialExperiences = [
  { name: "SWEETBOX", description: "Chỗ ngồi Phù Hợp Cặp Đôi", image: require("../../assets/dep1.png") },
  { name: "4DX", description: "", image: require("../../assets/dep2.png") },
  { name: "IMAX", description: "Live It", image: require("../../assets/dep3.png") },
  { name: "GOLDCLASS", description: "Phòng Chiếu Hạng Thương Gia", image: require("../../assets/dep4.png") },
  { name: "L'AMOUR", description: "Rạp Chiếu Phim Giường Nằm", image: require("../../assets/dep5.png") },
  { name: "STARIUM", description: "Màn hình cong lớn, chuẩn quốc tế", image: require("../../assets/dep6.png") },
  { name: "SCREENX", description: "", image: require("../../assets/dep7.png") },
  { name: "CINE & FORÊT", description: "Rạp Phim Trong Rừng", image: require("../../assets/dep8.png") },
  { name: "CINE & SUITE", description: "", image: require("../../assets/dep9.png") },
  { name: "CINE VIP", description: "Trải nghiệm sang trọng bậc nhất", image: require("../../assets/dep10.png") },
];

export default function SpecialExperiencesUI() {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false); // Trạng thái để mở/đóng menu

  // Hàm mở/đóng menu
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  const handleExperiencePress = (experience) => {
    if (experience.name === "SWEETBOX") {
      navigation.navigate("SweetBox"); // Điều hướng đến màn hình SweetBox
    } else {
      console.log(`Nhấn vào: ${experience.name}`);
    }
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Rạp phim MTB</Text>

        {/* Nút menu để mở menu modal */}
        <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
          <Menu navigation={navigation} />
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Trải Nghiệm Sự Đặc Biệt</Text>
        <Text style={styles.subtitleText}>
          Đến với MTB để thưởng thức những điều đặc biệt trên cả sự mong đợi của bạn!
        </Text>
      </View>

      {/* Special Experiences List */}
      <FlatList
        data={specialExperiences}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleExperiencePress(item)}
          >
            <Image source={item.image} style={styles.image} />
            <View style={styles.overlay}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Tích hợp component Menu */}
      
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
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 0,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingTop: 10,
  },
  iconButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
    marginLeft: -170,
  },
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