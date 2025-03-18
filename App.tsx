import React from "react";
import { SafeAreaView } from "react-native";
import HomeScreen from "./HomeScreen"; // Import file HomeScreen

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeScreen />
    </SafeAreaView>
  );
}
