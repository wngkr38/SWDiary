import React, { useState, useEffect, useRef } from 'react';
import { View, Button, StyleSheet, Text, TextInput, Animated, Easing } from 'react-native';
import axios from 'axios';
import { address } from '../global';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#b4e6fd',
    },
});

export default function SignUp({ navigation }) {
    const [nickname, setNickname] = useState('');
    const [data, setData] = useState([]);
    const [errorMessage, setErrorMessage] = useState('사용할 이름을 입력해주세요.');

    const shakeAnimationValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        axios.get(address)
            .then(response => {
                setData(response.data);
            })
            .catch(error => console.error(error));
    }, []);

    function handleSignUp() {
        const isNicknameTaken = data.some(item => item.nickname === nickname);


        if (isNicknameTaken) {
            setErrorMessage('중복된 이름입니다.');
            Animated.sequence([
                Animated.timing(shakeAnimationValue, { toValue: 10, duration: 50, easing: Easing.linear, useNativeDriver: false }),
                Animated.timing(shakeAnimationValue, { toValue: -10, duration: 50, easing: Easing.linear, useNativeDriver: false }),
                Animated.timing(shakeAnimationValue, { toValue: 10, duration: 50, easing: Easing.linear, useNativeDriver: false }),
                Animated.timing(shakeAnimationValue, { toValue: 0, duration: 50, easing: Easing.linear, useNativeDriver: false }),
            ]).start(() => {
                setTimeout(() => {
                    setNickname('');
                    setErrorMessage('사용할 이름을 입력해주세요.');
                }, 500);
            });
        } else {
            // 사용자가 입력한 문자를 다음 화면으로 전달하고 화면을 전환
            navigation.navigate('Available', { userName: nickname });
        }
    }

    const animatedStyles = {
        transform: [{ translateX: shakeAnimationValue }],
    };

    return (
        <View style={styles.container}>
            <Animated.Text style={[{ fontSize: 20, marginBottom: 10 }, animatedStyles]}>
                <Text style={{ fontSize: 30, marginBottom: 20 }}>
                    {errorMessage}
                </Text>
            </Animated.Text>
            <TextInput
                fontSize={20}
                value={nickname}
                onChangeText={text => setNickname(text)}
                placeholder="닉네임"
                style={{ borderWidth: 1, borderColor: 'gray', padding: 8, width: 200, marginBottom: 10 }}
            />
            <Button
                title='입력'
                onPress={handleSignUp}
            />
        </View>
    );
}