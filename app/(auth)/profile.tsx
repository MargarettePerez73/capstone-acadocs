import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import InlineError from '@/components/ui/InlineError';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ColorPalette } from '@/constants/Colors';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { RoleLabels } from '@/constants/Roles';
import { usersAPI } from '@/services/api';

const THEME_OPTIONS: Array<{ mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { mode: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { mode: 'light', label: 'Light', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();
  const { colors, themeMode, setThemeMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState('');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const avatarUrl = usersAPI.avatarUrl(user?.photo);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/'); } },
    ]);
  };

  const startEditing = () => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setInfoError('');
    setEditing(true);
  };

  const handleSaveInfo = async () => {
    if (!user) return;
    if (!name.trim() || !email.trim()) {
      setInfoError('Name and email are required.');
      return;
    }
    setSavingInfo(true);
    setInfoError('');
    try {
      await usersAPI.updateProfile(user.id, { name: name.trim(), email: email.trim() });
      updateUser({ name: name.trim(), email: email.trim() });
      setEditing(false);
      toast.success('Profile updated', 'Your changes have been saved.');
    } catch (e: any) {
      setInfoError(e?.response?.data?.error ?? 'Could not save your changes.');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setSavingPassword(true);
    setPasswordError('');
    try {
      await usersAPI.changePassword(user.id, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      toast.success('Password changed', 'Your password has been updated.');
    } catch (e: any) {
      setPasswordError(e?.response?.data?.error ?? 'Could not change your password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.warning('Permission needed', 'Allow photo library access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0] || !user) return;

    const asset = result.assets[0];
    const ext = (asset.fileName?.split('.').pop() || asset.uri.split('.').pop() || 'jpg').toLowerCase();
    setUploadingPhoto(true);
    try {
      const res = await usersAPI.uploadPhoto(user.id, {
        uri: asset.uri,
        name: asset.fileName ?? `photo.${ext}`,
        type: asset.mimeType ?? `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      });
      updateUser({ photo: res.photo });
      toast.success('Photo updated', 'Your profile photo has been changed.');
    } catch (e: any) {
      toast.error('Upload failed', e?.response?.data?.error ?? 'Could not upload your photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    if (!user) return;
    Alert.alert('Remove Photo', 'Remove your profile photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          setUploadingPhoto(true);
          try {
            await usersAPI.removePhoto(user.id);
            updateUser({ photo: null });
            toast.success('Photo removed', 'Your profile photo has been removed.');
          } catch {
            toast.error('Could not remove photo', 'Please try again.');
          } finally {
            setUploadingPhoto(false);
          }
        },
      },
    ]);
  };

  const handleAvatarPress = () => {
    const options: any[] = [
      { text: 'Choose Photo', onPress: handlePickPhoto },
    ];
    if (user?.photo) options.push({ text: 'Remove Photo', style: 'destructive', onPress: handleRemovePhoto });
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Profile Photo', undefined, options);
  };

  return (
    <View style={styles.flex}>
      <Header title="Profile" showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileBlock}>
          <TouchableOpacity style={styles.avatarWrap} onPress={handleAvatarPress} disabled={uploadingPhoto} activeOpacity={0.8}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'U'}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="camera" size={14} color={colors.white} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>{user ? RoleLabels[user.role] : ''}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Account Details</Text>
            {!editing && (
              <TouchableOpacity onPress={startEditing} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="pencil-outline" size={16} color={colors.maroon.primary} />
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            <>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.text.muted} />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={colors.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <InlineError message={infoError} />

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => { setEditing(false); setInfoError(''); }}
                  disabled={savingInfo}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={handleSaveInfo} disabled={savingInfo}>
                  {savingInfo ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.saveBtnText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            [
              { icon: 'person-outline', label: 'Full Name', value: user?.name },
              { icon: 'mail-outline', label: 'Email', value: user?.email },
              { icon: 'shield-outline', label: 'Role', value: user ? RoleLabels[user.role] : '' },
            ].map((item: any) => (
              <View key={item.label} style={styles.detailRow}>
                <Ionicons name={item.icon} size={18} color={colors.maroon.primary} />
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              </View>
            ))
          )}
        </Card>

        <Card>
          <TouchableOpacity style={styles.cardHeader} onPress={() => setShowPasswordForm(v => !v)} activeOpacity={0.75}>
            <Text style={styles.cardTitle}>Change Password</Text>
            <Ionicons name={showPasswordForm ? 'chevron-up' : 'chevron-down'} size={16} color={colors.maroon.primary} />
          </TouchableOpacity>

          {showPasswordForm && (
            <>
              <Text style={styles.fieldLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                placeholderTextColor={colors.text.muted}
                secureTextEntry
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>New Password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password (min. 6 characters)"
                placeholderTextColor={colors.text.muted}
                secureTextEntry
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={colors.text.muted}
                secureTextEntry
              />
              <InlineError message={passwordError} />

              <TouchableOpacity style={[styles.actionBtn, styles.saveBtn, { marginTop: 6 }]} onPress={handleChangePassword} disabled={savingPassword}>
                {savingPassword ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.saveBtnText}>Update Password</Text>}
              </TouchableOpacity>
            </>
          )}
        </Card>

        <Card>
          <Text style={[styles.cardTitle, { marginBottom: 14 }]}>Appearance</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map(opt => {
              const active = themeMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  style={[styles.themeOption, active && styles.themeOptionActive]}
                  onPress={() => setThemeMode(opt.mode)}
                  activeOpacity={0.75}
                >
                  <Ionicons name={opt.icon} size={18} color={active ? colors.white : colors.maroon.primary} />
                  <Text style={[styles.themeOptionText, active && styles.themeOptionTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.status.missing} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 40, gap: 16 },
    profileBlock: {
      alignItems: 'center',
      paddingVertical: 28,
      backgroundColor: colors.surface,
      borderRadius: 12,
      elevation: 1,
      shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
    },
    avatarWrap: { marginBottom: 14, position: 'relative' },
    avatar: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: colors.maroon.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.maroon.muted },
    avatarText: { fontSize: 32, fontWeight: '700', color: colors.white },
    cameraBadge: {
      position: 'absolute', bottom: -2, right: -2,
      width: 26, height: 26, borderRadius: 13,
      backgroundColor: colors.maroon.primary,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: colors.surface,
    },
    name: { fontSize: 20, fontWeight: '800', color: colors.text.primary },
    role: { fontSize: 13, color: colors.maroon.primary, fontWeight: '600', marginTop: 4, marginBottom: 2 },
    email: { fontSize: 13, color: colors.text.muted },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    cardTitle: { fontSize: 13, fontWeight: '700', color: colors.text.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    detailInfo: { flex: 1 },
    detailLabel: { fontSize: 11, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
    detailValue: { fontSize: 14, color: colors.text.primary, fontWeight: '600', marginTop: 2 },

    fieldLabel: { fontSize: 11, fontWeight: '700', color: colors.text.primary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
    input: {
      borderWidth: 1.5, borderColor: colors.border, borderRadius: 10,
      paddingHorizontal: 14, paddingVertical: 11, fontSize: 14,
      color: colors.text.primary, backgroundColor: colors.background,
    },
    editActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
    actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    cancelBtn: { backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border },
    cancelBtnText: { fontSize: 14, fontWeight: '700', color: colors.text.secondary },
    saveBtn: { backgroundColor: colors.maroon.primary },
    saveBtnText: { fontSize: 14, fontWeight: '700', color: colors.white },

    themeRow: { flexDirection: 'row', gap: 10 },
    themeOption: {
      flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6,
      paddingVertical: 14, borderRadius: 10,
      borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background,
    },
    themeOptionActive: { backgroundColor: colors.maroon.primary, borderColor: colors.maroon.primary },
    themeOptionText: { fontSize: 12, fontWeight: '600', color: colors.text.secondary },
    themeOptionTextActive: { color: colors.white, fontWeight: '700' },

    logoutBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
      backgroundColor: colors.status.missing + '1A', borderRadius: 10, paddingVertical: 14,
      borderWidth: 1, borderColor: colors.status.missing + '40',
    },
    logoutText: { fontSize: 15, fontWeight: '600', color: colors.status.missing },
  });
}
