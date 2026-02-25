import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

const Input = ({ label, value, onChangeText, placeholder, secureTextEntry }) => {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                secureTextEntry={secureTextEntry}
                autoCapitalize="none"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
});

export default Input;