import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Menu from '../../components/Menu'; // Thêm import Menu

// Hàm tính khoảng cách bằng công thức Haversine
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Khoảng cách (km)
};

export default function Map({ route, navigation }) {
  const { cinemaId, cinemaName, cinemaLat, cinemaLng } = route.params || {};

  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Lấy vị trí người dùng
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Không thể lấy vị trí hiện tại, vui lòng cấp quyền!');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (err) {
        setLocationError('Lỗi khi lấy vị trí: ' + err.message);
      }
    })();
  }, []);

  // Tính khoảng cách
  useEffect(() => {
    const currentLat = selectedLocation ? selectedLocation.latitude : userLocation?.latitude;
    const currentLng = selectedLocation ? selectedLocation.longitude : userLocation?.longitude;

    if (currentLat && currentLng && cinemaLat && cinemaLng) {
      const dist = getDistanceFromLatLonInKm(
        currentLat,
        currentLng,
        cinemaLat,
        cinemaLng
      ).toFixed(2);
      setDistance(dist);
    }
  }, [userLocation, selectedLocation, cinemaLat, cinemaLng]);

  // Vùng bản đồ
  const region = {
    latitude: cinemaLat || 21.0285,
    longitude: cinemaLng || 105.8542,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Xử lý nhấn vào bản đồ
  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông tin khu vực</Text>
        <View style={styles.menuButtonContainer}>
          <Menu navigation={navigation} />
        </View>
      </View>

      <MapView
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
      >
        {cinemaLat && cinemaLng && (
          <Marker
            coordinate={{ latitude: cinemaLat, longitude: cinemaLng }}
            title={cinemaName}
            description="Vị trí rạp"
            pinColor="red"
          />
        )}

        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Bạn"
            description="Vị trí hiện tại"
            pinColor="blue"
          />
        )}

        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Vị trí chọn"
            description="Vị trí mới của bạn"
            pinColor="green"
          />
        )}
      </MapView>

      {cinemaName && cinemaLat && cinemaLng ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>🎬 Rạp: {cinemaName}</Text>
          <Text style={styles.infoText}>📍 Vĩ độ: {cinemaLat}</Text>
          <Text style={styles.infoText}>📍 Kinh độ: {cinemaLng}</Text>
          {distance && (
            <Text style={styles.infoText}>📏 Khoảng cách: {distance} km</Text>
          )}
        </View>
      ) : (
        <Text style={styles.infoText}>Chưa có thông tin rạp</Text>
      )}

      {locationError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity
            onPress={async () => {
              setLocationError(null);
              setUserLocation(null);
              setDistance(null);
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status === 'granted') {
                try {
                  const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                  setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  });
                } catch (err) {
                  setLocationError('Lỗi khi lấy vị trí: ' + err.message);
                }
              }
            }}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() =>
          navigation.navigate('ChonRap_TheoKhuVuc', {
            cinemaId,
            cinemaName,
          })
        }
      >
        <Text style={styles.continueButtonText}>Tiếp Tục</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Cân đối các phần tử
    paddingVertical: 10,
    marginTop: 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1, // Tiêu đề chiếm không gian giữa
  },
  menuButtonContainer: {
    padding: 8, // Đảm bảo nút menu có khoảng cách
  },
  map: {
    width: '100%',
    height: Dimensions.get('window').height * 0.5,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoBox: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 2,
    color: 'black',
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  errorText: {
    color: '#721c24',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryText: {
    color: '#004085',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  continueButton: {
    backgroundColor: '#ff4d6d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});