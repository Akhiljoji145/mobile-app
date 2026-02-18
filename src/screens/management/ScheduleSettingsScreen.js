
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ImageBackground,
    TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { getToken } from '../../services/auth';
import { API_URL } from '../../config';

const ScheduleSettingsScreen = () => {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Times in HH:MM:SS format
    const [morningArrival, setMorningArrival] = useState('09:00:00');
    const [eveningDeparture, setEveningDeparture] = useState('16:00:00');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/users/me/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userData = response.data;

            if (userData.morning_arrival_time) setMorningArrival(userData.morning_arrival_time);
            if (userData.evening_departure_time) setEveningDeparture(userData.evening_departure_time);
        } catch (error) {
            console.log('Error fetching settings:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        // Basic validation for time format HH:MM:SS
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
        if (!timeRegex.test(morningArrival) || !timeRegex.test(eveningDeparture)) {
            Alert.alert('Invalid Format', 'Please enter time in HH:MM:SS format (e.g., 09:00:00)');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();

            await axios.put(`${API_URL}/users/me/`, {
                morning_arrival_time: morningArrival,
                evening_departure_time: eveningDeparture
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Schedule settings updated successfully.');
            navigation.goBack();

        } catch (error) {
            console.log('Error saving settings:', error);
            let errorMsg = 'Failed to update settings.';
            if (error.response?.data?.detail) errorMsg = error.response.data.detail;
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('../../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0.15 : 1 }}
            resizeMode="cover"
        >
            {/* Header */}
            <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.headerTitle}>Schedule Settings</Text>
                        <Text style={styles.headerSubtitle}>Set Morning & Evening Times</Text>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                {fetching ? (
                    <ActivityIndicator size="large" color={theme.primary} />
                ) : (
                    <View style={[styles.card, { backgroundColor: theme.card }]}>
                        <Text style={[styles.infoText, { color: theme.subtext }]}>
                            These times determine when a trip is classified as Morning or Evening for all buses.
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Morning Arrival Time (at College)</Text>
                            <Text style={[styles.helper, { color: theme.subtext }]}>Morning trips end before this time.</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}
                                value={morningArrival}
                                onChangeText={setMorningArrival}
                                placeholder="09:00:00"
                                placeholderTextColor={theme.subtext}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Evening Departure Time (from College)</Text>
                            <Text style={[styles.helper, { color: theme.subtext }]}>Evening trips start after this time.</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}
                                value={eveningDeparture}
                                onChangeText={setEveningDeparture}
                                placeholder="16:00:00"
                                placeholderTextColor={theme.subtext}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Settings</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBackground: {
        height: 120,
        paddingTop: 40,
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        borderRadius: 15,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    infoText: {
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    helper: {
        fontSize: 12,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#4BCFFA',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default ScheduleSettingsScreen;
