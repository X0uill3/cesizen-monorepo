import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export default function LogoHeader() {
    return (
        <View style={styles.container}>
            <Text style={styles.mainLogo}>CESIZen</Text>
            <Text style={styles.subLogo}>SANTÉ & BIEN-ÊTRE</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 15,
        paddingBottom: 25,
        backgroundColor: Colors.zen.cream,
    },
    mainLogo: {
        fontSize: 34,
        fontWeight: '900',
        color: Colors.zen.sage,
        letterSpacing: 1,
    },
    subLogo: {
        fontSize: 12,
        color: '#8A8A8A',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: -3,
    },
});