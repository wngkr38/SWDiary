import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FRList from './friend_page/FRList';
import { LocaleConfig, CalendarList } from 'react-native-calendars';
import DiaryList from './DiaryList';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { address, getUserName, getUserId } from './global';
import LogOut from './LogOut';
import { FAB } from 'react-native-paper';
import { Dimensions, View, StyleSheet, LogBox, TouchableOpacity, Image, ImageBackground } from 'react-native';
export const windowWidth = Dimensions.get('window').width;
import CustomCalendar from './write_page/CustomCalendar';
LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);

LocaleConfig.locales['ko'] = {
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.'],
    dayNames: ['일요일', ' 월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', ' 월 ', , '화 ', , '수 ', , '목 ', , '금 ', , , '토'],
    today: '',
};
LocaleConfig.defaultLocale = 'ko';

const Tab = createBottomTabNavigator();
const styles = StyleSheet.create({
    talk: {
        backgroundColor: '#9B9B9B',
        position: 'absolute',
        marginBottom: 120,
        marginEnd: 25,
        borderRadius: 50,
        right: 0,
        bottom: 0,
        width: 50, // 버튼의 너비를 조절합니다.
        height: 50, // 버튼의 높이를 조절합니다.
    },
    write: {
        backgroundColor: '#9B9B9B',
        position: 'absolute',
        marginBottom: 190,
        marginEnd: 25,
        borderRadius: 50,
        right: 0,
        bottom: 0,
        width: 50, // 버튼의 너비를 조절합니다.
        height: 50, // 버튼의 높이를 조절합니다.
    },
    talkicon: {
        width: 48,
        height: 48,
        marginEnd: -7,
        right: 14,
        bottom: 13,
    },
    writeicon: {
        width: 45,
        height: 45,
        marginEnd: 10,
        marginBottom: -8,
        right: 12,
        bottom: 13,
    },
});
export default function Home({ }) {
    const navigation = useNavigation(); // navigation 객체 가져오기
    const [userId, setUserId] = useState(null);

    const [diaries, setDiaries] = useState([]);
    const isFocused = useIsFocused();

    const [userName, setUserName] = useState(null);
    const date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작하기 때문에 +1을 해주고, 두 자릿수를 유지하기 위해 slice를 사용합니다.
    const day = ("0" + date.getDate()).slice(-2); // 일도 두 자릿수를 유지하기 위해 slice를 사용합니다.
  
    const currentDate = `${year}-${month}-${day}`;
    useEffect(() => {
        (async () => {
            try {
                const name = await getUserName();
                const id = await getUserId();
                setUserName(name);
                setUserId(id);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);
    useEffect(() => {
        if (isFocused && userName) {
            fetchDiaries();
        }
    }, [isFocused, userName]);

    function fetchDiaries() {
        const sendName = userName;
        axios
            .post(address + '/getDiary', {
                name: sendName,
            })
            .then((response) => {
                if (response.status === 200) {
                    // 성공적으로 응답을 받았을 때
                    let { diaries } = response.data;
                    // 일기 데이터를 날짜 기준으로 내림차순 정렬
                    diaries.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setDiaries(diaries);
                } else if (response.status === 204) {
                    // 추가: 컨텐츠 없음 상태 처리
                    console.log('일기 데이터가 없습니다.');
                    setDiaries([]); // 빈 배열 설정
                } else {
                    console.error('일기 데이터를 가져오지 못했습니다.');
                }
            })
            .catch((error) => {
                console.error('일기 데이터 요청 중 오류가 발생했습니다.', error);
            });
    }


    return (
        <>
            <Tab.Navigator
                screenOptions={{
                    cardStyle: { backgroundColor: 'transparent' },
                    tabBarButton: (props) => (
                        <TouchableOpacity style={{ height: 100 }} {...props} /> // 원하는 높이로 변경하세요.

                    ),
                    style: {
                        position: 'absolute',
                        backgroundColor: '#ff0000', // 빨간색으로 설정
                        borderTopColor: 'transparent',
                        height: 200, // 이 부분을 원하는 높이로 조정하세요.
                    },
                }}
            >
                <Tab.Screen
                    name="Home2"
                    options={{
                        headerShown: false,
                        tabBarLabel: '',
                        tabBarButton: (props) => (
                            <TouchableOpacity style={{ marginBottom: 200 }} {...props}>
                                <Image
                                    source={require('../icon/calendar.png')}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        marginBottom: -25,
                                        backgroundColor: 'transparent',
                                        tintColor: props.focused ? 'black' : '#9B9B9B',
                                    }}
                                />
                            </TouchableOpacity>
                        ),
                    }}
                >
                    {() => <HomeTabContent diaries={diaries} userName={userName} currentDate={currentDate}/>}
                </Tab.Screen>
                <Tab.Screen
                    name="DiaryList"
                    options={{
                        headerShown: false,
                        tabBarLabel: '',
                        tabBarButton: (props) => (
                            <TouchableOpacity style={{ marginBottom: 200 }} {...props}>
                                <Image
                                    source={require('../icon/list.png')}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        marginBottom: -25,
                                        backgroundColor: 'transparent',
                                        tintColor: props.focused ? 'black' : '#9B9B9B',
                                    }}
                                />
                            </TouchableOpacity>
                        ),
                    }}
                >
                    {(props) => <DiaryList {...props} userName={userName} />}
                </Tab.Screen>
                <Tab.Screen
                    name="Friends"
                    options={{
                        headerShown: false,
                        tabBarLabel: '',
                        tabBarButton: (props) => (
                            <TouchableOpacity style={{ marginBottom: 200 }} {...props}>
                                <Image
                                    source={require('../icon/friends.png')}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        marginBottom: -25,
                                        backgroundColor: 'transparent',
                                        tintColor: props.focused ? 'black' : '#9B9B9B',
                                    }}
                                />
                            </TouchableOpacity>
                        ),
                    }}
                >
                    {(props) => <FRList {...props} userName={userName} />}
                </Tab.Screen>
                <Tab.Screen
                    name="LogOut"
                    options={{
                        headerShown: false,
                        tabBarLabel: '',
                        tabBarButton: (props) => (
                            <TouchableOpacity style={{ marginBottom: 200 }} {...props}>
                                <Image
                                    source={require('../icon/user.png')}
                                    style={{
                                        width: 90,
                                        height: 95,
                                        marginBottom: -25,
                                        backgroundColor: 'transparent',
                                        tintColor: props.focused ? 'black' : '#9B9B9B',
                                    }}
                                />
                            </TouchableOpacity>
                        ),
                    }}
                >
                    {(props) => <LogOut {...props} userName={(userId, userName)} />}
                </Tab.Screen>
            </Tab.Navigator>
            <FAB
                name="talk"
                style={styles.talk}
                icon={() => <Image source={require('../icon/talk.png')} style={styles.talkicon} />}
                onPress={() => {
                    navigation.navigate('TalkRoom');
                    // 버튼을 눌렀을 때 실행될 로직 추가
                }}
            />
            <FAB
                name="write"
                style={styles.write}
                icon={() => <Image source={require('../icon/pen.png')} style={styles.writeicon} />}
                onPress={() => {
                    navigation.navigate('WriteDiary', { userName: userName, date: currentDate+'T13:35:31.779Z' });
                    // 버튼을 눌렀을 때 실행될 로직 추가
                }}
            />
        </>
    );
}

