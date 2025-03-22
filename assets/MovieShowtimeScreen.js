import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, Feather } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();

const MovieShowtimeScreen = ({ navigation }) => {
  const dates = [
    { day: 'T.2', date: '18/03' },
    { day: 'T.3', date: '19/03' },
    { day: 'T.4', date: '20/03' },
    { day: 'T.5', date: '21/03' },
    { day: 'T.6', date: '22/03' },
    { day: 'T.7', date: '23/03' },
  ];

  const cinemas = [
    {
      name: 'CGV Aeon Canary',
      distance: '1.28Km',
      showtimes: ['14:50', '15:30', '16:05', '16:40', '17:20', '18:00'],
    },
    {
      name: 'CGV Aeon Hà Đông',
      distance: '2.50Km',
      showtimes: ['12:00', '13:45', '15:30', '17:15', '19:00', '20:45'],
    },
    {
      name: 'CGV Vincom Bà Triệu',
      distance: '3.00Km',
      showtimes: ['11:00', '13:00', '15:00', '17:00', '19:00'],
    },
    {
      name: 'CGV Vincom Nguyễn Chí Thanh',
      distance: '4.20Km',
      showtimes: ['10:30', '12:45', '15:00', '17:15', '19:30'],
    },
    {
      name: 'CGV IPH Xuân Thủy',
      distance: '5.60Km',
      showtimes: ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'],
    },
    {
      name: 'CGV Vincom Royal City',
      distance: '6.80Km',
      showtimes: ['10:00', '12:30', '15:00', '17:30', '20:00'],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NHÀ GIÁ TIÊN</Text>
        <Feather name="navigation" size={24} color="#FF9900" />
      </View>

      {/* Date Selection */}
      <View style={styles.dateContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRow}
        >
          {dates.map((item, index) => (
            <TouchableOpacity key={index} style={styles.dateButton}>
              <Text style={styles.dayText}>{item.day}</Text>
              <Text style={styles.dateText}>{item.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cinemas & Showtimes */}
      <ScrollView style={styles.scrollView}>
        {cinemas.map((cinema, index) => (
          <View key={index} style={styles.cinemaCard}>
            <View style={styles.cinemaInfo}>
              <Text style={styles.cinemaName}>{cinema.name}</Text>
              <Text style={styles.distance}>{cinema.distance}</Text>
            </View>
            <View style={styles.showtimesRow}>
              {cinema.showtimes.map((time, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.timeButton}
                  onPress={() => navigation.navigate('SeatSelection', { time, cinema: cinema.name })}
                >
                  <Text style={styles.timeText}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const SeatSelectionScreen = ({ route, navigation }) => {
  const { time, cinema } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn ghế</Text>
        <View style={{ width: 24 }} /> {/* Placeholder để căn giữa tiêu đề */}
      </View>

      <View style={styles.seatSelectionContent}>
        <Text style={styles.info}>🎬 Rạp: {cinema}</Text>
        <Text style={styles.info}>⏰ Suất: {time}</Text>
        <Text style={styles.info}>👉 Trang chọn ghế sẽ làm tiếp!</Text>
      </View>
    </SafeAreaView>
  );
};

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

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: '#fff',
  paddingTop: 20, // Thêm khoảng cách phía trên tránh lấn vào status bar

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  // DATE SELECTION
  dateContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dateButton: {
    width: 60, // Vuông hơn, ngắn gọn
    height: 60,
    backgroundColor: '#FF9900',
    borderRadius: 8,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  dayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // CINEMA LIST
  cinemaCard: {
    backgroundColor: '#f7f7f7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cinemaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cinemaName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  distance: {
    color: '#FF9900',
    fontSize: 14,
  },

  showtimesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeButton: {
    backgroundColor: '#fff',
    borderColor: '#FF9900',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
  },
  timeText: {
    color: '#333',
    fontSize: 14,
  },

  // SEAT SELECTION SCREEN
  seatSelectionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
});
