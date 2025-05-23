import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
  ActivityIndicator,
  ImageBackground,
  BackHandler,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getSeatMapByShow, holdSeats, cancelBooking, setupWebSocket, closeWebSocket } from '../../Api/api';
import Menu from '../../components/Menu';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const baseSeatSize = width / 25;
const miniMapRatio = 0.25;
const SEAT_MAP_WIDTH = width * 0.9;
const SEAT_MAP_HEIGHT = height * 0.5;
const MINI_MAP_WIDTH = SEAT_MAP_WIDTH * miniMapRatio;
const MINI_MAP_HEIGHT = SEAT_MAP_HEIGHT * miniMapRatio;

const seatTypes = {
  booked: '#A67C52',
  reserved: '#FFA500',
  selected: '#0047AB',
  vip: '#FF0000',
  regular: '#D3D3D3',
  sweetbox: '#FF00FF',
  aisle: 'transparent',
};

const Seat = memo(({ seat, isSelected, onPress, minimap = false }) => {
  if (seat.type === 'aisle') {
    return <View style={{ width: baseSeatSize, height: baseSeatSize, margin: minimap ? 0.5 : 2 }} />;
  }

  const seatColor = isSelected
    ? seatTypes.selected
    : seat.status === 'booked' || seat.status === 'reserved'
      ? seatTypes[seat.status]
      : seatTypes[seat.type] || seatTypes.regular;

  const seatSize = minimap ? baseSeatSize * miniMapRatio * 0.8 : baseSeatSize;

  return (
    <TouchableOpacity
      onPress={minimap ? null : () => onPress(seat)}
      disabled={minimap || seat.status === 'booked' || seat.status === 'reserved'}
      style={[
        styles.seat,
        {
          backgroundColor: seatColor,
          width: seatSize,
          height: seatSize,
          margin: minimap ? 0.5 : 2,
          transform: [{ scale: isSelected && !minimap ? 1.1 : 1 }],
        },
      ]}
    >
      {!minimap && <Text style={[styles.seatText, { fontSize: 8 }]}>{seat.seatNumber}</Text>}
    </TouchableOpacity>
  );
});

