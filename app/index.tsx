import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

const LATITUDE = '14.067291';
const LONGITUDE = '120.626720';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export default function HomeScreen() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeatherCondition = (code: number): string => {
    if (code === 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 61 && code <= 65) return 'Rainy';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Cloudy';
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh`
        );
        
        if (!response.ok) {
          throw new Error('Network error');
        }

        const data = await response.json();
        const currentData = data.current;

        setWeather({
          temp: Math.round(currentData.temperature_2m),
          condition: getWeatherCondition(currentData.weather_code),
          humidity: currentData.relative_humidity_2m,
          windSpeed: Math.round(currentData.wind_speed_10m),
        });
        setError(null);
      } catch (err) {
        setError('Could not update weather.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
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

          {loading ? (
            <ActivityIndicator size="large" color="#E5A93C" style={{ marginVertical: 20 }} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : weather ? (
            <>
              <Text style={styles.temperature}>{weather.temp}°C</Text>
              <Text style={styles.weatherCondition}>{weather.condition}</Text>
              
              <View style={styles.weatherDetailsRow}>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.detailLabel}>Humidity</Text>
                  <Text style={styles.detailValue}>{weather.humidity}%</Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.detailLabel}>Wind</Text>
                  <Text style={styles.detailValue}>{weather.windSpeed} km/h</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="react" size={14} color="#E5A93C" />
            <Text style={styles.cardLabel}>REACT NATIVE</Text>
          </View>
          <Text style={styles.name}>Sir Mags</Text>
        </View>
        <View style={styles.footer}>
          <FontAwesome5 name="react" size={12} color="#E5A93C" />
          <Text style={styles.footerText}>REACT NATIVE - LIVE MONITORS</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

///////////////////////////////////////////////////////////// STYLESHEET ///////////////////////////////////////////////////////////////////////


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
    backgroundColor: '#4A0E17',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
    marginTop: 10,
  },
  locationText: {
    color: '#D4AF37', 
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  card: {
    borderColor: '#ffffff',
    backgroundColor: '#4A0E17',
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
    color: '#D4AF37',
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
    color: '#A3A3A3',
    fontSize: 14,
  },
  temperature: {
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
    borderTopColor: '#2A080C',
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
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  name: {
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
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});