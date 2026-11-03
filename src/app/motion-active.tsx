import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SensorWaveform from '../components/SensorWaveform';

const COLORS = {
    bg: '#080B0D',
    textPrimary: '#F2F0E8',
    textSecondary: '#737A7D',
    textDim: '#3F4648',
    cyan: '#00E5F5',
    green: '#38E89B',
    border: '#20282B',
    cardBg: '#0D1113',
};

const CAPTURE_SECONDS = 10;

// Mock session id, generated once per mount for display purposes only.
const MOCK_SESSION_ID = '0X48F2A09';

function formatCountdown(seconds: number): { whole: string; dec: string } {
    const clamped = Math.max(0, seconds);
    const str = clamped.toFixed(1).padStart(4, '0'); // "4.9" -> "04.9"
    const [whole, dec] = str.split('.');
    return { whole, dec: dec ?? '0' };
}

// Ruler tick positions across the -1.00G to +1.00G range.
const RULER_LABELS = ['-1.00G', '-0.50', '0.00 ZERO', '+0.50', '+1.00G'];
const RULER_TICK_COUNT = 21; // small ticks between labeled ones
const CENTER_TICK_INDEX = Math.floor(RULER_TICK_COUNT / 2);

export default function MotionActiveScreen() {
    const router = useRouter();
    const [remaining, setRemaining] = useState(CAPTURE_SECONDS);
    const startRef = useRef<number>(Date.now());
    const navigatedRef = useRef(false);

    // Purely cosmetic marker drift on the G-force ruler — mock only,
    // not connected to any real sensor value.
    const markerDrift = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        startRef.current = Date.now();
        navigatedRef.current = false;

        const interval = setInterval(() => {
            const elapsedMs = Date.now() - startRef.current;
            const remainingSec = Math.max(0, CAPTURE_SECONDS - elapsedMs / 1000);
            setRemaining(remainingSec);

            if (elapsedMs >= CAPTURE_SECONDS * 1000 && !navigatedRef.current) {
                navigatedRef.current = true;
                clearInterval(interval);
                // TODO: once real sensor capture is wired in, call
                // motionSensorService.stopMotionCapture() here before navigating.
                router.replace('/motion-processing');
            }
        }, 100);

        // TODO: motionSensorService.startMotionCapture() goes here once
        // real sensors are integrated. This screen currently uses mock
        // data only and does not touch the existing sensor implementation.

        const drift = Animated.loop(
            Animated.sequence([
                Animated.timing(markerDrift, {
                    toValue: 1,
                    duration: 1400,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(markerDrift, {
                    toValue: 0,
                    duration: 1400,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
            ])
        );
        drift.start();

        return () => {
            clearInterval(interval);
            drift.stop();
        };
    }, [router, markerDrift]);

    const { whole, dec } = formatCountdown(remaining);

    const markerLeft = markerDrift.interpolate({
        inputRange: [0, 1],
        outputRange: ['46%', '56%'],
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} hitSlop={12}>
                        <Text style={styles.backArrow}>←</Text>
                    </Pressable>

                    <View style={styles.headerTitleBlock}>
                        <Text style={styles.headerEyebrow}>REC // ACTIVE</Text>
                        <Text style={styles.headerTitle}>Active Assessment</Text>
                    </View>

                    <View style={styles.headerRight}>
                        <View style={styles.livePill}>
                            <View style={styles.liveDot} />
                            <Text style={styles.livePillText}>LIVE 100HZ</Text>
                        </View>
                        <Text style={styles.logoFaint} numberOfLines={1}>
                            NEUROTRACK
                        </Text>
                    </View>
                </View>

                {/* META ROW */}
                <View style={styles.metaRow}>
                    <View style={styles.metaBlock}>
                        <View style={styles.metaLine1}>
                            <View style={styles.metaBullet} />
                            <Text style={styles.metaPrimaryText}>MOTION / 01</Text>
                        </View>
                        <Text style={styles.metaSecondaryText}>:: STABILITY_CHECK</Text>
                    </View>

                    <View style={[styles.metaBlock, styles.metaBlockRight]}>
                        <View style={styles.metaLine1}>
                            <View style={styles.metaBullet} />
                            <Text style={styles.metaPrimaryText}>SENSOR ACTIVE · 100HZ</Text>
                        </View>
                        <Text style={[styles.metaSecondaryText, styles.metaSecondaryRight]}>
                            IMU
                        </Text>
                    </View>
                </View>

                {/* TIMER + G-FORCE RULER CARD */}
                <View style={styles.card}>
                    <Text style={styles.clockLabel}>METRIC CLOCK : T-DELTA</Text>

                    <View style={styles.timerRow}>
                        <Text style={styles.timerWhole}>{whole}</Text>
                        <Text style={styles.timerDec}>.{dec}</Text>
                    </View>

                    <Text style={styles.secondsRemainingLabel}>
                        <Text style={styles.dash}>— </Text>
                        SECONDS REMAINING
                        <Text style={styles.dash}> —</Text>
                    </Text>

                    {/* G-FORCE RULER */}
                    <View style={styles.rulerWrap}>
                        <Animated.View style={[styles.markerDiamond, { left: markerLeft }]} />
                        <Animated.View style={[styles.markerStem, { left: markerLeft }]} />

                        <View style={styles.rulerTicksRow}>
                            {Array.from({ length: RULER_TICK_COUNT }).map((_, i) => {
                                const isCenter = i === CENTER_TICK_INDEX;
                                const isMajor = i % 5 === 0;
                                return (
                                    <View
                                        key={i}
                                        style={[
                                            styles.tick,
                                            isMajor && styles.tickMajor,
                                            isCenter && styles.tickCenter,
                                        ]}
                                    />
                                );
                            })}
                        </View>

                        <View style={styles.rulerLabelsRow}>
                            {RULER_LABELS.map((label) => (
                                <Text
                                    key={label}
                                    style={[
                                        styles.rulerLabel,
                                        label === '0.00 ZERO' && styles.rulerLabelCenter,
                                    ]}
                                >
                                    {label}
                                </Text>
                            ))}
                        </View>
                    </View>
                </View>

                {/* KINEMATIC VECTOR STREAM CARD */}
                <View style={styles.card}>
                    <View style={styles.vectorHeaderRow}>
                        <View style={styles.vectorTitleGroup}>
                            <Text style={styles.waveformIcon}>∿</Text>
                            <Text style={styles.vectorTitle}>
                                KINEMATIC VECTOR STREAM{'\n'}
                                <Text style={styles.vectorTitleDim}>[3-AXIS]</Text>
                            </Text>
                        </View>
                        <View style={styles.axisValuesGroup}>
                            <View style={styles.axisValueItem}>
                                <Text style={styles.axisLabel}>X:</Text>
                                <Text style={styles.axisValue}>+0.02</Text>
                            </View>
                            <View style={styles.axisValueItem}>
                                <Text style={styles.axisLabel}>Y:</Text>
                                <Text style={styles.axisValue}>-0.01</Text>
                            </View>
                            <View style={styles.axisValueItem}>
                                <Text style={styles.axisLabel}>Z:</Text>
                                <Text style={styles.axisValue}>0.98G</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.stabilityTag}>STABILITY: 99.4% NOMINAL</Text>

                    <SensorWaveform height={90} showGrid showBaseline />

                    <Text style={styles.bufferTag}>BUFFER: 2048 SAMPLES // ΔT 10MS</Text>
                </View>

                {/* KEEP PHONE STEADY CARD */}
                <View style={[styles.card, styles.steadyCard]}>
                    <View style={styles.steadyTextBlock}>
                        <Text style={styles.steadyTitle}>KEEP YOUR PHONE STEADY</Text>
                        <Text style={styles.steadySub}>
                            Neutral wrist position · Forearm fully supported
                        </Text>
                    </View>
                    <View style={styles.steadyIconBox}>
                        <Text style={styles.steadyIcon}>↻</Text>
                    </View>
                </View>

                {/* DRIFT / NOISE ROW */}
                <View style={styles.statsRow}>
                    <View style={styles.statsItem}>
                        <Text style={styles.statsIcon}>((•))</Text>
                        <Text style={styles.statsText}>DRIFT DELTA: ±0.03 MM/S²</Text>
                    </View>
                    <View style={styles.statsItem}>
                        <Text style={styles.statsText}>NOISE FLOOR: NOMINAL</Text>
                        <View style={styles.statsDotGreen} />
                    </View>
                </View>

                {/* ABORT BUTTON */}
                <Pressable
                    style={({ pressed }) => [
                        styles.abortButton,
                        pressed && styles.abortButtonPressed,
                    ]}
                    onPress={() => router.back()}
                >
                    <Text style={styles.abortText}>×  ABORT TEST [ESC]</Text>
                </Pressable>

                {/* SESSION ID FOOTER */}
                <Text style={styles.sessionId}>SESSION ID // {MOCK_SESSION_ID}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 30,
    },

    // HEADER
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 22,
    },
    backArrow: {
        fontSize: 18,
        color: COLORS.textPrimary,
        marginRight: 12,
        marginTop: 2,
    },
    headerTitleBlock: {
        flex: 1,
    },
    headerEyebrow: {
        fontSize: 9,
        letterSpacing: 1,
        color: COLORS.textDim,
        marginBottom: 3,
        textTransform: 'uppercase',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    livePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 3,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginBottom: 4,
    },
    liveDot: {
        width: 5,
        height: 5,
        backgroundColor: COLORS.cyan,
    },
    livePillText: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.cyan,
        fontWeight: '700',
    },
    logoFaint: {
        fontSize: 8,
        letterSpacing: 1,
        color: COLORS.textDim,
        maxWidth: 70,
    },

    // META ROW
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    metaBlock: {
        flex: 1,
    },
    metaBlockRight: {
        alignItems: 'flex-end',
    },
    metaLine1: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    metaBullet: {
        width: 5,
        height: 5,
        backgroundColor: COLORS.cyan,
    },
    metaPrimaryText: {
        fontSize: 9,
        letterSpacing: 0.6,
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
    },
    metaSecondaryText: {
        fontSize: 9,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        marginLeft: 11,
    },
    metaSecondaryRight: {
        marginLeft: 0,
    },

    // CARD (shared)
    card: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 4,
        backgroundColor: COLORS.cardBg,
        padding: 16,
        marginBottom: 14,
    },

    // TIMER
    clockLabel: {
        fontSize: 9,
        letterSpacing: 1.2,
        color: COLORS.textDim,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    timerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    timerWhole: {
        fontFamily: 'serif',
        fontSize: 56,
        color: COLORS.textPrimary,
        letterSpacing: -1,
    },
    timerDec: {
        fontFamily: 'serif',
        fontSize: 30,
        color: COLORS.cyan,
        marginBottom: 4,
    },
    secondsRemainingLabel: {
        fontSize: 9,
        letterSpacing: 1.5,
        color: COLORS.textSecondary,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 18,
    },
    dash: {
        color: COLORS.textDim,
    },

    // RULER
    rulerWrap: {
        position: 'relative',
        paddingTop: 16,
    },
    markerDiamond: {
        position: 'absolute',
        top: 0,
        width: 8,
        height: 8,
        backgroundColor: COLORS.cyan,
        transform: [{ translateX: -4 }, { rotate: '45deg' }],
    },
    markerStem: {
        position: 'absolute',
        top: 8,
        width: 1,
        height: 14,
        backgroundColor: COLORS.cyan,
        opacity: 0.5,
        transform: [{ translateX: -0.5 }],
    },
    rulerTicksRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 20,
        marginBottom: 6,
    },
    tick: {
        width: 1,
        height: 8,
        backgroundColor: COLORS.border,
    },
    tickMajor: {
        height: 14,
        backgroundColor: COLORS.textDim,
    },
    tickCenter: {
        height: 20,
        width: 1.5,
        backgroundColor: COLORS.cyan,
    },
    rulerLabelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rulerLabel: {
        fontSize: 8,
        letterSpacing: 0.4,
        color: COLORS.textDim,
    },
    rulerLabelCenter: {
        color: COLORS.cyan,
        fontWeight: '700',
    },

    // VECTOR STREAM
    vectorHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    vectorTitleGroup: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        flex: 1,
    },
    waveformIcon: {
        fontSize: 12,
        color: COLORS.green,
        marginTop: 1,
    },
    vectorTitle: {
        fontSize: 9,
        letterSpacing: 0.6,
        color: COLORS.textPrimary,
        lineHeight: 13,
        textTransform: 'uppercase',
    },
    vectorTitleDim: {
        color: COLORS.textDim,
    },
    axisValuesGroup: {
        flexDirection: 'row',
        gap: 10,
    },
    axisValueItem: {
        alignItems: 'center',
    },
    axisLabel: {
        fontSize: 8,
        color: COLORS.textDim,
    },
    axisValue: {
        fontSize: 9,
        fontWeight: '700',
        color: COLORS.green,
    },
    stabilityTag: {
        fontSize: 8,
        letterSpacing: 0.5,
        color: COLORS.green,
        textAlign: 'right',
        marginBottom: 4,
    },
    bufferTag: {
        fontSize: 8,
        letterSpacing: 0.5,
        color: COLORS.textDim,
        marginTop: 6,
    },

    // STEADY CARD
    steadyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    steadyTextBlock: {
        flex: 1,
        paddingRight: 12,
    },
    steadyTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    steadySub: {
        fontSize: 10,
        lineHeight: 15,
        color: COLORS.textSecondary,
    },
    steadyIconBox: {
        width: 40,
        height: 40,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    steadyIcon: {
        fontSize: 18,
        color: COLORS.textSecondary,
    },

    // STATS ROW
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 22,
        paddingHorizontal: 2,
    },
    statsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statsIcon: {
        fontSize: 9,
        color: COLORS.textDim,
    },
    statsText: {
        fontSize: 9,
        letterSpacing: 0.5,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
    statsDotGreen: {
        width: 5,
        height: 5,
        backgroundColor: COLORS.green,
    },

    // ABORT BUTTON
    abortButton: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 4,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 14,
    },
    abortButtonPressed: {
        borderColor: COLORS.textSecondary,
    },
    abortText: {
        fontSize: 10,
        letterSpacing: 1,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },

    sessionId: {
        fontSize: 8,
        letterSpacing: 1,
        color: COLORS.textDim,
        textAlign: 'center',
    },
});