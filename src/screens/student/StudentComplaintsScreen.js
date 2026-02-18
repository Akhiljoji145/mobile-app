import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../../config';
import { getToken } from '../../services/auth';

const StudentComplaintsScreen = () => {
    const { theme, isDarkMode } = useTheme();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const fetchComplaints = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/student/complaints/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(response.data);
        } catch (error) {
            console.log('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchComplaints();
        }, [])
    );

    const handleSubmit = async () => {
        if (!newTitle.trim() || !newDesc.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            const token = await getToken();
            await axios.post(`${API_URL}/student/complaints/`, {
                title: newTitle,
                description: newDesc
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setModalVisible(false);
            setNewTitle('');
            setNewDesc('');
            fetchComplaints();
            Alert.alert('Success', 'Complaint submitted successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to submit complaint');
        }
    };

    const StatusBadge = ({ status }) => {
        let color = '#95A5A6';
        let bg = '#ECF0F1';
        let label = 'Unknown';

        switch (status) {
            case 'submitted':
                color = '#E67E22';
                bg = '#FDEBD0';
                label = 'Submitted';
                break;
            case 'in_action':
                color = '#3498DB';
                bg = '#D6EAF8';
                label = 'In Action';
                break;
            case 'resolved':
                color = '#2ECC71';
                bg = '#D5F5E3';
                label = 'Resolved';
                break;
        }

        return (
            <View style={[styles.badge, { backgroundColor: bg }]}>
                <Text style={[styles.badgeText, { color: color }]}>{label}</Text>
            </View>
        );
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <StatusBadge status={item.status} />
            </View>
            <Text style={[styles.cardDate, { color: theme.subtext }]}>{item.date}</Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{item.description}</Text>

            {item.response && (
                <View style={[styles.responseContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Text style={[styles.responseLabel, { color: theme.subtext }]}>Admin Response:</Text>
                    <Text style={[styles.responseText, { color: theme.text }]}>{item.response}</Text>
                </View>
            )}
        </View>
    );

    return (
        <ImageBackground
            source={require('../../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0.15 : 1 }}
        >
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <View>
                    <Text style={styles.headerTitle}>Complaints</Text>
                    <Text style={styles.headerSubtitle}>Report Issues & Usage</Text>
                </View>
                <Ionicons name="chatbubbles" size={120} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>

            <FlatList
                data={complaints}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="chatbubbles-outline" size={50} color={theme.subtext} />
                        <Text style={[styles.emptyText, { color: theme.subtext }]}>No complaints found.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary || '#3498DB' }]}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>New Complaint</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.inputLabel, { color: theme.text }]}>Title</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                            placeholder="Brief title of the issue"
                            placeholderTextColor={theme.subtext}
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />

                        <Text style={[styles.inputLabel, { color: theme.text }]}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                            placeholder="Describe the issue in detail..."
                            placeholderTextColor={theme.subtext}
                            value={newDesc}
                            onChangeText={setNewDesc}
                            multiline
                            numberOfLines={4}
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.primary || '#3498DB' }]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>Submit Complaint</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
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
        justifyContent: 'flex-start',
    },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
    headerIcon: {
        position: 'absolute',
        right: -20,
        bottom: -40,
    },
    listContent: { padding: 20, paddingTop: 200, paddingBottom: 100 },
    card: { padding: 15, borderRadius: 20, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    cardDate: { fontSize: 12, marginBottom: 8 },
    cardDesc: { fontSize: 14, lineHeight: 20 },
    responseContainer: { marginTop: 15, padding: 15, borderRadius: 15 },
    responseLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
    responseText: { fontSize: 13, fontStyle: 'italic' },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65 },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 10, fontSize: 16 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '80%', elevation: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 24, fontWeight: 'bold' },
    inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: { borderWidth: 1, borderRadius: 15, padding: 15, marginBottom: 20, fontSize: 16 },
    textArea: { height: 120, textAlignVertical: 'top' },
    submitButton: { padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, elevation: 2 },
    submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default StudentComplaintsScreen;
