import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ImageBackground, ActivityIndicator, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getToken } from '../../services/auth';
import { API_URL } from '../../config';
import { useFocusEffect } from '@react-navigation/native';

const DriverBroadcastScreen = ({ user }) => {
    const { theme, isDarkMode } = useTheme();
    const [type, setType] = useState('Bus Change');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const NOTIFICATION_TYPES = ['Bus Change', 'Driver Change', 'Trip Delay', 'Emergency', 'Other'];

    const fetchHistory = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/dashboard/driver/broadcast/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(response.data);
        } catch (error) {
            console.log('Error fetching history:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchHistory();
        }, [])
    );

    const handleSendAlert = async () => {
        if (!message.trim()) {
            Alert.alert('Missing Message', 'Please enter a message details to broadcast.');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            const payload = {
                type,
                message,
                phone: user.phone
            };

            await axios.post(`${API_URL}/dashboard/driver/broadcast/`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Notification broadcasted and emails sent successfully.');
            setMessage('');
            setType('Bus Change');
            fetchHistory(); // Refresh history

        } catch (error) {
            console.log('Broadcast error:', error);
            Alert.alert('Error', 'Failed to broadcast notification.');
        } finally {
            setLoading(false);
        }
    };

    const renderHistoryItem = ({ item }) => (
        <View style={[styles.historyItem, { borderBottomColor: theme.border }]}>
            <View style={styles.historyHeader}>
                <Text style={[styles.historyTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.historyTime, { color: theme.subtext }]}>{item.created_at}</Text>
            </View>
            <Text style={[styles.historyMessage, { color: theme.textSecondary }]}>{item.message}</Text>
        </View>
    );

    return (
        <ImageBackground
            source={require('../../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0.15 : 1 }}
            resizeMode="cover"
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Broadcast Center</Text>
                    <Text style={styles.headerSubtitle}>Email & Push Notifications</Text>
                </View>
                <Ionicons name="megaphone" size={100} color="rgba(255,255,255,0.1)" style={styles.headerIcon} />
            </View>

            <View style={styles.contentContainer}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={[styles.card, { backgroundColor: theme.card }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="create-outline" size={20} color={theme.text} />
                            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0, marginLeft: 10 }]}>New Alert</Text>
                        </View>

                        {/* Type Selection Chips */}
                        <Text style={[styles.label, { color: theme.subtext }]}>Notification Type</Text>
                        <View style={styles.chipContainer}>
                            {NOTIFICATION_TYPES.map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    style={[
                                        styles.chip,
                                        type === t
                                            ? { backgroundColor: '#3498DB', borderColor: '#3498DB' }
                                            : { backgroundColor: 'transparent', borderColor: theme.border }
                                    ]}
                                    onPress={() => setType(t)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        { color: type === t ? '#FFF' : theme.textSecondary }
                                    ]}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Message Input */}
                        <Text style={[styles.label, { color: theme.subtext, marginTop: 15 }]}>Message</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                            placeholder="e.g., Bus #5 is delayed by 10 mins due to traffic."
                            placeholderTextColor={theme.subtext}
                            multiline
                            numberOfLines={4}
                            value={message}
                            onChangeText={setMessage}
                        />

                        {/* Driver Contact Info Preview */}
                        <View style={[styles.contactPreview, { backgroundColor: isDarkMode ? 'rgba(46, 204, 113, 0.1)' : '#E8F5E9' }]}>
                            <Ionicons name="call" size={20} color="#2ECC71" />
                            <Text style={[styles.contactText, { color: theme.text }]}>
                                {user?.phone || 'No phone registered'} (Included in Email)
                            </Text>
                        </View>

                        {/* Send Button */}
                        <TouchableOpacity
                            style={[styles.sendButton, { opacity: loading ? 0.7 : 1 }]}
                            onPress={handleSendAlert}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="paper-plane" size={20} color="#FFF" style={{ marginRight: 10 }} />
                                    <Text style={styles.sendButtonText}>Send & Email Broadcast</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <Text style={[styles.note, { color: theme.subtext }]}>
                            This triggers emails to all assigned parents/students.
                        </Text>
                    </View>

                    {/* History Section */}
                    {history.length > 0 && (
                        <View style={[styles.historyContainer, { marginTop: 20 }]}>
                            <View style={[styles.sectionHeader, { marginBottom: 15 }]}>
                                <Ionicons name="time-outline" size={20} color={theme.text} />
                                <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0, marginLeft: 10 }]}>Recent Broadcasts</Text>
                            </View>
                            <View style={[styles.card, { backgroundColor: theme.card, padding: 0 }]}>
                                {history.map((item, index) => (
                                    <View key={item.id} style={[
                                        styles.historyItem,
                                        { borderBottomColor: theme.border },
                                        index === history.length - 1 && { borderBottomWidth: 0 }
                                    ]}>
                                        <View style={styles.historyHeader}>
                                            <Text style={[styles.historyTitle, { color: theme.text }]}>{item.title}</Text>
                                            <Text style={[styles.historyTime, { color: theme.subtext }]}>{item.created_at}</Text>
                                        </View>
                                        <Text style={[styles.historyMessage, { color: theme.textSecondary }]}>{item.message}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={{ height: 20 }} />

                </ScrollView>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 160,
        paddingTop: 50,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        justifyContent: 'center',
        elevation: 5,
        zIndex: 10,
    },
    headerContent: {
        zIndex: 2,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 5,
    },
    headerIcon: {
        position: 'absolute',
        right: -10,
        bottom: -20,
    },
    contentContainer: {
        flex: 1,
        marginTop: -30, // Overlap header
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    chip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 10,
        marginBottom: 10,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
    },
    input: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 15,
        fontSize: 16,
        textAlignVertical: 'top',
        height: 120,
    },
    contactPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 20,
    },
    contactText: {
        marginLeft: 10,
        fontWeight: '600',
        fontSize: 14,
    },
    sendButton: {
        backgroundColor: '#E74C3C',
        borderRadius: 15,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#E74C3C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    sendButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    note: {
        textAlign: 'center',
        marginTop: 15,
        fontSize: 12,
        fontStyle: 'italic',
    },
    historyItem: {
        padding: 15,
        borderBottomWidth: 1,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    historyTitle: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    historyTime: {
        fontSize: 12,
    },
    historyMessage: {
        fontSize: 13,
    },
});

export default DriverBroadcastScreen;
