import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getToken } from '../../services/auth';
import { useTheme } from '../../context/ThemeContext';

import { API_URL } from '../../config';

const AdminDashboard = ({ user, onLogout }) => {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const [stats, setStats] = useState({
        total_users: 0,
        active_users: 0,
        management_users: 0,
        verified_institutions: 0,
        pending_institutions: 0,
        management_breakdown: [],
        revenue: 0 // Kept in state to avoid breaking logical dependencies, but will not be displayed
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/dashboard/stats/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.log('Error fetching stats:', error);
            // Alert.alert('Connection Error', `Failed to load dashboard data.\n${error.message}`);
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
            {/* Absolute Header Overlay to ensure text readability if needed, or keep existing design */}
            <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Dashboard</Text>
                        <Text style={styles.headerSubtitle}>Overview & Performance</Text>
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
            >
                {loading ? (
                    <ActivityIndicator size="large" color={theme.headerBg} style={{ marginTop: 100 }} />
                ) : (
                    <>
                        <View style={styles.sectionContainer}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Total Registered Institutions</Text>

                            <View style={styles.statsGrid}>
                                {/* Verified Institutions */}
                                <View style={[styles.statCard, { backgroundColor: theme.card, borderLeftColor: '#2ECC71' }]}>
                                    <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(46, 204, 113, 0.2)' : '#E8F5E9' }]}>
                                        <Ionicons name="checkmark-circle" size={24} color="#2ECC71" />
                                    </View>
                                    <View style={styles.statTextContainer}>
                                        <Text style={[styles.statValue, { color: theme.text }]}>{stats.verified_institutions}</Text>
                                        <Text style={[styles.statLabel, { color: theme.subtext }]}>Verified Institutions</Text>
                                    </View>
                                </View>

                                {/* Pending Verifications */}
                                <View style={[styles.statCard, { backgroundColor: theme.card, borderLeftColor: '#F1C40F' }]}>
                                    <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(241, 196, 15, 0.2)' : '#FFF9C4' }]}>
                                        <Ionicons name="time" size={24} color="#F1C40F" />
                                    </View>
                                    <View style={styles.statTextContainer}>
                                        <Text style={[styles.statValue, { color: theme.text }]}>{stats.pending_institutions}</Text>
                                        <Text style={[styles.statLabel, { color: theme.subtext }]}>Pending Verifications</Text>
                                    </View>
                                </View>

                                {/* Total Active Users */}
                                <View style={[styles.statCard, { backgroundColor: theme.card, borderLeftColor: '#3498DB' }]}>
                                    <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(52, 152, 219, 0.2)' : '#E3F2FD' }]}>
                                        <Ionicons name="people" size={24} color="#3498DB" />
                                    </View>
                                    <View style={styles.statTextContainer}>
                                        <Text style={[styles.statValue, { color: theme.text }]}>{stats.active_users}</Text>
                                        <Text style={[styles.statLabel, { color: theme.subtext }]}>Total Active Users</Text>
                                    </View>
                                </View>

                                {/* Total Users Card (Optional, keeping it as it was likely useful or requested to be part of the set, using total_users or management_users as per context. 
                                    The user asked "add this too inside...", implies these are additions. I'll keep Total Users as well if space permits or just show these 3 as requested.)
                                    I will stick to the 3 requested items to be safe and clean.
                                */}
                            </View>
                        </View>

                        {/* User Distribution by Institution */}
                        {stats.management_breakdown && stats.management_breakdown.length > 0 && (
                            <View style={styles.sectionContainer}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Users per Institution</Text>
                                <View style={[styles.listCard, { backgroundColor: theme.card }]}>
                                    {stats.management_breakdown.map((item, index) => {
                                        const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA502', '#A3CB38', '#5758BB', '#D980FA'];
                                        const avatarColor = avatarColors[index % avatarColors.length];

                                        return (
                                            <View key={item.id}>
                                                <View style={styles.listItem}>
                                                    <View style={styles.listIconContainer}>
                                                        <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
                                                            <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.listContent}>
                                                        <Text style={[styles.listTitle, { color: theme.text }]}>{item.username}</Text>
                                                        <Text style={[styles.listSubtitle, { color: theme.subtext }]}>{item.email}</Text>
                                                    </View>
                                                    <View style={[styles.badge, { backgroundColor: isDarkMode ? 'rgba(108, 92, 231, 0.2)' : '#F0F3FF' }]}>
                                                        <Text style={styles.badgeText}>{item.active_users} Users</Text>
                                                    </View>
                                                </View>
                                                {index < stats.management_breakdown.length - 1 && (
                                                    <View style={[styles.divider, { backgroundColor: theme.background }]} />
                                                )}
                                            </View>
                                        )
                                    })}
                                </View>
                            </View>
                        )}


                    </>
                )}
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
        height: 180, // Reduced height
        paddingTop: 60,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 10, // Ensure header is on top of ScrollView to receive touches
        elevation: 10, // For Android
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
        paddingTop: 200, // Adjusted for 180px header
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    statCard: {
        width: '100%',
        marginBottom: 15, // Changed to stack vertically or use full width if needed, but grid needs 48% for 2 cols. 
        // Let's keep 48% if we want a grid, but here we have 3 items. 2 in one row, 1 in next.
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
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        marginLeft: 5,
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
    listIconContainer: {
        marginRight: 15,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
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
        color: '#6C5CE7',
        fontWeight: 'bold',
        fontSize: 12,
    },
    divider: {
        height: 1,
        width: '100%',
    },
});

export default AdminDashboard;
