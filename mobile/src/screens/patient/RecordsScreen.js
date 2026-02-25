import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getPatientRecords } from '../../api/endpoints';

const RecordsScreen = () => {
    const { user } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await getPatientRecords(user.id);
                setRecords(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, [user.id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text>Error: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={records}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.record}>
                        <Text style={styles.recordText}>Date: {item.date}</Text>
                        <Text style={styles.recordText}>Details: {item.details}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    record: {
        padding: 16,
        marginVertical: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    recordText: {
        fontSize: 16,
    },
});

export default RecordsScreen;