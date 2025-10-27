<template>
    <div class="flex flex-col">
        <div class="font-bold">{{props.title}}({{ setUnit(props.title) }})</div>
        <div ref="target" class="w-full h-full"></div>
    </div>
</template>

<script setup>
import { defineProps} from 'vue';
import { ref, onMounted,watch } from 'vue';
import * as echarts from 'echarts';


const props = defineProps({
    title: {
        type: String,
        default: 'Line Chart'
    },
    data: {
        type: Object,
        default: null
    }
});
//console.log('折线图接受数据',props.data);

//初始化echarts实例
const target = ref(null);
let myChart = null;
let query='';
//根据props.title构建查询字符串
switch(props.title){
    case 'H2S':
        query='H2S';
        console.log('H2S',query);
        break;
    case 'O2':
        query='O2';
        break;
    case 'CO2':
        query='CO2';
        break;
    case 'CH2O':
        query='CH2O';
        break;
    case 'TVOC':
        query='TVOC';
        break;
    case 'PM2.5':
        query='PM2_5';
        break;
    case 'PM10':
        query='PM10';
        break;
    case '温度':
        query='temperature';
        break;
    case '湿度':
        query='humidity';
        break;
    case 'CO':
        query='CO';
        break;
    case 'CH4':
        query='CH4';
        break;
    default:
        query='CO2';
        break;
}
//构件option配置对象
const renderChart = () => {
    const option = {
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: props.data ? props.data.response.map(item =>item.record_time) : []
        },
        yAxis: {
            type: 'value'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        series: [
            {
                name: 'Value',
                type: 'line',
                data: props.data ? props.data.response.map(item => item[query]) : [],
                smooth: true,
                lineStyle: {
                    width: 2
                }
            }
        ]
    };
    //设置option
    myChart.setOption(option);
};

//设置单位
const setUnit = () => {
    switch(props.title){
        case 'CO2':
            return 'ppm';
        case 'H2S':
            return 'ppm';
        case 'O2':
            return '%VOL'
        case 'CH2O':
            return 'μg/m³';
        case 'TVOC':
            return 'μg/m³';
        case 'PM2.5':
            return 'μg/m³';
        case 'PM10':
            return 'μg/m³';
        case '温度':
            return '℃';
        case '湿度':
            return '%';
        case 'CO':
            return 'ppm';
        case 'CH4':
            return 'ppm';
        default:
            return '';
    }
};

onMounted(() => {
    myChart = echarts.init(target.value);
    renderChart();
});
watch(() => props.data, () => {
    renderChart();
});



</script>

<style scoped></style>