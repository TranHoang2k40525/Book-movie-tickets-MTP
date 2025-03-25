import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome";
import { NavigationProp } from "@react-navigation/native";
import Menu from "./Menu";
import { UserContext } from "./User/UserContext.js";

// Không cần khai báo interface trong .js
export default function Home({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("Đang chiếu");
  const [searchText, setSearchText] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);

  // Fetch movies từ API khi component mount
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      // Thay localhost bằng IP thực tế hoặc domain nếu chạy trên device thật
      const response = await fetch("http://192.168.36.105:3000/api/movies");
      if (!response.ok) {
        throw new Error("Không thể lấy danh sách phim");
      }
      const data = await response.json();
      setMovies(data.movies);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phim:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Lọc phim theo tab
  const filterMovies = () => {
    const today = new Date();
    return movies.filter((movie) => {
      const releaseDate = new Date(movie.MovieReleaseDate);
      if (selectedTab === "Đang chiếu") {
        return releaseDate <= today;
      } else if (selectedTab === "Sắp chiếu") {
        return releaseDate > today;
      } else if (selectedTab === "Đặc biệt") {
        return movie.MovieGenre?.includes("Đặc biệt");
      }
      return true;
    });
  };

  const renderMovieCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("MovieDetail", { movie: item })}
    >
      <View style={styles.movieCard}>
        <Image
          source={{ uri: item.ImageUrl || "https://via.placeholder.com/200" }}
          style={styles.movieImage}
        />
        <Text style={styles.movieTitle}>{item.MovieTitle}</Text>
        <Text style={styles.movieDate}>Khởi chiếu {item.MovieReleaseDate}</Text>
      </View>
    </TouchableOpacity>
  );

  // Xử lý khi đang loading hoặc có lỗi
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải danh sách phim...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Có lỗi xảy ra: {error}</Text>
        <TouchableOpacity onPress={fetchMovies} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.fixedHeader}>
        <View style={styles.header}>
          <Image
            source={require("./assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.headerText}>MTB 67CS1</Text>
          <View style={styles.rightSection}>
            <Image
              source={require("./assets/images/icon1.png")}
              style={styles.ticketIcon}
            />
            <Menu navigation={navigation} />
          </View>
        </View>

        <View style={styles.tabContainer}>
          {["Đang chiếu", "Đặc biệt", "Sắp chiếu"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm rạp gần đây..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>
              <Icon name="search" size={24} color="black" />
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Movie List */}
      <ScrollView style={styles.scrollContent}>
        <View style={styles.horizontalMovieContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filterMovies()}
            keyExtractor={(item) => item.MovieID.toString()}
            renderItem={renderMovieCard}
          />
        </View>

        <View style={styles.fullMovieList}>
          {movies.map((movie) => (
            <TouchableOpacity
              key={movie.MovieID}
              onPress={() => navigation.navigate("MovieDetail", { movie })}
            >
              <View style={styles.fullMovieCard}>
                <Image
                  source={{
                    uri: movie.ImageUrl || "https://via.placeholder.com/100",
                  }}
                  style={styles.fullMovieImage}
                />
                <View style={styles.movieInfo}>
                  <Text style={styles.fullMovieTitle}>{movie.MovieTitle}</Text>
                  {movie.MovieDirector && (
                    <Text>Đạo diễn: {movie.MovieDirector}</Text>
                  )}
                  {movie.MovieGenre && (
                    <Text>Thể loại: {movie.MovieGenre}</Text>
                  )}
                  <Text>Khởi chiếu: {movie.MovieReleaseDate}</Text>
                  <Text>Thời lượng: {movie.MovieRuntime} phút</Text>
                  <Text>Ngôn ngữ: {movie.MovieLanguage}</Text>
                  <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>Đặt vé</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Thêm styles mới cho loading và error
const styles = StyleSheet.create({
  // Các style hiện có giữ nguyên...
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#ff4d6d",
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  // Các style khác...
  container: { flex: 1, backgroundColor: "white" },
  fixedHeader: { backgroundColor: "white" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
    height: 70,
  },
  scrollContent: { flex: 1 },
  horizontalMovieContainer: { paddingVertical: 10 },
  logo: { width: 35, height: 35, resizeMode: "contain" },
  headerText: {
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#e74c3c",
    marginHorizontal: 5,
  },
  rightSection: { flexDirection: "row", alignItems: "center" },
  ticketIcon: { width: 28, height: 18, resizeMode: "contain", marginRight: 10 },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffb6c1",
    padding: 10,
  },
  tab: { paddingVertical: 0 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#ff4d6d" },
  tabText: { fontSize: 16, color: "#444" },
  activeTabText: { fontWeight: "bold", color: "#ff4d6d" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 0,
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },
  searchButton: { padding: 5, borderRadius: 10 },
  searchButtonText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
  movieCard: {
    margin: 5,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  movieImage: { width: 200, height: 200, resizeMode: "cover" },
  movieTitle: { fontWeight: "bold", textAlign: "center", padding: 5 },
  movieDate: { textAlign: "center", color: "gray" },
  fullMovieList: { marginTop: 20, paddingHorizontal: 10 },
  fullMovieCard: {
    flexDirection: "row",
    backgroundColor: "white",
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  fullMovieImage: { width: 100, height: 150, resizeMode: "cover" },
  movieInfo: { flex: 1, padding: 10 },
  fullMovieTitle: { fontSize: 18, fontWeight: "bold" },
  bookButton: {
    backgroundColor: "#ff4d6d",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  bookButtonText: { color: "white", fontWeight: "bold" },
});