import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getToken } from '../../services/auth';
import { useTheme } from '../../context/ThemeContext';

import { API_URL } from '../../config';

const AddManagementScreen = ({ navigation }) => {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const [name, setName] = useState('');
    const [organization, setOrganization] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name || !email || !organization) {
            Alert.alert('Missing Fields', 'Please fill in Name, Organization, and Email.');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            await axios.post(
                `${API_URL}/register/management/`,
                {
                    username: name,
                    email: email,
                    phone: phone,
                    organization_name: organization
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Alert.alert(
                'Success',
                `Management account for ${name} created.\nCredentials have been sent to ${email}.`,
                [{
                    text: 'OK', onPress: () => {
                        setName('');
                        setOrganization('');
                        setEmail('');
                        setPhone('');
                        navigation.navigate('Users');
                    }
                }]
            );
        } catch (error) {
            console.log(error);
            const msg = error.response?.data?.error || 'Failed to create account.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('../../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0.15 : 1 }} // Fade background for better contrast in dark mode
            resizeMode="cover"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoid}
            >
                {/* Absolute Header */}
                <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.headerTitle}>New Manager</Text>
                            <Text style={styles.headerSubtitle}>Create a new management account</Text>
                        </View>
                        <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
                            <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Ionicons name="person-add" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
                </View>

                {/* Scrollable Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.formCard, { backgroundColor: theme.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
                            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                <Ionicons name="person-outline" size={20} color={theme.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="e.g. John Doe"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                    placeholderTextColor={theme.muted}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Organization</Text>
                            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                <Ionicons name="business-outline" size={20} color={theme.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="e.g. Acme Corp"
                                    value={organization}
                                    onChangeText={setOrganization}
                                    autoCapitalize="words"
                                    placeholderTextColor={theme.muted}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
                            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                <Ionicons name="mail-outline" size={20} color={theme.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="john@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor={theme.muted}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
                            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                <Ionicons name="call-outline" size={20} color={theme.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="+1 234 567 8900"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    placeholderTextColor={theme.muted}
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.createButton} onPress={handleCreate} disabled={loading} activeOpacity={0.8}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.buttonText}>Create Account</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 180, // Reduced height
        paddingTop: 60,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 10,
        elevation: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 2,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 5,
    },
    headerButton: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerIcon: {
        position: 'absolute',
        right: -20,
        bottom: -40,
    },
    scrollView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        paddingTop: 200, // Adjusted for 180px header
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    formCard: {
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 25,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 55,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    createButton: {
        backgroundColor: '#2ECC71',
        borderRadius: 15,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#2ECC71',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

export default AddManagementScreen;
