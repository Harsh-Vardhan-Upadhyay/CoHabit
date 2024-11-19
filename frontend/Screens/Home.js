import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { collection, getDocs, doc, setDoc, getDoc, query, where } from "firebase/firestore";
import { db } from "../Firebase";
import { useUser } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allSwiped, setAllSwiped] = useState(false);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const { user } = useUser();
  const loggedInUserId = user?.id;
  const navigation = useNavigation();
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);

        // Fetch all swiped user IDs for the current user
        const swipedSnapshot = await getDocs(
          collection(db, `users/${loggedInUserId}/swipedUsers`)
        );
        const swipedUserIds = swipedSnapshot.docs.map((doc) => doc.id);

        // Fetch all users and filter out the swiped users
        const snapshot = await getDocs(collection(db, "users"));
        const allUsers = snapshot.docs
          .filter((doc) => doc.id !== loggedInUserId && !swipedUserIds.includes(doc.id))
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

    try {
      // Add to "likes" collection
      await setDoc(doc(db, "likes", `${loggedInUserId}_${likedUser.id}`), {
        from: loggedInUserId,
        to: likedUser.id,
      });

      // Add to "swipedUsers" collection
      await setDoc(doc(db, `users/${loggedInUserId}/swipedUsers`, likedUser.id), {
        swipedAt: new Date(),
      });

      // Check if there's a match
      const matchDoc = await getDoc(
        doc(db, "likes", `${likedUser.id}_${loggedInUserId}`)
      );
      

      if (matchDoc.exists()) {
        const userDoc = await getDoc(doc(db, "users", loggedInUserId));
        const userData = userDoc.exists() ? userDoc.data() : null;
  
        if (!userData || !userData.profilePicture) {
          console.error("Profile picture not found for the logged-in user.");
          throw new Error("Profile picture missing for logged-in user.");
        };
        const matchData = {
          id: likedUser.id,
          name: likedUser.firstName,
          profilePicture: likedUser.profilePicture, // Ensure likedUser has a valid profile picture
        };
        // Save match data for logged-in user
        await setDoc(doc(db, `users/${loggedInUserId}/matches`, likedUser.id), {
          ...matchData,
          matchedAt: new Date(),
        });
  
        // Save match data for the liked user
        await setDoc(doc(db, `users/${likedUser.id}/matches`, loggedInUserId), {
          id: loggedInUserId,
          name: user?.firstName || "You",
          profilePicture: userData.profilePicture, //fix this 






//_____________________________fix this





          matchedAt: new Date(),
        });
  
        // Display match popup
         setMatches((prevMatches) => [...prevMatches, likedUser]);
      setCurrentMatch(likedUser);
      setShowMatchPopup(true);
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleSwipeLeft = async (cardIndex) => {
    const dislikedUser = users[cardIndex];

    try {
      // Add to "swipedUsers" collection
      await setDoc(doc(db, `users/${loggedInUserId}/swipedUsers`, dislikedUser.id), {
        swipedAt: new Date(),
      });

      console.log("Disliked:", dislikedUser);
    } catch (error) {
      console.error("Error handling dislike:", error);
    }
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

  const closeMatchPopup = () => {
    setShowMatchPopup(false);
    setCurrentMatch(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.profileButton}
        >
          <Image
            source={require("../assets/images/ppf.png")}
            style={styles.profileImageButton}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Chat", { matches })}
          style={styles.chatButton}
        >
          <Image
            source={require("../assets/images/message.png")}
            style={styles.chatIcon}
          />
        </TouchableOpacity>
      </View>

      {users.length === 0 ? (
        <View style={styles.noMoreUsersContainer}>
          <Text style={styles.noMoreUsersText}>No more users to show.</Text>
        </View>
      ) : (
        
        <View style={styles.swiperContainer}>
         <Swiper
  ref={(swiper) => (swiperRef.current = swiper)}
  cards={users}
  renderCard={(user) => {
    // Add a null-check to ensure `user` is valid
    if (!user) {
      return <View style={styles.emptyCard}><Text>No more users to show.</Text></View>;
    }

    // Ensure `user.profilePicture` exists before rendering
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => navigation.navigate("Model", { user })}
        style={styles.card}
      >
        <Image
          source={{ uri: user.profilePicture || "https://via.placeholder.com/150" }}
          style={styles.profileImage}
        />
        <Text style={styles.nameText}>
          {user.firstName || "Name Unknown"}, {user.age || "Age Unknown"}
        </Text>
        <Text style={styles.bioText}>{user.introduction || "No introduction provided."}</Text>
        <Text style={styles.bioText1}>{user.occupation || "Occupation not listed."}</Text>
        <Text style={styles.bioText1}>{user.languages || "Languages not specified."}</Text>
      </TouchableOpacity>
    );
  }}
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

      {users.length !== 0 && (
        <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={handleRejectButton}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeButton} onPress={handleLikeButton}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
      </View>
 )}
      {showMatchPopup && currentMatch && (
        <Modal
          visible={showMatchPopup}
          transparent={true}
          animationType="fade"
          onRequestClose={closeMatchPopup}
        >
          <View style={styles.popupContainer}>
            <View style={styles.popupContent}>
              <Text style={styles.popupTitle}>It's a Match!</Text>
              <Image
                source={{ uri: currentMatch.profilePicture }}
                style={styles.popupImage}
              />
              <Text style={styles.popupText}>
                You and {currentMatch.firstName} liked each other!
              </Text>
              <TouchableOpacity
                onPress={closeMatchPopup}
                style={styles.closePopupButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,

  },
  logo: {
    width: 120,
    height: 30,
  },
  chatButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  popupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popupContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  popupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  popupText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  closePopupButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  chatIcon: {
    width: 30,
    height: 30,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginRight: 50,
  },
  profileImageButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
  },
  chatButton: {
    width: 40,
    height: 40,
    position: "absolute", // Ensure absolute positioning
    top: 20, // Distance from the top of the screen
    right: 20, // Distance from the right edge of the screen
    borderRadius: 20, // Circular button
    zIndex: 2, // Ensure it's on top of other elements
  },
  swiperContainer: {
    height: "100%",
    width: "100%",
    zIndex: 1, // Ensure swiper is below the buttons
    alignItems: "center",
    justifyContent: "center",

    
  },
  swipeCard:{
    marginTop:-40,
    alignItems: "center",

  },
  card: {
    width: "95%",
    height: "78%",
    borderRadius: 24,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    alignItems: "center",
    padding: 20,
  },
  profileImage: {
    width: "105%",
    height: "60%",
    borderRadius: 10,
  },
  nameText: {
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 15,
    alignSelf: "center",
    textAlign: "left",
    alignSelf: "flex-start",
  },
  bioText: {
    fontSize: 12,
    color: "#6C6C6C",
    textAlign: "start",
    textAlign: "left",
    alignSelf: "flex-start",
    fontWeight: "bold",
    marginTop: 10,
  },
  bioText1: {
    fontSize: 12,
    color: "#0075E0",
    textAlign: "left", // Ensure text alignment is left
    fontWeight: "bold",
    marginTop: 12,
    alignSelf: "flex-start", // Align the text to the start of the container
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
    backgroundColor: "#3A3A3A",
    borderRadius: 14,
    padding: 10,
    marginTop: 10,
    width: 163, // Ensures full width
    height: 52, // Fixed height for buttons
    alignItems: "center",
    justifyContent: "center",
  },
  likeButton: {
    backgroundColor: "#3A3A3A",
    borderRadius: 14,
    padding: 10,
    marginTop: 10,
    width: 163, // Ensures full width
    height: 52, // Fixed height for buttons
    alignItems: "center",
    justifyContent: "center",
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
  },modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background
  },
  dimmedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  zoomedContainer: {
    width: "90%", // Matches the card container width
    height: "75%", // Matches the card container height
    backgroundColor: "#fff", // Modal background
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 10, // Shadow for better visibility
  },
  zoomedContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  zoomedImage: {
    width: "100%",
    height: 200, // Adjust as needed
    borderRadius: 10,
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: "center",
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  
  
});

export default HomeScreen;
