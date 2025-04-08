import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Movie Format Modal Component
const MovieFormatModal = ({ visible, onClose, onSelectFormat }) => {
  const formats = ['2D', '3D', '4D', 'IMAX', 'ScreenX'];
  
  return (
    <Modal 
      animationType="fade" 
      transparent={true} 
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPressOut={onClose}
      >
        <View style={styles.formatModalContainer}>
          {formats.map((format, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.formatOption}
              onPress={() => {
                onSelectFormat(format);
                onClose();
              }}
            >
              <Text style={styles.formatOptionText}>{format}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// Date Selector Component with real-time today tracking
const DateSelector = () => {
  const [today, setToday] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const scrollViewRef = useRef(null);

  const areSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newToday = new Date();
      setToday(newToday);
      
      if (areSameDay(selectedDate, today)) {
        setSelectedDate(newToday);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [selectedDate, today]);

  const getDatesOfMonth = (month, year) => {
    const dates = [];
    const date = new Date(year, month, 1);
    
    while (date.getMonth() === month) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    
    return dates;
  };

  const getMonthsOfYear = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push({
        month: i,
        year: today.getFullYear(),
        dates: getDatesOfMonth(i, today.getFullYear())
      });
    }
    return months;
  };

  const scrollToToday = () => {
    const monthData = getMonthsOfYear();
    const currentMonthIndex = today.getMonth();
    const todayIndex = monthData[currentMonthIndex].dates.findIndex(
      (date) => areSameDay(date, today)
    );
    
    if (scrollViewRef.current && todayIndex !== -1) {
      const xPosition = todayIndex * 60;
      scrollViewRef.current.scrollTo({ x: xPosition - width / 2 + 25, animated: true });
    }
  };

  useEffect(() => {
    scrollToToday();
  }, [today]);

  const renderMonthDates = (monthData) => {
    return monthData.dates.map((date, index) => {
      const isToday = areSameDay(date, today);
      const isSelected = areSameDay(date, selectedDate);
      
      return (
        <TouchableOpacity 
          key={index} 
          style={[
            styles.dateBox,
            isToday && styles.todayDateBox,
            isSelected && !isToday && styles.selectedDateBox
          ]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={[
            styles.weekdayText,
            (isToday || isSelected) && styles.selectedDateText
          ]}>
            {['CN', 'T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7'][date.getDay()]}
          </Text>
          <Text style={[
            styles.dateText,
            (isToday || isSelected) && styles.selectedDateText
          ]}>
            {date.getDate()}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.dateContainer}>
      <View style={styles.dateHeaderContainer}>
        <Text style={styles.currentDateText}>
          {areSameDay(selectedDate, today)
            ? `Hôm nay, ${selectedDate.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}`
            : `${selectedDate.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}`}
        </Text>
      </View>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.monthDateScroll}
        contentContainerStyle={styles.monthDateScrollContent}
      >
        {getMonthsOfYear().map((monthData, monthIndex) => (
          <View key={monthIndex} style={styles.monthContainer}>
            {renderMonthDates(monthData)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Theater Locations Component
const TheaterLocations = ({ isFilteredView = false }) => {
  const [expandedTheater, setExpandedTheater] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Simulate getting user location (in a real app, you would use Geolocation API)
    const locationInterval = setInterval(() => {
      // This is a mock - in a real app you'd use navigator.geolocation
      setUserLocation({
        latitude: 21.0285,
        longitude: 105.8542
      });
    }, 300000); // Update every 5 minutes

    return () => {
      clearInterval(timeInterval);
      clearInterval(locationInterval);
    };
  }, []);

  // Calculate distances based on user location (mock implementation)
  const calculateDistance = (theaterLocation) => {
    if (!userLocation) return '...Km';
    
    // Mock distance calculation - in a real app you would use actual coordinates
    const distances = {
      'MTB Aeon Canary': '1.28Km',
      'MTB Vincom Center Bà Triệu': '1.28Km',
      'MTB Trương Định Plaza': '1.82Km',
      'MTB Sun Grand Lương Yên': '2.23Km',
      'MTB Vincom Times City': '2.51Km',
      'MTB Vincom Royal City': '3.09Km',
      'MTB Vincom Trần Duy Hưng': '4.47Km',
      'MTB Vincom Nguyễn Chí Thanh': '4.52Km',
      'MTB Rice City': '4.72Km',
      'MTB Sun Grand Thụy Khuê': '4.95Km',
      'MTB Mac Plaza (Machinco)': '6.11Km',
      'MTB Aeon Long Biên': '6.26Km',
      'MTB Hồ Gươm Plaza': '6.59Km'
    };
    
    return distances[theaterLocation] || '...Km';
  };

  // Tạo các khung thời gian chiếu phim cho mỗi rạp dựa trên ngày được chọn
  const generateShowtimesForTheater = (theaterName, selectedDate) => {
    // Tạo danh sách các khung giờ chiếu cố định theo rạp
    const allShowtimesByTheater = {
      'MTB Aeon Canary': ['07:30', '10:00', '12:30', '15:00', '17:30', '20:10', '22:40'],
      'MTB Vincom Center Bà Triệu': ['08:00', '10:30', '13:00', '15:30', '18:45', '19:50', '22:25'],
      'MTB Trương Định Plaza': ['08:30', '11:00', '13:30', '16:00', '18:30', '21:45'],
      'MTB Sun Grand Lương Yên': ['07:45', '10:15', '12:45', '15:15', '17:45', '19:45', '22:10'],
      'MTB Vincom Times City': ['08:15', '10:45', '13:15', '15:45', '18:15', '20:00', '22:30'],
      'MTB Vincom Royal City': ['07:00', '09:30', '12:00', '14:30', '17:00', '19:30', '22:40'],
      'MTB Vincom Trần Duy Hưng': ['08:45', '11:15', '13:45', '16:15', '18:45', '20:15', '22:45'],
      'MTB Vincom Nguyễn Chí Thanh': ['07:15', '09:45', '12:15', '14:45', '17:15', '19:00', '21:30'],
      'MTB Rice City': ['08:20', '10:50', '13:20', '15:50', '18:20', '20:20', '22:50'],
      'MTB Sun Grand Thụy Khuê': ['07:45', '10:15', '12:45', '15:15', '17:45', '19:15', '21:45'],
      'MTB Mac Plaza (Machinco)': ['08:30', '11:00', '13:30', '16:00', '18:30', '20:30', '23:00'],
      'MTB Aeon Long Biên': ['07:50', '10:20', '12:50', '15:20', '17:50', '19:20', '21:50'],
      'MTB Hồ Gươm Plaza': ['08:15', '10:45', '13:15', '15:45', '18:15', '20:45', '23:15']
    };
    
    // Lấy danh sách khung giờ cho rạp cụ thể
    return allShowtimesByTheater[theaterName] || [];
  };

  // Kiểm tra xem thời gian đã qua hay chưa
  const isTimePassed = (showtime) => {
    // Nếu đang xem ngày khác, không cần kiểm tra thời gian đã qua
    if (selectedDate.getDate() !== new Date().getDate() || 
        selectedDate.getMonth() !== new Date().getMonth() || 
        selectedDate.getFullYear() !== new Date().getFullYear()) {
      return false;
    }
    
    const [hours, minutes] = showtime.split(':').map(Number);
    const showDateTime = new Date();
    showDateTime.setHours(hours, minutes, 0, 0);
    return currentTime > showDateTime;
  };

  // Danh sách tất cả các rạp
  const allTheaters = [
    {
      id: 1,
      name: 'MTB Aeon Canary',
      format: '2D Phụ Đề Anh',
      distance: calculateDistance('MTB Aeon Canary'),
      suggested: true
    },
    {
      id: 2,
      name: 'MTB Vincom Center Bà Triệu',
      format: '2D Phụ Đề Anh',
      distance: calculateDistance('MTB Vincom Center Bà Triệu'),
      suggested: true
    },
    {
      id: 3,
      name: 'MTB Trương Định Plaza',
      format: '2D Phụ Đề Anh',
      distance: calculateDistance('MTB Trương Định Plaza'),
      suggested: true
    },
    {
      id: 4,
      name: 'MTB Sun Grand Lương Yên',
      format: '2D Phụ Đề Anh',
      distance: calculateDistance('MTB Sun Grand Lương Yên'),
      suggested: true
    },
    {
      id: 5,
      name: 'MTB Vincom Times City',
      format: '2D Phụ Đề Anh',
      distance: calculateDistance('MTB Vincom Times City'),
      suggested: true
    },
    {
      id: 6,
      name: 'MTB Vincom Royal City',
      format: '2D Phụ Đề Anh',
      distance: calculateDistance('MTB Vincom Royal City'),
      suggested: true
    },
    {
      id: 7,
      name: 'MTB Vincom Trần Duy Hưng',
      format: '2D Phụ Đề Anh',
      distance: calculateDistance('MTB Vincom Trần Duy Hưng'),
      suggested: true
    },
    {
      id: 8,
      name: 'MTB Vincom Nguyễn Chí Thanh',
      format: '2D Phụ Đề Anh',
      distance: calculateDistance('MTB Vincom Nguyễn Chí Thanh'),
      suggested: true
    },
    {
      id: 9,
      name: 'MTB Rice City',
      format: '2D Phụ Đề Anh',
      distance: calculateDistance('MTB Rice City'),
      suggested: true
    },
    {
      id: 10,
      name: 'MTB Sun Grand Thụy Khuê',
      format: '2D Phụ Đề Anh',
      distance: calculateDistance('MTB Sun Grand Thụy Khuê'),
      suggested: true
    },
    {
      id: 11,
      name: 'MTB Mac Plaza (Machinco)',
      format: '2D Phụ Đề Anh',
      distance: calculateDistance('MTB Mac Plaza (Machinco)'),
      suggested: true
    },
    {
      id: 12,
      name: 'MTB Aeon Long Biên',
      format: '2D Phụ Đề Anh',
      distance: calculateDistance('MTB Aeon Long Biên'),
      suggested: true
    },
    {
      id: 13,
      name: 'MTB Hồ Gươm Plaza',
      format: '2D Phụ Đề Anh',
      distance: calculateDistance('MTB Hồ Gươm Plaza'),
      suggested: true
    },
    // Thêm các rạp không được đề xuất vào danh sách tất cả các rạp
    {
      id: 14,
      name: 'MTB Cầu Giấy',
      format: '2D Phụ Đề Anh',
      distance: '7.21Km',
      suggested: false
    },
    {
      id: 15,
      name: 'MTB Mipec Long Biên',
      format: '2D Phụ Đề Anh',
      distance: '7.65Km',
      suggested: false
    },
    {
      id: 16,
      name: 'MTB Vincom Mega Mall Ocean Park',
      format: '2D Phụ Đề Anh',
      distance: '8.32Km',
      suggested: false
    },
    {
      id: 17,
      name: 'MTB Aeon Mall Hà Đông',
      format: '2D Phụ Đề Anh',
      distance: '9.14Km',
      suggested: false
    },
    {
      id: 18,
      name: 'MTB Vincom Plaza Bắc Từ Liêm',
      format: '2D Phụ Đề Anh',
      distance: '9.76Km',
      suggested: false
    },
    {
      id: 19,
      name: 'MTB Dragon Mall Hạ Long',
      format: '2D Phụ Đề Anh',
      distance: '154.3Km',
      suggested: false
    }
  ];

  // Lọc rạp dựa vào trạng thái view
  const theaters = isFilteredView ? 
    allTheaters.filter(theater => theater.suggested) : 
    allTheaters;

  const toggleTheater = (theaterId) => {
    setExpandedTheater(expandedTheater === theaterId ? null : theaterId);
  };

  const renderShowtimes = (theater) => {
    const showtimes = generateShowtimesForTheater(theater.name, selectedDate);
    
    return showtimes.map((time, index) => (
      <TouchableOpacity 
        key={index} 
        style={[
          styles.timeButton,
          isTimePassed(time) && styles.passedTimeButton
        ]}
        disabled={isTimePassed(time)}
      >
        <Text style={[
          styles.timeText,
          isTimePassed(time) && styles.passedTimeText
        ]}>
          {time}
        </Text>
      </TouchableOpacity>
    ));
  };

  const renderTheaters = () => {
    return theaters.map((theater) => (
      <View key={theater.id} style={styles.theaterContainer}>
        <TouchableOpacity 
          style={styles.theaterHeader} 
          onPress={() => toggleTheater(theater.id)}
        >
          <View style={styles.theaterNameContainer}>
            <Text style={styles.theaterName}>{theater.name}</Text>
            {theater.id === 1 && (
              <Ionicons 
                name="heart-outline" 
                size={20} 
                color="red" 
                style={styles.favoriteIcon}
              />
            )}
          </View>
          <Text style={styles.distanceText}>{theater.distance}</Text>
        </TouchableOpacity>
        
        {expandedTheater === theater.id && (
          <View style={styles.theaterDetails}>
            <Text style={styles.formatText}>{theater.format}</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.timesScrollView}
            >
              {renderShowtimes(theater)}
            </ScrollView>
          </View>
        )}
        
        <View style={styles.divider} />
      </View>
    ));
  };

  return (
    <ScrollView style={styles.theatersScrollView}>
      {renderTheaters()}
    </ScrollView>
  );
};

// Màn hình hiển thị tất cả các rạp
const AllTheatersScreen = ({ navigation, route }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeftSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="red" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>TẤT CẢ CÁC RẠP</Text>
        </View>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <TheaterLocations isFilteredView={false} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Main Screen Component
export default function MovieBookingScreen({ navigation }) {
  const [formatModalVisible, setFormatModalVisible] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [viewMode, setViewMode] = useState('suggested'); // 'suggested' hoặc 'all'

  // Tổng số rạp được đề xuất
  const suggestedTheatersCount = 13;
  
  // Tổng số tất cả các rạp
  const allTheatersCount = 19;

  const handleSelectFormat = (format) => {
    setSelectedFormat(format);
  };

  // Hàm xử lý sự kiện khi nhấn nút back
  const handleBackPress = () => {
    // Kiểm tra nếu navigation tồn tại thì sử dụng phương thức goBack
    if (navigation) {
      navigation.goBack();
    }
  };

  // Xử lý khi người dùng nhấp vào "Tất cả các rạp"
  const handleViewAllTheaters = () => {
    navigation.navigate('AllTheaters');
  };

  // Xử lý khi người dùng nhấp vào "Gợi ý cho bạn"
  const handleViewSuggestedTheaters = () => {
    setViewMode('suggested');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeftSection}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="red" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QUỶ NHẬP TRÀNG</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="location-outline" size={22} color="red" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="menu" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        stickyHeaderIndices={[1]}
      >
        <View style={styles.movieInfoContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.movieTitle}>Định dạng phim</Text>
              {selectedFormat && (
                <Text style={styles.selectedFormatText}> • {selectedFormat}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setFormatModalVisible(true)}>
              <Text style={styles.formatFilterText}>TẤT CẢ</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <DateSelector />
        <TheaterLocations isFilteredView={true} />
      </ScrollView>
      
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.bottomBarLeft, viewMode === 'suggested' && styles.activeTab]}
          onPress={handleViewSuggestedTheaters}
        >
          <Text style={styles.bottomBarText}>{suggestedTheatersCount}</Text>
          <Text style={styles.bottomBarSubtext}>Gợi ý cho bạn</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.bottomBarRight}
          onPress={handleViewAllTheaters}
        >
          <Text style={styles.bottomBarText}>{allTheatersCount}</Text>
          <Text style={styles.bottomBarSubtext}>Tất Cả Các Rạp</Text>
        </TouchableOpacity>
      </View>
      
      <MovieFormatModal 
        visible={formatModalVisible} 
        onClose={() => setFormatModalVisible(false)}
        onSelectFormat={handleSelectFormat}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    marginTop: 20,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15,
    backgroundColor: 'white',
    zIndex: 1000
  },
  headerLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16, 
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 10,
  },
  headerIcons: {
    flexDirection: 'row'
  },
  iconButton: {
    marginLeft: 15
  },
  scrollContainer: {
    flex: 1
  },
  movieInfoContainer: {
    padding: 15
  },
  movieTitle: {
    fontSize: 16, 
    fontWeight: 'bold'
  },
  selectedFormatText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    marginLeft: 5
  },
  dateContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  dateHeaderContainer: {
    marginBottom: 10
  },
  currentDateText: {
    fontSize: 14,
    color: '#666'
  },
  formatFilterText: {
    fontSize: 14, 
    color: 'red',
    fontWeight: 'bold'
  },
  monthDateScroll: {
    flexDirection: 'row',
  },
  monthDateScrollContent: {
    paddingRight: 20
  },
  monthContainer: {
    flexDirection: 'row',
    marginRight: 10
  },
  dateBox: {
    width: 50, 
    height: 70, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 10,
    backgroundColor: 'white'
  },
  todayDateBox: {
    backgroundColor: 'red', 
    borderColor: 'red'
  },
  selectedDateBox: {
    backgroundColor: '#1E90FF',
    borderColor: '#1E90FF'
  },
  weekdayText: {
    color: 'gray', 
    marginBottom: 5,
    fontSize: 12
  },
  dateText: {
    fontSize: 18, 
    fontWeight: 'bold',
    color: 'black'
  },
  selectedDateText: {
    color: 'white'
  },
  theatersScrollView: {
    flex: 1,
    marginTop: 10
  },
  theaterContainer: {
    paddingHorizontal: 15
  },
  theaterHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 15
  },
  theaterNameContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  favoriteIcon: {
    marginLeft: 8
  },
  theaterName: {
    fontSize: 16, 
    fontWeight: 'bold',
    color: 'red'
  },
  distanceText: {
    color: 'gray',
    fontSize: 14
  },
  theaterDetails: {
    marginBottom: 15
  },
  formatText: {
    color: 'gray',
    marginBottom: 10,
    fontSize: 14
  },
  timesScrollView: {
    marginBottom: 5
  },
  timeButton: {
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 5, 
    marginRight: 10,
    minWidth: 70,
    alignItems: 'center'
  },
  passedTimeButton: {
    borderColor: '#CCCCCC',
    backgroundColor: '#F5F5F5'
  },
  timeText: {
    fontSize: 14,
    color: 'black'
  },
  passedTimeText: {
    color: '#999999'
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  bottomBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5
  },
  bottomBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5
  },
  activeTab: {
    backgroundColor: '#FFE0E0'
  },
  bottomBarText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5
  },
  bottomBarSubtext: {
    fontSize: 12,
    color: 'gray'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  formatModalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: width * 0.8,
    maxHeight: height * 0.5
  },
  formatOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  formatOptionText: {
    textAlign: 'center',
    fontSize: 16
  }
  });