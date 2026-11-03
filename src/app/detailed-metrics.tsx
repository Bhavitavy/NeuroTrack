import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Line, Circle } from 'react-native-svg';
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

// ==================================================
// MOCK DATA — centralized on purpose.
//
// TODO (future integration): replace every value below with the real
// output of the processing/P2 pipeline once available. Nothing in
// this file calculates FFT, RMS, tremor amplitude, spiral scores, or
// tapping cadence — these are placeholder numbers for the frontend.
// ==================================================
const SESSION_ID = 'NKT-24-K14'; // matches session-detail.tsx

const MOCK_METRICS = {
    captureWindowSec: 40.0,
    motion: {
        tremorAmplitude: 0.18,
        dominantFrequency: 4.2,
        rmsMovement: 0.32,
        axisStability: 94.2,
        signalQuality: 98.7,
        driftDelta: 0.03,
    },
    spiral: {
        pathDeviation: 2.8,
        pathStability: 91.0,
        traceSmoothness: 87.4,
        velocityVariation: 6.2,
        completionTime: 8.7,
        tracePoints: 482,
    },
    tapping: {
        tapCount: 14,
        meanInterval: 518,
        intervalRms: 184,
        cadence: 1.94,
        intervalVariance: 2.1,
        contactLatency: 4.1,
    },
    summary: [
        { protocol: 'MOTION', score: 72, status: 'NOMINAL' },
        { protocol: 'SPIRAL', score: 77, status: 'NOMINAL' },
        { protocol: 'TAPPING', score: 74, status: 'NOMINAL' },
        { protocol: 'OVERALL', score: 74, status: 'CALIBRATED' },
    ],
    baseline: {
        current: 74.0,
        baseline: 82.0,
        delta: -8.0,
        variance: -9.8,
    },
    dataQuality: [
        { label: 'ACCELEROMETER', value: 98.7 },
        { label: 'GYROSCOPE', value: 99.1 },
        { label: 'TOUCH TRAJECTORY', value: 97.8 },
    ],
    rawData: {
        captureWindow: '40.0 SEC',
        motionSampleRate: '100 HZ',
        touchSamples: 482,
    },
};

// tap interval ticks — small visual variation, mock only
const TAP_INTERVAL_TICKS = [16, 22, 14, 24, 18, 20, 15, 23, 17, 21, 16, 19, 14, 22];

function SectionLabel({ index, name }: { index: string; name: string }) {
    return <Text style={styles.sectionLabel}>{index} / {name}</Text>;
}

function MetricItem({
    label,
    value,
    unit,
    status,
}: {
    label: string;
    value: string | number;
    unit?: string;
    status?: string;
}) {
    return (
        <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>{label}</Text>
            <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{value}</Text>
                {unit && <Text style={styles.metricUnit}>{unit}</Text>}
            </View>
            {status && (
                <View style={styles.metricStatusPill}>
                    <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
                    <Text style={styles.metricStatusText}>{status}</Text>
                </View>
            )}
        </View>
    );
}

function MotionAxisGraph() {
    return (
        <View style={styles.graphCard}>
            <View style={styles.graphAxisRow}>
                <Text style={styles.graphAxisLabel}>X</Text>
                <Text style={styles.graphAxisLabel}>Y</Text>
                <Text style={styles.graphAxisLabel}>Z</Text>
            </View>
            <SensorWaveform height={60} showGrid showBaseline />
        </View>
    );
}

