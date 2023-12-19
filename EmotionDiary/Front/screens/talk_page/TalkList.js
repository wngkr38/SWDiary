import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { SwipeListView } from 'react-native-swipe-list-view';
import { address } from '../global';
import { MaterialCommunityIcons, AntDesign, Feather } from '@expo/vector-icons';
import { List } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import TalkRoom from '../talk_page/TalkRoom';
import { useNavigation } from '@react-navigation/native'; // navigation을 사용하기 위해 추가
import { Ionicons } from '@expo/vector-icons';

const handlePressBack = (navigation) => {
    navigation.goBack();
};

function TalkList({}) {
    const navigation = useNavigation(); // navigation 객체 가져오기

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.back} onPress={() => handlePressBack(navigation)}>
                <Ionicons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>
            <Text>TalkList 화면</Text>
            <TouchableOpacity style={styles.toDo} onPress={() => navigation.navigate('TalkRoom')}>
                <Text style={styles.toDoText}>1번 톡방</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    list: {
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },

    toDo: {
        justifyContent: 'center',
        backgroundColor: 'grey',
        alignItems: 'center',
        marginBottom: 10,
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 15,
        width: 150, // 버튼의 너비를 조절합니다.
        height: 70,
    },
    toDoText: {
        color: 'white', // 텍스트 색상 추가
    },
    back: {
        backgroundColor: 'transparent',
        marginTop: 0,
        marginStart: 8,
        width: 50,
        height: 50,

        justifyContent: 'flex-start',
    },
});

export default TalkList;
