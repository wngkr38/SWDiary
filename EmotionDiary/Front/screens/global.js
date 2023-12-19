import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image, StyleSheet } from 'react-native'


export async function getUserId() {
    try {
        const userId = await AsyncStorage.getItem('userId');
        return userId;
    } catch (error) {
        console.error(error);
    }
}

export async function getUserName() {
    try {
        const userName = await AsyncStorage.getItem('userName');
        return userName;
    } catch (error) {
        console.error(error);
    }
}

export async function getUserEmail() {
    try {
        const userEmail = await AsyncStorage.getItem('userEmail');
        return userEmail;
    } catch (error) {
        console.error(error);
    }
}

export function Angry({ style }) {
    return (
        <Image
            source={require("../icon/angry1.png")}
            resizeMode="cover"
            style={style}
        />);
}

export function Happy({ style }) {
    return (
        <Image
            source={require("../icon/happy1.png")}
            resizeMode="cover"
            style={style}
        />);
}

export function Embarrassment({ style }) {
    return (
        <Image
            source={require("../icon/Embarrassment1.png")}
            resizeMode="cover"
            style={style}
        />);
}

export function Hurt({ style }) {
    return (
        <Image
            source={require("../icon/hurt1.png")}
            resizeMode="cover"
            style={style}
        />);
}

export function Passive({ style }) {
    return (
        <Image
            source={require("../icon/passive1.png")}
            resizeMode="cover"
            style={style}
        />);
}

export function Sad({ style }) {
    return (
        <Image
            source={require("../icon/sad1.png")}
            resizeMode="cover"
            style={style}
        />);
}

export function Unrest({ style }) {
    return (
        <Image
            source={require("../icon/unrest1.png")}
            resizeMode="cover"
            style={style}
        />);
}
const styles = StyleSheet.create({
    image: {
        width: 200, height: 150
    }
});
export const address = 'http://10.20.102.132:9090';
