import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ui } from "../../theme/ui";

export default function FacultyCasesScreen() {
  const items = [
    { id: "1", name: "Case 1" },
    { id: "2", name: "Case 2" },
    { id: "3", name: "Case 3" },
    { id: "4", name: "Case 4" },
    { id: "5", name: "Case 5" },
  ];

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <FlatList
        data={items}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={(item) => <Text>{item.name}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ui.colors.bg,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: ui.colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: ui.colors.card,
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    padding: 14,
    marginBottom: 10,
    ...ui.cardShadow,
  },
});
