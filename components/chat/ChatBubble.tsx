import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ChatBubbleProps {
  message: string;
  senderName: string;
  timestamp: string;
  isMine: boolean;
}

export default function ChatBubble({ message, senderName, timestamp, isMine }: ChatBubbleProps) {
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

const styles = StyleSheet.create({
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
    color: Colors.text.secondary,
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
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopLeftRadius: 4,
  },
  bubbleMine: {
    backgroundColor: Colors.maroon.primary,
    borderTopRightRadius: 4,
  },
  text: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  textMine: {
    color: Colors.white,
  },
  time: {
    fontSize: 10,
    color: Colors.text.muted,
    marginTop: 3,
    marginLeft: 2,
  },
  timeRight: {
    marginRight: 2,
    marginLeft: 0,
  },
});
