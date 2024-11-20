import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./Firebase";
import Signup from "./Screens/Signup";
import Details from "./Screens/Details";
import ProfilePicture from "./Screens/ProfilePicture";
import MapScreen from "./Screens/MapScreen";
import DetailedProfile from "./Screens/DetailedProfile";
import Home from "./Screens/Home";
import Chat from "./Screens/Chat";
import Profile from "./Screens/Profile";
import Model from "./Screens/Model";
import Messages from "./Screens/Messages";

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

  if (loading) return null;

  return (
    <>
      <SignedIn>
        <Stack.Navigator 
          initialRouteName={initialScreen}
          screenOptions={{
            headerShown: false, // Default to false for most screens
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#000',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen name="Details" component={Details} />
          <Stack.Screen name="MapScreen" component={MapScreen} />
          <Stack.Screen name="Home" component={ProfilePicture} />
          <Stack.Screen name="DetailedProfile" component={DetailedProfile} />
          <Stack.Screen
  name="HomeScreen"
  component={Home}
  options={{
    gestureEnabled: false, // Disable swipe gestures for navigation
    headerShown: false,    // Ensure no header is displayed
  }}
/>
          <Stack.Screen 
            name="Chat" 
            component={Chat}
            options={{
              headerShown: false,

            }}
          />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen 
            name="Messages" 
            component={Messages}
            options={{
              headerShown: true, // Show header for Messages screen
              headerShadowVisible: false,
              headerBackTitleVisible: false,
              headerTitle: "", // Empty string because we're using a custom header title in the Messages component
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTintColor: '#007AFF',
            }}
          />
          <Stack.Screen
            name="Model"
            component={Model}
            initialParams={{ userData: user }}
            options={{
              presentation: "modal",
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