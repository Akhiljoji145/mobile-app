
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getToken } from '../../services/auth';
import { API_URL } from '../../config';
import { useTheme } from '../../context/ThemeContext';

const TeacherHomeScreen = ({ user, onLogout }) => {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        boarded: 25,
        total_students: 30,
        pending_alerts: 2,
        trip_status: 'Morning Trip Ongoing',
        trip_type: 'morning' // or 'evening'
    });

    const fetchData = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/teacher/dashboard/stats/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats({
                boarded: response.data.boarded,
                total_students: response.data.total_students,
                pending_alerts: response.data.pending_alerts,
                trip_status: response.data.trip_status,
                trip_type: response.data.trip_type
            });
        } catch (error) {
            console.log('Error fetching teacher stats:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    // Helper to get formatted date
    const getTodayDate = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString(undefined, options);
    };

    const StatusCard = ({ title, value, subtext, icon, color, onPress }) => {
        const Container = onPress ? TouchableOpacity : View;
        return (
            <Container
                style={[styles.statCard, { backgroundColor: theme.card, borderLeftColor: color }]}
                onPress={onPress}
                activeOpacity={onPress ? 0.7 : 1}
            >
                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? `${color}30` : `${color}15` }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View style={{ justifyContent: 'center' }}>
                    <Text style={[styles.statLabel, { color: theme.textSecondary, marginTop: 0, marginBottom: 4 }]}>{title}</Text>
                    <Text style={[styles.statValue, { color: theme.text, marginBottom: 2 }]}>{value}</Text>
                    {subtext ? <Text style={[styles.statSubtitle, { color: color, fontSize: 11, fontWeight: '500' }]}>{subtext}</Text> : null}
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
            {/* Absolute Header */}
            <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Overview</Text>
                        <Text style={styles.headerSubtitle}>{getTodayDate()}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={toggleTheme} style={[styles.headerButton, { marginRight: 10 }]}>
                            <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onLogout} style={styles.headerButton}>
                            <Ionicons name="log-out-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Visual Icon Overlay */}
                <Ionicons name="school" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.headerBg} />}
            >
                {/* Quick Status Cards */}
                <View style={styles.statsGrid}>
                    <StatusCard
                        title="Boarded"
                        value={`${stats.boarded}/${stats.total_students}`}
                        icon="bus-outline"
                        color="#00B894"
                    />
                    <StatusCard
                        title="Alerts"
                        value={stats.pending_alerts}
                        icon="alert-circle-outline"
                        color={stats.pending_alerts > 0 ? '#FF7675' : '#00B894'}
                        onPress={() => navigation.navigate('Alerts')}
                    />
                </View>

                {/* Today's Trip Status Card */}
                <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Today's Trip</Text>
                        <View style={[styles.badge, { backgroundColor: stats.trip_type === 'morning' ? '#FAB1A0' : '#74B9FF' }]}>
                            <Text style={styles.badgeText}>{stats.trip_type === 'morning' ? 'MORNING' : 'EVENING'}</Text>
                        </View>
                    </View>

                    <View style={styles.tripStatusContent}>
                        <View style={styles.busDetail}>
                            <Text style={[styles.label, { color: theme.subtext }]}>Status</Text>
                            <Text style={[styles.value, { color: theme.text }]}>{stats.trip_status}</Text>
                        </View>
                        <View style={styles.busDetail}>
                            <Text style={[styles.label, { color: theme.subtext }]}>Students</Text>
                            <Text style={[styles.value, { color: theme.text }]}>{stats.boarded}/{stats.total_students}</Text>
                        </View>
                    </View>

                    <View style={styles.tripActions}>
                        <TouchableOpacity style={[styles.trackButton, { backgroundColor: '#3498DB', flex: 1, marginRight: 10, justifyContent: 'center' }]}>
                            <Ionicons name="map" size={16} color="white" style={{ marginRight: 5 }} />
                            <Text style={styles.trackButtonText}>Route map</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.actionsContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.card }]}
                        onPress={() => navigation.navigate('Update Status')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#6C5CE7' }]}>
                            <Ionicons name="create" size={24} color="#FFF" />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={[styles.actionTitle, { color: theme.text }]}>Update Student Status</Text>
                            <Text style={[styles.actionSubtitle, { color: theme.subtext }]}>Mark Absent, Leave, or Late</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={theme.subtext} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.card }]}
                        onPress={() => navigation.navigate('Alerts')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#FF7675' }]}>
                            <Ionicons name="notifications" size={24} color="#FFF" />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={[styles.actionTitle, { color: theme.text }]}>View Safety Alerts</Text>
                            <Text style={[styles.actionSubtitle, { color: theme.subtext }]}>Check missed bus alerts</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={theme.subtext} />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
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
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
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
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statSubtitle: {
        fontSize: 11,
        fontWeight: '500',
    },
    sectionCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    tripStatusContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    tripStatusText: {
        fontSize: 16,
        fontWeight: '600',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    busDetail: {
        alignItems: 'flex-start'
    },
    label: {
        fontSize: 11,
        marginBottom: 4
    },
    value: {
        fontSize: 15,
        fontWeight: '600'
    },
    tripActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    trackButton: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center'
    },
    trackButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12
    },
    actionsContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 12,
    },
});

export default TeacherHomeScreen;
