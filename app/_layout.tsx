import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import { Tabs } from "expo-router";
export default function RootLayout() {
  return (

    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#000080"
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 24,
          fontFamily: 'Times New Roman',
        }
      }}>

      <Tabs.Screen name="index" options={{
        title: "Home", tabBarIcon: ({ color, size }) => (<Ionicons name="home" size={size} color={color} />
        ),
      }}
      />
      <Tabs.Screen name="projects" options={{
        title: "Projects", tabBarIcon: ({ color, size }) => (<Ionicons name="file-tray-full-outline" size={size} color={color} />
        ),
      }}
      />

    </Tabs>

  );
}
