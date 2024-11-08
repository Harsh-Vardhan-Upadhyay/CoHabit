import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Signup from "./Screens/Signup";
import Details from "./Screens/Details";
import Home from "./Screens/Home";
import map from './Screens/map';
import { SignedIn, SignedOut } from "@clerk/clerk-expo";

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <>
      <SignedIn>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Details" component={Details} />
          <Stack.Screen name="map" component={map} />
          <Stack.Screen name="Home" component={Home} />
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