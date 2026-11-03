import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
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

const STEPS = [
    {
        num: '01',
        title: 'ONE FINGER',
        body: 'Use one finger and tap the target cleanly.',
    },
    {
        num: '02',
        title: 'NATURAL PACE',
        body: 'Choose a comfortable rhythm rather than tapping as quickly as possible.',
    },
    {
        num: '03',
        title: 'STAY CONSISTENT',
        body: 'Maintain your rhythm for the duration of the test.',
    },
];

// Static tick pattern for the rhythmic instrument visual — purely
// decorative, mimics an interval readout without any real data.
const TICK_HEIGHTS = [6, 10, 6, 14, 6, 10, 6, 14, 6, 10, 6];

export default function TappingInstructionsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topRow}>
                    <Pressable onPress={() => router.back()} hitSlop={12}>
                        <Text style={styles.backArrow}>←</Text>
                    </Pressable>
                    <Text style={styles.testLabel}>TEST 03 / 03</Text>
                    <View style={styles.statusPill}>
                        <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
                        <Text style={styles.statusText}>READY</Text>
                    </View>
                </View>

                <Text style={styles.category}>INTERVAL CADENCE ASSESSMENT</Text>

                <View style={styles.heroBlock}>
                    <Text style={styles.heroLine}>TAPPING</Text>
                    <Text style={[styles.heroLine, styles.heroLineAccent]}>TEST</Text>
                </View>

                <Text style={styles.editorial}>
                    FIND YOUR{'\n'}NATURAL{'\n'}RHYTHM.
                </Text>

                <Text style={styles.supporting}>
                    Tap the target with your finger at a comfortable, consistent pace.
                    Do not force a faster rhythm.
                </Text>

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

                {/* rhythmic tick visualization */}
                <View style={styles.tickBlock}>
                    {TICK_HEIGHTS.map((h, i) => (
                        <View
                            key={i}
                            style={[
                                styles.tick,
                                { height: h },
                                i % 4 === 3 && styles.tickAccent,
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>TOUCH INTERVALS</Text>
                    <Text style={styles.metaText}>20.0 SEC CAPTURE</Text>
                    <Text style={styles.metaText}>CADENCE ANALYSIS</Text>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.ctaButton,
                        pressed && styles.ctaButtonPressed,
                    ]}
                    onPress={() => router.push('/tapping-active')}
                >
                    <Text style={styles.ctaText}>START TAPPING TEST</Text>
                    <Text style={styles.ctaArrow}>→</Text>
                </Pressable>
                <Text style={styles.permissionNote}>
                    Tap naturally. The test will complete automatically.
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
    scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 30 },
    topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    backArrow: { fontSize: 18, color: COLORS.textPrimary, marginRight: 12 },
    testLabel: {
        flex: 1,
        fontSize: 9,
        letterSpacing: 1,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },
    statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    statusText: { fontSize: 9, letterSpacing: 0.6, color: COLORS.green },
    dot: { width: 5, height: 5, borderRadius: 2.5 },
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
    divider: { height: 1, backgroundColor: COLORS.border },
    stepRow: { flexDirection: 'row', paddingVertical: 16, gap: 14 },
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
    stepDesc: { fontSize: 11, lineHeight: 16, color: COLORS.textSecondary },
    tickBlock: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
        marginTop: 22,
        marginBottom: 14,
        justifyContent: 'center',
    },
    tick: { width: 2, backgroundColor: COLORS.textDim, borderRadius: 1 },
    tickAccent: { backgroundColor: COLORS.cyan },
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
    ctaArrow: { fontSize: 15, fontWeight: '700', color: '#080B0D' },
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