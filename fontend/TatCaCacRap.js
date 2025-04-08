import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, StatusBar, StyleSheet } from 'react-native';

export default function RegionSelectionScreen() {
  // Combined data from both images
  const regions = [
    { name: 'Tất Cả Các Rạp', count: 74 },
    { name: 'Hà Nội', count: 19 },
    { name: 'Hồ Chí Minh', count: 16 },
    { name: 'Cần Thơ', count: 3 },
    { name: 'Quảng Ninh', count: 3 },
    { name: 'Bình Dương', count: 2 },
    { name: 'Đà Nẵng', count: 2 },
    { name: 'Đồng Nai', count: 2 },
    { name: 'Hải Phòng', count: 2 },
    { name: 'Tiền Giang', count: 2 },
    { name: 'Bà Rịa-Vũng Tàu', count: 1 },
    { name: 'Bạc Liêu', count: 1 },
    { name: 'Bình Định', count: 1 },
    { name: 'Đắk Lắk', count: 1 },
    { name: 'Đồng Tháp', count: 1 },
    { name: 'Khánh Hòa', count: 1 },
    { name: 'Kiên Giang', count: 1 },
    { name: 'Kon Tum', count: 1 },
    { name: 'Lạng Sơn', count: 1 },
    { name: 'Nghệ An', count: 1 },
    { name: 'Phú Thọ', count: 1 },
    { name: 'Phú Yên', count: 1 },
    { name: 'Quảng Ngãi', count: 1 },
    { name: 'Sóc Trăng', count: 1 },
    { name: 'Sơn La', count: 1 },
    { name: 'Tây Ninh', count: 1 },
    { name: 'Thái Nguyên', count: 1 },
    { name: 'Trà Vinh', count: 1 },
    { name: 'Vĩnh Long', count: 1 },
    { name: 'Yên Bái', count: 1 },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.name} ({item.count})</Text>
    </TouchableOpacity>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn khu vực</Text>
      </View>
      <FlatList
        data={regions}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        ItemSeparatorComponent={renderSeparator}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    marginTop:20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    paddingHorizontal: 10,
  },
  closeButtonText: {
    color: '#E53935',
    fontSize: 24,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  itemContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  itemText: {
    fontSize: 16,
    color: '#333333',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});