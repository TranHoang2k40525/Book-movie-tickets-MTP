import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
  Share,
   // Thêm Share
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { getMovieById } from "../../Api/api";
import Menu from "../../components/Menu";
import { UserContext } from "../../contexts/User/UserContext";

// Thêm cấu hình Deep Linking
const APP_SCHEME = "book_movie-tickets-mtp"; 

export default function MovieDetailsScreen({ route, navigation }) {
  const { movieId } = route.params;
  const { user } = useContext(UserContext);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [showPlayButton, setShowPlayButton] = useState(true);

  const currentDate = new Date();
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(
    currentDate.getMonth() + 1
  );

  const formattedDate = `${
    selectedDay < 10 ? "0" + selectedDay : selectedDay
  }/${
    selectedMonth < 10 ? "0" + selectedMonth : selectedMonth
  }/${selectedYear}`;

  // Xử lý Deep Link khi ứng dụng được mở
  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      if (url.startsWith(`${APP_SCHEME}movie/`)) {
        const id = url.split("movie/")[1];
        if (id) {
          navigation.navigate("MovieDetailsScreen", { movieId: id });
        }
      }
    };

    // Lắng nghe sự kiện deep link
    Linking.addEventListener("url", handleDeepLink);

    // Kiểm tra liên kết khi ứng dụng mở
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      Linking.removeAllListeners("url");
    };
  }, [navigation]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getMovieById(movieId);
        const movieData = response.data.movie;
        setMovie(movieData);

        const releaseDate = new Date(movieData.MovieReleaseDate);
        setSelectedDay(releaseDate.getDate());
        setSelectedMonth(releaseDate.getMonth() + 1);
        setSelectedYear(releaseDate.getFullYear());
        setCurrentCalendarMonth(releaseDate.getMonth() + 1);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin phim:", error);
        setError("Không thể tải thông tin phim");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const newsData = [
    {
      id: 1,
      image: "https://picsum.photos/250/150?random=1",
      link: "https://example.com/promo1",
    },
    {
      id: 2,
      image: "https://picsum.photos/250/150?random=2",
      link: "https://example.com/promo2",
    },
  ];

  const openLink = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Không thể mở URL:", err)
    );
  };

  const handleDayPress = (day) => {
    setSelectedDay(day);
    setSelectedMonth(currentCalendarMonth);
  };

  const handlePrevMonth = () => {
    setCurrentCalendarMonth((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarMonth((prev) => (prev === 12 ? 1 : prev + 1));
  };

  const handleLikePress = () => {
    if (isLiked) {
      setLikes(0);
      setIsLiked(false);
    } else {
      setLikes(1);
      setIsLiked(true);
    }
  };

  const handleCloseCalendar = () => {
    setShowCalendar(false);
  };

  const handleVideoPress = () => {
    setShowPlayButton(true);
  };

  const handleBookTicket = () => {
    if (!user) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để đặt vé. Bạn có muốn đăng nhập ngay bây giờ không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng nhập",
            onPress: () =>
              navigation.navigate("Login", {
                from: "MovieDetailsScreen",
                movieId,
              }),
          },
        ]
      );
    } else {
      navigation.navigate("MovieBookingScreen", { movieId });
    }
  };

  

  // Hàm chia sẻ liên kết đến phim
  const handleShare = async () => {
    if (!movie || !movieId) {
      Alert.alert("Lỗi", "Không thể chia sẻ vì thiếu thông tin phim.");
      return;
    }
  
    const shareLink = `${APP_SCHEME}movie/${movieId}`;
    const shareMessage = `Xem phim "${movie.MovieTitle}" trên ứng dụng của chúng tôi! ${shareLink}`;
  
    try {
      await Share.share({
        message: shareMessage,
        url: shareLink, // Chỉ dùng trên iOS
        title: `Chia sẻ phim: ${movie.MovieTitle}`,
      });
    } catch (error) {
      console.error("Lỗi khi chia sẻ:", error);
      Alert.alert("Lỗi", "Không thể chia sẻ lúc này. Vui lòng thử lại.");
    }
  
    setShowShare(false);
  };

  const renderCalendarModal = () => {
    const daysInMonth = getDaysInMonth(currentCalendarMonth, selectedYear);
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCalendar}
        onRequestClose={handleCloseCalendar}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Lịch Chiếu</Text>
            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={handlePrevMonth}>
                <Ionicons name="chevron-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalDate}>
                {`${selectedDay < 10 ? "0" + selectedDay : selectedDay}/${
                  currentCalendarMonth < 10
                    ? "0" + currentCalendarMonth
                    : currentCalendarMonth
                }/${selectedYear}`}
              </Text>
              <TouchableOpacity onPress={handleNextMonth}>
                <Ionicons name="chevron-forward" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <View style={styles.calendarGrid}>
              {[...Array(daysInMonth)].map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.calendarDay,
                    i + 1 === selectedDay &&
                      currentCalendarMonth === selectedMonth && {
                        backgroundColor: "#cce5ff",
                      },
                  ]}
                  onPress={() => handleDayPress(i + 1)}
                >
                  <Text>{i + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseCalendar}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // Sửa renderShareModal để sử dụng Share API
 const renderShareModal = () => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showShare}
      onRequestClose={() => setShowShare(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Chia sẻ</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={24} color="black" />
            <Text style={styles.shareButtonText}>Chia sẻ phim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowShare(false)}
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
        <Text style={styles.loadingText}>Đang tải thông tin phim...</Text>
      </View>
    );
  }
  if (error || !movie)
    return (
      <View style={styles.errorContainer}>
        <Text>Có lỗi xảy ra: {error || "Không tìm thấy thông tin phim"}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );

  const fullDescription = movie.MovieDescription || "Không có mô tả";
  const shortDescription =
    fullDescription.length > 100
      ? fullDescription.substring(0, 100) + "..."
      : fullDescription;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backButton}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} />
          </TouchableOpacity>
          <Text style={styles.backButtonText}>Phim</Text>
        </View>
        <Menu navigation={navigation} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {!!movie?.MovieTrailer && (
            <View style={styles.trailerContainer}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={handleVideoPress}
                style={styles.trailerWrapper}
              >
                <WebView
                  source={{
                    uri: movie.MovieTrailer,
                  }}
                  style={{ height: 210 }}
                  mediaPlaybackRequiresUserAction={false}
                  allowsInlineMediaPlayback={true}
                  onError={(e) =>
                    console.log("Lỗi tải video:", e.nativeEvent.description)
                  }
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.posterContainer}>
            <Image
              source={{
                uri: movie.ImageUrl
                  ? `data:image/png;base64,${movie.ImageUrl}`
                  : "https://picsum.photos/800/500",
              }}
              onError={(e) => console.log("Lỗi tải ảnh:", e.nativeEvent.error)}
            />
            <Image
              source={{
                uri: movie.ImageUrl
                  ? `data:image/png;base64,${movie.ImageUrl}`
                  : "https://picsum.photos/100/150",
              }}
              style={styles.thumbnailPoster}
            />
          </View>

          <View style={styles.movieInfoRow}>
            <View style={styles.movieDetails}>
              <View style={styles.showtimeContainer}>
                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={() => setShowCalendar(true)}
                >
                  <Ionicons name="calendar" size={20} />
                  <Text style={styles.calendarButtonText}>{formattedDate}</Text>
                </TouchableOpacity>
                <View style={styles.durationContainer}>
                  <Text>{movie.MovieRuntime || "N/A"} phút</Text>
                </View>
              </View>
              <View style={styles.socialContainer}>
                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={handleLikePress}
                >
                  <Ionicons
                    name="heart"
                    size={20}
                    color={isLiked ? "red" : "gray"}
                  />
                  <Text>{likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowShare(true)}>
                  <Ionicons name="share-social" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.movieInfoSection}>
            <Text style={styles.movieTitle}>{movie.MovieTitle}</Text>
            <Text style={styles.infoValue}>
              {isExpanded ? fullDescription : shortDescription}
            </Text>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Text style={styles.toggleText}>
                {isExpanded ? "Thu gọn" : "Xem thêm"}
              </Text>
            </TouchableOpacity>
            <View style={styles.movieInfoDetail}>
              <Text style={styles.infoLabel}>Kiểm duyệt:</Text>
              <Text style={styles.infoValue}>{movie.MovieAge}</Text>
            </View>
            <View style={styles.movieInfoDetail}>
              <Text style={styles.infoLabel}>Thể loại:</Text>
              <Text style={styles.infoValue}>{movie.MovieGenre}</Text>
            </View>
            <View style={styles.movieInfoDetail}>
              <Text style={styles.infoLabel}>Đạo diễn:</Text>
              <Text style={styles.infoValue}>{movie.MovieDirector}</Text>
            </View>
            <View style={styles.movieInfoDetail}>
              <Text style={styles.infoLabel}>Diễn viên:</Text>
              <Text style={styles.infoValue}>
                {movie.MovieActor || "Chưa có thông tin"}
              </Text>
            </View>
            <View style={styles.movieInfoDetail}>
              <Text style={styles.infoLabel}>Ngôn ngữ:</Text>
              <Text style={styles.infoValue}>{movie.MovieLanguage}</Text>
            </View>
            <View style={styles.movieInfoDetail}>
              <Text style={styles.infoLabel}>Khởi chiếu:</Text>
              <Text style={styles.infoValue}>
                {new Date(movie.MovieReleaseDate).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          </View>

          <View style={styles.newsHeader}>
            <TouchableOpacity
              onPress={() => navigation.navigate("TinMoiUuDaiTatCa")}
            >
              <Text style={styles.infoLabel1}>Tin mới & Ưu đãi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.allButton}>
              <Text style={styles.allButtonText}>Tất Cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.offersContainer}
          >
            {newsData.map((item) => (
              <View key={item.id} style={styles.offerCard}>
                <TouchableOpacity onPress={() => openLink(item.link)}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.offerImage}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.bookTicketButton}
        onPress={handleBookTicket}
      >
        <Text style={styles.bookTicketButtonText}>Đặt Vé</Text>
      </TouchableOpacity>

      {renderCalendarModal()}
      {renderShareModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  contentContainer: { flex: 1 },
  scrollContainer: { flex: 1 },
  scrollContentContainer: { paddingBottom: 40 },
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
  backButton: { flexDirection: "row", alignItems: "center", gap: 10 },
  backButtonText: { fontSize: 16, fontWeight: "bold" },
  trailerContainer: { position: "relative" },
  trailerWrapper: { position: "relative" },
  playButtonOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -30 }, { translateY: -30 }],
    zIndex: 10,
  },
  posterContainer: { position: "relative", marginTop: 10 },
  thumbnailPoster: {
    width: 85,
    height: 120,
    borderRadius: 10,
    position: "absolute",
    bottom: -70,
    left: 15,
    zIndex: 20,
  },
  movieInfoRow: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    gap: 15,
  },
  movieDetails: { flex: 1, marginLeft: 90 },
  showtimeContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 15,
  },
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    borderRadius: 5,
  },
  calendarButtonText: { fontSize: 14 },
  durationContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    borderRadius: 5,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
    gap: 15,
  },
  likeButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  movieInfoSection: { padding: 15, backgroundColor: "#f9f9f9" },
  movieTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  movieInfoDetail: { flexDirection: "row", marginBottom: 5 },
  infoLabel: { marginTop: 20, fontWeight: "bold", marginRight: 10, width: 100 },
  infoLabel1: { fontWeight: "bold" },
  infoValue: { marginTop: 20, flex: 1 },
  toggleText: { color: "red", marginTop: 5, textAlign: "right" },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginVertical: 20,
  },
  allButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  allButtonText: { fontSize: 14, fontWeight: "bold" },
  offersContainer: { paddingHorizontal: 15, marginTop: 5 },
  offerCard: { marginRight: 10, width: 220 },
  offerImage: { width: 220, height: 140, borderRadius: 10 },
  bookTicketButton: {
    position: "absolute",
    bottom: 0,
    borderRadius: 20,
    left: 0,
    right: 0,
    backgroundColor: "red",
    padding: 15,
    alignItems: "center",
  },
  bookTicketButtonText: { color: "white", fontWeight: "bold", fontSize: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalDate: { fontSize: 16, color: "#666", textAlign: "center" },
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  calendarDay: {
    width: "14%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginBottom: 15,
  },
  shareButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: { color: "white", textAlign: "center" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  retryButtonText: { color: "white", fontWeight: "bold" },
});