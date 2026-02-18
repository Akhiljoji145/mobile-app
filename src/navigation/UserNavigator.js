import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

import StudentDashboard from '../screens/student/StudentDashboard';
import TrackBusScreen from '../screens/student/TrackBusScreen';
import StudentScannerScreen from '../screens/student/StudentScannerScreen';
import StudentComplaintsScreen from '../screens/student/StudentComplaintsScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';

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
                        } else if (route.name === 'Track') {
                            iconName = focused ? 'map' : 'map-outline';
                        } else if (route.name === 'Scan') {
                            iconName = focused ? 'qr-code' : 'qr-code-outline';
                        } else if (route.name === 'Complaints') {
                            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                        } else if (route.name === 'Profile') {
                            iconName = focused ? 'person' : 'person-outline';
                        }

                        // Special styling/coloring for Scan if needed, but keeping simple for Material Tabs
                        // Material Tabs don't support "overflow" buttons easily like Bottom Tabs do
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
                <Tab.Screen name="Home" component={StudentDashboard} />
                <Tab.Screen name="Track" component={TrackBusScreen} />
                <Tab.Screen name="Scan" component={StudentScannerScreen} />
                <Tab.Screen name="Complaints" component={StudentComplaintsScreen} />
                <Tab.Screen name="Profile">
                    {props => <StudentProfileScreen {...props} user={user} onLogout={onLogout} />}
                </Tab.Screen>
            </Tab.Navigator>
        </SafeAreaView>
    );
};

export default UserNavigator;
