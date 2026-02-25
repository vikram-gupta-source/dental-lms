import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DashboardScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Welcome to the Dental Hospital Management System</Text>
            {/* Additional dashboard components can be added here */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});

export default DashboardScreen;