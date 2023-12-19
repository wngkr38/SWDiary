import { useState, useEffect } from 'react';
import { Text } from 'react-native-paper';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { address } from './global';
import { View, FlatList, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';

export default function Notice({ route }) {
    const [comments, setComments] = useState([]);
    const [replies, setReplies] = useState([]);
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const name = route.params.userName; //내이름
    useEffect(() => {
        if (isFocused) {
            getNotice();
        }
    }, [isFocused, name]); // isFocused나 userName 중 하나라도 바뀌면 useEffect 재실행

    async function getNotice() {
        try {
            const response = await axios.post(address + '/getNotice', {
                friend_name: name,
            });

            if (response.status === 200) {
                const { comments, replies } = response.data;
                setComments(comments);
                setReplies(replies);
            } else {
                console.error('알림 데이터를 가져오지 못했습니다.');
            }
        } catch (error) {
            console.error('알림 데이터 요청 중 오류가 발생했습니다.', error);
        }
    }

    async function changeCheck(id) {
        try {
            const response = await axios.post(address + '/changeCheck', {
                friend_name: name,
                friend_diary_id: id,
            });
            if (response.status === 200) {
                console.log('읽음 처리 완료');
            } else {
                console.error('읽음으로 못바꿈 ㅜㅜ.');
            }
        } catch (error) {
            console.error('읽음으로 보내고 싶은데 못보냄.', error);
        }
    }

    // comments와 replies 배열에서 제목과 ID 간의 매핑 생성
    const titleMap = [...comments, ...replies].reduce((acc, [title, id]) => {
        acc[id] = title;
        return acc;
    }, {});

    // comments와 replies 배열에서 각 다이어리 제목에 대한 알림 개수 계산
    const noticeCounts = [...comments.map((comment) => comment[1]), ...replies.map((reply) => reply[1])].reduce(
        (acc, id) => {
            const title = titleMap[id];
            acc[`${title}-${id}`] = (acc[`${title}-${id}`] || 0) + 1;
            return acc;
        },
        {}
    );
    const handlePressBack = (navigation) => {
        navigation.goBack();
    };
    // 각 다이어리 제목에 대한 알림 개수 출력
    return (
        <ImageBackground
            source={require('../assets/paper.jpg')}
            style={{ flex: 1, marginTop: 50, backgroundColor: '#f4f4f4' }}
        >
            <View style={styles.header}>
                <TouchableOpacity style={styles.back} onPress={() => handlePressBack(navigation)}>
                    <Image
                        source={require('../icon/back.png')}
                        style={{
                            width: 50,
                            height: 50,
                            right: 7,
                        }}
                    />
                </TouchableOpacity>
            </View>
            <View style={{ marginTop: 10 }}>
                <FlatList
                    data={Object.entries(noticeCounts)}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 50,
                            }}
                        >
                            <Text style={{ fontSize: 25, fontFamily: 'Dovemayo_gothic' }}>알림이 없습니다.</Text>
                        </View>
                    }
                    renderItem={({ item }) => {
                        const [titleIdCombo, count] = item;
                        const [title, id] = titleIdCombo.split('-');
                        return (
                            <>
                                <TouchableOpacity
                                    onPress={async () => {
                                        alert(`'${title}'(ID: ${id})에 대한 알림이 클릭되었습니다.`);
                                        await changeCheck(id);
                                        navigation.navigate('ViewDiary', { id, name });
                                    }}
                                >
                                    <Text
                                        style={styles.item}
                                    >{`'${title}' 다이어리에 ${count}개의 알림이 있습니다.`}</Text>
                                </TouchableOpacity>
                                <View
                                    style={{
                                        borderBottomColor: 'gray',
                                        borderBottomWidth: 1,
                                        marginTop: 8,
                                    }}
                                />
                            </>
                        );
                    }}
                />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    item: {
        padding: 10,
        fontSize: 18,
        borderBottomColor: '#000',
        fontFamily: 'Dovemayo_gothic',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,

        backgroundColor: '#F3F3F3',
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
});
