//회원가입
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Signin = () => {

  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    async function getUserId() {
      try {
        const storedUserId = await AsyncStorage.getItem('userId')
        if (storedUserId !== null) {
          setUserId(storedUserId); // userId 상태 업데이트
        }
      } catch (e) {
        console.log('error', e);
      }
    }
    if (isFocused) {
      getUserId();
    }

  }, [isFocused]);


  return (
    <View style={Styles.container}>
      <Text style={Styles.HomeText}>로그인 화면</Text>
      {userId && <Text style={Styles.HomeText}>현재 유저의 id : {userId}</Text>}
      {!userId && <Text style={Styles.HomeText}>유저 id X</Text>}
      <TouchableOpacity
        onPress={() => navigation.navigate("KaKaoLogin", { screen: 'KaKaoLogin' })}
        style={Styles.NextBottom}
      >
        <Text style={Styles.BottomText}>카카오 로그인</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Signin;

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  HomeText: {
    fontSize: 30,
    textAlign: "center",
  },
  NextBottom: {
    backgroundColor: "purple",
    padding: 10,
    marginTop: "20%",
    width: "50%",
    alignSelf: "center",
    borderRadius: 10,
  },
  BottomText: {
    fontSize: 15,
    color: 'white',
    textAlign: "center",
  }
})