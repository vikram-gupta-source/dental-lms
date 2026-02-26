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
import { getOpdQueue, updateQueueStatus } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';
import { ui } from '../../theme/ui';

export default function StudentQueueScreen() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadQueue();
    }, [])
  );

  const loadQueue = async () => {
    try {
      setLoading(true);
      const userId = user?.id || user?._id;
      const data = await getOpdQueue();

      const myTokens = data.filter(
        (t) => {
          const assignedId = t?.assignedStudent?._id || t?.assignedStudent;
          const isMine = String(assignedId || '') === String(userId || '');
          const isActive = ['Waiting', 'InProgress'].includes(t?.status);
          return isMine && isActive;
        }
      );
      setQueue(myTokens);
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
      loadQueue();
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
        : '#27ae60';

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
          Patient: {item.patientUser?.name || 'N/A'}
        </Text>
        <Text style={styles.tokenInfo}>
          MRN: {item.patientUser?.patient?.mrn || 'N/A'}
        </Text>
        <Text style={styles.tokenInfo}>Department: {item.department}</Text>
        <Text style={styles.tokenInfo}>Chair: {item.chair || 'Not Assigned'}</Text>
        {item.assignedFaculty && (
          <Text style={styles.tokenInfo}>
            Supervisor: {item.assignedFaculty.name || 'N/A'}
          </Text>
        )}
        {item.symptoms && item.symptoms.length > 0 && (
          <Text style={styles.tokenInfo}>
            Symptoms: {item.symptoms.join(', ')}
          </Text>
        )}

        <View style={styles.actions}>
          {item.status === 'Waiting' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: ui.colors.primary }]}
              onPress={() => confirmStatusChange(item, 'InProgress')}
            >
              <Text style={styles.actionBtnText}>Start Treatment</Text>
            </TouchableOpacity>
          )}
          {item.status === 'InProgress' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: ui.colors.success }]}
              onPress={() => confirmStatusChange(item, 'Completed')}
            >
              <Text style={styles.actionBtnText}>Mark Complete</Text>
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
        <Text style={styles.title}>My Assigned Patients ({queue.length})</Text>
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
            <Text style={styles.emptyText}>No patients assigned yet</Text>
            <Text style={styles.emptySubtext}>
              When patients are assigned to you, they will appear here
            </Text>
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
    color: ui.colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    color: ui.colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
});
