import React, { useState, useEffect, useContext, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../../contexts/User/UserContext';
import Menu from '../../components/Menu';
import { getMovieById, getCinemasByMovieAndDate, getShowtimesByCinemaAndDate } from '../../Api/api';

const cache = new Map();

const { width } = Dimensions.get('window');

const DateSelector = memo(({ selectedDate, onDateChange }) => {
  const [today, setToday] = useState(new Date());
  const scrollViewRef = useRef(null);

  const areSameDay = useCallback((date1, date2) => date1.toDateString() === date2.toDateString(), []);

  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 20 * 53 - width / 2 + 25, animated: true });
    }
  }, [today]);

  const getDates = useCallback(() => {
    const dates = [];
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 15);
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [today]);

  const renderDateItem = useCallback(
    (date, index) => {
      const isToday = areSameDay(date, today);
      const isSelected = areSameDay(date, selectedDate);
      return (
        <TouchableOpacity
          key={`date-${index}`}
          style={[styles.dateBox, isToday && styles.todayDateBox, isSelected && !isToday && styles.selectedDateBox]}
          onPress={() => onDateChange(date)}
        >
          <Text style={[styles.weekdayText, (isToday || isSelected) && styles.selectedDateText]}>
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()]}
          </Text>
          <Text style={[styles.dateText, (isToday || isSelected) && styles.selectedDateText]}>
            {date.getDate()}
          </Text>
        </TouchableOpacity>
      );
    },
    [areSameDay, selectedDate, today, onDateChange]
  );

  return (
    <View style={styles.dateContainer}>
      <Text style={styles.currentDateText}>
        {areSameDay(selectedDate, today)
          ? `Hôm nay, ${selectedDate.toLocaleDateString('vi-VN', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}`
          : selectedDate.toLocaleDateString('vi-VN', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
      </Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthDateScrollContent}
      >
        {getDates().map(renderDateItem)}
      </ScrollView>
    </View>
  );
});

const TheaterLocations = memo(({ navigation, movieId, selectedDate, cinemas, movieTitle }) => {
  const { user } = useContext(UserContext);
  const [expandedTheater, setExpandedTheater] = useState(null);
  const [localCinemas, setLocalCinemas] = useState([]);
  const [showtimes, setShowtimes] = useState({});

  useEffect(() => {
    setLocalCinemas(cinemas);
  }, [cinemas]);

  const fetchShowtimes = useCallback(
    async (cinemaId) => {
      const cacheKey = `showtimes-${movieId}-${cinemaId}-${selectedDate.toISOString().split('T')[0]}`;
      if (cache.has(cacheKey)) {
        setShowtimes((prev) => ({ ...prev, [cinemaId]: cache.get(cacheKey) }));
        return;
      }

      try {
        const response = await getShowtimesByCinemaAndDate(movieId, cinemaId, selectedDate.toISOString().split('T')[0]);
        const data = response.data.showtimes || [];
        cache.set(cacheKey, data);
        setShowtimes((prev) => ({ ...prev, [cinemaId]: data }));
      } catch (error) {
        console.error('Error fetching showtimes:', error);
      }
    },
    [movieId, selectedDate]
  );

  const calculateDistance = useCallback((lat, lon) => {
    const userLat = 21.0285;
    const userLon = 105.8542;
    const R = 6371;
    const dLat = (lat - userLat) * (Math.PI / 180);
    const dLon = (lon - userLon) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLat * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return `${(R * c).toFixed(2)}Km`;
  }, []);

  const handleShowtimePress = useCallback(
    (show, theater) => {
      if (!user) {
        navigation.navigate('Login', { from: 'MovieBookingScreen', movieId });
        return;
      }

      navigation.navigate('SoDoGheNgoi1', {
        showId: show.ShowID,
        cinemaId: theater.id,
        cinemaName: theater.name,
        showDate: selectedDate.toISOString().split('T')[0],
        showTime: show.ShowTime,
        movieTitle,
        movieId,
      });
    },
    [user, navigation, movieId, selectedDate, movieTitle]
  );

  const renderShowtime = useCallback(
    (show, theater) => {
      const timeStr = show.ShowTime ? show.ShowTime.slice(0, 5) : 'N/A';
      return (
        <TouchableOpacity
          key={`showtime-${show.ShowID}`}
          style={[styles.timeButton, show.isPassed && styles.passedTimeButton]}
          disabled={show.isPassed}
          onPress={() => handleShowtimePress(show, theater)}
        >
          <Text style={[styles.timeText, show.isPassed && styles.passedTimeText]}>{timeStr}</Text>
        </TouchableOpacity>
      );
    },
    [handleShowtimePress]
  );

  const renderTheater = useCallback(
    (theater) => (
      <View key={`theater-${theater.id}`} style={styles.theaterContainer}>
        <TouchableOpacity
          style={styles.theaterHeader}
          onPress={() => {
            setExpandedTheater(expandedTheater === theater.id ? null : theater.id);
            if (expandedTheater !== theater.id) fetchShowtimes(theater.id);
          }}
        >
          <View style={styles.theaterNameContainer}>
            <Text style={styles.theaterName}>{theater.name || 'Không có tên'}</Text>
            {theater.id === 1 && <Ionicons name="heart-outline" size={20} color="red" style={styles.favoriteIcon} />}
          </View>
          <Text style={styles.distanceText}>{theater.distance || 'N/A'}</Text>
        </TouchableOpacity>
        {expandedTheater === theater.id && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timesScrollView}>
            {(showtimes[theater.id] || []).map((show) => renderShowtime(show, theater))}
          </ScrollView>
        )}
        <View style={styles.divider} />
      </View>
    ),
    [expandedTheater, fetchShowtimes, showtimes, renderShowtime]
  );

  return <ScrollView style={styles.theatersScrollView}>{localCinemas.map(renderTheater)}</ScrollView>;
});

