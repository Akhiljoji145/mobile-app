import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../../config';
import { getToken } from '../../services/auth';

const ParentDashboard = ({ navigation }) => {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState({
        children: [],
        any_boarded: false,
        notifications: []
    });

    const fetchData = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/parent/dashboard/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error) {
            console.log('Error fetching parent dashboard:', error);
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
            source={isDarkMode ? null : require('../../../assets/background.jpg')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0 : 1 }}
            resizeMode="cover"
        >
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Parent Portal</Text>
                        <Text style={styles.headerSubtitle}>Monitor Your Children</Text>
                    </View>
                    <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
                        <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <Ionicons name="people" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
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
                        title="Children"
                        value={data.children.length.toString()}
                        icon="people-outline"
                        color="#3498DB"
                    />
                    <StatusCard
                        title="Boarding Status"
                        value={data.any_boarded ? 'Boarded' : 'Not Boarded'}
                        icon="qr-code-outline"
                        color={data.any_boarded ? '#2ECC71' : '#E67E22'}
                    />
                </View>

                {/* Children Info Cards */}
                <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 15 }]}>My Children</Text>
                {data.children.length === 0 ? (
                    <Text style={{ color: theme.subtext, fontStyle: 'italic', marginBottom: 20 }}>No children registered.</Text>
                ) : (
                    data.children.map(child => (
                        <View key={child.id} style={[styles.bigCard, { backgroundColor: theme.card, marginBottom: 15 }]}>
                            <View style={styles.bigCardHeader}>
                                <Text style={[styles.childName, { color: theme.text }]}>{child.name}</Text>
                                {child.bus && (
                                    <TouchableOpacity
                                        style={styles.trackButton}
                                        onPress={() => navigation.navigate('Track', { busId: child.bus.id })}
                                    >
                                        <Ionicons name="map" size={16} color="white" style={{ marginRight: 5 }} />
                                        <Text style={styles.trackButtonText}>Track Bus</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {child.bus ? (
                                <>
                                    <View style={styles.busInfoContainer}>
                                        <View style={styles.busDetail}>
                                            <Text style={[styles.label, { color: theme.subtext }]}>Bus Number</Text>
                                            <Text style={[styles.value, { color: theme.text }]}>{child.bus.number}</Text>
                                        </View>
                                        <View style={styles.busDetail}>
                                            <Text style={[styles.label, { color: theme.subtext }]}>Driver</Text>
                                            <Text style={[styles.value, { color: theme.text }]}>{child.bus.driver_name}</Text>
                                        </View>
                                        <View style={styles.busDetail}>
                                            <Text style={[styles.label, { color: theme.subtext }]}>Trip</Text>
                                            <Text style={[styles.value, { color: theme.text }]}>{child.trip.type}</Text>
                                            <Text style={[styles.label, { color: theme.subtext, fontSize: 10 }]}>{child.trip.status}</Text>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 10, padding: 8, backgroundColor: child.boarding.status === 'Boarded' ? '#D5F5E3' : '#FDEBD0', borderRadius: 8, alignSelf: 'flex-start' }}>
                                        <Text style={{ color: child.boarding.status === 'Boarded' ? '#27AE60' : '#D35400', fontSize: 12, fontWeight: 'bold' }}>
                                            {child.boarding.status}
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <Text style={{ color: theme.subtext, fontStyle: 'italic', marginTop: 10 }}>No bus assigned.</Text>
                            )}
                        </View>
                    ))
                )}

                {/* Notifications */}
                <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 10, marginBottom: 15 }]}>Recent Alerts</Text>
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
    childName: { fontSize: 18, fontWeight: 'bold' },
    trackButton: {
        flexDirection: 'row',
        backgroundColor: '#3498DB',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center'
    },
    trackButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    busInfoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    busDetail: { alignItems: 'flex-start' },
    label: { fontSize: 11, marginBottom: 4 },
    value: { fontSize: 15, fontWeight: '600' },
    notifCard: { padding: 15, borderRadius: 15, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    notifHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    notifTitle: { fontWeight: 'bold', fontSize: 14 },
    notifTime: { fontSize: 10 },
    notifMessage: { fontSize: 13, lineHeight: 18 }
});

export default ParentDashboard;
