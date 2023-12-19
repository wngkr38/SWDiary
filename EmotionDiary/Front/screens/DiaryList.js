import React, { useEffect, useState } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    SectionList,
    SafeAreaView,
    Image,
    ImageBackground,
} from 'react-native';
import axios from 'axios';
import { address, Angry, Happy, Hurt, Unrest, Sad, Passive, Embarrassment } from './global';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-swipeable';

export default function DiaryList({ userName }) {
    const [diaries, setDiaries] = useState([]);
    const navigation = useNavigation(); // 여기로 이동
    const isFocused = useIsFocused();
    const [openSwipeable, setOpenSwipeable] = useState(null); // 현재 열린 Swipeable 컴포넌트를 추적하는 상태 변수

    useEffect(() => {
        if (isFocused) {
            // 페이지가 포커스 되었고 userName도 설정된 경우
            fetchDiaries();
        }
    }, [isFocused]); // isFocused나 userName 중 하나라도 바뀌면 useEffect 재실행

    const handleSwipeOpen = (swipeable) => {
        if (openSwipeable && openSwipeable !== swipeable) {
            openSwipeable.recenter(); // 이전에 열린 Swipeable 컴포넌트 닫기
        }

        setOpenSwipeable(swipeable); // 새로 열린 Swipeable 컴포넌트 설정
    };

    const handleSwipeClose = () => {
        setOpenSwipeable(null); // 현재 열린 SwipeableView 없음으로 설정
    };

    function fetchDiaries() {
        const sendName = userName;
        axios
            .post(address + '/getDiary', { name: sendName })
            .then((response) => {
                if (response.status === 200) {
                    const { diaries } = response.data;
                    setDiaries(diaries);
                } else if (response.status === 204) {
                    console.log('데이터가 비어있습니다.');
                    setDiaries([]);
                } else {
                    console.error('일기 데이터를 가져오지 못했습니다.');
                    setDiaries([]); // 에러 시 빈 배열로 설정
                }
            })
            .catch((error) => {
                console.error('일기 데이터 요청 중 오류가 발생했습니다.', error);
                setDiaries([]); // 에러 시 빈 배열로 설정
            });
    }

    function handleEmotionIndex(emotionIndex) {
        const imageStyles = {width: 200, height: 150}; 
    
        switch (emotionIndex) {
            case 1: //기쁨
                return <Happy style={imageStyles} />;
            case 2: //당황
                return <Embarrassment style={imageStyles} />;
            case 3: //분노
                return <Angry style={imageStyles} />;
            case 4: //불안
                return <Unrest style={imageStyles} />;
            case 5: //상처받은
                return <Hurt style={imageStyles} />;
            case 6: //슬픔
                return <Sad style={imageStyles} />;
            case 7: //평온
                return <Passive style={imageStyles} />;
            default:
                return <Passive style={imageStyles} />;
        }
    }

    // 각 일기 항목을 렌더링하는 함수
    const renderDiaryItem = ({ item }) => {
        const formattedDate = new Date(item.date).toLocaleDateString('ko-KR', { day: 'numeric', weekday: 'long' });
        const EmotionImage = handleEmotionIndex(item.emotion_index);
        let swipeRef;

        const handlePress = () => {
            pressList(item.id, item.name);
        };

        const handleDelete = () => {
            const sendId = item.id;
            const sendName = item.name;

            axios
                .post(address + '/deleteDiary', {
                    id: sendId,
                    name: sendName,
                })
                .then((response) => {
                    if (response.status === 200) {
                        // 성공적으로 응답을 받았을 때
                        fetchDiaries(); // 삭제 후 일기 데이터를 다시 가져오도록 fetchDiaries 함수 호출
                    } else {
                        console.error('일기 데이터를 가져오지 못했습니다.');
                    }
                })
                .catch((error) => {
                    console.error('일기 데이터 요청 중 오류가 발생했습니다.', error);
                });
        };



        return (
            <View style={styles.diaryItemContainer}>
                <Swipeable
                    useNativeDriver={true}
                    ref={(ref) => {
                        swipeRef = ref;
                    }}
                    onRightButtonsOpenRelease={() => handleSwipeOpen(swipeRef)}
                    onRightButtonsCloseRelease={handleSwipeClose}
                    rightButtons={[
                        <RectButton
                            onPress={handleDelete}
                            style={{
                                flex: 1,
                                backgroundColor: 'red',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: 80,
                            }}
                        >
                            <Text style={{ color: 'white', fontFamily: 'Dovemayo_gothic' }}>삭제</Text>
                        </RectButton>,
                    ]}
                    style={styles.swipeableContainer}
                >
                    <TouchableOpacity onPress={handlePress}>
                        <Text style={[styles.dateText, { marginTop: 8 }]}>{formattedDate}</Text>
                        <View style={styles.imageAndTitleContainer}>
                            {EmotionImage}
                            <Text style={[styles.titleText, { fontWeight: 'bold', fontSize: 18, marginTop: 5 }]}>
                                {item.title} {item.emotion_index}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Swipeable>
            </View>
        );
    };

    function pressList(id, name) {
        navigation.navigate('ViewDiary', { id, name, userName });
    }

    function pressNotice() {
        navigation.navigate('Notice', { userName });
    }

    function groupDiariesByMonth(diaries) {
        const groups = diaries.reduce((groups, diary) => {
            const date = new Date(diary.date);
            const monthYearKey = ` ${date.getFullYear()}년 ${date.getMonth() + 1}월`; // "월-년" 형식의 키 생성

            if (!groups[monthYearKey]) {
                groups[monthYearKey] = [];
            }

            groups[monthYearKey].push(diary);

            return groups;
        }, {});

        return Object.keys(groups)
            .map((key) => ({
                title: key,
                data: groups[key].sort((a, b) => new Date(b.date) - new Date(a.date)), // 각 월별 그룹 내에서 다이어리를 최신 순서로 정렬
            }))
            .sort((a, b) => new Date(b.data[0].date) - new Date(a.data[0].date)); // 월별 그룹 자체도 최신 순서로 정렬
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.titleText}>{userName}님의 일기 목록</Text>
                <View style={[styles.iconContainer, { position: 'absolute', right: 10 }]}>
                    <TouchableOpacity onPress={() => pressNotice()}>
                        <Image
                            source={require('../icon/bell.png')}
                            style={{
                                width: 60,
                                height: 60,
                                top: 7,
                                left: 7,
                            }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <ImageBackground source={require('../assets/paper.jpg')} style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
                <View
                    style={{
                        borderBottomColor: 'gray',
                        borderBottomWidth: 1,
                        backgroundColor: 'black',
                    }}
                />
                <View style={{ marginBottom: 20 }}>
                    <SectionList
                        sections={groupDiariesByMonth(diaries)}
                        keyExtractor={(item) => item.id}
                        renderItem={renderDiaryItem}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: 18,
                                    textAlign: 'center',
                                    margin: 20,
                                    fontFamily: 'Dovemayo_gothic',
                                }}
                            >
                                {title}
                            </Text>
                        )}
                        showsVerticalScrollIndicator={false} // 스크롤 바 없애기
                        stickySectionHeadersEnabled={false} // 글씨 안따라오게
                    />
                    {diaries.length === 0 && <Text>작성한 일기가 없습니다. 일기를 써보세요.</Text>}
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3',
        paddingTop: 20,
        marginTop: 10,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconContainer: {
        flexDirection: 'row',
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Dovemayo_gothic',
    },
    imageAndTitleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    diaryItem: {
        flex: 1,
        flexDirection: 'column',
        padding: 10,
        margin: 5,
    },
    diaryItemContainer: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginVertical: 5,
        marginRight: 15,
        marginLeft: 15,
        borderColor: 'black',
        borderWidth: 1,
    },
    swipeableContainer: {
        overflow: 'hidden',
    },
    dateText: {
        fontFamily: 'Dovemayo_gothic',
    },
});
