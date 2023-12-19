import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const LogOut = ({ userId1, userName }) => {
    const navigation = useNavigation();
    const [userId, setUserId] = useState(userId1);
    const [userNickname, setUserNickname] = useState(userName);

    useEffect(() => {
        (async () => {
            try {
                const value = await AsyncStorage.getItem('userAccessToken');
                if (value !== null) {
                    console.log('SignUp1', value);
                }
                // userId 가져오기
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId !== null) {
                    setUserId(storedUserId); // userId 상태 업데이트
                }
                const storedUserNickname = await AsyncStorage.getItem('userNickname');
                if (storedUserNickname !== null) {
                    setUserNickname(storedUserNickname); // userNickname 상태 업데이트
                }
            } catch (e) {
                console.log('error', e);
            }
        })();
    }, []);

    // 카카오 연결 끊기 함수
    const unlinkFromKakao = async () => {
        const accessToken = await AsyncStorage.getItem('userAccessToken');

        if (!accessToken) return;

        let url = 'https://kapi.kakao.com/v1/user/unlink';

        let config = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
        };

        try {
            let response = await axios.post(url, {}, { ...config });

            if (response.status === 200) {
                console.log('Successfully unlinked with kakao');

                return true;
            } else {
                console.error('Failed to unlink with kakao', response.data);
                return false;
            }
        } catch (error) {
            console.error('An error occured while unlinking with kakao', error.message);
            return false;
        }
    };

    //로그아웃 버튼 클릭 시 처리
    const handleLogoutPress = async () => {
        let successUnlink = await unlinkFromKakao();
        await AsyncStorage.removeItem('userAccessToken'); //연결 끊기 성공시 토큰 제거
        await AsyncStorage.removeItem('userId');
        if (successUnlink) {
            navigation.navigate('Signin');
        } else {
            console.error('Failed to unlink');
        }
    };

    return (
        <View style={Styles.container}>
            <ImageBackground source={require('../assets/paper.jpg')} style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
                {userId && <Text style={Styles.HomeText}>ID : {userId}</Text>}
                {userNickname && <Text style={Styles.HomeText2}>닉네임 : {userNickname}</Text>}
                <TouchableOpacity onPress={handleLogoutPress} style={Styles.NextBottom}>
                    <Text style={Styles.BottomText}>로그아웃</Text>
                </TouchableOpacity>
            </ImageBackground>
        </View>
    );
};

export default LogOut;

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 45,
        backgroundColor: '#f4f4f4',
    },
    HomeText: {
        marginTop: 100,
        fontSize: 30,
        textAlign: 'center',
        fontFamily: 'Dovemayo_gothic',
    },
    HomeText2: {
        marginTop: 30,
        fontSize: 30,
        textAlign: 'center',
        fontFamily: 'Dovemayo_gothic',
    },
    NextBottom: {
        backgroundColor: '#dc3813',
        padding: 10,
        marginTop: '115%',
        marginEnd: '40%',
        width: '50%',
        alignSelf: 'center',
        borderRadius: 10,
    },
    BottomText: {
        fontSize: 15,
        color: 'black',
        textAlign: 'center',
        fontFamily: 'Dovemayo_gothic',
    },
});
