import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import {
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Keyboard,
    View,
    Alert,
    Image,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    FlatList,
    ImageBackground,
} from 'react-native';
import { address } from './global';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import Modal from 'react-native-modal';
import moment from 'moment/min/moment-with-locales.min';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function ViewDiary({ route }) {
    const [isAdditionalButtonsVisible, setAdditionalButtonsVisible] = useState(false);
    const slideAnim = new Animated.Value(0);
    const handlePress = async () => {
        setIsButtonsVisible(!isButtonsVisible);
        setEdit(false); // 수정 버튼을 누르면 edit 상태를 초기화합니다.
    };
    const [diaries, setDiaries] = useState([]); //서버에서 받아온 배열
    const [id, setId] = useState(''); // 친구 다이어리 아이디
    const [name, setName] = useState(''); //친구 이름
    const [title, setTitle] = useState(''); // 제목
    const [content, setContent] = useState(''); // 내용
    const [showAdditionalButtons, setShowAdditionalButtons] = useState(false);
    const [isButtonsVisible, setIsButtonsVisible] = useState(false);
    const [lock_state, setLock_state] = useState('');

    const [showModal, setShowModal] = useState(false); //모달 클릭
    const [edit, setEdit] = useState(false); // 수정

    const [image, setImage] = useState(null);

    const scrollViewRef = useRef(); //스크롤 뷰 참조 생성
    const inputRef = useRef(); // TextInput 참조 생성
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [textInputHeight, setTextInputHeight] = useState(0);

    const [comment_id, setComment_id] = useState(); // 댓글 아이디
    const [comment, setComment] = useState(''); // 댓글 입력을 위한 상태 변수
    const [comment_user, setComment_user] = useState(''); //댓글 남긴 사람들 닉네임
    const [comments, setComments] = useState([]); //댓글 배열
    const [comment_content, setComment_content] = useState(''); // 받아온 댓글
    const [dateTime, setDateTime] = useState('');
    const { userName } = route.params; //내 닉네임
    const [isReplying, setIsReplying] = useState(false);

    const [replies, setReplies] = useState([]); //대댓글
    const [r_id, setR_id] = useState(''); // 대댓글 아이디
    const [r_comment_id, setR_comment_id] = useState(''); //댓글 아이디
    const [r_user_name, setR_user_name] = useState(''); // 대댓글 남긴 사람 이름
    const [r_to_user, setR_to_user] = useState(''); //대댓글을 받은 사람 이름
    const [r_dateTime, setR_dateTime] = useState(''); //대댓글 남긴 시간

    const [isModalVisible, setModalVisible] = useState(false); // 모달 보이기/숨기기를 위한 상태 변수

    const [showReplies, setShowReplies] = useState({});

    const [isChevronClicked, setChevronClicked] = useState(false);

    const [isLockStateLoaded, setIsLockStateLoaded] = useState(false);

    let now = new Date();
    {
        /* "2023-10-08 19:18:41"  이런식으로 저장 */
    }
    let formattedDateTime =
        now.getFullYear() +
        '-' +
        String(now.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(now.getDate()).padStart(2, '0') +
        ' ' +
        String(now.getHours()).padStart(2, '0') +
        ':' +
        String(now.getMinutes()).padStart(2, '0') +
        ':' +
        String(now.getSeconds()).padStart(2, '0');

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

    const handleEditPress = () => {
        setShowModal(true);
    };

    const handleConfirm = () => {
        setEdit(true);
        setShowModal(false);
        // 추가적인 로직 수행
    };

    const handleCancel = () => {
        setShowModal(false);
    };


    const navigation = useNavigation();
    useEffect(() => {
        fetchDiaries();
    }, []);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    async function writeReply(to_user, reply) {
        //대댓글 작성
        const newReply = {
            friend_diary_id: id, //다이어리 아이디 (필수)
            comment_id: comment_id, //댓글 아이디
            friend_name: name, // 친구 이름
            user_name: name, // 내이름
            to_user: to_user, // 대댓글을 받을 유저 이름
            reply: reply, //대댓글
            dateTime: formattedDateTime, //남긴 시간
            title: title, // 제목
        };
        try {
            const response = await axios.post(address + '/writeReply', newReply);

            if (response.status === 200) {
                console.log('대댓글 저장 완료.');

                // 작성한 댓글 내용 초기화
                setComment('');
                setIsReplying(false);

                fetchRepliesAsync();
            } else {
                console.error('대댓글 저장중 문제생김.');
                Alert.alert('저장 실패');
            }
        } catch (error) {
            console.error('대댓글 보내는 도중 애러.', error);
        }
    }

    async function writeComment() {
        //댓글 쓰기
        const newComment = {
            id: id,
            name: name,
            user_name: name,
            title: title,
            comment: comment,
            dateTime: formattedDateTime,
            check: 'unread',
        };
        try {
            const response = await axios.post(address + '/writeComment', newComment);
            if (response.status === 200) {
                console.log('댓글 저장 완료.');

                // 서버 요청 성공 후 comments 상태 업데이트
                setComments((prevComments) => [...prevComments, newComment]);

                // 작성한 댓글 내용 초기화
                setComment('');
            } else {
                console.error('댓글 저장중 문제생김.');
                Alert.alert('저장 실패');
            }
        } catch (error) {
            console.error('댓글 보내는 도중 애러.', error);
        }
    }

    async function fetchCommentsAsync() {
        //댓글 읽어오기
        return axios
            .post(address + '/fetchComments', {
                id: id, //다이어리 아이디
                name: name, //친구 이름
                title: title, //친구 다이어리 이름
            })
            .then((response) => {
                if (response.status === 200) {
                    // 성공적으로 응답을 받았을 때
                    const { comments } = response.data;
                    setComments(comments);

                    // title과 content 값 설정
                    if (comments.length > 0) {
                        setComment_id(comments[0].id); // 댓글 아이디
                        setTitle(comments[0].title); //친구 제목
                        setComment_user(comments[0].user_name); //댓글쓴 사람들 이름
                        setDateTime(comments[0].dateTime); // 추가된 코드
                        setComment_content(comments[0].comment); //남긴 댓글들
                    }
                } else {
                    console.error('댓글 데이터를 가져오지 못했습니다.');
                }
            })
            .catch((error) => {
                console.error('댓글 데이터 요청 중 오류가 발생했습니다.', error);
            });
    }

    async function fetchRepliesAsync() {
        //대댓글 읽어오기
        return axios
            .post(address + '/fetchReplies', {
                friend_diary_id: id, //다이어리 아이디
                friend_name: name, //친구 이름
            })
            .then((response) => {
                if (response.status === 200) {
                    // 성공적으로 응답을 받았을 때
                    const { replies } = response.data;
                    setReplies(replies);

                    // title과 content 값 설정
                    if (replies.length > 0) {
                        setR_id(replies[0].id); // 대댓글 아이디
                        setR_comment_id(replies[0].comment_id); //댓글 아이디
                        setR_user_name(replies[0].user_name); //대댓글쓴 사람들 이름
                        setR_to_user(replies[0].to_user); // 추가된 코드
                        setR_dateTime(replies[0].dateTime); //남긴 댓글들
                    }
                } else {
                    console.error('대댓글 데이터를 가져오지 못했습니다.');
                }
            })
            .catch((error) => {
                console.error('대댓글 데이터 요청 중 오류가 발생했습니다.', error);
            });
    }

    function deleteDiary() {

        axios
            .post(address + '/deleteDiary', {
                id: id,
                name: name,
            })
            .then((response) => {
                if (response.status === 200) {
                    // 성공적으로 응답을 받았을 때
                    fetchDiaries(); // 삭제 후 일기 데이터를 다시 가져오도록 fetchDiaries 함수 호출
                    navigation.navigate('Home');

                } else {
                    console.error('일기 데이터를 가져오지 못했습니다.');
                }
            })
            .catch((error) => {
                console.error('일기 데이터 요청 중 오류가 발생했습니다.', error);
            });

    }

    return (
        <KeyboardAwareScrollView
            ref={scrollViewRef}
            contentContainerStyle={[styles.container]}
            resetScrollToCoords={{ x: 0, y: 0 }}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        source={require('../icon/back.png')}
                        style={{
                            width: 50,
                            height: 50,
                        }}
                    />
                </TouchableOpacity>
                <View style={[styles.row, styles.buttonsContainer]}>
                    {/* 조건부 렌더링을 통해 수정, 삭제, 추가 버튼 표시 여부 조절 */}
                    {isChevronClicked && edit ? (
                        <TouchableOpacity
                            onPress={() => {
                                editDiary();
                                Alert.alert('수정 완료');
                                navigation.goBack();
                            }}
                        >
                            <Image
                                source={require('../icon/check.png')}
                                style={{
                                    width: 40,
                                    height: 40,
                                }}
                            />

                            <TouchableOpacity onPress={() => {
                                setLock_state(prevState => prevState === 'unlock' ? 'lock' : 'unlock');
                            }}>
                                {lock_state === 'unlock' ? (
                                    <Image
                                        source={require('../icon/unlock.png')}
                                        style={{
                                            width: 55,
                                            height: 50,
                                            left: 5,
                                        }}
                                    />
                                ) : (
                                    <Image
                                        source={require('../icon/lock.png')}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            left: 5,
                                        }}
                                    />
                                )}
                            </TouchableOpacity>
                        </TouchableOpacity>

                    ) : null}
                    <Modal visible={showModal} animationType="slide" transparent={true}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: '#fff', padding: 20 }}>
                                {/* 모달 내용 */}
                                <Text>수정하시겠습니까?</Text>

                                {/* 변경과 취소 버튼 */}
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                                    {/* 변경 버튼 */}
                                    <TouchableOpacity onPress={handleConfirm} style={{ marginRight: 10 }}>
                                        <Text>변경</Text>
                                    </TouchableOpacity>

                                    {/* 취소 버튼 */}
                                    <TouchableOpacity onPress={handleCancel}>
                                        <Text>취소</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    {isChevronClicked && !edit ? (
                        <Animatable.View animation="slideInRight" style={{ marginRight: 50 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    Alert.alert('수정');
                                    setEdit(true);
                                    setShowModal(true);
                                    setShowAdditionalButtons(false);
                                }}
                            >
                                <Image
                                    source={require('../icon/pen.png')}
                                    style={{
                                        width: 50,
                                        height: 50,
                                    }}
                                />
                            </TouchableOpacity>
                        </Animatable.View>
                    ) : null}

                    {isChevronClicked && !edit ? (
                        <Animatable.View animation="slideInRight" style={{ marginRight: 0 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    deleteDiary();
                                    Alert.alert('삭제');
                                    setShowModal(true);
                                    setShowAdditionalButtons(false);
                                }}
                            >
                                <Image
                                    source={require('../icon/trash.png')}
                                    style={{
                                        width: 50,
                                        height: 50,
                                    }}
                                />
                            </TouchableOpacity>
                        </Animatable.View>
                    ) : null}
                    {isChevronClicked && !edit ? (
                        <Animatable.View animation="slideInRight" style={{ marginRight: 0 }}>
                            <TouchableOpacity
                                onPress={async () => {
                                    await Promise.all([fetchCommentsAsync(), fetchRepliesAsync()]);
                                    toggleModal();
                                }}
                            >
                                <Image
                                    source={require('../icon/reply.png')}
                                    style={{
                                        width: 50,
                                        height: 50,
                                    }}
                                />
                            </TouchableOpacity>
                        </Animatable.View>
                    ) : null}

                    {!edit ? (
                        <TouchableOpacity
                            onPress={() => {
                                setChevronClicked(!isChevronClicked); // chevron 버튼 클릭 상태 토글
                                setShowModal(true);
                                setShowAdditionalButtons(false);
                            }}
                        >
                            <Image
                                source={require('../icon/fill_tri.png')}
                                style={{
                                    width: 35,
                                    height: 35,
                                }}
                            />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
            <ImageBackground
                source={require('../assets/paper.jpg')}
                style={{ width: '105%', height: '100%', backgroundColor: '#f4f4f4' }}
            >
                <TextInput
                    placeholder="제목을 입력하세요."
                    value={title}
                    style={[styles.inputBox, styles.titleInput]}
                    onChangeText={(text) => setTitle(text)}
                    returnKeyType="next"
                    editable={edit}
                    readonly={!edit}
                />

                <View style={styles.inputBox} flex={1}>
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        {image && (
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    if (edit) {
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
                                    }
                                }}
                            >
                                <Image
                                    source={{ uri: image }}
                                    resizeMode="cover"
                                    style={[styles.image, { width: 275, height: 275 }]}
                                    editable={edit}
                                    readonly={!edit}
                                />
                            </TouchableWithoutFeedback>
                        )}
                    </View>
                    <TextInput
                        editable={edit}
                        readonly={!edit}
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
                </View>
            </ImageBackground>
            {/* 댓글 작성 모달 */}
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={toggleModal}
                style={{ justifyContent: 'flex-end', margin: 0 }}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 20, height: '90%' }}>
                        {/* 확인 버튼 */}
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <TouchableOpacity
                                onPress={() => {
                                    toggleModal();
                                }}
                            >
                                <Image
                                    source={require('../icon/xx.png')}
                                    style={{
                                        width: 50,
                                        height: 50,
                                        bottom: 10,
                                        opacity: 0.7,
                                        left: 10,
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                        {/* 댓글 리스트 */}
                        <FlatList
                            data={comments}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => {
                                const relatedReplies = replies.filter((reply) => reply.comment_id === item.id);
                                return (
                                    <View>
                                        <View style={{ paddingTop: 10 }}>
                                            <Text
                                                style={{
                                                    fontWeight: 'bold',
                                                    fontSize: 18,
                                                    fontFamily: 'Dovemayo_gothic',
                                                }}
                                            >
                                                {`${item.user_name}: ${item.comment} `}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 5 }}>
                                                <Text style={{ fontSize: 12, fontFamily: 'Dovemayo_gothic' }}>
                                                    {`${moment(item.dateTime, 'YYYY-MM-DD HH:mm:ss')
                                                        .locale('ko')
                                                        .fromNow()}`}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setComment(`@${item.user_name} `);
                                                        inputRef.current.focus();
                                                        setIsReplying(true);
                                                        setComment_id(item.id);
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontWeight: 'bold',
                                                            fontSize: 12,
                                                            paddingLeft: 10,
                                                            fontFamily: 'Dovemayo_gothic',
                                                        }}
                                                    >
                                                        답글 달기
                                                    </Text>
                                                </TouchableOpacity>
                                                {item.user_name === userName && (
                                                    <TouchableOpacity onPress={() => deleteComment(item.id)}>
                                                        <Text style={{ color: "red", marginLeft: 10 }}>삭제</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                            {/* 답글 개수가 1 이상일 때만 'x개의 답글 보기' 표시 */}
                                            {relatedReplies.length > 0 && (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setShowReplies((prevState) => ({
                                                            ...prevState,
                                                            [item.id]: !prevState[item.id],
                                                        }));
                                                    }}
                                                >
                                                    <Text style={{ paddingTop: 5, fontFamily: 'Dovemayo_gothic' }}>
                                                        ------- {relatedReplies.length}개의 답글 보기
                                                    </Text>
                                                </TouchableOpacity>
                                            )}

                                            {/* 해당 댓글의 showReplies 값이 true일 때만 대댓글 목록 출력 */}
                                            {showReplies[item.id] && (
                                                <FlatList
                                                    data={relatedReplies}
                                                    keyExtractor={(reply, index) => index.toString()}
                                                    renderItem={({ item: reply }) => (
                                                        <View style={{ paddingTop: 7, paddingLeft: 43 }}>
                                                            <Text style={{ fontFamily: 'Dovemayo_gothic' }}>
                                                                {reply.user_name}: {reply.reply}
                                                            </Text>
                                                            <Text
                                                                style={{ fontSize: 12, fontFamily: 'Dovemayo_gothic' }}
                                                            >
                                                                {`${moment(reply.dateTime, 'YYYY-MM-DD HH:mm:ss')
                                                                    .locale('ko')
                                                                    .fromNow()}`}
                                                            </Text>
                                                            {reply.user_name === userName && (
                                                                <TouchableOpacity onPress={() => deleteReply(reply.id)}>
                                                                    <Text style={{ color: "red" }}>삭제</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    )}
                                                />
                                            )}
                                        </View>

                                        <View
                                            style={{
                                                borderBottomColor: 'gray',
                                                borderBottomWidth: 1,
                                                marginTop: 8,
                                            }}
                                        />
                                    </View>
                                );
                            }}
                        />

                        {/* 댓글 작성 */}
                        <View
                            style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#000' }}
                        >
                            <TextInput
                                ref={inputRef}
                                value={comment}
                                onChangeText={(text) => setComment(text)}
                                placeholder="댓글을 입력하세요..."
                                returnKeyType="done"
                                autoFocus={true}
                                style={{ flex: 1, borderRadius: 20, fontFamily: 'Dovemayo_gothic' }} // Add this line to make TextInput take the remaining space
                            />

                            <TouchableOpacity
                                onPress={async () => {
                                    if (isReplying && comment.startsWith('@')) {
                                        const replyText = comment.slice(1); // '@' 제거한 텍스트 추출
                                        const parts = replyText.split(' '); //'공백' 기준으로 문자열 분리

                                        if (parts.length >= 2) {
                                            await writeReply(parts[0], parts.slice(1).join(' '));
                                        }
                                        fetchCommentsAsync();
                                    } else {
                                        await writeComment();
                                        fetchCommentsAsync();
                                    }
                                }}
                            >
                                <Image
                                    source={require('../icon/up_arrow.png')}
                                    style={{
                                        width: 40,
                                        height: 40,
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>

            </Modal>
            {isChevronClicked && edit ? (
                <TouchableOpacity style={styles.floatingButton} onPress={() => selectImage()}>
                    <Image
                        source={require('../icon/imageselect.png')}
                        style={{
                            width: 60,
                            height: 60,
                            left: 5,
                            top: 1,
                        }}
                    />
                </TouchableOpacity>
            ) : null}

        </KeyboardAwareScrollView>

    );

    async function deleteReply(replyId) {
        try {
            const response = await axios.post(address + '/deleteReply', {
                id: replyId,
            });

            if (response.status === 200) {
                console.log('대댓글 삭제 완료.');
                setReplies((prevComments) => prevComments.filter((reply) => reply.id !== replyId));
            } else {
                console.error('대댓글 삭제 중 문제 발생.');
                Alert.alert('삭제 실패');
            }
        } catch (error) {
            console.error('대댓글 삭제 요청 중 오류 발생.', error);
        }
    }

    async function deleteComment(commentId) {
        try {
            const response = await axios.post(address + '/deleteComment', {
                id: commentId,
            });

            if (response.status === 200) {
                console.log('댓글 삭제 완료.');
                setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
            } else {
                console.error('댓글 삭제 중 문제 발생.');
                Alert.alert('삭제 실패');
            }
        } catch (error) {
            console.error('댓글 삭제 요청 중 오류 발생.', error);
        }
    }

    function editDiary() {
        const sendName = userName;
        const sendId = id
        const sendTitle = title;
        const sendContent = content;
        const image_path_db = image;
        const lock_state2 = lock_state;

        // 먼저 감정 분석 API에 내용을 전송합니다.
        axios.post(`http://116.125.97.34:9090/getSentiment`, { content: content })
            .then(response => {

                let sentimentResult = response.data;
                console.log("결과 ", sentimentResult);
                console.log("감정 값: ", sentimentResult.index);
                const eIndex = sentimentResult.index;
                let inputIndex = null;
                console.log("유사 코사인값: ", sentimentResult.max_cos);
                if (eIndex >= 0 && eIndex < 10) {
                    inputIndex = 1;  //기쁨
                } else if (eIndex >= 10 && eIndex < 20) {
                    inputIndex = 2; //당황
                } else if (eIndex >= 20 && eIndex < 30) {
                    inputIndex = 3; //분노
                } else if (eIndex >= 30 && eIndex < 40) {
                    inputIndex = 4; //불안
                } else if (eIndex >= 40 && eIndex < 50) {
                    inputIndex = 5; //상처받은
                } else if (eIndex >= 50 && eIndex < 60) {
                    inputIndex = 6; //슬픔
                } else {
                    inputIndex = 7; //평온(기본)
                }
                return axios.post(address + '/editDiary2', {
                    id: sendId,
                    name: sendName,
                    title: sendTitle,
                    content: sendContent,
                    image_path: image_path_db,
                    emotion_index: inputIndex,
                    lock_state: lock_state2,
                });
            })
            .then(response => {
                if (response.status === 200) {
                    console.log('일기 저장 완료.');
                    Alert.alert('일기 저장이 완료되었습니다!');
                    navigation.navigate('Home');
                } else {
                    console.error('일기장 저장중 문제생김.');
                    Alert.alert('저장 실패')
                }
            })
            .catch(error => {
                console.error('일기 보내는 도중 에러.', error);
            });
    }

    async function fetchDiaries() {
        const { id, name } = route.params;
        try {
            const response = await axios.post(address + '/editDiary', {
                name: name,
                id: id,
            });
            if (response.status === 200) {
                const { diaries } = response.data;
                setDiaries(diaries);
                console.log("123", diaries[0]);
                if (diaries.length > 0) {
                    setId(diaries[0].id);
                    setName(diaries[0].name);
                    setTitle(diaries[0].title);
                    setContent(diaries[0].content);
                    setImage(diaries[0].image_path);

                    setLock_state(diaries[0].lock_state);
                    setIsLockStateLoaded(true);
                }
                console.log('가졍ㄹ때 시발 람 : ', lock_state)
            } else {
                console.error('일기 데이터를 가져오지 못했습니다.');
            }
        } catch (error) {
            console.error('일기 데이터 요청 중 오류가 발생했습니다.', error);
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: 50,
        paddingHorizontal: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
    },
    buttonsContainer: {
        alignItems: 'center',
    },
    inputBox: {
        borderWidth: 0,
        borderColor: '#263238',
        borderRadius: 5,
        width: '97%',
        padding: 10,
        marginBottom: 10,
        marginEnd: 5,
        marginStart: 5,
        fontFamily: 'Dovemayo_gothic',
    },
    titleInput: {
        fontSize: 18,
        color: '#263238',
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 16,
        fontFamily: 'Dovemayo_gothic',
    },
    bodyInput: {
        flex: 1,
        fontSize: 16,
        color: '#263238',
        fontFamily: 'Dovemayo_gothic',
    },
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
    modalContainer: {
        position: 'absolute',
        top: 50,
        left: -120,
        backgroundColor: '#fff',
        borderRadius: 5,
        elevation: 5,
    },
    modalLeft: {
        left: -80,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    image: {
        height: 250,
        width: 250,
    },
});
