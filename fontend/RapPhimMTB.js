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
import { getCinemas } from "./api"; // Import API
import Menu from "./Menu"; // Import Menu component

export default function RapPhimMTB({ navigation }) {
  const [cinemas, setCinemas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [expanded, setExpanded] = useState({});
  const scrollViewRef = useRef(null);

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const response = await getCinemas();
        const cinemaData = response.data.cinemas;

        // Gợi ý cho bạn: Lấy các rạp gần nhất (giả sử 5 rạp đầu tiên)
        const suggestedCinemas = cinemaData.slice(0, 5).map((cinema) => ({
          name: cinema.CinemaName,
          distance: cinema.Distance ? `${cinema.Distance}Km` : "N/A",
          favorite: false, // Có thể thêm logic để xác định rạp yêu thích
        }));

        // Nhóm rạp theo thành phố
        const groupedByCity = cinemaData.reduce((acc, cinema) => {
          const cityId = cinema.CityID;
          if (!acc[cityId]) {
            acc[cityId] = {
              name: cinema.CityAddress,
              count: 0,
              cinemas: [],
            };
          }
          acc[cityId].cinemas.push({
            name: cinema.CinemaName,
            distance: cinema.Distance ? `${cinema.Distance}Km` : "N/A",
          });
          acc[cityId].count = acc[cityId].cinemas.length;
          return acc;
        }, {});

        setCinemas(suggestedCinemas);
        setAreas(Object.values(groupedByCity));
      } catch (error) {
        console.error("Lỗi khi lấy danh sách rạp:", error);
        Alert.alert(
          "Lỗi",
          "Không thể tải danh sách rạp phim. Vui lòng thử lại sau."
        );
      }
    };

    fetchCinemas();
  }, []);

  const toggleExpand = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleLocationPress = () => {
    // Hiển thị thông báo khi nhấn vào icon bản đồ
    Alert.alert(
      "Thông báo",
      "Chức năng bản đồ hiện đang cập nhật, vui lòng chờ đợi vài năm!."
    );
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
            <Ionicons
              name="location-sharp"
              size={24}
              color="red"
              style={styles.locationIcon}
            />
          </TouchableOpacity>
          <Menu navigation={navigation} /> {/* Sử dụng component Menu */}
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
          <TouchableOpacity key={index} style={styles.cinemaItem}>
            <View style={styles.cinemaNameContainer}>
              <Text style={styles.cinemaName}>{item.name}</Text>
            </View>
            <View style={styles.cinemaInfo}>
              {item.favorite && (
                <Ionicons name="heart" size={20} color="black" />
              )}
              {item.distance && (
                <Text style={styles.distance}>{item.distance}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>KHU VỰC MTB</Text>
        </View>
        {areas.map((area, index) => (
          <View key={index}>
            <TouchableOpacity
              style={styles.areaItem}
              onPress={() => toggleExpand(index)}
            >
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
                    style={[
                      styles.subItemContainer,
                      idx !== area.cinemas.length - 1 && styles.subItemBorder,
                    ]}
                  >
                    <View style={styles.subItemNameContainer}>
                      <Text style={styles.subItem}>{cinema.name}</Text>
                    </View>
                    {cinema.distance && (
                      <Text style={styles.subItemDistance}>
                        {cinema.distance}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.scrollToTopButton}
          onPress={scrollToTop}
        >
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginLeft: -150,
  },
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
    alignItems: "center", // Đảm bảo các phần tử căn giữa theo chiều dọc
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cinemaNameContainer: {
    flex: 1, // Chiếm toàn bộ không gian còn lại
    flexShrink: 1, // Cho phép co lại nếu văn bản quá dài
  },
  cinemaName: {
    fontSize: 16,
    color: "red",
    flexWrap: "wrap", // Văn bản tự động xuống dòng
  },
  cinemaInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  distance: {
    fontSize: 14,
    color: "red",
    marginLeft: 10, // Khoảng cách giữa icon và khoảng cách
    flexWrap: "wrap", // Văn bản tự động xuống dòng
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
    flex: 1, // Chiếm toàn bộ không gian còn lại
    flexShrink: 1, // Cho phép co lại nếu văn bản quá dài
  },
  areaName: {
    fontSize: 16,
    flexWrap: "wrap", // Văn bản tự động xuống dòng
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
