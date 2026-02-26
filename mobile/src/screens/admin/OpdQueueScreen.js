import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { checkInPatient, getOpdQueue, updateQueueStatus, getAdminUsers } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import { ui } from '../../theme/ui';

const DEPARTMENTS = [
  'Oral Surgery',
  'Orthodontics',
  'Periodontics',
  'Endodontics',
  'Prosthodontics',
  'Pedodontics',
  'General Dentistry',
];

const PRIORITIES = ['Low', 'Normal', 'High', 'Emergency'];
const STATUSES = ['Waiting', 'InProgress', 'Completed', 'Cancelled'];

export default function OpdQueueScreen() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInModal, setCheckInModal] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    patientUserId: '',
    department: '',
    priority: 'Normal',
    symptoms: '',
  });

  useEffect(() => {
    loadData();
  }, [filterDept, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterDept) params.department = filterDept;
      if (filterStatus) params.status = filterStatus;

      const [queueData, usersData] = await Promise.all([
        getOpdQueue(params),
        getAdminUsers(),
      ]);

      setQueue(queueData);
      // Filter only patients for check-in dropdown
      setPatients(usersData.filter((u) => u.role === 'patient'));
    } catch (error) {
      console.error('Load queue error:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!formData.patientUserId || !formData.department) {
      Alert.alert('Error', 'Please select patient and department');
      return;
    }

    try {
      const payload = {
        patientUserId: formData.patientUserId,
        department: formData.department,
        priority: formData.priority,
        symptoms: formData.symptoms.split(',').map((s) => s.trim()).filter(Boolean),
      };

      await checkInPatient(payload);
      Alert.alert('Success', 'Patient checked-in successfully');
      setCheckInModal(false);
      setFormData({
        patientUserId: '',
        department: '',
        priority: 'Normal',
        symptoms: '',
      });
      loadData();
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Check-in failed');
    }
  };

  const handleUpdateStatus = async (tokenId, newStatus) => {
    try {
      await updateQueueStatus(tokenId, { status: newStatus });
      Alert.alert('Success', 'Status updated');
      loadData();
    } catch (error) {
      console.error('Update status error:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Update failed');
    }
  };

  const confirmStatusChange = (item, newStatus) => {
    if (Platform.OS === 'web') {
      handleUpdateStatus(item._id, newStatus);
      return;
    }

    Alert.alert(
      'Confirm Status Change',
      `Change ${item.tokenLabel} from ${item.status} to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Update',
          onPress: () => handleUpdateStatus(item._id, newStatus),
        },
      ]
    );
  };

  const openStatusSelector = (item) => {
    const defaultStatus = STATUSES.find((status) => status !== item.status) || '';
    setSelectedToken(item);
    setNextStatus(defaultStatus);
    setStatusModalOpen(true);
  };

  const submitManualStatusChange = () => {
    if (!selectedToken || !nextStatus) {
      setStatusModalOpen(false);
      return;
    }
    setStatusModalOpen(false);
    confirmStatusChange(selectedToken, nextStatus);
  };

  const renderToken = ({ item }) => {
    const statusColor =
      item.status === 'Waiting'
        ? '#f39c12'
        : item.status === 'InProgress'
        ? '#3498db'
        : item.status === 'Completed'
        ? '#27ae60'
        : '#95a5a6';

    const priorityBadge =
      item.priority === 'Emergency'
        ? { bg: '#e74c3c', label: '🚨 EMERGENCY' }
        : item.priority === 'High'
        ? { bg: '#e67e22', label: '⚠️ HIGH' }
        : null;

    return (
      <View style={[styles.tokenCard, { borderLeftColor: statusColor }]}>
        <View style={styles.tokenHeader}>
          <Text style={styles.tokenLabel}>{item.tokenLabel}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {priorityBadge && (
          <View style={[styles.priorityBadge, { backgroundColor: priorityBadge.bg }]}>
            <Text style={styles.priorityText}>{priorityBadge.label}</Text>
          </View>
        )}

        <Text style={styles.tokenInfo}>
          Patient: {item.patientUser?.name || 'N/A'} - MRN: {item.patientUser?.patient?.mrn || 'N/A'}
        </Text>
        <Text style={styles.tokenInfo}>Department: {item.department}</Text>
        <Text style={styles.tokenInfo}>Chair: {item.chair || 'Not Assigned'}</Text>
        {item.assignedStudent && (
          <Text style={styles.tokenInfo}>
            Student: {item.assignedStudent.name || 'N/A'}
          </Text>
        )}
        {item.assignedFaculty && (
          <Text style={styles.tokenInfo}>
            Faculty: {item.assignedFaculty.name || 'N/A'}
          </Text>
        )}

        {item.symptoms && item.symptoms.length > 0 && (
          <Text style={styles.tokenInfo}>Symptoms: {item.symptoms.join(', ')}</Text>
        )}

        <View style={styles.actions}>
          {item.status === 'Waiting' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: ui.colors.primary }]}
              onPress={() => confirmStatusChange(item, 'InProgress')}
            >
              <Text style={styles.actionBtnText}>Start</Text>
            </TouchableOpacity>
          )}
          {item.status === 'InProgress' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: ui.colors.success }]}
              onPress={() => confirmStatusChange(item, 'Completed')}
            >
              <Text style={styles.actionBtnText}>Complete</Text>
            </TouchableOpacity>
          )}
          {(item.status === 'Waiting' || item.status === 'InProgress') && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#95a5a6' }]}
              onPress={() => confirmStatusChange(item, 'Cancelled')}
            >
              <Text style={styles.actionBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#34495e' }]}
            onPress={() => openStatusSelector(item)}
          >
            <Text style={styles.actionBtnText}>Change Status</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ui.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OPD Queue ({queue.length})</Text>
        <TouchableOpacity style={styles.checkInBtn} onPress={() => setCheckInModal(true)}>
          <Text style={styles.checkInBtnText}>+ Check-In Patient</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Department:</Text>
          <Picker
            selectedValue={filterDept}
            onValueChange={(val) => setFilterDept(val)}
            style={styles.picker}
          >
            <Picker.Item label="All Departments" value="" />
            {DEPARTMENTS.map((d) => (
              <Picker.Item key={d} label={d} value={d} />
            ))}
          </Picker>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Status:</Text>
          <Picker
            selectedValue={filterStatus}
            onValueChange={(val) => setFilterStatus(val)}
            style={styles.picker}
          >
            <Picker.Item label="All Statuses" value="" />
            {STATUSES.map((s) => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
        </View>
      </View>

      <FlatList
        data={queue}
        keyExtractor={(item) => item._id}
        renderItem={renderToken}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tokens in queue</Text>
          </View>
        }
      />

      {/* Check-In Modal */}
      <Modal visible={checkInModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Check-In Patient</Text>

              <Text style={styles.label}>Patient *</Text>
              <Picker
                selectedValue={formData.patientUserId}
                onValueChange={(val) => setFormData({ ...formData, patientUserId: val })}
                style={styles.input}
              >
                <Picker.Item label="-- Select Patient --" value="" />
                {patients.map((p) => (
                  <Picker.Item
                    key={p._id}
                    label={`${p.name} - MRN: ${p.patient?.mrn || 'N/A'}`}
                    value={p._id}
                  />
                ))}
              </Picker>

              <Text style={styles.label}>Department *</Text>
              <Picker
                selectedValue={formData.department}
                onValueChange={(val) => setFormData({ ...formData, department: val })}
                style={styles.input}
              >
                <Picker.Item label="-- Select Department --" value="" />
                {DEPARTMENTS.map((d) => (
                  <Picker.Item key={d} label={d} value={d} />
                ))}
              </Picker>

              <Text style={styles.label}>Priority</Text>
              <Picker
                selectedValue={formData.priority}
                onValueChange={(val) => setFormData({ ...formData, priority: val })}
                style={styles.input}
              >
                {PRIORITIES.map((p) => (
                  <Picker.Item key={p} label={p} value={p} />
                ))}
              </Picker>

              <Text style={styles.label}>Symptoms (comma-separated)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.symptoms}
                onChangeText={(val) => setFormData({ ...formData, symptoms: val })}
                placeholder="e.g., toothache, swelling"
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => {
                    setCheckInModal(false);
                    setFormData({
                      patientUserId: '',
                      department: '',
                      priority: 'Normal',
                      symptoms: '',
                    });
                  }}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.submitBtn]}
                  onPress={handleCheckIn}
                >
                  <Text style={styles.modalBtnText}>Check-In</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={statusModalOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Queue Status</Text>
            <Text style={styles.label}>
              {selectedToken ? `Token ${selectedToken.tokenLabel}` : 'Select Token'}
            </Text>

            <Text style={styles.label}>New Status</Text>
            <Picker
              selectedValue={nextStatus}
              onValueChange={(val) => setNextStatus(val)}
              style={styles.input}
            >
              {STATUSES.filter((status) => status !== selectedToken?.status).map((status) => (
                <Picker.Item key={status} label={status} value={status} />
              ))}
            </Picker>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setStatusModalOpen(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={submitManualStatusChange}
              >
                <Text style={styles.modalBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ui.colors.bg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: ui.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: ui.colors.text,
  },
  checkInBtn: {
    backgroundColor: ui.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  checkInBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: ui.colors.border,
  },
  filterGroup: {
    flex: 1,
    marginRight: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: ui.colors.muted,
    marginBottom: 4,
  },
  picker: {
    height: 40,
    backgroundColor: ui.colors.bg,
    borderRadius: 4,
  },
  list: {
    padding: 16,
  },
  tokenCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: ui.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  priorityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  tokenInfo: {
    fontSize: 14,
    color: ui.colors.muted,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: ui.colors.muted,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ui.colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: ui.colors.text,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 100,
  },
  cancelBtn: {
    backgroundColor: '#95a5a6',
  },
  submitBtn: {
    backgroundColor: ui.colors.primary,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
