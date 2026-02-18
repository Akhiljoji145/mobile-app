import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../../config';
import { getToken } from '../../services/auth';

const StudentDashboard = ({ navigation }) => {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState({
        bus: null,
        trip: { type: '-', status: '-' },
        boarding: { status: '-' },
        notifications: []
    });

    const fetchData = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/student/dashboard/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error) {
            console.log('Error fetching student dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const StatusCard = ({ title, value, subtext, icon, color, onPress }) => {
        const Container = onPress ? TouchableOpacity : View;
        return (
            <Container
                style={[styles.card, { backgroundColor: theme.card, borderLeftColor: color }]}
                onPress={onPress}
                activeOpacity={onPress ? 0.7 : 1}
            >
                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? `${color}30` : `${color}15` }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>{title}</Text>
                    <Text style={[styles.cardValue, { color: theme.text }]}>{value}</Text>
                    {subtext ? <Text style={[styles.cardSubtitle, { color: color }]}>{subtext}</Text> : null}
                </View>
            </Container>
        );
    };

    return (
        <ImageBackground
            source={require('../../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0.15 : 1 }}
        >
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Student Portal</Text>
                        <Text style={styles.headerSubtitle}>Your Daily Commute</Text>
                    </View>
                    <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
                        <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <Ionicons name="school" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.headerBg} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Status Cards Grid */}
                <View style={styles.grid}>
                    <StatusCard
                        title="Today's Trip"
                        value={data.trip.type}
                        subtext={data.trip.status}
                        icon="bus-outline"
                        color="#3498DB"
                    />
                    <StatusCard
                        title="Boarding"
                        value={data.boarding.status}
                        icon="qr-code-outline"
                        color={data.boarding.status === 'Boarded' ? '#2ECC71' : '#E67E22'}
                        onPress={() => navigation.navigate('Scan')}
                    />
                </View>

                {/* Bus Info Card */}
                <View style={[styles.bigCard, { backgroundColor: theme.card }]}>
                    <View style={styles.bigCardHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>My Bus</Text>
                        <TouchableOpacity
                            style={styles.trackButton}
                            onPress={() => navigation.navigate('Track')}
                        >
                            <Ionicons name="map" size={16} color="white" style={{ marginRight: 5 }} />
                            <Text style={styles.trackButtonText}>Track Bus</Text>
                        </TouchableOpacity>
                    </View>

                    {data.bus ? (
                        <View style={styles.busInfoContainer}>
                            <View style={styles.busDetail}>
                                <Text style={[styles.label, { color: theme.subtext }]}>Bus Number</Text>
                                <Text style={[styles.value, { color: theme.text }]}>{data.bus.number}</Text>
                            </View>
                            <View style={styles.busDetail}>
                                <Text style={[styles.label, { color: theme.subtext }]}>Plate Number</Text>
                                <Text style={[styles.value, { color: theme.text }]}>{data.bus.plate}</Text>
                            </View>
                            <View style={styles.busDetail}>
                                <Text style={[styles.label, { color: theme.subtext }]}>Driver</Text>
                                <Text style={[styles.value, { color: theme.text }]}>{data.bus.driver_name}</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={{ color: theme.subtext, fontStyle: 'italic', marginTop: 10 }}>No bus assigned.</Text>
                    )}
                </View>

                {/* Notifications */}
                <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 25, marginBottom: 15 }]}>Recent Alerts</Text>
                {data.notifications.length === 0 ? (
                    <Text style={{ color: theme.subtext, fontStyle: 'italic' }}>No recent notifications.</Text>
                ) : (
                    data.notifications.map(notif => (
                        <View key={notif.id} style={[styles.notifCard, { backgroundColor: theme.card }]}>
                            <View style={styles.notifHeader}>
                                <Text style={[styles.notifTitle, { color: theme.text }]}>{notif.title}</Text>
                                <Text style={[styles.notifTime, { color: theme.subtext }]}>{notif.time}</Text>
                            </View>
                            <Text style={[styles.notifMessage, { color: theme.textSecondary }]}>{notif.message}</Text>
                        </View>
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
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
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
    headerButton: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerIcon: {
        position: 'absolute',
        right: -20,
        bottom: -40,
    },
    scrollView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        paddingTop: 200,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    card: {
        width: '48%',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderLeftWidth: 5,
    },
    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardContent: {
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 11,
        fontWeight: '500',
    },
    bigCard: { padding: 20, borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
    bigCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold' },
    trackButton: {
        flexDirection: 'row',
        backgroundColor: '#3498DB',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center'
    },
    trackButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    busInfoContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    busDetail: { alignItems: 'flex-start' },
    label: { fontSize: 11, marginBottom: 4 },
    value: { fontSize: 15, fontWeight: '600' },
    notifCard: { padding: 15, borderRadius: 15, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    notifHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    notifTitle: { fontWeight: 'bold', fontSize: 14 },
    notifTime: { fontSize: 10 },
    notifMessage: { fontSize: 13, lineHeight: 18 }
});

export default StudentDashboard;
