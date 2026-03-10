
import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications'; // Disabled for Expo Go (SDK 53 compatibility)
import { Platform } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';
import { getToken } from './auth';

// Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//         shouldShowAlert: true,
//         shouldPlaySound: true,
//         shouldSetBadge: false,
//     }),
// });

export async function registerForPushNotificationsAsync() {
    console.log('[Dev] Notifications are disabled in Expo Go (SDK 53+ limitation). Use a Development Build to enable them.');
    return null;

    /* 
    // Original implementation below - re-enable when using Development Build
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        // Get the Expo push token
        try {
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: 'edd885c3-8851-4e2b-a79d-91b521dc08cf' // Optional: if you have a project ID
            })).data;
            console.log('Push Token:', token);
        } catch (e) {
            // Fallback for getting token without projectId if needed, or handle error
            try {
                token = (await Notifications.getExpoPushTokenAsync()).data;
                console.log('Push Token (No PID):', token);
            } catch (err) {
                console.log('Error fetching push token:', err);
                return;
            }
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    if (token) {
        await sendTokenToBackend(token);
    }

    return token;
    */
}

const sendTokenToBackend = async (token) => {
    try {
        const authToken = await getToken();
        if (!authToken) return;

        // Use the /users/me/ endpoint we created/verified earlier
        await axios.put(`${API_URL}/users/me/`, {
            push_token: token
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('Push Token registered with backend');
    } catch (error) {
        console.log('Error sending push token to backend:', error);
    }
};
