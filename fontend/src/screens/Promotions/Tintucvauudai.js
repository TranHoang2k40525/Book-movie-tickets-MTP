import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';

export default function App() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16, marginTop: 20 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <TouchableOpacity onPress={() => Alert.alert('Quay lại')}
          style={{ padding: 8, borderRadius: 8, backgroundColor: 'white' }}>
          <Text style={{ fontSize: 35, color: 'red', fontWeight:"bold"}}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'black', marginLeft:"-140", marginTop:"13"}}>Tin mới & Ưu đãi</Text>
        <TouchableOpacity onPress={() => Alert.alert('Mở menu')}
          style={{ padding: 8, borderRadius: 8, backgroundColor: 'white' }}>
          <Text style={{ fontSize: 24, color: 'red', fontWeight:"bold" }}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <Image
        source={require("../../assets/kk1.png")}
        style={{ width: '100%', height: 150, borderRadius: 8 }}
        resizeMode="cover"
      />

      {/* Content */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 16 ,marginLeft:"30"}}>
        MTB CULTURE DAY - THỨ HAI CUỐI CÙNG CỦA THÁNG ĐÃ TRỞ LẠI !!!
      </Text>
      <Text style={{ fontSize: 14, marginVertical: 8,fontWeight:'bold' }}>Culture Day Tháng 2</Text>
      <Text style={{ fontSize: 14, color: '#555' }}>
  Với sự ủng hộ và tin tưởng của khách hàng trong nhiều năm qua, MTB đã và đang thực hiện mục tiêu mang điện ảnh đến gần hơn với tất cả mọi người. Xuất phát từ tinh thần này, với ngày Thứ 2 cuối cùng của mỗi tháng, MTB áp dụng chính sách giá vé đặc biệt nhằm tri ân khách hàng, đồng giá vé chỉ từ 55,00Đ, chi tiết giá vé ápd dụng
      </Text>
      
      <TouchableOpacity style={{ marginTop: 16 }}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}>Xem lại chi tiết</Text>
      </TouchableOpacity>

      {/* Điều khoản */}
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 16 }}>Điều khoản và điều kiện:</Text>
      <Text style={{ fontSize: 14, color: '#555', marginVertical: 4 }}>- Áp dụng cho khách hàng đặt vé trực tuyến (Online hoặc quầy thanh toán).</Text>
      <Text style={{ fontSize: 14, color: '#555', marginVertical: 4 }}>- Áp dụng cho mọi loại ghế ( Bao gồm ghế SweetBox).</Text>
      <Text style={{ fontSize: 14, color: '#555', marginVertical: 4 }}>- Giá MTB Combo chỉ áp dụng theo mua tại quầy.</Text>
      <Text style={{ fontSize: 14, color: '#555', marginVertical: 4 }}> -  Giá MTB Combo ở trên chưa bao gồm nâng cấp vị phô mai và caramel.</Text>
            <Text style={{ fontSize: 14, color: '#555', marginVertical: 4 }}> - Không áp dụng cho mua vé nhóm (Group Sales), Suất Chiếu Đặc Biệt.</Text>
                  <Text style={{ fontSize: 14, color: '#555', marginVertical: 4 }}> -  Không áp dụng cho phòng chiếu ULTRA 4DX.</Text>
                        <Text style={{ fontSize: 14, color: '#555', marginVertical: 4 }}> -  Không áp dụng cho các ngày Lễ, Tết.</Text>
      
     
      
      {/* Đặt vé */}
      <TouchableOpacity
        style={{ backgroundColor: 'red', padding: 14, borderRadius: 30,  marginTop: 16, alignItems: 'center' , width:'250', marginLeft:'40'}}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>ĐẶT VÉ NGAY >></Text>
                           
        
      </TouchableOpacity>
      <Text style={{ fontSize: 14, color: '#555', marginVertical: 4 }}> </Text>
      <Text style={{ fontSize: 14, color: '#555', marginVertical: 4 }}> </Text>
    </ScrollView>
  );
}