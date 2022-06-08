<template>
  <el-row style='padding: 0 10px 40px 10px'>
    <el-col :md='{span: 18, offset: 3}' :sm='{span: 24}'>
      <CheckEnvironment />
      <Inputs />
      <Device @switchDevice='switchDevice' />
      <div class='btn-line'>
        开启大小流：<el-switch v-model="enableSmallStream" />
        开启美颜：<el-switch v-model="openBeauty" />
        开启录制：<el-switch v-model="recordScreen" />
        <br/>
        <el-button type='primary' @click='handleJoin'>
          Join Room
        </el-button>
        <el-button type='primary' @click='handlePublish'>
          Publish
        </el-button>
        <el-button type='primary' @click='handleUnpublish'>
          Unpublish
        </el-button>
        <el-button type='primary' @click='handleLeave'>
          Leave Room
        </el-button>
      </div>
      <div class='btn-line'>
        <el-button type='primary' @click='handleStartShare'>Start Share Screen</el-button>
        <el-button type='primary' @click='handleStopShare'>Stop Share Screen</el-button>
      </div>

      <div class="mtb20" v-if="store.isJoined">
        <ChangeStreamProfile :localStream="localStream" />
      </div>
      <div class="mtb20" v-if="store.isJoined">
        <ChangeVideoOrAudio :localStream="localStream" />
      </div>
      <div class="mtb20" v-if="store.isJoined">
        <AudioLevel :localStream="localStream" :localClient="localClient" />
      </div>
      <div class="mtb20">
        <bgMusic  :localStream="localStream" :localClient="localClient" />
      </div>
      <div class="mtb20">
        <el-button @click="networkCheck" type="primary">网络运行检查</el-button>
      </div>
      <div class="mtb20">
        <el-button @click="startCheckDevices" type="primary">设备检查</el-button>
      </div>
      <div class="mtb20">
        <el-button @click="startPushCdn" type="primary">开启CDN推流</el-button>
      </div>
      <div class="mtb20">
        <el-button @click="toStartWaterMark" type="primary">开启水印</el-button>
      </div>
      <div class="mtb20">
        开启云端混流：<el-switch v-model="mixStream" @change="changeMix"/>
      </div>
      <div class='share-link' v-if='store.isJoined'>
        <div class='alert'>{{ t('invite') }}</div>
        <div class='invite'>
          <button class="invite-btn" @click='copy'>
            <img src="../assets/clippy.svg" alt="Copy to clipboard" class='clip'>
          </button>
          <el-input id="foo" v-model="inviteLink"></el-input>
        </div>
      </div>
      <div class='pusher'>
        <div class='logs'>
          <strong>Log:</strong>
          <template v-for='(item, index) in store.logs' :key='index'>
            <div class='log'>
              <template v-if="item.type === 'success'">
                <span>🟩 </span>{{ item.content }}
              </template>
              <template v-else>
                <span>🟥 </span>{{ item.content }}
              </template>
            </div>
          </template>
        </div>
      </div>
      <div class='local' id='local' v-if='store.isJoined'>
        <div class='tag'>
          <div :class="audioMuted ? 'muteAudio' :'unmuteAudio'" @click='muteAudio'></div>
          <div :class="videoMuted ? 'muteVideo' :'unmuteVideo'" @click='muteVideo'></div>
        </div>
      </div>
      <Player />
    </el-col>
  </el-row>
</template>

<script lang='ts' setup>
import { useI18n } from 'vue-i18n';
import RTCBeautyPlugin from 'rtc-beauty-plugin';
import { ElMessage } from 'element-plus/es';
import TRTC, { Client, LocalStream } from 'trtc-js-sdk';
import { inject, ref } from 'vue';
import { copyText } from 'vue3-clipboard';
import Guidance from '@/components/ui/Guidance.vue';
import Inputs from '@/components/Inputs.vue';
import Device from '@/components/Device.vue';
import Player from '@/components/Player.vue';
import appStore from '@/store/index';
import ShareClient from '@/utils/shareClient';
import CheckEnvironment from './apiList/check.vue';
import ChangeStreamProfile from './apiList/changeStreamParam.vue';
import ChangeVideoOrAudio from './apiList/openVideoOrAudio.vue';
import AudioLevel from './apiList/audioLevel.vue';
import bgMusic from './apiList/bg.vue';
import checkNetwork from './apiList/network-check';
import checkDevices from './apiList/devices-check';
import pushCdn from './apiList/cdn-push';
import { startWaterMark } from './apiList/streamwater';

