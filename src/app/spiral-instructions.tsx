import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

const COLORS = {
    bg: '#080B0D',
    textPrimary: '#F2F0E8',
    textSecondary: '#737A7D',
    textDim: '#3F4648',
    cyan: '#00E5F5',
    green: '#38E89B',
    border: '#20282B',
};

const STEPS = [
    {
        num: '01',
        title: 'START AT CENTER',
        body: 'Begin at the marked center point.',
    },
    {
        num: '02',
        title: 'FOLLOW THE LINE',
        body: 'Trace outward without lifting your finger.',
    },
    {
        num: '03',
        title: 'STAY SMOOTH',
        body: 'Move naturally and avoid sudden corrections or stops.',
    },
];

// Builds an Archimedean spiral path string for a decorative/technical
// calibration-pattern graphic. Not connected to any real trace data.
function buildSpiralPath(
    cx: number,
    cy: number,
    startRadius: number,
    radiusStep: number,
    turns: number,
    pointsPerTurn = 40
): string {
    const total = turns * pointsPerTurn;
    let d = '';
    for (let i = 0; i <= total; i++) {
        const angle = (i / pointsPerTurn) * Math.PI * 2;
        const radius = startRadius + radiusStep * (angle / (Math.PI * 2));
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    }
    return d;
}

const SPIRAL_PATH = buildSpiralPath(60, 60, 2, 8, 3.2);

export default function SpiralInstructionsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* TOP BAR */}
                <View style={styles.topRow}>
                    <Pressable onPress={() => router.back()} hitSlop={12}>
                        <Text style={styles.backArrow}>←</Text>
                    </Pressable>
                    <Text style={styles.testLabel}>TEST 02 / 03</Text>
                    <View style={styles.statusPill}>
                        <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
                        <Text style={styles.statusText}>READY</Text>
                    </View>
                </View>

                <Text style={styles.category}>COORDINATION ASSESSMENT</Text>

                {/* MAIN HEADING */}
                <View style={styles.heroBlock}>
                    <Text style={styles.heroLine}>SPIRAL</Text>
                    <Text style={[styles.heroLine, styles.heroLineAccent]}>TRACE</Text>
                </View>

                <Text style={styles.editorial}>
                    TRACE THE PATH.{'\n'}KEEP IT SMOOTH.
                </Text>

                <Text style={styles.supporting}>
                    Place your finger at the center of the spiral and trace outward in
                    one continuous, controlled motion.
                </Text>

                {/* PREPARATION STEPS */}
                <View style={styles.divider} />
                {STEPS.map((step, i) => (
                    <View key={step.num}>
                        <View style={styles.stepRow}>
                            <Text style={styles.stepNumber}>{step.num}</Text>
                            <View style={styles.stepBody}>
                                <Text style={styles.stepTitle}>{step.title}</Text>
                                <Text style={styles.stepDesc}>{step.body}</Text>
                            </View>
                        </View>
                        {i < STEPS.length - 1 && <View style={styles.divider} />}
                    </View>
                ))}
                <View style={styles.divider} />

                {/* SPIRAL CALIBRATION GRAPHIC */}
                <View style={styles.spiralBlock}>
                    <Svg width={120} height={120} viewBox="0 0 120 120">
                        <Circle
                            cx={60}
                            cy={60}
                            r={2}
                            fill={COLORS.cyan}
                        />
                        <Path
                            d={SPIRAL_PATH}
                            stroke={COLORS.cyan}
                            strokeWidth={1}
                            fill="none"
                        />
                    </Svg>
                </View>

                {/* METADATA */}
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>TOUCH TRAJECTORY</Text>
                    <Text style={styles.metaText}>10.0 SEC CAPTURE</Text>
                </View>

                {/* CTA */}
                <Pressable
                    style={({ pressed }) => [
                        styles.ctaButton,
                        pressed && styles.ctaButtonPressed,
                    ]}
                    onPress={() => router.push('/spiral-active')}
                >
                    <Text style={styles.ctaText}>START SPIRAL TEST</Text>
                    <Text style={styles.ctaArrow}>→</Text>
                </Pressable>
                <Text style={styles.permissionNote}>
                    Keep your finger on the screen throughout the trace.
                </Text>

                <Pressable onPress={() => router.back()} style={styles.cancelButton}>
                    <Text style={styles.cancelText}>CANCEL TEST</Text>
                </Pressable>
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

    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    backArrow: {
        fontSize: 18,
        color: COLORS.textPrimary,
        marginRight: 12,
    },
    testLabel: {
        flex: 1,
        fontSize: 9,
        letterSpacing: 1,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    statusText: {
        fontSize: 9,
        letterSpacing: 0.6,
        color: COLORS.green,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },

    category: {
        fontSize: 9,
        letterSpacing: 1,
        color: COLORS.cyan,
        marginBottom: 14,
        textTransform: 'uppercase',
    },

    heroBlock: { marginBottom: 14 },
    heroLine: {
        fontFamily: 'serif',
        fontSize: 34,
        lineHeight: 33,
        fontWeight: '400',
        letterSpacing: -0.5,
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
    },
    heroLineAccent: { color: '#E8F4F2' },

    editorial: {
        fontFamily: 'serif',
        fontSize: 19,
        lineHeight: 23,
        color: COLORS.textPrimary,
        marginBottom: 14,
        textTransform: 'uppercase',
    },

    supporting: {
        fontSize: 11,
        lineHeight: 17,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
    },

    stepRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        gap: 14,
    },
    stepNumber: {
        fontFamily: 'serif',
        fontSize: 24,
        color: COLORS.textDim,
        width: 30,
    },
    stepBody: { flex: 1 },
    stepTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        color: COLORS.textPrimary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    stepDesc: {
        fontSize: 11,
        lineHeight: 16,
        color: COLORS.textSecondary,
    },

    spiralBlock: {
        alignItems: 'center',
        marginTop: 22,
        marginBottom: 14,
    },

    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 26,
    },
    metaText: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },

    ctaButton: {
        backgroundColor: COLORS.cyan,
        borderRadius: 3,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ctaButtonPressed: { opacity: 0.85 },
    ctaText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        color: '#080B0D',
        textTransform: 'uppercase',
    },
    ctaArrow: {
        fontSize: 15,
        fontWeight: '700',
        color: '#080B0D',
    },

    permissionNote: {
        fontSize: 9,
        color: COLORS.textDim,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
    },

    cancelButton: { alignItems: 'center' },
    cancelText: {
        fontSize: 9,
        letterSpacing: 0.8,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
});