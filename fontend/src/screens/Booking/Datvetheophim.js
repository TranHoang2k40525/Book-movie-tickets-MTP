import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../../contexts/User/UserContext";
import { getMovies, getMoviesShowingToday } from "../../Api/api"; 

const { width } = Dimensions.get("window");

const Datvetheophim = ({ navigation }) => {
  const { user } = useContext(UserContext); 
  const scrollViewRef = useRef(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isNowShowingActive, setIsNowShowingActive] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // Kiểm tra đăng nhập ngay khi vào màn hình
  useEffect(() => {
    if (!user) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để đặt vé theo phim. Bạn có muốn đăng nhập ngay bây giờ không?",
        [
          { text: "Hủy", style: "cancel", onPress: () => navigation.goBack() },
          { text: "Đăng nhập", onPress: () => navigation.navigate("Login", { from: "Datvetheophim" }) },
        ],
        { cancelable: false }
      );
    } else {
      fetchMovies(); // Lấy tất cả phim khi vào màn hình
    }
  }, [user, navigation]);

  // Hàm lấy danh sách tất cả phim
  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMovies();
      setMovies(response.data.movies);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phim:", err);
      setError(err.message || "Không thể lấy danh sách phim");
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách phim đang chiếu hôm nay
  const fetchMoviesShowingToday = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMoviesShowingToday();
      setMovies(response.data.movies);
    } catch (err) {
      
      setError("Hôm nay hiện không có phim nào đang chiếu");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý cuộn để hiển thị nút "Lên đầu"
  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    setShowScrollToTop(scrollY + scrollViewHeight >= contentHeight - 50);
  };

  // Cuộn lên đầu
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Xử lý khi nhấn vào phim
  const handleMoviePress = (movieId) => {
    navigation.navigate("MovieBookingScreen", { movieId });
  };

  // Xử lý nút "Đang chiếu"
  const toggleNowShowing = () => {
    setIsNowShowingActive(!isNowShowingActive);
    if (!isNowShowingActive) {
      fetchMoviesShowingToday(); // Khi bật "Đang chiếu", lấy phim hôm nay
    } else {
      fetchMovies(); // Khi tắt "Đang chiếu", lấy tất cả phim
    }
  };

  // Xử lý khi đang loading hoặc có lỗi
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
        <Text>Đang tải danh sách phim...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Có lỗi xảy ra: {error}</Text>
        <TouchableOpacity onPress={isNowShowingActive ? fetchMoviesShowingToday : fetchMovies} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="#e31937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn phim của bạn</Text>
        </View>
      </View>

      {/* Now Showing Filter Bar */}
      <View style={styles.nowShowingContainer}>
        <TouchableOpacity onPress={toggleNowShowing} style={styles.nowShowingButton}>
          <Ionicons
            name="checkmark"
            size={18}
            color={isNowShowingActive ? "#e31937" : "#999"}
            style={styles.checkIcon}
          />
          <Text
            style={[
              styles.nowShowingText,
              isNowShowingActive && styles.activeNowShowingText,
            ]}
          >
            Đang chiếu
          </Text>
        </TouchableOpacity>
      </View>

      {/* Movie List */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {movies.map((movie) => (
          <TouchableOpacity
            key={movie.MovieID}
            style={styles.movieCard}
            onPress={() => handleMoviePress(movie.MovieID)}
          >
            <Image
              source={
                movie.ImageUrl
                  ? { uri: `data:image/png;base64,${movie.ImageUrl}` }
                  : { uri: "https://via.placeholder.com/100" }
              }
              style={styles.movieImage}
              resizeMode="cover"
            />
            <View style={styles.movieInfo}>
              <Text style={styles.movieTitle}>{movie.MovieTitle}</Text>
              <View style={styles.movieDetail}>
                <Ionicons name="calendar" size={16} color="#666" />
                <Text style={styles.movieText}>
                  {new Date(movie.MovieReleaseDate).toLocaleDateString("vi-VN")}{" "}
                  ({movie.MovieRating || "N/A"})
                </Text>
              </View>
              <View style={styles.movieDetail}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.movieText}>{movie.MovieRuntime} phút</Text>
              </View>
              <View style={styles.movieFormat}>
                <Text style={styles.formatText}>{movie.MovieFormat || "2D"}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <TouchableOpacity
          style={styles.scrollToTopButton}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={24} color="white" />
          <Text style={styles.scrollToTopText}>Lên đầu</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Styles giữ nguyên
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    marginTop: 30,
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 5,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  iconButton: {
    padding: 5,
  },
  nowShowingContainer: {
    marginTop: 80,
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  nowShowingButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    marginRight: 5,
  },
  nowShowingText: {
    fontSize: 14,
    color: "#999",
  },
  activeNowShowingText: {
    color: "#e31937",
    fontWeight: "bold",
  },
  scrollView: {
    marginTop: 10,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  movieCard: {
    backgroundColor: "white",
    borderRadius: 10,
    marginHorizontal: 15,
    marginVertical: 8,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  movieImage: {
    width: 100,
    height: 140,
  },
  movieInfo: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  movieDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  movieText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  movieFormat: {
    marginTop: 8,
  },
  formatText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "blue",
  },
  scrollToTopButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#e31937",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 5,
  },
  scrollToTopText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
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
});

export default Datvetheophim;