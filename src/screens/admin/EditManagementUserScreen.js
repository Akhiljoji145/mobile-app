import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getToken } from '../../services/auth';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../config';

const EditManagementUserScreen = ({ route, navigation }) => {
    const { user } = route.params || {};

    if (!user) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Error: User data not found.</Text>
            </View>
        );
    }
    const { theme, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const [username, setUsername] = useState(user.username || '');
    const [email, setEmail] = useState(user.email || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [organization, setOrganization] = useState(user.organization_name || '');

    // Validation states
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    // Track changes
    useEffect(() => {
        const changed =
            username.trim() !== (user.username || '') ||
            email.trim() !== (user.email || '') ||
            phone.trim() !== (user.phone || '') ||
            organization.trim() !== (user.organization_name || '');
        setHasChanges(changed);
    }, [username, email, phone, organization]);

    // Email validation
    const validateEmail = (text) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (text && !emailRegex.test(text)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
        setEmail(text);
    };

    // Phone validation
    const validatePhone = (text) => {
        // Remove non-numeric characters for validation
        const numericPhone = text.replace(/[^0-9]/g, '');
        if (text && numericPhone.length > 0 && numericPhone.length < 10) {
            setPhoneError('Phone number should be at least 10 digits');
        } else {
            setPhoneError('');
        }
        setPhone(text);
    };

    const handleUpdate = async () => {
        // Trim all inputs
        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();
        const trimmedPhone = phone.trim();
        const trimmedOrganization = organization.trim();

        // Validation
        if (!trimmedUsername) {
            Alert.alert('Validation Error', 'Username is required.');
            return;
        }

        if (!trimmedEmail) {
            Alert.alert('Validation Error', 'Email address is required.');
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            Alert.alert('Validation Error', 'Please enter a valid email address.');
            return;
        }

        // Phone validation (if provided)
        if (trimmedPhone) {
            const numericPhone = trimmedPhone.replace(/[^0-9]/g, '');
            if (numericPhone.length < 10) {
                Alert.alert('Validation Error', 'Please enter a valid phone number (at least 10 digits).');
                return;
            }
        }

        // Check if there are any changes
        if (!hasChanges) {
            Alert.alert('No Changes', 'No changes have been made to update.');
            return;
        }

        // Confirmation dialog
        Alert.alert(
            'Confirm Update',
            'Are you sure you want to update this management user?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Update',
                    onPress: () => performUpdate(trimmedUsername, trimmedEmail, trimmedPhone, trimmedOrganization)
                }
            ]
        );
    };

    const performUpdate = async (trimmedUsername, trimmedEmail, trimmedPhone, trimmedOrganization) => {
        setLoading(true);
        try {
            const token = await getToken();
            const payload = {
                username: trimmedUsername,
                email: trimmedEmail,
                phone: trimmedPhone,
                organization_name: trimmedOrganization
            };

            await axios.put(`${API_URL}/users/${user.id}/update/`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Management user updated successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error('Update error:', error);

            // Enhanced error handling
            let errorMessage = 'Failed to update user.';

            if (error.response) {
                // Server responded with error
                if (error.response.data?.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data?.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data?.username) {
                    errorMessage = `Username: ${error.response.data.username[0]}`;
                } else if (error.response.data?.email) {
                    errorMessage = `Email: ${error.response.data.email[0]}`;
                } else if (error.response.status === 400) {
                    errorMessage = 'Invalid data provided. Please check your inputs.';
                } else if (error.response.status === 403) {
                    errorMessage = 'You do not have permission to update this user.';
                } else if (error.response.status === 404) {
                    errorMessage = 'User not found.';
                }
            } else if (error.request) {
                // Request made but no response
                errorMessage = 'Network error. Please check your connection.';
            }

            Alert.alert('Update Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label, value, setValue, icon, placeholder, keyboardType = 'default', error = '', required = false) => (
        <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: theme.text }]}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            </View>
            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: theme.inputBg,
                    borderColor: error ? '#E74C3C' : theme.borderColor,
                    borderWidth: error ? 2 : 1
                }
            ]}>
                <Ionicons name={icon} size={20} color={error ? '#E74C3C' : theme.muted} style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={setValue}
                    placeholderTextColor={theme.muted}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    editable={!loading}
                />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );

    return (
        <ImageBackground
            source={require('../../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0.15 : 1 }}
            resizeMode="cover"
        >
            {/* Absolute Header with Curved Design */}
            <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Edit Management User</Text>
                        <Text style={styles.headerSubtitle}>Update user details</Text>
                    </View>
                </View>
                <Ionicons name="people-circle" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.formCard, { backgroundColor: theme.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>
                        <Text style={[styles.helperText, { color: theme.subtext }]}>
                            Update the management user's account details below.
                        </Text>

                        {renderInput('Username', username, setUsername, 'person-outline', 'Enter username', 'default', '', true)}
                        {renderInput('Email Address', email, validateEmail, 'mail-outline', 'Enter email address', 'email-address', emailError, true)}

                        <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Information</Text>

                        {renderInput('Phone Number', phone, validatePhone, 'call-outline', 'Enter phone number (optional)', 'phone-pad', phoneError)}
                        {renderInput('Organization', organization, setOrganization, 'business-outline', 'Enter organization name (optional)')}

                        {/* Update Button */}
                        <TouchableOpacity
                            style={[
                                styles.updateButton,
                                (!hasChanges || loading || !!emailError || !!phoneError) && styles.updateButtonDisabled
                            ]}
                            onPress={handleUpdate}
                            disabled={!hasChanges || loading || !!emailError || !!phoneError}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={24} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.buttonText}>Update User</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Info Message */}
                        {(!hasChanges && !loading) && (
                            <View style={[styles.infoBox, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                <Ionicons name="information-circle-outline" size={20} color={theme.muted} />
                                <Text style={[styles.infoText, { color: theme.subtext }]}>
                                    Make changes to enable the update button
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 180,
        paddingTop: 60,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 10,
        elevation: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 15,
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
    scrollContent: {
        paddingTop: 200,
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    formCard: {
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8
    },
    helperText: {
        fontSize: 12,
        marginBottom: 15,
        fontStyle: 'italic',
        lineHeight: 18
    },
    inputGroup: { marginBottom: 15 },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 2
    },
    required: {
        color: '#E74C3C',
        fontSize: 14,
        fontWeight: 'bold'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 50,
    },
    inputIcon: { marginRight: 10 },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0
    },
    errorText: {
        color: '#E74C3C',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 2
    },
    divider: {
        height: 1,
        marginVertical: 20
    },
    updateButton: {
        backgroundColor: '#3498DB',
        borderRadius: 12,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#3498DB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    updateButtonDisabled: {
        backgroundColor: '#95A5A6',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold'
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
    },
    infoText: {
        fontSize: 13,
        marginLeft: 8,
        flex: 1
    }
});

export default EditManagementUserScreen;
