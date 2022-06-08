import TRTC, { LocalStream } from 'trtc-js-sdk';

export default async function checkDevices(localStream: LocalStream) {
  // 1. 保存一份设备列表
  let prevDevices = await TRTC.getDevices();
  // 2. 监听设备变更事件
  navigator.mediaDevices.addEventListener('devicechange', async () => {
    // 3. 设备变更时，获取变更后的设备列表，用于和 prevDevices 比对
    const devices = await TRTC.getDevices();
    // 4. 新增的设备列表
    const devicesAdded = devices.filter((device) => prevDevices.findIndex(({ deviceId }) => device.deviceId === deviceId) < 0);
    // 5. 移除的设备列表
    const devicesRemoved = prevDevices.filter((prevDevice) => devices.findIndex(({ deviceId }) => prevDevice.deviceId === deviceId) < 0);
    if (devicesAdded.length > 0) {
      handleDevicesAdded(devicesAdded);
    }
    if (devicesRemoved.length > 0) {
      handleDevicesRemoved(devicesRemoved);
    }
    prevDevices = devices;
  });

  function handleDevicesAdded(devicesAdded: any[]) {
    devicesAdded.forEach((device) => {
      if (device.kind === 'audioinput') {
        // 提示用户检测到新麦克风插入。若用户需要切换到新设备，可以调用 localStream.switchDevice 接口切换设备
      } else if (device.kind === 'videoinput') {
        // 提示用户检测到新摄像头插入。若用户需要切换到新设备，可以调用 localStream.switchDevice 接口切换设备
      }
    });
  }
  function handleDevicesRemoved(devicesRemoved: any[]) {
    devicesRemoved.forEach((device) => {
      if (device.kind === 'audioinput') {
        // 提示用户检测到麦克风拔出。
        if (isCurrentMicrophoneRemoved(device.deviceId)) {
          // 当前正在使用的麦克风被拔出
        }
      } else if (device.kind === 'videoinput') {
        // 提示用户检测到摄像头拔出。
        if (isCurrentCameraRemoved(device.deviceId)) {
          // 当前正在使用的摄像头被拔出
        }
      }
    });
  }

  // 检测是否当前正在使用的麦克风设备被拔出
  // microphoneIdRemoved 是被移除的麦克风 deviceId
  function isCurrentMicrophoneRemoved(microphoneIdRemoved: any) {
    const audioTrack = localStream.getAudioTrack();
    if (audioTrack && audioTrack.getSettings().deviceId === microphoneIdRemoved) {
      return true;
    }
    return false;
  }
  // 检测是否当前正在使用的摄像头设备被拔出
  // cameraIdRemoved 是被移除的摄像头 deviceId
  function isCurrentCameraRemoved(cameraIdRemoved: any) {
    const videoTrack = localStream.getVideoTrack();
    if (videoTrack && videoTrack.getSettings().deviceId === cameraIdRemoved) {
      return true;
    }
    return false;
  }
}
