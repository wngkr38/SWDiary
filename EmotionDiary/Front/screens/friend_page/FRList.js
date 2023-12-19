import { useState, useEffect } from 'react';
import {
    FlatList,
    View,
    Text,
    StyleSheet,
    Button,
    TextInput,
    Alert,
    TouchableOpacity,
    Image,
    ImageBackground,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import { address } from '../global';
import { MaterialCommunityIcons, AntDesign, Feather } from '@expo/vector-icons';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-swipeable';
import { useNavigation } from '@react-navigation/native';

export default function FRList({ userName }) {
    const [want, setWant] = useState('');
    const [friendsList, setFriendsList] = useState([]);
    const [receivedRequestsList, setReceivedRequestsList] = useState([]);
    const [showAddFR, setShowAddFR] = useState(false);
    const navigation = useNavigation(); // 여기로 이동

    useEffect(() => {
        fetchFriendsData();
    }, []);

    function fetchFriendsData() {
        axios
            .post(address + '/getFriends', { nickname: userName }) // 자신의 닉네임 보냄
            .then((response) => {
                if (response.status === 200) {
                    // 성공적으로 응답을 받았을 때
                    const { friends, received_requests } = response.data;
                    setFriendsList(friends);
                    setReceivedRequestsList(received_requests);
                } else {
                    // 응답 실패 시 에러 처리 로직 추가 가능
                }
            })
            .catch((error) => {
                console.error('친구 목록 및 요청을 가져오는 중 오류가 발생했습니다.', error);
            });
    }

    function ClickedAddFR(props) {
        const userNickname = userName; //자신의 닉네임

        const friendNickname = want; // 친추할 닉네임

        setWant('');

        // 서버로 데이터를 전송 (Axios를 사용한 POST 요청)
        axios
            .post(address + '/addFriendRequest', {
                userNickname: userNickname,
                friendNickname: friendNickname,
            })
            .then((response) => {
                if (response.status === 200) {
                    // 성공적으로 요청이 처리되었을 때
                    setWant('');
                    console.log('친구 요청이 성공적으로 전송되었습니다.');
                    Alert.alert('친구 요청 성공');
                } else if (response.status === 400) {
                    setWant('');
                    console.log('존재하지 않는 친구');
                    Alert.alert('존재하지 않는 사용자 입니다.');
                } else {
                    // 요청이 실패했을 때
                    setWant('');
                    console.error('친구 요청을 전송하는 중 오류가 발생했습니다.');
                    Alert.alert('친구 요청 실패');
                }
            })
            .catch((error) => {
                console.error('친구 요청을 전송하는 중 오류가 발생했습니다.', error);
            });
    }

    const renderFriendsList = ({ item }) => {
        //현재 친구 리스트

        const handleDelete = () => {
            Alert.alert(item);

            sendName = userName;
            sendFriendName = item;

            axios
                .post(address + '/deleteFriend', {
                    userNickname: sendName,
                    friendNickname: sendFriendName,
                })
                .then((response) => {
                    if (response.status === 200) {
                        fetchFriendsData();
                        console.log('친구 삭제 요청 보냄.');
                    } else {
                        console.error('친구 삭제을 전송하는 중 오류가 발생했습니다.');
                        Alert.alert('친구 삭제 실패');
                    }
                })
                .catch((error) => {
                    console.error('친구 삭제를 전송하는 중 오류가 발생했습니다.', error);
                });
        };

        return (
            <Swipeable
                rightButtons={[
                    <RectButton
                        useNativeDriver={true}
                        style={{
                            flex: 1,
                            backgroundColor: 'red',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 80,
                        }}
                        onPress={handleDelete}
                    >
                        <Text style={{ color: 'white', fontFamily: 'Dovemayo_gothic' }}>삭제</Text>
                    </RectButton>,
                ]}
            >
                <TouchableOpacity onPress={() => pressList(item)} style={{ paddingVertical: 16 }}>
                    <View>
                        <Text
                            style={{ fontWeight: 'bold', fontSize: 18, fontFamily: 'Dovemayo_gothic', marginStart: 15 }}
                        >
                            {item}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View
                    style={{
                        borderBottomColor: 'gray',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        marginTop: 8,
                    }}
                />
            </Swipeable>
        );
    };

    function pressList(item) {
        navigation.navigate('FriendDiaryList', { friendNickname: item, userName: userName });
    }

    const renderReceivedRequestsList = ({ item }) => {
        // 받은 요청, 친구 추가

        const handleDelete = () => {
            //친구 요청 삭제
            Alert.alert(item);

            sendName = userName;
            sendFriendName = item;

            axios
                .post(address + '/deleteRequestFriend', {
                    userNickname: sendName,
                    friendNickname: sendFriendName,
                })
                .then((response) => {
                    if (response.status === 200) {
                        fetchFriendsData();
                        console.log('받은 친구 요청 삭제.');
                    } else {
                        console.error('받은 친구 요청 삭제 실패');
                    }
                })
                .catch((error) => {
                    console.error('받은 친구 요청 삭제를 전송하는 중 오류가 발생했습니다.', error);
                });
        };

        const handleAccept = () => {
            // 친구 요청 수락
            Alert.alert(item);

            sendName = userName;
            sendFriendName = item;

            axios
                .post(address + '/AcceptRequestFriend', {
                    userNickname: sendName,
                    friendNickname: sendFriendName,
                })
                .then((response) => {
                    if (response.status === 200) {
                        fetchFriendsData();
                        console.log('받은 친구 요청 허용.');
                    } else {
                        console.error('받은 친구 요청 허용을 전송하는 중 오류가 발생했습니다.');
                    }
                })
                .catch((error) => {
                    console.error('받은 친구 요청 허용을 전송하는 중 오류가 발생했습니다.', error);
                });
        };
        return (
            <Swipeable
                rightButtons={[
                    <RectButton
                        useNativeDriver={true} // 또는 true로 설정하세요.
                        style={{
                            flex: 1,
                            backgroundColor: 'gray',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 80,
                            fontFamily: 'Dovemayo_gothic',
                        }}
                        onPress={handleAccept}
                    >
                        <Text style={{ color: 'white', fontFamily: 'Dovemayo_gothic' }}>수락</Text>
                    </RectButton>,
                    <RectButton
                        useNativeDriver={true} // 또는 true로 설정하세요.
                        style={{
                            flex: 1,
                            backgroundColor: 'red',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 80,
                        }}
                        onPress={handleDelete}
                    >
                        <Text style={{ color: 'white', fontFamily: 'Dovemayo_gothic' }}>삭제</Text>
                    </RectButton>,
                ]}
            >
                <View style={{ borderTopWidth: 1 }}></View>
                <TouchableOpacity>
                    <View style={{ padding: 16 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, fontFamily: 'Dovemayo_gothic' }}>{item}</Text>
                    </View>
                    <View
                        style={{
                            borderBottomColor: 'gray',
                            borderTopWidth: 1,
                        }}
                    />
                </TouchableOpacity>
            </Swipeable>
        );
    };

    return (
        <View style={styles.container}>
            {showAddFR ? (
                addFR()
            ) : (
                <>
                    <View style={styles.headerContainer}>
                        <Text style={styles.titleText}>친구 목록</Text>
                        <View style={styles.iconContainer}>
                            <TouchableOpacity onPress={() => setShowAddFR(true)}>
                                <Image
                                    source={require('../../icon/heatmanplus.png')}
                                    style={{
                                        width: 45,
                                        height: 45,
                                    }}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => fetchFriendsData()}>
                                <Image
                                    source={require('../../icon/reloading.png')}
                                    style={{
                                        width: 45,
                                        height: 45,
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ImageBackground
                        source={require('../../assets/paper.jpg')}
                        style={{ width: '100%', height: '100%', backgroundColor: '#f4f4f4' }}
                    >
                        <View>
                            <FlatList
                                data={friendsList}
                                renderItem={renderFriendsList}
                                keyExtractor={(item, index) => index.toString()} // 고유한 키 값으로 설정해야 합니다.
                            />
                        </View>
                    </ImageBackground>
                </>
            )}
        </View>
    );
    function addFR() {
        return (
            <>
                <View>
                    <View style={styles.headerContainer}>
                        <Text style={styles.titleText}>친구 관리</Text>
                        <View style={styles.iconContainer}>
                            <TouchableOpacity onPress={() => setShowAddFR(false)}>
                                <Image
                                    source={require('../../icon/heatman.png')}
                                    style={{
                                        width: 45,
                                        height: 45,
                                    }}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => fetchFriendsData()}>
                                <Image
                                    source={require('../../icon/reloading.png')}
                                    style={{
                                        width: 45,
                                        height: 45,
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <ImageBackground
                    source={require('../../assets/paper.jpg')}
                    style={{ width: '100%', height: '100%', backgroundColor: '#f4f4f4' }}
                >
                    <View style={styles.friText}>
                        <TextInput
                            style={{ ...styles.textInput, fontSize: 18 }}
                            onChangeText={(text) => setWant(text)}
                            placeholder="친구 닉네임"
                            onBlur={() => Keyboard.dismiss()}
                        />

                        <TouchableOpacity onPress={ClickedAddFR} style={{ alignItems: 'flex-end' }}>
                            <Image
                                source={require('../../icon/friendplus.png')}
                                style={{
                                    width: 50,
                                    height: 50,
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={{ marginStart: 5, marginBottom: 15 }}>받은 친구 요청</Text>
                    <View>
                        <FlatList
                            data={receivedRequestsList}
                            renderItem={renderReceivedRequestsList}
                            keyExtractor={(item, index) => index.toString()} // 고유한 키 값으로 설정해야 합니다.
                        />
                    </View>
                </ImageBackground>
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',

        marginTop: 10,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 40,
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '15%',
        alignItems: 'center',
        marginEnd: 40,
    },
    listContainer: {
        marginTop: 10,
        borderTopWidth: 0.5,
        borderTopColor: '#d6d7da',
    },
    textInput: {
        width: '85%',
        borderColor: '#d6d7da',
        borderRadius: 4,
        paddingVertical: 8,
        marginHorizontal: 3,
        marginStart: 4,
        fontFamily: 'Dovemayo_gothic',
    },
    titleText: {
        paddingStart: 20,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Dovemayo_gothic',
    },
    friText: {
        flexDirection: 'row',
        marginBottom: 5,
        borderWidth: 1,
        marginHorizontal: 3,
        borderRadius: 10,
        paddingHorizontal: 7,
        backgroundColor: 'white',
    },
});
