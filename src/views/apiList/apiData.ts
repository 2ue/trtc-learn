import TRTC from 'trtc-js-sdk';
import { ElNotification } from 'element-plus/es';

interface APIData {
  text: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  handler: Function;
  buttonProps?: object;
}

const apiData: Array<APIData> = [
  {
    text: '版本号',
    handler() {
      ElNotification.success(`当前版本号：${TRTC.VERSION}`);
    },
  },
  {
    text: 'SDK支持情况',
    handler() {
      TRTC.checkSystemRequirements().then((res) => {
        ElNotification.success(`浏览器支持情况：${JSON.stringify(res, null, 2)}`);
      });
    },
  },
  // isScreenShareSupported
  {
    text: '屏幕分享支持情况',
    handler() {
      ElNotification.success(`当前浏览器${TRTC.isScreenShareSupported() ? '支持' : '不支持'}屏幕分享`);
    },
  },
  {
    text: '大小流支持情况',
    handler() {
      ElNotification.success(`当前浏览器${TRTC.isSmallStreamSupported() ? '支持' : '不支持'}开启大小流模式`);
    },
  },
];

export default apiData;
