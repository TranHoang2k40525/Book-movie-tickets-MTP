import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useUser } from "./User/UserContext";
import Menu from "./Menu";

export default function RapPhimMTB({ navigation }) {
  const [cinemas, setCinemas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [expanded, setExpanded] = useState({});
  const scrollViewRef = useRef(null);
  const { user } = useUser();
  const customerId = user?.customerId || 1; // Fallback nếu chưa đăng nhập

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const response = await axios.get(`http://192.168.1.102:3000/api/cinemas/${customerId}`);
        const cinemaData = response.data;

        // Gợi ý cho bạn: Lấy 5 rạp đầu tiên
        const suggestedCinemas = cinemaData.slice(0, 5).map((cinema) => ({
          id: cinema.cinemaId,
          name: cinema.cinemaName,
          distance: `${cinema.distance}Km`,
          favorite: cinema.cinemaId === 1, // Ví dụ: rạp đầu tiên là yêu thích
        }));

        // Nhóm rạp theo thành phố (giả sử API trả về CityID và CityAddress)
        const groupedByCity = cinemaData.reduce((acc, cinema) => {
          const cityId = cinema.CityID || `city_${cinema.cinemaId}`; // Fallback nếu không có CityID
          if (!acc[cityId]) {
            acc[cityId] = {
              name: cinema.CityAddress || "Unknown City", // Fallback nếu không có CityAddress
              count: 0,
              cinemas: [],
            };
          }
          acc[cityId].cinemas.push({
            id: cinema.cinemaId,
            name: cinema.cinemaName,
            distance: `${cinema.distance}Km`,
          });
          acc[cityId].count = acc[cityId].cinemas.length;
          return acc;
        }, {});

        setCinemas(suggestedCinemas);
        setAreas(Object.values(groupedByCity));
      } catch (error) {
        console.error("Lỗi khi lấy danh sách rạp:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách rạp phim. Vui lòng thử lại sau.");
      }
    };

    if (user) {
      fetchCinemas();
    } else {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Vui lòng đăng nhập để xem danh sách rạp phim.",
        [
          { text: "Hủy", style: "cancel", onPress: () => navigation.goBack() },
          { text: "Đăng nhập", onPress: () => navigation.navigate("Login") },
        ]
      );
    }
  }, [user, customerId, navigation]);

  const toggleExpand = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleCinemaPress = (cinema) => {
    navigation.navigate("ChonRap_TheoKhuVuc", {
      cinemaId: cinema.id,
      cinemaName: cinema.name,
    });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleLocationPress = () => {
    Alert.alert("Thông báo", "Chức năng bản đồ hiện đang cập nhật, vui lòng chờ đợi vài năm!.");
  };

  return (
    <View style={styles.container}>
      {/* Header cố định */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rạp phim MTB</Text>
        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={handleLocationPress}>
            <Ionicons name="location-sharp" size={24} color="red" style={styles.locationIcon} />
          </TouchableOpacity>
          <Menu navigation={navigation} />
        </View>
      </View>

      {/* Nội dung cuộn bên dưới header */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>GỢI Ý CHO BẠN</Text>
        </View>
        {cinemas.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cinemaItem}
            onPress={() => handleCinemaPress(item)}
          >
            <View style={styles.cinemaNameContainer}>
              <Text style={styles.cinemaName}>{item.name}</Text>
            </View>
            <View style={styles.cinemaInfo}>
              {item.favorite && <Ionicons name="heart" size={20} color="black" />}
              {item.distance && <Text style={styles.distance}>{item.distance}</Text>}
            </View>
          </TouchableOpacity>
        ))}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>KHU VỰC MTB</Text>
        </View>
        {areas.map((area, index) => (
          <View key={index}>
            <TouchableOpacity style={styles.areaItem} onPress={() => toggleExpand(index)}>
              <View style={styles.areaNameContainer}>
                <Text style={styles.areaName}>{area.name}</Text>
              </View>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={expanded[index] ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="black"
                />
                <Text style={styles.areaCount}>{area.count}</Text>
              </View>
            </TouchableOpacity>
            {expanded[index] && (
              <View style={styles.subList}>
                {area.cinemas.map((cinema, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.subItemContainer, idx !== area.cinemas.length - 1 && styles.subItemBorder]}
                    onPress={() => handleCinemaPress(cinema)}
                  >
                    <View style={styles.subItemNameContainer}>
                      <Text style={styles.subItem}>{cinema.name}</Text>
                    </View>
                    {cinema.distance && (
                      <Text style={styles.subItemDistance}>{cinema.distance}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.scrollToTopButton} onPress={scrollToTop}>
          <Ionicons name="arrow-up-circle" size={40} color="#ccc" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    position: "absolute",
    top: -11,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: -170 },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: { marginRight: 10 },
  scrollContent: {
    flex: 1,
    marginTop: 60,
  },
  sectionHeader: { backgroundColor: "#E6C36A", padding: 10, marginTop: 10 },
  sectionHeaderText: { fontWeight: "bold" },
  cinemaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cinemaNameContainer: {
    flex: 1,
    flexShrink: 1,
  },
  cinemaName: {
    fontSize: 16,
    color: "red",
    flexWrap: "wrap",
  },
  cinemaInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  distance: {
    fontSize: 14,
    color: "red",
    marginLeft: 10,
    flexWrap: "wrap",
  },
  areaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  areaNameContainer: {
    flex: 1,
    flexShrink: 1,
  },
  areaName: {
    fontSize: 16,
    flexWrap: "wrap",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  areaCount: {
    fontSize: 16,
    marginLeft: 5,
  },
  subList: {
    paddingLeft: 20,
    paddingTop: 5,
  },
  subItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  subItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  subItemNameContainer: {
    flex: 1,
    flexShrink: 1,
  },
  subItem: {
    fontSize: 14,
    color: "gray",
    flexWrap: "wrap",
  },
  subItemDistance: {
    fontSize: 14,
    color: "gray",
    marginLeft: 10,
    flexWrap: "wrap",
  },
  scrollToTopButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
});