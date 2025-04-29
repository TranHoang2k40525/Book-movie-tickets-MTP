import React, { useContext } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../contexts/ThemeContext";
import { LanguageContext } from "../../contexts/LanguageContext";

export default function SettingScreen({ navigation }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);

  return (
    <View style={[styles.container, theme === "dark" ? styles.darkBg : styles.lightBg]}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme === "dark" ? "#fff" : "#333"} />
        </TouchableOpacity>
        <Text style={[styles.title, theme === "dark" ? styles.darkText : styles.lightText]}>
          {language === "vi" ? "Cài đặt" : "Settings"}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, theme === "dark" ? styles.darkText : styles.lightText]}>
          {language === "vi" ? "Tuỳ chọn giao diện" : "Appearance"}
        </Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLabelRow}>
            <MaterialCommunityIcons name="theme-light-dark" size={24} color={theme === "dark" ? "#fff" : "#333"} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.settingLabel, theme === "dark" ? styles.darkText : styles.lightText]}>
                {language === "vi" ? "Chế độ nền" : "Theme"}
              </Text>
              <Text style={styles.settingDesc}>
                {language === "vi" ? "Chuyển đổi giữa nền sáng và tối" : "Switch between light and dark mode"}
              </Text>
            </View>
          </View>
          <View style={styles.switchRow}>
            <Switch
              value={theme === "dark"}
              onValueChange={toggleTheme}
              thumbColor={theme === "dark" ? "#fff" : "#333"}
              trackColor={{ false: "#ccc", true: "#555" }}
            />
            <Text style={[styles.themeText, theme === "dark" ? styles.darkText : styles.lightText]}>
              {theme === "dark" ? (language === "vi" ? "Tối" : "Dark") : (language === "vi" ? "Sáng" : "Light")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, theme === "dark" ? styles.darkText : styles.lightText]}>
          {language === "vi" ? "Ngôn ngữ" : "Language"}
        </Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLabelRow}>
            <Ionicons name="language" size={24} color={theme === "dark" ? "#fff" : "#333"} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.settingLabel, theme === "dark" ? styles.darkText : styles.lightText]}>
                {language === "vi" ? "Ngôn ngữ ứng dụng" : "App language"}
              </Text>
              <Text style={styles.settingDesc}>
                {language === "vi" ? "Chọn tiếng Việt hoặc tiếng Anh" : "Choose Vietnamese or English"}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
            <Text style={styles.languageText}>
              {language === "vi" ? "Tiếng Việt" : "English"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Có thể mở rộng thêm các mục cài đặt khác ở đây */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  settingLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingDesc: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E57373",
    borderRadius: 20,
    marginLeft: 10,
  },
  languageText: {
    color: "#fff",
    fontWeight: "bold",
  },
  themeText: {
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 15,
  },
  darkBg: {
    backgroundColor: "#222",
  },
  lightBg: {
    backgroundColor: "#fff",
  },
  darkText: {
    color: "#fff",
  },
  lightText: {
    color: "#222",
  },
});
