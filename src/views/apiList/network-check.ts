import TRTC, { Client, LocalStream } from 'trtc-js-sdk';

interface TestResult {
  // 记录上行网络质量数据
  uplinkNetworkQualities: Array<number>,
  // 记录下行网络质量数据
  downlinkNetworkQualities: Array<number>,
  average: {
    uplinkNetworkQuality: number,
    downlinkNetworkQuality: number,
  },
}
interface ClientProfile {
  mode: 'rtc' | 'live',
  sdkAppId: number,
  userId: string,
  userSig: string,
}

export default function checkNetwork(clietProfile: ClientProfile) {
  let uplinkClient: Client = null; // 用于检测上行网络质量
  let downlinkClient: Client = null; // 用于检测下行网络质量
  let localStream: LocalStream = null; // 用于测试的流
  const testResult: TestResult = {
    // 记录上行网络质量数据
    uplinkNetworkQualities: [],
    // 记录下行网络质量数据
    downlinkNetworkQualities: [],
    average: {
      uplinkNetworkQuality: 0,
      downlinkNetworkQuality: 0,
    },
  };
  // 1. 检测上行网络质量
  async function testUplinkNetworkQuality() {
    uplinkClient = TRTC.createClient(clietProfile);
    localStream = TRTC.createStream({ audio: true, video: true });
    // 根据实际业务场景设置 video profile
    localStream.setVideoProfile('480p');
    await localStream.initialize();
    uplinkClient.on('network-quality', (event) => {
      const { uplinkNetworkQuality } = event;
      testResult.uplinkNetworkQualities.push(uplinkNetworkQuality);
    });
    // 加入用于测试的房间，房间号需要随机，避免冲突
    await uplinkClient.join({ roomId: 8080 });
    await uplinkClient.publish(localStream);
  }
  // 2. 检测下行网络质量
  async function testDownlinkNetworkQuality() {
    downlinkClient = TRTC.createClient(clietProfile);
    downlinkClient.on('stream-added', async (event) => {
      await downlinkClient.subscribe(event.stream, { audio: true, video: true });
      // 订阅成功后开始监听网络质量事件
      // eslint-disable-next-line no-shadow
      downlinkClient.on('network-quality', (event) => {
        const { downlinkNetworkQuality } = event;
        testResult.downlinkNetworkQualities.push(downlinkNetworkQuality);
      });
    });
    // 加入用于测试的房间，房间号需要随机，避免冲突
    await downlinkClient.join({ roomId: 8080 });
  }
  // 3. 开始检测
  testUplinkNetworkQuality();
  testDownlinkNetworkQuality();
  // 4. 15s 后停止检测，计算平均网络质量
  setTimeout(() => {
    // 计算上行平均网络质量
    if (testResult.uplinkNetworkQualities.length > 0) {
      testResult.average.uplinkNetworkQuality = Math.ceil(
        testResult.uplinkNetworkQualities.reduce((value, current) => value + current, 0) / testResult.uplinkNetworkQualities.length,
      );
    }
    if (testResult.downlinkNetworkQualities.length > 0) {
      // 计算下行平均网络质量
      testResult.average.downlinkNetworkQuality = Math.ceil(
        testResult.downlinkNetworkQualities.reduce((value, current) => value + current, 0) / testResult.downlinkNetworkQualities.length,
      );
    }
    // 检测结束，清理相关状态。
    uplinkClient.leave();
    downlinkClient.leave();
    localStream.close();
    console.log(`网络检查结果：${JSON.stringify(testResult)}`);
  }, 15 * 1000);
}
