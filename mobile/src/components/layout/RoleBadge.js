import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RoleBadge = ({ role }) => {
    const getBadgeStyle = () => {
        switch (role) {
            case 'Admin':
                return styles.adminBadge;
            case 'Faculty':
                return styles.facultyBadge;
            case 'Student':
                return styles.studentBadge;
            case 'Patient':
                return styles.patientBadge;
            default:
                return styles.defaultBadge;
        }
    };

    return (
        <View style={[styles.badge, getBadgeStyle()]}>
            <Text style={styles.badgeText}>{role}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        padding: 10,
        borderRadius: 5,
        margin: 5,
    },
    adminBadge: {
        backgroundColor: '#ffcc00',
    },
    facultyBadge: {
        backgroundColor: '#007bff',
    },
    studentBadge: {
        backgroundColor: '#28a745',
    },
    patientBadge: {
        backgroundColor: '#dc3545',
    },
    defaultBadge: {
        backgroundColor: '#6c757d',
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default RoleBadge;