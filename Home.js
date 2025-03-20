import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const moviesNowShowing = [
  { id: "1", title: "Transformers Một", releaseDate: "29.2.2025", image: require("./assets/images/transformers.jpg") },
  { id: "2", title: "Kẻ đồng hành", releaseDate: "15.3.2025", image: require("./assets/images/kedonghanh.png") },
  { id: "3", title: "Nhà gia tiên", releaseDate: "1.4.2025", image: require("./assets/images/nhagiatien.jpg") },
];

const allMovies = [
  { id: "4", title: "Nhà gia tiên", director: "Huỳnh Lập", genre: "Gia đình, Hài", releaseDate: "21/02/2025", duration: "117 phút", language: "Tiếng Việt - Phụ đề Tiếng Anh", image: require("./assets/images/nhagiatien.png") },
  { id: "5", title: "Natra2 ", director: "Director 5", genre: "Hành động", releaseDate: "10/03/2025", duration: "120 phút", language: "Tiếng Việt", image: require("./assets/images/natra2.jpg") },
];

export default function Home() {
  const [selectedTab, setSelectedTab] = useState("Đang chiếu");

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["Đang chiếu", "Đặc biệt", "Sắp chiếu"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)} style={[styles.tab, selectedTab === tab && styles.activeTab]}>
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Movie List (Swipeable) */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={moviesNowShowing}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.movieCard}>
            <Image source={item.image} style={styles.movieImage} />
            <Text style={styles.movieTitle}>{item.title}</Text>
            <Text style={styles.movieDate}>Khởi chiếu {item.releaseDate}</Text>
          </View>
        )}
      />

      {/* Full Movie List (Scrollable) */}
      <ScrollView style={styles.fullMovieList}>
        {allMovies.map((movie) => (
          <View key={movie.id} style={styles.fullMovieCard}>
            <Image source={movie.image} style={styles.fullMovieImage} />
            <View style={styles.movieInfo}>
              <Text style={styles.fullMovieTitle}>{movie.title}</Text>
              <Text>Đạo diễn: {movie.director}</Text>
              <Text>Thể loại: {movie.genre}</Text>
              <Text>Khởi chiếu: {movie.releaseDate}</Text>
              <Text>Thời lượng: {movie.duration}</Text>
              <Text>Ngôn ngữ: {movie.language}</Text>
              <TouchableOpacity style={styles.bookButton}><Text style={styles.bookButtonText}>Đặt vé</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8", paddingTop: 40 },
  tabContainer: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#ffb6c1", padding: 10 },
  tab: { paddingVertical: 10 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#ff4d6d" },
  tabText: { fontSize: 16, color: "#444" },
  activeTabText: { fontWeight: "bold", color: "#ff4d6d" },
  movieCard: { width: 200, margin: 10, backgroundColor: "white", borderRadius: 10, overflow: "hidden" },
  movieImage: { width: "100%", height: 250 },
  movieTitle: { fontWeight: "bold", textAlign: "center", padding: 5 },
  movieDate: { textAlign: "center", color: "gray" },
  fullMovieList: { marginTop: 20, paddingHorizontal: 10 },
  fullMovieCard: { flexDirection: "row", backgroundColor: "white", marginBottom: 15, borderRadius: 10, overflow: "hidden" },
  fullMovieImage: { width: 100, height: 150, resizeMode: "cover" },
  movieInfo: { flex: 1, padding: 10 },
  fullMovieTitle: { fontSize: 18, fontWeight: "bold" },
  bookButton: { backgroundColor: "#ff4d6d", padding: 10, marginTop: 10, borderRadius: 5, alignItems: "center" },
  bookButtonText: { color: "white", fontWeight: "bold" },
});