const $bus = inject('$bus');
const $aegis: any = inject('$aegis');

const { t } = useI18n();
const store = appStore();

const localClient = ref<Client>(null);
const localStream = ref<LocalStream>(null);
let shareClient: any;
const audioMuted = ref(false);
const videoMuted = ref(false);
const enableSmallStream = ref(false);
const recordScreen = ref(false);
const mixStream = ref(false);

const inviteLink = ref<string>();
const openBeauty = ref(false);

const addSuccessLog = (str: string) => {
  store.logs.push({
    type: 'success',
    content: str,
  });
};

const addFailedLog = (str: string) => {
  store.logs.push({
    type: 'failed',
    content: str,
  });
};

const muteAudio = () => {
  if (!audioMuted.value) {
    localStream.value.muteAudio();
    audioMuted.value = true;
  } else {
    localStream.value.unmuteAudio();
    audioMuted.value = false;
  }
};

const muteVideo = () => {
  if (!videoMuted.value) {
    localStream.value.muteVideo();
    videoMuted.value = true;
  } else {
    localStream.value.unmuteVideo();
    videoMuted.value = false;
  }
};

async function handleStartShare() {
  shareClient = new ShareClient({
    sdkAppId: store.sdkAppId,
    userId: `share${store.userId}`,
    roomId: store.roomId,
    secretKey: store.secretKey,
  });
  try {
    await shareClient.join();
    await shareClient.publish();
    addSuccessLog('Start share screen success');
    store.isShared = true;
  } catch (error: any) {
    addFailedLog(`Start share error: ${error.message_}`);
  }
}
async function handleStopShare() {
  try {
    await shareClient.unpublish();
    await shareClient.leave();
    addSuccessLog('Stop share screen success');
    store.isShared = false;
  } catch (error: any) {
    addFailedLog(`Stop share error: ${error.message_}`);
  }
}

async function createLocalStream() {
  try {
    localStream.value = TRTC.createStream({
      userId: store.userId,
      audio: true,
      video: true,
      cameraId: store.videoDeviceId,
      microphoneId: store.audioDeviceId,
    });
    localStream.value.setVideoProfile('360p');
    await localStream.value.initialize();
    addSuccessLog(`LocalStream [${store.userId}] initialized`);

    localStream.value.play('local').then(() => {
      addLocalControlView();
      addSuccessLog(`LocalStream [${store.userId}] playing`);
    }).catch((e) => {
      addFailedLog(`LocalStream [${store.userId}] failed to play. Error: ${e.message_}`);
    });
  } catch (error: any) {
    addFailedLog(`LocalStream failed to initialize. Error: ${error.message_}`);
  }
}

function networkCheck() {
  const userSig = store.getUserSig();
  checkNetwork({
    mode: 'rtc',
    sdkAppId: store.sdkAppId,
    userId: store.userId,
    userSig,
  });
}

function toStartWaterMark() {
  startWaterMark({
    localStream: localStream.value,
    width: 80,
    height: 10,
    imageUrl: 'https://web.sdk.qcloud.com/trtc/webrtc/assets/logo/trtc-logo-cn-w.png',
  });
}

function startCheckDevices() {
  checkDevices(localClient.value);
}

function startPushCdn() {
  pushCdn(localClient.value);
}

async function changeMix(value: boolean) {
  if (value) {
    try {
      // 预排版模式，自 v4.9.0 版本开始支持
      await localClient.value.startMixTranscode({
        mode: 'preset-layout',
        videoWidth: 1280,
        videoHeight: 720,
        videoBitrate: 1500,
        videoFramerate: 15,
        videoGOP: 2,
        audioSampleRate: 48000,
        audioBitrate: 64,
        audioChannels: 1,
        // 预设一路本地摄像头、一路本地屏幕分享、两路远端流的排版位置
        mixUsers: [
          {
            width: 640,
            height: 360,
            locationX: 0,
            locationY: 0,
            pureAudio: false,
            userId: 'shareTestUser', // 本地屏幕分享占位，填写用于推屏幕分享流的 client userId
            zOrder: 1,
            roomId: store.roomId,
          },
          {
            width: 640,
            height: 360,
            locationX: 640,
            locationY: 0,
            pureAudio: false,
            userId: 'testUser', // 本地摄像头占位，填写用于推摄像头流的 client userId
            zOrder: 1,
            roomId: store.roomId,
          },
          {
            width: 640,
            height: 360,
            locationX: 0,
            locationY: 360,
            pureAudio: false,
            userId: '22ddd2', // 远端流占位
            zOrder: 1,
            roomId: 1111,
          },
          {
            width: 640,
            height: 360,
            locationX: 640,
            locationY: 360,
            pureAudio: false,
            userId: 'eee222', // 远端流占位
            zOrder: 1,
            roomId: 9999,
          },
        ],
      });
    } catch (error) {
      console.error('startMixTranscode failed ', error);
    }
  } else {
    localClient.value.stopMixTranscode();
  }
}

