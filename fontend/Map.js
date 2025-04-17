import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Dimensions, FlatList, Modal, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const flatListRef = useRef(null);
  const scrollViewRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;
  
  const carouselData = [
    { id: '1', image: require('./assets/Anh1.jpeg') },
    { id: '2', image: require('./assets/Anh12.jpg') },
    { id: '3', image: require('./assets/Anh13.jpg') },
    { id: '4', image: require('./assets/Anh14.jpg') },
    { id: '5', image: require('./assets/Anh15.jpg') },
  ];

  const newsData = [
    { id: '1', image: require('./assets/Anh1.jpeg') },
    { id: '2', image: require('./assets/Anh2.jpeg') },
    { id: '3', image: require('./assets/Anh3.jpeg') },
    { id: '4', image: require('./assets/Anh4.jpeg') },
    { id: '5', image: require('./assets/Anh5.jpeg') },
    { id: '6', image: require('./assets/Anh6.jpeg') },
    { id: '7', image: require('./assets/Anh7.jpeg') },
    { id: '8', image: require('./assets/Anh1.jpeg') },
    { id: '9', image: require('./assets/Anh2.jpeg') },
    { id: '10', image: require('./assets/Anh3.jpeg') },
    { id: '11', image: require('./assets/Anh4.jpeg') },
    { id: '12', image: require('./assets/Anh5.jpeg') },
  ];

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      if (carouselData.length > 0) {
        const nextIndex = (currentIndex + 1) % carouselData.length;
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          setCurrentIndex(nextIndex);
        }
      }
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, [currentIndex]);

  const renderCarouselItem = ({ item }) => {
    return (
      <View style={{ width: screenWidth }}>
        <Image
          source={item.image}
          style={styles.carouselImage}
          resizeMode="cover"
        />
      </View>
    );
  };

  const renderNewsItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.newsItem}>
        <Image 
          source={item.image} 
          style={styles.newsImage} 
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.floor(scrollPosition / screenWidth);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleScrollToIndexFailed = (info) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ 
          index: info.index, 
          animated: true 
        });
      }
    });
  };

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const openGoogleMaps = () => {
    const url = 'https://www.google.com/maps/search/?api=1&query=CGV+Vincom+Center+Bà+Triệu';
    Linking.openURL(url).catch(err => console.error('Error opening Google Maps:', err));
  };

  const makePhoneCall = () => {
    const phoneNumber = '19006776';
    Linking.openURL(`tel:${phoneNumber}`).catch(err => console.error('Error making phone call:', err));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271220.png' }} 
            style={styles.backIcon} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rạp Phim MTB</Text>
        <View style={styles.headerRightButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/786/786205.png' }} 
              style={styles.headerIcon} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3917/3917215.png' }} 
              style={styles.headerIcon} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Theater info */}
      <View style={styles.theaterInfoContainer}>
        <View style={styles.theaterInfo}>
          <View style={styles.theaterNameContainer}>
            <Text style={styles.theaterName}>MTB </Text>
            <Text style={styles.theaterNameBlack}>Vincom Bà Triệu</Text>
          </View>
          <Text style={styles.theaterDistance}>1,28Km</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        ref={scrollViewRef}
      >
        {/* Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={carouselData}
            renderItem={renderCarouselItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onScrollToIndexFailed={handleScrollToIndexFailed}
            scrollEventThrottle={16}
            initialScrollIndex={0}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
          />
          <View style={styles.indicatorContainer}>
            {carouselData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  { backgroundColor: index === currentIndex ? '#B22222' : '#ccc' },
                ]}
              />
            ))}
          </View>
        </View>
        
        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowPriceModal(true)}
          >
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/471/471664.png' }} 
              style={styles.actionIcon} 
            />
            <Text style={styles.actionText}>Giá vé</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png' }} 
              style={styles.actionIcon} 
            />
            <Text style={styles.actionText}>Suất chiếu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={makePhoneCall}
          >
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/0/191.png' }} 
              style={styles.actionIcon} 
            />
            <Text style={styles.actionText}>Gọi</Text>
          </TouchableOpacity>
        </View>
        
        {/* Map - Made clickable to open Google Maps */}
        <TouchableOpacity onPress={openGoogleMaps} style={styles.mapContainer}>
          <Image 
            source={require('./assets/Anh7.jpeg')} 
            style={styles.mapImage} 
            resizeMode="cover"
          />
        </TouchableOpacity>
        
        {/* Location details */}
        <View style={styles.locationContainer}>
          <TouchableOpacity onPress={openGoogleMaps}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/684/684908.png' }} 
              style={styles.locationPin} 
            />
          </TouchableOpacity>
          <View style={styles.locationDetails}>
            <Text style={styles.locationTitle}>Tầng 6, Tòa nhà VinCom Center Hà Nội 191 đường Bà Triệu Quận Hai Bà Trưng Hà Nội</Text>
            <Text style={styles.locationSubtitle}>Chỉ đường</Text>
          </View>
        </View>
        
        {/* Brand logos */}
        <View style={styles.brandContainer}>
          <TouchableOpacity style={styles.brandCircle}>
            <Text style={styles.sweetboxText}>SWEETBOX</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.brandCircle}>
            <Text style={styles.cineText}>CINE</Text>
            <Text style={styles.superText}>SUPER</Text>
          </TouchableOpacity>
        </View>
        
        {/* News and promotions */}
        <View style={styles.newsContainer}>
          <View style={styles.newsHeader}>
            <Text style={styles.newsTitle}>Tin mới & Ưu đãi</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>TẤT CẢ</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={newsData}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newsListContainer}
          />
        </View>

        {/* Icon chữ V úp ngược ở cuối ScrollView */}
        <TouchableOpacity onPress={scrollToTop} style={styles.scrollToTopContainer}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/992/992703.png' }}
            style={styles.scrollToTopIcon}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Price Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPriceModal}
        onRequestClose={() => setShowPriceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Fixed Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowPriceModal(false)}
                style={styles.closeButton}
              >
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/748/748122.png' }} 
                  style={styles.closeIcon} 
                />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Giá vé</Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView style={styles.modalScrollContent}>
              {/* Youth Price Header */}
              <View style={styles.priceHeaderDark}>
                <Text style={styles.priceHeaderText}>ĐỒNG GIÁ CHO THÀNH VIÊN TỪ 23 TUỔI TRỞ XUỐNG</Text>
              </View>

              {/* Youth Price Info */}
              <View style={styles.youthPriceInfo}>
                <Text style={styles.youthPriceText}>70.000 / 2D Áp Dụng Khách Hàng Dưới 23 Tuổi/Thành Viên U22</Text>
              </View>

              {/* 2D Price Table Header */}
              <View style={styles.priceHeaderDark}>
                <Text style={styles.priceHeaderText}>BẢNG GIÁ VÉ 2D</Text>
              </View>

              {/* Price Table */}
              <View style={styles.priceTable}>
                {/* Header Row */}
                <View style={styles.tableRow}>
                  <View style={styles.tableCell1}>
                    <Text style={styles.tableCellText}>Từ Thứ Hai Đến Chủ Nhật</Text>
                  </View>
                  <View style={styles.tableCell2}>
                    <Text style={styles.tableCellText}>Thành Viên 22 Tuổi Trở Xuống</Text>
                  </View>
                  <View style={styles.tableCell3}>
                    <Text style={styles.tableCellText}>70.000</Text>
                  </View>
                </View>

                {/* Mon-Tue-Thu section */}
                <View style={styles.tableRowGroup}>
                  <View style={[styles.tableRowGroupCell, styles.tableCell1]}>
                    <Text style={styles.tableCellText}>Thứ Hai, Thứ Ba, Thứ Năm</Text>
                  </View>
                  <View style={styles.tableRowStackRight}>
                    <View style={styles.tableRow}>
                      <View style={styles.tableCell2}>
                        <Text style={styles.tableCellText}>Người Cao Tuổi</Text>
                      </View>
                      <View style={styles.tableCell3}>
                        <Text style={styles.tableCellText}>80.000</Text>
                      </View>
                    </View>
                    <View style={styles.tableRow}>
                      <View style={styles.tableCell2}>
                        <Text style={styles.tableCellText}>Trẻ Em</Text>
                      </View>
                      <View style={styles.tableCell3}>
                        <Text style={styles.tableCellText}>65.000</Text>
                      </View>
                    </View>
                    <View style={styles.tableRow}>
                      <View style={styles.tableCell2}>
                        <Text style={styles.tableCellText}>Người Lớn</Text>
                      </View>
                      <View style={styles.tableCell3}>
                        <Text style={styles.tableCellText}>110.000</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Wednesday row */}
                <View style={styles.tableRow}>
                  <View style={[styles.tableCell1, styles.tableCellWednesday]}>
                    <Text style={styles.tableCellText}>Thứ Tư Vui Vẻ</Text>
                  </View>
                  <View style={styles.tableCell3}>
                    <Text style={styles.tableCellText}>75.000</Text>
                  </View>
                </View>

                {/* Weekend section */}
                <View style={styles.tableRowGroup}>
                  <View style={[styles.tableRowGroupCell, styles.tableCell1]}>
                    <Text style={styles.tableCellText}>Thứ Sáu, Thứ Bảy, Chủ Nhật, & Ngày Lễ</Text>
                  </View>
                  <View style={styles.tableRowStackRight}>
                    <View style={styles.tableRow}>
                      <View style={styles.tableCell2}>
                        <Text style={styles.tableCellText}>Trẻ Em</Text>
                      </View>
                      <View style={styles.tableCell3}>
                        <Text style={styles.tableCellText}>65.000</Text>
                      </View>
                    </View>
                    <View style={styles.tableRow}>
                      <View style={styles.tableCell2}>
                        <Text style={styles.tableCellText}>Người Cao Tuổi</Text>
                      </View>
                      <View style={styles.tableCell3}>
                        <Text style={styles.tableCellText}>90.000</Text>
                      </View>
                    </View>
                    <View style={styles.tableRow}>
                      <View style={styles.tableCell2}>
                        <Text style={styles.tableCellText}>Người Lớn</Text>
                      </View>
                      <View style={styles.tableCell3}>
                        <Text style={styles.tableCellText}>130.000</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Additional fees */}
              <View style={styles.additionalFees}>
                <Text style={styles.additionalFeesHeader}>PHỤ THU:</Text>
                <Text style={styles.additionalFeesText}>Ghế VIP ( Miễn Phụ Thu Cho U22 )</Text>
                <Text style={styles.additionalFeesText}>+5.000</Text>
                <Text style={styles.additionalFeesText}>Sweetbox</Text>
                <Text style={styles.additionalFeesText}>+25.000 (Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu, Thứ Bảy, Chủ Nhật )</Text>
                <Text style={styles.additionalFeesText}>3D</Text>
                <Text style={styles.additionalFeesText}>+30.000 (Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm)</Text>
                <Text style={styles.additionalFeesText}>+50.000 (Thứ Sáu, Thứ Bảy, Chủ Nhật Và Ngày Lễ )</Text>
              </View>

              {/* Gold Class Price Table */}
              <View style={styles.priceHeaderDark}>
                <Text style={styles.priceHeaderText}>BẢNG GIÁ VÉ GOLD CLASS</Text>
              </View>
              <View style={styles.priceTable}>
                <View style={styles.tableRow}>
                  <View style={styles.tableCell1}>
                    <Text style={styles.tableCellText}>Phòng Chiếu Gold Class</Text>
                  </View>
                  <View style={styles.tableCell1}>
                    <Text style={styles.tableCellText}>Đồng Giá 300.000</Text>
                  </View>
                </View>
              </View>

              {/* L'Amour Price Table */}
              <View style={styles.priceHeaderDark}>
                <Text style={styles.priceHeaderText}>BẢNG GIÁ VÉ L'AMOUR</Text>
              </View>
              <View style={styles.priceTable}>
                <View style={styles.tableRow}>
                  <View style={styles.tableCell1}>
                    <Text style={styles.tableCellText}>Phòng Chiếu L'amour</Text>
                  </View>
                  <View style={styles.tableCell1}>
                    <Text style={styles.tableCellText}>600.000 / 1 Giường, Tối Đa 2 Người</Text>
                  </View>
                </View>
              </View>

              {/* Notes Section */}
              <View style={styles.notesSection}>
                <Text style={styles.notesHeader}>LƯU Ý :</Text>
                <Text style={styles.notesText}>- Vui lòng xuất trình tài khoản thành viên MTB (Thẻ cứng, ứng dụng) hoặc đọc số điện thoại trước khi mua vé để được tích điểm và tổng chi tiêu.</Text>
                <Text style={styles.notesText}>- Giá vé khi đặt vé trực tuyến trên website và ứng dụng MTB là giá vé người lớn. Các loại vé như học sinh-sinh viên, vé trẻ em, vé người cao tuổi, vé U22 vui lòng mua trực tiếp tại quầy.</Text>
                <Text style={styles.notesText}>- Vé trẻ em chỉ xuất khi có sự hiện diện của trẻ dưới 1m3 và trên 2 tuổi, hoặc dưới 16 tuổi. Miễn phí cho trẻ em dưới 70cm hoặc dưới 2 tuổi (Vui lòng xuất trình CMND/CCCD/VNeID/Thẻ HS-SV/... khi mua vé).</Text>
                <Text style={styles.notesText}>- Vé người cao tuổi chỉ dành cho khách hàng trên 55 tuổi. Vui lòng xuất trình CMND/CCCD/VNeID/... khi mua vé.</Text>
                <Text style={styles.notesText}>- Vé U22 dành cho thành viên U22, khách hàng dưới 23 tuổi(Vui lòng xuất trình CMND/CCCD/VNeID/Thẻ HS-SV/..Khi mua vé) hoặc khách hàng mặc đồng phục HS-SV.</Text>
                <Text style={styles.notesText}>- Giảm thêm 20% trên giá vé Thứ 4 vui vẻ(Happy day), Thứ 2 cuối tháng(Culture day) cho khách hàng là trẻ em, người cao tuổi.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 45,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#B22222',
  },
  headerTitle: {
    marginLeft:-100,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRightButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: '#B22222',
  },
  theaterInfoContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  theaterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  theaterNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  theaterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B22222',
  },
  theaterNameBlack: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  theaterDistance: {
    fontSize: 16,
    color: '#B22222',
  },
  carouselContainer: {
    height: 200,
    width: '100%',
  },
  carouselImage: {
    width: '100%',
    height: 180,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 28,
    height: 28,
    tintColor: '#000',
    marginBottom: 5,
  },
  actionText: {
    fontSize: 14,
    color: '#000',
  },
  mapContainer: {
    width: '100%',
    height: 180,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  locationContainer: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationPin: {
    width: 24,
    height: 24,
    marginRight: 15,
    tintColor: '#555',
  },
  locationDetails: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 15,
    color: '#000',
    marginBottom: 5,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#777',
  },
  brandContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  brandCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: '#FF6B91',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  sweetboxText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B91',
  },
  cineText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B91',
  },
  superText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B91',
  },
  newsContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  viewAllText: {
    fontSize: 14,
    color: '#777',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  newsListContainer: {
    paddingRight: 15,
  },
  newsItem: {
    width: 160,
    height: 160,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  newsImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  scrollToTopContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  scrollToTopIcon: {
    width: 24,
    height: 24,
    tintColor: '#B22222',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginTop: 50,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 1,
  },
  closeButton: {
    marginRight: 10,
  },
  closeIcon: {
    width: 28,
    height: 28,
    tintColor: '#B22222',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScrollContent: {
    flex: 1,
  },
  priceHeaderDark: {
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  priceHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  youthPriceInfo: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  youthPriceText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
   priceTable: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableRowGroup: {
    flexDirection: 'row',
  },
  tableRowStackRight: {
    flex: 1,
  },
  tableRowGroupCell: {
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  tableCell1: {
    width: '33%',
    padding: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  tableCell2: {
    width: '42%',
    padding: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  tableCell3: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellWednesday: {
    width: '75%',
  },
  tableCellText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
  },
  additionalFees: {
    padding: 15,
  },
  additionalFeesHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  additionalFeesText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#555',
    marginBottom: 6,
  },
  notesSection: {
    padding: 15,
  },
  notesHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  notesText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#555',
    marginBottom: 6,
  },
});