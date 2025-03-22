import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Modal 
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome"
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
import { NavigationProp } from '@react-navigation/native';
interface Movie {
  id: string;
  title: string;
  releaseDate: string;
  image: any;
  director?: string;
  genre?: string;
  duration?: string;
  language?: string;
}
const moviesNowShowing:Movie[] = [
  {
    id: "1",
    title: "Transformers Một",
    releaseDate: "29.2.2025",
    image: require("./assets/images/transformers.jpg"),
  },
  {
    id: "2",
    title: "Kẻ đồng hành",
    releaseDate: "15.3.2025",
    image: require("./assets/images/kedonghanh.png"),
  },
  {
    id: "3",
    title: "Nhà gia tiên",
    releaseDate: "1.4.2025",
    image: require("./assets/images/nhagiatien.png"),
  },
  {
    id: "4",
    title: "Nhà gia tiên",
    director: "Huỳnh Lập",
    genre: "Gia đình, Hài",
    releaseDate: "21/02/2025",
    duration: "117 phút",
    language: "Tiếng Việt - Phụ đề Tiếng Anh",
    image: require("./assets/images/nhagiatien.png"),
  },
  {
    id: "5",
    title: "Natra2 ",
    director: "Director 5",
    genre: "Hành động",
    releaseDate: "10/03/2025",
    duration: "120 phút",
    language: "Tiếng Việt",
    image: require("./assets/images/natra2.jpg"),
  },
];
const moviesComingSoon:Movie[] = [
 
  {
    id: "2",
    title: "Kẻ đồng hành",
    releaseDate: "15.3.2025",
    image: require("./assets/images/kedonghanh.png"),
  },
  {
    id: "3",
    title: "Nhà gia tiên",
    releaseDate: "1.4.2025",
    image: require("./assets/images/nhagiatien.png"),
  },
  {
    id: "4",
    title: "Nhà gia tiên",
    director: "Huỳnh Lập",
    genre: "Gia đình, Hài",
    releaseDate: "21/02/2025",
    duration: "117 phút",
    language: "Tiếng Việt - Phụ đề Tiếng Anh",
    image: require("./assets/images/nhagiatien.png"),
  },
  {
    id: "5",
    title: "Natra 2",
    director: "Director 5",
    genre: "Hành động",
    releaseDate: "10/03/2025",
    duration: "120 phút",
    language: "Tiếng Việt",
    image: require("./assets/images/natra2.jpg"),
  },
];
const moviesSpecial:Movie[] = [
  { id: "1", title: "Transformers Một", releaseDate: "29.2.2025", image: require("./assets/images/transformers.jpg") 
  
  }
]
const allMovies:Movie[] = [
 
  {
    id: "4",
    title: "Nhà gia tiên",
    director: "Huỳnh Lập",
    genre: "Gia đình, Hài",
    releaseDate: "21/02/2025",
    duration: "117 phút",
    language: "Tiếng Việt - Phụ đề Tiếng Anh",
    image: require("./assets/images/nhagiatien.png"),
  },
  {
    id: "5",
    title: "Natra2 ",
    director: "Director 5",
    genre: "Hành động",
    releaseDate: "10/03/2025",
    duration: "120 phút",
    language: "Tiếng Việt",
    image: require("./assets/images/natra2.jpg"),
  },
  {
    id: "1",
    title: "Transformers Một",
    releaseDate: "29.2.2025",
    image: require("./assets/images/transformers.jpg"),
  },
  {
    id: "2",
    title: "Kẻ đồng hành",
    releaseDate: "15.3.2025",
    image: require("./assets/images/kedonghanh.png"),
  },
  {
    id: "3",
    title: "Nhà gia tiên",
    releaseDate: "1.4.2025",
    image: require("./assets/images/nhagiatien.png"),
  },
];



interface HomeProps {
  navigation: NavigationProp<any>;
}

