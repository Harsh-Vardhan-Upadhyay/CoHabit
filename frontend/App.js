import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import StackNavigator from "./StackNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { ClerkProvider, ClerkLoaded ,SignedIn, SignedOut, useUser} from '@clerk/clerk-expo'



export default function App() {
  return (
    <NavigationContainer>
     <ClerkProvider publishableKey={"pk_test_bGVnYWwtcG9ycG9pc2UtMC5jbGVyay5hY2NvdW50cy5kZXYk"}>
     
       <StackNavigator />
      </ClerkProvider>
    </NavigationContainer>
  );
}