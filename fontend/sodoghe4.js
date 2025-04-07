import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");
const baseSeatSize = width / 25;
const miniMapRatio = 0.2;

const SEAT_MAP_WIDTH = width * 0.9;
const SEAT_MAP_HEIGHT = height * 0.5;
const MINI_MAP_WIDTH = SEAT_MAP_WIDTH * miniMapRatio;
const MINI_MAP_HEIGHT = SEAT_MAP_HEIGHT * miniMapRatio;

// Cấu trúc ghế ngồi mới
const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const seatsPerRowMap = {
  A: 13, // Hàng A chỉ có 10 ghế
  B: 15,
  C: 15,
  D: 15,
  E: 15,
  F: 15,
  G: 14,
  H: 14,
  I: 12,

};

// Giá ghế mới
const seatPrices = {
  A: 50000, // Giá thấp hơn vì xa màn hình
  B: 50000,
  C: 60000,
  D: 60000,
  E: 70000,
  F: 70000,
  G: 80000,
  H: 80000,
  J: 90000, // Ghế VIP
  K: 120000, // Ghế đôi sweetbox cao cấp
  L: 120000, // Ghế đôi sweetbox cao cấp
};

// Loại ghế và màu sắc
const seatTypes = {
  booked: "#A67C52", // Ghế đã đặt
  selected: "#0047AB", // Ghế đang chọn
  vip: "#FF0000", // Ghế VIP - hàng J
  regular: "#D3D3D3", // Ghế thường - hàng A-H
  sweetbox: "#FF00FF", // Ghế sweetbox - hàng K-L
  premium: "#FFD700", // Ghế premium - hàng G-H
  gray: "#808080", // Ghế standard - hàng A-B
};

