import { Tabs } from "expo-router";
import { BookOpen, Calendar, Dumbbell } from "lucide-react-native";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#10b981",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          height: Platform.OS === "ios" ? 88 : 65,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Entrenar",
          tabBarIcon: ({ color }) => <Dumbbell color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Actividad",
          tabBarIcon: ({ color }) => <Calendar color={color} />,
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: "Rutinas",
          tabBarIcon: ({ color }) => <BookOpen color={color} />,
        }}
      />
    </Tabs>
  );
}
