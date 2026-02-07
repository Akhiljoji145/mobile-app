import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DriverDashboard from '../screens/driver/DriverDashboard';
import DriverBroadcastScreen from '../screens/driver/DriverBroadcastScreen';

const Tab = createMaterialTopTabNavigator();

const DriverNavigator = ({ user, onLogout }) => {
    const { theme, isDarkMode } = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
            <Tab.Navigator
                tabBarPosition="bottom"
                screenOptions={({ route }) => ({
                    tabBarShowIcon: true,
                    tabBarShowLabel: true,
                    tabBarActiveTintColor: '#3498DB',
                    tabBarInactiveTintColor: isDarkMode ? '#7F8C8D' : 'gray',
                    tabBarStyle: {
                        backgroundColor: theme.card,
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        height: 60,
                        borderTopWidth: 0,
                    },
                    tabBarLabelStyle: {
                        fontSize: 10,
                        textTransform: 'none',
                        fontWeight: '600',
                        marginTop: -5,
                    },
                    tabBarIndicatorStyle: {
                        backgroundColor: '#3498DB',
                        height: 3,
                        top: 0,
                    },
                    tabBarIcon: ({ focused, color }) => {
                        let iconName;

                        if (route.name === 'Dashboard') {
                            iconName = focused ? 'speedometer' : 'speedometer-outline';
                        } else if (route.name === 'Broadcast') {
                            iconName = focused ? 'megaphone' : 'megaphone-outline';
                        }

                        return <Ionicons name={iconName} size={24} color={color} />;
                    },
                    tabBarIconStyle: {
                        marginTop: -5,
                    },
                    swipeEnabled: true,
                    animationEnabled: true,
                })}
            >
                <Tab.Screen name="Dashboard">
                    {props => <DriverDashboard {...props} user={user} onLogout={onLogout} />}
                </Tab.Screen>
                <Tab.Screen name="Broadcast">
                    {props => <DriverBroadcastScreen {...props} user={user} />}
                </Tab.Screen>
            </Tab.Navigator >
        </SafeAreaView >
    );
};

export default DriverNavigator;
