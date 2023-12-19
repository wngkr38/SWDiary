import {
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    View,
    Alert,
    Image,
    TouchableWithoutFeedback,
    Modal,
    Button,
    ImageBackground,
} from 'react-native';
import { Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { address, getUserName } from '../global';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomCalendar from './CustomCalendar';

import { FAB } from 'react-native-paper';

export default function WriteDiary({ route }) {
    const scrollViewRef = useRef(); //스크롤 뷰 참조 생성
    const inputRef = useRef(); // TextInput 참조 생성
    const { userName } = route.params;
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [year, setYear] = useState(selectedDate.getFullYear());
    const [month, setMonth] = useState(selectedDate.getMonth() + 1);
    const [day, setDay] = useState(selectedDate.getDate());
    // 요일 정보를 가져오기 위한 배열
    const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const [dayOfWeek, setDayOfWeek] = useState(daysOfWeek[selectedDate.getDay()]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigation = useNavigation();

    const [image, setImage] = useState(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [textInputHeight, setTextInputHeight] = useState(0);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState(selectedDate);
    const [tempYear, setTempYear] = useState(year);
    const [tempMonth, setTempMonth] = useState(month);



    useEffect(() => {
        const keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', _keyboardDidShow);
        const keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', _keyboardDidHide);

        return () => {
            keyboardWillShowSub.remove();
            keyboardWillHideSub.remove();
        };
    }, []);

    const _keyboardDidShow = (e) => {
        setKeyboardHeight(e.endCoordinates.height);
    };

    const _keyboardDidHide = () => {
        setKeyboardHeight(0);
    };

    const [writtenDiaryDates, setWrittenDiaryDates] = useState([]);
    
    const markedDates = writtenDiaryDates.reduce((acc, date) => {
        acc[date] = { selected: true, marked: true, selectedColor: 'pink' };
        return acc;
    }, {});


    //이미지
    const selectImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const onCancel = () => {
        setTempDate(selectedDate);  // 임시 날짜를 선택된 날짜로 설정
        setShowDatePicker(false);
    };

    const onConfirm = () => {
        setSelectedDate(tempDate);
        setYear(tempDate.getFullYear());
        setMonth(tempDate.getMonth() + 1);
        setDay(tempDate.getDate());
        setDayOfWeek(daysOfWeek[tempDate.getDay()]);
        setShowDatePicker(false);
    };

    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(`${tempYear}-${String(tempMonth).padStart(2, '0')}`);

    return (
        <KeyboardAwareScrollView
            ref={scrollViewRef}
            contentContainerStyle={[styles.container]}
            resetScrollToCoords={{ x: 0, y: 0 }}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        source={require('../../icon/back.png')}
                        style={{
                            width: 50,
                            height: 50,
                            right: 7,
                        }}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={{ right: 6 }} onPress={() => setShowDatePicker(true)}>
                    <Text>{`${year}년 ${month}월 ${day}일`}</Text>
                    <Text>       {dayOfWeek}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => addDiary()}>
                    <Image
                        source={require('../../icon/check.png')}
                        style={{
                            width: 40,
                            height: 40,

                            left: 5,
                        }}
                    />
                </TouchableOpacity>
            </View>


            {showDatePicker && (
                <Modal animationType="slide" transparent={true} visible={showDatePicker}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>

                            <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                <CustomCalendar
                                    onDayPress={(date) => {
                                        const selectedDate = new Date(date.year, date.month - 1, date.day);
                                        today.setHours(0, 0, 0, 0); // 시간을 제외한 날짜만 비교하기 위해 시간을 초기화합니다.

                                        if (selectedDate > today) {
                                            // 선택된 날짜가 오늘이후라면 경고 메시지를 표시하고 함수를 종료합니다.
                                            Alert.alert('알림', '오늘 이후의 날짜는 선택할 수 없습니다.');
                                            return;
                                        }
                                        setTempDate(selectedDate);
                                        setTempYear(selectedDate.getFullYear());
                                        setTempMonth(selectedDate.getMonth() + 1);
                                    }}
                                    currentMonth={currentMonth}
                                    setCurrentMonth={setCurrentMonth}
                                />
                            </View>
                            {/* 변경과 취소 버튼을 감싸는 뷰 */}
                            <View style={{ flexDirection: 'row', backgroundColor: '#FFFF00', borderRadius: 5 }}>
                                {/* 변경 버튼 */}
                                <TouchableOpacity onPress={() => onConfirm()} style={{ marginHorizontal: 10 }}>
                                    <Text style={{ fontSize: 19, color: '#000', fontFamily: 'Dovemayo_gothic' }}>변경</Text>
                                </TouchableOpacity>

                                {/* 취소 버튼 */}
                                <TouchableOpacity onPress={() => onCancel()} style={{ marginHorizontal: 10 }}>
                                    <Text style={{ fontSize: 19, color: '#000', fontFamily: 'Dovemayo_gothic' }}>취소</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}


            <ImageBackground source={require('../../assets/paper.jpg')} style={{ width: '105%', height: '100%' }}>
                <TextInput
                    placeholder="제목을 입력하세요."
                    value={title}
                    style={[styles.inputBox, styles.titleInput]}
                    onChangeText={(title) => setTitle(title)}
                    returnKeyType="next"
                />

                <View style={[styles.inputBox, { flex: 1 }]}>
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        {image && (
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    Alert.alert('이미지 삭제', '이미지를 삭제하시겠습니까?', [
                                        {
                                            text: '아니오',
                                            style: 'cancel',
                                        },
                                        {
                                            text: '예',
                                            onPress: () => {
                                                setImage(null); // 예 를 선택하면 setImage를 null로 설정하여 이미지 제거
                                                Alert.alert('알림', '사진이 삭제되었습니다.'); // 사진이 삭제되었다는 메시지 표시
                                            },
                                        },
                                    ]);
                                }}
                            >
                                <Image
                                    source={{ uri: image }}
                                    resizeMode="cover"
                                    style={[styles.image, { width: 275, height: 275 }]}
                                />
                            </TouchableWithoutFeedback>
                        )}
                    </View>
                    <TextInput
                        ref={inputRef}
                        multiline
                        autoFocus={true}
                        value={content}
                        scrollEnabled={image !== null || content.split('\n').length > 5}
                        placeholder="당신의 오늘을 기록해보세요."
                        onChangeText={(Content) => setContent(Content)}
                        textAlignVertical="top"
                        style={{ fontFamily: 'Dovemayo_gothic' }}
                        onContentSizeChange={(e) => {
                            const numOfLines = content.split('\n').length;
                            if (
                                numOfLines >= 8 ||
                                image !== null ||
                                e.nativeEvent.contentSize.height < textInputHeight
                            ) {
                                scrollViewRef.current.scrollToPosition(0, e.nativeEvent.contentSize.height, true);
                                setTextInputHeight(e.nativeEvent.contentSize.height);
                            }
                        }}
                    />
                    <FAB
                        name="imgselect"
                        style={styles.floattingButton}
                        // icon={() => <EvilIcons name="pencil" size={43} color="white" style={styles.writeicon} />}
                        icon={() => <Image source={require('../../icon/imageselect.png')} style={styles.imgicon} />}
                        onPress={() => selectImage()}
                    />
                </View>
            </ImageBackground>
        </KeyboardAwareScrollView>
    );

    function addDiary() {
        const sendName = userName;
        const sendTitle = title;
        const sendYear = year;
        const sendMonth = month;
        const sendDay = day;
        const sendDayOfWeek = dayOfWeek;
        const sendContent = content;
        const image_path_db = image;
        axios
            .post(address + '/saveDiary', {
                name: sendName,
                title: sendTitle,
                year: sendYear,
                month: sendMonth,
                day: sendDay,
                dayOfWeek: sendDayOfWeek,
                content: sendContent,
                image_path: image_path_db,
            })
            .then((response) => {
                if (response.status === 200) {
                    console.log('일기 저장 완료.');
                    Alert.alert('일기 저장이 완료되었습니다!');
                    navigation.navigate('Home');
                } else {
                    console.error('일기장 저장중 문제생김.');
                    Alert.alert('저장 실패');
                }
            })
            .catch((error) => {
                console.error('일기 보내는 도중 애러.', error);
            });
    }
}

// 스타일 정의
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: 50,
        paddingHorizontal: 10,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    inputBox: { width: '100%', padding: 10, marginBottom: 10, fontFamily: 'Dovemayo_gothic' },
    titleInput: { fontSize: 18, color: '#263238', fontWeight: 'bold', marginBottom: 16, marginTop: 16 },
    bodyInput: { flex: 1, fontSize: 16, color: '#263238' },
    floatingButton: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        bottom: 30,
        backgroundColor: 'gray',
        borderRadius: 30,
    },
    image: {
        height: 200,
        width: 200,
        marginBottom: 30,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    floattingButton: {
        backgroundColor: '#9B9B9B',
        position: 'absolute',
        marginBottom: 80,
        marginEnd: 25,
        borderRadius: 50,
        right: 0,
        bottom: 0,
        width: 50, // 버튼의 너비를 조절합니다.
        height: 50, // 버튼의 높이를 조절합니다.
    },
    imgicon: {
        width: 48,
        height: 48,
        marginEnd: -7,
        right: 11,
        bottom: 13,
    },
});