async function handleJoin() {
  if (!store.getInitParamsStates()) {
    ElMessage({ message: t('paramsNeed'), type: 'error' });
    return;
  }
  const userSig = store.getUserSig();

  try {
    localClient.value = TRTC.createClient({
      mode: 'rtc',
      sdkAppId: store.sdkAppId,
      userId: store.userId,
      userSig,
      // userDefineRecordId: recordScreen.value ? 'record_user_test_user' : null,
    });
    addSuccessLog(`Client [${store.userId}] created`);
    installEventHandlers();
    await localClient.value.join({ roomId: store.roomId });
    // 开启大小流
    if (enableSmallStream.value) {
      await localClient.value.enableSmallStream();
    }
    store.isJoined = true;
    inviteLink.value = store.createShareLink();
    addSuccessLog(`Join room [${store.roomId}] success`);
    $aegis.reportEvent({
      name: 'joinRoom',
      ext1: 'joinRoom-success',
      ext2: 'webrtcQuickDemoVue3',
      ext3: store.sdkAppId,
    });
  } catch (error: any) {
    addFailedLog(`Join room ${store.roomId} failed, please check your params. Error: ${error.message_}`);
    $aegis.reportEvent({
      name: 'joinRoom',
      ext1: `joinRoom-failed#${store.roomId}*${store.userId}*${error.message_}`,
      ext2: 'webrtcQuickDemoVue3',
      ext3: store.sdkAppId,
    });
  }

  await createLocalStream();
  await handlePublish();
}

const rtcBeautyPlugin = new RTCBeautyPlugin();

async function handlePublish() {
  if (!store.isJoined) {
    ElMessage({ message: 'call publish()- please join() firstly', type: 'warning' });
    return;
  }
  if (store.isPublished) {
    ElMessage({ message: 'duplicate publish() observed', type: 'warning' });
    return;
  }

  try {
    if (openBeauty.value) {
      const beautyStream = rtcBeautyPlugin.generateBeautyStream(localStream.value);
      // 发布经过美颜后的流
      await localClient.value.publish(beautyStream);
      rtcBeautyPlugin.setBeautyParam({ beauty: 1, brightness: 1, ruddy: 1 });
    } else {
      await localClient.value.publish(localStream.value);
    }
    addSuccessLog('LocalStream is published successfully');
    store.isPublished = true;
    $aegis.reportEvent({
      name: 'publish',
      ext1: 'publish-success',
      ext2: 'webrtcQuickDemoVue3',
      ext3: store.sdkAppId,
    });
  } catch (error: any) {
    addFailedLog(`LocalStream is failed to publish. Error: ${error.message_}`);
    $aegis.reportEvent({
      name: 'publish',
      ext1: `publish-failed#${store.roomId}*${store.userId}*${error.message_}`,
      ext2: 'webrtcQuickDemoVue3',
      ext3: store.sdkAppId,
    });
  }
}

async function handleUnpublish() {
  if (!store.isJoined) {
    ElMessage({ message: 'unpublish() - please join() firstly', type: 'warning' });
    return;
  }
  if (!store.isPublished) {
    ElMessage({ message: 'call unpublish() - you have not published yet', type: 'warning' });
    return;
  }
  try {
    await localClient.value.unpublish(localStream.value);
    store.isPublished = false;
    addSuccessLog('Unpublish localStream.value success');
    $aegis.reportEvent({
      name: 'unpublish',
      ext1: 'unpublish-success',
      ext2: 'webrtcQuickDemoVue3',
      ext3: store.sdkAppId,
    });
  } catch (error: any) {
    addFailedLog(`LocalStream is failed to unpublish. Error: ${error.message_}`);
    $aegis.reportEvent({
      name: 'unpublish',
      ext1: `unpublish-failed#${store.roomId}*${store.userId}*${error.message_}`,
      ext2: 'webrtcQuickDemoVue3',
      ext3: store.sdkAppId,
    });
  }
}

