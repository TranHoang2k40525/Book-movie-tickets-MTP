// src/components/ProductList.js
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const ProductList = () => {
  const data = Array.from({ length: 20 }, (_, i) => ({
    id: i.toString(),
    title: `Item ${i + 1}`,
  }));

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Text style={styles.item}>{item.title}</Text>}
      ListHeaderComponent={() => <Text style={styles.header}>Danh sách sản phẩm</Text>}
    />
  );
};

const styles = StyleSheet.create({
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  item: { fontSize: 18, padding: 10, borderBottomWidth: 1 },
});


export default ProductList;
