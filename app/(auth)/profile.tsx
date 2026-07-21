import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { RoleLabels } from '@/constants/Roles';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/'); } },
    ]);
  };

  return (
    <View style={styles.flex}>
      <Header title="Profile" showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'U'}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>{user ? RoleLabels[user.role] : ''}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Account Details</Text>
          {[
            { icon: 'person-outline', label: 'Full Name', value: user?.name },
            { icon: 'mail-outline', label: 'Email', value: user?.email },
            { icon: 'shield-outline', label: 'Role', value: user ? RoleLabels[user.role] : '' },
          ].filter(Boolean).map((item: any) => (
            <View key={item.label} style={styles.detailRow}>
              <Ionicons name={item.icon as any} size={18} color={Colors.maroon.primary} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={Colors.status.missing} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  profileBlock: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.maroon.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.white },
  name: { fontSize: 20, fontWeight: '800', color: Colors.text.primary },
  role: { fontSize: 13, color: Colors.maroon.primary, fontWeight: '600', marginTop: 4, marginBottom: 2 },
  email: { fontSize: 13, color: Colors.text.muted },
  cardTitle: { fontSize: 13, fontWeight: '700', color: Colors.text.primary, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailInfo: { flex: 1 },
  detailLabel: { fontSize: 11, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  detailValue: { fontSize: 14, color: Colors.text.primary, fontWeight: '600', marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#FFEBEE', borderRadius: 10, paddingVertical: 14,
    borderWidth: 1, borderColor: '#FFCDD2',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.status.missing },
});
