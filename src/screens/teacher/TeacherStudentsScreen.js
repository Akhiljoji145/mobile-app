
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ScrollView, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { getToken } from '../../services/auth';
import { API_URL } from '../../config';
import { useTheme } from '../../context/ThemeContext';

const TeacherStudentsScreen = () => {
    const { theme, isDarkMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All'); // All, Boarded, Not Boarded, Absent
    const [students, setStudents] = useState([]);

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

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' || student.status === filter || (filter === 'Not Boarded' && (student.status === 'Not Boarded' || student.status === 'Absent' || student.status === 'Leave')); // Simplified logic for demo

        if (filter === 'All') return matchesSearch;
        if (filter === 'Boarded') return matchesSearch && student.status === 'Boarded';
        if (filter === 'Pending') return matchesSearch && student.status === 'Not Boarded';
        if (filter === 'Other') return matchesSearch && (student.status === 'Absent' || student.status === 'Leave');

        return matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Boarded': return '#00B894';
            case 'Not Boarded': return '#FF7675';
            case 'Absent': return '#636E72'; // グレー
            case 'Leave': return '#FAB1A0';
            default: return '#636E72';
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

    const renderStudentItem = ({ item }) => (
        <View style={[styles.studentCard, { backgroundColor: theme.card }]}>
            <View style={styles.studentInfo}>
                <View style={[styles.avatar, { backgroundColor: item.image ? (isDarkMode ? '#333' : '#EEE') : getAvatarColor(item.name) }]}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.avatarImage} />
                    ) : (
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>
                            {item.name ? item.name.charAt(0).toUpperCase() : '?'}
                        </Text>
                    )}
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.studentName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.studentId, { color: theme.subtext }]}>Class: {item.class}</Text>
                </View>
            </View>
            <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
                {item.time && (
                    <Text style={[styles.timeText, { color: theme.subtext }]}>{item.time}</Text>
                )}
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
                        <Text style={styles.headerTitle}>Students</Text>
                        <Text style={styles.headerSubtitle}>Manage & View Roster</Text>
                    </View>
                </View>
                <Ionicons name="people" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            {/* Scrollable Content wrapper */}
            <View style={styles.scrollContent}>
                {/* Search and Filters */}
                <View style={[styles.searchFilterContainer, { backgroundColor: theme.card, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }]}>
                    <View style={[styles.searchBar, { backgroundColor: theme.inputBg }]}>
                        <Ionicons name="search" size={20} color={theme.subtext} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.text }]}
                            placeholder="Search students..."
                            placeholderTextColor={theme.subtext}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                        {['All', 'Boarded', 'Pending', 'Other'].map((f) => (
                            <TouchableOpacity
                                key={f}
                                style={[
                                    styles.filterChip,
                                    filter === f ? styles.activeChip : { backgroundColor: theme.inputBg }
                                ]}
                                onPress={() => setFilter(f)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    filter === f ? { color: '#FFF' } : { color: theme.subtext }
                                ]}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <FlatList
                    data={filteredStudents}
                    renderItem={renderStudentItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color={theme.subtext} />
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
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    filterContainer: {
        flexDirection: 'row',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    activeChip: {
        backgroundColor: '#3498DB',
    },
    filterText: {
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        padding: 15,
    },
    studentCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
    },
    textContainer: {
        justifyContent: 'center',
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    studentId: {
        fontSize: 12,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    timeText: {
        fontSize: 11,
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

export default TeacherStudentsScreen;
