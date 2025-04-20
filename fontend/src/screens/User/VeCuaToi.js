import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const App = () => {
  const [activeTab, setActiveTab] = useState('morning');

  const renderContent = () => {
    if (activeTab === 'morning') {
      return (
        <View style={styles.content}>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={{ width: 150, height: 150 }}
          />
          <Image
            source={require('./assets/Anh4.jpeg')}
            style={styles.logoImage}
            resizeMode="cover"
          />
          <Text style={styles.noDataText}>Không có dữ liệu</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.content, { justifyContent: 'flex-start' }]}>
          <Text style={styles.noticeText}>
            Chỉ hiển thị giao dịch online trong 3 tháng gần nhất. Để kiểm tra lịch sử giao dịch tại quầy vui lòng liên hệ hotline: 19006017.
          </Text>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={{ width: 150, height: 150, marginTop: 20 }}
          />
          <Image
            source={require('./assets/Anh4.jpeg')}
            style={styles.logoImage}
            resizeMode="cover"
          />
          <Text style={styles.noDataText}>Không có dữ liệu</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.title}>Vé của tôi</Text>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="red" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('morning')}>
          <Text style={[styles.tab, activeTab === 'morning' && styles.activeTab]}>
            Phim sắp xem
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('afternoon')}>
          <Text style={[styles.tab, activeTab === 'afternoon' && styles.activeTab]}>
            Phim đã xem
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Lịch sử quầy online</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    marginLeft: -190,
    color: 'red',
    fontSize: 18,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  tab: {
    marginLeft: 30,
    padding: 10,
    fontSize: 16,
  },
  activeTab: {
    marginLeft: 30,
    color: 'red',
    borderBottomWidth: 2,
    borderBottomColor: 'red',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeText: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  noDataText: {
    color: 'black',
    fontSize: 16,
    marginTop: 10,
  },
  logoImage: {
    width: 100, 
    height: 100,
    marginTop: 10,
  },
  button: {
    backgroundColor: 'red',
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default App;