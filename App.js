import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import OTPScreen from './src/screens/OTPScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import AdminNavigator from './src/navigation/AdminNavigator';
import ManagementNavigator from './src/navigation/ManagementNavigator';
import UserNavigator from './src/navigation/UserNavigator';
import AddManagementScreen from './src/screens/admin/AddManagementScreen';
import DriverNavigator from './src/navigation/DriverNavigator';
import DriverQRScreen from './src/screens/driver/DriverQRScreen';
import StudentScannerScreen from './src/screens/student/StudentScannerScreen';
import TrackBusScreen from './src/screens/student/TrackBusScreen';
import { getUser, logout } from './src/services/auth';
import { ThemeProvider } from './src/context/ThemeContext';
import * as Linking from 'expo-linking';

import { registerForPushNotificationsAsync } from './src/services/notifications';

// Disable console.log to keep output clean, showing only errors
// console.log = () => { };

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [Linking.createURL('/'), 'edutransit://'],
  config: {
    screens: {
      ResetPassword: 'reset-password/:uid/:token',
      Login: 'login',
    },
  },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const storedUser = await getUser();
      if (storedUser) {
        setUser(storedUser);
        // Register for push notifications if user is logged in
        registerForPushNotificationsAsync();
      }
    } catch (e) {
      console.log('Failed to load user', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    // Register for push notifications on new login
    registerForPushNotificationsAsync();
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator screenOptions={{ animation: 'fade', headerShown: false }}>
          {user ? (
            user.is_superuser ? (
              <Stack.Screen name="AdminRoot">
                {props => <AdminNavigator {...props} user={user} onLogout={handleLogout} />}
              </Stack.Screen>
            ) : user.is_management ? (
              <Stack.Screen name="ManagementRoot">
                {props => <ManagementNavigator {...props} user={user} onLogout={handleLogout} />}
              </Stack.Screen>

            ) : user.is_driver ? (
              <Stack.Screen name="DriverRoot">
                {props => <DriverNavigator {...props} user={user} onLogout={handleLogout} />}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="UserRoot">
                {props => <UserNavigator {...props} user={user} onLogout={handleLogout} />}
              </Stack.Screen>
            )
          ) : (
            <>
              <Stack.Screen name="Login" options={{ headerShown: false }}>
                {props => <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
              </Stack.Screen>
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
              <Stack.Screen name="OTP" component={OTPScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
            </>
          )}
          <Stack.Screen name="AddManagement" component={AddManagementScreen} options={{ headerShown: true, title: 'Add Management' }} />
          <Stack.Screen name="DriverQR" component={DriverQRScreen} options={{ headerShown: true, title: 'Bus QR Code' }} />
          <Stack.Screen name="StudentScanner" component={StudentScannerScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TrackBus" component={TrackBusScreen} options={{ headerShown: true, title: 'Track Bus' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider >
  );
}
