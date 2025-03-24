import React, { useState, useContext } from "react";
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
const moviesNowShowing: Movie[] = [
  {
    id: "1",
    title: "Transformers Một",
    releaseDate: "29.2.2025",
    duration: "120 phút",
    language: "Tiếng Việt",
    image: require("./assets/images/transformers.jpg"),
  },
  {
    id: "2",
    title: "Kẻ đồng hành",
    releaseDate: "15.3.2025",
    duration: "120 phút",
    language: "Tiếng Việt",
    image: require("./assets/images/kedonghanh.png"),
  },
  {
    id: "3",
    title: "Nhà gia tiên",
    releaseDate: "1.4.2025",
    duration: "120 phút",
    language: "Tiếng Việt",
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
const moviesComingSoon: Movie[] = [
  {
    id: "2",
    title: "Kẻ đồng hành",
    releaseDate: "15.3.2025",
    duration: "120 phút",
    language: "Tiếng Việt",
    image: require("./assets/images/kedonghanh.png"),
  },
  {
    id: "3",
    title: "Nhà gia tiên",
    releaseDate: "1.4.2025",
    duration: "120 phút",
    language: "Tiếng Việt",
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
const moviesSpecial: Movie[] = [
  {
    id: "1",
    title: "Transformers Một",
    releaseDate: "29.2.2025",
    duration: "120 phút",
    language: "Tiếng Việt",
    image: require("./assets/images/transformers.jpg"),
  },
];
const allMovies: Movie[] = [
  {
    id: "4",
    title: "Nhà gia tiên",
    director: "Huỳnh Lập",
    genre: "Gia đình, Hài",
    releaseDate: "21/02/2025",
    duration: "117 phút",
    language: "Tiếng Việt - Phụ đề Tiếng Anh",
    Akteur:"Jack Quaid, Lukas Gage, Sophie Thatcher",
    image: require("./assets/images/nhagiatien.png"),
    MovieContent: "Nhà Gia Tiên xoay quanh câu chuyện đa góc nhìn về các thế hệ khác nhau trong một gia đình, có hai nhân vật chính là Gia Minh (Huỳnh Lập) và Mỹ Tiên (Phương Mỹ Chi). Trở về căn nhà gia tiên để quay các video “triệu view” trên mạng xã hội, Mỹ Tiên - một nhà sáng tạo nội dung thuộc thế hệ Z vốn không tin vào chuyện tâm linh, hoàn toàn mất kết nối với gia đình, bất ngờ nhìn thấy Gia Minh - người anh trai đã mất từ lâu. Để hồn ma của Gia Minh có thể siêu thoát và không tiếp tục làm phiền mình, Mỹ Tiên bắt tay cùng Gia Minh lên kế hoạch giữ lấy căn nhà gia tiên đang bị họ hàng tranh chấp, đòi ông nội chia tài sản. Đứng trước hàng loạt bí mật động trời trong căn nhà gia tiên, liệu Mỹ Tiên có vượt qua được tất cả để hoàn thành di nguyện của Gia Minh?",
  },
  {
    id: "5",
    title: "Natra2 ",
    director: "Giảo Tử",
    genre: "Hành động",
    releaseDate: "10/03/2025",
    duration: "120 phút",
    language: "Tiếng Việt",
    Akteur:"Jack Quaid, Lukas Gage, Sophie Thatcher",
    image: require("./assets/images/natra2.jpg"),
    MovieContent: "Na Tra 2: Ma Đồng Náo Hải tiếp tục câu chuyện đầy bi kịch xoay quanh Na Tra và Ngao Bính. Sau cuộc chiến oanh liệt với ác ma, mặc dù linh hồn của họ được cứu rỗi, nhưng thân xác của Na Tra và Ngao Bính đã bị tổn thương nặng nề, sắp sụp đổ hoàn toàn. Thái Ất Chân Nhân, với lòng từ bi và mong muốn được giúp đỡ hai con sứ giả nhân trời, quyết định sử dụng Bảy Đóa Sen Sắc Màu – trân bảo hiếm có có khả năng tái tạo thân xác – để cứu họ. Dự định này đã xen vào vô vàn thử thách.",
  },
  {
    id: "1",
    title: "Transformers Một",
    director: "Director 5",
    genre: "Hành động",
    releaseDate: "29.2.2025",
    image: require("./assets/images/transformers.jpg"),
    MovieContent:"Nội dung phim: Transformers Một là một bộ phim hành động, viễn tưởng của Mỹ năm 2007 do Michael Bay đạo diễn, dựa trên loạt phim hoạt hình cùng tên của Hasbro. Phim có sự tham gia của các diễn viên Shia LaBeouf, Tyrese Gibson, Josh Duhamel, Anthony Anderson, Megan Fox, Rachael Taylor, John Turturro, Jon Voight và Hugo Weaving. Phim kể về cuộc chiến giữa các robot biến hình Autobots và Decepticons trên Trái Đất. Phim được công chiếu vào ngày 3 tháng 7 năm 2007 tại Việt Nam.",
  },
  {
    id: "2",
    title: "Kẻ đồng hành",
    director: "Drew Hancock ",
    genre: "Rùng rợn, Viễn tưởng",
    releaseDate: "15.3.2025",
    duration: "120 phút",
    language: "Tiếng Việt",
    Akteur:"Jack Quaid, Lukas Gage, Sophie Thatcher",
    image: require("./assets/images/kedonghanh.png"),
    MovieContent: "",

  },
  {
    id: "3",
    title: "Nhà gia tiên",
    director: "Director 5",
    genre: "Hành động",
    releaseDate: "1.4.2025",
    duration: "120 phút",
    language: "Tiếng Việt",
    Akteur:" Huỳnh Lập, Phương Mỹ Chi, NSƯT Hạnh Thúy, NSƯT Ngọc Hiệp, Hồng Đào, Anh Tú, Trương Thế Vinh, Trương Minh Quốc Thái, Tiểu Bảo Quốc, NSƯT Thanh Hằng, NSƯT Hiền Anh",
    image: require("./assets/images/nhagiatien.png"),
    MovieContent: "Nhà Gia Tiên xoay quanh câu chuyện đa góc nhìn về các thế hệ khác nhau trong một gia đình, có hai nhân vật chính là Gia Minh (Huỳnh Lập) và Mỹ Tiên (Phương Mỹ Chi). Trở về căn nhà gia tiên để quay các video “triệu view” trên mạng xã hội, Mỹ Tiên - một nhà sáng tạo nội dung thuộc thế hệ Z vốn không tin vào chuyện tâm linh, hoàn toàn mất kết nối với gia đình, bất ngờ nhìn thấy Gia Minh - người anh trai đã mất từ lâu. Để hồn ma của Gia Minh có thể siêu thoát và không tiếp tục làm phiền mình, Mỹ Tiên bắt tay cùng Gia Minh lên kế hoạch giữ lấy căn nhà gia tiên đang bị họ hàng tranh chấp, đòi ông nội chia tài sản. Đứng trước hàng loạt bí mật động trời trong căn nhà gia tiên, liệu Mỹ Tiên có vượt qua được tất cả để hoàn thành di nguyện của Gia Minh?",
  },
  {
    id: "6",
    title: "Captain America thế giới mới",
    director: "Director 5",
    genre: "Hành động",
    releaseDate: "1.4.2025",
    duration: "120 phút",
    language: "Tiếng Việt",
    Akteur:"Harrison Ford, Anthoy Mackie, Giancarlo Esposito, Rosa Salazar, Seth Rollins, Shira Haas",
    image: require("./assets/images/CAPTAINAMERICA.png"),
    MovieContent: "",
  },
  {
    id: "7",
    title: "Giao hoa cho mama",
    director: "Director 5",
    genre: "Hành động",
    releaseDate: "1.4.2025",
    duration: "120 phút",
    language: "Tiếng Việt",
    image: require("./assets/images/giaohangchoma.jpg"),
    MovieContent: "",
  },
];

interface HomeProps {
  navigation: NavigationProp<any>;
}

export default function Home({ navigation }: HomeProps) {
  const [selectedTab, setSelectedTab] = useState("Đang chiếu");
  const [searchText, setSearchText] = useState("");
  const { user } = useContext(UserContext);
  const renderMovieCard = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("MovieDetail", { movie: item })}
    >
      <View style={styles.movieCard}>
        <Image source={item.image} style={styles.movieImage} />
        <Text style={styles.movieTitle}>{item.title}</Text>
        <Text style={styles.movieDate}>Khởi chiếu {item.releaseDate}</Text>
      </View>
    </TouchableOpacity>
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
            <Text style={styles.searchButtonText}>
              <Icon name="search" size={24} color="black" />
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
              selectedTab === "Đang chiếu"
                ? moviesNowShowing
                : selectedTab === "Đặc biệt"
                ? moviesSpecial
                : moviesComingSoon
            }
            keyExtractor={(item) => item.id}
            renderItem={renderMovieCard}
          />
        </View>

        <View style={styles.fullMovieList}>
          {allMovies.map((movie) => (
            <TouchableOpacity
              key={movie.id}
              onPress={() => navigation.navigate("MovieDetail", { movie })}
            >
              <View style={styles.fullMovieCard}>
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
            </TouchableOpacity>
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
