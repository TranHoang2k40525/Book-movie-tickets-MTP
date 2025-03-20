import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const moviesData = [
  {
    id: '1',
    title: 'NHÀ GIA TIÊN',
    date: '21 Th4 2025',
    duration: '1 giờ 52 phút',
    format: 'STARIUM',
    image: require('./assets/images/nhagiatien.png'),
  },
  {
    id: '2',
    title: 'NỮ TU BÓNG TỐI',
    date: '21 Th4 2025',
    duration: '1 giờ 54 phút',
    format: 'ULTRA 4DX',
    image: require('./assets/images/nutubongtoi.jpg'),
  },
  {
    id: '3',
    title: 'CAPTAIN AMERICA: THẾ GIỚI MỚI',
    date: '21 Th4 2025',
    duration: '1 giờ 58 phút',
    format: 'SCREEN X, IMAX, ULTRA 4DX',
    image: require('./assets/images/captainamerica.png'),
  },
  {
    id: '4',
    title: 'RIDER: GIAO HÀNG CHO MA',
    date: '21 Th4 2025',
    duration: '1 giờ 57 phút',
    format: '2D',
    image: require('./assets/images/giaohangchoma.jpg'),
  },
  {
    id: '5',
    title: 'NỤ HÔN BẠC TỶ',
    date: '21 Th4 2025',
    duration: '1 giờ 53 phút',
    format: '2D',
    image: require('./assets/images/nuhonbacty.jpg'),
  },
  {
    id: '6',
    title: 'YÊU NHẦM BẠN THÂN',
    date: '21 Th4 2025',
    duration: '1 giờ 56 phút',
    format: '2D',
    image: require('./assets/images/yeunhambanthan.jpg'),
  },
];

export default function App() {
  const renderMovieItem = ({ item }) => (
    <TouchableOpacity
      style={styles.movieWrapper}
      onPress={() => alert(`Bạn chọn phim: ${item.title}`)}
    >
      <View style={styles.movieContainer}>
        <Image
          source={
            typeof item.image === 'string'
              ? { uri: item.image }
              : item.image
          }
          style={styles.movieImage}
        />

        <View style={styles.movieDetails}>
          <Text style={styles.movieTitle}>{item.title}</Text>
          <Text style={styles.movieInfo}>{item.date}</Text>
          <Text style={styles.movieInfo}>{item.duration}</Text>
          <Text style={styles.movieFormat}>{item.format}</Text>
        </View>

        <Ionicons name="chevron-forward" size={24} color="#E74C3C" style={styles.arrowIcon} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bo tròn toàn bộ */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => alert('Back')}>
            <Ionicons name="arrow-back" size={24} color="#E74C3C" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Chọn phim của bạn</Text>

          <TouchableOpacity onPress={() => alert('Menu')}>
            <Ionicons name="menu" size={24} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab "Đang chiếu" */}
      <View style={styles.tabBar}>
        <Text style={styles.tabActive}>Đang chiếu</Text>
      </View>

      {/* Danh sách phim */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {moviesData.map((movie) => (
          <View key={movie.id}>
            {renderMovieItem({ item: movie })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Bao bọc Header để tạo khoảng cách bên ngoài
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // Phần Header màu vàng, bo góc toàn bộ
  header: {
    backgroundColor: '#FAD02C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20, // Bo góc toàn bộ
    elevation: 5, // Bóng trên Android
    shadowColor: '#000', // Bóng trên iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  headerTitle: {
    fontSize: 18,
    color: '#E74C3C',
    fontWeight: 'bold',
  },

  tabBar: {
    backgroundColor: '#FFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },

  tabActive: {
    color: '#E74C3C',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 16,
  },

  scrollContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },

  movieWrapper: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  movieContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
  },

  movieImage: {
    width: 100,
    height: 150,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  movieDetails: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },

  movieTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  movieInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },

  movieFormat: {
    fontSize: 12,
    color: '#E67E22',
    marginTop: 4,
    fontWeight: '500',
  },

  arrowIcon: {
    alignSelf: 'center',
    marginRight: 10,
  },
});
