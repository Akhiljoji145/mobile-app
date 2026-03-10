import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import * as Location from 'expo-location';
import axios from 'axios';
import { getToken } from '../../services/auth';
import { API_URL } from '../../config';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = 280;

const QRCodeScannerScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Animation for the scanning line
    const scanLineAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            if (!permission?.granted) {
                await requestPermission();
            }
        })();
    }, [permission]);

    useEffect(() => {
        // Start scanning animation loop
        const startAnimation = () => {
            scanLineAnim.setValue(0);
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scanLineAnim, {
                        toValue: SCANNER_SIZE,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scanLineAnim, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    })
                ])
            ).start();
        };

        if (permission?.granted && !scanned && !isVerifying) {
            startAnimation();
        } else {
            scanLineAnim.stopAnimation();
        }
    }, [permission, scanned, isVerifying]);

    if (!permission) {
        return <View style={[styles.container, { backgroundColor: theme.background }]} />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="camera-outline" size={80} color={theme.subtext} style={{ marginBottom: 20 }} />
                <Text style={{ textAlign: 'center', color: theme.text, fontSize: 18, marginBottom: 30, paddingHorizontal: 40 }}>
                    Camera access is required to scan your boarding pass.
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionText}>Enable Camera</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanned || isVerifying) return;
        setScanned(true);
        setIsVerifying(true);

        try {
            const qrData = JSON.parse(data);
            if (!qrData.qr_token) {
                setIsVerifying(false);
                Alert.alert("Invalid Pass", "This barcode does not belong to the EduTransit system.", [{ text: "Try Again", onPress: () => setScanned(false) }]);
                return;
            }

            let { status } = await Location.requestForegroundPermissionsAsync();
            let latitude = null;
            let longitude = null;
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                latitude = location.coords.latitude;
                longitude = location.coords.longitude;
            }

            const token = await getToken();
            const response = await axios.post(`${API_URL}/dashboard/student/board/`, {
                qr_token: qrData.qr_token,
                latitude: latitude,
                longitude: longitude
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsVerifying(false);
            if (response.data.status === 'already_boarded') {
                Alert.alert("Already Boarded", "You are already marked as boarded for this trip.", [{ text: "OK", onPress: () => navigation.goBack() }]);
            } else {
                Alert.alert("Boarding Successful!", "Have a safe trip!", [{ text: "OK", onPress: () => navigation.goBack() }]);
            }

        } catch (error) {
            setIsVerifying(false);
            console.log("QR Scan Error:", error);
            const errorMessage = error.response?.data?.error || "Could not verify pass. Please ask the driver to refresh the code.";
            Alert.alert("Scan Failed", errorMessage, [{ text: "Scan Again", onPress: () => setScanned(false) }]);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={(scanned || isVerifying) ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />

            <BlurView intensity={isDarkMode ? 30 : 50} tint={isDarkMode ? "dark" : "light"} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: isDarkMode ? "white" : "black" }]}>Scan Boarding Pass</Text>
                    <Text style={[styles.headerSubtitle, { color: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }]}>Align QR code within the frame</Text>
                </View>
                <View style={{ width: 40 }} />
            </BlurView>

            <View style={[styles.overlay, StyleSheet.absoluteFillObject]} pointerEvents="box-none">
                <View style={styles.topOverlay} />
                <View style={styles.middleOverlay}>
                    <View style={styles.sideOverlay} />
                    <View style={styles.focusedBox}>

                        {(!scanned && !isVerifying) && (
                            <Animated.View
                                style={[
                                    styles.scanLine,
                                    { transform: [{ translateY: scanLineAnim }] }
                                ]}
                            />
                        )}

                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />

                        {isVerifying && (
                            <View style={styles.verifyingContainer}>
                                <BlurView intensity={80} tint="dark" style={styles.verifyingBlur}>
                                    <Ionicons name="checkmark-circle-outline" size={40} color="#2ECC71" />
                                    <Text style={styles.verifyingText}>Verifying...</Text>
                                </BlurView>
                            </View>
                        )}
                    </View>
                    <View style={styles.sideOverlay} />
                </View>
                <View style={styles.bottomOverlay}>
                    <TouchableOpacity
                        style={[styles.cameraModeBtn, { backgroundColor: theme.card }]}
                        onPress={() => setScanned(false)}
                        disabled={!scanned}
                        opacity={scanned ? 1 : 0} // Hide when scanning, show when scan fails/already scanned
                    >
                        <Ionicons name="refresh" size={20} color={theme.text} style={{ marginRight: 8 }} />
                        <Text style={[styles.cameraModeText, { color: theme.text }]}>Scan Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const overlayColor = 'rgba(0,0,0,0.6)';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        paddingTop: 50,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 2,
    },
    permissionButton: {
        backgroundColor: '#3498DB',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
        shadowColor: '#3498DB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    permissionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    topOverlay: {
        flex: 1,
        width: '100%',
        backgroundColor: overlayColor,
    },
    middleOverlay: {
        flexDirection: 'row',
    },
    sideOverlay: {
        flex: 1,
        backgroundColor: overlayColor,
    },
    focusedBox: {
        width: SCANNER_SIZE,
        height: SCANNER_SIZE,
        overflow: 'hidden',
    },
    scanLine: {
        position: 'absolute',
        width: '100%',
        height: 3,
        backgroundColor: '#2ECC71',
        shadowColor: '#2ECC71',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 10,
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#2ECC71',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 15,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 15,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 15,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 15,
    },
    verifyingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    verifyingBlur: {
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    verifyingText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    bottomOverlay: {
        flex: 1,
        width: '100%',
        backgroundColor: overlayColor,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50,
    },
    cameraModeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    cameraModeText: {
        fontWeight: 'bold',
        fontSize: 15,
    }
});

export default QRCodeScannerScreen;
