import SignUp from './screens/signupPage/SignUp';
import LogOut from './screens/LogOut';
import Available from './screens/signupPage/AvailableName';
import Home from './screens/Home';
import ViewDiary from './screens/ViewDiary';
import WriteDiary from './screens/write_page/WriteDiary';
import KaKaoLogin from './screens/Kakaologin';
import Signin from './screens/Signin';
import FriendDiaryList from './screens/FriendDiaryList';
import ViewFriendDiary from './screens/ViewFriendDiary';
import Notice from './screens/Notice';

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { LogBox, Text } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TalkList from './screens/talk_page/TalkList';
import TalkRoom from './screens/talk_page/TalkRoom';

import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import { setCustomText } from 'react-native-global-props';

LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);
LogBox.ignoreAllLogs();
console.disableYellowBox = true;

export const loadFonts = async () => {
    await Font.loadAsync({
        NanumGothic: require('./assets/font/NanumBrushScript-Regular.ttf'),
        Dovemayo_gothic: require('./assets/font/Dovemayo_gothic.ttf'),
        // 다른 폰트들...
    });

    const customTextProps = {
        style: {
            fontFamily: 'Dovemayo_gothic',
            fontSize: 16, // 기본 텍스트 크기도 설정할 수 있습니다.
        },
    };

    setCustomText(customTextProps);
};
export default function App() {
    const [initialRoute, setInitialRoute] = useState('Signin'); // 초기 라우트 상태 설정
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
    const [fontLoaded, setFontLoaded] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const storedAccessToken = await AsyncStorage.getItem('userAccessToken');
            if (storedAccessToken) {
                setInitialRoute('Home');
            }
            setIsLoading(false); // 토큰 확인 완료 후 로딩 상태 변경
        };

        checkToken();
    }, []);

    const Stack = createStackNavigator();

    if (isLoading) {
        // 로딩 중일 때는 Loading 화면을 보여줍니다.
        return <Text>Loading...</Text>;
    }

    if (!fontLoaded) {
        return <AppLoading startAsync={loadFonts} onFinish={() => setFontLoaded(true)} onError={console.warn} />;
    }
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={initialRoute}>
                {/* {initialRoute} */}
                <Stack.Screen
                    name="SignUp"
                    component={SignUp}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Available"
                    component={Available}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Home"
                    component={Home}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="ViewDiary"
                    component={ViewDiary}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="WriteDiary"
                    component={WriteDiary}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="KaKaoLogin"
                    component={KaKaoLogin}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="LogOut"
                    component={LogOut}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Signin"
                    component={Signin}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="FriendDiaryList"
                    component={FriendDiaryList}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="ViewFriendDiary"
                    component={ViewFriendDiary}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="TalkList"
                    component={TalkList}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="TalkRoom"
                    component={TalkRoom}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Notice"
                    component={Notice}
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
