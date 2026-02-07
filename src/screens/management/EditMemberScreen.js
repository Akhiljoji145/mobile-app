import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform, Switch, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getToken } from '../../services/auth';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../config';
import { Picker } from '@react-native-picker/picker';

const EditMemberScreen = ({ route, navigation }) => {
    const { member } = route.params || {};

    if (!member) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text }}>Error: Member data not found.</Text>
            </View>
        );
    }
    const { theme, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);

    // Determines initial state based on passed member obj
    // Note: Data like 'grades' and 'buses' need to be fetched if it's a teacher

    const [name, setName] = useState(member.username);
    const [email, setEmail] = useState(member.email);
    const [phone, setPhone] = useState(member.phone || '');
    const [organization, setOrganization] = useState(member.organization_name || '');

    // Teacher Fields
    const [grades, setGrades] = useState([]);
    const [buses, setBuses] = useState([]);

    // We'll need to fetch current class/bus for the user if they have one. 
    // The list endpoint returns IDs, we might need to fetch details or just list
    const [selectedGrade, setSelectedGrade] = useState(''); // Need to pre-fill
    const [selectedBus, setSelectedBus] = useState('');     // Need to pre-fill
    const [transportRequired, setTransportRequired] = useState(false);

    // Parent Fields
    const [parentName, setParentName] = useState('');
    const [parentEmail, setParentEmail] = useState('');

    useEffect(() => {
        if (member.is_teacher) {
            fetchGradesAndBuses();
            // In a real app, we'd fetch the specific teacher profile to get current assignations
            // For now we start empty or "Select..." unless we pass extended data
        }
        // Ideally we fetch full user details on mount to populate existing fields correctly
    }, []);

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
        }
    };

    const handleUpdate = async () => {
        if (!name || !email) {
            Alert.alert('Missing Fields', 'Name and Email are required.');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            const payload = {
                username: name,
                email: email,
                phone: phone,
                organization_name: organization
            };

            if (member.is_teacher) {
                if (selectedGrade) payload.class_in_charge = selectedGrade;
                if (transportRequired && selectedBus) payload.bus = selectedBus;
                else if (!transportRequired) payload.bus = null; // Clear bus if not required
            }

            if (member.is_student && (parentName || parentEmail)) {
                payload.parent_details = {
                    name: parentName,
                    email: parentEmail
                };
            }

            await axios.put(`${API_URL}/users/${member.id}/update/`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Member updated successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.log(error);
            const msg = error.response?.data?.error || 'Failed to update member.';
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
            {/* Absolute Header with Curved Design */}
            <View style={[styles.headerBackground, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Edit Member</Text>
                        <Text style={styles.headerSubtitle}>Update member details</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <Ionicons name="create" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={[styles.formCard, { backgroundColor: theme.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Info</Text>


                        {renderInput('Full Name', name, setName, 'person-outline', 'Name')}
                        {renderInput('Email Address', email, setEmail, 'mail-outline', 'Email', 'email-address')}
                        {renderInput('Phone Number', phone, setPhone, 'call-outline', 'Phone', 'phone-pad')}

                        {member.is_management && renderInput('Organization', organization, setOrganization, 'business-outline', 'Organization')}

                        {member.is_teacher && (
                            <>
                                <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Teacher Details</Text>
                                <Text style={[styles.helperText, { color: theme.subtext }]}>Update assignment details below.</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>Class In-charge</Text>
                                    <View style={[styles.pickerContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                        <Picker
                                            selectedValue={selectedGrade}
                                            onValueChange={(itemValue) => setSelectedGrade(itemValue)}
                                            style={[styles.picker, { color: theme.text }]}
                                            dropdownIconColor={theme.text}
                                        >
                                            <Picker.Item label="Unassigned" value="" color={theme.subtext} />
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
                                        <Text style={[styles.label, { color: theme.text }]}>Bus Route</Text>
                                        <View style={[styles.pickerContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                            <Picker
                                                selectedValue={selectedBus}
                                                onValueChange={(itemValue) => setSelectedBus(itemValue)}
                                                style={[styles.picker, { color: theme.text }]}
                                                dropdownIconColor={theme.text}
                                            >
                                                <Picker.Item label="Select Bus..." value="" color={theme.subtext} />
                                                {buses.map((b) => (
                                                    <Picker.Item key={b.id} label={b.name} value={b.id} color={theme.text} />
                                                ))}
                                            </Picker>
                                        </View>
                                    </View>
                                )}
                            </>
                        )}

                        {member.is_student && (
                            <>
                                <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Parent Details</Text>
                                <Text style={[styles.helperText, { color: theme.subtext }]}>Update linked parent info.</Text>

                                {renderInput('Parent Name', parentName, setParentName, 'people-outline', 'Update Parent Name')}
                                {renderInput('Parent Email', parentEmail, setParentEmail, 'mail-outline', 'Update Parent Email', 'email-address')}
                            </>
                        )}

                        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Member</Text>}
                        </TouchableOpacity>
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
    scrollContent: {
        paddingTop: 200,
        paddingHorizontal: 20,
        paddingBottom: 20,
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
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 5, marginLeft: 2 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 50,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16 },
    updateButton: {
        backgroundColor: '#3498DB',
        borderRadius: 12,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    divider: { height: 1, marginVertical: 20 },
    helperText: { fontSize: 12, marginBottom: 15, fontStyle: 'italic' },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
        height: 50,
        justifyContent: 'center',
    },
    picker: { height: 50, width: '100%' },
    row: { flexDirection: 'row', alignItems: 'center' },
});

export default EditMemberScreen;
