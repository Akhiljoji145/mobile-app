import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

import ParentDashboard from '../screens/parent/ParentDashboard';
import TrackBusScreen from '../screens/student/TrackBusScreen';
import ParentComplaintsScreen from '../screens/parent/ParentComplaintsScreen';
import ParentProfileScreen from '../screens/parent/ParentProfileScreen';

const Tab = createMaterialTopTabNavigator();

const ParentNavigator = ({ user, onLogout }) => {
    const { theme, isDarkMode } = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
            <Tab.Navigator
                tabBarPosition="bottom"
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color }) => {
                        let iconName;

                        if (route.name === 'Dashboard') {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (route.name === 'Track') {
                            iconName = focused ? 'map' : 'map-outline';
                        } else if (route.name === 'Complaints') {
                            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                        } else if (route.name === 'Profile') {
                            iconName = focused ? 'person' : 'person-outline';
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
                <Tab.Screen name="Dashboard" component={ParentDashboard} />
                <Tab.Screen name="Track" component={TrackBusScreen} />
                <Tab.Screen name="Complaints" component={ParentComplaintsScreen} />
                <Tab.Screen name="Profile">
                    {props => <ParentProfileScreen {...props} user={user} onLogout={onLogout} />}
                </Tab.Screen>
            </Tab.Navigator>
        </SafeAreaView>
    );
};

export default ParentNavigator;
