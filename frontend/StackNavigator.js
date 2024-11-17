import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./Firebase"; // Your Firebase configuration file
import Signup from "./Screens/Signup";
import Details from "./Screens/Details";
import ProfilePicture from "./Screens/ProfilePicture";
import MapScreen from "./Screens/MapScreen";
import DetailedProfile from "./Screens/DetailedProfile";
import Home from "./Screens/Home";
import Chat from "./Screens/Chat";
import Profile from "./Screens/Profile";
import Model from "./Screens/Model";

const Stack = createStackNavigator();

const StackNavigator = () => {
  const { user } = useUser();
  const [initialScreen, setInitialScreen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileStatus = async () => {
      if (!user || !user.id) {
        setInitialScreen("Signup");
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.id));
        if (userDoc.exists()) {
          const profileData = userDoc.data().profileCompleted || {};
          const detailsCompleted = profileData.detailsCompleted || false;
          const detailedProfileCompleted = profileData.detailedProfileCompleted || false;

          if (!detailsCompleted) {
            setInitialScreen("Details");
          } else if (!detailedProfileCompleted) {
            setInitialScreen("DetailedProfile");
          } else {
            setInitialScreen("HomeScreen");
          }
        } else {
          setInitialScreen("Signup");
        }
      } catch (error) {
        console.error("Error fetching profile status:", error);
        setInitialScreen("Signup");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStatus();
  }, [user]);

  if (loading) return null; // Replace with a loading indicator

  return (
    <>
      <SignedIn>
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialScreen}>
    <Stack.Screen name="Details" component={Details} />
    <Stack.Screen name="MapScreen" component={MapScreen} />
    <Stack.Screen name="Home" component={ProfilePicture} />
    <Stack.Screen name="DetailedProfile" component={DetailedProfile} />
    <Stack.Screen name="HomeScreen" component={Home} />
    <Stack.Screen name="Chat" component={Chat} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen
      name="Model"
      component={Model}
      initialParams={{ userData: user }} // Pass user data as initial params
      options={{
        presentation: "modal", // Makes this screen a modal
      }}
    />
  </Stack.Navigator>
</SignedIn>

      <SignedOut>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Signup" component={Signup} />
        </Stack.Navigator>
      </SignedOut>
    </>
  );
};

export default StackNavigator;
