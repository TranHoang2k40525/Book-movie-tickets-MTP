import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';

export default function App() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayInfo, setSelectedDayInfo] = useState("");
  const [selectedArea, setSelectedArea] = useState("Hà Nội");
  const [selectedTheater, setSelectedTheater] = useState("");
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showTheaterModal, setShowTheaterModal] = useState(false);
  const [showCartPage, setShowCartPage] = useState(false);
  const [weekDays, setWeekDays] = useState([]);
  
  // Các tiếng Việt cho thứ trong tuần
  const vietnameseDayNames = {
    0: "Chủ nhật",
    1: "Thứ hai",
    2: "Thứ ba",
    3: "Thứ tư",
    4: "Thứ năm",
    5: "Thứ sáu",
    6: "Thứ bảy"
  };
  
  // Các tiếng Việt cho thứ ngắn gọn
  const vietnameseShortDayNames = {
    0: "CN",
    1: "T.2",
    2: "T.3",
    3: "T.4",
    4: "T.5",
    5: "T.6",
    6: "T.7"
  };

  const areas = [
    "Hà Nội", "Hồ Chí Minh", "Quảng Ninh", "Cần Thơ", "Đà Nẵng", 
    "Hải Phòng", "Bà Rịa-Vũng Tàu", "Bình Dương", "Đồng Nai", 
    "Tiền Giang", "Đắk Lắk", "Bình Định", "Yên Bái", "Khánh Hòa", 
    "Thái Nguyên", "Sơn La", "Tây Ninh", "Lạng Sơn", "Phú Thọ", 
    "Quảng Ngãi", "Nghệ An", "Đồng Tháp", "Hưng Yên", "Kon Tum", 
    "Sóc Trăng", "Bạc Liêu"
  ];

  const theaters = {
    "Hà Nội": [
      "MTB Aeon Hà Đông",
      "MTB Aeon Long Biên",
      "MTB Hà Nội Centerpoint",
      "MTB Hồ Gươm Plaza",
      "MTB Indochina Plaza Hà Nội",
      "MTB Mac Plaza (Machinco)",
      "MTB Rice City",
      "MTB Sun Grand Lương Yên",
      "MTB Sun Grand Thụy Khuê",
      "MTB Tràng Tiền Plaza",
      "MTB Trương Định Plaza",
      "MTB Vincom Bắc Từ Liêm",
      "MTB Vincom Center Bà Triệu",
      "MTB Vincom Long Biên",
      "MTB Vincom Metropolis Liễu Giai",
      "MTB Vincom Nguyễn Chí Thanh",
      "MTB Vincom Ocean Park",
      "MTB Vincom Royal City",
      "MTB Vincom Sky Lake Phạm Hùng",
      "MTB Vincom Times City",
      "MTB Vincom Trần Duy Hưng",
      "MTB Xuân Diệu"
    ],
    "Hồ Chí Minh": [
      "MTB Crescent Mall", 
      "MTB Liberty Citypoint", 
      "MTB Pandora City", 
      "MTB Sư Vạn Hạnh", 
      "MTB Vincom Center Đồng Khởi", 
      "MTB Vincom Thảo Điền", 
      "MTB Landmark 81", 
      "MTB Aeon Mall Bình Tân", 
      "MTB Estella Place"
    ],
    "Đà Nẵng": [
      "MTB Vincom Đà Nẵng", 
      "MTB Vĩnh Trung Plaza", 
      "MTB Lotte Mart Đà Nẵng", 
      "MTB Helio Center"
    ],
    "Quảng Ninh": [
      "MTB Vincom Hạ Long", 
      "MTB Vincom Plaza Cẩm Phả", 
      "MTB Vincom Uông Bí", 
      "MTB Sun Plaza Hạ Long"
    ],
    "Cần Thơ": [
      "MTB Vincom Hùng Vương", 
      "MTB Sense City Cần Thơ", 
      "MTB Lotte Mart Cần Thơ", 
      "MTB PVComm Xuân Khánh"
    ],
    "Hải Phòng": [
      "MTB Vincom Imperia Hải Phòng", 
      "MTB Aeon Mall Hải Phòng", 
      "MTB Parkson TD Plaza Hải Phòng", 
      "MTB Lotte Mart Hải Phòng"
    ],
    "Bà Rịa-Vũng Tàu": [
      "MTB Lotte Mart Vũng Tàu", 
      "MTB Imperial Plaza", 
      "MTB Vincom Vũng Tàu", 
      "MTB Go! Bà Rịa"
    ],
    "Bình Dương": [
      "MTB Aeon Mall Bình Dương", 
      "MTB Becamex Tower", 
      "MTB Vincom Thủ Dầu Một", 
      "MTB Thủ Dầu Một Plaza"
    ],
    "Đồng Nai": [
      "MTB Vincom Biên Hòa", 
      "MTB Big C Đồng Nai", 
      "MTB Amata Plaza", 
      "MTB Co.op Mart Biên Hòa"
    ],
    "Tiền Giang": [
      "MTB Vincom Mỹ Tho", 
      "MTB Go! Tiền Giang", 
      "MTB Cityland Mỹ Tho", 
      "MTB Central Plaza Mỹ Tho"
    ],
    "Đắk Lắk": [
      "MTB Vincom Buôn Ma Thuột", 
      "MTB Emart Buôn Ma Thuột", 
      "MTB Central Plaza BMT", 
      "MTB Lotte Mart BMT"
    ],
    "Bình Định": [
      "MTB Vincom Quy Nhơn", 
      "MTB Big C Quy Nhơn", 
      "MTB An Phú Quy Nhơn", 
      "MTB Marina Plaza"
    ],
    "Yên Bái": [
      "MTB Vincom Yên Bái", 
      "MTB Hoàng Gia Plaza", 
      "MTB Ngọc Khánh Yên Bái", 
      "MTB Central Mall Yên Bái"
    ],
    "Khánh Hòa": [
      "MTB Vincom Nha Trang", 
      "MTB Lotte Mart Nha Trang", 
      "MTB Big C Nha Trang", 
      "MTB Nha Trang Center"
    ],
    "Thái Nguyên": [
      "MTB Vincom Thái Nguyên", 
      "MTB TTTM Thái Nguyên", 
      "MTB Big C Thái Nguyên", 
      "MTB Central Plaza Thái Nguyên"
    ],
    "Sơn La": [
      "MTB Vincom Sơn La", 
      "MTB Hoàng Anh Plaza", 
      "MTB Central Mall Sơn La", 
      "MTB Mường Thanh Plaza"
    ],
    "Tây Ninh": [
      "MTB Vincom Tây Ninh", 
      "MTB Go! Tây Ninh", 
      "MTB Tây Ninh Plaza", 
      "MTB Central Mall Tây Ninh"
    ],
    "Lạng Sơn": [
      "MTB Vincom Lạng Sơn", 
      "MTB Central Plaza Lạng Sơn", 
      "MTB Hoàng Gia Mall", 
      "MTB Xứ Lạng Center"
    ],
    "Phú Thọ": [
      "MTB Vincom Việt Trì", 
      "MTB Việt Trì Plaza", 
      "MTB Central Mall Phú Thọ", 
      "MTB Hùng Vương Plaza"
    ],
    "Quảng Ngãi": [
      "MTB Vincom Quảng Ngãi", 
      "MTB Central Mall Quảng Ngãi", 
      "MTB Lotte Mart Quảng Ngãi", 
      "MTB Marina Plaza Quảng Ngãi"
    ],
    "Nghệ An": [
      "MTB Vincom Vinh", 
      "MTB Mường Thanh Vinh", 
      "MTB Vinh Center", 
      "MTB Lotte Mart Vinh"
    ],
    "Đồng Tháp": [
      "MTB Vincom Cao Lãnh", 
      "MTB Central Plaza Đồng Tháp", 
      "MTB Mekong Center", 
      "MTB Sense City Cao Lãnh"
    ],
    "Hưng Yên": [
      "MTB Vincom Hưng Yên", 
      "MTB Ecopark Grand", 
      "MTB Phố Hiến Plaza", 
      "MTB Central Mall Hưng Yên"
    ],
    "Kon Tum": [
      "MTB Vincom Kon Tum", 
      "MTB Kon Tum Plaza", 
      "MTB Highland Center", 
      "MTB Central Mall Kon Tum"
    ],
    "Sóc Trăng": [
      "MTB Vincom Sóc Trăng", 
      "MTB Central Mall Sóc Trăng", 
      "MTB Mekong Plaza", 
      "MTB Sense City Sóc Trăng"
    ],
    "Bạc Liêu": [
      "MTB Vincom Bạc Liêu", 
      "MTB Mekong Center Bạc Liêu", 
      "MTB Central Plaza Bạc Liêu", 
      "MTB Bạc Liêu Plaza"
    ]
  };
  
  // Tạo định dạng ngày tiếng Việt
  const formatDateToVietnamese = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const weekDay = date.getDay();
    
    return `${vietnameseDayNames[weekDay]} ${day < 10 ? '0' + day : day} tháng ${month}, ${year}`;
  };
  
  // Tạo mảng ngày trong tuần
  const generateWeekDays = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayObj = {
        number: date.getDate(),
        day: i === 0 ? 'Hôm nay' : vietnameseShortDayNames[date.getDay()],
        fullInfo: formatDateToVietnamese(date),
        date: date
      };
      
      days.push(dayObj);
    }
    
    return days;
  };

  const handleDaySelect = (number, fullInfo) => {
    setSelectedDay(number);
    setSelectedDayInfo(fullInfo);
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setSelectedTheater("");
    setShowAreaModal(false);
  };

  const handleTheaterSelect = (theater) => {
    setSelectedTheater(theater);
    setShowTheaterModal(false);
  };

  const handleBackPress = () => {
    if (showCartPage) {
      setShowCartPage(false);
    } else {
      console.log("Back button pressed");
    }
  };

  const handleCartPress = () => {
    setShowCartPage(true);
  };

  const handleContinueShopping = () => {
    setShowCartPage(false);
  };

  useEffect(() => {
    // Tạo lịch khi component được mount
    const days = generateWeekDays();
    setWeekDays(days);
    
    // Thiết lập ngày hôm nay là ngày được chọn mặc định
    if (days.length > 0) {
      const today = days[0];
      setSelectedDay(today.number);
      setSelectedDayInfo(today.fullInfo);
    }
  }, []);

  // Render cart page
  if (showCartPage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271220.png' }}
              style={styles.backArrow}
            />
          </TouchableOpacity>
          <Text style={styles.cartPageTitle}>Giỏ hàng của tôi</Text>
          <View style={styles.cartIconContainer}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/263/263142.png' }}
              style={[styles.cartIcon, styles.cartPageIcon]}
            />
          </View>
        </View>
        
        <View style={styles.cartContentContainer}>
          <View style={styles.emptyCartContainer}>
            <Image 
              source={require('./assets/Anh4.jpeg')} 
              style={styles.logo} 
              resizeMode="contain"
            />
            <Text style={styles.emptyCartText}>Giỏ hàng trống</Text>
            <TouchableOpacity 
              style={styles.continueShoppingButton}
              onPress={handleContinueShopping}
            >
              <View style={styles.continueButtonIconContainer}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/263/263142.png' }}
                  style={styles.smallCartIcon}
                />
              </View>
              <Text style={styles.continueShoppingText}>TIẾP TỤC MUA SẮM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Check if both area and theater are selected
  const isSelectionComplete = selectedArea !== "" && selectedTheater !== "";

  // Render main theater selection page
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271220.png' }}
            style={styles.backArrow}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MTB Store</Text>
        <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/263/263142.png' }}
            style={styles.cartIcon}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.locationContainer}>
        <View style={styles.locationIconContainer}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/484/484167.png' }}
            style={styles.locationIcon}
          />
        </View>
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationText}>
            Rạp Nhận: {selectedTheater ? `${selectedArea} - ${selectedTheater}` : ""}
          </Text>
        </View>
      </View>

      <View style={styles.dateReceiveContainer}>
        <View style={styles.dateIconContainer}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2784/2784459.png' }}
            style={styles.dateIcon}
          />
        </View>
        <View style={styles.dateTextContainer}>
          <Text style={styles.dateText}>
            Ngày Nhận: {selectedDayInfo}
          </Text>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Chọn rạp</Text>
        
        <TouchableOpacity 
          style={styles.selectionContainer}
          onPress={() => setShowAreaModal(true)}
        >
          <View style={styles.selectionContent}>
            <Text style={styles.selectionLabel}>Khu vực</Text>
            <Text style={styles.selectionValue}>{selectedArea}</Text>
          </View>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity 
          style={styles.selectionContainer}
          onPress={() => theaters[selectedArea] && setShowTheaterModal(true)}
        >
          <View style={styles.selectionContent}>
            <Text style={styles.selectionLabel}>Chọn rạp</Text>
            {selectedTheater ? (
              <Text style={styles.selectionValue}>{selectedTheater}</Text>
            ) : null}
          </View>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <View style={styles.dateSelectionHeader}>
          <Text style={styles.sectionTitle}>Chọn ngày</Text>
          <View style={styles.viewToggleContainer}>
            <View style={styles.viewToggleButton}>
              <Text style={styles.viewToggleText}></Text>
            </View>
            <View style={styles.viewToggleButton}>
              <Text style={styles.viewToggleText}></Text>
            </View>
          </View>
        </View>
        
        <View style={styles.dateContainer}>
          {weekDays.map((item) => (
            <TouchableOpacity 
              key={item.number} 
              style={styles.dateColumn}
              onPress={() => handleDaySelect(item.number, item.fullInfo)}
            >
              <Text 
                style={[
                  styles.dateDay, 
                  item.day === 'Hôm nay' && styles.todayText
                ]}
              >
                {item.day}
              </Text>
              {selectedDay === item.number ? (
                <View style={styles.selectedDateCircle}>
                  <Text style={styles.selectedDateNumber}>{item.number}</Text>
                </View>
              ) : (
                <Text style={styles.dateNumber}>{item.number}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.currentDate}>{selectedDayInfo}</Text>
        
        <TouchableOpacity 
          style={[
            styles.confirmButton,
            !isSelectionComplete && styles.confirmButtonDisabled
          ]}
          disabled={!isSelectionComplete}
        >
          <Text style={styles.confirmButtonText}>CHỌN</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <View style={styles.bottomBackground} />

      <Modal
        visible={showAreaModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAreaModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAreaModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chọn tỉnh thành</Text>
                <ScrollView style={styles.modalList}>
                  {areas.map((area, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.modalItem}
                      onPress={() => handleAreaSelect(area)}
                    >
                      <Text style={styles.modalItemText}>{area}</Text>
                      <View style={[
                        styles.radioButton, 
                        selectedArea === area && styles.radioButtonSelected
                      ]}>
                        {selectedArea === area && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showTheaterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTheaterModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowTheaterModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chọn rạp</Text>
                <ScrollView style={styles.modalList}>
                  {theaters[selectedArea] && theaters[selectedArea].map((theater, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.modalItem}
                      onPress={() => handleTheaterSelect(theater)}
                    >
                      <Text style={styles.modalItemText}>{theater}</Text>
                      <View style={[
                        styles.radioButton, 
                        selectedTheater === theater && styles.radioButtonSelected
                      ]}>
                        {selectedTheater === theater && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    width: 24,
    height: 24,
    tintColor: '#C41E3A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: -150,
    flex: 0,
  },
  cartButton: {
    padding: 5,
  },
  cartIcon: {
    width: 24,
    height: 24,
    tintColor: '#C41E3A',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  locationIconContainer: {
    marginRight: 10,
  },
  locationIcon: {
    width: 24,
    height: 24,
    tintColor: '#800080',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    color: '#000',
  },
  dateReceiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateIconContainer: {
    marginRight: 10,
  },
  dateIcon: {
    width: 24,
    height: 24,
    tintColor: '#800080',
  },
  dateTextContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  dateSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  viewToggleContainer: {
    flexDirection: 'row',
  },
  viewToggleButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  viewToggleText: {
    color: '#C41E3A',
    fontSize: 14,
    fontWeight: '500',
  },
  selectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  selectionContent: {
    flex: 1,
  },
  selectionLabel: {
    fontSize: 14,
    color: '#888',
  },
  selectionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  dateColumn: {
    alignItems: 'center',
  },
  dateDay: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  todayText: {
    color: '#C41E3A',
    fontWeight: 'bold',
  },
  dateNumber: {
    fontSize: 18,
    color: '#333',
    marginTop: 5,
    width: 30,
    textAlign: 'center',
  },
  selectedDateCircle: {
    backgroundColor: '#C41E3A',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDateNumber: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  currentDate: {
    textAlign: "center",
    fontSize: 16,
    color: '#333',
    marginVertical: 20,
  },
  confirmButton: {
    backgroundColor: '#C41E3A',
    borderRadius: 2,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomBackground: {
    height: 800,
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
    position: 'absolute',
    bottom: -780,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  modalItemText: {
    fontSize: 18,
    color: '#333',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#C41E3A',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C41E3A',
  },
  // Cart page specific styles
  cartPageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  cartPageIcon: {
    tintColor: '#C41E3A',
  },
  cartIconContainer: {
    padding: 5,
    opacity: 0, // Hidden but keeps layout
  },
  cartContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  continueShoppingButton: {
    backgroundColor: '#C41E3A',
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
  },
  continueButtonIconContainer: {
    marginRight: 10,
  },
  smallCartIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#666',
  }
});