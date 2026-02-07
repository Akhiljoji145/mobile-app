import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
    Image,
    ActivityIndicator,
    ImageBackground,
    KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { getToken } from '../../services/auth';
import { API_URL } from '../../config';

const EditBusScreen = () => {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { bus } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bus_number: '',
        destination: '',
        number_plate: '',
    });
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        if (bus) {
            setFormData({
                bus_number: bus.bus_number,
                destination: bus.destination || '',
                number_plate: bus.number_plate || '',
            });
        }
    }, [bus]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0]);
        }
    };

    const handleUpdateBus = async () => {
        if (!formData.bus_number || !formData.number_plate) {
            Alert.alert('Missing Fields', 'Please fill in required fields.');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            const form = new FormData();

            form.append('bus_number', formData.bus_number);
            form.append('destination', formData.destination);
            form.append('number_plate', formData.number_plate);

            if (photo) {
                // Determine file type
                let filename = photo.uri.split('/').pop();
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `image/${match[1]}` : `image`;

                form.append('photo', {
                    uri: Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
                    name: filename,
                    type: type,
                });
            }

            await axios.put(`${API_URL}/dashboard/buses/${bus.id}/`, form, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            Alert.alert('Success', 'Bus updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.log('Error updating bus:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Failed to update bus. Please try again.';
            Alert.alert('Error', typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
        } finally {
            setLoading(false);
        }
    };

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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.headerTitle}>Edit Bus</Text>
                        <Text style={styles.headerSubtitle}>{bus?.bus_number}</Text>
                    </View>
                    <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
                        <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <Ionicons name="create" size={100} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.formContainer, { backgroundColor: theme.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Update Details</Text>

                        {/* Bus Number */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Bus Number *</Text>
                            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                <Ionicons name="bus-outline" size={20} color={theme.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="e.g. Bus-01"
                                    placeholderTextColor={theme.subtext}
                                    value={formData.bus_number}
                                    onChangeText={(text) => setFormData({ ...formData, bus_number: text })}
                                />
                            </View>
                        </View>

                        {/* Number Plate */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Number Plate *</Text>
                            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                <Ionicons name="card-outline" size={20} color={theme.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="e.g. KL-01-AB-1234"
                                    placeholderTextColor={theme.subtext}
                                    value={formData.number_plate}
                                    onChangeText={(text) => setFormData({ ...formData, number_plate: text })}
                                />
                            </View>
                        </View>

                        {/* Destination */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Destination</Text>
                            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                                <Ionicons name="location-outline" size={20} color={theme.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="e.g. Central Station"
                                    placeholderTextColor={theme.subtext}
                                    value={formData.destination}
                                    onChangeText={(text) => setFormData({ ...formData, destination: text })}
                                />
                            </View>
                        </View>

                        {/* Photo Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Update Photo (Optional)</Text>
                            <TouchableOpacity
                                style={[styles.photoPicker, { borderColor: theme.border }]}
                                onPress={pickImage}
                            >
                                {(photo || bus?.photo) ? (
                                    <Image
                                        source={{ uri: photo ? photo.uri : `${API_URL}${bus.photo}` }}
                                        style={styles.previewImage}
                                    />
                                ) : (
                                    <View style={styles.photoPlaceholder}>
                                        <Ionicons name="camera" size={30} color={theme.subtext} />
                                        <Text style={[styles.photoText, { color: theme.subtext }]}>Tap to change photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleUpdateBus}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.submitButtonText}>Save Changes</Text>
                                    <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
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
        height: 150,
        paddingTop: 50,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 10,
        elevation: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerIcon: {
        position: 'absolute',
        right: -20,
        bottom: -30,
        opacity: 0.2,
    },
    scrollView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        paddingTop: 160,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    formContainer: {
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
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    photoPicker: {
        height: 150,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoPlaceholder: {
        alignItems: 'center',
    },
    photoText: {
        marginTop: 5,
        fontSize: 14,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    submitButton: {
        backgroundColor: '#4BCFFA',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#4BCFFA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default EditBusScreen;
