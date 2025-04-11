import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome";
import Menu from "./Menu";
import { getMovies } from "./api";
import { UserContext } from "./User/UserContext";

export default function Home({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("Đang chiếu");
  const [searchText, setSearchText] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMovies();
      setMovies(response.data.movies);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phim:", error);
      setError(error.message || "Không thể lấy danh sách phim");
    } finally {
      setLoading(false);
    }
  };

  const filterMovies = () => {
    const currentDate = new Date("2025-03-31");
    const march2025Start = new Date("2025-03-01");
    const march2025End = new Date("2025-03-31");
    const april2025Start = new Date("2025-04-01");
    const april2025End = new Date("2025-04-30");
    const specialMovieIds = [1, 4, 10, 20, 25, 15];

    return movies.filter((movie) => {
      const releaseDate = new Date(movie.MovieReleaseDate);
      if (selectedTab === "Đang chiếu") {
        return (
          releaseDate >= march2025Start &&
          releaseDate <= march2025End &&
          releaseDate <= currentDate
        );
      } else if (selectedTab === "Sắp chiếu") {
        return releaseDate >= april2025Start && releaseDate <= april2025End;
      } else if (selectedTab === "Đặc biệt") {
        return specialMovieIds.includes(movie.MovieID);
      }
      return true;
    });
  };

  const handleBookPress = (movieId) => {
    if (!user) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để đặt vé. Bạn có muốn đăng nhập ngay bây giờ không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng nhập",
            onPress: () =>
              navigation.navigate("Login", { from: "Home", movieId }), // Truyền movieId để quay lại nếu cần
          },
        ]
      );
    } else {
      navigation.navigate("MovieBookingScreen", { movieId }); // Chuyển sang MovieBookingScreen với movieId
    }
  };

  const renderMovieCard = ({ item }) => {
    const imageSource = item.ImageUrl
      ? { uri: `data:image/png;base64,${item.ImageUrl}` }
      : { uri: "https://via.placeholder.com/200" };

    return (
      <TouchableOpacity
        onPress={() => {
          console.log(
            "Navigating to MovieDetailsScreen with movieId:",
            item.MovieID
          ); // Debug log
          navigation.navigate("MovieDetailsScreen", { movieId: item.MovieID });
        }}
      >
        <View style={styles.movieCard}>
          <Image source={imageSource} style={styles.movieImage} />
          <Text style={styles.movieTitle}>{item.MovieTitle}</Text>
          <Text style={styles.movieDate}>
            Khởi chiếu{" "}
            {new Date(item.MovieReleaseDate).toLocaleDateString("vi-VN")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
        <Text>
          Đang tải danh sách phim...</Text>
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
          {movies.map((movie) => {
            const imageSource = movie.ImageUrl
              ? { uri: `data:image/png;base64,${movie.ImageUrl}` }
              : { uri: "https://via.placeholder.com/100" };

            return (
              <TouchableOpacity
                key={movie.MovieID}
                onPress={() => {
                  console.log(
                    "Navigating to MovieDetailsScreen with movieId:",
                    movie.MovieID
                  ); // Debug log
                  navigation.navigate("MovieDetailsScreen", {
                    movieId: movie.MovieID,
                  });
                }}
              >
                <View style={styles.fullMovieCard}>
                  <Image source={imageSource} style={styles.fullMovieImage} />
                  <View style={styles.movieInfo}>
                    <Text style={styles.fullMovieTitle}>
                      {movie.MovieTitle}
                    </Text>
                    {movie.MovieDirector && (
                      <Text>Đạo diễn: {movie.MovieDirector}</Text>
                    )}
                    {movie.MovieGenre && (
                      <Text>Thể loại: {movie.MovieGenre}</Text>
                    )}
                    <Text>
                      Khởi chiếu:{" "}
                      {new Date(movie.MovieReleaseDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </Text>
                    <Text>Thời lượng: {movie.MovieRuntime} phút</Text>
                    <Text>Ngôn ngữ: {movie.MovieLanguage}</Text>
                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() => handleBookPress(movie.MovieID)}
                    >
                      <Text style={styles.bookButtonText}>Đặt vé</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  container: { flex: 1, backgroundColor: "white" },
  fixedHeader: { backgroundColor: "white" },
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
  scrollContent: { flex: 1 },
  horizontalMovieContainer: { paddingVertical: 0 },
  logo: { width: 35, height: 35, resizeMode: "contain" },
  headerText: {
    fontSize: 16,
    fontStyle: "italic",
    flexWrap: 'wrap',
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
