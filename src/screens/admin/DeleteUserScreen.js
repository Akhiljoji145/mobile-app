import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getToken } from '../../services/auth';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

import { API_URL } from '../../config';

const DeleteUserScreen = ({ navigation }) => {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        icon: '',
        color: '',
        type: '', // 'delete' or 'block'
        data: null // { id, username, isActive }
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/users/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.log('Error fetching users:', error);
            Alert.alert('Connection Error', `Failed to load users.\n${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUsers();
        }, [])
    );

    const confirmAction = async () => {
        const { type, data } = modalConfig;
        setModalVisible(false); // Close immediately or wait? Better close for UX.

        try {
            const token = await getToken();
            if (type === 'delete') {
                await axios.delete(`${API_URL}/users/${data.id}/delete/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else if (type === 'block') {
                // Toggle block
                await axios.post(`${API_URL}/users/${data.id}/toggle-block/`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchUsers();
            // Optional: Success toast could go here
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Action failed');
        }
    };

    const handleDelete = (id, username) => {
        setModalConfig({
            title: 'Delete User',
            message: `Are you sure you want to permanently delete "${username}"?\nThis will also delete all their managed users.`,
            icon: 'trash',
            color: '#E74C3C',
            type: 'delete',
            data: { id }
        });
        setModalVisible(true);
    };

    const handleBlock = (id, username, isActive) => {
        setModalConfig({
            title: isActive ? 'Block User' : 'Unblock User',
            message: isActive
                ? `Are you sure you want to block "${username}"?\nThey will lose access to the app.`
                : `Are you sure you want to unblock "${username}"?`,
            icon: isActive ? 'lock-closed' : 'lock-open',
            color: '#F1C40F',
            type: 'block',
            data: { id, isActive }
        });
        setModalVisible(true);
    };

    const handleEdit = (user) => {
        navigation.navigate('EditManagementUser', { user });
    };

    const getRoleLabel = (item) => {
        if (item.is_management) return { label: 'Management', color: '#0984E3' };
        return { label: 'Student', color: '#2D3436' };
    };

    const renderItem = ({ item }) => {
        const role = getRoleLabel(item);
        return (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={[styles.avatarContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#F0F3FF' }]}>
                    <Text style={[styles.avatarText, { color: theme.headerBg }]}>{item.username.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={[styles.username, { color: theme.text }]}>{item.username}</Text>
                    <Text style={[styles.email, { color: theme.subtext }]}>{item.email}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: role.color + '20' }]}>
                        <Text style={[styles.roleText, { color: role.color }]}>{role.label}</Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.iconButton, { backgroundColor: isDarkMode ? 'rgba(52, 152, 219, 0.2)' : '#E3F2FD', marginRight: 8 }]}>
                        <Ionicons name="create-outline" size={20} color="#3498DB" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleBlock(item.id, item.username, item.is_active)} style={[styles.iconButton, { backgroundColor: isDarkMode ? 'rgba(241, 196, 15, 0.2)' : '#FFF9C4', marginRight: 8 }]}>
                        <Ionicons name={item.is_active ? "lock-open-outline" : "lock-closed"} size={20} color="#F1C40F" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id, item.username)} style={[styles.iconButton, { backgroundColor: isDarkMode ? 'rgba(231, 76, 60, 0.2)' : '#FFF5F5' }]}>
                        <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                    </TouchableOpacity>
                </View>
            </View >
        );
    };

    return (
        <ImageBackground
            source={require('../../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0.15 : 1 }}
            resizeMode="cover"
        >
            {/* Absolute Header - Stays behind content */}
            <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Manage Users</Text>
                        <Text style={styles.headerSubtitle}>Edit, Block & Delete Users</Text>
                    </View>
                    <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
                        <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <Ionicons name="people" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            {/* List - Floats over header */}
            {loading ? (
                <ActivityIndicator size="large" color={theme.headerBg} style={{ marginTop: 250 }} />
            ) : (
                <FlatList
                    data={users.filter(u => u.is_management)}
                    keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.muted }]}>No users found.</Text>}
                />
            )}

            {/* Custom Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={[styles.modalIconContainer, { backgroundColor: modalConfig.color + '20' }]}>
                            <Ionicons name={modalConfig.icon} size={32} color={modalConfig.color} />
                        </View>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>{modalConfig.title}</Text>
                        <Text style={[styles.modalMessage, { color: theme.subtext }]}>{modalConfig.message}</Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}>
                                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmAction} style={[styles.modalButton, { backgroundColor: modalConfig.color }]}>
                                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        zIndex: 10,
        elevation: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 2,
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
    listContent: {
        paddingTop: 200, // Adjusted for 180px header
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    card: {
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 13,
        marginTop: 2,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginTop: 5,
    },
    roleText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 10,
        borderRadius: 10,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    modalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
    },
});

export default DeleteUserScreen;
