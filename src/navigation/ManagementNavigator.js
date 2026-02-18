import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import ManagementDashboard from '../screens/management/ManagementDashboard';
import AddMemberScreen from '../screens/management/AddMemberScreen';
import ManageMembersScreen from '../screens/management/ManageMembersScreen';
import EditMemberScreen from '../screens/management/EditMemberScreen';
import AddBusScreen from '../screens/management/AddBusScreen';
import EditBusScreen from '../screens/management/EditBusScreen';
import ScheduleSettingsScreen from '../screens/management/ScheduleSettingsScreen';
import ManagementComplaintsScreen from '../screens/management/ManagementComplaintsScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

// Tab Navigator Component
const ManagementTabs = ({ user, onLogout }) => {
    const { theme, isDarkMode } = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
            <Tab.Navigator
                tabBarPosition="bottom"
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color }) => {
                        let iconName;

                        if (route.name === 'Overview') {
                            iconName = focused ? 'grid' : 'grid-outline';
                        } else if (route.name === 'Add Member') {
                            iconName = focused ? 'person-add' : 'person-add-outline';
                        } else if (route.name === 'Manage Members') {
                            iconName = focused ? 'people' : 'people-outline';
                        } else if (route.name === 'Add Bus') {
                            iconName = focused ? 'add-circle' : 'add-circle-outline';
                        } else if (route.name === 'Complaints') {
                            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
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
                <Tab.Screen name="Overview">
                    {props => <ManagementDashboard {...props} user={user} onLogout={onLogout} />}
                </Tab.Screen>
                <Tab.Screen name="Complaints" component={ManagementComplaintsScreen} />
                <Tab.Screen name="Add Member" component={AddMemberScreen} />
                <Tab.Screen name="Manage Members" component={ManageMembersScreen} />
                <Tab.Screen name="Add Bus" component={AddBusScreen} />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

// Main Stack Navigator
const ManagementNavigator = ({ user, onLogout }) => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ManagementTabs">
                {props => <ManagementTabs {...props} user={user} onLogout={onLogout} />}
            </Stack.Screen>
            <Stack.Screen
                name="EditMember"
                component={EditMemberScreen}
                options={{
                    headerShown: false,
                    title: 'Edit Member',
                    headerBackTitle: 'Back'
                }}
            />
            <Stack.Screen
                name="EditBus"
                component={EditBusScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal'
                }}
            />
            <Stack.Screen
                name="ScheduleSettings"
                component={ScheduleSettingsScreen}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="ManagementComplaints"
                component={ManagementComplaintsScreen}
                options={{
                    headerShown: false
                }}
            />
        </Stack.Navigator>
    );
};

export default ManagementNavigator;
