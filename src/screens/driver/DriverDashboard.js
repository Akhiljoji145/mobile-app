import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar, ActivityIndicator, ImageBackground, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { getToken } from '../../services/auth';
import { API_URL } from '../../config';

const { width } = Dimensions.get('window');

const DriverDashboard = ({ user, onLogout, navigation }) => {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState({
        bus: null,
        trip: { type: 'No Trip', status: 'Inactive' },
        route: { name: '-', start: '-', end: '-' },
        boarding: { boarded: 0, expected: 0 },
        location: { gps: false, lastUpdated: '-' },
        students: [],
        alerts: []
    });

    const fetchData = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/dashboard/driver/stats/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error) {
            console.log('Error fetching driver stats:', error);
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

    const StatusCard = ({ icon, title, subtitle, value, color, delay }) => (
        <View style={[styles.card, { backgroundColor: theme.card, borderLeftColor: color }]}>
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? `${color}30` : `${color}15` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>{title}</Text>
                <Text style={[styles.cardValue, { color: theme.text }]}>{value}</Text>
                {subtitle ? <Text style={[styles.cardSubtitle, { color: color }]}>{subtitle}</Text> : null}
            </View>
        </View>
    );

    return (
        <ImageBackground
            source={require('../../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0.15 : 1 }}
            resizeMode="cover"
        >
            {/* Header Overlay */}
            <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Driver Portal</Text>
                        <Text style={styles.headerSubtitle}>
                            {user?.first_name ? `Welcome, ${user.first_name}` : 'Welcome, Driver'}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={toggleTheme} style={[styles.headerButton, { marginRight: 10 }]}>
                            <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('DriverQR')} style={[styles.headerButton, { marginRight: 10 }]}>
                            <Ionicons name="qr-code" size={22} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onLogout} style={styles.headerButton}>
                            <Ionicons name="log-out-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
                <Ionicons name="bus" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.headerBg} />}
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={theme.headerBg} style={{ marginTop: 100 }} />
                ) : (
                    <>
                        {/* 4 Main Cards Grid */}
                        <View style={styles.gridContainer}>
                            <StatusCard
                                icon="bus-outline"
                                title="Assigned Bus"
                                value={data.bus?.number || 'No Bus'}
                                subtitle={data.bus?.status || 'Inactive'}
                                color="#3498DB"
                            />
                            <StatusCard
                                icon="map-outline"
                                title="Current Trip"
                                value={data.trip.type}
                                subtitle={data.trip.status}
                                color="#2ECC71"
                            />
                            <StatusCard
                                icon="navigate-outline"
                                title="Route Summary"
                                value={data.route.name}
                                subtitle={`${data.route.end}`} // Keeping shorter for layout
                                color="#E67E22"
                            />
                            <StatusCard
                                icon="people-outline"
                                title="Boarding Status"
                                value={`${data.boarding.boarded} / ${data.boarding.expected}`}
                                subtitle="Students Boarded"
                                color="#9B59B6"
                            />
                        </View>

                        {/* Live Location Status */}
                        <View style={[styles.sectionContainer]}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Live Tracking</Text>
                            <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                                <View style={styles.locationRow}>
                                    <View style={styles.statusBadge}>
                                        <View style={[styles.indicator, { backgroundColor: data.location.gps ? '#2ECC71' : '#E74C3C' }]} />
                                        <Text style={[styles.statusText, { color: theme.text }]}>
                                            GPS {data.location.gps ? 'Active' : 'Inactive'}
                                        </Text>
                                    </View>
                                    <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>
                                        Updated: {data.location.lastUpdated}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Student Boarding List */}
                        <View style={styles.sectionContainer}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Student Boarding List</Text>
                            <View style={[styles.listCard, { backgroundColor: theme.card }]}>
                                {data.students.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Text style={[styles.emptyStateText, { color: theme.subtext }]}>No students assigned.</Text>
                                    </View>
                                ) : (
                                    data.students.map((student, index) => (
                                        <View key={student.id}>
                                            <View style={styles.listItem}>
                                                <View style={styles.listContent}>
                                                    <Text style={[styles.listTitle, { color: theme.text }]}>{student.name}</Text>
                                                    <Text style={[styles.listSubtitle, { color: theme.subtext }]}>
                                                        {student.status === 'Boarded' ? `Scanned: ${student.time}` : 'Not Boarded'}
                                                    </Text>
                                                </View>
                                                <View style={[
                                                    styles.badge,
                                                    { backgroundColor: student.status === 'Boarded' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(241, 196, 15, 0.15)' }
                                                ]}>
                                                    <Text style={[
                                                        styles.badgeText,
                                                        { color: student.status === 'Boarded' ? '#27AE60' : '#F39C12' }
                                                    ]}>
                                                        {student.status}
                                                    </Text>
                                                </View>
                                            </View>
                                            {index < data.students.length - 1 && (
                                                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                                            )}
                                        </View>
                                    ))
                                )}
                            </View>
                        </View>

                        {/* Alerts & Notifications */}
                        {data.alerts.length > 0 && (
                            <View style={styles.sectionContainer}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Alerts & Notifications</Text>
                                <View style={[styles.listCard, { backgroundColor: theme.card }]}>
                                    {data.alerts.map((alert, index) => (
                                        <View key={alert.id}>
                                            <View style={styles.listItem}>
                                                <Ionicons name="notifications-outline" size={24} color="#F39C12" style={{ marginRight: 15 }} />
                                                <View style={styles.listContent}>
                                                    <Text style={[styles.listTitle, { color: theme.text }]}>{alert.title}</Text>
                                                    <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>{alert.message}</Text>
                                                </View>
                                                <Text style={[styles.alertTime, { color: theme.textSecondary }]}>{alert.time}</Text>
                                            </View>
                                            {index < data.alerts.length - 1 && (
                                                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={{ height: 100 }} />
                    </>
                )}
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
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    card: {
        width: '48%', // 2-column grid
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
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 5,
    },
    detailCard: {
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    indicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusText: {
        fontWeight: '600',
        fontSize: 15,
    },
    lastUpdated: {
        fontSize: 12,
    },
    listCard: {
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    listContent: {
        flex: 1,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    listSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.5,
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontStyle: 'italic',
    },
    alertTime: {
        fontSize: 11,
        marginLeft: 10,
    },
});

export default DriverDashboard;
