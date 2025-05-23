import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider } from './contexts/User/UserContext';
import Home from './screens/Home/Home';
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import ForgotPasswordScreen from './screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/Auth/ResetPasswordScreen';
import MemberScreen from './screens/User/MemberScreen';
import AccountInfoScreen from './screens/User/AccountInfoScreen';
import MovieDetailsScreen from './screens/Home/MovieDetailsScreen';
import Datvetheophim from './screens/Booking/Datvetheophim';
import ChonPhimTheoRap from './screens/Booking/ChonPhimTheoRap';
import SpecialExperiencesUI from './screens/SpecialExperiences/SpecialExperiencesUI';
import SweetBox from './screens/SpecialExperiences/SweetBox';
import TinMoiVaUuDai from './screens/Promotions/TinMoiVaUuDai';
import RapPhimMTB from './screens/Cinemas/RapPhimMTB';
import MovieBookingScreen from './screens/Booking/MovieBookingScreen';
import ChonRap_TheoKhuVuc from './screens/Booking/ChonRap_TheoKhuVuc';
import MTBStoreChonDoUong from './screens/User/MTBStore(ChonDoUong)';
import ProductDetail from './screens/User/ProductDetail';
import SoDoGheNgoi1 from "./screens/Booking/SoDoGheNgoi1";
import TinMoiUuDaiTatCa from "./screens/Promotions/TinMoi&UuDai(TatCa)";
import tintucvauudai from "./screens/Promotions/Tintucvauudai";
import DatVeThanhToan from "./screens/Booking/DatVeThanhToan";
import VeCuaToi from "./screens/User/VeCuaToi";
import ThongBao from "./screens/User/ThongBao";
import Map from './screens/Booking/Map';
import ThanhToan from './screens/Booking/ThanhToan';
import ThanhToanQR from './screens/Booking/ThanhToanQR';
import Vorcher from './screens/User/VoucherScreen';
import Setting from './screens/User/SettingScreen';
const Stack = createStackNavigator();

export default function App() {
    return (
        <UserProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName='Home'>
                    <Stack.Screen
                        name='Home'
                        component={Home}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='Login'
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='Register'
                        component={RegisterScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='ForgotPassword'
                        component={ForgotPasswordScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='ResetPassword'
                        component={ResetPasswordScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='Member'
                        component={MemberScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='AccountInfo'
                        component={AccountInfoScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='MovieDetailsScreen'
                        component={MovieDetailsScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='Datvetheophim'
                        component={Datvetheophim}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='ChonPhimTheoRap'
                        component={ChonPhimTheoRap}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='SpecialExperiencesUI'
                        component={SpecialExperiencesUI}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='SweetBox'
                        component={SweetBox}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='TinMoiVaUuDai'
                        component={TinMoiVaUuDai}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='RapPhimMTB'
                        component={RapPhimMTB}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='MovieBookingScreen'
                        component={MovieBookingScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='ChonRap_TheoKhuVuc'
                        component={ChonRap_TheoKhuVuc}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='MTBStoreChonDoUong'
                        component={MTBStoreChonDoUong}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                    name ="ProductDetail"
                    component={ProductDetail}
                    options={{ headerShown: false }}
                     />
                    <Stack.Screen
                        name="DatVeThanhToan"
                        component={DatVeThanhToan}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="SoDoGheNgoi1"
                        component={SoDoGheNgoi1}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="TinMoiUuDaiTatCa"
                        component={TinMoiUuDaiTatCa}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Tintucvauudai"
                        component={tintucvauudai}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="VeCuaToi"
                        component={VeCuaToi}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ThongBao"
                        component={ThongBao}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Map"
                        component={Map}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ThanhToan"
                        component={ThanhToan}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ThanhToanQR"
                        component={ThanhToanQR}
                        options={{ headerShown: false }} />
                    <Stack.Screen
                        name="Vorcher"
                        component={Vorcher}
                        options={{ headerShown: false }} />
                    <Stack.Screen
                        name="Setting"
                        component={Setting}
                        options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </UserProvider>
    );
}