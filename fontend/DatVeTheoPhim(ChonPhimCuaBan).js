import React, { useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, Text, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MovieApp = () => {
  const scrollViewRef = useRef(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isNowShowingActive, setIsNowShowingActive] = useState(false);
  const [currentView, setCurrentView] = useState('original'); // 'original' hoặc 'alternate'

  // Dữ liệu phim gốc
  const originalMovies = [
    { 
      id: 1,
      title: "GẤU YÊU CỦA ANH",
      date: "04 Th4 2025",
      time: "T16",
      duration: "1giờ 59phút",
      format: "STADIUM Ultra4DX",
      image: require('./assets/Anh1.jpeg'),
      link: 'https://www.cgv.vn/movies/gau-yeu-cua-anh'
    },
    { 
      id: 2,
      title: "MẶT VỤ PHỤ HỒ",
      date: "04 Th4 2025",
      time: "T18",
      duration: "1giờ 56phút",
      format: "20 DIGITAL",
      image: require('./assets/Anh2.jpeg'),
      link: 'https://www.cgv.vn/movies/mat-vu-phu-ho'
    },
     { 
      id: 3,
      title: "OÁN LINH NHẬP XÁC",
      date: "04 Th4 2025",
      time: "T18",
      duration: "1giờ 35phút",
      format: "20 DIGITAL",
      image: require('./assets/Anh4.jpeg'),
      link: 'https://www.cgv.vn/movies/oan-linh-nhap-xac'
    },
    { 
      id: 4,
      title: "PANOR: TÀ THUẬT HUYẾT NGÀI",
      date: "11 Th4 2025",
      time: "T18",
      duration: "1giờ 57phút",
      format: "20 DIGITAL",
      image: require('./assets/Anh3.jpeg'),
      link: 'https://www.cgv.vn/movies/panor-ta-thuat-huyet-ngai'
    },
    { 
      id: 5,
      title: "QUỶ NHẬP TRÀNG",
      date: "07 Th3 2025",
      time: "T18",
      duration: "2giờ 1phút",
      format: "ULTRA 4DX  4DX",
      image: require('./assets/Anh6.jpeg'),
      link: 'https://www.cgv.vn/movies/quy-nhap-trang'
    },
    { 
      id: 6,
      title: "HUYẾT ÁN TRUY HÀNH",
      date: "28 Th3 2025",
      time: "T18",
      duration: "1giờ 23phút",
      format: "20 DIGITAL",
      image: require('./assets/Anh5.jpeg'),
      link: 'https://www.cgv.vn/movies/huyet-an-truy-hanh'
    },
    { 
      id: 7,
      title: "ÂM DƯƠNG LỘ",
      date: "28 Th3 2025",
      time: "T16",
      duration: "1giờ 59phút",
      format: "STADIUM",
      image: require('./assets/Anh7.jpeg'),
      link: 'https://www.cgv.vn/movies/am-duong-lo'
    },
    { 
      id: 8,
      title: "CUỐC XE KINH HOÀNG",
      date: "07 Th2 2025",
      time: "T18",
      duration: "1 giờ 41phút",
      format: "20 DIGITAL",
      image: require('./assets/Anh8.jpeg'),
      link: 'https://www.cgv.vn/movies/quy-nhap-trang'
    },
    { 
      id: 9,
      title: "NÀNG BẠCH TUYẾT",
      date: "07 Th3 2025",
      time: "T18",
      duration: "2giờ 1phút",
      format: "ScreenX  4DX",
      image: require('./assets/Anh9.jpeg'),
      link: 'https://www.cgv.vn/movies/quy-nhap-trang'
    },
    { 
      id: 10,
      title: "THIẾU NỮ ÁNH TRĂNG",
      date: "07 Th3 2025",
      time: "T18",
      duration: "2giờ 1phút",
      format: "20 DIGITAL",
      image: require('./assets/Anh4.jpeg'),
      link: 'https://www.cgv.vn/movies/quy-nhap-trang'
    }
  ];

  // Dữ liệu phim cho trang alternate
  const alternateMovies = [
    { 
      id: 1,
      title: "GẤU YÊU CỦA ANH",
      date: "04 Th4 2025",
      time: "T16",
      duration: "1giờ 59phút",
      format: "STADIUM Ultra4DX",
      image: require('./assets/Anh1.jpeg'),
      link: 'https://www.cgv.vn/movies/gau-yeu-cua-anh'
    },
    { 
      id: 2,
      title: "MẶT VỤ PHỤ HỒ",
      date: "04 Th4 2025",
      time: "T18",
      duration: "1giờ 56phút",
      format: "20 DIGITAL",
      image: require('./assets/Anh2.jpeg'),
      link: 'https://www.cgv.vn/movies/mat-vu-phu-ho'
    },
     { 
      id: 3,
      title: "OÁN LINH NHẬP XÁC",
      date: "04 Th4 2025",
      time: "T18",
      duration: "1giờ 35phút",
      format: "20 DIGITAL",
      image: require('./assets/Anh4.jpeg'),
      link: 'https://www.cgv.vn/movies/oan-linh-nhap-xac'
    },
    { 
      id: 4,
      title: "PANOR: TÀ THUẬT HUYẾT NGÀI",
      date: "11 Th4 2025",
      time: "T18",
      duration: "1giờ 57phút",
      format: "20 DIGITAL",
      image: require('./assets/Anh3.jpeg'),
      link: 'https://www.cgv.vn/movies/panor-ta-thuat-huyet-ngai'
    },
    { 
      id: 5,
      title: "QUỶ NHẬP TRÀNG",
      date: "07 Th3 2025",
      time: "T18",
      duration: "2giờ 1phút",
      format: "ULTRA 4DX  4DX",
      image: require('./assets/Anh6.jpeg'),
      link: 'https://www.cgv.vn/movies/quy-nhap-trang'
    },
    { 
      id: 6,
      title: "HUYẾT ÁN TRUY HÀNH",
      date: "28 Th3 2025",
      time: "T18",
      duration: "1giờ 23phút",
      format: "20 DIGITAL",
      image: require('./assets/Anh5.jpeg'),
      link: 'https://www.cgv.vn/movies/huyet-an-truy-hanh'
    },
    { 
      id: 7,
      title: "ÂM DƯƠNG LỘ",
      date: "28 Th3 2025",
      time: "T16",
      duration: "1giờ 59phút",
      format: "STADIUM",
      image: require('./assets/Anh7.jpeg'),
      link: 'https://www.cgv.vn/movies/am-duong-lo'
    },
    { 
      id: 8,
      title: "CUỐC XE KINH HOÀNG",
      date: "07 Th2 2025",
      time: "T18",
      duration: "1 giờ 41phút",
      format: "20 DIGITAL",
      image: require('./assets/Anh8.jpeg'),
      link: 'https://www.cgv.vn/movies/quy-nhap-trang'
    },
    { 
      id: 9,
      title: "NÀNG BẠCH TUYẾT",
      date: "07 Th3 2025",
      time: "T18",
      duration: "2giờ 1phút",
      format: "ScreenX  4DX",
      image: require('./assets/Anh9.jpeg'),
      link: 'https://www.cgv.vn/movies/quy-nhap-trang'
    },
    { 
      id: 10,
      title: "THIẾU NỮ ÁNH TRĂNG",
      date: "07 Th3 2025",
      time: "T18",
      duration: "2giờ 1phút",
      format: "20 DIGITAL",
      image: require('./assets/Anh4.jpeg'),
      link: 'https://www.cgv.vn/movies/quy-nhap-trang'
    }
  ];

  // Chọn dữ liệu phim hiển thị dựa trên currentView
  const moviesToShow = currentView === 'original' ? originalMovies : alternateMovies;

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    
    setShowScrollToTop(scrollY + scrollViewHeight >= contentHeight - 50);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleMoviePress = (url) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  const handleBackPress = () => {
    console.log("Back button pressed");
  };

  const handleMenuPress = () => {
    Linking.openURL('https://www.cgv.vn/menu').catch(err => console.error("Failed to open URL:", err));
  };

  const toggleNowShowing = () => {
    setIsNowShowingActive(!isNowShowingActive);
    setCurrentView(currentView === 'original' ? 'alternate' : 'original');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="#e31937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn phim của bạn</Text>
        </View>
        
        <TouchableOpacity onPress={handleMenuPress} style={styles.iconButton}>
          <Ionicons name="menu" size={24} color="#e31937" />
        </TouchableOpacity>
      </View>

      {/* Now Showing Filter Bar */}
      <View style={styles.nowShowingContainer}>
        <TouchableOpacity 
          onPress={toggleNowShowing}
          style={styles.nowShowingButton}
        >
          <Ionicons 
            name="checkmark" 
            size={18} 
            color={isNowShowingActive ? '#e31937' : '#999'} 
            style={styles.checkIcon}
          />
          <Text style={[styles.nowShowingText, isNowShowingActive && styles.activeNowShowingText]}>
            Đang chiếu
          </Text>
        </TouchableOpacity>
      </View>

      {/* Movie List - Hiển thị dữ liệu tương ứng với currentView */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {moviesToShow.map((movie) => (
          <TouchableOpacity 
            key={movie.id} 
            style={styles.movieCard}
            onPress={() => handleMoviePress(movie.link)}
          >
            <Image source={movie.image} style={styles.movieImage} resizeMode="cover" />
            
            <View style={styles.movieInfo}>
              <Text style={styles.movieTitle}>{movie.title}</Text>
              
              {(movie.date || movie.time) && (
                <View style={styles.movieDetail}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.movieText}>
                    {movie.date} {movie.time && `(${movie.time})`}
                  </Text>
                </View>
              )}
              
              {movie.duration && (
                <View style={styles.movieDetail}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.movieText}>{movie.duration}</Text>
                </View>
              )}
              
              {movie.format && (
                <View style={styles.movieFormat}>
                  <Text style={styles.formatText}>{movie.format}</Text>
                </View>
              )}
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

// Giữ nguyên toàn bộ styles như cũ
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    marginTop: 20,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 5,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  iconButton: {
    padding: 5,
  },
  nowShowingContainer: {
    marginTop: 80,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  nowShowingButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 5,
  },
  nowShowingText: {
    fontSize: 14,
    color: '#999', // Màu xám mặc định
  },
  activeNowShowingText: {
    color: '#e31937', // Màu đỏ khi active
    fontWeight: 'bold',
  },
  scrollView: {
    marginTop: 10,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  movieCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 15,
    marginVertical: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
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
    justifyContent: 'center',
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  movieDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  movieText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  movieFormat: {
    marginTop: 8,
  },
  formatText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'blue',
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#e31937',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 5,
  },
  scrollToTopText: {    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default MovieApp;