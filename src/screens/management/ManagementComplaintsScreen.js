import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../../config';
import { getToken } from '../../services/auth';

const ManagementComplaintsScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('in_action'); // Default next status
    const [activeTab, setActiveTab] = useState('open'); // 'open' | 'resolved'

    const filteredComplaints = complaints.filter(c => {
        if (activeTab === 'open') return ['submitted', 'in_action'].includes(c.status);
        if (activeTab === 'resolved') return c.status === 'resolved';
        return true;
    });

    const fetchComplaints = async () => {
        try {
            const token = await getToken();
            const res = await axios.get(`${API_URL}/dashboard/complaints/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(res.data);
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

    const handleUpdateStatus = async () => {
        if (!selectedComplaint) return;

        try {
            const token = await getToken();
            await axios.patch(`${API_URL}/dashboard/complaints/${selectedComplaint.id}/`, {
                status: status,
                response: response
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setModalVisible(false);
            setSelectedComplaint(null);
            setResponse('');
            fetchComplaints();
            Alert.alert('Success', 'Complaint updated successfully');
        } catch (error) {
            console.log('Error updating complaint:', error);
            Alert.alert('Error', 'Failed to update complaint');
        }
    };

    const openUpdateModal = (item) => {
        setSelectedComplaint(item);
        setResponse(item.response || '');
        setStatus(item.status);
        setModalVisible(true);
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
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card }]}
            onPress={() => openUpdateModal(item)}
        >
            <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <StatusBadge status={item.status} />
            </View>
            <View style={styles.userInfo}>
                <Ionicons name="person-circle-outline" size={16} color={theme.subtext} />
                <Text style={[styles.userName, { color: theme.subtext }]}>
                    {item.student_name || 'Student'}
                    {item.student_id ? ` (#${item.student_id})` : ''}
                </Text>
            </View>
            <Text style={[styles.cardDate, { color: theme.subtext }]}>{item.date}</Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{item.description}</Text>

            {item.response && (
                <View style={[styles.responseContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Text style={[styles.responseLabel, { color: theme.subtext }]}>Your Response:</Text>
                    <Text style={[styles.responseText, { color: theme.text }]}>{item.response}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <ImageBackground
            source={require('../../../assets/background.png')}
            style={[styles.container, { backgroundColor: theme.background }]}
            imageStyle={{ opacity: isDarkMode ? 0.15 : 1 }}
        >
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Student Complaints</Text>
                </View>
                <Text style={styles.headerSubtitle}>Manage and respond to issues</Text>
                <Ionicons name="chatbubbles" size={100} color="rgba(255,255,255,0.05)" style={styles.headerIcon} />
            </View>


            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'open' && styles.activeTab]}
                    onPress={() => setActiveTab('open')}
                >
                    <Text style={[styles.tabText, activeTab === 'open' && styles.activeTabText, { color: activeTab === 'open' ? 'white' : theme.text }]}>Open</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'resolved' && styles.activeTab]}
                    onPress={() => setActiveTab('resolved')}
                >
                    <Text style={[styles.tabText, activeTab === 'resolved' && styles.activeTabText, { color: activeTab === 'resolved' ? 'white' : theme.text }]}>Resolved</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredComplaints}
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
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Update Complaint</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        {selectedComplaint && (
                            <View style={styles.complaintPreview}>
                                <Text style={[styles.previewTitle, { color: theme.text }]}>{selectedComplaint.title}</Text>
                                <Text numberOfLines={2} style={[styles.previewDesc, { color: theme.subtext }]}>{selectedComplaint.description}</Text>
                            </View>
                        )}

                        <Text style={[styles.inputLabel, { color: theme.text }]}>Status</Text>
                        <View style={styles.statusContainer}>
                            {['submitted', 'in_action', 'resolved'].map((s) => (
                                <TouchableOpacity
                                    key={s}
                                    style={[
                                        styles.statusOption,
                                        status === s && styles.statusOptionSelected,
                                        { borderColor: theme.border }
                                    ]}
                                    onPress={() => setStatus(s)}
                                >
                                    <Text style={[
                                        styles.statusText,
                                        { color: theme.subtext },
                                        status === s && styles.statusTextSelected
                                    ]}>
                                        {s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.inputLabel, { color: theme.text }]}>Response</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                            placeholder="Write your response..."
                            placeholderTextColor={theme.subtext}
                            value={response}
                            onChangeText={setResponse}
                            multiline
                            numberOfLines={4}
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.primary || '#3498DB' }]}
                            onPress={handleUpdateStatus}
                        >
                            <Text style={styles.submitButtonText}>Update Status</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ImageBackground >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingBottom: 25,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 10,
        elevation: 10,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginLeft: 40 },
    headerIcon: {
        position: 'absolute',
        right: -10,
        bottom: -20,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 15,
        padding: 5,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#3498DB',
        elevation: 2,
    },
    tabText: {
        fontWeight: '600',
        fontSize: 14,
    },
    activeTabText: {
        color: 'white',
        fontWeight: 'bold',
    },
    listContent: { padding: 20, paddingBottom: 100 },
    card: { padding: 15, borderRadius: 20, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    userName: { fontSize: 12, marginLeft: 5 },
    cardDate: { fontSize: 12, marginBottom: 8 },
    cardDesc: { fontSize: 14, lineHeight: 20 },
    responseContainer: { marginTop: 15, padding: 12, borderRadius: 12 },
    responseLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
    responseText: { fontSize: 13, fontStyle: 'italic' },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 10, fontSize: 16 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    complaintPreview: { padding: 10, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 10, marginBottom: 15 },
    previewTitle: { fontWeight: 'bold', marginBottom: 2 },
    previewDesc: { fontSize: 12 },
    inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    statusContainer: { flexDirection: 'row', marginBottom: 20 },
    statusOption: { flex: 1, padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 8, alignItems: 'center' },
    statusOptionSelected: { backgroundColor: '#3498DB', borderColor: '#3498DB' },
    statusText: { fontSize: 12, fontWeight: '600' },
    statusTextSelected: { color: 'white' },
    input: { borderWidth: 1, borderRadius: 15, padding: 15, marginBottom: 20, fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
    submitButton: { padding: 16, borderRadius: 15, alignItems: 'center', marginTop: 5 },
    submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default ManagementComplaintsScreen;
