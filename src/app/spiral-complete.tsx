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

const SUMMARY_ROWS = [
    { label: 'SPIRAL TRACE', value: '10.0 SEC' },
    { label: 'INPUT', value: 'TOUCH TRAJECTORY' },
    { label: 'STATUS', value: 'CAPTURE COMPLETE' },
];

export default function SpiralCompleteScreen() {
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
                    <Text style={styles.testLabel}>TEST 02 / 03</Text>
                    <View style={styles.statusPill}>
                        <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
                        <Text style={styles.statusText}>COMPLETE</Text>
                    </View>
                </View>

                <View style={styles.heroBlock}>
                    <Text style={styles.heroLine}>TEST 02</Text>
                    <Text style={[styles.heroLine, styles.heroLineAccent]}>
                        COMPLETE.
                    </Text>
                </View>

                <Text style={styles.supporting}>
                    Spiral trace captured successfully.
                </Text>
                <Text style={styles.supportingSecondary}>
                    Your trajectory has been recorded for movement analysis.
                </Text>

                <View style={styles.divider} />
                {SUMMARY_ROWS.map((row, i) => (
                    <View key={row.label}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{row.label}</Text>
                            <Text style={styles.summaryValue}>{row.value}</Text>
                        </View>
                        {i < SUMMARY_ROWS.length - 1 && (
                            <View style={styles.summaryDivider} />
                        )}
                    </View>
                ))}
                <View style={styles.divider} />

                <View style={styles.nextBlock}>
                    <Text style={styles.nextLabel}>
                        NEXT TEST: TAPPING / INTERVAL CADENCE
                    </Text>
                    <Text style={styles.nextBody}>
                        Tap the target at a natural, steady rhythm. Keep your pace
                        comfortable and consistent.
                    </Text>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.ctaButton,
                        pressed && styles.ctaButtonPressed,
                    ]}
                    onPress={() => router.push('/tapping-instructions')}
                >
                    <Text style={styles.ctaText}>PROCEED TO TAPPING TEST</Text>
                    <Text style={styles.ctaArrow}>→</Text>
                </Pressable>
                <Text style={styles.nextTestTag}>TEST 03 / 03</Text>

                <Pressable
                    onPress={() => router.push('/explore')}
                    style={styles.backButton}
                >
                    <Text style={styles.backText}>BACK TO OVERVIEW</Text>
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
        flexGrow: 1,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
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
    heroBlock: { marginBottom: 14 },
    heroLine: {
        fontFamily: 'serif',
        fontSize: 38,
        lineHeight: 37,
        fontWeight: '400',
        letterSpacing: -0.5,
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
    },
    heroLineAccent: { color: COLORS.cyan },
    supporting: {
        fontSize: 12,
        lineHeight: 18,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    supportingSecondary: {
        fontSize: 11,
        lineHeight: 16,
        color: COLORS.textSecondary,
        marginBottom: 24,
    },
    divider: { height: 1, backgroundColor: COLORS.border },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    summaryDivider: { height: 1, backgroundColor: COLORS.border, opacity: 0.5 },
    summaryLabel: {
        fontSize: 9,
        letterSpacing: 0.8,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },
    summaryValue: {
        fontSize: 10,
        letterSpacing: 0.4,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
    nextBlock: { marginTop: 26, marginBottom: 26 },
    nextLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        color: COLORS.cyan,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    nextBody: { fontSize: 12, lineHeight: 18, color: COLORS.textSecondary },
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
    nextTestTag: {
        fontSize: 8,
        letterSpacing: 1,
        color: COLORS.textDim,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 22,
    },
    backButton: { alignItems: 'center' },
    backText: {
        fontSize: 9,
        letterSpacing: 0.8,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
});