export default function SeatSelection() {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);
  const [viewportPosition, setViewportPosition] = useState({ x: 0.5, y: 0.5, width: 1, height: 1 });

  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const pinchRef = useRef();
  const panRef = useRef();

  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  // Danh sách ghế đã đặt (random)
  const bookedSeats = [
    "A2", "A7",
    "B3", "B4", "B9",
    "C5", "C8", "C10",
    "D7", "D12",
    "E3", "E10", "E11",
    "F2", "F7", "F12", "F15",
    "G5", "G8", "G14",
    "H3", "H10", "H17",

  ];

  useEffect(() => {
    const updateViewportPosition = () => {
      const currentScale = lastScale.current;
      const visibleWidth = 1 / currentScale;
      const visibleHeight = 1 / currentScale;

      const xPosition = -lastTranslateX.current / (SEAT_MAP_WIDTH * currentScale);
      const yPosition = -lastTranslateY.current / (SEAT_MAP_HEIGHT * currentScale);

      setViewportPosition({
        x: 0.5 + xPosition,
        y: 0.5 + yPosition,
        width: visibleWidth,
        height: visibleHeight,
      });
    };

    updateViewportPosition();
  }, [lastTranslateX.current, lastTranslateY.current, lastScale.current]);

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const newScale = Math.max(1, Math.min(2.5, event.nativeEvent.scale * lastScale.current));
        scale.setValue(newScale);
        setCurrentScale(newScale);
      },
    }
  );

  const onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      lastScale.current = Math.max(1, Math.min(2.5, event.nativeEvent.scale * lastScale.current));
      scale.setValue(lastScale.current);
      setCurrentScale(lastScale.current);

      const maxTranslateX = (SEAT_MAP_WIDTH * lastScale.current - SEAT_MAP_WIDTH) / 2;
      const maxTranslateY = (SEAT_MAP_HEIGHT * lastScale.current - SEAT_MAP_HEIGHT) / 2;
      const newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, lastTranslateX.current));
      const newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, lastTranslateY.current));
      translateX.setValue(newTranslateX);
      translateY.setValue(newTranslateY);
      lastTranslateX.current = newTranslateX;
      lastTranslateY.current = newTranslateY;
    }
  };

  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const maxTranslateX = (SEAT_MAP_WIDTH * lastScale.current - SEAT_MAP_WIDTH) / 2;
        const maxTranslateY = (SEAT_MAP_HEIGHT * lastScale.current - SEAT_MAP_HEIGHT) / 2;

        const newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, lastTranslateX.current + event.nativeEvent.translationX));
        const newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, lastTranslateY.current + event.nativeEvent.translationY));

        translateX.setValue(newTranslateX);
        translateY.setValue(newTranslateY);
      },
    }
  );

  const onPanHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      lastTranslateX.current = translateX._value;
      lastTranslateY.current = translateY._value;
    }
  };

  const handleMiniMapPress = (event) => {
    const { locationX, locationY } = event.nativeEvent;

    const relativeX = locationX / MINI_MAP_WIDTH;
    const relativeY = locationY / MINI_MAP_HEIGHT;

    const targetX = (relativeX - 0.5) * SEAT_MAP_WIDTH * lastScale.current;
    const targetY = (relativeY - 0.5) * SEAT_MAP_HEIGHT * lastScale.current;

    const maxTranslateX = (SEAT_MAP_WIDTH * lastScale.current - SEAT_MAP_WIDTH) / 2;
    const maxTranslateY = (SEAT_MAP_HEIGHT * lastScale.current - SEAT_MAP_HEIGHT) / 2;

    const newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, -targetX));
    const newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, -targetY));

    translateX.setValue(newTranslateX);
    translateY.setValue(newTranslateY);
    lastTranslateX.current = newTranslateX;
    lastTranslateY.current = newTranslateY;

    setViewportPosition({
      x: relativeX,
      y: relativeY,
      width: 1 / lastScale.current,
      height: 1 / lastScale.current,
    });
  };

  const toggleSeat = (seat) => {
    // Nếu ghế đã được đặt thì không thể chọn
    if (bookedSeats.includes(seat)) {
      return;
    }

    setSelectedSeats((prev) => {
      let newSelection = [...prev];
      const isSweetBox = seat.startsWith("K") || seat.startsWith("L"); // K và L là hàng sweetbox

      if (newSelection.includes(seat)) {
        newSelection = newSelection.filter((s) => s !== seat);
        if (isSweetBox) {
          // Nếu là ghế đôi, bỏ chọn cả ghế bên cạnh
          const pairSeat = `${seat[0]}${parseInt(seat.slice(1)) + (parseInt(seat.slice(1)) % 2 === 1 ? 1 : -1)}`;
          newSelection = newSelection.filter((s) => s !== pairSeat);
        }
      } else {
        newSelection.push(seat);
        if (isSweetBox) {
          // Nếu là ghế đôi, tự động chọn cả ghế bên cạnh
          const pairSeat = `${seat[0]}${parseInt(seat.slice(1)) + (parseInt(seat.slice(1)) % 2 === 1 ? 1 : -1)}`;
          if (!newSelection.includes(pairSeat) && !bookedSeats.includes(pairSeat)) {
            newSelection.push(pairSeat);
          }
        }
      }

      const newTotalPrice = newSelection.reduce((sum, s) => sum + (seatPrices[s[0]] || 0), 0);
      setTotalPrice(newTotalPrice);
      return newSelection;
    });
  };

  const Seat = ({ row, index, isSelected, onPress, minimap = false }) => {
    const seat = `${row}${index + 1}`;
    const isBooked = bookedSeats.includes(seat);
    
    let seatColor = seatTypes.regular;

    // Phân loại màu ghế theo hàng
    if (["A", "B", "C", "D","E"].includes(row)) seatColor = seatTypes.gray; // Ghế standard
    
    else if (["J","G", "H", "F"].includes(row)) seatColor = seatTypes.vip; // Ghế VIP
    else if (["I"].includes(row)) seatColor = seatTypes.sweetbox; // Ghế sweetbox
    
    if (isBooked) seatColor = seatTypes.booked;
    if (isSelected) seatColor = seatTypes.selected;

    const seatSize = minimap ? baseSeatSize * miniMapRatio * 0.8 : baseSeatSize;
    
    // Thêm khoảng trống ở giữa mỗi hàng (lối đi)
    const seatIndex = index + 1;
    const rowMiddle = Math.ceil(seatsPerRowMap[row] / 2);
    const hasAisle = ["C", "D", "E", "F", "G", "H", "J"].includes(row);
    
    // Tạo khoảng trống cho lối đi ở giữa
    let marginLeft = minimap ? 0.5 : 2;
    if (hasAisle && seatIndex === rowMiddle) {
      marginLeft = minimap ? 2 : 8;
    }

    return (
      <TouchableOpacity
        onPress={minimap || isBooked ? null : () => onPress(seat)}
        disabled={minimap || isBooked}
        style={[
          styles.seat,
          {
            backgroundColor: seatColor,
            width: seatSize,
            height: seatSize,
            margin: minimap ? 0.5 : 2,
            marginLeft: marginLeft,
          },
        ]}
      >
        {!minimap && (
          <Text style={[styles.seatText, { fontSize: 8, color: isSelected ? "white" : "black" }]}>{seat}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const MiniMap = () => {
    return (
      <TouchableOpacity
        style={styles.miniMapContainer}
        onPress={handleMiniMapPress}
        activeOpacity={0.9}
      >
        <View style={styles.miniMap}>
          <View style={styles.miniScreenContainer}>
            <View style={styles.miniScreen} />
          </View>

          <View style={styles.miniSeatsContainer}>
            {rows.map((row) => (
              <View key={`mini-${row}`} style={styles.miniRow}>
                {[...Array(seatsPerRowMap[row])].map((_, i) => {
                  const seat = `${row}${i + 1}`;
                  return (
                    <Seat
                      key={`mini-${seat}`}
                      row={row}
                      index={i}
                      isSelected={selectedSeats.includes(seat)}
                      minimap={true}
                    />
                  );
                })}
              </View>
            ))}
          </View>

          <View
            style={[
              styles.viewport,
              {
                left: `${viewportPosition.x * 100 - viewportPosition.width * 50}%`,
                top: `${viewportPosition.y * 100 - viewportPosition.height * 50}%`,
                width: `${viewportPosition.width * 100}%`,
                height: `${viewportPosition.height * 100}%`,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const handleBookPress = () => {
    if (selectedSeats.length > 0) {
      console.log("Đặt vé thành công với các ghế:", selectedSeats);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>CGV Cinema Vincom Royal City</Text>
          <Text style={styles.subHeader}>Phòng 3 | 25-04-2025 | 19:30-21:45</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <MiniMap />

        <View style={styles.screenContainer}>
          <Text style={styles.screenText}>Màn hình</Text>
        </View>

        <View style={styles.seatMapContainer}>
          <PinchGestureHandler
            ref={pinchRef}
            simultaneousHandlers={panRef}
            onGestureEvent={onPinchGestureEvent}
            onHandlerStateChange={onPinchHandlerStateChange}
          >
            <Animated.View style={styles.seatMapWrapper}>
              <PanGestureHandler
                ref={panRef}
                simultaneousHandlers={pinchRef}
                onGestureEvent={onPanGestureEvent}
                onHandlerStateChange={onPanHandlerStateChange}
                minDist={10}
              >
                <Animated.View
                  style={[
                    styles.seatMap,
                    {
                      transform: [
                        { scale },
                        { translateX },
                        { translateY },
                      ],
                    },
                  ]}
                >
                  {rows.map((row) => (
                    <View key={row} style={styles.row}>
                      <Text style={styles.rowLabel}>{row}</Text>
                      {[...Array(seatsPerRowMap[row])].map((_, i) => {
                        const seat = `${row}${i + 1}`;
                        return (
                          <Seat
                            key={seat}
                            row={row}
                            index={i}
                            isSelected={selectedSeats.includes(seat)}
                            onPress={toggleSeat}
                          />
                        );
                      })}
                      <Text style={styles.rowLabel}>{row}</Text>
                    </View>
                  ))}
                </Animated.View>
              </PanGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <Text style={{ color: seatTypes.gray }}>■ </Text>
                <Text>Ghế thường</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={{ color: seatTypes.vip }}>■ </Text>
                <Text>Ghế VIP</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <Text style={{ color: seatTypes.sweetbox }}>■ </Text>
                <Text>Sweet Box</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={{ color: seatTypes.booked }}>■ </Text>
                <Text>Đã đặt</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={{ color: seatTypes.selected }}>■ </Text>
                <Text>Đang chọn</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.seatInfoContainer}>
          <Text style={styles.selectedSeatsText}>
            {selectedSeats.length > 0
              ? `Ghế: ${selectedSeats.sort().join(", ")}`
              : "Chưa chọn ghế"}
          </Text>
          <Text style={styles.priceText}>Tổng: {totalPrice.toLocaleString()}đ</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.bookButton,
            selectedSeats.length === 0 && styles.bookButtonDisabled,
          ]}
          onPress={handleBookPress}
          disabled={selectedSeats.length === 0}
        >
          <Text style={styles.bookText}>Đặt vé</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6C36A",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "white",
    paddingHorizontal: 20,
    zIndex: 3,
  },
  headerTextContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 14,
    color: "gray",
  },
  miniMapContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    width: MINI_MAP_WIDTH,
    height: MINI_MAP_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 5,
    padding: 2,
    zIndex: 2,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  miniMap: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  miniScreenContainer: {
    width: "100%",
    alignItems: "center",
    position: "absolute",
    top: 3,
  },
  miniScreen: {
    width: "60%",
    height: 3,
    backgroundColor: "#866B5E",
    borderRadius: 1,
  },
  miniSeatsContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  miniRow: {
    flexDirection: "row",
    marginVertical: 0.5,
  },
  viewport: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "red",
    backgroundColor: "rgba(255, 0, 0, 0.1)",
  },
  screenContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    zIndex: 1,
  },
  screenText: {
    backgroundColor: "#866B5E",
    padding: 5,
    borderRadius: 5,
    color: "white",
    fontSize: 16,
  },
  seatMapContainer: {
    width: SEAT_MAP_WIDTH,
    height: SEAT_MAP_HEIGHT,
    overflow: "hidden",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    zIndex: 1,
  },
  seatMapWrapper: {
    flex: 1,
  },
  seatMap: {
    alignItems: "center",
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 2,
  },
  seat: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 3,
  },
  seatText: {
    color: "black",
  },
  legendContainer: {
    marginTop: 10,
    alignItems: "center",
    zIndex: 2,
  },
  legend: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 3,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bookButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  bookButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  bookText: {
    color: "white",
    fontWeight: "bold",
  },
});