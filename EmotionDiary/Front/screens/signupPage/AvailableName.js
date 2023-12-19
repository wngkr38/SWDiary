import { View, Text, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { address } from '../global';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#b4e6fd',
    },
});

export default function Available(props) {
    const { params } = props.route;
    const userName = params.userName;
    const [text, setText] = useState('은 사용 가능한 닉네임 입니다.');
    const navigation = useNavigation();

    // userId와 userEmail 상태 변수 추가
    const [storedUserId, setStoredUserId] = useState('');
    const [storedUserEmail, setStoredUserEmail] = useState('');

    const [userNickname, setUserNickname] = useState('');

    // 컴포넌트가 마운트될 때 AsyncStorage에서 userId와 userEmail 가져오기
    useEffect(() => {
        (async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                const email = await AsyncStorage.getItem('userEmail');

                setStoredUserId(id);
                setStoredUserEmail(email);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    async function storeUserName(userName) {
        try {
            await AsyncStorage.setItem('userName', userName);
        } catch (error) {
            console.error('Error storing the username', error);
        }
    }

    function pressedSubmit() {
        storeUserName(userName); // 스토리지에 userName 저장

        axios
            .post(address + '/saveNickname', {
                nickname: userName,
                id: storedUserId,
                email: storedUserEmail,
            })
            .then((response) => {
                console.log('닉네임이 성공적으로 저장되었습니다.');
                navigation.navigate('Home');
            })
            .catch((error) => {
                console.error('닉네임 저장 중 오류 발생:', error);
            });
    }

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 30, marginBottom: 20 }}>
                {userName}
                {text}
            </Text>
            <Button title="사용하기" onPress={pressedSubmit}></Button>
        </View>
    );
}
