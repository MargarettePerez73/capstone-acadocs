import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ColorPalette } from '@/constants/Colors';
import { useThemeColors } from '@/context/ThemeContext';

interface ChatBubbleProps {
  message: string;
  senderName: string;
  timestamp: string;
  isMine: boolean;
}

export default function ChatBubble({ message, senderName, timestamp, isMine }: ChatBubbleProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.wrapper, isMine ? styles.wrapperRight : styles.wrapperLeft]}>
      {!isMine && <Text style={styles.senderName}>{senderName}</Text>}
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.text, isMine && styles.textMine]}>{message}</Text>
      </View>
      <Text style={[styles.time, isMine && styles.timeRight]}>{timestamp}</Text>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    wrapper: {
      marginVertical: 4,
      maxWidth: '78%',
    },
    wrapperLeft: {
      alignSelf: 'flex-start',
      alignItems: 'flex-start',
    },
    wrapperRight: {
      alignSelf: 'flex-end',
      alignItems: 'flex-end',
    },
    senderName: {
      fontSize: 11,
      color: colors.text.secondary,
      marginBottom: 3,
      marginLeft: 2,
      fontWeight: '600',
    },
    bubble: {
      borderRadius: 14,
      paddingVertical: 9,
      paddingHorizontal: 14,
    },
    bubbleOther: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderTopLeftRadius: 4,
    },
    bubbleMine: {
      backgroundColor: colors.maroon.primary,
      borderTopRightRadius: 4,
    },
    text: {
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
    },
    textMine: {
      color: colors.white,
    },
    time: {
      fontSize: 10,
      color: colors.text.muted,
      marginTop: 3,
      marginLeft: 2,
    },
    timeRight: {
      marginRight: 2,
      marginLeft: 0,
    },
  });
}
