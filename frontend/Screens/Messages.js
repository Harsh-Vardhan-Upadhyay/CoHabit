import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc , getDoc} from "firebase/firestore";
import { db } from "../Firebase";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

const Messages = ({ route, navigation }) => {
  const { match, chatId } = route.params;
  const { user } = useUser();
  const loggedInUserId = user?.id;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [matchDetails, setMatchDetails] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const matchDoc = await getDoc(doc(db, "users", match.id));
        if (matchDoc.exists()) {
          setMatchDetails({
            id: match.id,
            ...matchDoc.data()
          });
        }
      } catch (error) {
        console.error("Error fetching match details:", error);
      }
    };

    fetchMatchDetails();
  }, [match.id]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          style={styles.headerContainer}
          onPress={() => {
            // Navigate to Model screen with complete match details
            navigation.navigate("Model", { 
              user: matchDetails || {
                id: match.id,
                firstName: match.name,
                profilePicture: match.profilePicture
              }
            });
          }}
        >
          <Image
            source={{
              uri: match.profilePicture || "https://via.placeholder.com/150",
            }}
            style={styles.headerProfileImage}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{match.name}</Text>
          </View>
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: '#F1F1F2',
        height: 110,
      },
      headerShadowVisible: false,
      headerTitleAlign: 'left',
    });
  }, [navigation, match.name, match.profilePicture, matchDetails]);
  

  useEffect(() => {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
      
      snapshot.docs.forEach(async (doc) => {
        if (doc.data().senderId !== loggedInUserId && !doc.data().read) {
          await updateDoc(doc.ref, { read: true });
        }
      });
    });
    return unsubscribe;
  }, [chatId]);

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;
    
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    await addDoc(messagesRef, {
      senderId: loggedInUserId,
      text: newMessage,
      timestamp: new Date(),
      read: false,
    });
    
    setNewMessage("");
    flatListRef.current?.scrollToEnd();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const renderMessage = ({ item, index }) => {
    const isCurrentUser = item.senderId === loggedInUserId;
    const showTimestamp = index === 0 || 
      (messages[index - 1] && 
       messages[index - 1].senderId !== item.senderId);

    return (
      <View style={[
        styles.messageWrapper,
        isCurrentUser ? styles.sentMessageWrapper : styles.receivedMessageWrapper
      ]}>
        <View style={[
          styles.messageContainer,
          isCurrentUser ? styles.sentMessage : styles.receivedMessage,
        ]}>
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.sentMessageText : styles.receivedMessageText
          ]}>
            {item.text}
          </Text>
        </View>
        {showTimestamp && (
          <Text style={styles.timestamp}>
            {formatTime(item.timestamp)}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Message"
              placeholderTextColor="#8e8e93"
              multiline
              maxHeight={100}

              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Ionicons 
                name="arrow-up-circle"
                size={32} 
                color={newMessage.trim() ? "#007AFF" : "#C7C7CC"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Center the content horizontally
    width: '100%',
    paddingHorizontal: 0,
    marginLeft:-20 ,// Ensure the container spans the full width of the screen
  },
  headerProfileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  messageWrapper: {
    marginVertical: 2,
    maxWidth: '80%',
  },
  sentMessageWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  receivedMessageWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageContainer: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 2,
  },
  sentMessage: {
    backgroundColor: '#007AFF',
    marginLeft: 40,
  },
  receivedMessage: {
    backgroundColor: '#E9E9EB',
    marginRight: 40,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentMessageText: {
    color: '#FFFFFF',
  },
  receivedMessageText: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
    marginBottom: 8,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E9E9E9',
    padding: 8,
    backgroundColor: '#FFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    minHeight: 24,
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: 8,
  },
  sendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    marginBottom: -2,
  },
});

export default Messages;