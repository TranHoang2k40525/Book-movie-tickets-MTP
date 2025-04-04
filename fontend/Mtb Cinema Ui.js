import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const cinemas = [
  { name: "Reson Canary", distance: "", favorite: true },
  { name: "Vincom Center Bà Triệu", distance: "1.28Km" },
  { name: "Trương Định Plaza", distance: "1.28Km" },
  { name: "Sun Grand Lương Yên", distance: "1.28Km" },
  { name: "Vincom Times City", distance: "1.28Km" },
  { name: "Tràng Tiền Plaza", distance: "1.28Km" },
];

const areas = [
  { name: "Hồ Chí Minh", count: 21, cinemas: ["Cinema 1", "Cinema 2"] },
  { name: "Hà Nội", count: 22, cinemas: ["Cinema 3", "Cinema 4"] },
  { name: "Đà Nẵng", count: 2, cinemas: ["Cinema 5"] },
  { name: "Hải Phòng", count: 2, cinemas: ["Cinema 6"] },
  { name: "Kiên Giang", count: 1, cinemas: ["Cinema 7"] },
  { name: "Trà Vinh", count: 2, cinemas: ["Cinema 8"] },
];

export default function App() {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="red" />
        <Text style={styles.headerTitle}>Rạp phim MTB</Text>
      </View>
      <View style={styles.sectionHeader}><Text style={styles.sectionHeaderText}>GỢI Ý CHO BẠN</Text></View>
      {cinemas.map((item, index) => (
        <TouchableOpacity key={index} style={styles.cinemaItem}>
          <Text style={styles.cinemaName}>{item.name}</Text>
          {item.favorite && <Ionicons name="heart" size={20} color="black" />}
          {item.distance && <Text style={styles.distance}>{item.distance}</Text>}
        </TouchableOpacity>
      ))}
      <View style={styles.sectionHeader}><Text style={styles.sectionHeaderText}>KHU VỰC MTB</Text></View>
      {areas.map((area, index) => (
        <View key={index}>
          <TouchableOpacity style={styles.areaItem} onPress={() => toggleExpand(index)}>
            <Text style={styles.areaName}>{area.name}</Text>
            <View style={styles.iconContainer}>
              <Ionicons name={expanded[index] ? "chevron-up" : "chevron-down"} size={20} color="black" />
              <Text style={styles.areaCount}>{area.count}</Text>
            </View>
          </TouchableOpacity>
          {expanded[index] && (
            <View style={styles.subList}>
              {area.cinemas.map((cinema, idx) => (
                <Text key={idx} style={styles.subItem}>{cinema}</Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 10 },
  header: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  sectionHeader: { backgroundColor: "#E6C36A", padding: 10, marginTop: 10 },
  sectionHeaderText: { fontWeight: "bold" },
  cinemaItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  cinemaName: { fontSize: 16, color: "red" },
  distance: { fontSize: 14, color: "red" },
  areaItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  areaName: { fontSize: 16 },
  iconContainer: { flexDirection: "row", alignItems: "center" },
  areaCount: { fontSize: 16, marginLeft: 5 },
  subList: { paddingLeft: 20, paddingTop: 5 },
  subItem: { fontSize: 14, color: "gray", paddingVertical: 2 },
});