const MiniMap = memo(({ seatLayout, selectedSeats, viewportPosition, handleMiniMapPress }) => {
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
              {row.seats.map((seat) => (
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
        <Animated.View
          style={[
            styles.viewport,
            {
              left: `${viewportPosition.x * 100}%`,
              top: `${viewportPosition.y * 100}%`,
              width: `${viewportPosition.width * 100}%`,
              height: `${viewportPosition.height * 100}%`,
              transform: [
                { translateX: -viewportPosition.width * 50 },
                { translateY: -viewportPosition.height * 50 },
              ],
              opacity: 0.6,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
});

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
    moviePoster,
    MovieLanguage,
    ImageUrl,
    fromScreen,
  } = route.params;

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [seatLayout, setSeatLayout] = useState([]);
  const [hallInfo, setHallInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentScale, setCurrentScale] = useState(1);
  const [viewportPosition, setViewportPosition] = useState({ x: 0.5, y: 0.5, width: 1, height: 1 });
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const pinchRef = useRef();
  const panRef = useRef();
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    checkAuthStatus();
    fetchSeatMap();
    setupWebSocketConnection();

    return () => {
      closeWebSocket(); // Đóng WebSocket khi component unmount
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const setupWebSocketConnection = useCallback(() => {
    setupWebSocket(showId, {
      onSeatUpdate: (newSeatLayout) => {
        setSeatLayout(newSeatLayout);
        setSelectedSeats((prev) =>
          prev.filter((seat) => {
            const updatedSeat = newSeatLayout
              .flatMap((row) => row.seats)
              .find((s) => s.seatId === seat.seatId);
            return updatedSeat && updatedSeat.status === 'available';
          })
        );
        setTotalPrice(
          selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0)
        );
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        setError('Lỗi kết nối thời gian thực. Vui lòng thử lại.');
      },
      onClose: () => {
        console.log('WebSocket connection closed');
      },
    });
  }, [showId]);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        setIsLoggedIn(true);
      } else {
        Alert.alert(
          'Yêu cầu đăng nhập',
          'Bạn cần đăng nhập để chọn ghế và đặt vé',
          [
            {
              text: 'Đăng nhập ngay',
              onPress: () =>
                navigation.navigate('Login', {
                  returnScreen: 'SoDoGheNgoi1',
                  returnParams: route.params,
                }),
            },
            {
              text: 'Quay lại',
              onPress: () => navigation.goBack(),
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Lỗi kiểm tra trạng thái đăng nhập:', error);
      setIsLoggedIn(false);
    }
  };

  const fetchSeatMap = useCallback(async () => {
    try {
      setError(null);
      const response = await getSeatMapByShow(showId);
      const rawLayout = response.seatLayout || response.data.seatLayout;

      const optimizedLayout = rawLayout.map((row, rowIndex) => {
        const isLastRow = rowIndex === rawLayout.length - 1;
        const seats = row.seats.map((seat, seatIndex) => {
          if (isLastRow) {
            return { ...seat, type: 'sweetbox', seatNumber: `H${seatIndex + 1}` };
          }
          return seat;
        });

        if (rowIndex === 0 || rowIndex === rawLayout.length - 1) {
          seats.unshift({ seatId: `aisle-start-${row.row}`, type: 'aisle' });
          seats.push({ seatId: `aisle-end-${row.row}`, type: 'aisle' });
        }

        return { ...row, seats };
      });

      setSeatLayout(optimizedLayout);
      setHallInfo(response.hall || response.data.hall);
    } catch (err) {
      setError(err.message || 'Không thể tải sơ đồ ghế ngồi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSelectedSeats([]);
    setTotalPrice(0);
    fetchSeatMap();
  }, [fetchSeatMap]);

  const checkBookingStatus = async (bookingId) => {
    try {
      return true;
    } catch (error) {
      console.error('Lỗi kiểm tra trạng thái đặt vé:', error);
      return false;
    }
  };

  const handleCancelBooking = useCallback(async () => {
    if (!bookingId || isCancelling) return;
    setIsCancelling(true);
    try {
      const isBookingActive = await checkBookingStatus(bookingId);
      if (!isBookingActive) {
        console.log('Đặt vé đã hết hạn hoặc đã hủy, bỏ qua.');
        return;
      }
      await cancelBooking(bookingId);
      console.log('Đã hủy đặt vé:', bookingId);
      setBookingId(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể hủy đặt vé';
      const status = error.response?.status;
      console.error('Lỗi khi hủy đặt vé:', error);
      if (
        errorMessage === 'Đặt vé đã được hủy trước đó' ||
        status === 400 ||
        status === 403 ||
        status === 410
      ) {
        console.log(`Bỏ qua lỗi: ${errorMessage} (Status: ${status})`);
      } else {
        Alert.alert('Lỗi', errorMessage);
      }
    } finally {
      setIsCancelling(false);
    }
  }, [bookingId, isCancelling]);

  const handleGoBack = useCallback(async () => {
    if (isCancelling) return;
    Alert.alert(
      'Hủy giao dịch',
      'Bạn có muốn hủy quá trình chọn ghế không?',
      [
        {
          text: 'Hủy',
          onPress: async () => {
            if (timerRef.current) clearInterval(timerRef.current);
            await handleCancelBooking();
            if (fromScreen === 'MovieBookingScreen') {
              navigation.navigate('MovieBookingScreen', { movieId });
            } else if (fromScreen === 'ChonRap_TheoKhuVuc') {
              navigation.navigate('ChonRap_TheoKhuVuc', { cinemaId, cinemaName });
            } else {
              navigation.goBack();
            }
          },
          style: 'destructive',
        },
        { text: 'Tiếp tục', style: 'cancel' },
      ],
      { cancelable: false }
    );
  }, [handleCancelBooking, fromScreen, movieId, cinemaId, cinemaName, isCancelling]);

  useEffect(() => {
    const backAction = () => {
      handleGoBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [handleGoBack]);

  const updateViewportPosition = useCallback(() => {
    const currentScaleValue = lastScale.current;
    const visibleWidth = 1 / currentScaleValue;
    const visibleHeight = 1 / currentScaleValue;
    const xPosition = (-lastTranslateX.current / (SEAT_MAP_WIDTH * currentScaleValue)) + 0.5;
    const yPosition = (-lastTranslateY.current / (SEAT_MAP_HEIGHT * currentScaleValue)) + 0.5;

    setViewportPosition({
      x: Math.max(0, Math.min(1, xPosition)),
      y: Math.max(0, Math.min(1, yPosition)),
      width: visibleWidth,
      height: visibleHeight,
    });
  }, []);

  useEffect(() => {
    updateViewportPosition();
  }, [lastTranslateX.current, lastTranslateY.current, lastScale.current, updateViewportPosition]);

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale } }],
    {
      useNativeDriver: true,
      listener: ({ nativeEvent }) => {
        const newScale = Math.max(1, Math.min(3, nativeEvent.scale * lastScale.current));
        scale.setValue(newScale);
        setCurrentScale(newScale);
      },
    }
  );

  const onPinchHandlerStateChange = useCallback(
    ({ nativeEvent }) => {
      if (nativeEvent.state === State.END) {
        lastScale.current = Math.max(1, Math.min(3, nativeEvent.scale * lastScale.current));
        scale.setValue(lastScale.current);
        setCurrentScale(lastScale.current);

        const maxTranslateX = (SEAT_MAP_WIDTH * lastScale.current - SEAT_MAP_WIDTH) / 2;
        const maxTranslateY = (SEAT_MAP_HEIGHT * lastScale.current - SEAT_MAP_HEIGHT) / 2;
        const newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, lastTranslateX.current));
        const newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, lastTranslateY.current));

        Animated.spring(translateX, { toValue: newTranslateX, useNativeDriver: true }).start();
        Animated.spring(translateY, { toValue: newTranslateY, useNativeDriver: true }).start();

        lastTranslateX.current = newTranslateX;
        lastTranslateY.current = newTranslateY;

        updateViewportPosition();
      }
    },
    [updateViewportPosition]
  );

  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    {
      useNativeDriver: true,
      listener: ({ nativeEvent }) => {
        const maxTranslateX = (SEAT_MAP_WIDTH * lastScale.current - SEAT_MAP_WIDTH) / 2;
        const maxTranslateY = (SEAT_MAP_HEIGHT * lastScale.current - SEAT_MAP_HEIGHT) / 2;

        const newTranslateX = Math.max(
          -maxTranslateX,
          Math.min(maxTranslateX, lastTranslateX.current + nativeEvent.translationX)
        );
        const newTranslateY = Math.max(
          -maxTranslateY,
          Math.min(maxTranslateY, lastTranslateY.current + nativeEvent.translationY)
        );

        translateX.setValue(newTranslateX);
        translateY.setValue(newTranslateY);
      },
    }
  );

  const onPanHandlerStateChange = useCallback(
    ({ nativeEvent }) => {
      if (nativeEvent.state === State.END) {
        lastTranslateX.current = translateX._value;
        lastTranslateY.current = translateY._value;

        Animated.spring(translateX, { toValue: lastTranslateX.current, useNativeDriver: true }).start();
        Animated.spring(translateY, { toValue: lastTranslateY.current, useNativeDriver: true }).start();

        updateViewportPosition();
      }
    },
    [updateViewportPosition]
  );

  const handleMiniMapPress = useCallback(
    (event) => {
      const { locationX, locationY } = event.nativeEvent;
      const relativeX = Math.max(0, Math.min(1, locationX / MINI_MAP_WIDTH));
      const relativeY = Math.max(0, Math.min(1, locationY / MINI_MAP_HEIGHT));

      const targetX = (relativeX - 0.5) * SEAT_MAP_WIDTH * lastScale.current;
      const targetY = (relativeY - 0.5) * SEAT_MAP_HEIGHT * lastScale.current;

      const maxTranslateX = (SEAT_MAP_WIDTH * lastScale.current - SEAT_MAP_WIDTH) / 2;
      const maxTranslateY = (SEAT_MAP_HEIGHT * lastScale.current - SEAT_MAP_HEIGHT) / 2;

      const newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, -targetX));
      const newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, -targetY));

      Animated.spring(translateX, { toValue: newTranslateX, useNativeDriver: true }).start();
      Animated.spring(translateY, { toValue: newTranslateY, useNativeDriver: true }).start();

      lastTranslateX.current = newTranslateX;
      lastTranslateY.current = newTranslateY;

      setViewportPosition({
        x: relativeX,
        y: relativeY,
        width: 1 / lastScale.current,
        height: 1 / lastScale.current,
      });
    },
    []
  );

  const handleSeatPress = (seat) => {
    if (!isLoggedIn) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để chọn ghế và đặt vé',
        [
          {
            text: 'Đăng nhập ngay',
            onPress: () =>
              navigation.navigate('Login', {
                returnScreen: 'SoDoGheNgoi1',
                returnParams: route.params,
              }),
          },
          {
            text: 'Đóng',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    if (seat.status === 'booked' || seat.status === 'reserved' || seat.type === 'aisle') return;
    if (refreshing) {
      Alert.alert('Thông báo', 'Đang cập nhật sơ đồ ghế, vui lòng đợi một chút.');
      return;
    }

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
        if (isSweetBox) {
          const seatNumber = parseInt(seat.seatNumber.slice(1));
          const isOdd = seatNumber % 2 === 1;
          const pairSeatNumber = `H${isOdd ? seatNumber + 1 : seatNumber - 1}`;
          const pairSeat = seatLayout
            .flatMap((row) => row.seats)
            .find((s) => s.seatNumber === pairSeatNumber);

          if (!pairSeat || pairSeat.status === 'booked' || pairSeat.status === 'reserved' || pairSeat.type !== 'sweetbox') {
            Alert.alert('Thông báo', 'Ghế Sweet Box phải chọn cả cặp!');
            return prev;
          }
          newSelection.push(seat, pairSeat);
        } else {
          newSelection.push(seat);
        }
      }

      const newTotalPrice = newSelection.reduce((sum, s) => sum + (s.price || 0), 0);
      setTotalPrice(newTotalPrice);
      return newSelection;
    });
  };

  const handleContinue = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để đặt vé',
        [
          {
            text: 'Đăng nhập ngay',
            onPress: () =>
              navigation.navigate('Login', {
                returnScreen: 'SoDoGheNgoi1',
                returnParams: route.params,
              }),
          },
          { text: 'Đóng', style: 'cancel' },
        ]
      );
      return;
    }

    if (selectedSeats.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một ghế để tiếp tục');
      return;
    }

    try {
      setRefreshing(true);
      const seatIds = selectedSeats.map((seat) => seat.seatId);
      const response = await holdSeats(showId, seatIds);
      const { bookingId, expirationTime, bookingStatus, seats } = response;

      setBookingId(bookingId);

      if (timerRef.current) clearInterval(timerRef.current);

      navigation.navigate('DatVeThanhToan', {
        bookingId,
        expirationTime,
        selectedSeats,
        totalPrice,
        showId,
        cinemaId,
        cinemaName,
        showDate,
        showTime,
        movieTitle,
        movieId,
        moviePoster,
        ImageUrl,
        MovieLanguage,
        fromScreen,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể giữ ghế. Vui lòng thử lại.';
      if (errorMessage !== 'Đặt vé đã được hủy trước đó') {
        Alert.alert('Lỗi', errorMessage);
      }
      console.error('Lỗi khi đặt vé:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderLoginMessage = () => {
    if (!isLoggedIn) {
      return (
        <View style={styles.loginRequiredContainer}>
          <Text style={styles.loginRequiredText}>
            Bạn cần đăng nhập để chọn ghế và đặt vé
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() =>
              navigation.navigate('Login', {
                returnScreen: 'SoDoGheNgoi1',
                returnParams: route.params,
              })
            }
          >
            <Text style={styles.loginButtonText}>ĐĂNG NHẬP NGAY</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
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
      <ImageBackground
        source={{ uri: moviePoster }}
        style={styles.background}
        blurRadius={10}
      >
        <View style={styles.overlay} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleGoBack}
            disabled={isCancelling}
          >
            <Ionicons name="arrow-back" size={24} color={isCancelling ? 'grey' : 'red'} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{cinemaName}</Text>
            <Text style={styles.subHeader}>
              {`${hallInfo?.hallName || 'Phòng chiếu'} - ${showDate} ${showTime}`}
            </Text>
          </View>
          <Menu navigation={navigation} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ff4d6d"
              colors={['#ff4d6d']}
            />
          }
        >
          <View style={styles.container}>
            <MiniMap
              seatLayout={seatLayout}
              selectedSeats={selectedSeats}
              viewportPosition={viewportPosition}
              handleMiniMapPress={handleMiniMapPress}
            />

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
                              onPress={handleSeatPress}
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
                  <View style={styles.legendItem}>
                    <Text style={{ color: seatTypes.reserved }}>■ </Text>
                    <Text>Ghế đang giữ</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.movieInfo}>
              <Text style={styles.movieTitle}>{movieTitle}</Text>
              <Text style={styles.movieLanguage}>Ngôn ngữ: {MovieLanguage || 'N/A'}</Text>
              <Text style={styles.priceText}>Giá vé: {totalPrice.toLocaleString()}đ</Text>
            </View>
            <TouchableOpacity
              style={[styles.bookButton, selectedSeats.length === 0 && styles.bookButtonDisabled]}
              onPress={handleContinue}
              disabled={selectedSeats.length === 0 || refreshing}
            >
              <Text style={styles.bookText}>Đặt Vé</Text>
            </TouchableOpacity>
          </View>

          {renderLoginMessage()}
        </ScrollView>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(206, 145, 14, 0.6)',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgb(247, 246, 244)',
    zIndex: 3,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  subHeader: {
    fontSize: 14,
    color: 'black',
  },
  miniMapContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: MINI_MAP_WIDTH,
    height: MINI_MAP_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 4,
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 5,
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
    width: '70%',
    height: 4,
    backgroundColor: '#866B5E',
    borderRadius: 2,
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
    borderWidth: 2,
    borderColor: '#ff4d6d',
    backgroundColor: 'rgba(255, 77, 109, 0.2)',
  },
  screenContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    zIndex: 1,
  },
  screenText: {
    backgroundColor: '#866B5E',
    padding: 8,
    borderRadius: 8,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seatMapContainer: {
    width: SEAT_MAP_WIDTH,
    height: SEAT_MAP_HEIGHT,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    elevation: 3,
    zIndex: 1,
    top: 10,
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
    borderRadius: 4,
    elevation: 1,
  },
  seatText: {
    color: 'black',
    fontWeight: '500',
  },
  legendContainer: {
    marginTop: 10,
    alignItems: 'center',
    zIndex: 2,
  },
  legend: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 2,
    top: 10,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 5,
    zIndex: 3,
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  movieLanguage: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4d6d',
  },
  bookButton: {
    backgroundColor: '#ff4d6d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  bookText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d6d',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#ff4d6d',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginRequiredContainer: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  loginRequiredText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#e71a0f',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});