export default function Home({ navigation }: HomeProps) {
  const [selectedTab, setSelectedTab] = useState("Đang chiếu");
  const [searchText, setSearchText] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  const renderMovieCard = ({ item }: { item: Movie }) => (
    <View style={styles.movieCard}>
      <Image source={item.image} style={styles.movieImage} />
      <Text style={styles.movieTitle}>{item.title}</Text>
      <Text style={styles.movieDate}>Khởi chiếu {item.releaseDate}</Text>
    </View>
  );
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
        {/* Nút mở menu */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Text style={styles.menuText}>≡</Text>
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
              visible={menuVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setMenuVisible(false)}
            >
              <TouchableOpacity style={styles.overlay} onPress={toggleMenu}>
                <View style={styles.menu}>
                  {/* Avatar trống (chưa đăng nhập) */}
                  <View style={styles.avatarContainer}>
                    <TouchableOpacity style={styles.notificationButton}>
                      <Icon1 name="bell" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Icon1 name="account-circle" size={60} color="#fff" />
                    <TouchableOpacity style={styles.settingsButton}>
                      <Icon1 name="cog" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  {/* Các mục đăng nhập/đăng ký */}
                  <View style={styles.authButtons}>
                  <TouchableOpacity
                      style={styles.authButton}
                      onPress={() => {
                        console.log("Navigating to Login"); // Kiểm tra sự kiện
                        navigation.navigate("Login");
                      }}
                    >
                      <Text style={styles.authButtonText}>Đăng nhập</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.authButton}
                      onPress={() => {
                        console.log("Navigating to Register"); // Kiểm tra sự kiện
                        navigation.navigate("Register"); // Điều hướng tới Register
                      }}
                    >
                      <Text style={styles.authButtonText}>Đăng ký</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Các mục đặt vé */}
                  <View style={styles.menuSection}>
                    <TouchableOpacity style={styles.menuRow}>
                      <Icon1 name="movie" size={24} color="#fff" style={styles.menuIcon} />
                      <Text style={styles.menuItem}>Đặt vé theo phim</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuRow}>
                      <Icon1 name="map-marker" size={24} color="#fff" style={styles.menuIcon} />
                      <Text style={styles.menuItem}>Đặt vé theo rạp</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Các mục menu chính */}
                  <View style={styles.menuSection}>
                    <TouchableOpacity style={styles.menuRow}>
                      <Icon1 name="home" size={24} color="#fff" style={styles.menuIcon} />
                      <Text style={styles.menuItem}>Trang chủ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuRow}>
                      <Icon1 name="account" size={24} color="#fff" style={styles.menuIcon} />
                      <Text style={styles.menuItem}>Thành viên</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuRow}>
                      <Icon1 name="map-marker" size={24} color="#fff" style={styles.menuIcon} />
                      <Text style={styles.menuItem}>Rạp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuRow}>
                      <Icon1 name="star" size={24} color="#fff" style={styles.menuIcon} />
                      <Text style={styles.menuItem}>Rạp đặc biệt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuRow}>
                      <Icon1 name="ticket-confirmation" size={24} color="#fff" style={styles.menuIcon} />
                      <Text style={styles.menuItem}>Vé của tôi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuRow}>
                      <Icon1 name="store" size={24} color="#fff" style={styles.menuIcon} />
                      <Text style={styles.menuItem}>Store</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuRow}>
                      <Icon1 name="gift" size={24} color="#fff" style={styles.menuIcon} />
                      <Text style={styles.menuItem}>eGift</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuRow}>
                      <Icon1 name="sale" size={24} color="#fff" style={styles.menuIcon} />
                      <Text style={styles.menuItem}>Đổi ưu đãi</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Tin tức & Sự kiện */}
                  <View style={styles.menuSection}>
                    <TouchableOpacity style={styles.menuRow}>
                      <Icon1 name="newspaper" size={24} color="#fff" style={styles.menuIcon} />
                      <Text style={styles.menuItem}>Tin tức & Sự kiện</Text>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>NEW</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
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

      {/* Search Nearby Theaters */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm rạp gần đây..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}><Icon name="search" size={24} color="black" />
          </Text>
        </TouchableOpacity>
      </View>
</View>
      {/* Movie List (Đang Chiếu & Sắp Chiếu) */}
      <ScrollView style={styles.scrollContent}>
        {/* Movie List ngang */}
        <View style={styles.horizontalMovieContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={
              selectedTab === "Đang chiếu" ? moviesNowShowing :
              selectedTab === "Đặc biệt" ? moviesSpecial :
              moviesComingSoon
            }
            keyExtractor={(item) => item.id}
            renderItem={renderMovieCard}
          />
        </View>

        {/* Full Movie List dọc */}
        <View style={styles.fullMovieList}>
          {allMovies.map((movie) => (
            <View key={movie.id} style={styles.fullMovieCard}>
              <Image source={movie.image} style={styles.fullMovieImage} />
              <View style={styles.movieInfo}>
                <Text style={styles.fullMovieTitle}>{movie.title}</Text>
                {movie.director && <Text>Đạo diễn: {movie.director}</Text>}
                {movie.genre && <Text>Thể loại: {movie.genre}</Text>}
                <Text>Khởi chiếu: {movie.releaseDate}</Text>
                {movie.duration && <Text>Thời lượng: {movie.duration}</Text>}
                {movie.language && <Text>Ngôn ngữ: {movie.language}</Text>}
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Đặt vé</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", paddingTop: 0 },
  fixedHeader: {
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
    height: 70,
  },
  scrollContent: {
    flex: 1,
  },
  horizontalMovieContainer: {
    paddingVertical: 10,
  },
  logo: {
    width: 35,
    height: 35,
    resizeMode: "contain",
    padding: 10,
  },
  headerText: {
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#e74c3c",
    marginHorizontal: 5,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  ticketIcon: {
    width: 28,
    height: 18,
    resizeMode: "contain",
    marginRight: 10,
  },
  menuButton: {
    padding: 5,
  },
  menuText: {
    fontSize: 28,
    color: "black",
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(45, 43, 43, 0.41)",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  menu: {
    backgroundColor: "#1E1D1D",
    width: "80%",
    height: "100%",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  notificationButton: {
    position: "absolute",
    left: 50, // Điều chỉnh vị trí nút thông báo
    top: 20
  },
  settingsButton: {
    position: "absolute",
    top: 20,
    right: 50, // Điều chỉnh vị trí nút cài đặt
  },
  authButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  authButton: {
    backgroundColor: "#FF4D6D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  authButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  menuSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuItem: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    flex: 1,
  },
  badge: {
    backgroundColor: "#FF4D6D",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
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
    flex: 1,
    margin: 5,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  movieImage: { width: "auto", height: 200, resizeMode: "cover" },
  movieTitle: { fontWeight: "bold", textAlign: "center", padding: 5 },
  movieDate: { textAlign: "center", color: "gray" },
  fullMovieList: { marginTop: 20, paddingHorizontal: 10 },
  fullMovieCard: {
    flex: 1,
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
