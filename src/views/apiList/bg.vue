<template>
  <div>
    <el-upload
      ref="uploadRef"
      class="upload-demo"
      action="https://jsonplaceholder.typicode.com/posts/"
      :auto-upload="false"
      :on-change="onChange"
    >
      <template #trigger>
        <el-button type="primary">选择背景音乐</el-button>
      </template>
    <el-button @click="toMixBgMusic">添加背景音乐</el-button>
    </el-upload>
  </div>
</template>
<script lang="ts" setup>
import mixBgMusic from './bgmusic';
// eslint-disable-next-line no-undef
const props = defineProps({
  localStream: {
    default: null,
  },
  localClient: {
    default: null,
  },
});

let url: string = null;

function toMixBgMusic() {
  if (url) {
    mixBgMusic(url, props.localStream, props.localClient);
  }
}
function onChange(data) {
  console.log(data);
  url = window.URL.createObjectURL(data.raw);
  console.log(url);
}
</script>
