import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Easing,
    LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const COLORS = {
    bg: '#080B0D',
    textPrimary: '#F2F0E8',
    textSecondary: '#737A7D',
    textDim: '#3F4648',
    cyan: '#00E5F5',
    green: '#38E89B',
    border: '#20282B',
};

const CAPTURE_SECONDS = 20;
const TARGET_TAP_COUNT = 40; // display-only reference target, mock value
const MAX_VISIBLE_TICKS = 7;

function formatElapsed(seconds: number): string {
    return Math.max(0, Math.min(CAPTURE_SECONDS, seconds))
        .toFixed(1)
        .padStart(4, '0');
}

export default function TappingActiveScreen() {
    const router = useRouter();

    const [remaining, setRemaining] = useState(CAPTURE_SECONDS);
    const [tapCount, setTapCount] = useState(0);
    const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
    const [targetSize, setTargetSize] = useState(0);

    const startRef = useRef<number>(Date.now());
    const navigatedRef = useRef(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;

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
                // TODO: once real tap-timing capture is finalized, pass the
                // recorded tap timestamps / derived cadence features into the
                // processing layer here before navigating.
                router.replace('/tapping-complete');
            }
        }, 100);

        return () => clearInterval(interval);
    }, [router]);

    const handleTargetLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        const size = Math.floor(Math.min(width, height) * 0.78);
        if (size > 0 && size !== targetSize) {
            setTargetSize(size);
        }
    };

    const handleTap = () => {
        if (navigatedRef.current) return;

        const now = Date.now();
        setTapCount((c) => c + 1);
        setTapTimestamps((prev) => [...prev, now].slice(-MAX_VISIBLE_TICKS));

        scaleAnim.setValue(1);
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.92,
                duration: 90,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 140,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start();

        pulseAnim.setValue(0);
        Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 320,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const pulseScale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.28],
    });
    const pulseOpacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 0],
    });

    const elapsed = CAPTURE_SECONDS - remaining;

    // Mock cadence figure derived loosely from tap count, purely for
    // display — not a real signal-processing calculation.
    const mockCadenceHz =
        tapCount > 0 && elapsed > 0.3 ? (tapCount / Math.max(elapsed, 1)).toFixed(2) : '0.00';

    // Intervals between the last few taps, for the tick stream — real
    // values (based on actual tap timestamps), used for display only.
    const intervals: number[] = [];
    for (let i = 1; i < tapTimestamps.length; i++) {
        intervals.push(tapTimestamps[i] - tapTimestamps[i - 1]);
    }

    const progressPercent = Math.min(100, (elapsed / CAPTURE_SECONDS) * 100);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.container}>
                {/* HEADER */}
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} hitSlop={12}>
                        <Text style={styles.backArrow}>←</Text>
                    </Pressable>
                    <View style={styles.headerTitleBlock}>
                        <Text style={styles.headerEyebrow}>REC // ACTIVE</Text>
                        <Text style={styles.headerTitle}>Active Assessment</Text>
                    </View>
                    <View style={styles.livePill}>
                        <View style={styles.liveDot} />
                        <Text style={styles.livePillText}>LIVE 100HZ</Text>
                    </View>
                </View>

                {/* PROTOCOL ROW */}
                <View style={styles.protocolRow}>
                    <Text style={styles.protocolText}>PROTOCOL // OSC-084</Text>
                    <View style={styles.calibratedGroup}>
                        <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
                        <Text style={styles.calibratedText}>SENSOR CALIBRATED</Text>
                    </View>
                </View>

                {/* TITLE */}
                <Text style={styles.title}>TAPPING / 03</Text>
                <Text style={styles.subtitle}>INTERVAL CADENCE ASSESSMENT</Text>

                {/* PROGRESS LINE */}
                <View style={styles.progressTrack}>
                    <View
                        style={[styles.progressFill, { width: `${progressPercent}%` }]}
                    />
                </View>

                {/* TELEMETRY CARDS */}
                <View style={styles.telemetryRow}>
                    <View style={styles.telemetryCard}>
                        <Text style={styles.telemetryLabel}>COUNT</Text>
                        <Text style={styles.telemetryValue}>{tapCount}</Text>
                        <Text style={styles.telemetrySub}>TARGET: {TARGET_TAP_COUNT}</Text>
                    </View>
                    <View style={styles.telemetryCard}>
                        <Text style={styles.telemetryLabel}>ELAPSED</Text>
                        <Text style={[styles.telemetryValue, styles.telemetryValueCyan]}>
                            {formatElapsed(elapsed)}
                            <Text style={styles.telemetryUnit}>S</Text>
                        </Text>
                        <Text style={styles.telemetrySub}>WIN: {CAPTURE_SECONDS.toFixed(1)}S</Text>
                    </View>
                    <View style={styles.telemetryCard}>
                        <Text style={styles.telemetryLabel}>CADENCE</Text>
                        <Text style={[styles.telemetryValue, styles.telemetryValueGreen]}>
                            {mockCadenceHz}
                            <Text style={styles.telemetryUnit}>HZ</Text>
                        </Text>
                        <Text style={styles.telemetrySub}>VAR: 2.1%</Text>
                    </View>
                </View>

                {/* TARGET */}
                <View style={styles.targetWrap} onLayout={handleTargetLayout}>
                    {targetSize > 0 && (
                        <View
                            style={{
                                width: targetSize,
                                height: targetSize,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <View
                                style={[
                                    styles.outerRing,
                                    { width: targetSize, height: targetSize, borderRadius: targetSize / 2 },
                                ]}
                            />
                            <Animated.View
                                pointerEvents="none"
                                style={[
                                    styles.pulseRing,
                                    {
                                        width: targetSize * 0.72,
                                        height: targetSize * 0.72,
                                        borderRadius: (targetSize * 0.72) / 2,
                                        opacity: pulseOpacity,
                                        transform: [{ scale: pulseScale }],
                                    },
                                ]}
                            />
                            <Pressable onPress={handleTap} style={styles.pressableArea}>
                                <Animated.View
                                    style={[
                                        styles.targetCircle,
                                        {
                                            width: targetSize * 0.72,
                                            height: targetSize * 0.72,
                                            borderRadius: (targetSize * 0.72) / 2,
                                            transform: [{ scale: scaleAnim }],
                                        },
                                    ]}
                                >
                                    <Text style={styles.targetLabelTop}>TARGET [01]</Text>
                                    <Text style={styles.tapText}>TAP</Text>
                                    <View style={styles.targetDivider} />
                                    <Text style={styles.targetSub}>NATURAL RHYTHM</Text>
                                    <Text style={styles.targetSubDim}>FORCE: NORMALIZED</Text>
                                </Animated.View>
                            </Pressable>
                        </View>
                    )}
                </View>

                {/* CONTACT STATUS */}
                <View style={styles.contactRow}>
                    <View style={[styles.dot, { backgroundColor: COLORS.cyan }]} />
                    <Text style={styles.contactText}>CONTACT DETECT</Text>
                    <Text style={styles.contactDash}>·</Text>
                    <Text style={styles.contactText}>LATENCY 4.1MS</Text>
                </View>

                {/* RHYTHM STREAM */}
                <View style={styles.streamHeaderRow}>
                    <Text style={styles.streamLabel}>TEMPORAL CONTINUITY STREAM</Text>
                    <Text style={styles.streamLabelAccent}>ΔT INTERVAL TRACK</Text>
                </View>
                <View style={styles.tickTrack}>
                    {Array.from({ length: MAX_VISIBLE_TICKS }).map((_, i) => {
                        const interval = intervals[intervals.length - MAX_VISIBLE_TICKS + i];
                        const isLatest = i === MAX_VISIBLE_TICKS - 1 && interval !== undefined;
                        return (
                            <View key={i} style={styles.tickSlot}>
                                <View
                                    style={[
                                        styles.tickBar,
                                        interval !== undefined && styles.tickBarActive,
                                        isLatest && styles.tickBarLatest,
                                    ]}
                                />
                                {interval !== undefined && (
                                    <Text
                                        style={[
                                            styles.tickValue,
                                            isLatest && styles.tickValueLatest,
                                        ]}
                                    >
                                        {interval}
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* BOTTOM */}
                <View style={styles.instructionPill}>
                    <Text style={styles.instructionPillText}>
                        ⓘ  Maintain regular pace · Do not force speed
                    </Text>
                </View>
                <Pressable style={styles.abortButton} onPress={() => router.back()}>
                    <Text style={styles.abortText}>ABORT // CANCEL TEST</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 6,
        paddingBottom: 10,
    },

    headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    backArrow: { fontSize: 16, color: COLORS.textPrimary, marginRight: 10, marginTop: 2 },
    headerTitleBlock: { flex: 1 },
    headerEyebrow: {
        fontSize: 8,
        letterSpacing: 1,
        color: COLORS.textDim,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    headerTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    livePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 3,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    liveDot: { width: 5, height: 5, backgroundColor: COLORS.cyan },
    livePillText: { fontSize: 7, letterSpacing: 0.5, color: COLORS.cyan, fontWeight: '700' },
    dot: { width: 5, height: 5, borderRadius: 2.5 },

    protocolRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    protocolText: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },
    calibratedGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    calibratedText: { fontSize: 8, letterSpacing: 0.4, color: COLORS.green },

    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 8,
        letterSpacing: 0.8,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 8,
    },

    progressTrack: {
        height: 2,
        backgroundColor: COLORS.border,
        borderRadius: 1,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: { height: '100%', backgroundColor: COLORS.cyan },

    telemetryRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
    telemetryCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 4,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    telemetryLabel: {
        fontSize: 7,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    telemetryValue: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 3,
    },
    telemetryValueCyan: { color: COLORS.cyan },
    telemetryValueGreen: { color: COLORS.green },
    telemetryUnit: { fontSize: 9, fontWeight: '400' },
    telemetrySub: { fontSize: 7, color: COLORS.textDim },

    targetWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    pressableArea: { alignItems: 'center', justifyContent: 'center' },
    outerRing: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    pulseRing: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: COLORS.cyan,
    },
    targetCircle: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: '#0B0F11',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    targetLabelTop: {
        position: 'absolute',
        top: '20%',
        fontSize: 8,
        letterSpacing: 1,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },
    tapText: {
        fontFamily: 'serif',
        fontSize: 30,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    targetDivider: {
        width: 26,
        height: 1,
        backgroundColor: COLORS.cyan,
        marginVertical: 8,
    },
    targetSub: {
        fontSize: 9,
        letterSpacing: 1,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
    targetSubDim: {
        fontSize: 7,
        letterSpacing: 0.5,
        color: COLORS.textDim,
        marginTop: 4,
        textTransform: 'uppercase',
    },

    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 8,
    },
    contactText: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
    contactDash: { fontSize: 8, color: COLORS.textDim },

    streamHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    streamLabel: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },
    streamLabelAccent: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.cyan,
        textTransform: 'uppercase',
    },
    tickTrack: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 34,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingBottom: 4,
        marginBottom: 10,
    },
    tickSlot: { alignItems: 'center', flex: 1 },
    tickBar: {
        width: 2,
        height: 12,
        backgroundColor: COLORS.border,
        marginBottom: 2,
    },
    tickBarActive: { backgroundColor: COLORS.textDim, height: 16 },
    tickBarLatest: { backgroundColor: COLORS.cyan, height: 20 },
    tickValue: { fontSize: 6, color: COLORS.textDim },
    tickValueLatest: { color: COLORS.cyan },

    instructionPill: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 4,
        paddingVertical: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    instructionPillText: { fontSize: 9, color: COLORS.textSecondary },

    abortButton: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 4,
        paddingVertical: 12,
        alignItems: 'center',
    },
    abortText: {
        fontSize: 10,
        letterSpacing: 1,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
});