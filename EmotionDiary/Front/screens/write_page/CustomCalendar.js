import React from 'react';
import { Calendar } from 'react-native-calendars';
import { Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Angry, Happy, Hurt, Unrest, Sad, Passive, Embarrassment } from '../global';

function handleEmotionIndex(emotionIndex) {
    const imageStyles = { width: 60, height: 60, bottom :15}; // 원하는 크기로 조절하세요.

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


export default function CustomCalendar({ onDayPress, currentMonth, setCurrentMonth, markedDates }) {
    const calToday = new Date().toISOString().slice(0, 10);

    return (
        <Calendar
            hideExtraDays
            hideDayNames
            monthFormat={'yyyy.MM'}
            current={currentMonth}
            pagingEnabled={true} // 스크롤을 통한 월 변경 활성화
            onMonthChange={(month) => {
                const newCurrentMonth = `${month.year}-${String(month.month).padStart(2, '0')}`;
                setCurrentMonth(newCurrentMonth);
            }}
            maxDate={calToday}
            theme={{ backgroundColor: 'transparent', calendarBackground: 'transparent' }}

            markedDates={markedDates}
            dayComponent={({ date, state }) => {
                if (markedDates[date.dateString]) {
                    const EmotionImage = handleEmotionIndex(markedDates[date.dateString].emotion_index);
                    return (
                        <TouchableOpacity onPress={() => onDayPress(date.dateString)}>
                            {EmotionImage}
                        </TouchableOpacity>
                    );
                } else {
                    return (
                        <TouchableOpacity onPress={() => onDayPress(date)}>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    color: state === 'disabled' ? 'gray' : 'black',
                                    fontFamily: 'Dovemayo_gothic',
                                    fontSize: 30,
                                    marginBottom: 20,
                                    
                                }}
                            >
                                {date.day}
                            </Text>
                        </TouchableOpacity>
                    );
                }
            }}

            renderHeader={() => {
                const headerDate = currentMonth.replace('-', '.');
                return (
                    <Text style={{ fontSize: 35, marginBottom: 19 }}>
                        {headerDate}
                    </Text>
                );
            }}
        />
    );
};

const styles = StyleSheet.create({
    image: {
        width: 20,
        height: 20,
    },
});