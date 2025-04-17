import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const App = () => {
  const [activeTab, setActiveTab] = useState('notification');

  const renderContent = () => {
    return (
      <View style={styles.content}>
        <Image
          source={require('./assets/Anh4.jpeg')}
          style={{ width: 100, height: 100 }} 
        />
        <Text style={styles.noDataText}>Không có dữ liệu</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông báo</Text>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="red" />
        </TouchableOpacity>
      </View>
cmd

      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('notification')}>
          <Text
            style={[
              styles.tab,
              activeTab === 'notification' && styles.activeTab,
              activeTab !== 'notification' && styles.inactiveTab,
            ]}
          >
            Thông báo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('support')}>
          <Text
            style={[
              styles.tab,
              activeTab === 'support' && styles.activeTab,
              activeTab !== 'support' && styles.inactiveTab,
            ]}
          >
            Hỗ trợ
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}

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
  noDataText: {
    color: 'black',
    fontSize: 16,
    marginTop: 10,
  },
  bottomBar: {
    height: 10,
    backgroundColor: '#ccc',
  },
});

export default App;
