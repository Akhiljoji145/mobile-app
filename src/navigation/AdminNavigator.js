import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AddManagementScreen from '../screens/admin/AddManagementScreen';
import DeleteUserScreen from '../screens/admin/DeleteUserScreen';
import EditManagementUserScreen from '../screens/admin/EditManagementUserScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

// Tab Navigator Component
const AdminTabs = ({ user, onLogout }) => {
    const { theme, isDarkMode } = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
            <Tab.Navigator
                tabBarPosition="bottom"
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color }) => {
                        let iconName;

                        if (route.name === 'Dashboard') {
                            iconName = focused ? 'grid' : 'grid-outline';
                        } else if (route.name === 'Add Management') {
                            iconName = focused ? 'person-add' : 'person-add-outline';
                        } else if (route.name === 'Users') {
                            iconName = focused ? 'people' : 'people-outline';
                        }

                        return <Ionicons name={iconName} size={24} color={color} />;
                    },
                    tabBarActiveTintColor: '#3498DB', // Keep primary color
                    tabBarInactiveTintColor: isDarkMode ? '#7F8C8D' : 'gray',
                    tabBarShowIcon: true,
                    tabBarIndicatorStyle: {
                        backgroundColor: '#3498DB',
                        height: 3,
                        top: 0,
                    },
                    tabBarStyle: {
                        backgroundColor: theme.card, // Adapts to dark mode
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        height: 60,
                        borderTopWidth: isDarkMode ? 0 : 0, // Clean look
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
                <Tab.Screen name="Dashboard">
                    {props => <AdminDashboard {...props} user={user} onLogout={onLogout} />}
                </Tab.Screen>
                <Tab.Screen name="Users" component={DeleteUserScreen} />
                <Tab.Screen name="Add Management" component={AddManagementScreen} />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

// Main Stack Navigator
const AdminNavigator = ({ user, onLogout }) => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminTabs">
                {props => <AdminTabs {...props} user={user} onLogout={onLogout} />}
            </Stack.Screen>
            <Stack.Screen
                name="EditManagementUser"
                component={EditManagementUserScreen}
                options={{
                    headerShown: false
                }}
            />
        </Stack.Navigator>
    );
};

export default AdminNavigator;

