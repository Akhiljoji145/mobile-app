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
    ImageBackground,
    Dimensions,
    ToastAndroid,
    Platform,
    Animated,
    Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../services/auth';

const { width } = Dimensions.get('window');


const LoginScreen = ({ onLoginSuccess, navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Custom Toast State
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info'); // 'success', 'error', 'warning'
    const [slideAnim] = useState(new Animated.Value(-100)); // Start off-screen top

    const showToast = (message, type = 'info') => {
        setToastMessage(message);
        setToastType(type);

        // Slide In
        Animated.sequence([
            Animated.timing(slideAnim, {
                toValue: 50, // Top position
                duration: 500,
                useNativeDriver: true,
                easing: Easing.out(Easing.back(1.5)), // Bouncy effect
            }),
            Animated.delay(3000), // Stay visible
            Animated.timing(slideAnim, {
                toValue: -100, // Slide out
                duration: 400,
                useNativeDriver: true,
                easing: Easing.in(Easing.cubic),
            }),
        ]).start();
    };

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Missing Info', 'Please enter both username and password.');
            return;
        }

        setLoading(true);
        try {
            const data = await login(username, password);
            if (onLoginSuccess) {
                onLoginSuccess(data.user);
            }
        } catch (error) {
            const errorMessage = error.message || 'An unexpected error occurred.';

            if (errorMessage.includes('Blocked')) {
                showToast(errorMessage, 'error');
            } else {
                Alert.alert('Login Failed', errorMessage);
            }
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
                        <Text style={styles.title}>EduTransit</Text>
                        <Text style={styles.subtitle}>Welcome Back, please sign in</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Username / Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your username or email"
                            placeholderTextColor="#A0AEC0"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#A0AEC0"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.forgotPassword}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

            </KeyboardAvoidingView>

            {/* Custom Toast Component */}
            <Animated.View style={[
                styles.toastContainer,
                { transform: [{ translateY: slideAnim }] },
                toastType === 'error' ? styles.toastError : styles.toastInfo
            ]}>
                <Ionicons
                    name={toastType === 'error' ? 'alert-circle' : 'information-circle'}
                    size={24}
                    color="#FFF"
                />
                <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>
        </ImageBackground >
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly transparent white
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
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#7F8C8D',
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
    forgotPassword: {
        alignSelf: 'flex-end',
        color: '#3498DB',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 24,
        marginTop: -10,
    },
    button: {
        backgroundColor: '#3498DB',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3498DB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 1,
    },
    // Toast Styles
    toastContainer: {
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        backgroundColor: '#333',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        zIndex: 1000,
        maxWidth: '90%',
    },
    toastError: {
        backgroundColor: '#E74C3C', // Red for errors
    },
    toastInfo: {
        backgroundColor: '#3498DB', // Blue for info
    },
    toastText: {
        color: '#FFF',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LoginScreen;
