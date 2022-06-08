<template>
  <div>
    <div>
      <div>当前SDK版本: {{TRTC.VERSION}}</div>
      <el-button
        v-for="api in apiData"
        :key="api.text"
        type="primary"
        @click="api.handler"
        >{{api.text}}</el-button>
    </div>
  </div>
</template>
<script lang='ts' setup>
import TRTC from 'trtc-js-sdk';
import apiData from './apiData';
</script>
<style></style>
