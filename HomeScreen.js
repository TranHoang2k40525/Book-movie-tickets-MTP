import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  Modal,
} from "react-native";

const movies = [
  {
    id: "1",
    title: "Nhà gia tiên",
    image: require("./assets/images/nhagiatien.png"),
    director: "Huỳnh Lập",
    genre: "Gia đình, Hài",
    release: "21/02/2025",
    duration: "117 phút",
  },
  {
    id: "2",
    title: "Điền Âm Hồn",
    image: require("./assets/images/tranformer.jpg"),
    director: "Đạo diễn A",
    genre: "Kinh dị",
    release: "10/03/2025",
    duration: "100 phút",
  },
  {
    id: "3",
    title: "Kẻ đồng hành",
    image: require("./assets/images/natra2.jpg"),
    director: "Đạo diễn B",
    genre: "Tâm lý",
    release: "15/04/2025",
    duration: "120 phút",
  },
  {
    id: "4",
    title: "Kẻ đồng hành",
    image: require("./assets/images/kedonghanh.png"),
    director: "Disney",
    genre: "Phiêu lưu",
    release: "01/06/2025",
    duration: "115 phút",
  },
];

const HomeScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("./assets/images/icon1.png")}
            style={styles.logo}
          />
          <Text style={styles.headerText}>MTB 67CS1</Text>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
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
      {/* Horizontal Scroll for Featured Movies */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {movies.map((movie) => (
          <View key={movie.id} style={styles.featuredMovie}>
            <Image source={movie.image} style={styles.featuredImage} />
            <Text style={styles.movieTitle}>{movie.title}</Text>
            <Text>
              {movie.genre} | {movie.duration}
            </Text>
            <Text>Khởi chiếu: {movie.release}</Text>
          </View>
        ))}
      </ScrollView>
      {/* Movie List */}
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.movieContainer}>
            <Image source={item.image} style={styles.posterImage} />
            <View style={styles.movieDetails}>
              <Text style={styles.movieTitle}>{item.title}</Text>
              <Text>Đạo diễn: {item.director}</Text>
              <Text>Thể loại: {item.genre}</Text>
              <Text>Khởi chiếu: {item.release}</Text>
              <Text>Thời lượng: {item.duration}</Text>
              <TouchableOpacity style={styles.bookButton}>
                <Text style={styles.bookButtonText}>Đặt vé</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      {/* Modal Menu */}
      <Modal transparent={true} visible={menuVisible} animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menu}>
            <TouchableOpacity
              onPress={() => navigation.navigate("LoginScreen")}
            >
              <Text style={styles.menuText}>Đăng nhập / Đăng kí</Text>
            </TouchableOpacity>

            <Text style={styles.menuText}>Đặt vé theo phim</Text>
            <Text style={styles.menuText}>Đặt vé theo rạp</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, marginRight: 10 },
  headerText: { fontSize: 18, fontWeight: "bold", color: "#d43f57" },
  menuButton: { padding: 10 },
  menuIcon: { fontSize: 24 },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  activeTab: { fontSize: 16, fontWeight: "bold", color: "#d43f57" },
  inactiveTab: { fontSize: 16, color: "#555" },
  searchBox: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  searchInput: { fontSize: 16 },
  horizontalScroll: { paddingHorizontal: 10, marginBottom: 20 },
  featuredMovie: { alignItems: "center", marginRight: 15 },
  featuredImage: { width: 150, height: 200, borderRadius: 10 },
  movieContainer: {
    flexDirection: "row",
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  posterImage: { width: 120, height: 180, borderRadius: 10 },
  movieDetails: { flex: 1, marginLeft: 15 },
  movieTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  bookButton: {
    backgroundColor: "#d43f57",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  bookButtonText: { color: "#fff", fontWeight: "bold" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: { width: 250, backgroundColor: "#222", padding: 20, borderRadius: 10 },
  menuText: { color: "#fff", fontSize: 18, marginBottom: 15 },
});

export default HomeScreen;
