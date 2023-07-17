import React from "react";
import {
  Box,
  BoxContainer,
  Title,
  Check,
  CheckImage,
  UnCheck,
  UnCheckImage,
} from "./styles";
import { Alert } from 'react-native';
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";

export default ({ data, index, onPress }) => {
  const dispatch = useDispatch();

  const handleCheckNote = () => {
    dispatch({
      type: "SUCCESS_NOTE",
      payload: {
        key: index,
        title: data.title,
        body: data.body,
      },
    });
  };

  const handleUnCheckNote = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch({
              type: 'DELETE_NOTE',
              payload: {
                key: index,
              },
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <Box
      onPress={() => onPress(index)}
      underlayColor={data.done ? "#0000ff" : "#fff"}
      check={data.done}
    >
      <BoxContainer>
        <Title
          style={{
            fontFamily: "WorkSans-SemiBold",
          }}
          success={data.done}
        >
          {data.title}
        </Title>
        {data.done !== true && (
          <UnCheck onPress={handleUnCheckNote} underlayColor="transparent">
            <UnCheckImage source={require("../../assets/del.png")} />
          </UnCheck>
        )}
      </BoxContainer>
    </Box>
  );
};