async function handleLeave() {
  if (!store.isJoined) {
    ElMessage({ message: 'leave() - please join() firstly', type: 'warning' });
    return;
  }
  if (store.isPublished) {
    await handleUnpublish();
  }
  try {
    uninstallEventHandlers();
    await localClient.value.leave();
    store.isJoined = false;
    addSuccessLog('Leave room success');
    if (localStream.value) {
      localStream.value.stop();
      localStream.value.close();
      localStream.value = null;
    }
    $aegis.reportEvent({
      name: 'leaveRoom',
      ext1: 'leaveRoom-success',
      ext2: 'webrtcQuickDemoVue3',
      ext3: store.sdkAppId,
    });
  } catch (error: any) {
    addFailedLog(`Leave room failed. Error: ${error.message_}`);
    $aegis.reportEvent({
      name: 'leaveRoom',
      ext1: `leaveRoom-failed#${store.roomId}*${store.userId}*${error.message_}`,
      ext2: 'webrtcQuickDemoVue3',
      ext3: store.sdkAppId,
    });
  }
}

async function switchDevice({ videoId, audioId }: { videoId: string, audioId: string }) {
  if (!store.isJoined) {
    return;
  }
  if (videoId) {
    try {
      await localStream.value.switchDevice('video', videoId);
      addSuccessLog('LocalStream switch video device success');
    } catch (error: any) {
      addFailedLog('Switch video device failed');
    }
  }
  if (audioId) {
    try {
      await localStream.value.switchDevice('audio', audioId);
      addSuccessLog('LocalStream switch audio device success');
    } catch (error: any) {
      addFailedLog('Switch audio device failed');
    }
  }
}

function addLocalControlView() {
  console.log('addLocalControlView');
}

function installEventHandlers() {
  if (!localClient.value) {
    return;
  }
  localClient.value.on('error', handleError);
  localClient.value.on('client-banned', handleBanned);
  localClient.value.on('peer-join', handlePeerJoin);
  localClient.value.on('peer-leave', handlePeerLeave);
  localClient.value.on('stream-added', handleStreamAdded);
  localClient.value.on('stream-subscribed', handleStreamSubscribed);
  localClient.value.on('stream-removed', handleStreamRemoved);
  localClient.value.on('stream-updated', handleStreamUpdated);
  localClient.value.on('mute-video', handleMuteVideo);
  localClient.value.on('mute-audio', handleMuteAudio);
  localClient.value.on('unmute-video', handleUnmuteVideo);
  localClient.value.on('unmute-audio', handleUnmuteAudio);
}

function handleMuteVideo(event: any) {
  addSuccessLog(`[${event.userId}] mute video`);
}

function handleMuteAudio(event: any) {
  addSuccessLog(`[${event.userId}] mute audio`);
}

function handleUnmuteVideo(event: any) {
  addSuccessLog(`[${event.userId}] unmute video`);
}

function handleUnmuteAudio(event: any) {
  addSuccessLog(`[${event.userId}] unmute audio`);
}

function handleError(error: any) {
  ElMessage({ message: `LocalClient error: ${error.message_}`, type: 'error' });
  addSuccessLog(`LocalClient error: ${error.message_}`);
}

function handleBanned(error: any) {
  ElMessage({ message: `Client has been banned for ${error.message_}`, type: 'error' });
  addSuccessLog(`Client has been banned for ${error.message_}`);
}

function handlePeerJoin(event: any) {
  const { userId } = event;
  if (userId !== 'local-screen') {
    addSuccessLog(`Peer Client [${userId}] joined`);
  }
}

function handlePeerLeave(event: any) {
  const { userId } = event;
  if (userId !== 'local-screen') {
    addSuccessLog(`[${userId}] leave`);
  }
}

function handleStreamAdded(event: any) {
  const remoteStream = event.stream;
  const id = remoteStream.getId();
  const userId = remoteStream.getUserId();

  if (remoteStream.getUserId() === `share_${store.userId}`) {
    // don't need to screen shared by us
    localClient.value.unsubscribe(remoteStream).catch((error: any) => {
      addFailedLog(`unsubscribe failed: ${error.message_}`);
    });
  } else {
    addSuccessLog(`remote stream added: [${userId}] ID: ${id} type: ${remoteStream.getType()}`);
    localClient.value.subscribe(remoteStream).catch((error: any) => {
      addFailedLog(`subscribe failed: ${error.message_}`);
      $aegis.reportEvent({
        name: 'subscribe',
        ext1: `subscribe-failed#${store.roomId}*${store.userId}*${error.message_}`,
        ext2: 'webrtcQuickDemoVue3',
        ext3: store.sdkAppId,
      });
    });
  }
}

