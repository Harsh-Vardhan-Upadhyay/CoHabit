import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../Firebase";
import { useUser } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";

const ChatScreen = () => {
  const [matches, setMatches] = useState([]);
  const { user } = useUser();
  const loggedInUserId = user?.id;
  const navigation = useNavigation();
  const [messageListeners, setMessageListeners] = useState({});

  useEffect(() => {
    const matchesRef = collection(db, `users/${loggedInUserId}/matches`);
    const unsubscribeMatches = onSnapshot(matchesRef, async (snapshot) => {
      const fetchedMatches = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      fetchedMatches.forEach((match) => {
        const chatId =
          loggedInUserId < match.id
            ? `${loggedInUserId}_${match.id}`
            : `${match.id}_${loggedInUserId}`;

        if (!messageListeners[chatId]) {
          const messagesRef = collection(db, `chats/${chatId}/messages`);
          const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"));

          const unsubscribeMessages = onSnapshot(messagesQuery, (msgSnapshot) => {
            const lastMessage = msgSnapshot.docs[0]?.data();
            const unreadMessages = msgSnapshot.docs.filter(
              (doc) =>
                !doc.data().read && doc.data().senderId !== loggedInUserId
            ).length;

            setMatches((prevMatches) =>
              prevMatches.map((m) =>
                m.id === match.id
                  ? {
                      ...m,
                      lastMessage: lastMessage?.text || "Start the conversation!",
                      unreadMessages,
                    }
                  : m
              )
            );
          });

          setMessageListeners((prevListeners) => ({
            ...prevListeners,
            [chatId]: unsubscribeMessages,
          }));
        }
      });

      setMatches(fetchedMatches);
    });

    return () => {
      unsubscribeMatches();
      Object.values(messageListeners).forEach((unsubscribe) => unsubscribe());
    };
  }, [loggedInUserId]);

  const navigateToMessages = (match) => {
    const chatId =
      loggedInUserId < match.id
        ? `${loggedInUserId}_${match.id}`
        : `${match.id}_${loggedInUserId}`;
    navigation.navigate("Messages", { match, chatId  });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo.png")} // Make sure to add your logo image
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
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
              <View style={styles.matchDetails}>
                <Text style={styles.matchName}>{item.name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>
              {item.unreadMessages > 0 && (
                <View style={styles.unreadContainer}>
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadMessages}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
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
    paddingHorizontal: 20,
    paddingVertical: 10,

    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "start",
    justifyContent: "center",
  },
  logoImage: {
    height: 40,
    width: 120, // Adjust these dimensions based on your logo's aspect ratio
  },
  noMatchesText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  matchImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 12,
  },
  matchDetails: {
    flex: 1,
    marginRight: 8,
  },
  matchName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#A0A9B4",
  },
  unreadContainer: {
    minWidth: 24,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  unreadBadge: {
    backgroundColor: "#007AFF", // Pink color to match the theme
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default ChatScreen;