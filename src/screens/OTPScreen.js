import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ImageBackground,
    Dimensions
} from 'react-native';
import { verifyOTP } from '../services/auth';

const OTPScreen = ({ route, navigation }) => {
    const { email } = route.params || {};
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerifyParams = () => {
        if (!email) {
            Alert.alert('Error', 'Email not found.', [
                { text: 'Go to Login', onPress: () => navigation.navigate('Login') }
            ]);
            return false;
        }
        return true;
    }

    const handleVerify = async () => {
        if (!handleVerifyParams()) return;

        if (!otp || otp.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP.');
            return;
        }

        setLoading(true);
        try {
            await verifyOTP(email, otp);
            // Navigate to Reset Password with Email and OTP
            navigation.navigate('ResetPassword', { email, otp });
        } catch (error) {
            Alert.alert('Verification Failed', error.message || 'Invalid OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('../../assets/background.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View style={styles.card}>
                    <View style={styles.headerContainer}>
                        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.title}>Enter OTP</Text>
                        <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.label}>OTP Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="123456"
                            placeholderTextColor="#A0AEC0"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                        />

                        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading} activeOpacity={0.8}>
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Verify OTP</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        paddingVertical: 40,
        paddingHorizontal: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 35,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#7F8C8D',
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    formContainer: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#34495E',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    input: {
        backgroundColor: '#F7F9FC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 24, // Larger font for OTP
        textAlign: 'center',
        color: '#2D3748',
        marginBottom: 20,
        letterSpacing: 8,
    },
    button: {
        backgroundColor: '#3498DB',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3498DB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 15,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    }
});

export default OTPScreen;
