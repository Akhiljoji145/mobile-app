import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../../context/ThemeContext';
import { getToken } from '../../services/auth';
import axios from 'axios';
import { API_URL } from '../../config';

const DriverQRScreen = () => {
    const { theme, isDarkMode } = useTheme();
    const [busId, setBusId] = useState(null);
    const [busNumber, setBusNumber] = useState('');
    const [qrToken, setQrToken] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBusDetails();

        // Refresh QR Token every 30 seconds
        const intervalId = setInterval(fetchBusDetails, 30000);

        // Countdown timer for visual feedback
        const timerId = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30));
        }, 1000);

        return () => {
            clearInterval(intervalId);
            clearInterval(timerId);
        };
    }, []);

    const fetchBusDetails = async () => {
        try {
            const token = await getToken();
            // We can reuse the driver stats endpoint to get the bus info
            const response = await axios.get(`${API_URL}/dashboard/driver/stats/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Assuming the response structure based on previous views
            // We need the ACTUAL ID of the bus to encode in the QR, not just the number.
            // But DriverDashboardStatsView returns 'bus': {'number': ..., 'status': ...}
            // It doesn't seem to return the ID. 
            // I should update the DriverDashboardStatsView to return the ID or fetch it differently.
            // However, the 'bus' object in the response might have it if I update the serializer/view.
            // Let's assume for now I need to fetch it or the view returns it.
            // Wait, I updated the view to return: 
            // 'bus': { 'number': bus.bus_number, 'status': 'Active', 'plate': bus.number_plate }
            // I missed the ID. I should fix the view to return the ID.

            // For now, let's assume I fix the view to return 'id'.
            if (response.data.bus) {
                setBusNumber(response.data.bus.number);
                setBusId(response.data.bus.id);
            }
            if (response.data.qr_token) {
                setQrToken(response.data.qr_token);
            }
        } catch (error) {
            console.log('Error fetching bus info:', error);
        } finally {
            setLoading(false);
            setTimeLeft(30); // Reset timer on successful fetch attempt
        }
    };

    // TEMPORARY FIX: I need to update the backend view to return the ID first.
    // But I can write this file assuming it will be there.

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={theme.headerBg} />
            </View>
        );
    }

    if (!busId && !busNumber) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text }}>No Bus Assigned</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Scan to Board</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>Bus {busNumber}</Text>

            <View style={styles.qrContainer}>
                {/* Dynamic QR Token */}
                <QRCode
                    value={JSON.stringify({ qr_token: qrToken })}
                    size={250}
                    color={isDarkMode ? "white" : "black"}
                    backgroundColor={theme.card}
                />
            </View>

            <View style={styles.timerContainer}>
                <Text style={{ color: theme.subtext, marginBottom: 5 }}>Refreshing in {timeLeft}s</Text>
                <View style={[styles.progressBarBackground, { backgroundColor: theme.card }]}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${(timeLeft / 30) * 100}%`,
                                backgroundColor: timeLeft < 5 ? '#e74c3c' : '#3498db'
                            }
                        ]}
                    />
                </View>
            </View>

            <Text style={[styles.instruction, { color: theme.subtext }]}>
                Ask students to scan this QR code with their app to mark attendance.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 40,
    },
    qrContainer: {
        padding: 20,
        backgroundColor: 'white', // QR usually works best on white for contrast, but config allow
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 40,
    },
    instruction: {
        textAlign: 'center',
        fontSize: 14,
        paddingHorizontal: 20,
    },
    timerContainer: {
        width: '80%',
        marginBottom: 30,
        alignItems: 'center',
    },
    progressBarBackground: {
        height: 6,
        width: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: '#e0e0e0', // Fallback
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    }
});

export default DriverQRScreen;
