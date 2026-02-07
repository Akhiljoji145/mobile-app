import React, { useState, useEffect } from 'react';
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
import { resetPasswordWithOTP } from '../services/auth';

const ResetPasswordScreen = ({ route, navigation }) => {
    const { email, otp } = route.params || {};
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!email || !otp) {
            Alert.alert('Error', 'Invalid reset session.', [
                { text: 'Go to Login', onPress: () => navigation.navigate('Login') }
            ]);
        }
    }, [email, otp]);

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Missing Info', 'Please enter both fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await resetPasswordWithOTP(email, otp, password);
            Alert.alert(
                'Success',
                'Your password has been reset successfully. Please login.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to reset password.');
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
                        <Text style={styles.title}>New Password</Text>
                        <Text style={styles.subtitle}>Enter your new password below</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.label}>New Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new password"
                            placeholderTextColor="#A0AEC0"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm new password"
                            placeholderTextColor="#A0AEC0"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading} activeOpacity={0.8}>
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Set New Password</Text>
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
        fontSize: 16,
        color: '#2D3748',
        marginBottom: 20,
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

export default ResetPasswordScreen;
