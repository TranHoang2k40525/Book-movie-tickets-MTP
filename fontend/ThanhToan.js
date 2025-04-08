import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView, FlatList, Modal, TextInput, TouchableWithoutFeedback, Linking } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function App() {
  const [selectedPayment, setSelectedPayment] = useState('ATM');
  const [termsChecked, setTermsChecked] = useState(true);
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [pointsModalVisible, setPointsModalVisible] = useState(false);
  const [priorityCardModalVisible, setPriorityCardModalVisible] = useState(false);
  const [promoCodeModalVisible, setPromoCodeModalVisible] = useState(false);
  const [giftCardModalVisible, setGiftCardModalVisible] = useState(false);
  const [giftCardAmount, setGiftCardAmount] = useState('');
  const [eGiftModalVisible, setEGiftModalVisible] = useState(false);

  // Sample data for combos
  const combos = [
    { id: '1', title: 'PREMIUM MY COMBO', price: '115.000 đ', image: require('./assets/Anh1.jpeg') },
    { id: '2', title: 'JU COMBO', price: '299.000 đ', image: require('./assets/Anh2.jpeg') },
    { id: '3', title: 'POPCORN L', price: '79.000 đ', image: require('./assets/Anh3.jpeg') },
    { id: '4', title: 'COMBO ĐÔI', price: '199.000 đ', image: require('./assets/Anh4.jpeg') },
    { id: '5', title: 'COMBO GIA ĐÌNH', price: '259.000 đ', image: require('./assets/Anh5.jpeg') },
    { id: '6', title: 'NƯỚC L', price: '39.000 đ', image: require('./assets/Anh6.jpeg') },
    { id: '7', title: 'SNACK COMBO', price: '99.000 đ', image: require('./assets/Anh7.jpeg') },
    { id: '8', title: 'KIDS COMBO', price: '149.000 đ', image: require('./assets/Anh8.jpeg') },
    { id: '9', title: 'POPCORN CARAMEL', price: '89.000 đ', image: require('./assets/Anh9.jpeg') },
    { id: '10', title: 'NACHOS COMBO', price: '129.000 đ', image: require('./assets/Anh3.jpeg') },
    { id: '11', title: 'HOT DOG COMBO', price: '109.000 đ', image: require('./assets/Anh4.jpeg') },
    { id: '12', title: 'SPECIAL COMBO', price: '179.000 đ', image: require('./assets/Anh5.jpeg') },
  ];

  // Function to handle opening the partner link
  const openPartnerLink = async () => {
    const partnerUrl = 'https://example.com/partners'; // Replace with your actual partner URL
    try {
      const supported = await Linking.canOpenURL(partnerUrl);
      if (supported) {
        await Linking.openURL(partnerUrl);
      } else {
        console.log(`Cannot open URL: ${partnerUrl}`);
      }
    } catch (error) {
      console.log(`Error opening URL: ${error}`);
    }
  };

  const renderComboItem = ({ item }) => (
    <View style={styles.comboItem}>
      <Image
        source={item.image}
        style={styles.comboImage}
        resizeMode="cover"
      />
      <View style={styles.comboDetails}>
        <Text style={styles.comboTitle}>{item.title}</Text>
        <Text style={styles.comboPrice}>{item.price}</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#8e0000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="#8e0000" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Movie Information */}
        <View style={styles.movieInfoSection}>
          <View style={styles.movieCard}>
            <Image
              source={require('./assets/Anh4.jpeg')}
              style={styles.moviePoster}
              resizeMode="cover"
            />
            <View style={styles.movieDetails}>
              <View style={styles.movieTitleContainer}>
                <Text style={styles.movieTitle}>THIẾU NỮ ÁNH TRĂNG</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>T13</Text>
                </View>
              </View>
              <Text style={styles.movieDescription}>T13 - Phim được phổ biến đến người xem từ ...</Text>
              <Text style={styles.movieDate}>Thứ năm 03 tháng 4, 2025</Text>
              <Text style={styles.movieTime}>22:10~0:16</Text>
              <Text style={styles.movieLocation}>MTB Kim Cúc Plaza</Text>
              <Text style={styles.movieTheater}>Cinema 2</Text>
              <Text style={styles.movieSeats}>Ghế: L5, L6</Text>
              <Text style={styles.totalPrice}>Tổng thanh toán: 159.454 đ</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Số lượng & Tổng */}
        <View style={styles.quantitySection}>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Số lượng</Text>
            <Text style={styles.rowValue}>2</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Tổng</Text>
            <Text style={styles.rowValue}>159.454 đ</Text>
          </View>
        </View>

        {/* Combos Section with Horizontal Scroll */}
        <View style={styles.comboSection}>
          <Text style={styles.sectionTitle}>Thêm combo/bắp nước:</Text>
          <FlatList
            data={combos}
            renderItem={renderComboItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.comboListContainer}
          />
        </View>

        {/* Discount Methods */}
        <View style={styles.discountSection}>
          <Text style={styles.sectionTitle}>PHƯƠNG THỨC GIẢM GIÁ</Text>
          <TouchableOpacity style={styles.discountItem} onPress={() => setVoucherModalVisible(true)}>
            <Text style={styles.discountLabel}>MTB Voucher</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#777" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.discountItem} onPress={() => setCouponModalVisible(true)}>
            <Text style={styles.discountLabel}>MTB Coupon</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#777" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.discountItem} onPress={() => setPointsModalVisible(true)}>
            <Text style={styles.discountLabel}>Điểm MTB</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#777" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.discountItem} onPress={() => setPriorityCardModalVisible(true)}>
            <Text style={styles.discountLabel}>Thẻ ưu tiên</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#777" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.discountItem} onPress={openPartnerLink}>
            <Text style={styles.discountLabel}>Đối tác</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#777" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.discountItem} onPress={() => setPromoCodeModalVisible(true)}>
            <Text style={styles.discountLabel}>Mã Khuyến Mãi</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#777" />
          </TouchableOpacity>
        </View>

        {/* Gift Cards Section */}
        <View style={styles.giftCardSection}>
          <Text style={styles.sectionTitle}>THẺ QUÀ TẶNG/ EGIFT</Text>
          <TouchableOpacity style={styles.discountItem} onPress={() => setGiftCardModalVisible(true)}>
            <Text style={styles.discountLabel}>Thẻ Quà Tặng</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#777" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.discountItem} onPress={() => setEGiftModalVisible(true)}>
            <View style={styles.discountLabelWithBadge}>
              <Text style={styles.discountLabel}>MTB eGift</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            </View>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#777" />
          </TouchableOpacity>
        </View>

        {/* Total Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>TỔNG KẾT</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tổng cộng bao gồm VAT</Text>
            <Text style={styles.summaryValue}>159.454 đ</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Giảm giá</Text>
            <Text style={styles.summaryValue}>0 đ</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Thẻ quà tặng/ eGift</Text>
            <Text style={styles.summaryValue}>0 đ</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Còn lại</Text>
            <Text style={styles.summaryValue}>159.454 đ</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>THANH TOÁN</Text>
          
          <TouchableOpacity 
            style={styles.paymentMethod}
            onPress={() => setSelectedPayment('ATM')}
          >
            <View style={styles.paymentMethodLeft}>
              <Image 
                source={require('./assets/Anh4.jpeg')} 
                style={styles.paymentIcon}
                resizeMode="cover"
              />
              <Text style={styles.paymentMethodText}>ATM card (Thẻ nội địa)</Text>
            </View>
            {selectedPayment === 'ATM' && <Ionicons name="checkmark" size={24} color="red" />}
          </TouchableOpacity>
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.paymentMethod}
            onPress={() => setSelectedPayment('VISA')}
          >
            <View style={styles.paymentMethodLeft}>
              <Image 
                source={require('./assets/Anh5.jpeg')} 
                style={styles.paymentIcon}
                resizeMode="cover"
              />
              <Text style={styles.paymentMethodText}>Thẻ quốc tế (Visa, Master, Amex, JCB)</Text>
            </View>
            {selectedPayment === 'VISA' && <Ionicons name="checkmark" size={24} color="red" />}
          </TouchableOpacity>
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.paymentMethod}
            onPress={() => setSelectedPayment('MOMO')}
          >
            <View style={styles.paymentMethodLeft}>
              <Image 
                source={require('./assets/Anh6.jpeg')} 
                style={styles.paymentIcon}
                resizeMode="cover"
              />
              <Text style={styles.paymentMethodText}>Mã MMMTB - 5K</Text>
            </View>
            {selectedPayment === 'MOMO' && <Ionicons name="checkmark" size={24} color="red" />}
          </TouchableOpacity>
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.paymentMethod}
            onPress={() => setSelectedPayment('ZALO')}
          >
            <View style={styles.paymentMethodLeft}>
              <Image 
                source={require('./assets/Anh7.jpeg')} 
                style={styles.paymentIcon}
                resizeMode="cover"
              />
              <Text style={styles.paymentMethodText}>Nhập MTB giảm 10K cho lần đầu dùng</Text>
            </View>
            {selectedPayment === 'ZALO' && <Ionicons name="checkmark" size={24} color="red" />}
          </TouchableOpacity>
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.paymentMethod}
            onPress={() => setSelectedPayment('VNPAY')}
          >
            <View style={styles.paymentMethodLeft}>
              <Image 
                source={require('./assets/Anh8.jpeg')} 
                style={styles.paymentIcon}
                resizeMode="cover"
              />
              <Text style={styles.paymentMethodText}>Nhập VNPAYMTB giảm đến 10K/bill</Text>
            </View>
            {selectedPayment === 'VNPAY' && <Ionicons name="checkmark" size={24} color="red" />}
          </TouchableOpacity>
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.paymentMethod}
            onPress={() => setSelectedPayment('SHOPEE')}
          >
            <View style={styles.paymentMethodLeft}>
              <Image 
                source={require('./assets/Anh9.jpeg')} 
                style={styles.paymentIcon}
                resizeMode="cover"
              />
              <Text style={styles.paymentMethodText}>ShopeePay - Giảm 10K cho đơn từ 100K</Text>
            </View>
            {selectedPayment === 'SHOPEE' && <Ionicons name="checkmark" size={24} color="red" />}
          </TouchableOpacity>
        </View>

        {/* Terms and Confirmation */}
        <View style={styles.termsSection}>
          <View style={styles.termsRow}>
            <TouchableOpacity 
              style={styles.checkbox} 
              onPress={() => setTermsChecked(!termsChecked)}
            >
              {termsChecked && <Ionicons name="checkmark" size={18} color="red" />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              Tôi đồng ý với <Text style={styles.termsLink}>Điều Khoản Sử Dụng</Text> và đang mua vé cho người có độ tuổi phù hợp với từng loại vé.{' '}
              <Text style={styles.termsLink}>Chi tiết xem tại đây!</Text>
            </Text>
          </View>
          
          <TouchableOpacity style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>TÔI ĐỒNG Ý VÀ TIẾP TỤC</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Voucher Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={voucherModalVisible}
        onRequestClose={() => setVoucherModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.voucherModalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setVoucherModalVisible(false)}>
                <Ionicons name="arrow-back" size={24} color="#8e0000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>MTB Voucher</Text>
              <TouchableOpacity onPress={() => setVoucherModalVisible(false)}>
                <Text style={styles.confirmText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.voucherSectionTitle}>Thông Tin Voucher</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mã Voucher</Text>
                <TextInput 
                  style={styles.textInput}
                  placeholder=""
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mã PIN</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput 
                    style={styles.textInput}
                    secureTextEntry={true}
                    placeholder=""
                  />
                  <TouchableOpacity>
                    <Ionicons name="eye" size={24} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity style={styles.registerButton}>
                <Text style={styles.registerButtonText}>ĐĂNG KÝ</Text>
              </TouchableOpacity>
              
              <Text style={styles.yourVouchersText}>MTB Voucher của bạn</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Coupon Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={couponModalVisible}
        onRequestClose={() => setCouponModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setCouponModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.couponModalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setCouponModalVisible(false)}>
                    <Ionicons name="arrow-back" size={24} color="#8e0000" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>MTB Coupon</Text>
                  <TouchableOpacity onPress={() => setCouponModalVisible(false)}>
                    <Text style={styles.confirmText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalContent}>
                  <Text style={styles.couponSectionTitle}>Thông tin Coupon</Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Mã Coupon</Text>
                    <TextInput 
                      style={styles.textInput}
                      placeholder=""
                    />
                  </View>
                  
                  <TouchableOpacity style={styles.registerButton}>
                    <Text style={styles.registerButtonText}>ĐĂNG KÝ</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.yourVouchersText}>MTB Coupon của bạn</Text>
                  
                  {/* Coupon Card */}
                  <View style={styles.couponCard}>
                    <Text style={styles.couponCardTitle}>[BDAY - ALL] FREE MTB COMBO 2025</Text>
                    <Text style={styles.couponCardId}>10009866</Text>
                    <Text style={styles.couponCardExpiry}>Ngày hết hạn: 30 Tháng 4, 2025</Text>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Điểm MTB Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={pointsModalVisible}
        onRequestClose={() => setPointsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPointsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.pointsModalContainer}>
                <Text style={styles.pointsModalText}>Bạn không đủ điểm để mua</Text>
                <TouchableOpacity onPress={() => setPointsModalVisible(false)}>
                  <Text style={styles.pointsModalButtonText}>ĐỒNG Ý</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Thẻ ưu tiên Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={priorityCardModalVisible}
        onRequestClose={() => setPriorityCardModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPriorityCardModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.priorityCardModalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setPriorityCardModalVisible(false)}>
                    <Ionicons name="arrow-back" size={24} color="#8e0000" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Thẻ ưu tiên</Text>
                  <TouchableOpacity onPress={() => setPriorityCardModalVisible(false)}>
                    <Text style={styles.confirmText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.priorityCardModalContent}>
                  <Text style={styles.priorityCardModalText}>Vui lòng chọn thẻ ưu tiên.</Text>
                  <Image
                    source={require('./assets/Anh4.jpeg')}
                    style={styles.cloudCharacterImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.priorityCardModalSubText}>Thẻ ưu tiên rỗng.</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Mã Khuyến Mãi Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={promoCodeModalVisible}
        onRequestClose={() => setPromoCodeModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPromoCodeModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.promoCodeModalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setPromoCodeModalVisible(false)}>
                    <Ionicons name="arrow-back" size={24} color="#8e0000" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Mã Khuyến Mãi</Text>
                  <View style={{ width: 24 }} /> {/* Placeholder to balance the header */}
                </View>
                <View style={styles.promoCodeModalContent}>
                  <Text style={styles.promoCodeModalText}>Nhập mã khuyến mãi</Text>
                  <TouchableOpacity style={styles.applyButton}>
                    <Text style={styles.applyButtonText}>ÁP DỤNG</Text>
                  </TouchableOpacity>
                  <View style={styles.promoCodeSeparator} />
                  <View style={styles.promoCodeEmptyContainer}>
                    <Image
                      source={require('./assets/Anh4.jpeg')}
                      style={styles.cloudCharacterImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.promoCodeModalSubText}>Mã Khuyến Mãi rỗng.</Text>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Thẻ Quà Tặng Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={giftCardModalVisible}
        onRequestClose={() => setGiftCardModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setGiftCardModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.giftCardModalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setGiftCardModalVisible(false)}>
                    <Ionicons name="arrow-back" size={24} color="#8e0000" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Thẻ Quà Tặng</Text>
                  <View style={styles.modalHeaderPlaceholder} />
                </View>
                <View style={styles.giftCardModalContent}>
                  <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Tổng số dư</Text>
                    <Text style={styles.balanceValue}>0 đ</Text>
                  </View>
                  <View style={styles.separator} />
                  <Text style={styles.inputLabel}>Nhập số tiền</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0 đ"
                    keyboardType="numeric"
                    value={giftCardAmount}
                    onChangeText={(text) => setGiftCardAmount(text)}
                  />
                  <View style={styles.separator} />
                  <Text style={styles.maxAmountText}>Số tiền tối đa là 0 đ</Text>
                  <TouchableOpacity
                    style={[
                      styles.confirmButtonModal,
                      { backgroundColor: giftCardAmount ? '#8e0000' : '#ccc' },
                    ]}
                    onPress={() => {
                      if (giftCardAmount) {
                        setGiftCardModalVisible(false);
                        setGiftCardAmount(''); // Reset the amount after confirmation
                      }
                    }}
                    disabled={!giftCardAmount}
                  >
                    <Text style={styles.confirmButtonText}>XÁC NHẬN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MTB eGift Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={eGiftModalVisible}
        onRequestClose={() => setEGiftModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setEGiftModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.eGiftModalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setEGiftModalVisible(false)}>
                    <Ionicons name="arrow-back" size={24} color="#8e0000" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Bộ sưu tập</Text>
                  <View style={styles.modalHeaderPlaceholder} />
                </View>
                <View style={styles.eGiftModalContent}>
                  <Image
                    source={require('./assets/Anh4.jpeg')}
                    style={styles.cloudCharacterImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.eGiftModalSubText}>Bộ sưu tập rỗng.</Text>
                </View>
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
    backgroundColor: '#f4f4f4',
  },
  navigationHeader: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    marginLeft: -150,
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  movieInfoSection: {
    backgroundColor: 'white',
    padding: 15,
  },
  movieCard: {
    flexDirection: 'row',
    height: 190,
  },
  moviePoster: {
    width: 120,
    height: 190,
    borderRadius: 5,
  },
  movieDetails: {
    flex: 1,
    marginLeft: 15,
  },
  movieTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 8,
  },
  ratingBadge: {
    backgroundColor: '#fcdd2e',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  movieDescription: {
    fontSize: 12,
    color: '#8e0000',
    marginBottom: 5,
  },
  movieDate: {
    fontSize: 14,
    marginBottom: 3,
  },
  movieTime: {
    fontSize: 14,
    marginBottom: 3,
  },
  movieLocation: {
    fontSize: 14,
    marginBottom: 3,
  },
  movieTheater: {
    fontSize: 14,
    marginBottom: 3,
  },
  movieSeats: {
    fontSize: 14,
    marginBottom: 5,
  },
  totalPrice: {
    fontSize: 16,
    color: '#8e0000',
    fontWeight: 'bold',
  },
  quantitySection: {
    backgroundColor: 'white',
    marginTop: 10,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: '#333',
  },
  rowValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 15,
  },
  comboSection: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  comboListContainer: {
    paddingRight: 15,
  },
  comboItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 180,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    height: 80,
  },
  comboImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  comboDetails: {
    flex: 1,
    marginLeft: 10,
  },
  comboTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  comboPrice: {
    fontSize: 14,
    color: '#333',
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8e0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  discountSection: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 15,
  },
  discountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  discountLabel: {
    fontSize: 16,
    color: '#333',
  },
  discountLabelWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newBadge: {
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 10,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  giftCardSection: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 15,
  },
  summarySection: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  paymentSection: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 15,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 50,
    height: 35,
    borderRadius: 3,
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  termsSection: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 15,
    marginBottom: 20,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  termsLink: {
    color: '#8e0000',
    textDecorationLine: 'underline',
  },
  confirmButton: {
    backgroundColor: '#8e0000',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Blurred background
    justifyContent: 'center',
    alignItems: 'center',
  },
  voucherModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    width: '100%', // Explicitly set to match couponModalContainer
  },
  couponModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    width: '100%', // Explicitly set for clarity
  },
  pointsModalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsModalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  pointsModalButtonText: {
    fontSize: 16,
    color: '#d91f28',
    fontWeight: 'bold',
  },
  priorityCardModalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    height: '70%',
  },
  priorityCardModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  priorityCardModalText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  cloudCharacterImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  priorityCardModalSubText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  promoCodeModalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    height: '70%',
  },
  promoCodeModalContent: {
    flex: 1,
    padding: 20,
  },
  promoCodeModalText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 20,
  },
  applyButton: {
    backgroundColor: '#8e0000',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  promoCodeSeparator: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  promoCodeEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  promoCodeModalSubText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  // Thẻ Quà Tặng Modal Styles
  giftCardModalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    height: '40%',
  },
  giftCardModalContent: {
    padding: 20,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#333',
  },
  balanceValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 16,
    color: '#999',
    marginBottom: 10,
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 16,
    paddingVertical: 5,
    marginBottom: 10,
  },
  maxAmountText: {
    fontSize: 14,
    color: '#777',
    marginVertical: 20,
  },
  confirmButtonModal: {
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  // MTB eGift Modal Styles
  eGiftModalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    height: '50%',
  },
  eGiftModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  eGiftModalSubText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalHeaderPlaceholder: {
    width: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmText: {
    color: '#d91f28',
    fontSize: 16,
  },
  modalContent: {
    padding: 15,
  },
  voucherSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  couponSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  registerButton: {
    backgroundColor: '#d91f28',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  yourVouchersText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
  },
  couponCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  couponCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  couponCardId: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  couponCardExpiry: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
});