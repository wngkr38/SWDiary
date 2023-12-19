import axios from 'axios';
import { TouchableOpacity, Text, View, FlatList, StyleSheet, Image, ImageBackground, SafeAreaView, SectionList } from 'react-native';
import { address } from './global';

import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function FriendDiaryList({ route }) {
    const [friendDiary, setFriendDiary] = useState([]);
    const { friendNickname, userName } = route.params;
    const imagePath =
        'file:///var/mobile/Containers/Data/Application/C109D784-B386-4E50-8092-532717540817/Library/Caches/ExponentExperienceData/%2540anonymous%252Fdiary-f19d74c5-1636-49e2-8007-75517dd83f21/ImagePicker/A3AC10C0-D07C-4F47-8424-4064A82FC4BE.png';

    const navigation = useNavigation();

    useEffect(() => {
        fetchFriendDiaries();
    }, []);

    // 각 일기 항목을 렌더링하는 함수
    const renderDiaryItem = ({ item }) => {
        const formattedDate = new Date(item.date).toLocaleDateString('ko-KR', { day: 'numeric', weekday: 'long' });

        const handlePress = () => {
            pressList(item.id, item.name, item.title);
        };

        return (
            <View style={styles.diaryItemContainer}>
                <TouchableOpacity onPress={handlePress}>
                    <Text style={[styles.dateText, { marginTop: 8 }]}>{formattedDate}</Text>
                    <View style={styles.imageAndTitleContainer}>
                        <Image
                            source={{ uri: imagePath }}
                            resizeMode="cover"
                            style={[styles.image, { width: 60, height: 60 }]}
                        />
                        <Text style={[styles.titleText, { fontWeight: 'bold', fontSize: 18, marginTop: 5 }]}>
                            {item.title}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

        );

        function pressList(id, name, title) {
            navigation.navigate('ViewFriendDiary', { id, name, title, userName });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.titleText}>{friendNickname}님의 일기 목록</Text>
                <View style={[styles.iconContainer, { position: 'absolute', right: 10 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image
                            source={require('../icon/back.png')}
                            style={{
                                width: 50,
                                height: 50,
                            }}
                        />
                    </TouchableOpacity>
                </View>
            </View >
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
                        sections={groupDiariesByMonth(friendDiary)}
                        renderItem={renderDiaryItem}
                        keyExtractor={(item) => item.id} // 고유한 키 값으로 설정해야 합니다.
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
                    {friendDiary.length === 0 && <Text>친구가 작성한 일기가 없습니다.</Text>}
                </View>
            </ImageBackground>
        </SafeAreaView >

    );

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


    function fetchFriendDiaries() {
        const sendName = friendNickname;
        axios
            .post(address + '/getFriendDiary', { name: sendName })
            .then((response) => {
                if (response.status === 200) {
                    const { diaries } = response.data;
                    setFriendDiary(diaries);
                    console.log(diaries)
                } else if (response.status === 204) {
                    console.log('데이터가 비어있습니다.');
                    setFriendDiary([]);
                } else {
                    console.error('일기 데이터를 가져오지 못했습니다.');
                    setFriendDiary([]); // 에러 시 빈 배열로 설정
                }
            })
            .catch((error) => {
                console.error('일기 데이터 요청 중 오류가 발생했습니다.', error);
                setFriendDiary([]); // 에러 시 빈 배열로 설정
            });
    }
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
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
    dateText: {
        fontFamily: 'Dovemayo_gothic',
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
});
