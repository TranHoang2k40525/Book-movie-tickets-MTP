import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, StatusBar, SafeAreaView } from 'react-native';

export default function App() {
  const scrollViewRef = useRef();
  
  // State to track expanded regions
  const [expandedRegions, setExpandedRegions] = useState({});
  
  // Cinema data structure
  const suggestedCinemas = [
    { id: 1, name: 'MTB Aeon Canary', isFavorite: true, distance: null },
    { id: 2, name: 'MTB Vincom Center Bà Triệu', distance: '1,28Km' },
    { id: 3, name: 'MTB Trương Định Plaza', distance: '1,82Km' },
    { id: 4, name: 'MTB Sun Grand Lương Yên', distance: '2,23Km' },
    { id: 5, name: 'MTB Vincom Times City', distance: '2,51Km' },
    { id: 6, name: 'MTB Tràng Tiền Plaza', distance: '2,78Km' },
  ];
  
  const regions = [
    { 
      id: 1, 
      name: 'Hà Nội', 
      count: 22,
      subRegions: [
        { id: '1-1', name: 'MTB Vincom Center Bà Triệu', distance: '1,28Km' },
        { id: '1-2', name: 'MTB Trương Định Plaza', distance: '1,82Km' },
        { id: '1-3', name: 'MTB Sun Grand Lương Yên', distance: '2,23Km' },
        { id: '1-4', name: 'MTB Vincom Times City', distance: '2,52Km' },
        { id: '1-5', name: 'MTB Tràng Tiền Plaza', distance: '2,78Km' },
        { id: '1-6', name: 'MTB Vincom Royal City', distance: '3,09Km' },
        { id: '1-7', name: 'MTB Hà Nội Centerpoint', distance: '4,41Km' },
        { id: '1-8', name: 'MTB Vincom Trần Duy Hưng', distance: '4,47Km' },
        { id: '1-9', name: 'MTB Vincom Nguyễn Chí Thanh', distance: '4,52Km' },
        { id: '1-10', name: 'MTB Vincom Metropolis Liễu Giai', distance: '4,70Km' },
        { id: '1-11', name: 'MTB Rice City', distance: '4,72Km' },
        { id: '1-12', name: 'MTB Sun Grand Thụy Khuê', distance: '4,95Km' },
        { id: '1-13', name: 'MTB Mac Plaza (Machinco)', distance: '6,11Km' },
        { id: '1-14', name: 'MTB Aeon Long Biên', distance: '6,27Km' },
        { id: '1-15', name: 'MTB Hồ Gươm Plaza', distance: '6,59Km' },
        { id: '1-16', name: 'MTB Xuân Diệu', distance: '7,39Km' },
        { id: '1-17', name: 'MTB Vincom Sky Lake Phạm Hùng', distance: '7,51Km' },
        { id: '1-18', name: 'MTB Indochina Plaza Hà Nội', distance: '7,62Km' },
        { id: '1-19', name: 'MTB Vincom Bắc Từ Liêm', distance: '8,90Km' },
        { id: '1-20', name: 'MTB Vincom Long Biên', distance: '9,26Km' },
        { id: '1-21', name: 'MTB Vincom Ocean Park', distance: '9,42Km' },
        { id: '1-22', name: 'MTB Aeon Hà Đông', distance: '10,01Km' }
      ]
    },
    { 
      id: 2, 
      name: 'Hưng Yên', 
      count: 1,
      subRegions: [{ id: '2-1', name: 'Vincom Hưng Yên' }]
    },
    { 
      id: 3, 
      name: 'Phú Thọ', 
      count: 1,
      subRegions: [{ id: '3-1', name: 'Vincom Phú Thọ' }]
    },
    { 
      id: 4, 
      name: 'Thái Nguyên', 
      count: 1,
      subRegions: [{ id: '4-1', name: 'Vincom Thái Nguyên' }]
    },
    { 
      id: 5, 
      name: 'Hải Phòng', 
      count: 2,
      subRegions: [
        { id: '5-1', name: 'Vincom Hải Phòng' },
        { id: '5-2', name: 'Aeon Mall Hải Phòng' }
      ]
    },
    { 
      id: 6, 
      name: 'Yên Bái', 
      count: 1,
      subRegions: [{ id: '6-1', name: 'Vincom Yên Bái' }]
    },
    { 
      id: 7, 
      name: 'Bình Dương', 
      count: 2,
      subRegions: [
        { id: '7-1', name: 'Bình Dương Square' },
        { id: '7-2', name: 'Aeon Canary' }
      ]
    },
    { 
      id: 8, 
      name: 'Đồng Nai', 
      count: 2,
      subRegions: [
        { id: '8-1', name: 'Coopmart Biên Hoà' },
        { id: '8-2', name: 'Big C Đồng Nai' }
      ]
    },
    { 
      id: 9, 
      name: 'Đồng Tháp', 
      count: 1,
      subRegions: [{ id: '9-1', name: 'Vincom Cao Lãnh' }]
    },
    { 
      id: 10, 
      name: 'Tiền Giang', 
      count: 2,
      subRegions: [
        { id: '10-1', name: 'GO! Mỹ Tho' },
        { id: '10-2', name: 'Vincom Mỹ Tho' }
      ]
    },
    { 
      id: 11, 
      name: 'Bà Rịa-Vũng Tàu', 
      count: 2,
      subRegions: [
        { id: '11-1', name: 'Lapen Center Vũng Tàu' },
        { id: '11-2', name: 'Lam Sơn Square' }
      ]
    },
    { 
      id: 12, 
      name: 'Vĩnh Long', 
      count: 1,
      subRegions: [{ id: '12-1', name: 'Vincom Vĩnh Long' }]
    },
    { 
      id: 13, 
      name: 'Cần Thơ', 
      count: 3,
      subRegions: [
        { id: '13-1', name: 'Vincom Hùng Vương' },
        { id: '13-2', name: 'Sense City' },
        { id: '13-3', name: 'Vincom Xuân khánh' }
      ]
    },
    { 
      id: 14, 
      name: 'Kiên Giang', 
      count: 1,
      subRegions: [{ id: '14-1', name: 'Vincom Rạch Giá' }]
    },
    { 
      id: 15, 
      name: 'Trà Vinh', 
      count: 1,
      subRegions: [{ id: '15-1', name: 'Vincom Trà Vinh' }]
    },
    { 
      id: 16, 
      name: 'Hậu Giang', 
      count: 1,
      subRegions: [{ id: '16-1', name: 'Vincom Vi Thanh' }]
    },
    { 
      id: 17, 
      name: 'Sóc Trăng', 
      count: 1,
      subRegions: [{ id: '17-1', name: 'Vincom Sóc Trăng' }]
    },
    { 
      id: 18, 
      name: 'Bạc Liêu', 
      count: 1,
      subRegions: [{ id: '18-1', name: 'Vincom Bạc Liêu' }]
    },
  ];
  
  // Function to toggle expanded/collapsed state of regions
  const toggleRegion = (id) => {
    setExpandedRegions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Function to scroll to top
  const scrollToTop = () => {
    scrollViewRef.current.scrollTo({ y: 0, animated: true });
  };
  
  // Function to handle cinema selection - updated according to requirements
  const handleCinemaPress = (cinema) => {
    // In a real app, you would navigate to the corresponding screen
    console.log(`Navigate to ${cinema.name}`);
    // For Expo Snack demo, just show an alert
    alert(`Navigating to ${cinema.name}`);
  };
  
  // Function to handle subregion selection
  const handleSubRegionPress = (subRegion) => {
    // In a real app, you would navigate to the corresponding screen
    console.log(`Navigate to ${subRegion.name}`);
    // For Expo Snack demo, just show an alert
    alert(`Navigating to ${subRegion.name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>◄</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn rạp</Text>
        <View style={styles.headerRightButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>✈</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>≡</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Suggested Cinemas Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>GỢI Ý CHO BẠN</Text>
        </View>
        
        {suggestedCinemas.map(cinema => (
          <TouchableOpacity 
            key={cinema.id} 
            style={styles.cinemaItem}
            onPress={() => handleCinemaPress(cinema)}
          >
            <Text style={styles.cinemaName}>{cinema.name}</Text>
            {cinema.isFavorite ? (
              <TouchableOpacity>
                <Text style={styles.favoriteIcon}>❤️</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.distanceText}>{cinema.distance}</Text>
            )}
          </TouchableOpacity>
        ))}
        
        {/* Regions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>KHU VỰC MTB</Text>
        </View>
        
        {regions.map(region => (
          <View key={region.id}>
            <TouchableOpacity 
              style={styles.regionItem}
              onPress={() => toggleRegion(region.id)}
            >
              <Text style={styles.regionName}>{region.name}</Text>
              <View style={styles.regionCountContainer}>
                <Text style={styles.regionCount}>{region.count}</Text>
                <Text style={styles.expandIcon}>{expandedRegions[region.id] ? '▼' : '▶'}</Text>
              </View>
            </TouchableOpacity>
            
            {/* SubRegions - will show when expanded */}
            {expandedRegions[region.id] && region.subRegions.map(subRegion => (
              <TouchableOpacity 
                key={subRegion.id} 
                style={styles.subRegionItem}
                onPress={() => handleSubRegionPress(subRegion)}
              >
                <Text style={styles.subRegionName}>{subRegion.name}</Text>
                {subRegion.distance && (
                  <Text style={styles.distanceText}>{subRegion.distance}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.scrollToTopButton}
            onPress={scrollToTop}
          >
            <Text style={styles.scrollToTopButtonText}>▲</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 28,
    color: '#8B0000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRightButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 16,
  },
  headerButtonText: {
    fontSize: 20,
    color: '#8B0000',
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cinemaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cinemaName: {
    fontSize: 16,
    color: '#8B0000',
  },
  favoriteIcon: {
    fontSize: 20,
  },
  distanceText: {
    fontSize: 16,
    color: '#8B0000',
  },
  regionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  regionName: {
    fontSize: 16,
    color: '#333',
  },
  regionCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regionCount: {
    fontSize: 16,
    marginRight: 8,
    color: '#666',
  },
  expandIcon: {
    fontSize: 14,
    color: '#666',
  },
  subRegionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  subRegionName: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  scrollToTopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  scrollToTopButtonText: {
    fontSize: 20,
    color: '#666',
  }
});