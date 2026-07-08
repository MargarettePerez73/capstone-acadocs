import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

// ─── Role → Tabs ──────────────────────────────────────────────────────────────
// Principal : Dashboard | Submissions (monitor) | MPS       | Reports | Chat
// Teacher   : Dashboard | Submit Docs           | My MPS    | Room Audit | Chat
// ADAS      : Dashboard | Time Records          | DepEd Docs            | Chat
// Secretary : Dashboard | Doc Links                         | Chat
// ─────────────────────────────────────────────────────────────────────────────

export default function TabsLayout() {
  const { user } = useAuth();
  const role = user?.role;

  const isPrincipal = role === 'principal';
  const isTeacher   = role === 'teacher';
  const isAdas      = role === 'adas';
  const isSecretary = role === 'secretary';

  // Returns null (hidden) or undefined (visible in tab bar)
  const hidden = (condition: boolean) => (condition ? null : undefined);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.maroon.primary,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 82 : 64,
          paddingBottom: Platform.OS === 'ios' ? 22 : 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      {/* ── Dashboard — all roles ── */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* ── Submissions — Principal & Teacher only ── */}
      <Tabs.Screen
        name="submissions"
        options={{
          title: isTeacher ? 'Submit Docs' : 'Submissions',
          href: hidden(isAdas || isSecretary),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'file-document' : 'file-document-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* ── MPS — Principal & Teacher only ── */}
      <Tabs.Screen
        name="mps"
        options={{
          title: isTeacher ? 'My MPS' : 'MPS',
          href: hidden(isAdas || isSecretary),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* ── Reports — Principal only ── */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          href: hidden(!isPrincipal),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* ── Room Audit — Teacher only ── */}
      <Tabs.Screen
        name="room-audit"
        options={{
          title: 'Room Audit',
          href: hidden(!isTeacher),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'door-open' : 'door'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* ── Time Records — ADAS only ── */}
      <Tabs.Screen
        name="time-records"
        options={{
          title: 'Time Records',
          href: hidden(!isAdas),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* ── DepEd Docs — ADAS only ── */}
      <Tabs.Screen
        name="deped-docs"
        options={{
          title: 'DepEd Docs',
          href: hidden(!isAdas),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'file-certificate' : 'file-certificate-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* ── Doc Links — Secretary only ── */}
      <Tabs.Screen
        name="notices"
        options={{
          title: 'Doc Links',
          href: hidden(!isSecretary),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'link-box' : 'link-box-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* ── Chat — all roles ── */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
