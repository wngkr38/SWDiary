import React, { useState, useEffect, useRef } from 'react';
import {
    Image,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    TouchableOpacity,
    KeyboardAvoidingView,
    StatusBar,
    ImageBackground,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import { address, getUserName } from '../global';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3',
        marginTop: 35,
        marginBottom: 18,
    },
    chatContainer: {
        flex: 1,
        paddingHorizontal: 16,
        marginBottom: 5,
    },
    messageBubble: {
        backgroundColor: '#b4e6fd',
        borderRadius: 10,
        padding: 10,
        marginTop: 8,
        maxWidth: '70%',
    },
    rightBubble: {
        borderWidth: 1,
        borderColor: 'black',
        backgroundColor: 'white',
        alignSelf: 'flex-end',
        marginStart: 'auto',
    },
    leftBubble: {
        borderWidth: 1,
        borderColor: 'black',
        backgroundColor: '#d3d3d3',
        alignSelf: 'flex-start',
        marginEnd: 'auto',
    },
    aimessageBubble: {
        backgroundColor: '#13f0a6',
        borderRadius: 10,
        padding: 10,
        marginTop: 8,
        marginStart: 120,
        maxWidth: '70%',
    },
    messageText: {
        fontSize: 16,
        fontFamily: 'Dovemayo_gothic',
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 2,
        backgroundColor: 'white',
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 20,
        paddingHorizontal: 16,
        marginRight: 16,
        fontFamily: 'Dovemayo_gothic',
    },
    sendButton: {
        borderWidth: 1,
        borderColor: 'gray',
        backgroundColor: 'transparent',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    back: {
        backgroundColor: 'transparent',
        marginTop: 0,
        marginStart: 8,
        width: 50,
        height: 50,
        elevation: 0, // Android
        shadowOpacity: 0, // iOS
        shadowOffset: { height: 0, width: 0 }, // iOS
        shadowRadius: 0, // iOS
    },
    timeText: {
        fontSize: 12,
        color: 'gray',
        fontFamily: 'Dovemayo_gothic',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
});

const handlePressBack = (navigation) => {
    navigation.goBack();
};

export default function TalkRoom({ navigation }) {
    const [messages, setMessages] = useState([]); // 채팅 메시지를 저장할 상태
    const [inputText, setInputText] = useState(''); // 입력한 텍스트를 저장할 상태
    const [myName, setUserName] = useState(null);
    // ScrollView에 대한 ref 생성
    const scrollViewRef = useRef();
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const contentHeight = event.nativeEvent.contentSize.height;
        const height = event.nativeEvent.layoutMeasurement.height;

        setIsScrolledToBottom(offsetY + height >= contentHeight);
    };
    useEffect(() => {
        if (isScrolledToBottom) {
            setTimeout(() => {
                scrollViewRef.current.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    useEffect(() => {
        (async () => {

            try {
                const name = await getUserName();
                setUserName(name);

                axios.post(address + '/getmessage', { name: name }).then((response) => {
                    if (response.status === 200) {
                        setMessages(
                            response.data.chat.map((chat) => ({
                                id: chat.id,
                                text: chat.content,
                                time: chat.time,
                                isMine: chat.from_name === name,
                            }))
                        );
                    }
                });

            } catch (error) {
                console.error(error);
            }
        })();

        // 컴포넌트가 마운트될 때 스크롤 뷰를 맨 아래로 이동
        scrollViewRef.current.scrollToEnd({ animated: true });
    }, []);

    // messages 상태가 변경될 때마다 실행되는 useEffect
    useEffect(() => {
        // setTimeout을 사용하여 비동기적으로 스크롤 이동 처리
        setTimeout(() => {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    useEffect(() => {
        // 키보드가 나타날 때와 사라질 때의 이벤트 리스너를 등록합니다.
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () =>
            scrollViewRef.current.scrollToEnd({ animated: false })
        );

        return () => {
            // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거합니다
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const getGptResponse = async (inputText) => {
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions',
                {
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a helpful assistant." },
                        { role: "user", content: inputText.trim() },
                    ],
                    max_tokens: 1024,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer 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'
                    }
                }
            );
            console.log(response.data);

            return response.data.choices[0].message.content;

        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    };

    // 메시지를 전송하는 함수
    const sendMessage = async () => {
        if (inputText.trim() !== '') {
            const currentTime = new Date().toISOString();

            setMessages([
                ...messages,
                { text: inputText, time: currentTime, isMine: true }, // 사용자 메시지 먼저 추가

            ]);
            setInputText('');
            const aiResponse = await getGptResponse(inputText); // 이후 AI 응답 받기

            setMessages((prevMessages) => [
                ...prevMessages,
                { text: aiResponse, time: currentTime, isMine: false }, // AI 응답 추가
            ]);

            from_name = myName; // 보낸 사람 이름 설정

            to_name = '능지'; // 받는 사람 이름 설정
            let content = inputText; // 채팅 내용


            await axios.post(address + '/sendmessage', { from_name, to_name, content, time: currentTime })
                .then((response) => {
                    if (response.status === 200) {
                        console.log('사용자 메시지 전송 성공');

                    } else {
                        console.error('사용자 메시지 전송 실패');
                        Alert.alert('전송 실패');
                    }

                }).catch((error) => {
                    console.error("사용자 메시지 전송 중 오류 발생", error);
                });

            from_name = '능지';
            to_name = myName;
            content = aiResponse;

            await axios.post(address + '/getGptResponse', { from_name, to_name, content, time: currentTime })
                .then((response) => {
                    if (response.status === 200) {
                        console.log("AI 응답 DB저장 성공");
                    } else {
                        console.error("AI 응답 DB저장 실패");
                        Alert.alert("전송 실패");
                    }

                }).catch((error) => {
                    console.error("AI 응답 DB저장 중 오류 발생", error);
                });
        }
    };






    return (

        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.back} onPress={() => handlePressBack(navigation)}>
                    <Image
                        source={require('../../icon/back.png')}
                        style={{
                            width: 50,
                            height: 50,
                            right: 7,
                        }}
                    />
                </TouchableOpacity>
            </View>

            <ImageBackground source={require('../../assets/paper.jpg')} style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
                <TouchableWithoutFeedback
                    onPress={() => {
                        Keyboard.dismiss();
                    }}
                >
                    <ScrollView
                        style={styles.chatContainer}
                        ref={scrollViewRef}
                        keyboardShouldPersistTaps="always"
                        onScroll={handleScroll} // Add this prop
                        scrollEventThrottle={16}
                    >
                        {messages.map((message, index) => (
                            <View
                                key={index}
                                style={[styles.messageBubble, message.isMine ? styles.rightBubble : styles.leftBubble]}
                            >
                                <Text style={styles.messageText}>{message.text}</Text>
                                <Text style={styles.timeText}>
                                    {`${('0' + new Date(message.time).getHours()).slice(-2)}:${(
                                        '0' + new Date(message.time).getMinutes()
                                    ).slice(-2)}`}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </TouchableWithoutFeedback>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="메시지 입력"
                        value={inputText}
                        onChangeText={(text) => setInputText(text)}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Image
                            source={require('../../icon/send.png')}
                            style={{
                                width: 25,
                                height: 25,
                                right: 2,
                            }}
                        />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
}