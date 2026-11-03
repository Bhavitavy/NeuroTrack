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

const TESTS = [
    { num: '01', name: 'MOTION' },
    { num: '02', name: 'SPIRAL' },
    { num: '03', name: 'TAPPING' },
];

export default function TappingCompleteScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topRow}>
                    <Text style={styles.testLabel}>TEST 03 / 03</Text>
                    <View style={styles.statusPill}>
                        <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
                        <Text style={styles.statusText}>COMPLETE</Text>
                    </View>
                </View>

                <View style={styles.heroBlock}>
                    <Text style={styles.heroLine}>ASSESSMENT</Text>
                    <Text style={[styles.heroLine, styles.heroLineAccent]}>
                        COMPLETE.
                    </Text>
                </View>

                <Text style={styles.supporting}>
                    All three movement protocols have been recorded.
                </Text>

                <View style={styles.divider} />
                {TESTS.map((t, i) => (
                    <View key={t.num}>
                        <View style={styles.checklistRow}>
                            <Text style={styles.checklistNum}>{t.num}</Text>
                            <Text style={styles.checklistName}>{t.name}</Text>
                            <View style={styles.checklistStatus}>
                                <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
                                <Text style={styles.checklistStatusText}>CAPTURED</Text>
                            </View>
                        </View>
                        {i < TESTS.length - 1 && <View style={styles.checklistDivider} />}
                    </View>
                ))}
                <View style={styles.divider} />

                <View style={styles.readyBlock}>
                    <Text style={styles.readyTitle}>Your session is ready for review.</Text>
                    <Text style={styles.readyBody}>
                        The recorded movement data can now be compared across protocols
                        and against your personal baseline.
                    </Text>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.ctaButton,
                        pressed && styles.ctaButtonPressed,
                    ]}
                    onPress={() => router.push('/session-detail')}
                >
                    <Text style={styles.ctaText}>VIEW SESSION</Text>
                    <Text style={styles.ctaArrow}>→</Text>
                </Pressable>

                <Pressable
                    onPress={() => router.push('/explore')}
                    style={styles.backButton}
                >
                    <Text style={styles.backText}>RETURN TO OVERVIEW</Text>
                </Pressable>

                <Text style={styles.disclaimer}>
                    MONITORING AID · NOT A DIAGNOSTIC TOOL
                </Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    testLabel: {
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
        fontSize: 34,
        lineHeight: 33,
        fontWeight: '400',
        letterSpacing: -0.5,
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
    },
    heroLineAccent: { color: COLORS.cyan },
    supporting: {
        fontSize: 12,
        lineHeight: 18,
        color: COLORS.textSecondary,
        marginBottom: 22,
    },
    divider: { height: 1, backgroundColor: COLORS.border },
    checklistRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
    },
    checklistDivider: { height: 1, backgroundColor: COLORS.border, opacity: 0.5 },
    checklistNum: {
        fontFamily: 'serif',
        fontSize: 20,
        color: COLORS.textDim,
        width: 26,
    },
    checklistName: {
        flex: 1,
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.8,
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
    },
    checklistStatus: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    checklistStatusText: { fontSize: 8, letterSpacing: 0.5, color: COLORS.green },
    readyBlock: { marginTop: 26, marginBottom: 26 },
    readyTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    readyBody: { fontSize: 11, lineHeight: 17, color: COLORS.textSecondary },
    ctaButton: {
        backgroundColor: COLORS.cyan,
        borderRadius: 3,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
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
    backButton: { alignItems: 'center', marginBottom: 24 },
    backText: {
        fontSize: 9,
        letterSpacing: 0.8,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
    disclaimer: {
        fontSize: 8,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
});