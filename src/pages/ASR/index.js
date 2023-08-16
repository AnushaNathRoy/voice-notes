
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { FontAwesome } from '@expo/vector-icons';
import { AndroidAudioEncoder, AndroidOutputFormat } from 'expo-av/build/Audio';

export default()=> {

  const [recording, setRecording] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [audioPermission, setAudioPermission] = useState(null);
    const [transcript, setTranscript] = useState([]);
  useEffect(() => {

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
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY={
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
    const trans= data["transcript"][0]["transcript"]
    console.log(trans);
    //return trans;
    return data.transcript;
  };
  async function stopRecording() {
    try {

      if (recordingStatus === 'recording') {
        console.log('Stopping Recording')
        await recording.stopAndUnloadAsync();
        const recordingUri = recording.getURI();
        const transcript = await getTranscript(recordingUri);
        setTranscript(transcript);
        console.log('Recording', recordingUri);
        const extension= recordingUri.split(".").pop();
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
      }

    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  }

  async function handleRecordButtonPress() {
    if (recording) {
      const audioUri = await stopRecording(recording);
      if (audioUri) {
        console.log('Saved audio file to', savedUri);
  
      }
    } else {
      await startRecording();
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleRecordButtonPress}>
        <FontAwesome name={recording ? 'stop-circle' : 'circle'} size={64} color="white" />
      </TouchableOpacity>
      <Text style={styles.recordingStatusText}>{`Recording status: ${recordingStatus}`}</Text>
      {transcript.map((item, index) =>(
        <Text key={index}>
                      {`${item.transcript}`}
            {/* {`Start: ${item.start}, End: ${item.end}\n${item.transcript}`} */}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'red',
  },
  recordingStatusText: {
    marginTop: 16,
  },
});
