import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { UserProvider } from "./User/UserContext";
import Home from "./Home";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import ForgotPasswordScreen from "./ForgotPasswordScreen";
import ResetPasswordScreen from "./ResetPasswordScreen";
import MemberScreen from "./MemberScreen";
import AccountInfoScreen from "./AccountInfoScreen";
import MovieDetailsScreen from "./MovieDetailsScreen";
import Datvetheophim from "./Datvetheophim";
import ChonPhimTheoRap from "./ChonPhimTheoRap";
import SpecialExperiencesUI from "./SpecialExperiencesUI";
import SweetBox from "./SweetBox";
import TinMoiVaUuDai from "./TinMoiVaUuDai"; 
import RapPhimMTB from "./RapPhimMTB";
const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Member"
            component={MemberScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AccountInfo"
            component={AccountInfoScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MovieDetailsScreen"
            component={MovieDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Datvetheophim"
            component={Datvetheophim}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChonPhimTheoRap"
            component={ChonPhimTheoRap}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SpecialExperiencesUI"
            component={SpecialExperiencesUI}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SweetBox"
            component={SweetBox}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TinMoiVaUuDai"
            component={TinMoiVaUuDai}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RapPhimMTB"
            component={RapPhimMTB}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
