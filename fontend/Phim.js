import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Dimensions, 
  StyleSheet, 
  SafeAreaView,
  Linking 
} from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'; // Thêm FontAwesome và MaterialCommunityIcons

export default function MovieDetailsScreen() {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Thêm state để kiểm soát việc mở rộng/thu gọn nội dung

  // Lấy ngày hiện tại làm mặc định
  const currentDate = new Date();
  const initialDay = currentDate.getDate();
  const initialMonth = currentDate.getMonth() + 1; // Tháng bắt đầu từ 0, nên +1
  const initialYear = currentDate.getFullYear();

  // State để lưu ngày được chọn và tháng hiện tại trong lịch
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(initialMonth);

  // Định dạng ngày
  const formattedDate = `${selectedDay < 10 ? '0' + selectedDay : selectedDay}/${selectedMonth < 10 ? '0' + selectedMonth : selectedMonth}/${selectedYear}`;

  // Hàm tính số ngày trong tháng (bao gồm năm nhuận)
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  // Dữ liệu tin mới và ưu đãi với link
  const newsData = [
    { id: 1, image: "https://picsum.photos/250/150?random=1", link: "https://example.com/promo1" },
    { id: 2, image: "https://picsum.photos/250/150?random=2", link: "https://example.com/promo2" },
    { id: 3, image: "https://picsum.photos/250/150?random=3", link: "https://example.com/promo3" },
    { id: 4, image: "https://picsum.photos/250/150?random=4", link: "https://example.com/promo4" },
    { id: 5, image: "https://picsum.photos/250/150?random=5", link: "https://example.com/promo5" },
    { id: 6, image: "https://picsum.photos/250/150?random=6", link: "https://example.com/promo6" },
    { id: 7, image: "https://picsum.photos/250/150?random=7", link: "https://example.com/promo7" },
    { id: 8, image: "https://picsum.photos/250/150?random=8", link: "https://example.com/promo8" },
    { id: 9, image: "https://picsum.photos/250/150?random=9", link: "https://example.com/promo9" },
    { id: 10, image: "https://picsum.photos/250/150?random=10", link: "https://example.com/promo10" },
  ];

  // Hàm mở link
  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error("Không thể mở URL:", err));
  };

  // Hàm xử lý khi nhấn ngày
  const handleDayPress = (day) => {
    setSelectedDay(day);
    setSelectedMonth(currentCalendarMonth);
  };

  // Hàm chuyển tháng
  const handlePrevMonth = () => {
    setCurrentCalendarMonth((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarMonth((prev) => (prev === 12 ? 1 : prev + 1));
  };

  // Hàm xử lý nhấn nút thích
  const handleLikePress = () => {
    if (isLiked) {
      setLikes(0);
      setIsLiked(false);
    } else {
      setLikes(1);
      setIsLiked(true);
    }
  };

  // Hàm đóng Modal và đặt lại thời gian thực tại
  const handleCloseCalendar = () => {
    setShowCalendar(false);
    setSelectedDay(initialDay);
    setSelectedMonth(initialMonth);
    setCurrentCalendarMonth(initialMonth);
  };

  const renderCalendarModal = () => {
    const daysInMonth = getDaysInMonth(currentCalendarMonth, selectedYear);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCalendar}
        onIRequestClose={handleCloseCalendar}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Lịch Chiếu</Text>
            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={handlePrevMonth}>
                <Ionicons name="chevron-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalDate}>
                {`${selectedDay < 10 ? '0' + selectedDay : selectedDay}/${currentCalendarMonth < 10 ? '0' + currentCalendarMonth : currentCalendarMonth}/${selectedYear}`}
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
                    i + 1 === initialDay && currentCalendarMonth === initialMonth && { backgroundColor: '#ffcccc' },
                    i + 1 === selectedDay && currentCalendarMonth === selectedMonth && { backgroundColor: '#cce5ff' },
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

  const renderShareModal = () => {
    // Nội dung chia sẻ (liên kết và văn bản)
    const shareLink = 'https://www.cgv.vn/nha-gia-tien'; // Thay bằng liên kết thực tế của bạn
    const shareText = 'Xem phim Nhà Gia Tiên tại đây!';

    // Dữ liệu các nền tảng chia sẻ với hình ảnh và liên kết tương ứng
    const sharePlatforms = [
      { 
        name: 'Messenger', 
        image: 'https://i.imgur.com/5z5z5z5.png', 
        shareUrl: `fb-messenger://share?link=${encodeURIComponent(shareLink)}`,
        fallbackUrl: `https://www.messenger.com/t/?link=${encodeURIComponent(shareLink)}` // Phương án dự phòng
      },
      { 
        name: 'Facebook', 
        image: 'https://i.imgur.com/6y6y6y6.png', 
        shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
        fallbackUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}` // Đã là trình duyệt
      },
      { 
        name: 'Zalo', 
        image: 'https://i.imgur.com/7z7z7z7.png', 
        shareUrl: `zalo://action/share?text=${encodeURIComponent(shareText + ' ' + shareLink)}`,
        fallbackUrl: `https://zalo.me/share?url=${encodeURIComponent(shareLink)}&title=${encodeURIComponent(shareText)}` // Phương án dự phòng
      },
      { 
        name: 'WeChat', 
        image: 'https://i.imgur.com/8z8z8z8.png', 
        shareUrl: `weixin://dl/share?text=${encodeURIComponent(shareText + ' ' + shareLink)}`,
        fallbackUrl: `https://www.wechat.com/` // Phương án dự phòng: mở trang chủ WeChat
      },
      { 
        name: 'Telegram', 
        image: 'https://i.imgur.com/9z9z9z9.png', 
        shareUrl: `tg://msg_url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareText)}`,
        fallbackUrl: `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareText)}` // Phương án dự phòng
      },
    ];

    // Hàm xử lý khi nhấn vào một nền tảng chia sẻ
    const handleSharePress = (platform) => {
      Linking.openURL(platform.shareUrl).catch((err) => {
        console.error("Không thể mở URL:", err);
        // Nếu không mở được ứng dụng, mở liên kết dự phòng
        if (platform.fallbackUrl) {
          Linking.openURL(platform.fallbackUrl).catch((err) => {
            console.error("Không thể mở URL dự phòng:", err);
            alert(`Không thể chia sẻ qua ${platform.name}. Vui lòng thử lại hoặc cài đặt ứng dụng.`);
          });
        } else {
          alert(`Không thể mở ứng dụng ${platform.name}. Vui lòng cài đặt ứng dụng hoặc thử lại.`);
        }
      });
    };

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
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.shareScrollContainer}
            >
              <View style={styles.shareGrid}>
                {sharePlatforms.map((platform) => (
                  <TouchableOpacity 
                    key={platform.name} 
                    style={styles.sharePlatform}
                    onPress={() => handleSharePress(platform)} // Gọi hàm xử lý khi nhấn
                  >
                    <Image 
                      source={{ uri: platform.image }} 
                      style={styles.platformIcon} 
                    />
                    <Text>{platform.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
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

  // Nội dung đầy đủ của phim
  const fullDescription = `Nhà Gia Tiên xoay quanh câu chuyện đa góc nhìn vê các thế hệ khác nhau trong một gia đình, có hai nhân vật chính là Gia Minh (Huỳnh Lập) và Mý Tiên (Phương My Chi). Trở về căn nhà gia tiên đế quay các video "triệu view" trên mạng xã hội, Mý Tiên - một nhà sáng tạo nội dung thuộc thế hệ Z vốn không tin vào chuyện tâm linh, hoàn toàn mất kết nối với gia đình, bất ngờ nhìn thấy Gia Minh - người anh trai đã mất từ lâu. Để hồn ma của Gia Minh có thế siêu thoát và không tiếp tục làm phiên mình Mý Tiên bắt tay cùng Gia Minh lên kế hoạch giữ lấy căn nhà gia tiên đang bị họ hàng tranh chấp, đòi ông nội chia tài sản. Đứng trước hàng loạt bí mật động trời trong căn nhà gia tiên, liệu Mỹ Tiên có vượt qua được tất cả để hoàn thành di nguyện của Gia Minh?`;

  // Nội dung thu gọn (lấy khoảng 2 dòng đầu)
  const shortDescription = `Nhà Gia Tiên xoay quanh câu chuyện đa góc nhìn vê các thế hệ khác nhau trong một gia đình, có hai nhân vật chính là Gia Minh (Huỳnh Lập) và Mý Tiên (Phương My Chi). Trở về căn nhà gia tiên đế quay các video "triệu view" trên mạng xã hội, Mý Tiên - một nhà sáng tạo nội dung thuộc thế hệ Z vốn không tin vào chuyện tâm linh,...`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.backButton}>
          <TouchableOpacity>
            <Ionicons name="arrow-back" size={24} />
          </TouchableOpacity>
          <Text style={styles.backButtonText}>Phim</Text>
        </View>
        <TouchableOpacity onPress={() => {/* Xử lý khi nhấn menu */}}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine}></View>
            <View style={styles.menuLine}></View>
            <View style={styles.menuLine}></View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* Main Poster */}
          <View style={styles.posterContainer}>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play-circle" size={60} color="white" />
            </TouchableOpacity>
            <Image 
              source={{ uri: 'https://picsum.photos/800/500' }} 
              style={styles.mainPoster} 
            />
            {/* ThumbnailPoster đè lên mainPoster */}
            <Image 
              source={{ uri: 'https://picsum.photos/100/150' }} 
              style={styles.thumbnailPoster} 
            />
          </View>

          {/* Movie Details */}
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
                  <Text>1 giờ 57 phút</Text>
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
                    color={isLiked ? 'red' : 'gray'}
                  />
                  <Text>{likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowShare(true)}>
                  <Ionicons name="share-social" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Movie Information */}
          <View style={styles.movieInfoSection}>
            <Text style={styles.movieTitle}>Nhà Gia Tiên</Text>
            <Text style={styles.infoValue}>
              {isExpanded ? fullDescription : shortDescription}
            </Text>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Text style={styles.toggleText}>
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </Text>
            </TouchableOpacity>
            <View style={styles.movieInfoDetail}>
              <Text style={styles.infoLabel}>Kiểm duyệt:</Text>
              <Text style={styles.infoValue}>T18- Phim được phố biến đến
người xem từ đủ 18 tuổi trở lên.</Text>
            </View>
            <View style={styles.movieInfoDetail}>
              <Text style={styles.infoLabel}>Thể loại:</Text>
              <Text style={styles.infoValue}>Hài, Gia Đình</Text>
            </View>
            <View style={styles.movieInfoDetail}>
              <Text style={styles.infoLabel}>Đạo diễn:</Text>
              <Text style={styles.infoValue}>Huỳnh Lập</Text>
            </View>
            <View style={styles.movieInfoDetail}>
              <Text style={styles.infoLabel}>Diễn viên:</Text>
              <Text style={styles.infoValue}>
               Huỳnh Lập, Phương Mý Chi, NSUT
Hạnh Thuý, NSUT Huỳnh Đông.
Puka, Đào Anh Tuấn, Trung Dân
Kiều Linh, Lê Nam, Chí Tâm, Thanh
Thức, Trác Thuý Miêu, Mai Thế
Hiệp, NS Mạnh Dung, NSUT Thanh
Dậu, NS Thanh Hiền, Nguyễn Anh
Tú,...
              </Text>
            </View>
            <View style={styles.movieInfoDetail}>
              <Text style={styles.infoLabel}>Ngôn ngữ:</Text>
              <Text style={styles.infoValue}>Tiếng Việt, Phụ đề Tiếng Anh</Text>
            </View>
          </View>
          
          {/* News & Offers */}
          <View style={styles.newsHeader}>
            <Text style={styles.infoLabel1}>Tin mới & Ưu đãi</Text>
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

      {/* Book Ticket Button - Fixed to Bottom */}
      <TouchableOpacity style={styles.bookTicketButton}>
        <Text style={styles.bookTicketButtonText}>Đặt Vé</Text>
      </TouchableOpacity>

      {/* Modals */}
      {renderCalendarModal()}
      {renderShareModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 80,
  },
  header: {
    marginTop:20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuIcon: {
    width: 24,
    height: 20,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 3,
    backgroundColor: 'black',
    width: '100%',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  posterContainer: {
    position: 'relative',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    zIndex: 10,
  },
  mainPoster: {
    width: '100%',
    height: 250,
  },
  thumbnailPoster: {
    width: 80,
    height: 120,
    borderRadius: 10,
    position: 'absolute',
    bottom: -60,
    left: 15,
    zIndex: 20,
  },
  movieInfoRow: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    gap: 15,
  },
  movieDetails: {
    flex: 1,
    marginLeft: 90,
  },
  showtimeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 15,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1, // Thêm đường viền mỏng
    borderColor: '#ccc', // Màu đường viền
    padding: 5, // Thêm padding để nội dung không sát viền
    borderRadius: 5, // Bo góc nhẹ cho đường viền
  },
  calendarButtonText: {
    fontSize: 14,
  },
  durationContainer: {
    borderWidth: 1, // Thêm đường viền mỏng
    borderColor: '#ccc', // Màu đường viền
    padding: 5, // Thêm padding để nội dung không sát viền
    borderRadius: 5, // Bo góc nhẹ cho đường viền
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
    gap: 15,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  movieInfoSection: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  movieInfoDetail: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    marginTop:20,
    fontWeight: 'bold',
    marginRight: 10,
    width: 100,
  },
  infoLabel2: {
    marginTop: -10.5,
    fontWeight: 'bold',
    marginRight: 10,
    marginLeft: 150,
    width: 100,
    borderWidth: 1, // Đường viền mỏng đã có từ trước
    borderColor: '#ccc',
    padding: 5,
    borderRadius: 5,
    textAlign: 'center',
  },
  infoLabel1: {
    fontWeight: 'bold',
  },
  infoValue: {
    marginTop: 20,
    flex: 1,
  },
  toggleText: {
    color: 'red',
    marginTop: 5,
    textAlign: 'right',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 20,
  },
  allButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  allButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  offersContainer: {
    paddingHorizontal: 15,
    marginTop: 5,
  },
  offerCard: {
    marginRight: 10,
    width: 220,
  },
  offerImage: {
    width: 220,
    height: 140,
    borderRadius: 10,
  },
  offerTitle: {
    marginTop: 5,
    fontWeight: 'bold',
  },
  bookTicketButton: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 20,
    left: 0,
    right: 0,
    backgroundColor: 'red',
    padding: 15,
    alignItems: 'center',
  },
  bookTicketButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  modalDate: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  calendarDay: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  shareScrollContainer: {
    maxHeight: 100, // Giới hạn chiều cao để không vượt quá Modal
  },
  shareGrid: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  sharePlatform: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  platformIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});