const MovieBookingScreen = ({ navigation, route }) => {
  const { movieId } = route.params || {};
  const { user } = useContext(UserContext);
  const [movieTitle, setMovieTitle] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingCinemas, setLoadingCinemas] = useState(true);
  const [errorMovie, setErrorMovie] = useState(null);
  const [errorCinemas, setErrorCinemas] = useState(null);

  const calculateDistance = useCallback((lat, lon) => {
    const userLat = 21.0285;
    const userLon = 105.8542;
    const R = 6371;
    const dLat = (lat - userLat) * (Math.PI / 180);
    const dLon = (lon - userLon) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLat * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return `${(R * c).toFixed(2)}Km`;
  }, []);

  const fetchMovieData = useCallback(
    async (retries = 3, delay = 1000) => {
      const movieCacheKey = `movie-${movieId}`;
      if (cache.has(movieCacheKey)) {
        setMovieTitle(cache.get(movieCacheKey));
        setLoadingMovie(false);
        return;
      }

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          setLoadingMovie(true);
          setErrorMovie(null);

          const movieResponse = await getMovieById(movieId);
          if (movieResponse?.data?.movie?.MovieTitle) {
            const title = movieResponse.data.movie.MovieTitle.toUpperCase();
            setMovieTitle(title);
            cache.set(movieCacheKey, title);
            setLoadingMovie(false);
            return;
          } else {
            throw new Error('Không thể lấy thông tin phim');
          }
        } catch (err) {
          if (attempt === retries) {
            setErrorMovie(err.message || 'Đã có lỗi xảy ra khi tải thông tin phim');
            setLoadingMovie(false);
          } else {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
    },
    [movieId]
  );

  const fetchCinemasData = useCallback(
    async (retries = 3, delay = 1000) => {
      const cinemasCacheKey = `cinemas-${movieId}-${selectedDate.toISOString().split('T')[0]}`;
      if (cache.has(cinemasCacheKey)) {
        setCinemas(cache.get(cinemasCacheKey));
        setLoadingCinemas(false);
        return;
      }

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          setLoadingCinemas(true);
          setErrorCinemas(null);

          const cinemasResponse = await getCinemasByMovieAndDate(movieId, selectedDate.toISOString().split('T')[0]);
          const fetchedCinemas = cinemasResponse.data.cinemas.map((cinema) => ({
            id: cinema.CinemaID,
            name: cinema.CinemaName,
            distance: calculateDistance(cinema.latitude, cinema.longitude),
            suggested: true,
          }));
          const filteredCinemas = fetchedCinemas.filter((c) => c.suggested);
          setCinemas(filteredCinemas);
          cache.set(cinemasCacheKey, filteredCinemas);
          setLoadingCinemas(false);
          return;
        } catch (err) {
          if (attempt === retries) {
            setErrorCinemas(err.message || 'Đã có lỗi xảy ra khi tải danh sách rạp');
            setLoadingCinemas(false);
          } else {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
    },
    [movieId, selectedDate, calculateDistance]
  );

  useEffect(() => {
    if (movieId && user) {
      fetchMovieData();
    }
  }, [movieId, user, fetchMovieData]);

  useEffect(() => {
    if (movieId && user) {
      fetchCinemasData();
    }
  }, [movieId, user, selectedDate, fetchCinemasData]);

  if (!user) {
    navigation.navigate('Login', { from: 'MovieBookingScreen', movieId });
    return null;
  }

  if (loadingMovie) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
        <Text style={styles.loadingText}>Đang tải thông tin phim...</Text>
      </View>
    );
  }

  if (errorMovie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Có lỗi xảy ra: {errorMovie}</Text>
        <TouchableOpacity onPress={() => fetchMovieData()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2} ellipsizeMode="tail">
          {movieTitle || 'Không có tiêu đề'}
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="location-outline" size={22} color="red" />
          </TouchableOpacity>
          <Menu navigation={navigation} />
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} stickyHeaderIndices={[0]}>
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        {loadingCinemas ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff4d6d" />
            <Text style={styles.loadingText}>Đang tải danh sách rạp...</Text>
          </View>
        ) : errorCinemas ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Không có rạp nào chiếu phim này ngày hôm nay</Text>
          </View>
        ) : (
          <TheaterLocations
            navigation={navigation}
            movieId={movieId}
            selectedDate={selectedDate}
            cinemas={cinemas}
            movieTitle={movieTitle}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles không thay đổi
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'black', left: 'auto' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginLeft: 15 },
  scrollContainer: { flex: 1 },
  dateContainer: { padding: 15, backgroundColor: '#f5f5f5', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  currentDateText: { fontSize: 14, color: '#666', marginBottom: 10 },
  
  dateBox: {
    width: 50,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: 'white',
  },
  todayDateBox: { backgroundColor: 'red', borderColor: 'red' },
  selectedDateBox: { backgroundColor: '#1E90FF', borderColor: '#1E90FF' },
  weekdayText: { color: 'gray', marginBottom: 5, fontSize: 12 },
  dateText: { fontSize: 18, fontWeight: 'bold', color: 'black' },
  selectedDateText: { color: 'white' },
  theatersScrollView: { flex: 1, marginTop: 10 },
  theaterContainer: { paddingHorizontal: 15 },
  theaterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  theaterNameContainer: { flexDirection: 'row', alignItems: 'center' },
  theaterName: { fontSize: 16, fontWeight: 'bold', color: 'red' },
  favoriteIcon: { marginLeft: 8 },
  distanceText: { color: 'gray', fontSize: 14 },
  timesScrollView: { marginBottom: 15 },
  timeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    marginRight: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  passedTimeButton: { borderColor: '#CCCCCC', backgroundColor: '#F5F5F5' },
  selectedTimeButton: { backgroundColor: 'red', borderColor: 'red' },
  timeText: { fontSize: 14, color: 'black' },
  passedTimeText: { color: '#999999' },
  selectedTimeText: { color: 'white' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginHorizontal: 15 },
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

export default MovieBookingScreen;