function SpiralTrajectoryGraph() {
    const size = 140;
    const c = size / 2;
    return (
        <View style={[styles.graphCard, { alignItems: 'center' }]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Line x1={c} y1={0} x2={c} y2={size} stroke={COLORS.border} strokeWidth={1} />
                <Line x1={0} y1={c} x2={size} y2={c} stroke={COLORS.border} strokeWidth={1} />
                {[0.15, 0.28, 0.41].map((f, i) => (
                    <Circle
                        key={i}
                        cx={c}
                        cy={c}
                        r={f * size * 0.5}
                        stroke={COLORS.border}
                        strokeWidth={1}
                        strokeDasharray="2,3"
                        fill="none"
                    />
                ))}
                {/* reference path (ideal spiral, dashed) */}
                <Path
                    d="M70,70 Q75,60 85,65 Q100,73 90,90 Q75,110 55,95 Q35,80 50,55 Q68,32 95,42"
                    stroke={COLORS.textDim}
                    strokeWidth={1}
                    strokeDasharray="2,3"
                    fill="none"
                />
                {/* recorded trajectory (accent, solid) */}
                <Path
                    d="M70,70 Q76,58 87,63 Q104,72 92,92 Q73,114 52,96 Q30,78 48,52 Q68,28 98,40"
                    stroke={COLORS.cyan}
                    strokeWidth={1.4}
                    fill="none"
                />
                <Circle cx={70} cy={70} r={2.5} fill={COLORS.textDim} />
                <Circle cx={98} cy={40} r={2.5} fill={COLORS.cyan} />
            </Svg>
            <View style={styles.spiralLegendRow}>
                <View style={styles.spiralLegendItem}>
                    <View style={[styles.legendSwatch, { backgroundColor: COLORS.textDim }]} />
                    <Text style={styles.spiralLegendText}>REFERENCE</Text>
                </View>
                <View style={styles.spiralLegendItem}>
                    <View style={[styles.legendSwatch, { backgroundColor: COLORS.cyan }]} />
                    <Text style={styles.spiralLegendText}>RECORDED</Text>
                </View>
            </View>
        </View>
    );
}

function TappingCadenceGraph() {
    return (
        <View style={styles.graphCard}>
            <View style={styles.tickTimeline}>
                {TAP_INTERVAL_TICKS.map((h, i) => (
                    <View key={i} style={[styles.timelineTick, { height: h }]} />
                ))}
            </View>
        </View>
    );
}

export default function DetailedMetricsScreen() {
    const router = useRouter();
    const [baselineSaved, setBaselineSaved] = useState(false);

    const handleSaveToBaseline = () => {
        // Frontend-only interaction — no backend persistence yet.
        setBaselineSaved(true);
    };

    const currentPercent = Math.min(100, MOCK_METRICS.baseline.current);
    const baselinePercent = Math.min(100, MOCK_METRICS.baseline.baseline);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            {/* STATIC HEADER */}
            <View style={styles.headerRow}>
                <Pressable onPress={() => router.push('/session-detail')} hitSlop={12}>
                    <Text style={styles.backArrow}>←</Text>
                </Pressable>
                <Text style={styles.headerTitle}>DETAILED METRICS</Text>
                <View style={styles.verifiedGroup}>
                    <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
                    <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
            </View>
            <Text style={styles.sessionTag}>SESSION / {SESSION_ID}</Text>
            <View style={styles.headerDivider} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* INTRO */}
                <Text style={styles.introLabel}>KINEMATIC ANALYSIS</Text>
                <View style={styles.heroBlock}>
                    <Text style={styles.heroLine}>DETAILED</Text>
                    <Text style={[styles.heroLine, styles.heroLineAccent]}>
                        METRICS.
                    </Text>
                </View>
                <Text style={styles.introBody}>
                    A closer look at the movement signals captured across today's
                    assessment.
                </Text>
                <View style={styles.introMetaRow}>
                    <Text style={styles.introMetaText}>3 PROTOCOLS</Text>
                    <Text style={styles.introMetaText}>
                        {MOCK_METRICS.captureWindowSec.toFixed(0)} SEC TOTAL CAPTURE
                    </Text>
                </View>

                <View style={styles.divider} />

                {/* 01 MOTION */}
                <SectionLabel index="01" name="MOTION" />
                <Text style={styles.sectionTitle}>
                    KINEMATIC{'\n'}STABILITY
                </Text>
                <Text style={styles.sectionSupporting}>
                    Movement signal characteristics recorded during the motion capture
                    protocol.
                </Text>

                <MotionAxisGraph />

                <View style={styles.metricsGrid}>
                    <MetricItem
                        label="TREMOR AMPLITUDE"
                        value={MOCK_METRICS.motion.tremorAmplitude.toFixed(2)}
                        unit="M/S²"
                    />
                    <MetricItem
                        label="DOMINANT FREQUENCY"
                        value={MOCK_METRICS.motion.dominantFrequency.toFixed(1)}
                        unit="HZ"
                    />
                    <MetricItem
                        label="RMS MOVEMENT"
                        value={MOCK_METRICS.motion.rmsMovement.toFixed(2)}
                        unit="M/S²"
                    />
                    <MetricItem
                        label="AXIS STABILITY"
                        value={MOCK_METRICS.motion.axisStability.toFixed(1)}
                        unit="%"
                        status="STABLE"
                    />
                    <MetricItem
                        label="SIGNAL QUALITY"
                        value={MOCK_METRICS.motion.signalQuality.toFixed(1)}
                        unit="%"
                        status="NOMINAL"
                    />
                    <MetricItem
                        label="DRIFT DELTA"
                        value={`±${MOCK_METRICS.motion.driftDelta.toFixed(2)}`}
                        unit="M/S²"
                        status="CALIBRATED"
                    />
                </View>

                <View style={styles.interpretationBlock}>
                    <Text style={styles.interpretationLabel}>MOVEMENT PROFILE</Text>
                    <Text style={styles.interpretationText}>
                        Movement variability remained within the recorded assessment
                        range.
                    </Text>
                </View>

                <View style={styles.divider} />

                {/* 02 SPIRAL */}
                <SectionLabel index="02" name="SPIRAL" />
                <Text style={styles.sectionTitle}>
                    TRAJECTORY{'\n'}ANALYSIS
                </Text>
                <Text style={styles.sectionSupporting}>
                    Measures derived from the recorded touch trajectory.
                </Text>

                <SpiralTrajectoryGraph />

                <View style={styles.metricsGrid}>
                    <MetricItem
                        label="PATH DEVIATION"
                        value={MOCK_METRICS.spiral.pathDeviation.toFixed(1)}
                        unit="%"
                    />
                    <MetricItem
                        label="PATH STABILITY"
                        value={MOCK_METRICS.spiral.pathStability.toFixed(1)}
                        unit="%"
                        status="NOMINAL"
                    />
                    <MetricItem
                        label="TRACE SMOOTHNESS"
                        value={MOCK_METRICS.spiral.traceSmoothness.toFixed(1)}
                        unit="%"
                    />
                    <MetricItem
                        label="VELOCITY VARIATION"
                        value={MOCK_METRICS.spiral.velocityVariation.toFixed(1)}
                        unit="%"
                    />
                    <MetricItem
                        label="COMPLETION TIME"
                        value={MOCK_METRICS.spiral.completionTime.toFixed(1)}
                        unit="SEC"
                    />
                    <MetricItem
                        label="TRACE POINTS"
                        value={MOCK_METRICS.spiral.tracePoints}
                    />
                </View>

                <View style={styles.interpretationBlock}>
                    <Text style={styles.interpretationLabel}>TRAJECTORY PROFILE</Text>
                    <Text style={styles.interpretationText}>
                        The recorded trace remained close to the reference path with
                        measurable variation in smoothness and velocity.
                    </Text>
                </View>

                <View style={styles.divider} />

                {/* 03 TAPPING */}
                <SectionLabel index="03" name="TAPPING" />
                <Text style={styles.sectionTitle}>
                    INTERVAL{'\n'}CADENCE
                </Text>
                <Text style={styles.sectionSupporting}>
                    Measures derived from the timing and consistency of successive
                    taps.
                </Text>

                <TappingCadenceGraph />

                <View style={styles.metricsGrid}>
                    <MetricItem
                        label="TAP COUNT"
                        value={MOCK_METRICS.tapping.tapCount}
                        unit="TAPS"
                    />
                    <MetricItem
                        label="MEAN INTERVAL"
                        value={MOCK_METRICS.tapping.meanInterval}
                        unit="MS"
                    />
                    <MetricItem
                        label="INTERVAL RMS"
                        value={MOCK_METRICS.tapping.intervalRms}
                        unit="MS"
                    />
                    <MetricItem
                        label="CADENCE"
                        value={MOCK_METRICS.tapping.cadence.toFixed(2)}
                        unit="HZ"
                        status="NOMINAL"
                    />
                    <MetricItem
                        label="INTERVAL VARIANCE"
                        value={MOCK_METRICS.tapping.intervalVariance.toFixed(1)}
                        unit="%"
                    />
                    <MetricItem
                        label="CONTACT LATENCY"
                        value={MOCK_METRICS.tapping.contactLatency.toFixed(1)}
                        unit="MS"
                    />
                </View>

                <View style={styles.interpretationBlock}>
                    <Text style={styles.interpretationLabel}>RHYTHM PROFILE</Text>
                    <Text style={styles.interpretationText}>
                        The recorded tapping pattern shows measurable interval variation
                        across the assessment window.
                    </Text>
                </View>

                <View style={styles.divider} />

                {/* CROSS-PROTOCOL SUMMARY */}
                <Text style={styles.sectionLabel}>CROSS-PROTOCOL</Text>
                <Text style={styles.sectionTitle}>
                    ASSESSMENT{'\n'}SUMMARY
                </Text>
                <Text style={styles.sectionSupporting}>
                    Three movement protocols, one session profile.
                </Text>

                <View style={styles.summaryHeaderRow}>
                    <Text style={[styles.summaryHeaderText, { flex: 1.4 }]}>
                        PROTOCOL
                    </Text>
                    <Text style={[styles.summaryHeaderText, { flex: 1 }]}>SCORE</Text>
                    <Text
                        style={[styles.summaryHeaderText, { flex: 1, textAlign: 'right' }]}
                    >
                        STATUS
                    </Text>
                </View>
                {MOCK_METRICS.summary.map((row, i) => (
                    <View key={row.protocol}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryProtocol, { flex: 1.4 }]}>
                                {row.protocol}
                            </Text>
                            <Text style={[styles.summaryScore, { flex: 1 }]}>
                                {row.score} / 100
                            </Text>
                            <Text
                                style={[
                                    styles.summaryStatus,
                                    { flex: 1, textAlign: 'right' },
                                    row.status === 'CALIBRATED' && { color: COLORS.cyan },
                                ]}
                            >
                                {row.status}
                            </Text>
                        </View>
                        {i < MOCK_METRICS.summary.length - 1 && (
                            <View style={styles.summaryDivider} />
                        )}
                    </View>
                ))}

                <View style={styles.divider} />

                {/* BASELINE COMPARISON */}
                <Text style={styles.sectionLabel}>PERSONAL BASELINE</Text>

                <View style={styles.baselineStatsRow}>
                    <View>
                        <Text style={styles.baselineStatLabel}>CURRENT SESSION</Text>
                        <Text style={[styles.baselineStatValue, { color: COLORS.cyan }]}>
                            {MOCK_METRICS.baseline.current.toFixed(1)}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.baselineStatLabel}>BASELINE</Text>
                        <Text style={styles.baselineStatValue}>
                            {MOCK_METRICS.baseline.baseline.toFixed(1)}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.baselineStatLabel}>DELTA</Text>
                        <Text style={styles.baselineStatValue}>
                            {MOCK_METRICS.baseline.delta.toFixed(1)}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.baselineStatLabel}>VARIANCE</Text>
                        <Text style={styles.baselineStatValue}>
                            {MOCK_METRICS.baseline.variance.toFixed(1)}%
                        </Text>
                    </View>
                </View>

                <View style={styles.baselineVizBlock}>
                    <View style={styles.baselineVizRow}>
                        <Text style={styles.baselineVizLabel}>BASELINE</Text>
                        <View style={styles.baselineTrack}>
                            <View
                                style={[
                                    styles.baselineDotOuter,
                                    { left: `${baselinePercent}%` },
                                ]}
                            />
                        </View>
                    </View>
                    <View style={styles.baselineVizRow}>
                        <Text style={styles.baselineVizLabel}>CURRENT</Text>
                        <View style={styles.baselineTrack}>
                            <View
                                style={[
                                    styles.baselineDotCyan,
                                    { left: `${currentPercent}%` },
                                ]}
                            />
                        </View>
                    </View>
                </View>

                <Text style={styles.baselineSupporting}>
                    Current session values are displayed relative to the established
                    personal baseline.
                </Text>

                <View style={styles.divider} />

                {/* DATA QUALITY */}
                <Text style={styles.sectionLabel}>DATA QUALITY</Text>
                {MOCK_METRICS.dataQuality.map((q) => (
                    <View key={q.label} style={styles.qualityRow}>
                        <Text style={styles.qualityLabel}>{q.label}</Text>
                        <View style={styles.qualityStatusGroup}>
                            <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
                            <Text style={styles.qualityValue}>{q.value.toFixed(1)}% VALID</Text>
                        </View>
                    </View>
                ))}
                <View style={styles.qualityRow}>
                    <Text style={styles.qualityLabel}>SESSION SYNC</Text>
                    <View style={styles.qualityStatusGroup}>
                        <View style={[styles.dot, { backgroundColor: COLORS.cyan }]} />
                        <Text style={[styles.qualityValue, { color: COLORS.cyan }]}>
                            VERIFIED
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* RAW DATA */}
                <Text style={styles.sectionLabel}>RAW DATA</Text>
                <View style={styles.rawDataRow}>
                    <Text style={styles.rawDataLabel}>SESSION ID</Text>
                    <Text style={styles.rawDataValue}>{SESSION_ID}</Text>
                </View>
                <View style={styles.rawDataRow}>
                    <Text style={styles.rawDataLabel}>CAPTURE WINDOW</Text>
                    <Text style={styles.rawDataValue}>
                        {MOCK_METRICS.rawData.captureWindow}
                    </Text>
                </View>
                <View style={styles.rawDataRow}>
                    <Text style={styles.rawDataLabel}>MOTION SAMPLE RATE</Text>
                    <Text style={styles.rawDataValue}>
                        {MOCK_METRICS.rawData.motionSampleRate}
                    </Text>
                </View>
                <View style={styles.rawDataRow}>
                    <Text style={styles.rawDataLabel}>TOUCH SAMPLES</Text>
                    <Text style={styles.rawDataValue}>
                        {MOCK_METRICS.rawData.touchSamples}
                    </Text>
                </View>
                <View style={styles.rawDataRow}>
                    <Text style={styles.rawDataLabel}>CHANNELS</Text>
                    <Text style={styles.rawDataValue}>
                        ACC X/Y/Z · GYRO X/Y/Z · TOUCH X/Y
                    </Text>
                </View>

                <View style={styles.divider} />

                {/* BOTTOM ACTIONS */}
                <Pressable
                    style={({ pressed }) => [
                        styles.ctaButton,
                        pressed && styles.ctaButtonPressed,
                    ]}
                    onPress={() => router.push('/session-detail')}
                >
                    <Text style={styles.ctaText}>BACK TO SESSION</Text>
                    <Text style={styles.ctaArrow}>→</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && styles.secondaryButtonPressed,
                    ]}
                    onPress={handleSaveToBaseline}
                >
                    <Text style={styles.secondaryText}>
                        {baselineSaved ? 'BASELINE SAVED' : 'SAVE TO BASELINE'}
                    </Text>
                </Pressable>

                {/* DISCLAIMER */}
                <Text style={styles.disclaimerTitle}>
                    MONITORING AID · NOT A DIAGNOSTIC TOOL
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

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    backArrow: { fontSize: 18, color: COLORS.textPrimary },
    headerTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        color: COLORS.textPrimary,
    },
    verifiedGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    verifiedText: { fontSize: 9, letterSpacing: 0.6, color: COLORS.green },
    dot: { width: 5, height: 5, borderRadius: 2.5 },
    sessionTag: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        paddingHorizontal: 20,
        marginTop: 6,
    },
    headerDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginTop: 10,
    },

    scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 },

    introLabel: {
        fontSize: 9,
        letterSpacing: 1,
        color: COLORS.cyan,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    heroBlock: { marginBottom: 10 },
    heroLine: {
        fontFamily: 'serif',
        fontSize: 32,
        lineHeight: 31,
        fontWeight: '400',
        letterSpacing: -0.5,
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
    },
    heroLineAccent: { color: '#E8F4F2' },
    introBody: {
        fontSize: 11,
        lineHeight: 17,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    introMetaRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
    introMetaText: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },

    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 22 },

    sectionLabel: {
        fontSize: 9,
        letterSpacing: 1,
        color: COLORS.cyan,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    sectionTitle: {
        fontFamily: 'serif',
        fontSize: 24,
        lineHeight: 24,
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    sectionSupporting: {
        fontSize: 11,
        lineHeight: 16,
        color: COLORS.textSecondary,
        marginBottom: 14,
    },

    graphCard: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 4,
        backgroundColor: COLORS.cardBg,
        padding: 12,
        marginBottom: 14,
    },
    graphAxisRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
    graphAxisLabel: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textDim,
    },

    spiralLegendRow: { flexDirection: 'row', gap: 14, marginTop: 8 },
    spiralLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendSwatch: { width: 8, height: 2 },
    spiralLegendText: {
        fontSize: 7,
        letterSpacing: 0.5,
        color: COLORS.textDim,
    },

    tickTimeline: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 5,
        height: 30,
        justifyContent: 'center',
    },
    timelineTick: {
        width: 2,
        backgroundColor: COLORS.cyan,
        opacity: 0.75,
    },

    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    metricItem: {
        width: '31%',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 4,
        padding: 8,
    },
    metricLabel: {
        fontSize: 6.5,
        letterSpacing: 0.4,
        color: COLORS.textDim,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    metricValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
    metricValue: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    metricUnit: { fontSize: 8, color: COLORS.textSecondary, marginBottom: 1 },
    metricStatusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 4,
    },
    metricStatusText: { fontSize: 6.5, color: COLORS.green, letterSpacing: 0.3 },

    interpretationBlock: {
        borderLeftWidth: 2,
        borderLeftColor: COLORS.border,
        paddingLeft: 12,
    },
    interpretationLabel: {
        fontSize: 8,
        letterSpacing: 0.8,
        color: COLORS.textDim,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    interpretationText: {
        fontSize: 10,
        lineHeight: 15,
        color: COLORS.textSecondary,
    },

    summaryHeaderRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    summaryHeaderText: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    summaryDivider: { height: 1, backgroundColor: COLORS.border, opacity: 0.5 },
    summaryProtocol: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        color: COLORS.textPrimary,
    },
    summaryScore: { fontSize: 10, color: COLORS.textSecondary },
    summaryStatus: {
        fontSize: 9,
        letterSpacing: 0.4,
        color: COLORS.green,
        textTransform: 'uppercase',
    },

    baselineStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    baselineStatLabel: {
        fontSize: 7,
        letterSpacing: 0.5,
        color: COLORS.textDim,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    baselineStatValue: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },

    baselineVizBlock: { marginBottom: 12 },
    baselineVizRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    baselineVizLabel: {
        width: 60,
        fontSize: 8,
        letterSpacing: 0.5,
        color: COLORS.textDim,
    },
    baselineTrack: {
        flex: 1,
        height: 2,
        backgroundColor: COLORS.border,
        position: 'relative',
    },
    baselineDotOuter: {
        position: 'absolute',
        top: -3,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.textDim,
        transform: [{ translateX: -4 }],
    },
    baselineDotCyan: {
        position: 'absolute',
        top: -3,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.cyan,
        transform: [{ translateX: -4 }],
    },
    baselineSupporting: {
        fontSize: 10,
        lineHeight: 15,
        color: COLORS.textSecondary,
    },

    qualityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    qualityLabel: {
        fontSize: 9,
        letterSpacing: 0.5,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
    qualityStatusGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    qualityValue: { fontSize: 9, color: COLORS.green },

    rawDataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    rawDataLabel: {
        fontSize: 8,
        letterSpacing: 0.5,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },
    rawDataValue: {
        fontSize: 9,
        color: COLORS.textSecondary,
        textAlign: 'right',
        flexShrink: 1,
        marginLeft: 10,
    },

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