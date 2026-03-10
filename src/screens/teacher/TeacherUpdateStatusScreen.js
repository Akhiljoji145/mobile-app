
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { getToken } from '../../services/auth';
import { API_URL } from '../../config';
import { useTheme } from '../../context/ThemeContext';

const TeacherUpdateStatusScreen = () => {
    const { theme, isDarkMode } = useTheme();
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/teacher/students/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data);
        } catch (error) {
            console.log('Error fetching student list:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            // Optimistic Update
            setStudents(prev => prev.map(s =>
                s.id === id ? { ...s, status: newStatus } : s
            ));

            const token = await getToken();
            await axios.post(`${API_URL}/teacher/student/update-status/`,
                { student_id: id, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert("Success", `Status updated to ${newStatus}`);
        } catch (error) {
            console.log('Error updating status:', error);
            Alert.alert("Error", "Failed to update status");
            // Revert optimistic update if needed, fetching data again is safer
            fetchData();
        }
    };

    // Generate a background color based on the student's name
    const getAvatarColor = (name) => {
        const colors = ['#6C5CE7', '#00B894', '#0984E3', '#E17055', '#D63031', '#FDCB6E', '#00CEC9', '#E84393'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderStudentItem = ({ item }) => (
        <View style={[styles.studentCard, { backgroundColor: theme.card }]}>
            <View style={styles.studentInfo}>
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>
                        {item.name ? item.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.studentName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.statusText, { color: item.status === 'Present' ? theme.success : item.status === 'Absent' ? theme.danger : theme.warning }]}>
                        Current: {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[
                        styles.statusButton,
                        item.status === 'Absent' ? { backgroundColor: theme.danger } : { backgroundColor: theme.inputBg }
                    ]}
                    onPress={() => handleUpdateStatus(item.id, 'Absent')}
                >
                    <Text style={[
                        styles.buttonText,
                        item.status === 'Absent' ? { color: '#FFF' } : { color: theme.danger }
                    ]}>Absent</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.statusButton,
                        item.status === 'Leave' ? { backgroundColor: '#F39C12' } : { backgroundColor: theme.inputBg }
                    ]}
                    onPress={() => handleUpdateStatus(item.id, 'Leave')}
                >
                    <Text style={[
                        styles.buttonText,
                        item.status === 'Leave' ? { color: '#FFF' } : { color: '#F39C12' }
                    ]}>Leave</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.statusButton,
                        item.status === 'Late' ? { backgroundColor: '#6C5CE7' } : { backgroundColor: theme.inputBg }
                    ]}
                    onPress={() => handleUpdateStatus(item.id, 'Late')}
                >
                    <Text style={[
                        styles.buttonText,
                        item.status === 'Late' ? { color: '#FFF' } : { color: '#6C5CE7' }
                    ]}>Late</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ImageBackground
            source={isDarkMode ? null : require('../../../assets/background.jpg')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0 : 1 }}
            resizeMode="cover"
        >
            {/* Absolute Header Overlay */}
            <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Update Status</Text>
                        <Text style={styles.headerSubtitle}>Quick Actions</Text>
                    </View>
                </View>
                <Ionicons name="create" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            <View style={styles.scrollContent}>
                <View style={[styles.searchFilterContainer, { backgroundColor: theme.card, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }]}>
                    <View style={[styles.searchBar, { backgroundColor: theme.inputBg }]}>
                        <Ionicons name="search" size={20} color={theme.subtext} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.text }]}
                            placeholder="Search for quick update..."
                            placeholderTextColor={theme.subtext}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <FlatList
                    data={filteredStudents}
                    renderItem={renderStudentItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyText, { color: theme.subtext }]}>No students found</Text>
                        </View>
                    }
                />
            </View>
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
    headerIcon: {
        position: 'absolute',
        right: -20,
        bottom: -40,
    },
    scrollContent: {
        flex: 1,
        paddingTop: 200, // accommodate absolute header
    },
    searchFilterContainer: {
        padding: 15,
        paddingBottom: 10,
        borderRadius: 15,
        marginHorizontal: 15,
        marginBottom: 15,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 45,
        borderRadius: 12,
        marginBottom: 5,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    listContent: {
        padding: 15,
        paddingTop: 0,
    },
    studentCard: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        justifyContent: 'center',
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 3,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
    },
});

export default TeacherUpdateStatusScreen;
