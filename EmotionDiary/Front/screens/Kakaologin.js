//카카오 로그인 api 구현 js 
//(값 가져오는 것은 navigation 만들고, 로그인 확인 후 추가 예정)
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from 'react-native-webview';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { address } from "./global";

const REST_API_KEY = '4cd16adcc3eeb1aba954dfbb72dd12ad';
const REDIRECT_URI = address + '/Signin';
const INJECTED_JAVASCRIPT = `window.ReactNativeWebView.postMessage('message from webView')`;

const KaKaoLogin = () => {
    const navigation = useNavigation();
    const [idList, setIdList] = useState([]);
    const [myId, setMyId] = useState('');
    const [myEmail, setMyEmail] = useState('');
    function KakaoLoginWebView(data) { //로그인 띄어줌 
        const exp = "code=";
        var condition = data.indexOf(exp);
        if (condition != -1) {
            var authorize_code = data.substring(condition + exp.length);
            requestToken(authorize_code);
        };
    }


    const requestToken = async (authorize_code) => {
        try {
            var AccessToken = "none";
            const response = await axios({
                method: 'post',
                url: 'https://kauth.kakao.com/oauth/token',
                params: {
                    grant_type: 'authorization_code',
                    client_id: REST_API_KEY,
                    redirect_uri: REDIRECT_URI,
                    code: authorize_code,
                },
            });

            AccessToken = response.data.access_token;

            // 동기적으로 사용자 정보 요청 및 저장
            const userId = await requestUserInfo(AccessToken);
            // 동기적으로 ID 리스트 가져오기
            const currentIdList = await getIdList(userId);

            if (currentIdList.includes(userId)) {
                navigation.navigate("Home", { screen: "Home", params: { userId } });
            } else {
                navigation.navigate("SignUp", { screen: "SignUp", params: { userId } });
            }

        } catch (error) {
            console.log('error', error);
        }
    };

    const getIdList = async (userId) => {
        try {

            // axios.get()으로 변경, 파라미터는 URL 뒤에 붙여줍니다.
            const response = await axios.get(`${address}/getUserInfo?user_id=${userId}`);

            if (response.status === 200) {
                const { idList } = response.data;
                setIdList(idList);

                // ID 리스트 반환
                return idList;
            } else if (response.status === 204) {
                console.log('데이터가 비어있습니다.');
                setIdList([]);

                // 빈 배열 반환
                return [];
            } else {
                throw new Error('아이디들을 가져오지 못했습니다.');
            }
        } catch (error) {
            console.error('아이디 데이터 요청 중 오류가 발생했습니다.', error);
            setIdList([]); // 에러 시 빈 배열로 설정

            // 에러 발생 시 빈 배열 반환
            return [];
        }
    };



    function requestUserInfo(AccessToken) { // 토큰으로 id, email 저장 키값 id
        return new Promise((resolve, reject) => {
            axios({
                method: 'GET',
                url: 'https://kapi.kakao.com/v2/user/me',
                headers: {
                    Authorization: `Bearer ${AccessToken}`
                },
            }).then((response) => {
                var user_id = response.data.id; // 사용자를 식별할 수 있는 고유 id
                var user_email = response.data.kakao_account.email; // 이메일 
                setMyId(user_id) //아이디 
                setMyEmail(user_email) //이메일 

                storeData(AccessToken, String(user_id), user_email).then(() => resolve(String(user_id))); //asyncStorage에 토큰이랑 유저의 uid 및 email 저장하는 코드
            }).catch(function (error) {
                console.log('error', error);
                reject(error);
            })
        });
    }

    const storeData = async (accessToken, userId, userEmail) => { // 스토리지에 값 저장 
        try {
            await AsyncStorage.setItem('userAccessToken', accessToken);
            await AsyncStorage.setItem('userId', userId);
            await AsyncStorage.setItem('userEmail', userEmail);
        } catch (error) {
            console.error(error);
        }
    }


    return (
        <View style={Styles.container}>
            <WebView
                style={{ flex: 1 }}
                originWhitelist={['*']}
                scalesPageToFit={false}
                source={{
                    uri: `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`,
                }}
                injectedJavaScript={INJECTED_JAVASCRIPT}
                javaScriptEnabled
                onMessage={event => { KakaoLoginWebView(event.nativeEvent["url"]); }}
                onNavigationStateChange={navState => {
                    if (navState.url.startsWith(REDIRECT_URI)) {
                        navigation.navigate('Signin');
                    }
                }}
            />
        </View>
    )
}

export default KaKaoLogin;

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 24,
        backgroundColor: '#fff',
    },
});