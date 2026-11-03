import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Line } from 'react-native-svg';
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

// All values below are MOCK data for the static frontend. The real
// scoring pipeline will replace these with computed results later —
// see the TODO comments near each section for exactly what to swap.
const MOCK_SESSION = {
    docId: 'NT-2024-K042',
    sessionRecord: '#042 · OCT 24, 10:42 AM',
    movementScore: 74,
    scoreScale: 'MK-VI',
    today: 74.0,
    baseline: 82.0,
    variance: -9.8,
    motion: { score: 72, subLabel: 'TREMOR: LOW' },
    spiral: { score: 77, subLabel: 'PATH STABILITY: 91%' },
    tapping: { score: 74, subLabel: 'INTERVAL RMS: 184MS' },
};

function SpiralMiniViz() {
    return (
        <Svg width={90} height={26} viewBox="0 0 90 26">
            <Path
                d="M0,13 Q11,2 22,13 T44,13 T66,13 T88,13"
                stroke={COLORS.cyan}
                strokeWidth={1.2}
                strokeDasharray="3,3"
                fill="none"
            />
        </Svg>
    );
}

function TappingMiniViz() {
    const bars = [0, 1, 2, 3, 4, 5, 6];
    return (
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            {bars.map((b) => (
                <View
                    key={b}
                    style={{
                        width: 8,
                        height: 8,
                        backgroundColor: b === 3 ? COLORS.cyan : COLORS.green,
                        opacity: b === 3 ? 1 : 0.5,
                    }}
                />
            ))}
        </View>
    );
}

