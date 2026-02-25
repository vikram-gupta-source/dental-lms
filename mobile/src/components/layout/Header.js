import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = ({ title }) => {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        width: '100%',
        height: 60,
        paddingTop: 15,
        backgroundColor: '#f7287b',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default Header;