function HomeTabContent({ userName, diaries }) {
    const navigation = useNavigation();
    // 오늘 날짜를 'YYYY-MM-DD' 형식으로 얻습니다.
    const today = new Date().toISOString().slice(0, 10);
    const isFocused = useIsFocused();

    // 일기를 작성한 날짜들
    const [writtenDiaryDates, setWrittenDiaryDates] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(today.slice(0, 7)); // 'YYYY-MM' 형식으로 초기값 설정


    useEffect(() => {
        if (isFocused) {
            const fetchData = async () => {
                const name = await getUserName();
                await fetchDates(name);
            };
            fetchData();
        }
    }, [isFocused]);

    async function fetchDates(userName) {
        axios
            .post(address + '/getDates', {
                name: userName,
            })
            .then((response) => {
                if (response.status === 200) {
                    // 성공적으로 응답을 받았을 때
                    const { dates_with_emotion } = response.data;
                    const formattedDates = dates_with_emotion.map((item) => {
                        const date = new Date(item.date).toISOString().split('T')[0];
                        return { date, emotion_index: item.emotion_index };
                    });
                    setWrittenDiaryDates(formattedDates);
                } else {
                    console.error('날짜를 가져오지 못했습니다.');
                }
            })
            .catch((error) => {
                console.error('날짜 데이터 요청 중 오류가 발생했습니다.', error);
            });
    }

    function handleDayPress(day) {
        navigation.navigate('WriteDiary', { userName: userName, date: day.dateString+'T13:35:31.779Z' });
    };


    // 위 배열을 markedDates prop에 사용할 수 있는 형태의 객체로 변환
    const markedDates = writtenDiaryDates.reduce((acc, item) => {
        acc[item.date] = {
            selected: true,
            marked: true,
            selectedColor: 'pink',
            emotion_index: item.emotion_index
        };
        return acc;
    }, {});

    return (
        <ImageBackground
            source={require('../assets/paper.jpg')}
            style={{ flex: 1, marginTop: 50, backgroundColor: '#f4f4f4' }}
        >
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 10 }}>
                {/* 여기 부분 가져가면 됨 (10/18) 캘린더 */}
                <CustomCalendar
                    onDayPress={(day) => handleDayPress(day)}
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    markedDates={markedDates}
                />

            </View>
        </ImageBackground>
    );
}
