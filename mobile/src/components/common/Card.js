import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Card = ({ title, children }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 3,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    content: {
        // Additional styling for content can be added here
    },
});

export default Card;