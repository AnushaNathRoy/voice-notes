import React, { useState, useEffect, useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation } from "@react-navigation/native";
import { Alert,Text,Button,View,TouchableOpacity } from "react-native";
import {
  Container,
  TitleInput,
  BodyInput,
  SaveButton,
  SaveButtonImage,
  CloseButton,
  CloseButtonImage,
  Box,
  container,
  button1,
  recordingStatusText,
  ButtonsContainer,
  DeleteButton,
  DeleteButtonText,
  SuccessButton,
  SuccessButtonText,
  NoSuccessButton,
  NoSuccessButtonText,
} from "./styles";
import ASR from "../ASR"; 
export default () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const list = useSelector((state) => state.notes.list);
  
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState("new");
  const asr= new ASR();
  // const recordAudio= async()=>{
  //   await asr.recordAudio();
  // };
  useEffect(() => {
    if (route.params?.key !== undefined && list[route.params.key]) {
      setStatus("edit");
      setTitle(list[route.params.key].title);
      setBody(list[route.params.key].body);
      setDone(list[route.params.key].done);
    }
  }, []);

  
  useLayoutEffect(() => {
    navigation.setOptions({
      title: status === "new" ? "Add New" : "Edit Notes",
      headerLeft: () => (
        <CloseButton underlayColor="transparent" onPress={handleCloseButton}>
          <CloseButtonImage source={require("../../assets/close.png")} />
        </CloseButton>
      ),
      headerRight: () => (
        <Container>
          <SaveButton underlayColor="transparent" onPress={handleSaveButton}>
            <SaveButtonImage source={require("../../assets/save.png")} />
          </SaveButton>

          <SaveButton underlayColor="transparent" onPress={handleDeleteNote}>
            <SaveButtonImage source={require("../../assets/del.png")} />
          </SaveButton>
        </Container>
      ),
    });
  }, [status, title, body]);

  
  
  const setBodyRichText = (text) => {
    // Check for formatting patterns like notion /h1 /b /i /s /c /quote /code /link /divider /numbered list /bulleted list /toggle list
    const boldRegex = /\*([^\*]+)\*/g;
    const italicRegex = /_([^_]+)_/g;
    const strikeRegex = /~([^~]+)~/g;
    const codeRegex = /`([^`]+)`/g;

    // Replace with formatting components
    const formattedText = text
      .replace(boldRegex, "<b>$1</b>")
      .replace(italicRegex, "<i>$1</i>")
      .replace(strikeRegex, "<s>$1</s>")
      .replace(codeRegex, "<code>$1</code>");

    setBody(formattedText);
  };

  const handleSaveButton = () => {
    if (title !== "" && body !== "") {
      if (status === "edit") {
        dispatch({
          type: "EDIT_NOTE",
          payload: {
            key: route.params.key,
            title,
            body,
            done,
          },
        });
      } else {
        dispatch({
          type: "ADD_NOTE",
          payload: { title, body },
        });
      }

      navigation.navigate("List");
    } else {
      alert("Sorry :( \n\nTitle and body are required!");
    }
  };

  const handleCloseButton = () => navigation.navigate("List");

  const handleDeleteNote = () => {
    Alert.alert(
      "Confirmation",
      "Are you sure you want to delete?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            dispatch({
              type: "DELETE_NOTE",
              payload: {
                key: route.params.key,
              },
            });
            navigation.navigate("List");
          },
        },
      ],
      { cancelable: false }
    );
  };
  const handleRecordButtonPress = async () => {
      await ASR.handleRecordButtonPress();
    
  };
 
  

  return (
    <Container>
      <TitleInput
        value={title}
        onChangeText={(t) => setTitle(t)}
        placeholder="Title | ex: Lecture Notes 📚"
        placeholderTextColor="#ccc"
        autoFocus={true}
        style={{ fontFamily: "WorkSans-SemiBold" }}
      />

      <BodyInput
        value={body}
        onChangeText={(t) => setBodyRichText(t)}
        placeholder="Note | ex: Today I learned ...."
        placeholderTextColor="#ccc"
        multiline={true}
        textAlignVertical="top"
        style={{ fontFamily: "WorkSans-Regular" }}
      />

    
      {status === "edit" && (
        <ButtonsContainer>
          <DeleteButton underlayColor="#FF0000">
            <DeleteButtonText style={{ fontFamily: "WorkSans-Regular" }}>
             Audio
            </DeleteButtonText>
          </DeleteButton>
        </ButtonsContainer>
      )}
    </Container>
  );
};
