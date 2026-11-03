import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    GestureResponderEvent,
    LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const COLORS = {
    bg: '#080B0D',
    textPrimary: '#F2F0E8',
    textSecondary: '#737A7D',
    textDim: '#3F4648',
    cyan: '#00E5F5',
    green: '#38E89B',
    border: '#20282B',
};

const CAPTURE_SECONDS = 10;

function formatCountdown(seconds: number): string {
    return Math.max(0, seconds).toFixed(1).padStart(4, '0');
}

// Same spiral generator used on the instructions screen, scaled to
// the live canvas size for the guide path underneath the user's trace.
function buildSpiralPath(
    cx: number,
    cy: number,
    startRadius: number,
    radiusStep: number,
    turns: number,
    pointsPerTurn = 50
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

type Point = { x: number; y: number };

// Smooths the raw touch-point trace using quadratic Bezier curves
// between midpoints (standard freehand-drawing smoothing technique),
// instead of connecting raw points with straight jagged lines.
function pointsToSmoothPath(points: Point[]): string {
    if (points.length === 0) return '';
    if (points.length === 1) return `M${points[0].x},${points[0].y}`;

    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;
        d += ` Q${points[i].x},${points[i].y} ${midX},${midY}`;
    }
    const last = points[points.length - 1];
    d += ` L${last.x},${last.y}`;
    return d;
}

