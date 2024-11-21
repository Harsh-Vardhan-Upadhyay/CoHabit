import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { collection, query, onSnapshot, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../Firebase";
import { useUser } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from 'expo-notifications';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const ChatScreen = () => {
  const [matches, setMatches] = useState([]);
  const { user } = useUser();
  const loggedInUserId = user?.id;
  const navigation = useNavigation();
  const [messageListeners, setMessageListeners] = useState({});

  // Request notification permissions on component mount
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          Alert.alert('Notification Permissions', 'Please enable notifications in your device settings.');
          return false;
        }
        return true;
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
      }
    };

    requestNotificationPermissions();
  }, []);

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

          const unsubscribeMessages = onSnapshot(messagesQuery, async (msgSnapshot) => {
            const lastMessage = msgSnapshot.docs[0]?.data();
            const unreadMessages = msgSnapshot.docs.filter(
              (doc) =>
                !doc.data().read && doc.data().senderId !== loggedInUserId
            ).length;

            // Send local notification for new unread messages
            if (unreadMessages > 0 && lastMessage?.senderId !== loggedInUserId) {
              await schedulePushNotification(
                match.name, 
                lastMessage?.text || "New message", 
                unreadMessages
              );
            }

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

  // Function to schedule push notification
  const schedulePushNotification = async (senderName, messageText, unreadCount) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `New message from ${senderName}`,
          body: messageText,
          data: { unreadCount },
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const navigateToMessages = (match) => {
    const chatId =
      loggedInUserId < match.id
        ? `${loggedInUserId}_${match.id}`
        : `${match.id}_${loggedInUserId}`;
    navigation.navigate("Messages", { match, chatId  });
  };

  const handleUnmatch = async (match) => {
    try {
      Alert.alert(
        "Unmatch",
        `Are you sure you want to unmatch with ${match.name}?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Unmatch",
            style: "destructive",
            onPress: async () => {
              const matchDocRef = doc(db, `users/${loggedInUserId}/matches/${match.id}`);
              
              await deleteDoc(matchDocRef);

              const reciprocalMatchDocRef = doc(db, `users/${match.id}/matches/${loggedInUserId}`);
              await deleteDoc(reciprocalMatchDocRef);
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error unmatching:", error);
      Alert.alert("Error", "Could not unmatch at this time.");
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo.png")}
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
              onLongPress={() => handleUnmatch(item)} // Add long press handler
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