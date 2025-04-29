import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Modal, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNotifications, markNotificationAsRead, getNotificationById } from '../../Api/api';
import { UserContext } from '../../contexts/User/UserContext';
import Menu from '../../components/Menu';
const ThongBao = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('notification');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thông báo:', error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách thông báo. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = async (notificationId) => {
    try {
      // Lấy thông tin chi tiết của thông báo
      const response = await getNotificationById(notificationId);
      setSelectedNotification(response.notification);
      setModalVisible(true);
      
      // Đánh dấu thông báo đã đọc
      await markNotificationAsRead(notificationId);
      
      // Cập nhật lại danh sách thông báo với trạng thái đã đọc
      setNotifications(prev => 
        prev.map(item => 
          item.NotificationID === notificationId 
            ? { ...item, IsRead: true } 
            : item
        )
      );
    } catch (error) {
      console.error('Lỗi khi xử lý thông báo:', error);
      Alert.alert('Lỗi', 'Không thể xử lý thông báo. Vui lòng thử lại sau.');
    }
  };

  const renderNotificationItem = ({ item }) => {
    const formattedDate = new Date(item.DateSent).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return (
      <TouchableOpacity 
        style={[styles.notificationItem, !item.IsRead && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item.NotificationID)}
      >
        <View style={styles.notificationContent}>
          {!item.IsRead && <View style={styles.unreadDot} />}
          <Text style={styles.notificationMessage} numberOfLines={2}>{item.Message}</Text>
          <Text style={styles.notificationDate}>{formattedDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNotificationDetail = () => {
    if (!selectedNotification) return null;
    
    const formattedDate = new Date(selectedNotification.DateSent).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Thông báo</Text>
            <Text style={styles.modalDate}>{formattedDate}</Text>
            <Text style={styles.modalMessage}>{selectedNotification.Message}</Text>
          </View>
        </View>
      </Modal>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="red" />
          <Text>Đang tải dữ liệu...</Text>
        </View>
      );
    }

    if (notifications.length === 0) {
      return (
        <View style={styles.content}>
          <Image
            source={require('../../assets/douong/Anh4.jpeg')}
            style={{ width: 100, height: 100 }} 
          />
          <Text style={styles.noDataText}>Không có dữ liệu</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.NotificationID.toString()}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.notificationList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    );
  };

  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông báo</Text>
        <TouchableOpacity>
          <Menu navigation={navigation}/>
        </TouchableOpacity>
      </View>

      
      {activeTab === 'notification' && renderContent()}
      {renderNotificationDetail()}

      <View style={styles.bottomBar} />
    </View>
  );
};

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
    justifyContent: 'space-around', 
    marginTop: 10,
    paddingHorizontal: 20, 
  },
  tab: {
    padding: 10,
    fontSize: 16,
  },
  activeTab: {
    color: 'red',
    borderBottomWidth: 2,
    borderBottomColor: 'red',
  },
  inactiveTab: {
    color: 'gray',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    color: 'black',
    fontSize: 16,
    marginTop: 10,
  },
  notificationList: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
  },
  notificationContent: {
    position: 'relative',
    paddingLeft: 15,
  },
  unreadDot: {
    position: 'absolute',
    left: 0,
    top: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'red',
  },
  modalDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
  },
  bottomBar: {
    height: 10,
    backgroundColor: '#ccc',
  },

  
});

export default ThongBao;