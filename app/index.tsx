import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Location Section */}
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={16} color="#E5A93C" />
          <Text style={styles.locationText}>NASUGBU BATANGAS, PH</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={16} color="#E5A93C" />
            <Text style={styles.cardLabel}>CURRENT TIME</Text>
          </View>
          <Text style={styles.timeText}>{formatTime(time)}</Text>
          <Text style={styles.dateText}>{formatDate(time)}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="help-circle-outline" size={16} color="#E5A93C" />
            <Text style={styles.cardLabel}>WEATHER UPDATES</Text>
          </View>
          <Text style={styles.tempText}>31°C</Text>
          <Text style={styles.weatherCondition}>Partly Cloudy</Text>
          
          <View style={styles.weatherDetailsRow}>
            <View style={styles.weatherDetailItem}>
              <Text style={styles.detailLabel}>HUMIDITY</Text>
              <Text style={styles.detailValue}>65%</Text>
            </View>
            <View style={styles.weatherDetailItem}>
              <Text style={styles.detailLabel}>WIND</Text>
              <Text style={styles.detailValue}>12 km/h</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="react" size={14} color="#E5A93C" />
            <Text style={styles.cardLabel}>REACT NATIVE</Text>
          </View>
          <Text style={styles.brandText}>Marga</Text>
        </View>

        <View style={styles.footer}>
          <FontAwesome5 name="react" size={12} color="#A19E9E" />
          <Text style={styles.footerText}>REACT NATIVE • LIVE MONITORS</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3A0D11',
  },
  scrollContainer: {
    padding: 24,
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    backgroundColor: '#52141A',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
    marginTop: 10,
  },
  locationText: {
    color: '#E5A93C', // Deep yellow/gold accent
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#4C1217',
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  cardLabel: {
    color: '#E5A93C',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateText: {
    color: '#B09A9C',
    fontSize: 14,
  },
  tempText: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: 'bold',
  },
  weatherCondition: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  weatherDetailsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#5C1D23',
    paddingTop: 12,
  },
  weatherDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    color: '#B09A9C',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    paddingVertical: 10,
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    opacity: 0.6,
  },
  footerText: {
    color: '#B09A9C',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});