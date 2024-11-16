import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Signup from "./Screens/Signup";
import Details from "./Screens/Details";
import Home from "./Screens/ProfilePicture"; // Ensure proper naming convention for files
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import MapScreen from "./Screens/MapScreen";

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <>
      <SignedIn>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* When logged in, start with Details */}
          <Stack.Screen name="Details" component={Details} />
          <Stack.Screen name="MapScreen" component={MapScreen} />
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </SignedIn>
      <SignedOut>
        {/* When not logged in, show Signup */}
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Signup" component={Signup} />
        </Stack.Navigator>
      </SignedOut>
    </>
  );
};

export default StackNavigator;