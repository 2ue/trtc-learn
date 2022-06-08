<template>
  <div>
    <div>
      音量大小: {{level}}
      <el-button @click="getAudioLevel">手动获取</el-button>
      <el-button @click="watchAudioLevel">开启实时监听</el-button>
      <el-button @click="removeAudioLevel">关闭监听</el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';

const level = ref(null);
// eslint-disable-next-line no-undef
const props = defineProps({
  localStream: {
    default: null,
  },
  localClient: {
    default: null,
  },
});
function getAudioLevel() {
  const volume = props.localStream.getAudioLevel();
  level.value = volume;
  if (volume > 0.1) {
    console.log(`${props.localStream.getUserId()} is speaking`);
  }
}

function watchAudioLevel() {
  props.localClient.on('audio-volume', (event: { result: { userId: any; audioVolume: any; }[]; }) => {
    event.result.forEach(({ audioVolume }) => {
      level.value = audioVolume;
    });
  });
  // 开启音量回调，并设置每 1000ms 触发一次事件
  props.localClient.enableAudioVolumeEvaluation(1000);
}
function removeAudioLevel() {
  props.localClient.off('audio-volume');
}
</script>
