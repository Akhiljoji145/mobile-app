import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion } from 'react-native-maps';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { getToken, getUser } from '../../services/auth';
import axios from 'axios';
import { API_URL } from '../../config';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

const TrackBusScreen = ({ route, navigation }) => {
    const { busId } = route.params || {}; // Pass busId when navigating
    const { theme, isDarkMode } = useTheme();
    const mapRef = useRef(null);
    const [busLocation, setBusLocation] = useState(null);
    const [animatedBusLocation] = useState(new AnimatedRegion({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    }));
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [computedBusId, setComputedBusId] = useState(busId);
    const [isFitted, setIsFitted] = useState(false);
    const [busHeading, setBusHeading] = useState(0);
    const [busSpeed, setBusSpeed] = useState(0);

    const GOOGLE_API_KEY = "AIzaSyCwAqJ4hYLkr0iC2j3Vj39mSI9pFlP-nW8";

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
        const intervalId = setInterval(() => fetchBusLocation(computedBusId), 3000); // Poll every 3s as suggested

        return () => clearInterval(intervalId);
    }, [computedBusId]);

    const snapToRoad = async (lat, lng) => {
        try {
            const response = await axios.get(
                `https://roads.googleapis.com/v1/snapToRoads?path=${lat},${lng}&interpolate=true&key=${GOOGLE_API_KEY}`
            );
            if (response.data.snappedPoints && response.data.snappedPoints.length > 0) {
                return {
                    latitude: response.data.snappedPoints[0].location.latitude,
                    longitude: response.data.snappedPoints[0].location.longitude
                };
            }
        } catch (error) {
            console.log("Road Snap Error", error);
        }
        return { latitude: lat, longitude: lng };
    };

    const predictNextPosition = (lat, lng, speed, heading) => {
        if (!speed || speed < 1) return { latitude: lat, longitude: lng };

        // Simple prediction: move forward based on speed and heading
        // speed is usually in m/s, time factor ~2s (half polling interval)
        const timeFactor = 2;
        const radius = 6371000; // Earth radius in meters
        const distance = speed * timeFactor;

        const latRad = lat * (Math.PI / 180);
        const lngRad = lng * (Math.PI / 180);
        const headingRad = heading * (Math.PI / 180);

        const newLatRad = Math.asin(
            Math.sin(latRad) * Math.cos(distance / radius) +
            Math.cos(latRad) * Math.sin(distance / radius) * Math.cos(headingRad)
        );
        const newLngRad = lngRad + Math.atan2(
            Math.sin(headingRad) * Math.sin(distance / radius) * Math.cos(latRad),
            Math.cos(distance / radius) - Math.sin(latRad) * Math.sin(newLatRad)
        );

        return {
            latitude: newLatRad * (180 / Math.PI),
            longitude: newLngRad * (180 / Math.PI)
        };
    };

    const fetchBusLocation = async (id) => {
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/trip/bus-location/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data;
            if (data.is_active_trip) {
                // 1. Raw location
                let lat = data.latitude;
                let lng = data.longitude;

                // 2. Snap to road
                const snapped = await snapToRoad(lat, lng);
                lat = snapped.latitude;
                lng = snapped.longitude;

                // 3. Predict movement (if speed and heading available)
                const predicted = predictNextPosition(lat, lng, data.speed || 0, data.heading || 0);

                const newLocation = {
                    latitude: predicted.latitude,
                    longitude: predicted.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };

                setBusLocation(newLocation);
                setLastUpdate(data.last_update);
                setBusHeading(data.heading || 0);
                setBusSpeed(data.speed || 0);

                // 4. Animate marker smoothly
                animatedBusLocation.timing({
                    ...newLocation,
                    duration: 2500, // Interpolate over 2.5 seconds
                    useNativeDriver: false // AnimatedRegion doesn't support native driver
                }).start();

                // Animate map camera
                if (mapRef.current) {
                    mapRef.current.animateCamera({
                        center: {
                            latitude: newLocation.latitude + 0.0003,
                            longitude: newLocation.longitude,
                        },
                        zoom: 19,
                    }, { duration: 1500 });
                    setIsFitted(true);
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

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
            }
        })();
    }, []);

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
                minZoomLevel={19}
                maxZoomLevel={22}
                showsUserLocation={true}
                showsMyLocationButton={false}  // Disabled native button
                mapPadding={{ bottom: 140, top: 0, right: 0, left: 0 }}
                initialRegion={busLocation || {
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {busLocation && (
                    <Marker.Animated
                        coordinate={animatedBusLocation}
                        title="School Bus"
                        description={`Last Updated: ${new Date(lastUpdate).toLocaleTimeString()}`}
                        rotation={busHeading}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.markerContainer}>
                            <Ionicons name="bus" size={20} color="#F1C40F" />
                        </View>
                    </Marker.Animated>
                )}
            </MapView>

            {/* Custom Center on Bus Button */}
            {busLocation && (
                <TouchableOpacity
                    style={styles.centerBusButton}
                    onPress={() => {
                        if (mapRef.current && busLocation) {
                            mapRef.current.animateCamera({
                                center: {
                                    latitude: busLocation.latitude + 0.0003,
                                    longitude: busLocation.longitude,
                                },
                                zoom: 19,
                            }, { duration: 800 });
                        }
                    }}
                >
                    <Ionicons name="bus-outline" size={24} color="white" />
                </TouchableOpacity>
            )}

            {/* Custom Center on My Location Button */}
            <TouchableOpacity
                style={styles.centerMyLocationButton}
                onPress={async () => {
                    let { status } = await Location.getForegroundPermissionsAsync();
                    if (status !== 'granted') return;

                    let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    if (mapRef.current && loc) {
                        mapRef.current.animateCamera({
                            center: {
                                latitude: loc.coords.latitude,
                                longitude: loc.coords.longitude,
                            },
                            zoom: 19,
                        }, { duration: 800 });
                    }
                }}
            >
                <Ionicons name="navigate" size={24} color="#555" />
            </TouchableOpacity>

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
    centerBusButton: {
        position: 'absolute',
        bottom: 215,
        right: 15,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3498DB',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 6,
        zIndex: 10,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    centerMyLocationButton: {
        position: 'absolute',
        bottom: 155,
        right: 15,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 6,
        zIndex: 10,
    },
    markerContainer: {
        backgroundColor: 'white',
        padding: 4,
        borderRadius: 15,
        borderWidth: 1.5,
        borderColor: '#F1C40F',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
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
