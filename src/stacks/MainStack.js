import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Splash from "../pages/Splash";
import ListScreen from "../pages/ListScreen";
import EditNoteScreen from "../pages/EditNoteScreen";
//import ASRComponent from "../pages/ASRComponent";
import ASR from "../pages/ASR";
const MainStack = createStackNavigator();

export default () => (
  <MainStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: "#fbfbfb",
      },
      headerTintColor: "#222",
    }}
  >
    <MainStack.Screen
      name="Splash"
      component={Splash}
      options={{
        headerShown: false,
      }}
    />
    <MainStack.Screen name="List" component={ListScreen} />
    <MainStack.Screen name="EditNote" component={EditNoteScreen} />
    <MainStack.Screen name="ASR" component={ASR} />
  </MainStack.Navigator>
);
