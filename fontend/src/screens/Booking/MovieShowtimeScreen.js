import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, Feather, FontAwesome, Entypo } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();

/* ----- MÀN HÌNH CHỌN GIỜ CHIẾU ----- */
const MovieShowtimeScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState('23');

  const dates = [
    { day: 'T.2', date: '24' },
    { day: 'T.3', date: '25' },
    { day: 'T.4', date: '26' },
    { day: 'T.5', date: '27' },
    { day: 'T.6', date: '28' },
    { day: 'T.7', date: '29' },
  ];

  const handlePressDate = (date) => {
    setSelectedDate(date);
  };

  const handlePressShowtime = (cinema, time) => {
    navigation.navigate('SeatSelection', { cinema, time });
  };

  const handleFavorite = () => {
    Alert.alert('Đã thêm vào yêu thích!');
  };

  const handleShare = () => {
    Alert.alert('Chia sẻ thành công!');
  };

  const handleBookNow = () => {
    Alert.alert('Chuyển sang đặt vé!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#FF0000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NHÀ GIÁ TIÊN</Text>
        <Feather name="navigation" size={24} color="#FF0000" />
      </View>

      {/* DATE SELECTOR */}
      <View style={styles.dateContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRow}
        >
          {/* Ngày hôm nay */}
          <TouchableOpacity
            style={[
              styles.dateButton,
              selectedDate === '23' && styles.dateButtonActive
            ]}
            onPress={() => handlePressDate('23')}
          >
            <Text
              style={[
                styles.dateText,
                selectedDate === '23' && styles.dateButtonActiveText
              ]}
            >
              23
            </Text>
            <Text
              style={[
                styles.dayText,
                selectedDate === '23' && styles.dateButtonActiveText
              ]}
            >
              Hôm nay
            </Text>
          </TouchableOpacity>

          {/* Các ngày tiếp theo */}
          {dates.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                selectedDate === item.date && styles.dateButtonActive
              ]}
              onPress={() => handlePressDate(item.date)}
            >
              <Text
                style={[
                  styles.dateText,
                  selectedDate === item.date && styles.dateButtonActiveText
                ]}
              >
                {item.date}
              </Text>
              <Text
                style={[
                  styles.dayText,
                  selectedDate === item.date && styles.dateButtonActiveText
                ]}
              >
                {item.day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* DANH SÁCH RẠP */}
      <ScrollView style={styles.scrollView}>
        <CinemaCard
          name="Aeon Canary"
          distance="2.5Km"
          showtimes={['14:50', '15:30', '16:05', '16:40', '17:20', '18:00']}
          onPress={handlePressShowtime}
        />

        <CinemaCard
          name="Aeon Hà Đông"
          distance="1.28Km"
          showtimes={['14:50', '15:30', '16:05', '16:40', '17:20', '18:00']}
          onPress={handlePressShowtime}
          categories={[
            { label: 'GOLDCLASS', color: '#FFD700', times: ['17:00', '18:30'] },
            { label: 'LUXURY', color: '#000', textColor: '#fff', times: ['19:00', '20:30'] }
          ]}
        />
        <CinemaCard
          name="Vincom Center Bà Triệu"
          distance="5.5Km"
          showtimes={['14:50', '15:30', '16:05', '16:40', '17:20', '18:00']}
          onPress={handlePressShowtime}
        />
        <CinemaCard
          name="Trương Định Plaza"
          distance="4.5Km"
          showtimes={['14:50', '15:30', '16:05', '16:40', '17:20', '18:00']}
          onPress={handlePressShowtime}
        />
        <CinemaCard
          name="Grand Lương Yên"
          distance="3.5Km"
          showtimes={['14:50', '15:30', '16:05', '16:40', '17:20', '18:00']}
          onPress={handlePressShowtime}
        />
        {/* Thêm các rạp khác như trước đó */}
      </ScrollView>

      {/* ACTION BUTTONS */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
          <FontAwesome name="heart" size={24} color="#FF0000" />
          <Text style={styles.actionText}>Yêu thích</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Entypo name="share" size={24} color="#FF0000" />
          <Text style={styles.actionText}>Chia sẻ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bookNowButton} onPress={handleBookNow}>
          <Text style={styles.bookNowText}>Đặt vé ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/* ----- COMPONENT RẠP (GIỮ NGUYÊN) ----- */
const CinemaCard = ({ name, distance, showtimes = [], categories = [], onPress }) => {
  return (
    <View style={styles.cinemaCard}>
      <View style={styles.cinemaInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.cinemaLabel}>MTB</Text>
          <Text style={styles.cinemaName}>{name}</Text>
        </View>
        <Text style={styles.distanceText}>{distance}</Text>
      </View>

      <Text style={styles.cinemaSub}>2D Phụ Đề Anh</Text>

      <View style={styles.showtimesRow}>
        {showtimes.map((time, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.timeButton}
            onPress={() => onPress(name, time)}
          >
            <Text style={styles.timeText}>{time}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {categories.map((cat, idx) => (
        <View key={idx}>
          <View style={styles.subLabelRow}>
            <Text
              style={[
                styles.subLabel,
                { backgroundColor: cat.color, color: cat.textColor || '#000' }
              ]}
            >
              {cat.label}
            </Text>
          </View>

          <View style={styles.showtimesRow}>
            {cat.times.map((time, idx2) => (
              <TouchableOpacity
                key={idx2}
                style={styles.timeButton}
                onPress={() => onPress(`${name} ${cat.label}`, time)}
              >
                <Text style={styles.timeText}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

/* ----- MÀN HÌNH CHỌN GHẾ (GIỮ NGUYÊN) ----- */
const SeatSelectionScreen = ({ route, navigation }) => {
  const { cinema, time } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#FF0000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn Ghế</Text>
        <Feather name="navigation" size={24} color="#FF0000" />
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, marginBottom: 10 }}>{cinema}</Text>
        <Text style={{ fontSize: 16 }}>Suất chiếu: {time}</Text>
        {/* Thêm giao diện chọn ghế ở đây */}
      </View>
    </SafeAreaView>
  );
};

/* ----- APP CHÍNH (GIỮ NGUYÊN) ----- */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MovieShowtime" component={MovieShowtimeScreen} />
        <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/* ----- STYLE (ĐÃ CẬP NHẬT) ----- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF0000'
  },
  dateContainer: {
    marginVertical: 8
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  dateButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6
  },
  dateButtonActive: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000'
  },
  dateButtonActiveText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  dateText: {
    fontSize: 16,
    color: '#333'
  },
  dayText: {
    fontSize: 10,
    color: '#999'
  },
  scrollView: {
    flex: 1
  },
  cinemaCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderColor: '#FFD700',
    borderWidth: 0.5
  },
  cinemaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  cinemaLabel: {
    color: '#FF0000',
    fontWeight: 'bold',
    marginRight: 4
  },
  cinemaName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333'
  },
  distanceText: {
    color: '#FF0000',
    fontSize: 12
  },
  cinemaSub: {
    color: '#333',
    marginBottom: 4
  },
  showtimesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8
  },
  timeButton: {
    backgroundColor: '#fff',
    borderColor: '#FF0000',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8
  },
  timeText: {
    color: '#333'
  },
  subLabelRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  subLabel: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  actionButton: {
    alignItems: 'center'
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    color: '#333'
  },
  bookNowButton: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  bookNowText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
