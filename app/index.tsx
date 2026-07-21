import InlineError from '@/components/ui/InlineError';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';

function validate(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};
  if (!email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  return errors;
}

export default function LoginScreen() {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const getFieldErrors = () => validate(email, password);

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validate(email, password));
  };

  const handleLogin = async () => {
    const validationErrors = validate(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ email: true, password: true });
      toast.warning('Check your inputs', 'Please fix the highlighted fields.');
      return;
    }

    setLoading(true);
    toast.info('Authenticating...', 'Verifying your credentials.');
    try {
      const success = await login(email.trim(), password);
      if (success) {
        toast.success('Login successful', 'Welcome back!');
        router.replace('/(auth)/(tabs)/chat');
      } else {
        toast.error('Login failed', 'Incorrect email or password. Please try again.');
        setErrors({ password: 'Incorrect email or password.' });
        setTouched({ email: true, password: true });
      }
    } catch {
      toast.error('Connection error', 'Unable to reach the server. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  const emailError = touched.email ? errors.email : undefined;
  const passwordError = touched.password ? errors.password : undefined;

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
          <Text style={styles.appName}>Acadocs</Text>
          <Text style={styles.tagline}>Academic Submission{'\n'}& Monitoring System</Text>
          <View style={styles.heroDivider} />
          <Text style={styles.schoolLabel}>School Year 2024 — 2025</Text>
        </View>

        {/* ── Form Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSub}>Use your institutional email and password.</Text>

          {/* Email Field */}
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={[styles.inputRow, emailError && styles.inputRowError]}>
            <Ionicons
              name="mail-outline"
              size={17}
              color={emailError ? Colors.status.missing : Colors.text.muted}
            />
            <TextInput
              style={styles.inputField}
              value={email}
              onChangeText={v => { setEmail(v); if (touched.email) setErrors(validate(v, password)); }}
              onBlur={() => handleBlur('email')}
              placeholder="yourname@school.edu"
              placeholderTextColor={Colors.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {email.length > 0 && !emailError && touched.email && (
              <Ionicons name="checkmark-circle" size={16} color={Colors.status.submitted} />
            )}
          </View>
          <InlineError message={emailError} />

          {/* Password Field */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Password</Text>
          <View style={[styles.inputRow, passwordError && styles.inputRowError]}>
            <Ionicons
              name="lock-closed-outline"
              size={17}
              color={passwordError ? Colors.status.missing : Colors.text.muted}
            />
            <TextInput
              style={styles.inputField}
              value={password}
              onChangeText={v => { setPassword(v); if (touched.password) setErrors(validate(email, v)); }}
              onBlur={() => handleBlur('password')}
              placeholder="Enter your password"
              placeholderTextColor={Colors.text.muted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(v => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={loading}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={17}
                color={Colors.text.muted}
              />
            </TouchableOpacity>
          </View>
          <InlineError message={passwordError} />

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnLoading]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.82}
          >
            {loading ? (
              <View style={styles.loginBtnInner}>
                <ActivityIndicator color={Colors.white} size="small" />
                <Text style={styles.loginBtnText}>Authenticating...</Text>
              </View>
            ) : (
              <View style={styles.loginBtnInner}>
                <Text style={styles.loginBtnText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>
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
  root: { flex: 1, backgroundColor: Colors.maroon.primary },
  scroll: { flexGrow: 1 },

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
  appName: { fontSize: 34, fontWeight: '800', color: Colors.white, letterSpacing: 1.5, marginBottom: 6 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.72)', textAlign: 'center', lineHeight: 21 },
  heroDivider: { width: 36, height: 2, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 2, marginVertical: 14 },
  schoolLabel: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },

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
  cardTitle: { fontSize: 21, fontWeight: '800', color: Colors.text.primary, marginBottom: 5 },
  cardSub: { fontSize: 13, color: Colors.text.secondary, marginBottom: 24, lineHeight: 18 },

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
  inputRowError: {
    borderColor: Colors.status.missing,
    backgroundColor: '#FFF5F5',
  },
  inputField: { flex: 1, fontSize: 15, color: Colors.text.primary },

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
  loginBtnLoading: { opacity: 0.8 },
  loginBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loginBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.maroon.dark,
    paddingVertical: 14,
  },
  footerText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3 },
});
