import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const HomeScreen = ({ user, onLogout, navigation }) => {
    const { theme, toggleTheme, isDarkMode } = useTheme();

    const getRole = () => {
        if (!user) return 'Guest';
        if (user.is_superuser) return 'Superuser';
        if (user.is_management) return 'Management';
        if (user.is_teacher) return 'Teacher';
        if (user.is_driver) return 'Driver';
        if (user.is_parent) return 'Parent';
        if (user.is_student) return 'Student';
        return 'User';
    };

    return (
        <ImageBackground
            source={require('../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0.15 : 1 }}
            resizeMode="cover"
        >
            {/* Absolute Header */}
            <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Welcome Back</Text>
                        <Text style={styles.headerSubtitle}>Personal Portal</Text>
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
                <Ionicons name="person-circle" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View style={[styles.card, { backgroundColor: theme.card, borderLeftColor: '#3498DB' }]}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Image source={require('../../assets/icon.png')} style={styles.avatar} />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.userName, { color: theme.text }]}>{user?.username || 'Guest'}</Text>
                            <View style={styles.roleTagContainer}>
                                <Text style={styles.roleTagText}>{getRole()}</Text>
                            </View>
                            {user?.is_student && (
                                <TouchableOpacity
                                    style={styles.scanButton}
                                    onPress={() => navigation.navigate('StudentScanner')}
                                >
                                    <Ionicons name="qr-code-outline" size={16} color="white" style={{ marginRight: 5 }} />
                                    <Text style={styles.scanButtonText}>Scan to Board</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={[styles.label, { color: theme.subtext }]}>Email</Text>
                            <Text style={[styles.value, { color: theme.text }]}>{user?.email || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={[styles.label, { color: theme.subtext }]}>Status</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Active</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Additional Info / Actions based on Role */}
                {user?.is_superuser && (
                    <View style={[styles.card, { backgroundColor: '#FFF5F5', borderLeftColor: '#E74C3C' }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="shield-checkmark" size={24} color="#E74C3C" />
                            <Text style={[styles.cardTitle, { color: '#C0392B' }]}>Admin Access</Text>
                        </View>
                        <Text style={[styles.cardBody, { color: '#7F8C8D' }]}>
                            You have full superuser privileges. Access the Admin Dashboard for system-wide controls.
                        </Text>
                    </View>
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
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderLeftWidth: 5,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: '#FFF',
    },
    profileInfo: {
        marginLeft: 15,
        flex: 1,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    roleTagContainer: {
        backgroundColor: '#E8F6F3',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 15,
        alignSelf: 'flex-start',
    },
    roleTagText: {
        color: '#1ABC9C',
        fontWeight: 'bold',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoItem: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        marginBottom: 5,
        fontWeight: '600',
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
    },
    statusBadge: {
        backgroundColor: '#DCFCE7',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#166534',
        fontWeight: 'bold',
        fontSize: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    cardBody: {
        fontSize: 14,
        lineHeight: 20,
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionCard: {
        width: '48%',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3498DB',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        marginTop: 5,
        alignSelf: 'flex-start',
    },
    scanButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
});

export default HomeScreen;
