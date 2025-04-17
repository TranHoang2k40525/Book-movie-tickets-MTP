import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Icon from "react-native-vector-icons/FontAwesome";
export default function App({ navigation }) {
  const [quantities, setQuantities] = useState({
    premium: 0,
    jujutsuSingle: 0,
    jujutsuSet: 0,
    myCombo: 0,
    kakaoFriends: 0,
    kakaoFriendsSet: 0,
    cgvCombo: 0,
    familyCombo: 0,
    demonSlayerCombo: 0,
    studentCombo: 0,
    popcornLover: 0,
    birthdaySpecial: 0,
  });
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  // Add prices for each combo
  const prices = {
    premium: 135000,
    jujutsuSingle: 299000,
    jujutsuSet: 1099000,
    myCombo: 95000,
    kakaoFriends: 229000,
    kakaoFriendsSet: 499000,
    cgvCombo: 125000,
    familyCombo: 249000,
    demonSlayerCombo: 279000,
    studentCombo: 79000,
    popcornLover: 105000,
    birthdaySpecial: 189000,
  };

  // Base ticket price
  const baseTicketPrice = 159454;
  const [totalPrice, setTotalPrice] = useState(baseTicketPrice);

  // Update total price when quantities change
  useEffect(() => {
    let comboTotal = 0;
    
    // Calculate total price for all combos
    Object.keys(quantities).forEach(combo => {
      comboTotal += quantities[combo] * prices[combo];
    });
    
    // Set total price (base ticket price + combo total)
    setTotalPrice(baseTicketPrice + comboTotal);
  }, [quantities]);

  const updateQuantity = (combo, change) => {
    setQuantities(prev => {
      const newValue = Math.max(0, prev[combo] + change);
      return { ...prev, [combo]: newValue };
    });
  };

  // Format price with comma separators
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => navigation.goBack()}
                    >
                      <Text style={{ color: "#fff" }}>
                        <Icon name="arrow-left" size={24} color="#fff" /> Quay lại
                      </Text>
                    </TouchableOpacity>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>MTB Kim Cúc Plaza</Text>
            <Text style={styles.headerSubtitle}>Cinema 2, 03/04/25, 22:10~0:16</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <FontAwesome name="bars" size={24} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Image 
          source={require('./assets/douong/Anh2.jpeg')} 
          style={styles.popcornIcon} 
          resizeMode="contain"
        />
        <Text style={styles.bannerText}>
          Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết.
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Premium CGV Combo */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('./assets/douong/Anh3.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>PREMIUM MTB COMBO - 135.000 đ</Text>
            <Text style={styles.comboDescription}>1 Bắp Ngọt Lớn + 2 Nước Siêu Lớn + 1 Snack</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <Text style={styles.comboNote}>- Nhận hàng trong ngày xem phim (khi mua cùng vé)</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('premium', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.premium}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('premium', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* CGV COMBO */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('./assets/douong/Anh3.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>MTB COMBO - 125.000 đ</Text>
            <Text style={styles.comboDescription}>1 Bắp Ngọt Lớn + 2 Nước Siêu Lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <Text style={styles.comboNote}>- Nhận hàng trong ngày xem phim (khi mua cùng vé)</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('cgvCombo', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.cgvCombo}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('cgvCombo', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Family Combo - New */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('./assets/douong/Anh3.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>FAMILY COMBO - 249.000 đ</Text>
            <Text style={styles.comboDescription}>2 Bắp Ngọt Lớn + 4 Nước Siêu Lớn + 2 Snack</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <Text style={styles.comboNote}>- Nhận hàng trong ngày xem phim (khi mua cùng vé)</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('familyCombo', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.familyCombo}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('familyCombo', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Jujutsu Kaisen Single Combo */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('./assets/douong/Anh11.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>JUJUTSU KAISEN SINGLE COMBO - 299.000 đ</Text>
            <Text style={styles.comboDescription}>01 ly nhân vật Jujutsu Kaisen + 01 nước ngọt lớn + 01 bắp ngọt lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('jujutsuSingle', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.jujutsuSingle}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('jujutsuSingle', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Demon Slayer Combo - New */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('./assets/douong/Anh1.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>DEMON SLAYER COMBO - 279.000 đ</Text>
            <Text style={styles.comboDescription}>01 ly nhân vật Demon Slayer + 01 nước ngọt lớn + 01 bắp ngọt lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('demonSlayerCombo', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.demonSlayerCombo}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('demonSlayerCombo', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Jujutsu Kaisen Set Combo */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('./assets/douong/Anh5.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>JUJUTSU KAISEN SET COMBO - 1.099.000 đ</Text>
            <Text style={styles.comboDescription}>Bộ 04 ly nhân vật Jujutsu Kaisen + 02 nước ngọt siêu lớn + 01 bắp ngọt lớn</Text>
            <Text style={styles.comboNote}>- Combo sẽ mặc định 04 mẫu ly nhân vật khác nhau, không được chọn trùng mẫu ly nhân vật</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('jujutsuSet', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.jujutsuSet}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('jujutsuSet', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Student Combo - New */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('./assets/douong/Anh7.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>STUDENT COMBO - 79.000 đ</Text>
            <Text style={styles.comboDescription}>1 Bắp Ngọt Vừa + 1 Nước Lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng cho học sinh, sinh viên có thẻ hợp lệ</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('studentCombo', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.studentCombo}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('studentCombo', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* My Combo */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('./assets/douong/Anh6.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>MY COMBO - 95.000 đ</Text>
            <Text style={styles.comboDescription}>1 Bắp Ngọt Lớn + 1 Nước Siêu Lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <Text style={styles.comboNote}>- Nhận hàng trong ngày xem phim (khi mua cùng vé)</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('myCombo', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.myCombo}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('myCombo', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Popcorn Lover - New */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('./assets/douong/Anh6.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>POPCORN LOVER - 105.000 đ</Text>
            <Text style={styles.comboDescription}>2 Bắp Ngọt Lớn + 1 Nước Siêu Lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <Text style={styles.comboNote}>- Nhận hàng trong ngày xem phim (khi mua cùng vé)</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('popcornLover', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.popcornLover}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('popcornLover', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Kakao Friends Single Combo */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('./assets/douong/Anh7.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>KAKAO FRIENDS 2024 SINGLE COMBO - 229.000 đ</Text>
            <Text style={styles.comboDescription}>01 ly thiết kế nhân vật Kakao kèm nước - Thêm 01 bắp ngọt lớn với 29.000VND</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('kakaoFriends', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.kakaoFriends}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('kakaoFriends', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Kakao Friends Set Combo */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('./assets/douong/Anh6.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>KAKAO FRIEND 2024 SET - 499.000 đ</Text>
            <Text style={styles.comboDescription}>03 ly nhân vật Kakao Friend + 02 nước ngọt siêu lớn</Text>
            <Text style={styles.comboNote}>- Thêm 29.000đ nhận ngay 01 bắp ngọt lớn</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('kakaoFriendsSet', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.kakaoFriendsSet}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('kakaoFriendsSet', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Birthday Special - New */}
        <View style={styles.comboItem}>
          <View style={styles.comboImageContainer}>
            <Image 
              source={require('./assets/douong/Anh7.jpeg')} 
              style={styles.comboImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.comboDetails}>
            <Text style={styles.comboTitle}>BIRTHDAY SPECIAL - 189.000 đ</Text>
            <Text style={styles.comboDescription}>1 Bắp Ngọt Lớn + 2 Nước Siêu Lớn + 1 Bánh Kem Mini</Text>
            <Text style={styles.comboNote}>- Đặt trước ít nhất 24 giờ</Text>
            <Text style={styles.comboNote}>- Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch có suất chiếu vào ngày Lễ, Tết</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('birthdaySpecial', -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantities.birthdaySpecial}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity('birthdaySpecial', 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle}>
            THIẾU NỮ ÁNH TRĂNG <View style={styles.ratingTag}><Text style={styles.ratingText}>T13</Text></View>
          </Text>
          <Text style={styles.movieDetails}>2D Phụ Đề Việt</Text>
          <Text style={styles.ticketPrice}>{formatPrice(totalPrice)} đ  2 ghế</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>THANH TOÁN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  headerTitle: {
    color: '#a81e1e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  menuButton: {
    padding: 5,
  },
  banner: {
    backgroundColor: '#f35151',
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  popcornIcon: {
    width: 56,
    height: 56,
    marginRight: 10,
  },
  bannerText: {
    color: 'white',
    flex: 1,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  comboItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  comboImageContainer: {
    width: 100,
    height: 100,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 15,
  },
  comboImage: {
    marginLeft: -10,
    width: 120,
    height: 140,
  },
  comboDetails: {
    flex: 1,
  },
  comboTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  comboDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  comboNote: {
    color: '#999',
    fontSize: 12,
    marginBottom: 3,
  },
  quantitySelector: {
    flexDirection: 'row',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 18,
  },
  quantityDisplay: {
    width: 40,
    height: 30,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  quantityText: {
    color: 'white',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingTag: {
    backgroundColor: '#ffd700',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 5,
  },
  ratingText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  movieDetails: {
    color: '#ccc',
    fontSize: 14,
  },
  ticketPrice: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#a81e1e',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
