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
  RefreshControl,
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Modal,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome";
import Menu from "../../components/Menu";
import { getMovies } from "../../Api/api";
import { UserContext } from "../../contexts/User/UserContext";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const isLargeScreen = width >= 414;

export default function Home({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("Đang chiếu");
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [horizontalMovies, setHorizontalMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false); // Loading khi nhấn nút
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const { user, setUser } = useContext(UserContext);
  const [checkedLogin, setCheckedLogin] = useState(false);

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      console.log("Back button pressed on Home screen - staying on Home");
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  // Check login status
  useEffect(() => {
    const checkLogin = async () => {
      if (!user) {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
          setCheckedLogin(true);
        } else {
          Alert.alert(
            "Yêu cầu đăng nhập",
            "Vui lòng đăng nhập để sử dụng dịch vụ",
            [
              { text: "Hủy", style: "cancel", onPress: () => navigation.goBack() },
              { text: "Đăng nhập", onPress: () => navigation.navigate("Login", { from: "Home" }) },
            ],
            { cancelable: false }
          );
        }
      } else {
        setCheckedLogin(true);
      }
    };
    checkLogin();
  }, []);

  // Fetch location and movies
  useEffect(() => {
    if (user && checkedLogin) {
      getUserLocation().then(fetchMovies);
    }
  }, [selectedTab, user, checkedLogin]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Không được cấp quyền truy cập vị trí.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (err) {
      setError("Lỗi khi lấy vị trí người dùng: " + err.message);
    }
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setIsButtonLoading(true);
      setError(null);
      let filter;
      if (selectedTab === "Đang chiếu") {
        filter = "showing";
      } else if (selectedTab === "Sắp chiếu") {
        filter = "upcoming";
      } else {
        filter = "special";
      }
      console.log("Gửi yêu cầu với filter:", filter);
      const config = { params: { filter } };

      const startTime = Date.now();
      const horizontalResponse = await getMovies(config);
      
      console.log(`Thời gian tải horizontalMovies: ${Date.now() - startTime}ms`);
      setHorizontalMovies(horizontalResponse.data.movies || []);

      const allMoviesStartTime = Date.now();
      const allMoviesResponse = await getMovies();
      
      console.log(`Thời gian tải allMovies: ${Date.now() - allMoviesStartTime}ms`);
      setAllMovies(allMoviesResponse.data.movies || []);
    } catch (err) {
      console.error("Lỗi khi gọi API:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Không thể lấy danh sách phim");
    } finally {
      setLoading(false);
      setIsButtonLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setIsButtonLoading(true);
    getUserLocation().then(fetchMovies);
  };

  const handleTabPress = async (tab) => {
    setIsButtonLoading(true);
    setSelectedTab(tab);
    // fetchMovies sẽ được gọi tự động qua useEffect
  };

  const handleBookPress = async (movieId) => {
    setIsButtonLoading(true);
    if (!user) {
      setIsButtonLoading(false);
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để đặt vé.",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => navigation.navigate("Login", { from: "Home", movieId }) },
        ]
      );
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Giả lập độ trễ
      navigation.navigate("MovieBookingScreen", { movieId });
      setIsButtonLoading(false);
    }
  };

  const handleMoviePress = async (movieId) => {
    setIsButtonLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Giả lập độ trễ
    navigation.navigate("MovieDetailsScreen", { movieId });
    setIsButtonLoading(false);
  };

  const handleSearchPress = async () => {
    setIsButtonLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Giả lập độ trễ tìm kiếm
    setIsButtonLoading(false);
  };

  const filteredAllMovies = allMovies.filter((movie) =>
    movie.MovieTitle?.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderMovieCard = ({ item }) => {
    const imageSource = item.ImageUrl
      ? { uri: `data:image/png;base64,${item.ImageUrl}` }
      : { uri: "https://via.placeholder.com/200" };

    return (
      <TouchableOpacity onPress={() => handleMoviePress(item.MovieID)}>
        <View style={styles.movieCard}>
          <Image source={imageSource} style={styles.movieImage} />
          <Text style={styles.movieTitle}>{item.MovieTitle}</Text>
          <Text style={styles.movieDate}>
            Khởi chiếu {new Date(item.MovieReleaseDate).toLocaleDateString("vi-VN")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!checkedLogin) {
    return null;
  }

  if (loading && !horizontalMovies.length && !allMovies.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
        <Text>Đang tải danh sách phim...</Text>
      </View>
    );
  }

  if (error && !horizontalMovies.length && !allMovies.length) {
    return (
      <View style={styles.errorContainer}>
        <Text>Có lỗi xảy ra: {error}</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modal Loading */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isButtonLoading}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color="#ff4d6d" />
            <Text style={styles.loadingText}>Đang xử lý...</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.fixedHeader}>
        <View style={styles.header}>
          <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
          <Text style={styles.headerText}>MTB 67CS1</Text>
          <View style={styles.rightSection}>
            <Image source={require("../../assets/images/icon1.png")} style={styles.ticketIcon} />
            <Menu navigation={navigation} />
          </View>
        </View>

        <View style={styles.tabContainer}>
          {["Đang chiếu", "Đặc biệt", "Sắp chiếu"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabPress(tab)}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm phim..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
            <Icon name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>{error}</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.horizontalMovieContainer}>
          {horizontalMovies.length === 0 ? (
            <Text style={styles.noMoviesText}>Không có phim nào trong danh mục này.</Text>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={horizontalMovies}
              keyExtractor={(item) => item.MovieID.toString()}
              renderItem={renderMovieCard}
              extraData={selectedTab}
            />
          )}
        </View>

        <View style={styles.fullMovieList}>
          {filteredAllMovies.map((movie) => {
            const imageSource = movie.ImageUrl
              ? { uri: `data:image/png;base64,${movie.ImageUrl}` }
              : { uri: "https://via.placeholder.com/100" };

            return (
              <TouchableOpacity
                key={movie.MovieID}
                onPress={() => handleMoviePress(movie.MovieID)}
              >
                <View style={styles.fullMovieCard}>
                  <Image source={imageSource} style={styles.fullMovieImage} />
                  <View style={styles.movieInfo}>
                    <Text style={styles.fullMovieTitle}>{movie.MovieTitle}</Text>
                    {movie.MovieDirector && <Text>Đạo diễn: {movie.MovieDirector}</Text>}
                    {movie.MovieGenre && <Text>Thể loại: {movie.MovieGenre}</Text>}
                    <Text>Khởi chiếu: {new Date(movie.MovieReleaseDate).toLocaleDateString("vi-VN")}</Text>
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
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  fixedHeader: {
    backgroundColor: "white",
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingTop: isLargeScreen ? 40 : 30,
  },
  scrollContent: {
    flex: 1,
  },
  horizontalMovieContainer: {
    paddingVertical: 10,
    minHeight: 300,
  },
  noMoviesText: {
    textAlign: "center",
    color: "#666",
    fontSize: isLargeScreen ? 16 : 14,
    padding: 20,
    minHeight: 100,
  },
  logo: {
    width: isLargeScreen ? 40 : 35,
    height: isLargeScreen ? 40 : 35,
    resizeMode: "contain",
  },
  headerText: {
    fontSize: isLargeScreen ? 18 : 16,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#e74c3c",
    marginHorizontal: 10,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  ticketIcon: {
    width: isLargeScreen ? 32 : 28,
    height: isLargeScreen ? 22 : 18,
    resizeMode: "contain",
    marginRight: 10,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffb6c1",
    padding: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#ff4d6d",
  },
  tabText: {
    fontSize: isLargeScreen ? 16 : 14,
    color: "#444",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#ff4d6d",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    marginHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 5,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: isLargeScreen ? 16 : 14,
    color: "#333",
  },
  searchButton: {
    padding: 10,
    borderRadius: 10,
  },
  movieCard: {
    marginHorizontal: 8,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    width: isLargeScreen ? 200 : 180,
  },
  movieImage: {
    width: isLargeScreen ? 200 : 180,
    height: isLargeScreen ? 280 : 250,
    resizeMode: "cover",
  },
  movieTitle: {
    fontWeight: "bold",
    textAlign: "center",
    padding: 8,
    fontSize: isLargeScreen ? 16 : 14,
  },
  movieDate: {
    textAlign: "center",
    color: "gray",
    fontSize: isLargeScreen ? 14 : 12,
    paddingBottom: 8,
  },
  fullMovieList: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  fullMovieCard: {
    flexDirection: "row",
    backgroundColor: "white",
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  fullMovieImage: {
    width: isLargeScreen ? 120 : 100,
    height: isLargeScreen ? 180 : 150,
    resizeMode: "cover",
  },
  movieInfo: {
    flex: 1,
    padding: 10,
  },
  fullMovieTitle: {
    fontSize: isLargeScreen ? 18 : 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  bookButton: {
    backgroundColor: "#ff4d6d",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  bookButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: isLargeScreen ? 16 : 14,
  },
  warningContainer: {
    padding: 10,
    backgroundColor: "#ffe6e6",
    marginHorizontal: 15,
    borderRadius: 5,
  },
  warningText: {
    color: "#d32f2f",
    textAlign: "center",
    fontSize: isLargeScreen ? 14 : 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingModal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: isLargeScreen ? 16 : 14,
    color: "#333",
  },
});