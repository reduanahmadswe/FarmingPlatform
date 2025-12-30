import IoTDevice, { IIoTDevice } from './iot.model';

export const getDeviceStatus = async (deviceId: string): Promise<IIoTDevice> => {
    let device = await IoTDevice.findOne({ deviceId });
    if (!device) {
        device = await IoTDevice.create({ deviceId, waterLevel: 72, isPumpRunning: false });
    }
    return device;
};

export const updateDeviceStatus = async (deviceId: string, data: Partial<IIoTDevice>): Promise<IIoTDevice | null> => {
    return await IoTDevice.findOneAndUpdate({ deviceId }, { ...data, lastUpdated: new Date() }, { new: true });
};

export const togglePump = async (deviceId: string): Promise<IIoTDevice | null> => {
    const device = await getDeviceStatus(deviceId);
    return await IoTDevice.findOneAndUpdate(
        { deviceId },
        { isPumpRunning: !device.isPumpRunning, lastUpdated: new Date() },
        { new: true }
    );
};
