import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getVouchers } from '../../Api/api';

export default function Voucher({ navigation }) {
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const response = await getVouchers();
        setVouchers(response.vouchers || []);
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách voucher. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  const handleVoucherPress = (voucher) => {
    setSelectedVoucher(voucher);
    setModalVisible(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#b00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VOUCHER</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#b00" />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : vouchers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có voucher nào khả dụng!</Text>
        </View>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item) => item.VoucherID.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleVoucherPress(item)}>
              <View style={styles.voucherCard}>
                {item.ImageVoucher ? (
                  <Image source={{ uri: item.ImageVoucher }} style={styles.voucherImage} />
                ) : (
                  <View style={[styles.voucherImage, styles.placeholderImage]}>
                    <Text style={styles.placeholderText}>No Image</Text>
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.voucherCode}>{item.Code}</Text>
                  <Text style={styles.voucherDesc}>{item.Description}</Text>
                  <Text style={styles.voucherExpiry}>
                    HSD: {formatDate(item.EndDate)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {selectedVoucher && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalDetailContainer}>
              <TouchableOpacity
                style={{ alignSelf: 'flex-end' }}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={28} color="#b00" />
              </TouchableOpacity>
              {selectedVoucher.ImageVoucher ? (
                <Image
                  source={{ uri: selectedVoucher.ImageVoucher }}
                  style={styles.detailImage}
                />
              ) : (
                <View style={[styles.detailImage, styles.placeholderImage]}>
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}
              <Text style={styles.detailCode}>{selectedVoucher.Code}</Text>
              <Text style={styles.detailTitle}>{selectedVoucher.Title}</Text>
              <Text style={styles.detailDesc}>{selectedVoucher.Description}</Text>
              <Text style={styles.detailInfo}>
                Giá trị: {selectedVoucher.DiscountValue}đ
              </Text>
              <Text style={styles.detailInfo}>
                Ngày bắt đầu: {formatDate(selectedVoucher.StartDate)}
              </Text>
              <Text style={styles.detailInfo}>
                Ngày kết thúc: {formatDate(selectedVoucher.EndDate)}
              </Text>
              <Text style={styles.detailInfo}>
                Áp dụng cho: {selectedVoucher.IsRestricted ? 'Khách hàng được chọn' : 'Tất cả'}
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#111',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  voucherImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 12,
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b00',
  },
  voucherDesc: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  voucherExpiry: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDetailContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  detailImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 16,
  },
  detailCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b00',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailDesc: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  detailInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});