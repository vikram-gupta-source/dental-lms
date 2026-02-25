import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { fetchProcedureLogs } from "../../api/endpoints";

const ProcedureLogScreen = () => {
  const { user } = useContext(AuthContext);
  const [procedureLogs, setProcedureLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProcedureLogs = async () => {
      try {
        const response = await fetchProcedureLogs(user.id);
        setProcedureLogs(response.data);
      } catch (error) {
        console.error("Error fetching procedure logs:", error);
      } finally {
        setLoading(false);
      }
    };

    getProcedureLogs();
  }, [user.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Procedure Log</Text>
      <FlatList
        data={procedureLogs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text>Procedure: {item.procedureType}</Text>
            <Text>Date: {item.date}</Text>
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
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default ProcedureLogScreen;
