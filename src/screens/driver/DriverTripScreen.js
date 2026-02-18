import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { getToken } from '../../services/auth';
import axios from 'axios';
import { API_URL } from '../../config';

const DriverTripScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [isTracking, setIsTracking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [locationSubscription, setLocationSubscription] = useState(null);
    const [tripStatus, setTripStatus] = useState('Idle'); // Idle, Active

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [locationSubscription]);

    const startTrip = async () => {
        setLoading(true);
        try {
            // 1. Request Permissions
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to share trip status.');
                setLoading(false);
                return;
            }

            // 2. Call Backend to Start Trip
            const token = await getToken();
            await axios.post(`${API_URL}/trip/start/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 3. Start Location Tracking
            const subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000, // Update every 5 seconds
                    distanceInterval: 10, // Or every 10 meters
                },
                (location) => {
                    updateLocation(location);
                }
            );

            setLocationSubscription(subscription);
            setIsTracking(true);
            setTripStatus('Active');
            Alert.alert('Trip Started', 'Your location is now being shared with students and parents.');

        } catch (error) {
            console.log("Start Trip Error", error);
            Alert.alert('Error', 'Failed to start trip. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const endTrip = async () => {
        setLoading(true);
        try {
            // 1. Stop Location Tracking
            if (locationSubscription) {
                locationSubscription.remove();
                setLocationSubscription(null);
            }

            // 2. Call Backend to End Trip
            const token = await getToken();
            await axios.post(`${API_URL}/trip/end/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsTracking(false);
            setTripStatus('Idle');
            Alert.alert('Trip Ended', 'Location sharing has stopped.');

        } catch (error) {
            console.log("End Trip Error", error);
            Alert.alert('Error', 'Failed to end trip properly.');
        } finally {
            setLoading(false);
        }
    };

    const isTrackingRef = useRef(isTracking);

    useEffect(() => {
        isTrackingRef.current = isTracking;
    }, [isTracking]);

    const updateLocation = async (location) => {
        if (!isTrackingRef.current) return;

        try {
            const token = await getToken();
            await axios.post(`${API_URL}/trip/update-location/`, {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Location Updated", location.coords.latitude, location.coords.longitude);
        } catch (error) {
            console.log("Location Update Error", error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Trip Manager</Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.statusCard, { backgroundColor: theme.card }]}>
                    <Ionicons
                        name={isTracking ? "bus" : "bus-outline"}
                        size={60}
                        color={isTracking ? "#2ECC71" : theme.subtext}
                    />
                    <Text style={[styles.statusText, { color: theme.text }]}>
                        Status: {tripStatus}
                    </Text>
                    {isTracking && (
                        <Text style={{ color: '#2ECC71', marginTop: 5 }}>
                            <Ionicons name="radio-button-on" size={14} /> Live Location Sharing
                        </Text>
                    )}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.headerBg} style={{ marginTop: 30 }} />
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            { backgroundColor: isTracking ? '#E74C3C' : '#2ECC71' }
                        ]}
                        onPress={isTracking ? endTrip : startTrip}
                    >
                        <Ionicons name={isTracking ? "stop-circle-outline" : "play-circle-outline"} size={24} color="white" style={{ marginRight: 10 }} />
                        <Text style={styles.buttonText}>
                            {isTracking ? "End Trip" : "Start Trip"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginTop: 40,
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusCard: {
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        width: '100%',
        marginBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    statusText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 15,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '80%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default DriverTripScreen;
