import { useNavigation } from '@react-navigation/native';  // Add this import at the top
import React, { useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, Text, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CONTAINER_HEIGHT = width * 0.6;

const CGVApp = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(scrollY > 300);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    setShowScrollToTop(false);
  };

  // Promotion data with local image assets
  const cardData = [
    { 
      id: 1, 
      image: require('./assets/tintucvauudai/Anh1.jpeg'),
      
    },
    { 
      id: 2, 
      image: require('./assets/tintucvauudai/anh4.jpg'),
      
    },
    { 
      id: 3, 
      image: require('./assets/tintucvauudai/anh8.jpg'),
       
    },
    { 
      id: 4, 
      image: require('./assets/tintucvauudai/anh2.jpg'),
       
    },
    { 
      id: 5, 
      image: require('./assets/tintucvauudai/anh3.jpg'),
       
    },
    { 
      id: 6, 
      image: require('./assets/tintucvauudai/anh5.jpg'),
      
    },
    { 
      id: 7, 
      image: require('./assets/tintucvauudai/anh6.jpg'),
      
    },
    { 
      id: 8, 
      image: require('./assets/tintucvauudai/anh7.jpg'),
       
    },
    { 
      id: 9, 
      image: require('./assets/tintucvauudai/anh9.jpg'),
      
    },
    { 
      id: 10, 
      image: require('./assets/tintucvauudai/anh10.jpg'),
       
    },
   
  ];

  

  const handleImagePress = () => {
    navigation.navigate('TinMoiVaUuDai'); // Điều hướng đến TinMoiVaUuDai
  };

  const handleBackPress = () => {
    navigation.goBack(); // Thêm chức năng goBack
  };

  const handleMenuPress = () => {
    console.log("Menu button pressed");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="red" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tin mới & Ưu đãi</Text>
        </View>
        <TouchableOpacity onPress={handleMenuPress} style={styles.iconButton}>
          <Ionicons name="menu" size={24} color="red" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {cardData.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.imageContainer}
            onPress={handleImagePress} // Sửa onPress để điều hướng
          >
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
        
        <View style={{ height: 80 }} />
      </ScrollView>

      {showScrollToTop && (
        <TouchableOpacity 
          style={styles.scrollToTop} 
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <Text style={styles.scrollToTopText}>Lên Đầu</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// All styles remain exactly the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 3,
    height: 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  iconButton: {
    padding: 5,
  },
  scrollView: {
    marginTop: 90,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: width - 24,
    height: CONTAINER_HEIGHT,
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrollToTop: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#e31937',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scrollToTopText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CGVApp;
