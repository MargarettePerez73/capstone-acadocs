import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, DEMO_ACCOUNTS } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        router.replace('/(auth)/(tabs)/dashboard');
      } else {
        Alert.alert('Login Failed', 'Incorrect email or password. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setShowDemo(false);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <Ionicons name="school" size={42} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.appName}>AcadTrack</Text>
          <Text style={styles.tagline}>Academic Submission{'\n'}& Monitoring System</Text>
          <View style={styles.heroDivider} />
          <Text style={styles.schoolLabel}>School Year 2024 — 2025</Text>
        </View>

        {/* ── Form Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In to Your Account</Text>
          <Text style={styles.cardSub}>Use your institutional email and password.</Text>

          {/* Email */}
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={17} color={Colors.text.muted} />
            <TextInput
              style={styles.inputField}
              value={email}
              onChangeText={setEmail}
              placeholder="yourname@school.edu"
              placeholderTextColor={Colors.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={17} color={Colors.text.muted} />
            <TextInput
              style={styles.inputField}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={Colors.text.muted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={17} color={Colors.text.muted} />
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnLoading]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.82}
          >
            {loading
              ? <Text style={styles.loginBtnText}>Authenticating...</Text>
              : (
                <View style={styles.loginBtnInner}>
                  <Text style={styles.loginBtnText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                </View>
              )
            }
          </TouchableOpacity>

          {/* Demo Credentials Toggle */}
          <TouchableOpacity style={styles.demoToggle} onPress={() => setShowDemo(v => !v)}>
            <Ionicons name="information-circle-outline" size={15} color={Colors.maroon.primary} />
            <Text style={styles.demoToggleText}>
              {showDemo ? 'Hide' : 'Show'} demo credentials
            </Text>
            <Ionicons name={showDemo ? 'chevron-up' : 'chevron-down'} size={13} color={Colors.maroon.primary} />
          </TouchableOpacity>

          {/* Demo Accounts Grid */}
          {showDemo && (
            <View style={styles.demoGrid}>
              <Text style={styles.demoGridTitle}>Tap a role to auto-fill credentials</Text>
              {DEMO_ACCOUNTS.map(acc => (
                <TouchableOpacity
                  key={acc.email}
                  style={styles.demoCard}
                  onPress={() => fillCredentials(acc)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.demoAvatar, { backgroundColor: acc.color }]}>
                    <Text style={styles.demoAvatarText}>{acc.initials}</Text>
                  </View>
                  <View style={styles.demoCardInfo}>
                    <Text style={styles.demoCardName}>{acc.label}</Text>
                    <Text style={styles.demoCardRole}>{acc.role}</Text>
                    <Text style={styles.demoCardEmail}>{acc.email}</Text>
                  </View>
                  <View style={[styles.demoBadge, { backgroundColor: acc.color + '18' }]}>
                    <Text style={[styles.demoBadgeText, { color: acc.color }]}>{acc.password}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={12} color="rgba(255,255,255,0.5)" />
          <Text style={styles.footerText}>Secured institutional access only</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.maroon.primary,
  },
  scroll: {
    flexGrow: 1,
  },

  /* Hero */
  hero: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 72 : 54,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  logoRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 21,
  },
  heroDivider: {
    width: 36,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 2,
    marginVertical: 14,
  },
  schoolLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  /* Card */
  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flex: 1,
    minHeight: 420,
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  cardSub: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 24,
    lineHeight: 18,
  },

  /* Fields */
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
  },

  /* Login Button */
  loginBtn: {
    backgroundColor: Colors.maroon.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 16,
    elevation: 3,
    shadowColor: Colors.maroon.dark,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  loginBtnLoading: { opacity: 0.7 },
  loginBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loginBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  /* Demo Toggle */
  demoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  demoToggleText: {
    fontSize: 13,
    color: Colors.maroon.primary,
    fontWeight: '600',
  },

  /* Demo Grid */
  demoGrid: {
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: Colors.maroon.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  demoGridTitle: {
    fontSize: 11,
    color: Colors.text.muted,
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  demoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoAvatarText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  demoCardInfo: {
    flex: 1,
  },
  demoCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  demoCardRole: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginTop: 1,
  },
  demoCardEmail: {
    fontSize: 10,
    color: Colors.text.muted,
    marginTop: 1,
  },
  demoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  demoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.maroon.dark,
    paddingVertical: 14,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.3,
  },
});
