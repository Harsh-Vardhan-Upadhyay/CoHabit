import { StatusBar } from "expo-status-bar";
import StackNavigator from "./StackNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { ClerkProvider, ClerkLoaded ,SignedIn, SignedOut, useUser,} from '@clerk/clerk-expo'
import React, { useEffect } from 'react';


export default function App() {


  return (
    <NavigationContainer>
     {/* <ClerkProvider publishableKey={"add your clerk api key"}> */}
     
       <StackNavigator />
      </ClerkProvider>
    </NavigationContainer>
  );
}