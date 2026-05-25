import { Tabs } from "expo-router";
import { BookOpen, Calendar, Dumbbell } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Entrenar",
          tabBarIcon: ({ size, color }) => (
            <Dumbbell size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Actividad",
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: "Rutinas",
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
