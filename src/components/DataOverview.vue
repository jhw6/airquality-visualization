<template>
    <div>
        <div class="font-bold text-1xl">{{ title }}</div>
        <div class="text-slate-300 text-center">
            数据总量:
            <span class="text-3xl ml-2 mr-2 font-bold">
                {{ dataLength }}
            </span>
            条记录
        </div>
        <div class="mt-3 flex flex-wrap justify-center">
            <div v-if="title == '有毒有害气体检测'" class="w-1/3">
                <div class="text-center text-slate-300">H<sub>2</sub>S(ppm)</div>
                <div class="text-center text-2xl font-bold text-slate-300">{{ H2S }}</div>
            </div>
            <div v-if="title == '有毒有害气体检测'" class="w-1/3">
                <div class="text-center text-slate-300">O<sub>2</sub>(%VOL)</div>
                <div class="text-center text-2xl font-bold text-slate-300">{{ O2 }}</div>
            </div>
            <div v-if="title == '空气质量检测'" class="w-1/3">
                    <div class="text-center text-slate-300">CH<sub>2</sub>O(ug/m<sup>3</sup>)</div>
                    <div class="text-center text-2xl font-bold text-slate-300">{{ CH2O }}</div>
            </div>
            <div v-if="title == '空气质量检测'" class="w-1/3">
                    <div class="text-center text-slate-300">TVOC(ug/m<sup>3</sup>)</div>
                    <div class="text-center text-2xl font-bold text-slate-300">{{ TVOC }}</div>
            </div>
            <div v-if="title == '空气质量检测'" class="w-1/3">
                    <div class="text-center text-slate-300">PM2.5(ug/m<sup>3</sup>)</div>
                    <div class="text-center text-2xl font-bold text-slate-300">{{ PM2_5 }}</div>
            </div>
        </div>
        <div class="mt-3 flex flex-wrap justify-center">
            <div v-if="title == '空气质量检测'" class="w-1/3">
                <div class="text-center text-slate-300">温度(℃)</div>
                <div class="text-center text-2xl font-bold text-slate-300">{{ temperature }}</div>
            </div>
            <div v-if="title == '空气质量检测'" class="w-1/3">
                <div class="text-center text-slate-300">湿度(%)</div>
                <div class="text-center text-2xl font-bold text-slate-300">{{ humidity }}</div>
            </div>
            <div v-if="title == '有毒有害气体检测'" class="w-1/3">
                <div class="text-center text-slate-300">CO(ppm)</div>
                <div class="text-center text-2xl font-bold text-slate-300">{{ CO }}</div>
            </div>
            <div v-if="title == '有毒有害气体检测'" class="w-1/3">
                <div class="text-center text-slate-300">CH4(ppm)</div>
                <div class="text-center text-2xl font-bold text-slate-300">{{ CH4 }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

//定义响应式数据
const dataLength = ref(0);
const H2S = ref(0);
const CH2O = ref(0);
const TVOC = ref(0);
const PM2_5 = ref(0);
const O2 = ref(0);
const temperature = ref(0);
const humidity = ref(0);
const CO = ref(0);
const CH4 = ref(0);





const props = defineProps({
    title: {
        type: String,
        default: '空气质量检测'
    },
    data: {
        type: Object,
        default: null
    }
});
// 计算数据总览
const calculateOverview = () => {
    if (props.data && props.data.response) {
        dataLength.value = props.data.response.length;
        H2S.value = props.data.response[props.data.response.length - 1].H2S;
        CH2O.value = props.data.response[props.data.response.length - 1].CH2O;
        TVOC.value = props.data.response[props.data.response.length - 1].TVOC;
        PM2_5.value = props.data.response[props.data.response.length - 1].PM2_5;
        O2.value = props.data.response[props.data.response.length - 1].O2;
        temperature.value = props.data.response[props.data.response.length - 1].temperature;
        humidity.value = props.data.response[props.data.response.length - 1].humidity;
        CO.value = props.data.response[props.data.response.length - 1].CO;
        CH4.value = props.data.response[props.data.response.length - 1].CH4;
    }
};



onMounted(() => {
    console.log('DataOverview接受数据', props.data);
    calculateOverview();
});
//监听数据变化
watch(() => props.data, () => {
    calculateOverview();
});
</script>

<style scoped></style>