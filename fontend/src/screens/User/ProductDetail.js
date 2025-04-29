import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetail({ route, navigation }) {
  const { product } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f0f0f0" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#c33" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{product.ProductName}</Text>
        <View style={styles.cartButton} />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Image
          source={{ uri: product.ImageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.detailsContainer}>
          <Text style={styles.productTitle}>{product.ProductName}</Text>
          <Text style={styles.productPrice}>
            {product.ProductPrice.toLocaleString()} đ
          </Text>
          <Text style={styles.productDescription}>
            {product.ProductDescription}
          </Text>
          {product.Notes && product.Notes.length > 0 && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>Ghi chú:</Text>
              {product.Notes.map((note, index) => (
                <Text key={index} style={styles.noteText}>
                  - {note}
                </Text>
              ))}
            </View>
          )}
          <Text style={styles.message}>
            Hãy thưởng thức bộ phim hay cùng với những sản phẩm hấp dẫn, tăng trải
            nghiệm cảm giác của bộ phim nhé các bạn hãy đặt phim nào các bạn!
          </Text>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('Datvetheophim')}
          >
            <Text style={styles.bookButtonText}>Đặt phim</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cartButton: {
    padding: 5,
  },
  contentContainer: {
    padding: 15,
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 15,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 18,
    color: '#c62828',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  notesContainer: {
    marginBottom: 15,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
  },
  message: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#c62828',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});