import React, { useEffect, useLayoutEffect, useState } from "react";
import { BackHandler, TextInput } from "react-native";
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
  SearchBar,  
} from "./styles";

import NoteItem from "../../components/NoteItem";

export default () => {
  const navigation = useNavigation();
  const list = useSelector((state) => state.notes.list);

  const [searchText, setSearchText] = useState('');
  const filteredNotes = list.filter(note => note.title.includes(searchText));
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "My Notes",
      headerLeft: false,
      headerRight: () => (
        <AddButton
          underlayColor="transparent"
          onPress={() => navigation.navigate("EditNote")}
        >
          <AddButtonImage source={require("../../assets/more.png")} />
        </AddButton>
      ),
    });
  }, []);

  const handleNotePress = (noteItem) => {
      const noteIndex = list.findIndex(note => note === noteItem);
      navigation.navigate("EditNote", {
        key: noteIndex,
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
      <SearchBar>
        <TextInput
          style={{ flex: 1 }}
          placeholder="Search Notes...🔍"
          placeholderTextColor={"#000"}
          value={searchText}
          onChangeText={setSearchText}
        />
      </SearchBar>
      {filteredNotes.length > 0 && (
      <NotesList
        data={filteredNotes}
        renderItem={({ item }) => (
            console.log(item),
            <NoteItem data={item} onPress={() => handleNotePress(item)} index={noteIndex = list.findIndex(note => note === item)} />
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      )}
      {filteredNotes.length === 0 && (
        <NoNotes>
          <NoNotesText style={{ fontFamily: "WorkSans-SemiBold" }}>
            add new notes by clicking + button 
          </NoNotesText>
        </NoNotes>
      )}
    </Container>
  );
};
