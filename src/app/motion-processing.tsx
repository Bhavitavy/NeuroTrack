import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const COLORS = {
    bg: '#080B0D',
    textPrimary: '#F2F0E8',
    textSecondary: '#737A7D',
    textDim: '#3F4648',
    cyan: '#00E5F5',
    border: '#20282B',
};

export default function MotionProcessingScreen() {
    const router = useRouter();
    const [done, setDone] = useState(false);
    const spin = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const spinner = Animated.loop(
            Animated.timing(spin, {
                toValue: 1,
                duration: 900,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        spinner.start();

        const timeout = setTimeout(() => {
            setDone(true);
            router.replace('/motion-complete');
        }, 1800);

        return () => {
            spinner.stop();
            clearTimeout(timeout);
        };
    }, [spin]);

    const rotate = spin.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.container}>
                <Animated.View
                    style={[styles.spinner, { transform: [{ rotate }] }]}
                />

                <Text style={styles.heroLine}>READING</Text>
                <Text style={[styles.heroLine, styles.heroLineAccent]}>
                    THE SIGNAL.
                </Text>

                <Text style={styles.supporting}>
                    {done ? 'Signal captured.' : 'Processing kinematic data...'}
                </Text>

                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>ACCELEROMETER</Text>
                    <Text style={styles.metaText}>GYROSCOPE</Text>
                    <Text style={styles.metaText}>10.0 SEC CAPTURE</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    spinner: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderTopColor: COLORS.cyan,
        marginBottom: 28,
    },
    heroLine: {
        fontFamily: 'serif',
        fontSize: 32,
        lineHeight: 32,
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    heroLineAccent: {
        color: '#E8F4F2',
        marginBottom: 14,
    },
    supporting: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginBottom: 30,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 14,
    },
    metaText: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },
});