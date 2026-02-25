import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { getEvaluations } from '../../api/endpoints';

const EvaluationScreen = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvaluations = async () => {
            try {
                const response = await getEvaluations();
                setEvaluations(response.data);
            } catch (error) {
                console.error('Error fetching evaluations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvaluations();
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Evaluations</Text>
            <FlatList
                data={evaluations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.evaluationCard}>
                        <Text>{item.title}</Text>
                        <Text>{item.description}</Text>
                        <Button title="View Details" onPress={() => {/* Navigate to details */}} />
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
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    evaluationCard: {
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
});

export default EvaluationScreen;