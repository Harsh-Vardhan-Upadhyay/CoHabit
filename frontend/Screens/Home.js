import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator, Modal, TouchableOpacity } from "react-native";
import Swiper from "react-native-deck-swiper";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { useUser } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
const HomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allSwiped, setAllSwiped] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const { user } = useUser();
  const loggedInUserId = user?.id;
  const navigation = useNavigation();
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const snapshot = await getDocs(collection(db, "users"));
        const allUsers = snapshot.docs
          .filter((doc) => doc.id !== loggedInUserId)
          .map((doc) => ({ id: doc.id, ...doc.data() }));

        setUsers(allUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSwipeRight = async (cardIndex) => {
    const likedUser = users[cardIndex];
    console.log("Liked:", likedUser);

    try {
      await setDoc(doc(db, "likes", `${loggedInUserId}_${likedUser.id}`), {
        from: loggedInUserId,
        to: likedUser.id,
      });

      const matchDoc = await getDoc(doc(db, "likes", `${likedUser.id}_${loggedInUserId}`));
      if (matchDoc.exists()) {
        setMatchFound(true);
        setMatches((prevMatches) => [...prevMatches, likedUser]);
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleSwipeLeft = (cardIndex) => {
    console.log("Disliked:", users[cardIndex]);
  };

  const handleSwipedAll = () => {
    setAllSwiped(true);
  };

  const handleLikeButton = () => {
    if (swiperRef.current) {
      swiperRef.current.swipeRight();
    }
  };

  const handleRejectButton = () => {
    if (swiperRef.current) {
      swiperRef.current.swipeLeft();
    }
  };

  const renderCard = (user) => (
    <View style={styles.card}>
      <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
      <Text style={styles.nameText}>{user.firstName}, {user.age}</Text>
      <Text style={styles.bioText}>{user.introduction}</Text>
      <Text style={styles.bioText}>{user.occupation}</Text>
      <Text style={styles.bioText}>{user.languages}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Chat", { matches })}>
        <Image
          source={{ uri: "/Users/harshvardhanupadhyay/CoHabit/frontend/assets/favicon.png" }}
          style={styles.chatButton}
        />
      </TouchableOpacity>

      {allSwiped ? (
        <Text style={styles.noMoreUsersText}>No more users available.</Text>
      ) : (
        <View style={styles.swiperContainer}>
          <Swiper
            ref={(swiper) => (swiperRef.current = swiper)}
            cards={users}
            renderCard={renderCard}
            onSwipedRight={handleSwipeRight}
            onSwipedLeft={handleSwipeLeft}
            onSwipedAll={handleSwipedAll}
            stackSize={3}
            cardStyle={styles.swipeCard}
            backgroundColor="transparent"
            cardIndex={0}
            infinite={false}
            verticalSwipe={false}
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.rejectButton} onPress={handleRejectButton}>
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeButton} onPress={handleLikeButton}>
          <Text style={styles.buttonText}>Like</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        animationType="slide"
        visible={matchFound}
        onRequestClose={() => setMatchFound(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.matchText}>It's a Match!</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setMatchFound(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  chatButton: {
    width: 50,
    height: 50,
    margin: 10,
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2, // Ensure chat button is above the swiper
  },
  swiperContainer: {
    height: "70%",
    marginTop: 50,
    width: "100%",
    zIndex: 1, // Ensure swiper is below the buttons
  },
  card: {
    width: 300,
    height: 400,
    borderRadius: 20,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    alignItems: "center",
    padding: 20,
  },
  profileImage: {
    width: "100%",
    height: "70%",
    borderRadius: 10,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  bioText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  swipeCard: {
    marginTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noMoreUsersText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
    zIndex: 2, // Ensure buttons are above the swiper
  },
  rejectButton: {
    backgroundColor: "#FF6347",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  likeButton: {
    backgroundColor: "#32CD32",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  matchText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#e91e63",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#e91e63",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default HomeScreen;
