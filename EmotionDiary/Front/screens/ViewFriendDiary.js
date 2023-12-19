import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import {
    ScrollView,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    View,
    Text,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
} from 'react-native';
import { address } from './global';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import moment from 'moment/min/moment-with-locales.min';

export default function ViewFriendDiary({ route }) {
    const [diaries, setDiaries] = useState([]); //서버에서 받아온 배열
    const [id, setId] = useState(''); // 친구 다이어리 아이디
    const [name, setName] = useState(''); //친구 이름
    const [title, setTitle] = useState(''); // 제목
    const [content, setContent] = useState(''); // 내용
    const [date, setDate] = useState(''); // 날짜
    const [dayOfWeek, setDayOfWeek] = useState(''); // 요일
    const [image, setImage_path] = useState(null); //이미지
    const [dateString, setDateString] = useState(''); // 날짜 문자열

    const [comment_id, setComment_id] = useState(); // 댓글 아이디
    const [comment, setComment] = useState(''); // 댓글 입력을 위한 상태 변수
    const [comment_user, setComment_user] = useState(''); //댓글 남긴 사람들 닉네임
    const [comments, setComments] = useState([]); //댓글 배열
    const [comment_content, setComment_content] = useState(''); // 받아온 댓글
    const [dateTime, setDateTime] = useState('');
    const { userName } = route.params; //내 닉네임
    const [isModalVisible, setModalVisible] = useState(false); // 모달 보이기/숨기기를 위한 상태 변수
    const inputRef = useRef(null); //키보드 동작을 위함
    const [isReplying, setIsReplying] = useState(false);

    const [replies, setReplies] = useState([]); //대댓글
    const [r_id, setR_id] = useState(''); // 대댓글 아이디
    const [r_comment_id, setR_comment_id] = useState(''); //댓글 아이디
    const [r_user_name, setR_user_name] = useState(''); // 대댓글 남긴 사람 이름
    const [r_to_user, setR_to_user] = useState(''); //대댓글을 받은 사람 이름
    const [r_dateTime, setR_dateTime] = useState(''); //대댓글 남긴 시간

    const [showReplies, setShowReplies] = useState({});

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

    const navigation = useNavigation();

    useEffect(() => {
        fetchDiaries();
    }, []);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    let dateObj = new Date(dateString);
    let year = dateObj.getFullYear();
    let month = dateObj.getMonth() + 1;
    let day = dateObj.getDate();

    return (
        <>
            <ScrollView
                contentContainerStyle={styles.container}
                onScroll={() => Keyboard.dismiss()}
                scrollEventThrottle={16}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image
                            source={require('../icon/back.png')}
                            style={{
                                width: 50,
                                height: 50,
                                right: 7,
                            }}
                        />
                    </TouchableOpacity>
                    <View style={{ marginTop: 10, right: 6, fontFamily: 'Dovemayo_gothic' }}>
                        <Text>{`${year}년 ${month}월 ${day}일`}</Text>
                        <Text>{dayOfWeek}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={async () => {
                            await Promise.all([fetchCommentsAsync(), fetchRepliesAsync()]);
                            toggleModal();
                        }}
                        style={{ left: 7 }}
                    >
                        <Image
                            source={require('../icon/reply.png')}
                            style={{
                                width: 50,
                                height: 50,
                                right: 7,
                            }}
                        />
                    </TouchableOpacity>
                </View>

                <TextInput
                    value={title}
                    style={[styles.inputBox, styles.titleInput]}
                    onChangeText={(text) => setTitle(text)}
                    returnKeyType="next"
                    editable={false}
                />

                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {image && (
                        <Image
                            source={{ uri: image }}
                            resizeMode="cover"
                            style={[styles.image, { width: 250, height: 250 }]}
                        />
                    )}
                </View>
                <TextInput
                    multiline
                    value={content}
                    style={[styles.inputBox, styles.bodyInput]}
                    onChangeText={(text) => setContent(text)}
                    textAlignVertical="top"
                    editable={false}
                />

                {/* 댓글 작성 모달 */}
                <Modal
                    isVisible={isModalVisible}
                    onBackdropPress={toggleModal}
                    style={{ justifyContent: 'flex-end', margin: 0, fontFamily: 'Dovemayo_gothic' }}
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
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        paddingTop: 5,
                                                    }}
                                                >
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
                                                            <View style={{ paddingTop: 10 }}>
                                                                <Text>
                                                                    {'             '}{reply.user_name}: {reply.reply}
                                                                </Text>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 5 }}>
                                                                    <Text style={{ fontSize: 12, marginRight: 10 }}>
                                                                        {'               '}{`${moment(reply.dateTime, 'YYYY-MM-DD HH:mm:ss')
                                                                            .locale('ko')
                                                                            .fromNow()}`}
                                                                    </Text>
                                                                    {reply.user_name === userName && (
                                                                        <TouchableOpacity onPress={() => deleteReply(reply.id)}>
                                                                            <Text style={{ color: "red" }}>삭제</Text>
                                                                        </TouchableOpacity>
                                                                    )}
                                                                </View>
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
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: '#000',
                                }}
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
            </ScrollView>
        </>
    );

    async function writeReply(to_user, reply) {
        //대댓글 작성
        const newReply = {
            friend_diary_id: id, //다이어리 아이디 (필수)
            comment_id: comment_id, //댓글 아이디
            friend_name: name, // 친구 이름
            user_name: userName, // 내이름
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


    async function writeComment() {
        //댓글 쓰기
        const newComment = {
            id: id,
            name: name,
            user_name: userName,
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
        try {
            const response = await axios.post(address + '/fetchComments', { id: id, name: name, title: title });
            if (response.status === 200) {
                const { comments } = response.data;
                setComments(comments);

                if (comments.length > 0) {
                    setComment_id(comments[0].id);
                    setTitle(comments[0].title);
                    setComment_user(comments[0].user_name);
                    setDateTime(comments[0].dateTime);
                    setComment_content(comments[0].comment);
                }
            } else {
                console.error("Failed to get the comments.");
            }
        } catch (error) {
            console.error("An error occurred while requesting comment data.", error);
        }
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
                    setReplies([]);
                }
            })
            .catch((error) => {
                console.error('대댓글 데이터 요청 중 오류가 발생했습니다.', error);
            });
    }

    function fetchDiaries() {
        //다이어리 가져오기
        const { id, name } = route.params;
        axios
            .post(address + '/editDiary', {
                name: name,
                id: id,
            })
            .then((response) => {
                if (response.status === 200) {
                    // 성공적으로 응답을 받았을 때
                    const { diaries } = response.data;
                    setDiaries(diaries);

                    // title과 content 값 설정
                    if (diaries.length > 0) {
                        setId(diaries[0].id); // 친구 다이어리 아이디
                        setName(diaries[0].name); //친구 이름
                        setTitle(diaries[0].title); //친구 제목
                        setContent(diaries[0].content);
                        setDate(diaries[0].date);
                        setDayOfWeek(diaries[0].dayOfWeek);
                        setImage_path(diaries[0].image_path);
                        setDateString(diaries[0].date); // 추가된 코드
                    }
                } else {
                    console.error('일기 데이터를 가져오지 못했습니다.');
                }
            })
            .catch((error) => {
                console.error('일기 데이터 요청 중 오류가 발생했습니다.', error);
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
    inputBox: {
        borderWidth: 1,
        borderColor: '#263238',
        borderRadius: 5,
        width: '100%',
        padding: 10,
        marginBottom: 10,
        fontFamily: 'Dovemayo_gothic',
    },
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
});
