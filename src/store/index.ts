import { defineStore } from 'pinia';
import { genTestUserSig } from '@/utils/generateTestUserSig';

const appStore = defineStore('app', {
  state: () => ({
    sdkAppId: 1400680441,
    userId: 'testUser',
    roomId: 8888,
    secretKey: 'a1adac874b116364cee6bd4af955b629c88d57e146c4ead62b37138a039e1a1c',
    userSig: '',
    audioDeviceId: '',
    videoDeviceId: '',
    cameraList: [],
    microphoneList: [],
    logs: [],
    isJoined: false,
    isPublished: false,
    isShared: false,
    remoteStreams: [],
    invitedRemoteStreams: [],
    width: 640,
    height: 480,
    frameRate: 15,
    bitrate: 900,
  }),
  getters: {},
  actions: {
    getInitParamsStates() {
      return !!(this.sdkAppId && this.secretKey && this.roomId && this.userId);
    },
    getUserSig() {
      return this.userSig || genTestUserSig({
        sdkAppId: this.sdkAppId,
        userId: this.userId,
        secretKey: this.secretKey,
      }).userSig;
    },
    createShareLink() {
      const userId = `Guest_${Math.floor(Math.random() * 1000000)}`;
      const { userSig } = genTestUserSig({
        sdkAppId: this.sdkAppId,
        userId,
        secretKey: this.secretKey,
      });
      const { origin } = window.location;
      const { pathname } = window.location;
      return `${origin}${pathname}#/invite?userSig=${userSig}&&SDKAppId=${this.sdkAppId}&&userId=${userId}&&roomId=${this.roomId}`;
    },
    addSuccessLog(str: string) {
      this.logs.push({
        type: 'success',
        content: str,
      });
    },
    addFailedLog(str: string) {
      this.logs.push({
        type: 'failed',
        content: str,
      });
    },
  },
});

export default appStore;
