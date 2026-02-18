import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert, Image, RefreshControl, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getToken } from '../../services/auth';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../config';

const ManagementDashboard = ({ user, onLogout }) => {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const navigation = useNavigation();
    const [stats, setStats] = useState({
        active_passes: 0,
        total_buses: 0,
        drivers_on_duty: 0,
        open_complaints: 0
    });
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const token = await getToken();
            const [statsRes, busesRes, usersRes] = await Promise.all([
                axios.get(`${API_URL}/dashboard/stats/`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/dashboard/buses/`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/users/`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const driversCount = Array.isArray(usersRes.data)
                ? usersRes.data.filter(u => u.is_driver).length
                : 0;

            const studentCount = Array.isArray(usersRes.data)
                ? usersRes.data.filter(u => u.is_student).length
                : 0;

            const busesCount = Array.isArray(busesRes.data) ? busesRes.data.length : 0;

            setStats({
                active_passes: studentCount, // Using student count as proxy for active passes
                total_buses: busesCount,
                drivers_on_duty: driversCount,
                open_complaints: statsRes.data?.open_complaints || 0
            });
            setBuses(Array.isArray(busesRes.data) ? busesRes.data : []);
        } catch (error) {
            console.log('Error fetching data:', error);
            // Alert.alert('Connection Error', `Failed to load dashboard data.\n${error.message}`);
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

    const handleDeleteBus = (busId, busNumber) => {
        Alert.alert(
            'Delete Bus',
            `Are you sure you want to delete Bus ${busNumber}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await getToken();
                            await axios.delete(`${API_URL}/dashboard/buses/${busId}/`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            Alert.alert('Success', 'Bus deleted successfully');
                            fetchData(); // Refresh list
                        } catch (error) {
                            console.log('Error deleting bus:', error);
                            Alert.alert('Error', 'Failed to delete bus.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <ImageBackground
            source={require('../../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0.15 : 1 }}
            resizeMode="cover"
        >
            {/* Absolute Header */}
            <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Overview</Text>
                        <Text style={styles.headerSubtitle}>Performance & Stats</Text>
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
                <Ionicons name="grid" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            {/* Scrollable Content */}
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
                        <View style={styles.statsGrid}>
                            <View style={[styles.statCard, { backgroundColor: theme.card, borderLeftColor: '#6C5CE7' }]}>
                                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(108, 92, 231, 0.2)' : '#F0F3FF' }]}>
                                    <Ionicons name="card" size={24} color="#6C5CE7" />
                                </View>
                                <View style={styles.statTextContainer}>
                                    <Text style={[styles.statValue, { color: theme.text }]}>{stats.active_passes || 0}</Text>
                                    <Text style={[styles.statLabel, { color: theme.subtext }]}>Active Student Passes</Text>
                                </View>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: theme.card, borderLeftColor: '#00B894' }]}>
                                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(0, 184, 148, 0.2)' : '#E6FFFA' }]}>
                                    <Ionicons name="bus" size={24} color="#00B894" />
                                </View>
                                <View style={styles.statTextContainer}>
                                    <Text style={[styles.statValue, { color: theme.text }]}>{stats.total_buses || 0}</Text>
                                    <Text style={[styles.statLabel, { color: theme.subtext }]}>Total Buses</Text>
                                </View>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: theme.card, borderLeftColor: '#FFA502' }]}>
                                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(255, 165, 2, 0.2)' : '#FFF5E6' }]}>
                                    <Ionicons name="id-card" size={24} color="#FFA502" />
                                </View>
                                <View style={styles.statTextContainer}>
                                    <Text style={[styles.statValue, { color: theme.text }]}>{stats.drivers_on_duty || 0}</Text>
                                    <Text style={[styles.statLabel, { color: theme.subtext }]}>Drivers on Duty</Text>
                                </View>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: theme.card, borderLeftColor: '#FF7675' }]}>
                                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(255, 118, 117, 0.2)' : '#FFF0F0' }]}>
                                    <Ionicons name="alert-circle" size={24} color="#FF7675" />
                                </View>
                                <View style={styles.statTextContainer}>
                                    <Text style={[styles.statValue, { color: theme.text }]}>{stats.open_complaints || 0}</Text>
                                    <Text style={[styles.statLabel, { color: theme.subtext }]}>Open Complaints</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.settingsButton, { backgroundColor: theme.card }]}
                            onPress={() => navigation.navigate('ScheduleSettings')}
                        >
                            <View style={styles.settingsIconContainer}>
                                <Ionicons name="time" size={24} color="#0984e3" />
                            </View>
                            <View style={styles.settingsTextContainer}>
                                <Text style={[styles.settingsTitle, { color: theme.text }]}>Trip Schedule Settings</Text>
                                <Text style={[styles.settingsSubtitle, { color: theme.subtext }]}>Configure Morning/Evening trip timings</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={theme.subtext} />
                        </TouchableOpacity>

                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Managed Buses</Text>

                        {buses.length === 0 ? (
                            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
                                <Ionicons name="bus-outline" size={48} color={theme.subtext} />
                                <Text style={[styles.emptyStateText, { color: theme.subtext }]}>No buses added yet.</Text>
                            </View>
                        ) : (
                            buses.map((bus) => (
                                <View key={bus.id} style={[styles.busCard, { backgroundColor: theme.card }]}>
                                    <View style={styles.busCardHeader}>
                                        <View style={styles.busInfo}>
                                            <View style={styles.busIconBadge}>
                                                <Ionicons name="bus" size={20} color="#FFF" />
                                            </View>
                                            <View>
                                                <Text style={[styles.busNumber, { color: theme.text }]}>{bus.bus_number}</Text>
                                                <Text style={[styles.plateNumber, { color: theme.subtext }]}>{bus.number_plate}</Text>
                                            </View>
                                        </View>
                                        {bus.photo && (
                                            <Image source={{ uri: `${API_URL}${bus.photo}` }} style={styles.busThumbnail} />
                                        )}
                                    </View>

                                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                                    <View style={styles.busDetailsRow}>
                                        <View style={styles.detailItem}>
                                            <Ionicons name="location-outline" size={16} color={theme.subtext} />
                                            <Text style={[styles.detailText, { color: theme.subtext }]}>{bus.destination || 'No Destination'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.editButton]}
                                            onPress={() => navigation.navigate('EditBus', { bus })}
                                        >
                                            <Ionicons name="create-outline" size={18} color="#FFF" />
                                            <Text style={styles.actionButtonText}>Edit</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.deleteButton]}
                                            onPress={() => handleDeleteBus(bus.id, bus.bus_number)}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#FFF" />
                                            <Text style={styles.actionButtonText}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
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
    statTextContainer: {
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 10,
    },
    busCard: {
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    busCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    busInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    busIconBadge: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#3498DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    busNumber: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    plateNumber: {
        fontSize: 12,
    },
    busThumbnail: {
        width: 50,
        height: 50,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    divider: {
        height: 1,
        marginVertical: 10,
        opacity: 0.1,
    },
    busDetailsRow: {
        marginBottom: 15,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    detailText: {
        marginLeft: 5,
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginLeft: 10,
    },
    editButton: {
        backgroundColor: '#F39C12',
    },
    deleteButton: {
        backgroundColor: '#E74C3C',
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderStyle: 'dashed',
    },
    emptyStateText: {
        marginTop: 10,
        fontSize: 16,
    },
    settingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    settingsIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: 'rgba(9, 132, 227, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingsTextContainer: {
        flex: 1,
    },
    settingsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    settingsSubtitle: {
        fontSize: 12,
    },
});

export default ManagementDashboard;
