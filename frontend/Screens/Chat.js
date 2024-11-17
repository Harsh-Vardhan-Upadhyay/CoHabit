import React from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";

const Chat = ({ route }) => {
  const { matches } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>
      {matches.length > 0 ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.matchItem}>
              <Image source={{ uri: item.profilePicture }} style={styles.profileImage} />
              <Text style={styles.nameText}>{item.firstName}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noMatchesText}>No matches yet!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  matchItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  nameText: {
    fontSize: 18,
  },
  noMatchesText: {
    fontSize: 16,
    color: "#555",
  },
});

export default Chat;
