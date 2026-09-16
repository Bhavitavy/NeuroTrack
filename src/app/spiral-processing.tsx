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

const FEATURES = ['TRAJECTORY', 'SMOOTHNESS', 'DEVIATION'];

export default function SpiralProcessingScreen() {
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
            router.replace('/spiral-complete');
        }, 1800);

        return () => {
            spinner.stop();
            clearTimeout(timeout);
        };
    }, [spin, router]);

    const rotate = spin.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.container}>
                <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />

                <Text style={styles.heroLine}>READING</Text>
                <Text style={[styles.heroLine, styles.heroLineAccent]}>
                    THE TRACE.
                </Text>

                <Text style={styles.supporting}>
                    {done
                        ? 'Trace analysis complete.'
                        : 'Analyzing trajectory, smoothness, deviation and movement consistency...'}
                </Text>

                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>TOUCH TRAJECTORY</Text>
                    <Text style={styles.metaText}>10.0 SEC CAPTURE</Text>
                    <Text style={styles.metaText}>PATH ANALYSIS</Text>
                </View>

                <View style={styles.featuresBlock}>
                    <Text style={styles.featuresLabel}>EXTRACTING FEATURES</Text>
                    <View style={styles.featuresRow}>
                        {FEATURES.map((f) => (
                            <View key={f} style={styles.featurePill}>
                                <Text style={styles.featureText}>{f}</Text>
                            </View>
                        ))}
                    </View>
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
        color: COLORS.cyan,
        marginBottom: 14,
    },
    supporting: {
        fontSize: 11,
        lineHeight: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 26,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 22,
    },
    metaText: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },
    featuresBlock: { alignItems: 'center' },
    featuresLabel: {
        fontSize: 8,
        letterSpacing: 1,
        color: COLORS.textDim,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    featuresRow: {
        flexDirection: 'row',
        gap: 8,
    },
    featurePill: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    featureText: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
});