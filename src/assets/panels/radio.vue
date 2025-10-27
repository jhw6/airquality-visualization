<template>
  <div v-for="item in options" :key="item">
    <input type="checkbox" :value="item" v-model="selectedItems" />
    <label>{{ item }}</label>
  </div>
  <p>已选：{{ selectedItems }}</p>
</template>

<script setup>
import { ref } from 'vue';
const options = ['苹果', '香蕉', '橙子'];
const selectedItems = ref([]);
</script>