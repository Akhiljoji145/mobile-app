import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { getToken } from '../../services/auth';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../config';

const ManageMembersScreen = ({ navigation }) => {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchMembers();
        }, [])
    );

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/users/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMembers(response.data);
        } catch (error) {
            console.log("Error fetching members", error);
            Alert.alert("Error", "Failed to load members.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        Alert.alert(
            "Confirm Delete",
            `Are you sure you want to delete ${name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await getToken();
                            await axios.delete(`${API_URL}/users/${id}/delete/`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            setMembers(prev => prev.filter(m => m.id !== id));
                            Alert.alert("Success", "User deleted successfully.");
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete user.");
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = (member) => {
        navigation.navigate('EditMember', { member });
    };

    const renderMember = ({ item }) => {
        let role = 'Member';
        if (item.is_teacher) role = 'Teacher';
        else if (item.is_driver) role = 'Driver';
        else if (item.is_student) role = 'Student';
        else if (item.is_parent) role = 'Parent';
        else if (item.is_admin) role = 'Admin';

        return (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={item.is_teacher ? "school" : item.is_driver ? "bus" : "person"}
                            size={24}
                            color="#3498DB"
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.name, { color: theme.text }]}>{item.username}</Text>
                        <Text style={[styles.email, { color: theme.subtext }]}>{item.email}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{role}</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.actions, { borderTopColor: theme.borderColor }]}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                        <Ionicons name="create-outline" size={20} color="#3498DB" />
                        <Text style={[styles.actionText, { color: "#3498DB" }]}>Edit</Text>
                    </TouchableOpacity>
                    <View style={[styles.verticalDivider, { backgroundColor: theme.borderColor }]} />
                    <TouchableOpacity onPress={() => handleDelete(item.id, item.username)} style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                        <Text style={[styles.actionText, { color: "#E74C3C" }]}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <ImageBackground
            source={require('../../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0.15 : 1 }}
            resizeMode="cover"
        >
            {/* Absolute Header - Matching other screens */}
            <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Manage Members</Text>
                        <Text style={styles.headerSubtitle}>{members.length} Total Members</Text>
                    </View>
                    <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
                        <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <Ionicons name="people" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3498DB" />
                </View>
            ) : (
                <FlatList
                    data={members}
                    keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                    renderItem={renderMember}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={48} color={theme.subtext} />
                            <Text style={[styles.emptyText, { color: theme.subtext }]}>No members found.</Text>
                        </View>
                    }
                />
            )}
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
    listContent: {
        paddingTop: 200, // Adjusted for 180px header
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },
    cardContent: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    email: {
        fontSize: 14,
        marginBottom: 5,
    },
    roleBadge: {
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: 12,
        color: '#3498DB',
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        borderTopWidth: 1,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
    },
    actionText: {
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 14,
    },
    verticalDivider: {
        width: 1,
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
    }
});

export default ManageMembersScreen;
