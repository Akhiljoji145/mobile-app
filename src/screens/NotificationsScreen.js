import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const NotificationsScreen = () => {
    const { theme } = useTheme();

    const notifications = [
        { id: '1', title: 'Welcome!', message: 'Welcome to EduTransit.', time: 'Just now', icon: 'star', color: '#F1C40F' },
        { id: '2', title: 'Profile Updated', message: 'Your profile details have been successfully updated.', time: '2 hrs ago', icon: 'person', color: '#3498DB' },
        // Add more mock data if needed
    ];

    const renderItem = ({ item }) => (
        <View style={[styles.notificationCard, { backgroundColor: theme.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.message, { color: theme.subtext }]}>{item.message}</Text>
                <Text style={[styles.time, { color: theme.subtext }]}>{item.time}</Text>
            </View>
        </View>
    );

    return (
        <ImageBackground
            source={require('../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            resizeMode="cover"
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                contentContainerStyle={styles.listContent}
            />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    listContent: {
        padding: 20,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    message: {
        fontSize: 14,
        marginBottom: 5,
    },
    time: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});

export default NotificationsScreen;
