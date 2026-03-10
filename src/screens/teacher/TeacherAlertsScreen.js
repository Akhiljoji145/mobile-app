
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { getToken } from '../../services/auth';
import { API_URL } from '../../config';
import { useTheme } from '../../context/ThemeContext';

const TeacherAlertsScreen = () => {
    const { theme, isDarkMode } = useTheme();
    const [alerts, setAlerts] = useState([]);

    const fetchData = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/teacher/alerts/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlerts(response.data);
        } catch (error) {
            console.log('Error fetching alerts:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    const handleAcknowledge = (id) => {
        Alert.alert(
            "Acknowledge Alert",
            "Are you sure you want to acknowledge this alert? It will be moved to history.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Acknowledge",
                    onPress: () => {
                        setAlerts(prev => prev.filter(a => a.id !== id));
                    }
                }
            ]
        );
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'Not Boarded': return 'alert-circle';
            case 'Not Deboarded': return 'warning';
            default: return 'information-circle';
        }
    };

    const getAlertColor = (type) => {
        switch (type) {
            case 'Not Boarded': return '#FF7675';
            case 'Not Deboarded': return '#D63031';
            default: return '#F39C12';
        }
    };

    const renderAlertItem = ({ item }) => (
        <View style={[styles.alertCard, { backgroundColor: theme.card, borderLeftColor: getAlertColor(item.type) }]}>
            <View style={styles.alertHeader}>
                <View style={[styles.iconContainer, { backgroundColor: getAlertColor(item.type) + '20' }]}>
                    <Ionicons name={getAlertIcon(item.type)} size={24} color={getAlertColor(item.type)} />
                </View>
                <View style={styles.headerText}>
                    <Text style={[styles.alertType, { color: getAlertColor(item.type) }]}>{item.type}</Text>
                    <Text style={[styles.alertTime, { color: theme.subtext }]}>{item.time}</Text>
                </View>
            </View>

            <Text style={[styles.studentName, { color: theme.text }]}>{item.student}</Text>
            <Text style={[styles.alertDetails, { color: theme.subtext }]}>{item.details}</Text>

            <TouchableOpacity
                style={[styles.acknowledgeButton, { backgroundColor: theme.inputBg }]}
                onPress={() => handleAcknowledge(item.id)}
            >
                <Text style={[styles.acknowledgeText, { color: theme.primary || '#3498DB' }]}>Acknowledge</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ImageBackground
            source={isDarkMode ? null : require('../../../assets/background.jpg')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0 : 1 }}
            resizeMode="cover"
        >
            {/* Absolute Header Overlay */}
            <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Safety Alerts</Text>
                        <Text style={styles.headerSubtitle}>Monitor & Acknowledge</Text>
                    </View>
                </View>
                <Ionicons name="notifications" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            <View style={styles.scrollContent}>
                <FlatList
                    data={alerts}
                    renderItem={renderAlertItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="checkmark-circle-outline" size={64} color="#00B894" />
                            <Text style={[styles.emptyText, { color: theme.subtext }]}>No active alerts</Text>
                            <Text style={[styles.emptySubtext, { color: theme.muted }]}>Your students are safe!</Text>
                        </View>
                    }
                />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 180,
        paddingTop: 60,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 10,
        elevation: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 5,
    },
    headerIcon: {
        position: 'absolute',
        right: -20,
        bottom: -40,
    },
    scrollContent: {
        flex: 1,
        paddingTop: 200, // accommodate absolute header
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    alertCard: {
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
        borderLeftWidth: 5,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerText: {
        flex: 1,
    },
    alertType: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    alertTime: {
        fontSize: 12,
    },
    studentName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    alertDetails: {
        fontSize: 14,
        marginBottom: 15,
        lineHeight: 20,
    },
    acknowledgeButton: {
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    acknowledgeText: {
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
    },
    emptySubtext: {
        marginTop: 5,
        fontSize: 14,
    },
});

export default TeacherAlertsScreen;
