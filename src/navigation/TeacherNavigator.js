
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

import TeacherHomeScreen from '../screens/teacher/TeacherHomeScreen';
import TeacherStudentsScreen from '../screens/teacher/TeacherStudentsScreen';
import TeacherAlertsScreen from '../screens/teacher/TeacherAlertsScreen';
import TeacherUpdateStatusScreen from '../screens/teacher/TeacherUpdateStatusScreen';
import TeacherProfileScreen from '../screens/teacher/TeacherProfileScreen';

const Tab = createMaterialTopTabNavigator();

const TeacherNavigator = ({ user, onLogout }) => {
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
                        } else if (route.name === 'Students') {
                            iconName = focused ? 'people' : 'people-outline';
                        } else if (route.name === 'Alerts') {
                            iconName = focused ? 'notifications' : 'notifications-outline';
                        } else if (route.name === 'Update Status') {
                            iconName = focused ? 'create' : 'create-outline';
                        } else if (route.name === 'Profile') {
                            iconName = focused ? 'person' : 'person-outline';
                        }

                        return <Ionicons name={iconName} size={24} color={color} />;
                    },
                    tabBarActiveTintColor: theme.headerBg,
                    tabBarInactiveTintColor: isDarkMode ? '#7F8C8D' : 'gray',
                    tabBarShowIcon: true,
                    tabBarIndicatorStyle: {
                        backgroundColor: theme.headerBg,
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
                    {props => <TeacherHomeScreen {...props} user={user} onLogout={onLogout} />}
                </Tab.Screen>
                <Tab.Screen name="Students" component={TeacherStudentsScreen} />
                <Tab.Screen name="Alerts" component={TeacherAlertsScreen} />
                <Tab.Screen name="Update Status" component={TeacherUpdateStatusScreen} />
                <Tab.Screen name="Profile">
                    {props => <TeacherProfileScreen {...props} user={user} onLogout={onLogout} />}
                </Tab.Screen>
            </Tab.Navigator>
        </SafeAreaView>
    );
};

export default TeacherNavigator;
