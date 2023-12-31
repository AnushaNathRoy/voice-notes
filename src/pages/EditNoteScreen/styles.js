import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background: #fff;
  
`;
export const container = styled.View`
    flex: 1;
    alignItems: center;
    justifyContent: center;
`;
export const button1 = styled.TouchableOpacity`
alignItems: center;
justifyContent: center;
width: 128;
height: 128;
borderRadius:64;
background: red;
`;
export const recordingStatusText= styled.Text`
marginTop: 0;`;
export const TitleInput = styled.TextInput`
  font-size: 20px;
  padding: 15px;
  color: #222;
`;

export const BodyInput = styled.TextInput`
  flex: 1;
  padding: 15px;
  font-size: 17px;
  color: #222;
`;

export const SaveButton = styled.TouchableHighlight`
  margin-right: 15px;
  padding: 10px;
`;

export const SaveButtonImage = styled.Image`
  width: 24px;
  height: 24px;
`;
export const SaveButtonText = styled.Text`
  font-size: 16px;
  color: #fff;
`;
export const CloseButton = styled.TouchableHighlight`
  margin-left: 15px;
  padding: 10px;
`;

export const CloseButtonImage = styled.Image`
  width: 16px;
  height: 16px;
`;

export const ButtonsContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: flex-end;
`;

export const DeleteButton = styled.TouchableHighlight`
  height: 60px;
  background: #f64340;
  justify-content: center;
  align-items: center;
  flex: 1;
  children: <Text> Record Audio</Text>;

`;

export const DeleteButtonText = styled.Text`
  font-size: 16px;
  color: #fff;

`;
export const Box = styled.TouchableHighlight`
  padding: 15px;
  background: ${(props) => (props.check === true ? "#6C63FF" : "#f5f9f8")};
  margin: 10px;
  border-radius: 5px;
`;
export const SuccessButton = styled.TouchableHighlight`
  height: 60px;
  background: #28a745;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

export const SuccessButtonText = styled.Text`
  font-size: 16px;
  color: #fff;
`;

export const NoSuccessButton = styled.TouchableHighlight`
  height: 60px;
  background: #f0ad4e;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

export const NoSuccessButtonText = styled.Text`
  font-size: 16px;
  color: #fff;
`;