export default function SpiralActiveScreen() {
    const router = useRouter();

    const [remaining, setRemaining] = useState(CAPTURE_SECONDS);
    const [tracePoints, setTracePoints] = useState<Point[]>([]);
    const [canvasSize, setCanvasSize] = useState(0);
    const startRef = useRef<number>(Date.now());
    const navigatedRef = useRef(false);

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
                // TODO: once real touch-trajectory capture is finalized, pass
                // the recorded trace / derived features into the processing
                // layer here before navigating.
                router.replace('/spiral-processing');
            }
        }, 100);

        return () => clearInterval(interval);
    }, [router]);

    const handleCanvasLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        const size = Math.floor(Math.min(width, height));
        if (size > 0 && size !== canvasSize) {
            setCanvasSize(size);
        }
    };

    const center = canvasSize / 2;

    const guidePath = useMemo(
        () =>
            canvasSize > 0
                ? buildSpiralPath(center, center, canvasSize * 0.02, canvasSize * 0.4, 3.2)
                : '',
        [center, canvasSize]
    );

    const guideRings = useMemo(
        () => [0.15, 0.28, 0.41, 0.54].map((f) => f * canvasSize * 0.5),
        [canvasSize]
    );

    const smoothTracePath = useMemo(
        () => pointsToSmoothPath(tracePoints),
        [tracePoints]
    );

    const handleTouch = (e: GestureResponderEvent) => {
        const { locationX, locationY } = e.nativeEvent;
        setTracePoints((prev) => [...prev, { x: locationX, y: locationY }]);
    };

    const progressPercent = Math.min(
        100,
        ((CAPTURE_SECONDS - remaining) / CAPTURE_SECONDS) * 100
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.container}>
                {/* HEADER */}
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} hitSlop={12}>
                        <Text style={styles.backArrow}>←</Text>
                    </Pressable>
                    <View style={styles.headerTitleBlock}>
                        <Text style={styles.headerEyebrow}>TEST 02 / 03</Text>
                        <Text style={styles.headerTitle}>Active Assessment</Text>
                    </View>
                    <View style={styles.livePill}>
                        <View style={styles.liveDot} />
                        <Text style={styles.livePillText}>LIVE</Text>
                    </View>
                </View>

                {/* RECORDING STATUS + INSTRUCTION (merged, compact) */}
                <View style={styles.statusRow}>
                    <View style={styles.recordingLeft}>
                        <View style={[styles.dot, { backgroundColor: COLORS.cyan }]} />
                        <Text style={styles.recordingText}>TRACE FROM CENTER OUTWARD</Text>
                    </View>
                    <Text style={styles.bufferText}>BUFFER: ACTIVE</Text>
                </View>

                {/* COMPACT TIMER STRIP */}
                <View style={styles.timerStrip}>
                    <Text style={styles.timerLabel}>T-DELTA</Text>
                    <Text style={styles.timerValue}>{formatCountdown(remaining)}s</Text>
                    <View style={styles.progressTrack}>
                        <View
                            style={[styles.progressFill, { width: `${progressPercent}%` }]}
                        />
                    </View>
                </View>

                {/* SPIRAL CANVAS — flexible, takes remaining space */}
                <View style={styles.canvasWrap} onLayout={handleCanvasLayout}>
                    {canvasSize > 0 && (
                        <View
                            style={{ width: canvasSize, height: canvasSize }}
                            onStartShouldSetResponder={() => true}
                            onMoveShouldSetResponder={() => true}
                            onStartShouldSetResponderCapture={() => true}
                            onResponderGrant={handleTouch}
                            onResponderMove={handleTouch}
                        >
                            <Svg width={canvasSize} height={canvasSize}>
                                <Line
                                    x1={center}
                                    y1={0}
                                    x2={center}
                                    y2={canvasSize}
                                    stroke={COLORS.border}
                                    strokeWidth={1}
                                />
                                <Line
                                    x1={0}
                                    y1={center}
                                    x2={canvasSize}
                                    y2={center}
                                    stroke={COLORS.border}
                                    strokeWidth={1}
                                />
                                {guideRings.map((r, i) => (
                                    <Circle
                                        key={i}
                                        cx={center}
                                        cy={center}
                                        r={r}
                                        stroke={COLORS.border}
                                        strokeWidth={1}
                                        strokeDasharray="3,4"
                                        fill="none"
                                    />
                                ))}
                                <Path
                                    d={guidePath}
                                    stroke={COLORS.border}
                                    strokeWidth={1}
                                    strokeDasharray="2,3"
                                    fill="none"
                                />
                                <Circle cx={center} cy={center} r={3} fill={COLORS.textDim} />
                                <Path
                                    d={smoothTracePath}
                                    stroke={COLORS.cyan}
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                            </Svg>
                        </View>
                    )}
                </View>

                {/* COMPACT TELEMETRY ROW */}
                <View style={styles.telemetryRow}>
                    <View style={styles.telemetryItem}>
                        <Text style={styles.telemetryLabel}>STATUS</Text>
                        <Text style={styles.telemetryValue}>ACTIVE</Text>
                    </View>
                    <View style={styles.telemetryItem}>
                        <Text style={styles.telemetryLabel}>POINTS</Text>
                        <Text style={styles.telemetryValue}>{tracePoints.length}</Text>
                    </View>
                    <View style={styles.telemetryItem}>
                        <Text style={styles.telemetryLabel}>DEVIATION</Text>
                        <Text style={styles.telemetryValue}>±0.04</Text>
                    </View>
                </View>

                {/* CANCEL */}
                <Pressable style={styles.cancelButton} onPress={() => router.back()}>
                    <Text style={styles.cancelText}>×  CANCEL TEST</Text>
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
        paddingTop: 8,
        paddingBottom: 12,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    backArrow: {
        fontSize: 18,
        color: COLORS.textPrimary,
        marginRight: 12,
        marginTop: 2,
    },
    headerTitleBlock: { flex: 1 },
    headerEyebrow: {
        fontSize: 9,
        letterSpacing: 1,
        color: COLORS.textDim,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
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
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },

    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    recordingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    recordingText: {
        fontSize: 9,
        letterSpacing: 0.4,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
    bufferText: {
        fontSize: 9,
        letterSpacing: 0.4,
        color: COLORS.green,
    },

    timerStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
    },
    timerLabel: {
        fontSize: 8,
        letterSpacing: 0.8,
        color: COLORS.textDim,
        textTransform: 'uppercase',
    },
    timerValue: {
        fontFamily: 'serif',
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    progressTrack: {
        flex: 1,
        height: 3,
        backgroundColor: COLORS.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.cyan,
    },

    canvasWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },

    telemetryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    telemetryItem: {
        alignItems: 'center',
        flex: 1,
    },
    telemetryLabel: {
        fontSize: 7,
        letterSpacing: 0.6,
        color: COLORS.textDim,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    telemetryValue: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.green,
    },

    cancelButton: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 4,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 10,
        letterSpacing: 1,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
});