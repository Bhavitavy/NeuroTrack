import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';

type SensorWaveformProps = {
    // Normalized samples (0–1). Replace this with real sensor-derived
    // values later — e.g. magnitude of accelerometer vector per sample.
    data?: number[];
    color?: string;
    height?: number;
    strokeWidth?: number;
    showBaseline?: boolean;
    showGrid?: boolean;
};

const VIEW_W = 600;
const VIEW_H = 160;

// Deterministic mock "telemetry" noise — small jitter around center,
// not a giant decorative sine wave. Swap this out for real data later.
const MOCK_TELEMETRY_DATA = [
    0.5, 0.51, 0.49, 0.52, 0.48, 0.5, 0.53, 0.5, 0.47, 0.5, 0.55, 0.52, 0.48,
    0.5, 0.51, 0.46, 0.5, 0.54, 0.5, 0.49, 0.52, 0.5, 0.48, 0.51, 0.5, 0.53,
    0.49, 0.5, 0.52, 0.48,
];

function buildPath(data: number[]): string {
    if (data.length === 0) return '';
    const stepX = VIEW_W / (data.length - 1);
    let d = '';
    data.forEach((v, i) => {
        const x = i * stepX;
        const y = VIEW_H - v * VIEW_H;
        d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    });
    return d;
}

export default function SensorWaveform({
    data = MOCK_TELEMETRY_DATA,
    color = '#00E5F5',
    height = 100,
    strokeWidth = 1.2,
    showBaseline = true,
    showGrid = false,
}: SensorWaveformProps) {
    const path = buildPath(data);

    return (
        <View style={{ width: '100%', height }}>
            <Svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                preserveAspectRatio="none"
            >
                {showGrid && (
                    <>
                        <Line
                            x1="0"
                            y1={VIEW_H * 0.25}
                            x2={VIEW_W}
                            y2={VIEW_H * 0.25}
                            stroke="#20282B"
                            strokeWidth={1}
                            vectorEffect="non-scaling-stroke"
                        />
                        <Line
                            x1="0"
                            y1={VIEW_H * 0.75}
                            x2={VIEW_W}
                            y2={VIEW_H * 0.75}
                            stroke="#20282B"
                            strokeWidth={1}
                            vectorEffect="non-scaling-stroke"
                        />
                    </>
                )}
                {showBaseline && (
                    <Line
                        x1="0"
                        y1={VIEW_H / 2}
                        x2={VIEW_W}
                        y2={VIEW_H / 2}
                        stroke="#20282B"
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                    />
                )}
                <Path
                    d={path}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                />
            </Svg>
        </View>
    );
}