export default function SessionDetailScreen() {
    const router = useRouter();

    const scoreMarkerPercent = Math.min(100, MOCK_SESSION.today);
    const baselineMarkerPercent = Math.min(100, MOCK_SESSION.baseline);

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
                        <Text style={styles.headerTitle}>Session Detail</Text>
                    </View>
                    <View style={styles.livePill}>
                        <View style={styles.liveDot} />
                        <Text style={styles.livePillText}>LIVE 100HZ</Text>
                    </View>
                </View>

                {/* DOC ID ROW */}
                <View style={styles.docRow}>
                    <Text style={styles.docId}>DOC ID: {MOCK_SESSION.docId}</Text>
                    <View style={styles.verifiedGroup}>
                        <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
                        <Text style={styles.verifiedText}>VERIFIED DATASET</Text>
                    </View>
                </View>

                <Text style={styles.kinematicLabel}>KINEMATIC PROFILE</Text>
                <Text style={styles.sessionRecord}>
                    SESSION RECORD {MOCK_SESSION.sessionRecord}
                </Text>

                <View style={styles.divider} />

                {/* MOVEMENT SCORE */}
                <View style={styles.scoreHeaderRow}>
                    <Text style={styles.scoreLabel}>MOVEMENT SCORE</Text>
                    <View style={styles.scaleTag}>
                        <Text style={styles.scaleTagText}>
                            SCALE REF: {MOCK_SESSION.scoreScale}
                        </Text>
                    </View>
                </View>

                <View style={styles.scoreRow}>
                    <Text style={styles.scoreValue}>{MOCK_SESSION.movementScore}</Text>
                    <Text style={styles.scoreMax}> / 100</Text>
                    <View style={styles.calibratedTag}>
                        <Text style={styles.calibratedTagText}>CALIBRATED</Text>
                    </View>
                </View>

                {/* SCORE SCALE */}
                <View style={styles.scaleWrap}>
                    <View style={styles.scaleTrack}>
                        {Array.from({ length: 20 }).map((_, i) => (
                            <View key={i} style={styles.scaleTick} />
                        ))}
                    </View>
                    <View
                        style={[
                            styles.scaleMarker,
                            styles.scaleMarkerToday,
                            { left: `${scoreMarkerPercent}%` },
                        ]}
                    />
                    <View
                        style={[
                            styles.scaleMarker,
                            styles.scaleMarkerBaseline,
                            { left: `${baselineMarkerPercent}%` },
                        ]}
                    />
                </View>

                <View style={styles.scaleLabelsRow}>
                    <View>
                        <Text style={styles.scaleLabelTitle}>TODAY</Text>
                        <Text style={[styles.scaleLabelValue, { color: COLORS.cyan }]}>
                            {MOCK_SESSION.today.toFixed(1)} PTS
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.scaleLabelTitle}>BASELINE</Text>
                        <Text style={styles.scaleLabelValue}>
                            {MOCK_SESSION.baseline.toFixed(1)} PTS
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.scaleLabelTitle}>VARIANCE</Text>
                        <Text style={styles.scaleLabelValue}>
                            {MOCK_SESSION.variance.toFixed(1)}%
                        </Text>
                    </View>
                </View>

                {/* EXPLANATION */}
                <View style={styles.explanationBlock}>
                    <Text style={styles.explanationText}>
                        Your movement score reflects kinematic consistency across all 3
                        sensor protocols compared to your established baseline.
                    </Text>
                </View>

                <View style={styles.divider} />

                {/* PROTOCOL BREAKDOWN */}
                {/* TODO: replace MOCK_SESSION.motion/spiral/tapping scores and
            sub-labels with real computed values from the processing
            pipeline once available. */}
                <View style={styles.protocolRow}>
                    <View style={styles.protocolTopRow}>
                        <Text style={styles.protocolTitle}>01  MOTION</Text>
                        <Text style={styles.protocolScore}>
                            {MOCK_SESSION.motion.score} / 100
                        </Text>
                    </View>
                    <View style={styles.protocolVizRow}>
                        <SensorWaveform height={26} strokeWidth={1.2} showBaseline={false} />
                        <View style={styles.protocolSubGroup}>
                            <View style={[styles.dot, { backgroundColor: COLORS.cyan }]} />
                            <Text style={styles.protocolSub}>{MOCK_SESSION.motion.subLabel}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.protocolDivider} />

                <View style={styles.protocolRow}>
                    <View style={styles.protocolTopRow}>
                        <Text style={styles.protocolTitle}>02  SPIRAL</Text>
                        <Text style={styles.protocolScore}>
                            {MOCK_SESSION.spiral.score} / 100
                        </Text>
                    </View>
                    <View style={styles.protocolVizRow}>
                        <SpiralMiniViz />
                        <View style={styles.protocolSubGroup}>
                            <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
                            <Text style={styles.protocolSub}>{MOCK_SESSION.spiral.subLabel}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.protocolDivider} />

                <View style={styles.protocolRow}>
                    <View style={styles.protocolTopRow}>
                        <Text style={styles.protocolTitle}>03  TAPPING</Text>
                        <Text style={styles.protocolScore}>
                            {MOCK_SESSION.tapping.score} / 100
                        </Text>
                    </View>
                    <View style={styles.protocolVizRow}>
                        <TappingMiniViz />
                        <View style={styles.protocolSubGroup}>
                            <View style={[styles.dot, { backgroundColor: COLORS.textDim }]} />
                            <Text style={styles.protocolSub}>{MOCK_SESSION.tapping.subLabel}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* RAW TRACE ARCHIVE */}
                <View style={styles.archiveRow}>
                    {['CH0', 'CH1', 'CH2'].map((ch) => (
                        <View key={ch} style={styles.archiveThumb}>
                            <Svg width="100%" height="100%" viewBox="0 0 60 60">
                                <Line x1={0} y1={30} x2={60} y2={30} stroke={COLORS.border} strokeWidth={1} />
                                <Path
                                    d="M0,30 L8,20 L16,38 L24,15 L32,32 L40,22 L48,36 L56,26 L60,30"
                                    stroke={COLORS.textDim}
                                    strokeWidth={1}
                                    fill="none"
                                />
                            </Svg>
                            <Text style={styles.archiveChLabel}>{ch}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.archiveFooterRow}>
                    <Text style={styles.archiveFooterText}>
                        RAW TRACE ARCHIVE // CH_01–CH_03
                    </Text>
                    <View style={styles.syncGroup}>
                        <View style={[styles.dot, { backgroundColor: COLORS.cyan }]} />
                        <Text style={styles.syncText}>SYNCHRONIZED</Text>
                    </View>
                </View>

                {/* ACTIONS */}
                {/* TODO: once a detailed metrics screen exists, replace this
            with router.push('/detailed-metrics') or equivalent. */}
                <Pressable
                    style={({ pressed }) => [
                        styles.ctaButton,
                        pressed && styles.ctaButtonPressed,
                    ]}
                    onPress={() => router.push('/detailed-metrics')}
                >
                    <Text style={styles.ctaText}>VIEW DETAILED METRICS</Text>
                    <Text style={styles.ctaArrow}>→</Text>
                </Pressable>

                {/* TODO: wire this up to real baseline persistence once the
            backend/data layer is ready. UI-only for now. */}
                <Pressable
                    style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && styles.secondaryButtonPressed,
                    ]}
                    onPress={() => {
                        // Placeholder — no backend persistence yet.
                    }}
                >
                    <Text style={styles.secondaryText}>SAVE TO BASELINE</Text>
                </Pressable>

                {/* DISCLAIMER */}
                <Text style={styles.disclaimerTitle}>
                    MONITORING AID · NOT A DIAGNOSTIC TOOL.
                </Text>
                <Text style={styles.disclaimerBody}>
                    NeuroTrack records observational physical movement patterns and
                    does not diagnose neurological conditions. Consult an accredited
                    healthcare professional for clinical evaluation.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 30 },

    headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    backArrow: { fontSize: 18, color: COLORS.textPrimary, marginRight: 12, marginTop: 2 },
    headerTitleBlock: { flex: 1 },
    headerEyebrow: {
        fontSize: 9,
        letterSpacing: 1,
        color: COLORS.textDim,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
    livePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 3,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    liveDot: { width: 5, height: 5, backgroundColor: COLORS.cyan },
    livePillText: { fontSize: 8, letterSpacing: 0.6, color: COLORS.cyan, fontWeight: '700' },
    dot: { width: 5, height: 5, borderRadius: 2.5 },

    docRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    docId: { fontSize: 9, letterSpacing: 0.6, color: COLORS.textDim },
    verifiedGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    verifiedText: { fontSize: 9, letterSpacing: 0.4, color: COLORS.green },

    kinematicLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    sessionRecord: {
        fontSize: 9,
        letterSpacing: 0.5,
        color: COLORS.textDim,
        marginBottom: 16,
    },

    divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 16 },

    scoreHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    scoreLabel: {
        fontSize: 9,
        letterSpacing: 0.8,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },
    scaleTag: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 3,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    scaleTagText: {
        fontSize: 8,
        letterSpacing: 0.4,
        color: COLORS.textSecondary,
    },

    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    scoreValue: {
        fontFamily: 'serif',
        fontSize: 44,
        color: COLORS.textPrimary,
    },
    scoreMax: { fontSize: 16, color: COLORS.textSecondary, marginRight: 10 },
    calibratedTag: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 3,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    calibratedTagText: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textSecondary,
    },

    scaleWrap: { position: 'relative', height: 16, marginBottom: 6 },
    scaleTrack: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 8,
    },
    scaleTick: { width: 1, height: 6, backgroundColor: COLORS.border },
    scaleMarker: {
        position: 'absolute',
        top: 0,
        width: 6,
        height: 6,
        transform: [{ translateX: -3 }],
    },
    scaleMarkerToday: { backgroundColor: COLORS.cyan },
    scaleMarkerBaseline: { backgroundColor: COLORS.textDim, top: 8 },

    scaleLabelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    scaleLabelTitle: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    scaleLabelValue: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },

    explanationBlock: {
        borderLeftWidth: 2,
        borderLeftColor: COLORS.border,
        paddingLeft: 12,
        marginBottom: 16,
    },
    explanationText: { fontSize: 11, lineHeight: 17, color: COLORS.textSecondary },

    protocolRow: { paddingVertical: 12 },
    protocolDivider: { height: 1, backgroundColor: COLORS.border, opacity: 0.5 },
    protocolTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    protocolTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.6,
        color: COLORS.textPrimary,
    },
    protocolScore: { fontSize: 11, color: COLORS.textSecondary },
    protocolVizRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    protocolSubGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    protocolSub: {
        fontSize: 8,
        letterSpacing: 0.4,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },

    archiveRow: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 8 },
    archiveThumb: {
        flex: 1,
        height: 60,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 4,
        backgroundColor: COLORS.cardBg,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    archiveChLabel: {
        position: 'absolute',
        bottom: 3,
        left: 5,
        fontSize: 7,
        color: COLORS.textDim,
    },
    archiveFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 22,
    },
    archiveFooterText: { fontSize: 8, letterSpacing: 0.4, color: COLORS.textDim },
    syncGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    syncText: { fontSize: 8, letterSpacing: 0.4, color: COLORS.cyan },

    ctaButton: {
        backgroundColor: COLORS.cyan,
        borderRadius: 3,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    ctaButtonPressed: { opacity: 0.85 },
    ctaText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        color: '#080B0D',
        textTransform: 'uppercase',
    },
    ctaArrow: { fontSize: 15, fontWeight: '700', color: '#080B0D' },

    secondaryButton: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 4,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 24,
    },
    secondaryButtonPressed: { borderColor: COLORS.textSecondary },
    secondaryText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },

    disclaimerTitle: {
        fontSize: 9,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    disclaimerBody: {
        fontSize: 9,
        lineHeight: 14,
        color: COLORS.textDim,
        textAlign: 'center',
    },
});