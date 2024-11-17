import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
} from "react-native";

const Chat = ({ route }) => {
  const { matches } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />

      </View>

      {/* Matches List */}
      {matches.length > 0 ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.matchItem}>
              <Image
                source={{ uri: item.profilePicture }}
                style={styles.profileImage}
              />
              <View style={styles.textContainer}>
                <Text style={styles.nameText}>{item.firstName}</Text>
                <Text style={styles.messageText}>{item.lastMessage}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noMatchesText}>No matches yet!</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  logo: {
    width: 120,
    height:40,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  matchItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  messageText: {
    fontSize: 14,
    color: "#6C6C6C",
    marginTop: 4,
  },
  noMatchesText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#aaa",
  },
});

export default Chat;