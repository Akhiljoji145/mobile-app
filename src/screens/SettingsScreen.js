import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = ({ onLogout }) => {
    const { theme, toggleTheme, isDarkMode } = useTheme();

    const renderSettingItem = (icon, label, onPress, rightElement = null, color = '#3498DB') => (
        <TouchableOpacity style={[styles.item, { backgroundColor: theme.card }]} onPress={onPress}>
            <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <Text style={[styles.itemLabel, { color: theme.text }]}>{label}</Text>
            {rightElement ? rightElement : <Ionicons name="chevron-forward" size={20} color={theme.subtext} />}
        </TouchableOpacity>
    );

    return (
        <ImageBackground
            source={require('../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            resizeMode="cover"
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionHeader, { color: theme.subtext }]}>Preferences</Text>

                <View style={[styles.item, { backgroundColor: theme.card }]}>
                    <View style={[styles.iconBox, { backgroundColor: '#F1C40F20' }]}>
                        <Ionicons name={isDarkMode ? "moon" : "sunny"} size={22} color="#F1C40F" />
                    </View>
                    <Text style={[styles.itemLabel, { color: theme.text }]}>Dark Mode</Text>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#767577', true: '#F1C40F' }}
                        thumbColor={'#fff'}
                    />
                </View>

                {renderSettingItem('notifications-outline', 'Push Notifications', () => { }, <Switch value={true} onValueChange={() => { }} trackColor={{ false: '#767577', true: '#2ECC71' }} thumbColor={'#fff'} />, '#2ECC71')}

                <Text style={[styles.sectionHeader, { color: theme.subtext, marginTop: 20 }]}>Account</Text>
                {renderSettingItem('person-outline', 'Edit Profile', () => { })}
                {renderSettingItem('lock-closed-outline', 'Change Password', () => { }, null, '#E74C3C')}
                {renderSettingItem('help-circle-outline', 'Help & Support', () => { }, null, '#9B59B6')}

                <TouchableOpacity style={[styles.logoutButton, { borderColor: '#E74C3C' }]} onPress={onLogout}>
                    <Text style={[styles.logoutText, { color: '#E74C3C' }]}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
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
    content: {
        padding: 20,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
        textTransform: 'uppercase',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    itemLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        marginTop: 30,
        borderWidth: 1,
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SettingsScreen;
