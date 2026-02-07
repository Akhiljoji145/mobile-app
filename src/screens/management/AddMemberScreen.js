import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform, Switch, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getToken } from '../../services/auth';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../config';
import { Picker } from '@react-native-picker/picker';

const AddMemberScreen = ({ navigation }) => {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('teacher'); // teacher, driver, student
    const [loading, setLoading] = useState(false);

    // Common Fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Teacher Specific Fields
    const [grades, setGrades] = useState([]);
    const [buses, setBuses] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [transportRequired, setTransportRequired] = useState(false);
    const [selectedBus, setSelectedBus] = useState('');

    // Parent Fields (Only for Student)
    const [parentName, setParentName] = useState('');
    const [parentEmail, setParentEmail] = useState('');
    const [parentPhone, setParentPhone] = useState('');

    useEffect(() => {
        if (activeTab === 'teacher' || activeTab === 'driver' || activeTab === 'student') {
            fetchGradesAndBuses();
        }
    }, [activeTab]);

    const fetchGradesAndBuses = async () => {
        try {
            const token = await getToken();
            const [gradeRes, busRes] = await Promise.all([
                axios.get(`${API_URL}/dashboard/grades/`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/dashboard/buses/`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setGrades(Array.isArray(gradeRes.data) ? gradeRes.data : []);
            setBuses(Array.isArray(busRes.data) ? busRes.data : []);
        } catch (error) {
            console.log("Failed to fetch details", error);
            // Ensure no undefined state remains if fetch failed explicitly?
            // Already caught, but could set empty if needed.
        }
    };

    const handleCreate = async () => {
        if (!name || !email) {
            Alert.alert('Missing Fields', 'Please fill in Name and Email.');
            return;
        }

        if (activeTab === 'student' && (!parentName || !parentEmail)) {
            Alert.alert('Missing Parent Details', 'Parent Name and Email are required for students.');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            const payload = {
                role: activeTab,
                username: name,
                email: email,
                phone: phone
            };

            if (activeTab === 'student') {
                payload.parent_details = {
                    name: parentName,
                    email: parentEmail,
                    phone: parentPhone
                };
                if (transportRequired && selectedBus) payload.bus = selectedBus;
            }

            if (activeTab === 'teacher') {
                if (selectedGrade) payload.class_in_charge = selectedGrade;
                if (transportRequired && selectedBus) payload.bus = selectedBus;
            }

            if (activeTab === 'driver') {
                if (selectedBus) payload.bus = selectedBus;
            }

            await axios.post(`${API_URL}/register/member/`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert(
                'Success',
                `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} account created successfully.\nLogin details sent to email.`,
                [{
                    text: 'OK', onPress: () => {
                        // Reset Form
                        setName('');
                        setEmail('');
                        setPhone('');
                        setParentName('');
                        setParentEmail('');
                        setParentPhone('');
                        setSelectedGrade('');
                        setSelectedBus('');
                        setTransportRequired(false);
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

    const renderInput = (label, value, setValue, icon, placeholder, keyboardType = 'default') => (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                <Ionicons name={icon} size={20} color={theme.muted} style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={setValue}
                    placeholderTextColor={theme.muted}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                />
            </View>
        </View>
    );

    return (
        <ImageBackground
            source={require('../../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0.15 : 1 }}
            resizeMode="cover"
        >
            {/* Absolute Header */}
            <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Add Member</Text>
                        <Text style={styles.headerSubtitle}>Create new school members</Text>
                    </View>
                    <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
                        <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <Ionicons name="person-add" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            {/* Content */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Role Tabs */}
                    <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
                        {['teacher', 'driver', 'student'].map((role) => (
                            <TouchableOpacity
                                key={role}
                                style={[
                                    styles.tabButton,
                                    activeTab === role && { backgroundColor: theme.headerBg }
                                ]}
                                onPress={() => setActiveTab(role)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    activeTab === role ? { color: '#FFF' } : { color: theme.subtext }
                                ]}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={[styles.formCard, { backgroundColor: theme.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Details
                        </Text>

                        {renderInput('Full Name', name, setName, 'person-outline', 'e.g. John Doe')}
                        {renderInput('Email Address', email, setEmail, 'mail-outline', 'john@example.com', 'email-address')}
                        {renderInput('Phone Number', phone, setPhone, 'call-outline', '+1 234 567 8900', 'phone-pad')}

                        {activeTab === 'teacher' && (
                            <>
                                <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Additional Info</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>Class In-charge (Optional)</Text>
                                    <View style={[styles.pickerContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                        <Picker
                                            selectedValue={selectedGrade}
                                            onValueChange={(itemValue) => setSelectedGrade(itemValue)}
                                            style={[styles.picker, { color: theme.text }]}
                                            dropdownIconColor={theme.text}
                                        >
                                            <Picker.Item label="Select Class..." value="" color={theme.subtext} />
                                            {grades.map((g) => (
                                                <Picker.Item key={g.id} label={g.name} value={g.id} color={theme.text} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>

                                <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 15 }]}>
                                    <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>Transport Required?</Text>
                                    <Switch
                                        value={transportRequired}
                                        onValueChange={setTransportRequired}
                                        trackColor={{ false: theme.borderColor, true: '#2ECC71' }}
                                        thumbColor="#FFF"
                                    />
                                </View>

                                {transportRequired && (
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: theme.text }]}>Select Bus Route</Text>
                                        <View style={[styles.pickerContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                            <Picker
                                                selectedValue={selectedBus}
                                                onValueChange={(itemValue) => setSelectedBus(itemValue)}
                                                style={[styles.picker, { color: theme.text }]}
                                                dropdownIconColor={theme.text}
                                            >
                                                <Picker.Item label="Select Bus..." value="" color={theme.subtext} />
                                                {buses.map((b) => (
                                                    <Picker.Item key={b.id} label={b.bus_number} value={b.id} color={theme.text} />
                                                ))}
                                            </Picker>
                                        </View>
                                    </View>
                                )}
                            </>
                        )}

                        {activeTab === 'driver' && (
                            <>
                                <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Assignment</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>Assign Bus</Text>
                                    <View style={[styles.pickerContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                        <Picker
                                            selectedValue={selectedBus}
                                            onValueChange={(itemValue) => setSelectedBus(itemValue)}
                                            style={[styles.picker, { color: theme.text }]}
                                            dropdownIconColor={theme.text}
                                        >
                                            <Picker.Item label="Select Bus..." value="" color={theme.subtext} />
                                            {buses.map((b) => (
                                                <Picker.Item key={b.id} label={b.bus_number} value={b.id} color={theme.text} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                            </>
                        )}

                        {activeTab === 'student' && (
                            <>
                                <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                                <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 10 }]}>Parent Details</Text>
                                <Text style={[styles.helperText, { color: theme.subtext }]}>
                                    A parent account will be automatically created and linked.
                                </Text>

                                {renderInput('Parent Name', parentName, setParentName, 'people-outline', 'e.g. Jane Doe')}
                                {renderInput('Parent Email', parentEmail, setParentEmail, 'mail-outline', 'parent@example.com', 'email-address')}
                                {renderInput('Parent Phone', parentPhone, setParentPhone, 'call-outline', '+1 234 567 8900', 'phone-pad')}

                                <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                                <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 15 }]}>
                                    <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>Transport Required?</Text>
                                    <Switch
                                        value={transportRequired}
                                        onValueChange={setTransportRequired}
                                        trackColor={{ false: theme.borderColor, true: '#2ECC71' }}
                                        thumbColor="#FFF"
                                    />
                                </View>

                                {transportRequired && (
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: theme.text }]}>Select Bus Route</Text>
                                        <View style={[styles.pickerContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                            <Picker
                                                selectedValue={selectedBus}
                                                onValueChange={(itemValue) => setSelectedBus(itemValue)}
                                                style={[styles.picker, { color: theme.text }]}
                                                dropdownIconColor={theme.text}
                                            >
                                                <Picker.Item label="Select Bus..." value="" color={theme.subtext} />
                                                {buses.map((b) => (
                                                    <Picker.Item key={b.id} label={b.bus_number} value={b.id} color={theme.text} />
                                                ))}
                                            </Picker>
                                        </View>
                                    </View>
                                )}
                            </>
                        )}

                        <TouchableOpacity style={styles.createButton} onPress={handleCreate} disabled={loading}>
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
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
        paddingTop: 200,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        borderRadius: 15,
        padding: 5,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    tabText: {
        fontWeight: 'bold',
        fontSize: 14,
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
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    divider: {
        height: 1,
        marginVertical: 20,
    },
    helperText: {
        fontSize: 12,
        marginBottom: 15,
        marginTop: -10,
        fontStyle: 'italic',
    },
    inputGroup: {
        marginBottom: 15,
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
        height: 50,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
        height: 50,
        justifyContent: 'center',
    },
    picker: {
        height: 50,
        width: '100%',
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
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default AddMemberScreen;
