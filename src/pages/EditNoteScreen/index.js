import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Text, View, TextInput, Button, Keyboard, ScrollView } from "react-native";
import SelectDropdown from 'react-native-select-dropdown';
import { CloseButton, SaveButton, TitleInput } from "./styles";
import { useLayoutEffect } from "react";
import { CloseButtonImage, SaveButtonImage } from "./styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { FontAwesome } from '@expo/vector-icons';
import { AndroidAudioEncoder, AndroidOutputFormat } from 'expo-av/build/Audio';


export default () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const list = useSelector((state) => state.notes.list);
  const [blocks, setBlocks] = useState([]);
  const [title, setTitle] = useState("");

  const [recording, setRecording] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [audioPermission, setAudioPermission] = useState(null);
  const [transcript, setTranscript] = useState([]);

  useEffect(() => {
    // console.log("Route params: ", route.params);
    // console.log("List: ", list);
    // console.log("Key: ", route.params?.key);    
    // console.log("List key: ", list[route.params.key]);
    if (route.params?.key !== undefined && list[route.params.key]) {
      // console.log("Blocks updated: ", list[route.params.key].blocks);
      // console.log("Title updated: ", list[route.params.key].title);
      // console.log("Key updated: ", list[route.params.key]);
      setTitle(list[route.params.key].title);
      setBlocks(list[route.params.key].blocks || []);
    }

    // Simply get recording permission upon first render
    async function getPermission() {
      await Audio.requestPermissionsAsync().then((permission) => {
        console.log('Permission Granted: ' + permission.granted);
        setAudioPermission(permission.granted)
      }).catch(error => {
        console.log(error);
      });
    }

    // Call function to get permission
    getPermission()
    // Cleanup upon first render
    return () => {
      if (recording) {
        stopRecording();
      }
    };

  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Edit Notes",
      headerLeft: () => (
        <CloseButton underlayColor="transparent" onPress={handleCloseButton}>
          <CloseButtonImage source={require("../../assets/close.png")} />
        </CloseButton>
      ),
      headerRight: () => (
        <Button onPress={Keyboard.isVisible ? Keyboard.dismiss : null} title="Done" />
      ),
    });
  }, []);

  async function startRecording() {
    try {
      // needed for IoS
      if (audioPermission) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        })
      }

      const newRecording = new Audio.Recording();
      console.log('Starting Recording')
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY = {
        android: {
          extension: '.wav',
          outputFormat: AndroidOutputFormat.DEFAULT,
          audioEncoder: AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: AndroidOutputFormat.DEFAULT,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });
      await newRecording.startAsync();
      setRecording(newRecording);
      setRecordingStatus('recording');

    } catch (error) {
      console.error('Failed to start recording', error);
    }
  }
  const getTranscript = async (audioFileUri) => {
    const apiUrl = 'https://asr.iiit.ac.in/ssmtapi/';
    const formData = new FormData();
    formData.append('uploaded_file', {
      uri: audioFileUri,
      name: 'test.wav',
      type: 'audio/wav'
    });
    formData.append('lang', 'eng');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: formData
    });

    const data = await response.json();
    const trans = data["transcript"][0]["transcript"]
    console.log(trans);
    //return trans;
    return data.transcript;
  };
  async function stopRecording(index, mode = null) {
    try {
      if (recordingStatus === 'recording') {
        console.log('Stopping Recording')
        updateBlockContent(index, "Processing....")
        await recording.stopAndUnloadAsync();
        const recordingUri = recording.getURI();
        const transcript = await getTranscript(recordingUri);
        setTranscript(transcript);
        if (mode) {
          updateBlockContent(index, transcript[0]["transcript"]);
        }
        else {
          total_transcript = transcript.map((item) => item["transcript"]).join(" ");
          words = total_transcript.split(" ");
          curr_sent = "";
          curr_type = "paragraph";
          new_blocks = [];
          for (let i = 0; i < words.length; i++) {

            if (words[i] == "block" && i + 1 < words.length) {
              new_blocks.push({
                id: blocks.length + new_blocks.length,
                type: curr_type,
                content: curr_sent,
              });
              curr_sent = "";
              curr_type = words[i + 1];
              print("curr_type", curr_type);
              i++;
              continue;
            }

            curr_sent += words[i] + " ";

            if (i == words.length - 1) {
              new_blocks.push({
                id: blocks.length + new_blocks.length,
                type: curr_type,
                content: curr_sent,
              });
            }
          }

          setBlocks([
            ...blocks[0, index - 1],
            ...new_blocks,
          ]);
        }

        console.log('Recording', recordingUri);
        const extension = recordingUri.split(".").pop();
        console.log('Extension', extension);
        // Create a file name for the recording
        const fileName = `recording-${Date.now()}.wav`;
        console.log('File Name', fileName);

        // Move the recording to the new directory with the new file name
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/', { intermediates: true });
        await FileSystem.moveAsync({
          from: recordingUri,
          to: FileSystem.documentDirectory + 'recordings/' + `${fileName}`
        });

        // This is for simply playing the sound back
        const playbackObject = new Audio.Sound();
        await playbackObject.loadAsync({ uri: FileSystem.documentDirectory + 'recordings/' + `${fileName}` });
        await playbackObject.playAsync();

        // resert our states to record again
        setRecording(null);
        setRecordingStatus('stopped');
        return transcript;
      }

    } catch (error) {
      console.error('Failed to stop recording', error);
      return null;
    }
  }

  async function handleRecordButtonPress(index, mode = null) {
    if (recording) {
      const audioUri = await stopRecording(index, mode);
      console.log(audioUri);
    } else {
      await startRecording();
      updateBlockContent(index, "Recording....")
    }
  }

  const handleCloseButton = () => {
    if (recording) {
      stopRecording();
    }
    navigation.goBack();
  };

  const updateBlockType = (id, newType) => {
    // Implement this function to update block type
    blocks[id].type = newType;
    setBlocks([...blocks]);
  };

  const updateBlockContent = (id, newContent) => {
    // Implement this function to update block content
    console.log("Updating block content...");
    console.log(blocks);
    console.log(id);
    console.log(newContent);

    blocks[id].content = newContent;
    setBlocks([...blocks]);

  };

  const removeBlock = (id) => {
    blocks.splice(id, 1);
    setBlocks([...blocks]);

  };

  const handleRecordNew = () => {
    console.log("Recording new block...");
    handleAddBlock();
    handleRecordButtonPress(blocks.length, "record_new");
  };

  const handleAddBlock = () => {
    setBlocks([
      ...blocks,
      {
        id: blocks.length,
        type: "paragraph",
        content: "",
      },
    ]);

  };

  const handleSave = () => {
    console.log("Saving note...");
    console.log("Blocks: ", blocks);
    console.log("Title: ", title);
    if (title !== "" && blocks.length > 0) {


      if (route.params?.key !== undefined && list[route.params.key]) {
        // Dispatch the editNote action
        dispatch({
          type: "EDIT_NOTE",
          payload: {
            key: route.params.key,
            title,
            blocks,
          },
        });

      } else {
        // Dispatch the addNote action
        dispatch({
          type: "ADD_NOTE",
          payload: {
            title,
            blocks,
          },
        });
      }
      navigation.goBack();
    }
  };
  return (
    <ScrollView>
      <View>
        <TitleInput
          placeholder="Title | ex: Lecture Notes 📚"
          placeholderTextColor="#ccc"
          style={{ fontFamily: "WorkSans-SemiBold" }}
          value={title}
          onChangeText={(t) => setTitle(t)}
          autoFocus={true}
        />

        {blocks.map((block, index) => (


          <View key={index} style={{ marginBottom: 10, borderStyle: 'solid', borderWidth: 1, borderColor: 'black', padding: 10, margin: 5 }}>


            {block.type === "heading" ? (
              <TextInput
                style={{ fontWeight: "bold", fontSize: 18 }}
                onChangeText={(t) => updateBlockContent(index, t)}
                multiline={true}
                placeholder="Type the content of your block"
              >
                {block.content}
              </TextInput>
            ) : block.type === "list" ? (
              <View>
                {block.content.split('\n').map((item, itemIndex) => (
                  <View key={itemIndex} style={{ flexDirection: "row" }}>
                    <Text style={{ marginRight: 10 }}>•</Text>
                    <TextInput
                      onChangeText={(t) => {
                        const newContent = block.content.split('\n');
                        newContent[itemIndex] = t;
                        updateBlockContent(index, newContent.join('\n'));
                      }}
                      placeholder="Enter list item"
                      placeholderTextColor="#CCC"
                      multiline={true}
                      value={item}
                    />
                  </View>
                ))}
              </View>
            ) : block.type === "heading2" ? (
              <TextInput
                style={{ fontWeight: "bold", fontSize: 16 }} // Smaller font for heading 2
                onChangeText={(t) => updateBlockContent(index, t)}
                multiline={true}
                placeholder="Type the content of your block"
                value={block.content}
              />
            ) : block.type === "heading3" ? (
              <TextInput
                style={{ fontWeight: "bold", fontSize: 14 }}
                onChangeText={(t) => updateBlockContent(index, t)}
                multiline={true}
                placeholder="Type the content of your block"
                value={block.content}
              />
            ) : block.type === "heading4" ? (
              <TextInput
                style={{ fontWeight: "bold", fontSize: 13 }}
                onChangeText={(t) => updateBlockContent(index, t)}
                multiline={true}
                placeholder="Type the content of your block"
                value={block.content}
              />
            ) : block.type === "heading5" ? (
              <TextInput
                style={{ fontWeight: "bold", fontSize: 12 }}
                onChangeText={(t) => updateBlockContent(index, t)}
                multiline={true}
                placeholder="Type the content of your block"
                value={block.content}
              />
            ) : block.type === "heading6" ? (
              <TextInput
                style={{ fontWeight: "bold", fontSize: 11 }}
                onChangeText={(t) => updateBlockContent(index, t)}
                multiline={true}
                placeholder="Type the content of your block"
                value={block.content}
              />
            ) : block.type === "quote" ? (
              <TextInput
                style={{ fontStyle: "italic", fontSize: 15, borderLeftWidth: 2, paddingLeft: 10 }} // Styling for quotes
                onChangeText={(t) => updateBlockContent(index, t)}
                multiline={true}
                placeholder="Type a quote"
                value={block.content}
              />
            ) : block.type === "underline" ? (
              <TextInput
                style={{ textDecorationLine: "underline", fontSize: 15 }}
                onChangeText={(t) => updateBlockContent(index, t)}
                multiline={true}
                placeholder="Type underlined content"
                value={block.content}
              />
            ) : block.type === "list" ? (
              <View>
                {block.content.split('\n').map((item, itemIndex) => (
                  <View key={itemIndex} style={{ flexDirection: "row" }}>
                    <Text style={{ marginRight: 10 }}>•</Text>
                    <TextInput
                      onChangeText={(t) => {
                        const newContent = block.content.split('\n');
                        newContent[itemIndex] = t;
                        updateBlockContent(index, newContent.join('\n'));
                      }}
                      placeholder="Enter list item"
                      placeholderTextColor="#CCC"
                      multiline={true}
                      value={item}
                    />
                  </View>
                ))}
              </View>
            ) : block.type === "bold" ? (
              <TextInput
                style={{ fontWeight: "bold", fontSize: 15 }}
                onChangeText={(t) => updateBlockContent(index, t)}
                multiline={true}
                placeholder="Type bold content"
                value={block.content}
              />
            ) : block.type === "strikethrough" ? (
              <TextInput
                style={{ textDecorationLine: "line-through", fontSize: 15 }}
                onChangeText={(t) => updateBlockContent(index, t)}
                multiline={true}
                placeholder="Strikethrough content"
                value={block.content}
              />
            ) : block.type === "highlight" ? (
              <TextInput
                style={{ backgroundColor: "yellow", fontSize: 15 }}
                onChangeText={(t) => updateBlockContent(index, t)}
                multiline={true}
                placeholder="Highlighted content"
                value={block.content}
              />
            ) : block.type === "code" ? (
              <TextInput
                style={{
                  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                  fontSize: 15,
                  backgroundColor: "#e0e0e0",
                  padding: 5
                }}
                onChangeText={(t) => updateBlockContent(index, t)}
                multiline={true}
                placeholder="Input code"
                value={block.content}
              />
            ) : block.type === "link" ? (
              <View>
                <TextInput
                  style={{ fontSize: 15 }}
                  onChangeText={(t) => updateBlockContent(index, { ...block.content, displayText: t })}
                  multiline={false}
                  placeholder="Display Text"
                  value={block.content.displayText}
                />
                <TextInput
                  style={{ textDecorationLine: "underline", color: "blue", fontSize: 15 }}
                  onChangeText={(t) => updateBlockContent(index, { ...block.content, url: t })}
                  multiline={false}
                  placeholder="Enter hyperlink"
                  value={block.content.url}
                />
              </View>
            ) : (
              <View>
                <TextInput
                  placeholder="Type the content of your block"
                  placeholderTextColor="#CCC"
                  value={block.content}
                  onChangeText={(t) => updateBlockContent(index, t)}
                  autoFocus={true}
                  multiline={true}
                />
              </View>
            )}

            {/* Add a "Record Audio" button */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                {/* make left 6 parts */}
                <SelectDropdown
                  data={['paragraph', 'heading', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6', 'list', 'quote', 'underline', 'bold', 'strikethrough', 'highlight', 'code', 'link']}
                  onSelect={(selectedItem) => {
                    updateBlockType(index, selectedItem);
                  }}
                  defaultButtonText={block.type}
                  buttonStyle={{ backgroundColor: 'transparent', justifyContent: 'center', padding: 0, margin: 0 }}
                  buttonTextStyle={{ color: 'blue', fontSize: 15, justifyContent: 'center', padding: 0, margin: 0 }}
                  dropdownStyle={{ backgroundColor: 'transparent' }}
                  rowStyle={{ backgroundColor: '#ccc', justifyContent: 'center' }}
                  rowTextStyle={{ color: '#000', fontSize: 11, justifyContent: 'center' }}
                />
              </View>

              <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => {
                    // Handle audio recording for the current block here
                    console.log("Recording audio...");
                    handleRecordButtonPress(index);

                  }}
                >

                  {/* make style same as  */}
                  <Text style={{ color: "blue" }}> {recording ? 'stop' : 'record'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => {
                    removeBlock(index);
                  }}
                >

                  {/* make style same as  */}
                  <Text style={{ color: "blue" }}> delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 10 }}>
          <Button title="Add" onPress={handleAddBlock} />
          {/* record new block */}
          <Button title="Record" onPress={handleRecordNew} />
          <Button title="Save" onPress={handleSave} />
        </View>

      </View>
    </ScrollView>
  );
};

styles = {


}