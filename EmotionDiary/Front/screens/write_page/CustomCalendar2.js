import React from 'react';
import { Calendar } from 'react-native-calendars';
import { Text, TouchableOpacity, Image, StyleSheet } from 'react-native';


//글꼴 바뀐 이쁜 캘린더 10/20
export default function CustomCalendar2({ onDayPress, currentMonth, setCurrentMonth, markedDates }) {
    const calToday = new Date().toISOString().slice(0,10);
    const styles = StyleSheet.create({
        image: {
            width:100,
            height:100,
        },
    });
    return (
        <Calendar
            hideExtraDays
            hideDayNames
            monthFormat={'yyyy.MM'}
            current={currentMonth}
            onMonthChange={(month) => {
                const newCurrentMonth = `${month.year}-${String(month.month).padStart(2, '0')}`;
                setCurrentMonth(newCurrentMonth);
            }}
            maxDate={calToday}
            theme={{ backgroundColor: 'transparent', calendarBackground: 'transparent' }}
            
            markedDates={markedDates}
            
            dayComponent={({ date, state }) => {
                if (markedDates[date.dateString]) {
                    return (
                        <TouchableOpacity onPress={() => onDayPress(date.dateString)}>
                            <Image source={{ uri: markedDates[date.dateString].image }} resizeMode="cover" style={[styles.image, { width: 40, height: 30 }]} />
                        </TouchableOpacity>
                    );
                } else {
                    return (
                        <TouchableOpacity onPress={() => onDayPress(date)}>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    color: state === 'disabled' ? 'gray' : 'black',
                                    fontFamily:'Dovemayo_gothic',
                                    fontSize:15,
                                    marginBottom :20,
                                    marginHorizontal : 10
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
                     <Text style={{ fontFamily:'Dovemayo_gothic', fontSize :35 , marginBottom :19}}>
                         {headerDate}
                     </Text>
                 );
             }}
        />
    );
};