function handleStreamSubscribed(event: any) {
  const remoteStream = event.stream;
  const userId = remoteStream.getUserId();
  addSuccessLog(`RemoteStream subscribed: [${userId}]`);
  ($bus as any).emit('stream-subscribed', event);
  $aegis.reportEvent({
    name: 'subscribe',
    ext1: 'subscribe-success',
    ext2: 'webrtcQuickDemoVue3',
    ext3: store.sdkAppId,
  });
}

function handleStreamRemoved(event: any) {
  const remoteStream = event.stream;
  const userId = remoteStream.getUserId();
  addSuccessLog(`RemoteStream removed: [${userId}]`);
  ($bus as any).emit('stream-removed', event);
}

function handleStreamUpdated(event: any) {
  const remoteStream = event.stream;
  const userId = remoteStream.getUserId();
  addSuccessLog(`RemoteStream updated: [${userId}] audio:${remoteStream.hasAudio()} video:${remoteStream.hasVideo()}`);
}

function uninstallEventHandlers() {
  if (!localClient.value) {
    return;
  }
  localClient.value.off('error', handleError);
  localClient.value.off('error', handleError);
  localClient.value.off('client-banned', handleBanned);
  localClient.value.off('peer-join', handlePeerJoin);
  localClient.value.off('peer-leave', handlePeerLeave);
  localClient.value.off('stream-added', handleStreamAdded);
  localClient.value.off('stream-subscribed', handleStreamSubscribed);
  localClient.value.off('stream-removed', handleStreamRemoved);
  localClient.value.off('stream-updated', handleStreamUpdated);
  localClient.value.off('mute-video', handleMuteVideo);
  localClient.value.off('mute-audio', handleMuteAudio);
  localClient.value.off('unmute-video', handleUnmuteVideo);
  localClient.value.off('unmute-audio', handleUnmuteAudio);
}

function copy() {
  copyText(inviteLink.value, undefined, (error: any) => {
    if (error) {
      ElMessage({ message: 'Copy failed!', type: 'error' });
    } else {
      ElMessage({ message: 'Copied!', type: 'success' });
    }
    inviteLink.value = store.createShareLink();
  });
}

</script>

<style lang='stylus' scoped>
.btn-line
  padding-bottom 10px

.share-link
  color #084298
  background-color #cfe2ff
  border-color #b6d4fe
  padding 15px 20px
  font-size 14px
  border-radius 4px

.el-button
  background-color #0d6efd
  font-size 14px
  font-weight 400
  padding 4px 8px

.el-button:hover
  background-color #0d6efd

.el-button:focus
  background-color #0d6efd

.el-button + .el-button
  margin-left 6px

.invite
  display flex
  padding-top 6px

  .invite-btn
    height 32px
    display flex
    justify-content center
    align-items center
    border: 1px solid #d5d5d5;
    border-radius 3px
    padding 6px 12px
    cursor pointer
    background-color #eee

  .clip
    width 12px
    height 12px

.logs
  min-width 180px
  width calc(100% - 490px)
  height 360px
  margin-right 10px
  margin-bottom 10px
  border 1px solid #ccc
  padding 6px
  overflow-y scroll

.log
  font-size 12px

.local
  width 1280px
  height 720px
  margin 0 0 10px 0
  position relative

@media (max-width: 540px)
  .logs
    width 100%
    height 150px
    margin-right 0

  .local
    width 100%
    height 100%

.pusher
  padding-top 10px
  display flex
  width 100%
  flex-direction row
  flex-wrap wrap
  justify-content space-between

.muteAudio
  background url(../assets/mic-mute.svg) center center no-repeat

.unmuteAudio
  background url(../assets/mic.svg) center center no-repeat

.muteVideo
  background url(../assets/camera-mute.svg) center center no-repeat

.unmuteVideo
  background url(../assets/camera.svg) center center no-repeat

.tag
  position absolute
  bottom 0
  width 100%
  height 25px
  z-index 999
  background rgba(0, 0, 0, 0.3)
  display flex
  padding 0 4px
  flex-direction row-reverse

.tag > div
  height 25px
  width 25px
  cursor pointer

.mtb20 {
  margin: 20px 0;
}
</style>
