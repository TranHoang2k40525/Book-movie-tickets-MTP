import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Menu from '../../components/Menu'; // Import component Menu

export default function TinMoiVaUuDai({ navigation }) {
  const scrollViewRef = React.useRef();

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Hàm xử lý khi nhấn "ĐẶT VÉ THEO PHIM"
  const handleBookByMoviePress = () => {
    navigation.navigate('Datvetheophim');
  };

  // Hàm xử lý khi nhấn "ĐẶT VÉ THEO RẠP"
  const handleBookByCinemaPress = () => {
    navigation.navigate('ChonPhimTheoRap');
  };

  return (
    <View style={styles.fullContainer}>
      {/* Header cố định */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin mới & Ưu đãi</Text>
        {/* Sử dụng component Menu thay cho nút menu */}
        <Menu navigation={navigation} />
      </View>

      {/* Nội dung cuộn */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.container}
      >
        {/* Banner hình ảnh */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://example.com/cgv-culture-day-banner.jpg' }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>
        
        {/* Text dưới banner */}
        <Text style={styles.bannerText}>MTB CULTURE DAY - THỨ HAI CUỐI CÙNG CỦA THÁNG ĐÃ TRỞ LẠI!!!</Text>
        
        {/* Phần thông tin */}
        <View style={styles.infoSection}>
          <Text style={styles.subTitle}>Culture Day Tháng 3</Text>
          <Text style={styles.description}>
            Với sự ủng hộ và tin tưởng của khách hàng trong nhiều năm qua, MTB đã và đang thực hiện mục tiêu mang điện ảnh đến gần hơn với tất cả mọi người. Xuất phát từ tinh thần này, với ngày Thứ 2 cuối cùng của mỗi tháng, MTB áp dụng chính sách giá vé đặc biệt nhằm tri ân khách hàng, đồng giá vé chỉ từ 55.000Đ 
            <Text> </Text>
            
          </Text>
        </View>
        
        {/* Đường kẻ ngang */}
        <View style={styles.divider} />
        
        {/* Điều khoản và điều kiện */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>ĐIỀU KHOẢN VÀ ĐIỀU KIỆN:</Text>
          
          {[
            "Áp dụng cho mọi loại ghế (bao gồm ghế Sweetbox).",
            "Giá MTB Combo chỉ áp dụng mua tại quầy.",
            "Giá MTB Combo ở trên chưa bao gồm nâng cấp vị phô mai và caramel.",
            "Không áp dụng cho mua vé nhóm (Group Sales), Suất Chiếu Đặc Biệt.",
            "Không áp dụng cho phòng chiếu ULTRA 4DX.",
            "Không áp dụng chung với chương trình khuyến mãi khác của CGV và đối tác.",
            "Không áp dụng cho các ngày Lễ, Tết."
          ].map((item, index) => (
            <View key={index} style={styles.termItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.termText}>{item}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.bookText}>ĐẶT VÉ NGAY &gt;&gt;</Text>
        
        {/* Các lựa chọn đặt vé */}
        <View style={styles.bookingOptions}>
          <TouchableOpacity 
            style={styles.optionButton} 
            onPress={handleBookByMoviePress} // Điều hướng đến Datvetheophim
          >
            <Text style={styles.optionText}>ĐẶT VÉ THEO PHIM</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionButton} 
            onPress={handleBookByCinemaPress} // Điều hướng đến ChonPhimTheoRap
          >
            <Text style={styles.optionText}>ĐẶT VÉ THEO RẠP</Text>
          </TouchableOpacity>
        </View>

        {/* Nút cuộn lên */}
        <View style={styles.scrollToTopContainer}>
          <TouchableOpacity style={styles.scrollToTopButton} onPress={scrollToTop}>
            <Ionicons name="arrow-up" size={20} color="white" />
            <Text style={styles.scrollToTopText}>Lên Đầu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 3,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    marginLeft: -135,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContainer: {
    flex: 1,
    marginTop: 60,
  },
  container: {
    marginTop: 15,
    padding: 16,
    paddingTop: 0,
    paddingBottom: 20,
  },
  bannerContainer: {
    marginTop: 20,
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: -15,
    paddingHorizontal: 16,
  },
  infoSection: {
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  linkText: {
    color: '#e71a0f',
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  termsSection: {
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#000',
    marginRight: 8,
  },
  termText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  bookText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  bookingOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 6,
    width: '48%',
    alignItems: 'center',
  },
  optionText: {
    color: '#e71a0f',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollToTopContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  scrollToTopButton: {
    backgroundColor: '#e71a0f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollToTopText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
});