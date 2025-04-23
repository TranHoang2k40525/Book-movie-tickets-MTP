import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

export default function App() {
  const [timeRemaining, setTimeRemaining] = useState(5 * 60); 
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#c33" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        
        <View style={styles.paymentHeader}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../Book-movie-tickets-MTP/fontend/src/assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Số tiền thanh toán</Text>
            <TouchableOpacity 
              style={styles.amountRow}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.amount}>300,000 VND</Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#0088CC" />
            </TouchableOpacity>
            
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <TouchableOpacity 
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setModalVisible(false)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Thông tin đơn hàng</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalSubtitle}>Đơn vị chấp nhận thanh toán</Text>
                  <Text style={styles.modalCompany}>CJ MTB VIETNAM</Text>
                  <Text style={styles.modalLabel}>Mã đơn hàng</Text>
                  <Text style={styles.modalOrderId}>134190052</Text>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoContainer}>
          <View style={styles.instructionContainer}>
            <Text style={styles.paymentMethodText}>Vui lòng quét mã sau:</Text>
            <View style={styles.atmBadge}>
              <Text style={styles.atmText}>QR</Text>
            </View>
          </View>
          
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={20} color="#000" />
            <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
          </View>
        </View>
        
        <View style={styles.paymentImageContainer}>
          <Image
            source={require('../../Book-movie-tickets-MTP/fontend/src/assets/AnhNH.jpg')}
            style={styles.paymentImage}
            resizeMode="contain"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.cancelContainer}
          onPress={() => setCancelModalVisible(true)}
        >
          <Text style={styles.cancelText}>✕ Hủy giao dịch</Text>
        </TouchableOpacity>

        <Modal
          animationType="fade"
          transparent={true}
          visible={cancelModalVisible}
          onRequestClose={() => setCancelModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCancelModalVisible(false)}
          >
            <View style={styles.cancelModalContainer}>
              <Text style={styles.cancelModalTitle}>Hủy giao dịch</Text>
              <Text style={styles.cancelModalText}>
                Xác nhận hủy giao dịch và quay về trang của CJ MTB VIETNAM?
              </Text>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelModalClose}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.cancelModalCloseText}>✕ Bỏ qua</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        
        <View style={styles.supportContainer}>
          <View style={styles.phoneContainer}>
            <Ionicons name="call-outline" size={18} color="#555" />
            <Text style={styles.supportText}>1900 633 927 (08h30 - 22h00)</Text>
          </View>
          <View style={styles.emailContainer}>
            <Ionicons name="mail-outline" size={18} color="#555" />
            <Text style={styles.supportText}>support@onepay.vn</Text>
          </View>
        </View>
       
        <View style={styles.bottomLinksContainer}>
          <Text style={styles.bottomLinkText}>Về OnePay</Text>
          <Text style={styles.bottomLinkSeparator}>|</Text>
          <Text style={styles.bottomLinkText}>Hướng dẫn thanh toán</Text>
          <Text style={styles.bottomLinkSeparator}>|</Text>
          <Text style={styles.bottomLinkText}>Câu hỏi thường gặp</Text>
          <Text style={styles.bottomLinkSeparator}>|</Text>
          <Text style={styles.bottomLinkText}>Liên hệ</Text>
        </View>
        
        <View style={styles.copyrightContainer}>
          <Text style={styles.copyrightText}>© 2006-2025 Bản quyền thuộc về OnePay</Text>
        </View>
      </ScrollView>
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
    height: 50,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  logoContainer: {
    width: 70, 
    height: 40, 
  },
  logo: {
    width: '100%',
    height: 50,
  },
  amountContainer: {
    alignItems: 'flex-end',
    flexDirection: 'column',
  },
  additionalImage: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0088CC',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 35, 
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timeText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  atmBadge: {
    backgroundColor: '#fff',
    borderColor: '#0088CC',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginLeft: 10,
  },
  atmText: {
    color: '#0088CC',
    fontWeight: 'bold',
    fontSize: 12,
  },
  paymentImageContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  paymentImage: {
    width: '100%',
    height: 400,
    borderRadius: 5,
  },
  cancelContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
  supportContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  onepayLogo: {
    width: 150,
    height: 40,
  },
  certificationsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 15,
  },
  certLogo: {
    width: 80,
    height: 30,
    marginHorizontal: 10,
  },
  bottomLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingVertical: 10,
  },
  bottomLinkText: {
    fontSize: 12,
    color: '#666',
  },
  bottomLinkSeparator: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 5,
  },
  copyrightContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: '#666',
  },
  // Modal styles for payment details
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    width: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 18,
    color: '#666',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalCompany: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalOrderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Cancel Confirmation Modal styles
  cancelModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  cancelModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  cancelModalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#004C8C',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelModalClose: {
    marginTop: 10,
  },
  cancelModalCloseText: {
    color: '#666',
    fontSize: 16,
  },
});
