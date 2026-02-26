import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getOpdQueue } from '../../api/endpoints';
import { updateQueueStatus } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';
import { ui } from '../../theme/ui';

const STATUSES = ['Waiting', 'InProgress', 'Completed', 'Cancelled'];

export default function FacultyQueueScreen() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadQueue();
    }, [filterStatus])
  );

  const loadQueue = async () => {
    try {
      setLoading(true);
      const params = {};
      // Faculty see queue from their department
      const userDepartment = user?.department || user?.faculty?.department;
      if (userDepartment) {
        params.department = userDepartment;
      }
      if (filterStatus) {
        params.status = filterStatus;
      }

      const data = await getOpdQueue(params);
      setQueue(data);
    } catch (error) {
      console.error('Load queue error:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQueue();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (tokenId, newStatus) => {
    try {
      await updateQueueStatus(tokenId, { status: newStatus });
      Alert.alert('Success', `Status updated to ${newStatus}`);
      await loadQueue();
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update status');
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
    const statuses = ['Waiting', 'InProgress', 'Completed', 'Cancelled'];
    const statusButtons = statuses
      .filter((status) => status !== item.status)
      .map((status) => ({
        text: status,
        onPress: () => confirmStatusChange(item, status),
      }));

    if (Platform.OS === 'android') {
      Alert.alert(
        'Change Queue Status',
        `Token ${item.tokenLabel}: choose new status`,
        statusButtons,
        { cancelable: true }
      );
      return;
    }

    Alert.alert('Change Queue Status', `Token ${item.tokenLabel}: choose new status`, [
      ...statusButtons,
      { text: 'Cancel', style: 'cancel' },
    ]);
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

    const isMySupervision =
      String(item?.assignedFaculty?._id || item?.assignedFaculty || '') ===
      String(user?.id || user?._id || '');

    return (
      <View
        style={[
          styles.tokenCard,
          { borderLeftColor: statusColor },
          isMySupervision && styles.mySupervisionCard,
        ]}
      >
        {isMySupervision && (
          <View style={styles.supervisionBadge}>
            <Text style={styles.supervisionText}>👁️ MY SUPERVISION</Text>
          </View>
        )}

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
          Patient: {item.patientUser?.name || 'N/A'}
        </Text>
        <Text style={styles.tokenInfo}>
          MRN: {item.patientUser?.patient?.mrn || 'N/A'}
        </Text>
        <Text style={styles.tokenInfo}>Department: {item.department}</Text>
        <Text style={styles.tokenInfo}>Chair: {item.chair || 'Not Assigned'}</Text>
        {item.assignedStudent && (
          <Text style={styles.tokenInfo}>
            Student: {item.assignedStudent.name || 'N/A'}
          </Text>
        )}
        {item.symptoms && item.symptoms.length > 0 && (
          <Text style={styles.tokenInfo}>
            Symptoms: {item.symptoms.join(', ')}
          </Text>
        )}

        <View style={styles.actions}>
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
        <Text style={styles.title}>
          Department Queue ({queue.length})
        </Text>
        <Text style={styles.subtitle}>
          {user?.department || user?.faculty?.department || 'All Departments'}
        </Text>
      </View>

      <View style={styles.filters}>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No patients in queue</Text>
          </View>
        }
      />
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
  subtitle: {
    fontSize: 14,
    color: ui.colors.muted,
    marginTop: 4,
  },
  filters: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: ui.colors.border,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: ui.colors.text,
    marginRight: 8,
    minWidth: 60,
  },
  picker: {
    flex: 1,
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
  mySupervisionCard: {
    borderWidth: 2,
    borderColor: ui.colors.primary,
  },
  supervisionBadge: {
    backgroundColor: ui.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  supervisionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
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
    marginTop: 10,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
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
});
