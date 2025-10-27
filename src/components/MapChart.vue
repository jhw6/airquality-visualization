<template>
    <div class="flex flex-col">
        <div class="text-1xl font-bold">{{ props.title }}</div>
        <div ref="target" class="w-full h-full"></div>
    </div>

</template>

<script setup>
import { defineProps } from 'vue';
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import mapJSON from '../assets/json/china.json';

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

//初始化echarts实例
const target = ref(null);
let myChart = null;

const scatterData = [
    { name: '遥墙机场', value: [117.223083,36.863255, 80] },
    { name: '盘锦化工厂', value: [122.179709,40.730601, 80] }
];

// 定义 emits
const emit = defineEmits(['location']); // 定义一个名为 'location' 的事件
//构件option配置对象
const renderChart = () => {
    const option = {
        geo: {
            show: true,
            map: 'china',
            roam: true,
            zoom: 1.3,
            center: [113.8353, 36.0267],
            itemStyle: {
                normal: {
                    borderColor: 'rgba(147, 235, 248, 1)',
                    borderWidth: 1,
                    areaColor: {
                        type: 'radial',
                        x: 0.5,
                        y: 0.5,
                        r: 0.8,
                        colorStops: [{
                            offset: 0, color: 'rgba(147, 235, 248, 0)' // 0% 处的颜色
                        }, {
                            offset: 1, color: 'rgba(147, 235, 248, .2)' // 100% 处的颜色
                        }],
                        globalCoord: false // 缺省为 false
                    }
                },
                emphasis: {
                    areaColor: '#389BB7',
                    borderWidth: 0
                }

            }
        },
        series:[
            {
                type: 'effectScatter',
                coordinateSystem: 'geo',
                data: scatterData,
                symbolSize: function(val) {
                    return val[2] / 6;
                },
                showEffectOn: 'render',
                rippleEffect: {
                    brushType: 'stroke'
                },
                label: {
                    show: true,
                    formatter: '{b}',
                    position: 'right'
                },
                itemStyle: {
                    normal: {
                        color: '#FF8C00',
                        shadowBlur: 10,
                        shadowColor: '#333'
                    },
                    emphasis: {
                        color: '#A2EF4D',
                        shadowBlur: 10,
                        shadowColor: '#333'
                    }
                },
            }
        ]
    };
    //设置option
    myChart.setOption(option);
    // 添加点击事件监听
    myChart.on('click', (params) => {
        if (params.seriesType === 'effectScatter') {
            console.log('点击的散点:', params);
            emit('location', params.name);           
        }
    });
};

onMounted(() => {
    echarts.registerMap('china', mapJSON);
    myChart = echarts.init(target.value);
    renderChart();
});
</script>

<style scoped></style>