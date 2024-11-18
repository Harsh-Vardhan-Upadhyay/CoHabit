import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Firebase";
import { useUser } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";

const ChatScreen = () => {
  const [matches, setMatches] = useState([]);
  const { user } = useUser();
  const loggedInUserId = user?.id;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, `users/${loggedInUserId}/matches`)
        );
        const fetchedMatches = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMatches(fetchedMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    fetchMatches();
  }, []);

  const navigateToMessages = (match) => {
    navigation.navigate("Messages", { match });
  };

  return (
    <View style={styles.container}>
      {matches.length === 0 ? (
        <Text style={styles.noMatchesText}>No matches yet!</Text>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.matchContainer}
              onPress={() => navigateToMessages(item)}
            >
              <Image
                source={{ uri: item.profilePicture || "https://via.placeholder.com/150" }}
                style={styles.matchImage}
              />
              <Text style={styles.matchName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  noMatchesText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 50,
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  matchImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  matchName: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChatScreen;
