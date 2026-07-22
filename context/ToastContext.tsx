import React, {
  createContext, useContext, useState, useCallback, useRef, ReactNode,
} from 'react';
import { Animated, View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_COLORS: Record<ToastType, { bg: string; icon: string; bar: string }> = {
  success: { bg: '#1B5E20', icon: 'checkmark-circle', bar: '#4CAF50' },
  error:   { bg: '#B71C1C', icon: 'close-circle', bar: '#EF5350' },
  info:    { bg: '#0D47A1', icon: 'information-circle', bar: '#42A5F5' },
  warning: { bg: '#E65100', icon: 'alert-circle', bar: '#FFA726' },
};

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(1)).current;
  const config = TOAST_COLORS[toast.type];

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    Animated.timing(progress, {
      toValue: 0,
      duration: 3200,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -120, duration: 280, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start(onDone);
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={[styles.toast, { backgroundColor: config.bg, opacity, transform: [{ translateY }] }]}>
      <View style={styles.toastContent}>
        <Ionicons name={config.icon as any} size={22} color="#fff" style={{ marginRight: 10, flexShrink: 0 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.toastTitle}>{toast.title}</Text>
          {toast.message ? <Text style={styles.toastMessage}>{toast.message}</Text> : null}
        </View>
      </View>
      <Animated.View style={[styles.toastBar, { width: progressWidth, backgroundColor: config.bar }]} />
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev.slice(-2), { id, type, title, message }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value: ToastContextValue = {
    showToast,
    success: (t, m) => showToast('success', t, m),
    error: (t, m) => showToast('error', t, m),
    info: (t, m) => showToast('info', t, m),
    warning: (t, m) => showToast('warning', t, m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 8 : 52,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'none',
  },
  toast: {
    width: '92%',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  toastTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  toastMessage: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  toastBar: {
    height: 3,
    alignSelf: 'flex-start',
  },
});
