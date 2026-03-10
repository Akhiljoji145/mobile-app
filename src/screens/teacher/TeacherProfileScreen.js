
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ImageBackground, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { getToken } from '../../services/auth';
import { API_URL } from '../../config';
import { useTheme } from '../../context/ThemeContext';

const TeacherProfileScreen = ({ user: initialUser, onLogout, navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(false);

    // Generate a background color based on the user's name
    const getAvatarColor = (name) => {
        const colors = ['#6C5CE7', '#00B894', '#0984E3', '#E17055', '#D63031', '#FDCB6E', '#00CEC9', '#E84393'];
        let hash = 0;
        const str = name || '?';
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    useFocusEffect(
        useCallback(() => {
            const fetchProfile = async () => {
                setLoading(true);
                try {
                    const token = await getToken();
                    const response = await axios.get(`${API_URL}/users/me/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data) {
                        setUser(response.data);
                    }
                } catch (error) {
                    console.log('Error fetching fresh profile:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        }, [])
    );

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: onLogout }
            ]
        );
    };

    const handlePasswordReset = () => {
        navigation.navigate('ChangePassword');
    };

    return (
        <ImageBackground
            source={isDarkMode ? null : require('../../../assets/background.jpg')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0 : 1 }}
        >
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <View style={styles.profileHeader}>
                    <View style={[styles.avatarContainer, { backgroundColor: getAvatarColor(user?.username) }]}>
                        {user?.profile_picture ? (
                            <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
                        ) : (
                            <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#FFF' }}>
                                {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.name}>{(user?.first_name || user?.last_name) ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim() : user?.username}</Text>
                    <Text style={styles.role}>Class Teacher - {user?.class_in_charge_name || 'Not Assigned'}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Information</Text>

                    <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                        <Ionicons name="mail-outline" size={20} color={theme.subtext} />
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: theme.subtext }]}>Email</Text>
                            <Text style={[styles.infoValue, { color: theme.text }]}>{user?.email}</Text>
                        </View>
                    </View>

                    <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                        <Ionicons name="call-outline" size={20} color={theme.subtext} />
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: theme.subtext }]}>Phone</Text>
                            <Text style={[styles.infoValue, { color: theme.text }]}>{user?.phone || 'Not Provided'}</Text>
                        </View>
                    </View>

                    <View style={[styles.infoRow, { borderBottomColor: theme.border, borderBottomWidth: 0 }]}>
                        <Ionicons name="school-outline" size={20} color={theme.subtext} />
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: theme.subtext }]}>Organization</Text>
                            <Text style={[styles.infoValue, { color: theme.text }]}>{user?.resolved_organization_name || 'EduTransit'}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: theme.card, paddingVertical: 5 }]}>
                    <TouchableOpacity style={[styles.infoRow, { paddingVertical: 15, borderBottomWidth: 0 }]} onPress={handlePasswordReset}>
                        <Ionicons name="lock-closed-outline" size={20} color={theme.subtext} />
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoValue, { color: theme.text, fontSize: 16 }]}>Change Password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.subtext} style={{ position: 'absolute', right: 0 }} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.danger }]} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#FFF" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.versionContainer}>
                <Text style={[styles.versionText, { color: theme.subtext }]}>App Version 1.0.0</Text>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    profileHeader: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#FFF',
        marginBottom: 15,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 5,
    },
    role: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    content: {
        padding: 20,
    },
    section: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    infoTextContainer: {
        marginLeft: 15,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 15,
        marginTop: 10,
    },
    logoutText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    versionContainer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    versionText: {
        fontSize: 12,
    }
});

export default TeacherProfileScreen;
