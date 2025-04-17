import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getSeatMapByShow } from './api';
import Menu from './Menu';
const { width, height } = Dimensions.get('window');
const baseSeatSize = width / 25;
const miniMapRatio = 0.2;

const SEAT_MAP_WIDTH = width * 0.9;
const SEAT_MAP_HEIGHT = height * 0.5;
const MINI_MAP_WIDTH = SEAT_MAP_WIDTH * miniMapRatio;
const MINI_MAP_HEIGHT = SEAT_MAP_HEIGHT * miniMapRatio;

const seatTypes = {
  booked: '#A67C52',
  selected: '#0047AB',
  vip: '#FF0000',
  regular: '#D3D3D3',
  sweetbox: '#FF00FF',
};

export default function SeatSelection() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    showId,
    cinemaId,
    cinemaName,
    showDate,
    showTime,
    movieTitle,
    movieId,
  } = route.params;

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [seatLayout, setSeatLayout] = useState([]);
  const [hallInfo, setHallInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Hàm fetchSeatMap được định nghĩa ở đây để tái sử dụng
  const fetchSeatMap = async () => {
    try {
      setLoading(true);
      setError(null); // Reset lỗi trước khi thử lại
      const response = await getSeatMapByShow(showId);
      setSeatLayout(response.data.seatLayout);
      setHallInfo(response.data.hall);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Không thể tải sơ đồ ghế ngồi');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatMap();
    console.log('showId:', showId);
  }, [showId]);

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

        const newTranslateX = Math.max(
          -maxTranslateX,
          Math.min(maxTranslateX, lastTranslateX.current + event.nativeEvent.translationX)
        );
        const newTranslateY = Math.max(
          -maxTranslateY,
          Math.min(maxTranslateY, lastTranslateY.current + event.nativeEvent.translationY)
        );

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
    if (seat.status === 'booked') return;

    setSelectedSeats((prev) => {
      let newSelection = [...prev];
      const isSweetBox = seat.type === 'sweetbox';
      const seatIndex = newSelection.findIndex((s) => s.seatId === seat.seatId);

      if (seatIndex !== -1) {
        newSelection = newSelection.filter((s) => s.seatId !== seat.seatId);
        if (isSweetBox) {
          const pairSeatNumber = seat.seatNumber.startsWith('H')
            ? `H${parseInt(seat.seatNumber.slice(1)) + (parseInt(seat.seatNumber.slice(1)) % 2 === 1 ? 1 : -1)}`
            : null;
          newSelection = newSelection.filter((s) => s.seatNumber !== pairSeatNumber);
        }
      } else {
        newSelection.push(seat);
        if (isSweetBox) {
          const pairSeatNumber = seat.seatNumber.startsWith('H')
            ? `H${parseInt(seat.seatNumber.slice(1)) + (parseInt(seat.seatNumber.slice(1)) % 2 === 1 ? 1 : -1)}`
            : null;
          const pairSeat = seatLayout
            .flatMap((row) => row.seats)
            .find((s) => s.seatNumber === pairSeatNumber);
          if (pairSeat && pairSeat.status !== 'booked' && !newSelection.find((s) => s.seatId === pairSeat.seatId)) {
            newSelection.push(pairSeat);
          }
        }
      }

      const newTotalPrice = newSelection.reduce((sum, s) => sum + s.price, 0);
      setTotalPrice(newTotalPrice);
      return newSelection;
    });
  };

  const navigateToPayment = () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một ghế');
      return;
    }

    navigation.navigate('DatVeThanhToan', {
      selectedSeats,
      totalPrice,
      showId,
      cinemaId,
      cinemaName,
      showDate,
      showTime,
      movieTitle,
      movieId,
    });
  };

  const Seat = ({ seat, isSelected, onPress, minimap = false }) => {
    const seatColor = isSelected
      ? seatTypes.selected
      : seat.status === 'booked'
      ? seatTypes.booked
      : seatTypes[seat.type] || seatTypes.regular;

    const seatSize = minimap ? baseSeatSize * miniMapRatio * 0.8 : baseSeatSize;

    return (
      <TouchableOpacity
        onPress={minimap ? null : () => onPress(seat)}
        disabled={minimap || seat.status === 'booked'}
        style={[
          styles.seat,
          {
            backgroundColor: seatColor,
            width: seatSize,
            height: seatSize,
            margin: minimap ? 0.5 : 2,
          },
        ]}
      >
        {!minimap && <Text style={[styles.seatText, { fontSize: 8 }]}>{seat.seatNumber}</Text>}
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
            {seatLayout.map((row) => (
              <View key={`mini-${row.row}`} style={styles.miniRow}>
                {row.seats.map((seat, i) => (
                  <Seat
                    key={`mini-${seat.seatId}`}
                    seat={seat}
                    isSelected={selectedSeats.some((s) => s.seatId === seat.seatId)}
                    minimap={true}
                  />
                ))}
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
        <Text style={styles.loadingText}>Đang tải sơ đồ ghế...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Có lỗi xảy ra: {error}</Text>
        <TouchableOpacity onPress={fetchSeatMap} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{cinemaName}</Text>
          <Text style={styles.subHeader}>
            {`${hallInfo?.hallName || 'Phòng chiếu'} - ${showDate} ${showTime}`}
          </Text>
        </View>
        <Menu navigation={navigation} />
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
                      transform: [{ scale }, { translateX }, { translateY }],
                    },
                  ]}
                >
                  {seatLayout.map((row) => (
                    <View key={row.row} style={styles.row}>
                      {row.seats.map((seat) => (
                        <Seat
                          key={seat.seatId}
                          seat={seat}
                          isSelected={selectedSeats.some((s) => s.seatId === seat.seatId)}
                          onPress={toggleSeat}
                        />
                      ))}
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
                <Text style={{ color: seatTypes.vip }}>■ </Text>
                <Text>Ghế VIP</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={{ color: seatTypes.regular }}>■ </Text>
                <Text>Ghế thường</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={{ color: seatTypes.booked }}>■ </Text>
                <Text>Ghế đã đặt</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <Text style={{ color: seatTypes.sweetbox }}>■ </Text>
                <Text>Ghế Sweet Box</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={{ color: seatTypes.selected }}>■ </Text>
                <Text>Ghế đang chọn</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.priceText}>Giá vé: {totalPrice.toLocaleString()}đ</Text>
        <TouchableOpacity
          style={[styles.bookButton, selectedSeats.length === 0 && styles.bookButtonDisabled]}
          onPress={navigateToPayment}
          disabled={selectedSeats.length === 0}
        >
          <Text style={styles.bookText}>Đặt Vé</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6C36A',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    zIndex: 3,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 14,
    color: 'gray',
  },
  miniMapContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: MINI_MAP_WIDTH,
    height: MINI_MAP_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
    padding: 2,
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  miniMap: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  miniScreenContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    top: 3,
  },
  miniScreen: {
    width: '60%',
    height: 3,
    backgroundColor: '#866B5E',
    borderRadius: 1,
  },
  miniSeatsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniRow: {
    flexDirection: 'row',
    marginVertical: 0.5,
  },
  viewport: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  screenContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    zIndex: 1,
  },
  screenText: {
    backgroundColor: '#866B5E',
    padding: 5,
    borderRadius: 5,
    color: 'white',
    fontSize: 16,
  },
  seatMapContainer: {
    width: SEAT_MAP_WIDTH,
    height: SEAT_MAP_HEIGHT,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    zIndex: 1,
  },
  seatMapWrapper: {
    flex: 1,
  },
  seatMap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 2,
  },
  seat: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
  },
  seatText: {
    color: 'black',
  },
  legendContainer: {
    marginTop: 10,
    alignItems: 'center',
    zIndex: 2,
  },
  legend: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 3,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  bookText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d6d',
    marginBottom: 10,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#ff4d6d',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
