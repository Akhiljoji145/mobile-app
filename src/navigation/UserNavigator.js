import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createMaterialTopTabNavigator();

const UserNavigator = ({ user, onLogout }) => {
    const { theme, isDarkMode } = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
            <Tab.Navigator
                tabBarPosition="bottom"
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color }) => {
                        let iconName;

                        if (route.name === 'Home') {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (route.name === 'Notifications') {
                            iconName = focused ? 'notifications' : 'notifications-outline';
                        } else if (route.name === 'Settings') {
                            iconName = focused ? 'settings' : 'settings-outline';
                        }

                        return <Ionicons name={iconName} size={24} color={color} />;
                    },
                    tabBarActiveTintColor: '#3498DB',
                    tabBarInactiveTintColor: isDarkMode ? '#7F8C8D' : 'gray',
                    tabBarShowIcon: true,
                    tabBarIndicatorStyle: {
                        backgroundColor: '#3498DB',
                        height: 3,
                        top: 0,
                    },
                    tabBarStyle: {
                        backgroundColor: theme.card,
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        height: 60,
                        borderTopWidth: isDarkMode ? 0 : 0,
                    },
                    tabBarLabelStyle: {
                        fontSize: 10,
                        textTransform: 'none',
                        fontWeight: '600',
                        marginTop: -5,
                    },
                    tabBarIconStyle: {
                        marginTop: -5,
                    },
                    swipeEnabled: true,
                    animationEnabled: true,
                })}
            >
                <Tab.Screen name="Home">
                    {props => <HomeScreen {...props} user={user} onLogout={onLogout} />}
                </Tab.Screen>
                <Tab.Screen name="Notifications" component={NotificationsScreen} />
                <Tab.Screen name="Settings">
                    {props => <SettingsScreen {...props} onLogout={onLogout} />}
                </Tab.Screen>
            </Tab.Navigator>
        </SafeAreaView>
    );
};

export default UserNavigator;
