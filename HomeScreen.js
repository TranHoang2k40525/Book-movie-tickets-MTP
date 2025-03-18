import React from "react";
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require("./assets/images/icon1.png")} style={styles.logo} />
          <Text style={styles.headerText}>MTV 67CS1</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Text style={styles.activeTab}>Đang Chiếu</Text>
        <Text style={styles.inactiveTab}>Đặc Biệt</Text>
        <Text style={styles.inactiveTab}>Sắp Chiếu</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <TextInput placeholder="Tìm rạp gần bạn" style={styles.searchInput} />
      </View>

      {/* Movie List */}
      <ScrollView>
        <View style={styles.movieContainer}>
          <Image 
            source={require("./assets/images/nhagiatien.png")}  
            style={styles.posterImage}
          />
         
          <View style={styles.movieDetails}>
            <Text style={styles.movieTitle}>Nhà gia tiên</Text>
            <Text>Đạo diễn: Huỳnh Lập</Text>
            <Text>Thể loại: Gia đình, Hài</Text>
            <Text>Khởi chiếu: 21/02/2025</Text>
            <Text>Thời lượng: 117 phút</Text>
            <Text>Ngôn ngữ: Tiếng Việt - Phụ đề Tiếng Anh</Text>
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Đặt vé</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d43f57",
  },
  menuButton: {
    padding: 10,
  },
  menuIcon: {
    fontSize: 24,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  activeTab: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#d43f57",
  },
  inactiveTab: {
    fontSize: 16,
    color: "#555",
  },
  searchBox: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  searchInput: {
    fontSize: 16,
  },
  movieContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  posterImage: {
    width: 150,
    height: 220,
    borderRadius: 10,
  },
  movieDetails: {
    flex: 1,
    marginLeft: 15,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  bookButton: {
    backgroundColor: "#d43f57",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default HomeScreen;
