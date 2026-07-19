import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, Platform, StatusBar, ScrollView,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { Colors } from '@/constants/Colors';
import { RoleLabels } from '@/constants/Roles';

const DRAWER_WIDTH = 290;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface NavItem {
  label: string;
  subtitle: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Chat', subtitle: 'Messages & correspondence', route: '/(auth)/(tabs)/chat', icon: 'chatbubbles-outline' },
  { label: 'Documents', subtitle: 'View & download documents', route: '/(auth)/(tabs)/documents', icon: 'document-text-outline' },
];

export default function AppDrawer() {
  const { user, logout } = useAuth();
  const { isOpen, closeDrawer } = useDrawer();
  const pathname = usePathname();

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: isOpen ? 0 : -DRAWER_WIDTH,
        useNativeDriver: true,
        tension: 90,
        friction: 14,
      }),
      Animated.timing(backdropOpacity, {
        toValue: isOpen ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  const navigate = (route: string) => {
    closeDrawer();
    setTimeout(() => router.push(route as any), 180);
  };

  const handleLogout = () => {
    closeDrawer();
    setTimeout(() => { logout(); router.replace('/'); }, 200);
  };

  const getInitials = (name: string) =>
    name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  if (!isOpen) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} pointerEvents={isOpen ? 'auto' : 'none'}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeDrawer} activeOpacity={1} />
      </Animated.View>

      {/* Drawer Panel */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        {/* Header */}
        <View style={styles.drawerHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user ? getInitials(user.name) : 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{user?.name ?? 'User'}</Text>
            <Text style={styles.userRole}>{user ? RoleLabels[user.role] : ''}</Text>
            {user?.subject && <Text style={styles.userDept}>{user.subject} · {user.gradeLevel}</Text>}
            {user?.department && !user?.subject && <Text style={styles.userDept}>{user.department}</Text>}
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={closeDrawer}>
            <Ionicons name="close" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Nav Items */}
        <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
          <Text style={styles.navSection}>Navigation</Text>
          {NAV_ITEMS.map(item => {
            const isActive = pathname.includes(item.route.replace('/(auth)', '').replace('/(tabs)', ''));
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => navigate(item.route)}
                activeOpacity={0.72}
              >
                <View style={[styles.navIconWrap, isActive && styles.navIconWrapActive]}>
                  <Ionicons name={item.icon} size={19} color={isActive ? Colors.white : Colors.maroon.primary} />
                </View>
                <View style={styles.navText}>
                  <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
                  <Text style={[styles.navSub, isActive && styles.navSubActive]} numberOfLines={1}>{item.subtitle}</Text>
                </View>
                {isActive && <Ionicons name="chevron-forward" size={14} color={Colors.white} />}
              </TouchableOpacity>
            );
          })}

          <View style={styles.divider} />
          <Text style={styles.navSection}>Account</Text>

          <TouchableOpacity style={styles.navItem} onPress={() => navigate('/(auth)/profile')} activeOpacity={0.72}>
            <View style={styles.navIconWrap}>
              <Ionicons name="person-outline" size={19} color={Colors.maroon.primary} />
            </View>
            <View style={styles.navText}>
              <Text style={styles.navLabel}>My Profile</Text>
              <Text style={styles.navSub}>View account details</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Logout Footer */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <View style={styles.logoutInner}>
            <Ionicons name="log-out-outline" size={20} color={Colors.status.missing} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </View>
          <Text style={styles.logoutSub}>Acadocs v1.0</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.white,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 4, height: 0 },
  },

  /* Header */
  drawerHeader: {
    backgroundColor: Colors.maroon.primary,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { color: Colors.white, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  userRole: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  userDept: { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 },
  closeBtn: { padding: 4, marginTop: -2 },

  /* Nav */
  navList: { flex: 1, paddingTop: 8 },
  navSection: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 8,
    borderRadius: 10,
    gap: 12,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: Colors.maroon.primary,
  },
  navIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.maroon.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  navText: { flex: 1 },
  navLabel: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  navLabelActive: { color: Colors.white },
  navSub: { fontSize: 11, color: Colors.text.muted, marginTop: 1 },
  navSubActive: { color: 'rgba(255,255,255,0.7)' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 18, marginVertical: 8 },

  /* Logout */
  logoutBtn: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 2,
  },
  logoutInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoutText: { fontSize: 14, fontWeight: '700', color: Colors.status.missing },
  logoutSub: { fontSize: 10, color: Colors.text.muted, marginTop: 4, marginLeft: 30 },
});
