import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import { getToken } from '../../services/auth';
import axios from 'axios';
import { API_URL } from '../../config';
import { Ionicons } from '@expo/vector-icons';

const StudentScannerScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!permission) {
        return <View style={styles.container}><ActivityIndicator /></View>;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text, marginBottom: 20 }}>Camera permission is required to scan QR codes.</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    const handleBarCodeScanned = async ({ data }) => {
        setScanned(true);
        setLoading(true);

        try {
            // Check Location Permission
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Location access is required to verify boarding.");
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Parse QR Data
            let qrData;
            try {
                qrData = JSON.parse(data);
            } catch (e) {
                // Determine if it might be just an ID string or invalid
                console.log("Invalid QR JSON", e);
                Alert.alert("Error", "Invalid QR Code format.");
                setLoading(false);
                return;
            }

            const qrToken = qrData.qr_token;
            if (!qrToken) {
                Alert.alert("Error", "Invalid QR Code: Missing Token.");
                setLoading(false);
                return;
            }

            // Call Backend
            const token = await getToken();
            const response = await axios.post(`${API_URL}/dashboard/student/board/`, {
                qr_token: qrToken,
                latitude: latitude,
                longitude: longitude
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 201 || response.status === 200) {
                Alert.alert("Boarding Successful", `You have boarded ${response.data.bus} at ${response.data.time}`);
                navigation.goBack();
            }

        } catch (error) {
            console.log("Scan Error:", error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const msg = error.response.data?.message || "Failed to process boarding.";
                const apiError = error.response.data?.error;
                Alert.alert("Error", apiError || msg);
            } else if (error.request) {
                // The request was made but no response was received
                Alert.alert("Network Error", "No response from server. Please check your internet connection.");
            } else {
                // Something happened in setting up the request that triggered an Error
                Alert.alert("Error", error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Scan Bus QR</Text>
                    </View>
                    <View style={styles.scanFrame} />
                    <Text style={styles.instruction}>Align the QR code within the frame</Text>

                    {scanned && (
                        <View style={styles.rescanContainer}>
                            {loading ? (
                                <ActivityIndicator size="large" color="#3498DB" />
                            ) : (
                                <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} color="#3498DB" />
                            )}
                        </View>
                    )}
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'space-between',
        paddingVertical: 50,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center title
    },
    closeButton: {
        position: 'absolute',
        left: 20,
        top: 0
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#3498DB',
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    instruction: {
        color: 'white',
        marginTop: 20,
        fontSize: 16,
    },
    rescanContainer: {
        marginTop: 20,
    }
});

export default StudentScannerScreen;
