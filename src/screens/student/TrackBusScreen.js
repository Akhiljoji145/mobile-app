import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { getToken, getUser } from '../../services/auth';
import axios from 'axios';
import { API_URL } from '../../config';

const { width, height } = Dimensions.get('window');

const TrackBusScreen = ({ route, navigation }) => {
    const { busId } = route.params || {}; // Pass busId when navigating
    const { theme, isDarkMode } = useTheme();
    const mapRef = useRef(null);
    const [busLocation, setBusLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [computedBusId, setComputedBusId] = useState(busId);

    useEffect(() => {
        const loadUserBus = async () => {
            // If busId is passed via route, use it
            if (busId) {
                setComputedBusId(busId);
                return;
            }

            // Otherwise fetch linked bus
            try {
                const user = await getUser();
                if (user) {
                    if (user.bus_id) {
                        setComputedBusId(user.bus_id);
                    } else if (user.children && user.children.length > 0) {
                        // Default to first child's bus for now
                        const childWithBus = user.children.find(c => c.bus_id);
                        if (childWithBus) {
                            setComputedBusId(childWithBus.bus_id);
                        }
                    } else if (user.is_student && user.bus) {
                        // Check if full user object has bus object
                        setComputedBusId(user.bus.id || user.bus);
                    }
                }
            } catch (e) {
                console.log("Error loading user bus", e);
            }
        };
        loadUserBus();
    }, [busId]);

    useEffect(() => {
        if (!computedBusId) {
            const timer = setTimeout(() => setLoading(false), 2000);
            return () => clearTimeout(timer);
        }

        setLoading(true);
        fetchBusLocation(computedBusId);
        const intervalId = setInterval(() => fetchBusLocation(computedBusId), 5000); // Poll every 5s

        return () => clearInterval(intervalId);
    }, [computedBusId]);

    const fetchBusLocation = async (id) => {
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/trip/bus-location/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data;
            if (data.is_active_trip) {
                const newLocation = {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
                setBusLocation(newLocation);
                setLastUpdate(data.last_update);

                // Animate map to new location
                if (mapRef.current) {
                    mapRef.current.animateToRegion(newLocation, 1000);
                }
            } else {
                setBusLocation(null);
            }
        } catch (error) {
            console.log("Error fetching bus location", error);
        } finally {
            setLoading(false);
        }
    };

    if (!computedBusId && !loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text }}>No Bus Assigned to Track</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={theme.headerBg} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={busLocation || {
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {busLocation && (
                    <Marker
                        coordinate={busLocation}
                        title="School Bus"
                        description={`Last Updated: ${new Date(lastUpdate).toLocaleTimeString()}`}
                    >
                        <View style={styles.markerContainer}>
                            <Ionicons name="bus" size={30} color="#F1C40F" />
                        </View>
                    </Marker>
                )}
            </MapView>

            <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.infoTitle, { color: theme.text }]}>Live Tracking</Text>
                <Text style={[styles.infoSubtitle, { color: theme.subtext }]}>
                    {busLocation ? "Bus is moving" : "Waiting for location..."}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: width,
        height: height,
    },
    markerContainer: {
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#F1C40F'
    },
    infoCard: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        padding: 20,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoSubtitle: {
        fontSize: 14,
        marginTop: 5,
    }
});

export default TrackBusScreen;
