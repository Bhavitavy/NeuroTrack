export type MotionSample = {
    timestamp: number;
    accelerometer: { x: number; y: number; z: number };
    gyroscope: { x: number; y: number; z: number };
};

type MotionDataListener = (sample: MotionSample) => void;

/**
 * Placeholder motion sensor service.
 *
 * TODO (future integration):
 * - startMotionCapture(): subscribe to expo-sensors Accelerometer + Gyroscope,
 *   set update interval (~10ms for 100Hz), begin emitting MotionSample objects
 *   to subscribers via subscribeToMotionData.
 * - stopMotionCapture(): remove sensor subscriptions, clear internal state.
 *
 * Do NOT put sensor logic directly in screen components — always go
 * through this service so the UI stays decoupled from the sensor layer.
 */
class MotionSensorService {
    private listeners: MotionDataListener[] = [];
    private capturing = false;

    startMotionCapture(): void {
        // TODO: subscribe to real accelerometer + gyroscope here.
        this.capturing = true;
    }

    stopMotionCapture(): void {
        // TODO: unsubscribe from real sensors here.
        this.capturing = false;
    }

    subscribeToMotionData(listener: MotionDataListener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    isCapturing(): boolean {
        return this.capturing;
    }
}

export const motionSensorService = new MotionSensorService();