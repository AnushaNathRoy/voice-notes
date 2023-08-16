import React, { useEffect, useLayoutEffect } from "react";
import { BackHandler } from "react-native";
import { View, TouchableOpacity, Text,Image } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import LottieView from "lottie-react-native";
import AppLoading from "expo-app-loading";
import { useFonts } from "expo-font";

import {
  Container,
  AddButton,
  AddButtonImage,
  NotesList,
  NoNotes,
  NoNotesImage,
  NoNotesText,
} from "./styles";

import NoteItem from "../../components/NoteItem";

export default () => {
  const navigation = useNavigation();
  const list = useSelector((state) => state.notes.list);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Your Notes",
      headerLeft: false,
      headerRight: () => (
        <View style={{ flexDirection: "row", marginRight: 20 }}>
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => navigation.navigate("EditNote")}
        >
          <Image source={require("../../assets/more.png")}
style={{width:24,height:24}} 
           />
          {/* <Text style={{ color: "blue" }}>Edit Note</Text> */}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("ASR")} 
        >
          <Text style={{ color: "blue", fontSize:20,fontWeight:"bold" }}>ASR</Text>
        </TouchableOpacity>
      </View>


        // <AddButton
        //   underlayColor="transparent"
        //   onPress={() => navigation.navigate("EditNote")}
        // >
        //   <AddButtonImage source={require("../../assets/more.png")} />
        // </AddButton>
      ),
    });
  }, []);

  const handleNotePress = (index) => {
    navigation.navigate("EditNote", {
      key: index,
    });
  };

  let [fontsLoaded, error] = useFonts({
    "WorkSans-SemiBold": require("../../../assets/fonts/WorkSans/WorkSans-SemiBold.ttf"),
    "WorkSans-Regular": require("../../../assets/fonts/WorkSans/WorkSans-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <Container>
      {list.length > 0 && (
        <NotesList
          data={list}
          renderItem={({ item, index }) => (
            <NoteItem data={item} index={index} onPress={handleNotePress} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
      {list.length === 0 && (
        <NoNotes>
          <NoNotesText style={{ fontFamily: "WorkSans-SemiBold" }}>
            add new notes by clicking + button 
          </NoNotesText>
        </NoNotes>
      )}
    </Container>
  );
};
