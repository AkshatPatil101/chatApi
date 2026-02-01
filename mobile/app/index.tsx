import { Text, View, Image } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>It works</Text>
      <Image source={require("../assets/images/turbo.png")} style={{
        height:200,
        width:200
      }}/>
      
    </View>
  );
}
