import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const StudentProfileScreen = ({ user, onLogout, navigation }) => {
    const { theme, isDarkMode, toggleTheme } = useTheme();

    const InfoRow = ({ label, value, icon }) => (
        <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#333' : '#F0F3F4' }]}>
                <Ionicons name={icon} size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={[styles.label, { color: theme.subtext }]}>{label}</Text>
                <Text style={[styles.value, { color: theme.text }]}>{value || 'N/A'}</Text>
            </View>
        </View>
    );

    const handlePasswordReset = () => {
        // Navigate to password reset or show alert
        Alert.alert('Info', 'Password reset functionality is available on the login screen.');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary || '#3498DB' }]}>
                            <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase()}</Text>
                        </View>
                    </View>
                    <Text style={[styles.name, { color: theme.text }]}>
                        {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                    </Text>
                    <Text style={[styles.role, { color: theme.subtext }]}>Student</Text>
                </View>

                {/* Personal Info */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Information</Text>
                <View style={[styles.card, { backgroundColor: theme.card }]}>
                    <InfoRow label="Email" value={user?.email} icon="mail-outline" />
                    <InfoRow label="Username" value={user?.username} icon="person-outline" />
                </View>

                {/* Settings */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
                <View style={[styles.card, { backgroundColor: theme.card }]}>
                    <TouchableOpacity style={styles.settingRow} onPress={toggleTheme}>
                        <View style={styles.settingLeft}>
                            <Ionicons name={isDarkMode ? "moon" : "sunny"} size={22} color={theme.text} />
                            <Text style={[styles.settingText, { color: theme.text }]}>Dark Mode</Text>
                        </View>
                        <Ionicons name={isDarkMode ? "toggle" : "toggle-outline"} size={30} color={theme.primary || '#3498DB'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingRow} onPress={handlePasswordReset}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="lock-closed-outline" size={22} color={theme.text} />
                            <Text style={[styles.settingText, { color: theme.text }]}>Change Password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#E74C3C" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20 },
    header: { alignItems: 'center', marginBottom: 30, marginTop: 40 },
    avatarContainer: { marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 40, color: 'white', fontWeight: 'bold' },
    name: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    role: { fontSize: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
    card: { borderRadius: 15, padding: 15, marginBottom: 25, elevation: 2 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    infoContent: { flex: 1 },
    label: { fontSize: 12, marginBottom: 2 },
    value: { fontSize: 16, fontWeight: '500' },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    settingLeft: { flexDirection: 'row', alignItems: 'center' },
    settingText: { fontSize: 16, marginLeft: 15 },
    logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 15, backgroundColor: '#FDEDEC' },
    logoutText: { color: '#E74C3C', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});

export default StudentProfileScreen;
