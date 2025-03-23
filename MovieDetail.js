import React, { useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

import Menu from "./Menu";
import { UserContext } from "./User/UserContext";




export default function MovieDetail({ navigation, route }) {
    const { movie } = route.params || {};
    const { user } = useContext(UserContext);
    const [menuVisible, setMenuVisible] = useState(false);
      const toggleMenu = () => {
        setMenuVisible(!menuVisible);
      }; 
  return (
    <View style={styles.container}>
      {/* Header */}
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
           <Text style={styles.headerTitle}><Icon name="arrow-left" size={24} color="black" /> Quay lại</Text>
        </TouchableOpacity >
        
        {/* Thêm Menu component */}
        <Menu navigation={navigation} />
      </View>

      {/* Movie Poster and Play Button */}
      <View style={styles.posterContainer}>
        <Image source={movie.image} style={styles.posterImage} />
        <TouchableOpacity style={styles.playButton}>
          <Icon name="play" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Movie Info */}
      <ScrollView style={styles.scrollContent}>
        <View style={styles.infoContainer}>
          <Text style={styles.movieTitle}>{movie.title}</Text>
          <Text style={styles.rating}>Rạp Tiên 100%</Text>
          <View style={styles.headerRight}>
          <TouchableOpacity>
            <Icon name="heart-o" size={24} color="black" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="share" size={24} color="black" style={styles.icon} />
          </TouchableOpacity>
        </View>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Đặt vé</Text>
          </TouchableOpacity>

          {/* Movie Details */}
          <View style={styles.detailsContainer}>
            {movie.director && (
              <Text style={styles.detailText}>Đạo diễn: {movie.director}</Text>
            )}
            {movie.genre && (
              <Text style={styles.detailText}>Thể loại: {movie.genre}</Text>
            )}
            <Text style={styles.detailText}>Khởi chiếu: {movie.releaseDate}</Text>
            {movie.duration && (
              <Text style={styles.detailText}>Thời lượng: {movie.duration}</Text>
            )}
            {movie.language && (
              <Text style={styles.detailText}>Ngôn ngữ: {movie.language}</Text>
            )}
            {movie.language && (
             <Text style={styles.detailText}>Diễn viên: {movie.Akteur}</Text>
            )}
             
          </View>
          {/* Movie Description */}
          <Text style={styles.sectionTitle}>Nội dung phim</Text>
          <Text style={styles.description}>
            {movie.description ||
              <Text style={styles.detailText}> {movie.MovieContent}</Text>}
          </Text>

          {/* Cast */}
          
          

          {/* News and Events Section */}
          <Text style={styles.sectionTitle}>Tin tức & Sự kiện</Text>
          <View style={styles.eventCard}>
            <Image
              source={require("./assets/images/yeunhambanthan.jpg")} // Thay bằng hình ảnh sự kiện của bạn
              style={styles.eventImage}
            />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>
                Culture Day - Ưu đãi 35% toàn hệ thống
              </Text>
              <Text style={styles.eventDate}>22/03/2025</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#white",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  headerRight: {
    flexDirection: "row",
  },
  icon: {
    marginLeft: 15,
  },
  posterContainer: {
    position: "relative",
    alignItems: "center",
  },
  posterImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    backgroundColor: "rgba(238, 226, 226, 0.5)",
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flex: 1,
  },
  infoContainer: {
    padding: 15,
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    marginBottom: 5,
  },
  rating: {
    fontSize: 16,
    color: "#FF4D6D",
    marginBottom: 10,
  },
  bookButton: {
    backgroundColor: "#FF4D6D",
    paddingVertical: 10,
    borderRadius: 5,
    padding: 10,
    top: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  bookButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailText: {
    fontSize: 14,
    color: "black",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "black",
    marginBottom: 20,
    lineHeight: 20,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#black",
    borderRadius: 10,
    overflow: "hidden",
  },
  eventImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  eventInfo: {
    flex: 1,
    padding: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: "gray",
  },
});