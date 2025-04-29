import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
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
import { useRoute, useNavigation } from '@react-navigation/native';
import Menu from "../../components/Menu";
import { getMoviesAndShowtimesByCinema } from '../../Api/api';

const { width } = Dimensions.get('window');
const cache = new Map();

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
      scrollViewRef.current.scrollTo({ x: 15 * 60 - width / 2 + 25, animated: true });
    }
  }, [today]);

  const getDates = useCallback(() => {
    const dates = [];
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 12);
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
            {['CN', 'T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7'][date.getDay()]}
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

const MovieSchedule = memo(({ selectedDate, cinemaId, cinemaName }) => {
  const navigation = useNavigation();
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMovie, setExpandedMovie] = useState(null);

  const fetchMoviesAndShowtimes = useCallback(
    async (retries = 3, delay = 1000) => {
      const cacheKey = `movies-showtimes-${cinemaId}-${selectedDate.toISOString().split('T')[0]}`;
      if (cache.has(cacheKey)) {
        setScheduleData(cache.get(cacheKey));
        setLoading(false);
        return;
      }

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          setLoading(true);
          setError(null);

          const dateString = selectedDate.toISOString().split('T')[0];
          const response = await getMoviesAndShowtimesByCinema(cinemaId, dateString);
          const movies = response.data.map((item) => ({
            movieId: item.movieId,
            movie: item.title,
            ageRating: item.ageRating,
            times: item.showtimes.map((showtime) => ({
              startTime: showtime.startTime,
              showId: showtime.showId,
              isPassed: showtime.isPassed,
            })),
          }));

          cache.set(cacheKey, movies);
          setScheduleData(movies);
          setLoading(false);
          return;
        } catch (error) {
          if (attempt === retries) {
            setError(error.message || 'Không thể tải lịch chiếu. Vui lòng thử lại sau.');
            setLoading(false);
          } else {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
    },
    [cinemaId, selectedDate]
  );

  useEffect(() => {
    fetchMoviesAndShowtimes();
  }, [cinemaId, selectedDate, fetchMoviesAndShowtimes]);

  const handleShowtimeClick = useCallback(
    (showId, movieTitle, movieId) => {
      navigation.navigate('SoDoGheNgoi1', {
        showId,
        cinemaId,
        cinemaName,
        showDate: selectedDate.toISOString().split('T')[0],
        movieTitle,
        movieId,
        fromScreen: 'ChonRap_TheoKhuVuc', // Truyền tham số nguồn gốc
      });
    },
    [navigation, cinemaId, cinemaName, selectedDate]
  );

  const toggleMovieExpansion = useCallback((movieId) => {
    setExpandedMovie((prev) => (prev === movieId ? null : movieId));
  }, []);

  const renderShowtimes = useCallback(
    (item) => {
      return item.times.map((time) => (
        <TouchableOpacity
          key={`showtime-${time.showId}`}
          style={[styles.timeButton, time.isPassed && styles.passedTimeButton]}
          onPress={() => !time.isPassed && handleShowtimeClick(time.showId, item.movie, item.movieId)}
          disabled={time.isPassed}
        >
          <Text style={[styles.timeText, time.isPassed && styles.passedTimeText]}>
            {time.startTime}
          </Text>
        </TouchableOpacity>
      ));
    },
    [handleShowtimeClick]
  );

  const renderSchedule = useCallback(() => {
    return scheduleData.map((item, index) => {
      const isExpanded = expandedMovie === item.movieId;
      return (
        <View key={`movie-${index}`} style={styles.movieContainer}>
          <TouchableOpacity
            style={styles.movieHeader}
            onPress={() => toggleMovieExpansion(item.movieId)}
          >
            <View style={styles.movieTitleContainer}>
              <Text style={styles.movieTitle} numberOfLines={2} ellipsizeMode="tail">
                {item.movie} <Text style={styles.theaterText}>({item.ageRating})</Text>
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-down' : 'chevron-forward'}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
          {isExpanded && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {renderShowtimes(item)}
            </ScrollView>
          )}
          <View style={styles.divider} />
        </View>
      );
    });
  }, [scheduleData, expandedMovie, renderShowtimes, toggleMovieExpansion]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
        <Text style={styles.loadingText}>Đang tải lịch chiếu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Có lỗi xảy ra: {error}</Text>
        <TouchableOpacity onPress={() => fetchMoviesAndShowtimes()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <ScrollView style={styles.scheduleScrollView}>{renderSchedule()}</ScrollView>;
});

const ChonRap_TheoKhuVuc = ({ navigation }) => {
  const route = useRoute();
  const { cinemaId, cinemaName } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeftSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="red" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={2} ellipsizeMode="tail">
            {cinemaName}
          </Text>
        </View>
        <Menu navigation={navigation} />
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Lịch chiếu</Text>
        </View>
        <Text style={styles.tabText}>TẤT CẢ</Text>
      </View>

      <ScrollView style={styles.scrollContainer} stickyHeaderIndices={[0]}>
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <MovieSchedule selectedDate={selectedDate} cinemaId={cinemaId} cinemaName={cinemaName} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  headerLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 10,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'red',
  },
  scrollContainer: {
    flex: 1,
  },
  dateContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  currentDateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  monthDateScrollContent: {
    paddingRight: 20,
  },
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
  todayDateBox: {
    backgroundColor: 'red',
    borderColor: 'red',
  },
  selectedDateBox: {
    backgroundColor: '#1E90FF',
    borderColor: '#1E90FF',
  },
  weekdayText: {
    color: 'gray',
    marginBottom: 5,
    fontSize: 12,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  selectedDateText: {
    color: 'white',
  },
  scheduleScrollView: {
    flex: 1,
    marginTop: 10,
  },
  movieContainer: {
    paddingHorizontal: 15,
  },
  movieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  movieTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  theaterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
  },
  timeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 15,
    minWidth: 70,
    alignItems: 'center',
  },
  passedTimeButton: {
    backgroundColor: '#E0E0E0',
  },
  timeText: {
    fontSize: 14,
    color: 'black',
  },
  passedTimeText: {
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
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

export default ChonRap_TheoKhuVuc;
