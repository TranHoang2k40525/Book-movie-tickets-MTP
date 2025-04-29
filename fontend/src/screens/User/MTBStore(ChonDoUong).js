import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProducts } from '../../Api/api'; // Import từ api.js

export default function MTBStore({ navigation }) {
  const [activeTab, setActiveTab] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dữ liệu sản phẩm từ API khi component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        setProducts(response);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Điều hướng đến màn hình chi tiết sản phẩm
  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#c62828" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    // Lọc sản phẩm theo tab
    let filteredProducts = products;
    if (activeTab === 'Combo') {
      filteredProducts = products.filter((p) =>
        p.ProductName.toLowerCase().includes('combo')
      );
    } else if (activeTab === 'Merchandise Combo') {
      filteredProducts = products.filter((p) =>
        p.ProductName.toLowerCase().includes('set')
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.productsContainer}>
          {filteredProducts.map((product) => (
            <ProductItem
              key={product.ProductID}
              title={product.ProductName}
              price={`${product.ProductPrice.toLocaleString()} đ`}
              image={{ uri: product.ImageUrl }}
              onPress={() => handleProductPress(product)}
            />
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f0f0f0" barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#c33" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MTB Store</Text>
          <View style={styles.cartButton} />
        </View>
      </View>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'All' && styles.activeTab]}
          onPress={() => setActiveTab('All')}
        >
          <Text
            style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Combo' && styles.activeTab]}
          onPress={() => setActiveTab('Combo')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Combo' && styles.activeTabText,
            ]}
          >
            Combo
          </Text>
        </TouchableOpacity>

      </View>
      
      {renderTabContent()}
    </SafeAreaView>
  );
}

const ProductItem = ({ title, price, image, onPress }) => (
  <TouchableOpacity style={styles.productItem} onPress={onPress}>
    <Image source={image} style={styles.productImage} resizeMode="cover" />
    <Text style={styles.productTitle}>{title}</Text>
    <Text style={styles.productPrice}>{price}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    marginLeft: -150,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartButton: {
    padding: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#c62828',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#c62828',
    fontWeight: '500',
  },
  imageScrollContainer: {
    maxHeight: 150,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  scrollImage: {
    width: 150,
    height: 150, // Điều chỉnh chiều cao hợp lý
    marginHorizontal: 5,
    borderRadius: 5,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  productItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: '1%',
    padding: 10,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#c62828',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
  },
});