import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorPalette } from '@/constants/Colors';
import { useThemeColors } from '@/context/ThemeContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Shows hamburger menu icon (for main tab screens) */
  showMenu?: boolean;
  onMenuPress?: () => void;
  /** Shows back arrow (for pushed / modal screens) */
  showBack?: boolean;
  onBack?: () => void;
  /** Optional right-side icon button */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  /** Second right-side icon button */
  rightIcon2?: keyof typeof Ionicons.glyphMap;
  onRightPress2?: () => void;
  /** Unread badge count for the right icon */
  badge?: number;
}

export default function Header({
  title,
  subtitle,
  showMenu,
  onMenuPress,
  showBack,
  onBack,
  rightIcon,
  onRightPress,
  rightIcon2,
  onRightPress2,
  badge,
}: HeaderProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.maroon.dark} />
      <View style={styles.row}>

        {/* Left button */}
        {showMenu ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onMenuPress} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Ionicons name="menu" size={24} color={colors.white} />
          </TouchableOpacity>
        ) : showBack ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onBack} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        {/* Right buttons */}
        <View style={styles.rightGroup}>
          {rightIcon2 && (
            <TouchableOpacity style={styles.iconBtn} onPress={onRightPress2} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name={rightIcon2} size={22} color={colors.white} />
            </TouchableOpacity>
          )}
          {rightIcon ? (
            <TouchableOpacity style={styles.iconBtn} onPress={onRightPress} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name={rightIcon} size={22} color={colors.white} />
              {badge && badge > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ) : (
            !rightIcon2 && <View style={styles.iconBtn} />
          )}
        </View>

      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.maroon.primary,
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 4 : 52,
      paddingBottom: 14,
      paddingHorizontal: 4,
      elevation: 5,
      shadowColor: colors.maroon.dark,
      shadowOpacity: 0.3,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rightGroup: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleBlock: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      color: colors.white,
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    subtitle: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 12,
      marginTop: 1,
    },
    badge: {
      position: 'absolute',
      top: 6,
      right: 4,
      backgroundColor: colors.status.missing,
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
      borderWidth: 1.5,
      borderColor: colors.white,
    },
    badgeText: {
      color: colors.white,
      fontSize: 9,
      fontWeight: '800',
    },
  });
}
