<template>
    <div class="flex">
        <div class=" p-3 flex flex-1 mr-4 flex-col" style="background-color: rgba(31, 41, 55, 0.5);">
            <div class="mb-2 font-bold" :style="display='relative'">
                <div class="thoughts" v-if="answer != 'Deepseek正在分析数据'">
                    <!-- <AIThoughts :thoughts="extractThinkContent(answer)" /> -->
                </div>
                <div>Deepseek分析</div>
            </div>
            <div class="waiting">
                <div>{{ removeThinkContent(answer) }}</div>
                <img v-if="answer == 'Deepseek正在分析数据'" src="../assets/images/waitingIcon.png" alt="waitingIcon" />
            </div>
        </div>
        <div class="p-3 flex flex-1 flex-col" style="background-color: rgba(31, 41, 55, 0.5);">
            <div class="font-bold">预警信息</div>
            <div v-if="answer != 'Deepseek正在分析数据'" class="flex items-center justify-center">
                <div v-if="dangerList.length == 0"
                    class="text-center text-2xl font-bold text-slate-300 flex items-center justify-center">
                    <img src="../assets/images/safe.png" alt="empty" class="w-20 h-20" />
                    暂无预警信息
                </div>
                <div v-else class="flex items-center justify-center mt-2">
                    <img src="../assets/images/warning.png" alt="warning" class="w-20 h-20 mr-4" />
                    <div class="flex flex-col justify-between">
                        <div class="text-2xl mr-2 font-bold">异常指标数：{{ dangerList.length }}</div>
                        <div v-for="item in dangerList" :key="item.id" class="text-slate-300">{{ item }} </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { askDeepseek } from '../api/visualization.js';
import AIThoughts from './AIThoughts.vue';
//定义响应式数据
const dangerList=ref([]);
const dataLength = ref(0);
const H2S = ref([]);
const CH2O = ref([]);
const TVOC = ref([]);
const PM2_5 = ref([]);
const O2 = ref([]);
const temperature = ref([]);
const humidity = ref([]);
const CO = ref([]);
const CH4 = ref([]);
const PM2_5Mean = ref(0);//24小时平均值
const O2Mean = ref(0);//24小时平均值
const O2Min=ref(0);
const temperatureMax = ref(0);
const humidityMax = ref(0);
const H2SMax = ref(0);
const CH2OMean = ref(0); //8小时平均值
const TVOCMean = ref(0); //8小时平均值
const COMax = ref(0);
const COMean=ref(0);
const CH4Max = ref(0);
const past1hourData = ref([]);
const past8HoursData = ref([]);
const past24HoursData = ref([]);
const lastTime = ref('');
const temperatureMaxLimit=ref(35);
const humidityMaxLimit=ref(70);
const H2SMaxLimit=ref(6.6);
const H2SMean=ref(0);
const CH2OMeanLimit=ref(0.1);
const TVOCMeanLimit=ref(0.6);
const COMaxLimit=ref(24);
const CH4MaxLimit=ref(5000);
const question = ref('');//提问问题
const answer = ref('Deepseek正在分析数据');//AI回答
const props = defineProps({
    data: {
        type: Object,
        default: null
    },
    projectDescription: {
        type: String,
        default: '施工场地'
    }
});

const getLimit=(projectDescription)=>{
    switch(projectDescription){
        case '危化品仓库':
            temperatureMaxLimit.value=30;
            humidityMaxLimit.value=80;
            H2SMaxLimit.value=6.6;
            CH2OMeanLimit.value=0.5;
            TVOCMeanLimit.value=1;
            COMaxLimit.value=30;
            CH4MaxLimit.value=5000;
            break;
        case '施工场地':
            temperatureMaxLimit.value=35;
            humidityMaxLimit.value=100;
            H2SMaxLimit.value=6.6;
            CH2OMeanLimit.value=0.1;
            TVOCMeanLimit.value=0.6;
            COMaxLimit.value=24;
            CH4MaxLimit.value=5000;
            break;
        case '运动场馆':
            temperatureMaxLimit.value=28;
            humidityMaxLimit.value=70;
            H2SMaxLimit.value=6.6;
            CH2OMeanLimit.value=0.1;
            TVOCMeanLimit.value=0.6;
            COMaxLimit.value=5;
            CH4MaxLimit.value=5000;
            break;

        default:
            temperatureMaxLimit.value=30;
            humidityMaxLimit.value=80;
            H2SMaxLimit.value=6.6;
            CH2OMeanLimit.value=0.5;
            TVOCMeanLimit.value=1;
            COMaxLimit.value=30;
            CH4MaxLimit.value=5000;
    }
};

// 计算数据总览
const calculateOverview = () => {

    if (props.data && props.data.response) {
        dangerList.value=[];
        dataLength.value = props.data.response.length;
        lastTime.value = props.data.response[dataLength.value - 1].record_date + ' ' + props.data.response[dataLength.value - 1].record_time;
        //const lastTimeStamp=new Date(lastTime.value).getTime();
        //console.log('lastTimeStamp',lastTimeStamp);
        past1hourData.value = [];//过去1小时数据
        past8HoursData.value = [];//过去8小时数据
        past24HoursData.value = [];//过去24小时数据
        props.data.response.forEach(item => {
            const currentTime = item.record_date + ' ' + item.record_time;
            const currentTimeStamp = new Date(currentTime).getTime();
            const lastTimeStamp = new Date(lastTime.value).getTime();
            if (lastTimeStamp - currentTimeStamp <= 1 * 60 * 60 * 1000) {
                past1hourData.value.push(item);
            }
            if (lastTimeStamp - currentTimeStamp <= 8 * 60 * 60 * 1000) {
                past8HoursData.value.push(item);
            }
            if (lastTimeStamp - currentTimeStamp <= 24 * 60 * 60 * 1000) {
                past24HoursData.value.push(item);
            }
        });
        //console.log('过去8小时数据',past8HoursData.value);
        //console.log('过去24小时数据',past24HoursData.value);
        H2S.value = past24HoursData.value.map(item => item.H2S);
        H2SMax.value = Math.max(...H2S.value);//24小时最大值
        H2SMean.value = H2S.value.reduce((a, b) => a + b) / H2S.value.length;//24小时平均值
        CH2O.value = past8HoursData.value.map(item => item.CH2O);//8小时数据
        if(props.projectDescription=='危化品仓库'){
            CH2OMean.value = CH2O.value.reduce((a, b) => a + b) / CH2O.value.length;//8小时平均值
        }
        else
        {
            CH2OMean.value=past1hourData.value.map(item => item.CH2O).reduce((a, b) => a + b) /past1hourData.value.length;//1小时平均值
        }
        TVOC.value = past8HoursData.value.map(item => item.TVOC);//8小时数据
        PM2_5.value = past24HoursData.value.map(item => item.PM2_5);
        O2.value = past24HoursData.value.map(item => item.O2);
        temperature.value = past24HoursData.value.map(item => item.temperature);
        humidity.value = past24HoursData.value.map(item => item.humidity);
        CO.value = past24HoursData.value.map(item => item.CO);
        COMax.value = Math.max(...CO.value);//24小时最大值
        if(props.projectDescription=='施工场地'){
            COMean.value =past8HoursData.value.map(item=>item.CO).reduce((a, b) => a + b) / past8HoursData.value.length;//24小时平均值
        }
        else{
            COMean.value =past1hourData.value.map(item=>item.CO).reduce((a, b) => a + b) / past1hourData.value.length;//24小时平均值
        }
        CH4.value = past24HoursData.value.map(item => item.CH4);
        PM2_5Mean.value = PM2_5.value.reduce((a, b) => a + b) / PM2_5.value.length;//24小时平均值
        O2Mean.value = O2.value.reduce((a, b) => a + b) / O2.value.length;//24小时平均值
        O2Min.value = Math.min(...O2.value);//24小时最小值
        temperatureMax.value = Math.max(...temperature.value);//24小时最大值
        humidityMax.value = Math.max(...humidity.value);//24小时最大值
        TVOCMean.value = TVOC.value.reduce((a, b) => a + b) / TVOC.value.length;//8小时平均值
        CH4Max.value = Math.max(...CH4.value);//24小时最大值 

        if(props.projectDescription=='危化品仓库'){
            if(CH4Max.value>CH4MaxLimit.value){
            dangerList.value.push('甲烷浓度超标');
            }
            if(O2Min.value<19){
                dangerList.value.push('O2浓度过低');
            }
            if(H2SMax.value>H2SMaxLimit.value){
                dangerList.value.push('硫化氢浓度超标');
            }
            if(COMax.value>COMaxLimit.value){
                dangerList.value.push('一氧化碳浓度超标');
            }
        }
        if(props.projectDescription=='施工场地'){
            
            if(CH2OMean.value/1000>CH2OMeanLimit.value){
                //console.log('CH2OMean',CH2OMean.value);
                dangerList.value.push('甲醛浓度超标');
            }
            if(TVOCMean.value/1000>TVOCMeanLimit.value){
            //console.log('TVOCMean',TVOCMean.value);
            dangerList.value.push('TVOC浓度超标');
            if(PM2_5Mean.value>75){
            dangerList.value.push('PM2.5浓度超标');
            if(temperatureMax.value>temperatureMaxLimit.value){
            dangerList.value.push('温度过高');
        }
        }
        }


        }
        if(props.projectDescription=='运动场馆'){
            if(H2SMean.value>H2SMaxLimit.value){
                dangerList.value.push('二氧化碳浓度超标');
            }
            if(CH2OMean.value/1000>CH2OMeanLimit.value){
                //console.log('CH2OMean',CH2OMean.value);
                dangerList.value.push('甲醛浓度超标');
            }
            if(COMean.value*1.249>COMaxLimit.value){
                dangerList.value.push('一氧化碳浓度超标');
            }
        }
    }
};

const askAI = async () => {
    answer.value = 'Deepseek正在分析数据';
    switch(props.projectDescription){
        case '危化品仓库':
            question.value = '当前' + 
            'O2浓度为' + O2Min.value.toFixed(2) + '%VOL,' +
            'H2S(24小时最大值)为' + H2SMax.value + 'ppm,' +
            'CO(24小时最大值)为' + COMax.value + 'ppm,' +
            'CH4(24小时最大值)为' + CH4Max.value + 'ppm' +
            '请逐个比对各指标参数是否存在异常？CH2O仔细核对一下,如果存在异常，请给出原因和建议。';
            break;
        case '施工场地':
            question.value = '当前' + props.projectDescription + 'PM2.5(1小时均值)为' + PM2_5Mean.value.toFixed(2) + 'ug/m³,' +
            '温度(24小时最大值)为' + temperatureMax.value + '℃,' +
            '湿度(24小时最大值)为' + humidityMax.value + '%,' +
            'CH2O(1小时均值)为' + (CH2OMean.value/1000).toFixed(2) + 'mg/m³,' + //ug/m³转换为mg/m³
            'TVOC(8小时均值)为' + (TVOCMean.value/1000).toFixed(2) + 'mg/m³,' + //ug/m³转换为mg/m³
            '请逐个比对各指标参数是否存在异常？CH2O仔细核对一下,如果存在异常，请给出原因和建议。';
            break;
        case '运动场馆':
            question.value = '当前' + props.projectDescription + 'PM2.5(24小时均值)为' + PM2_5Mean.value.toFixed(2) + 'ug/m³,' +
            'O2(24小时均值)为' + O2Mean.value.toFixed(2) + 'ug/m³,' +
            '温度(24小时最大值)为' + temperatureMax.value + '℃,' +
            '湿度(24小时最大值)为' + humidityMax.value + '%,' +
            'H2S(24小时均值)为' + H2SMean.value.toFixed(2) + 'ppm,' +
            'CH2O(1小时均值)为' + (CH2OMean.value/1000).toFixed(2) + 'mg/m³,' +
            'TVOC(8小时均值)为' + (TVOCMean.value/1000).toFixed(2) + 'mg/m³,' +
            'CO(1小时均值)为' + (COMean.value*1.249).toFixed(2) + 'mg/m³,'+  //ppm转换为mg/m³
            '请逐个比对各指标参数是否存在异常？如果存在异常，请给出原因和建议。';
            break;
        default:
            question.value = '当前' + props.projectDescription + 'PM2.5(24小时均值)为' + PM2_5Mean.value.toFixed(2) + 'ug/m³,' +
            'O2(24小时均值)为' + O2Mean.value.toFixed(2) + 'ug/m³,' +
            '温度(24小时最大值)为' + temperatureMax.value + '℃,' +
            '湿度(24小时最大值)为' + humidityMax.value + '%,' +
            'H2S(24小时最大值)为' + H2SMax.value + 'ppm,' +
            'CH2O(8小时均值)为' + (CH2OMean.value/1000).toFixed(2) + 'mg/m³,' + //ug/m³转换为mg/m³
            'TVOC(8小时均值)为' + (TVOCMean.value/1000).toFixed(2) + 'mg/m³,' + //ug/m³转换为mg/m³
            'CO(24小时最大值)为' + COMax.value + 'ppm,' +
            'CH4(24小时最大值)为' + CH4Max.value + 'ppm' +
            '请逐个比对各指标参数是否存在异常？如果存在异常，请给出原因和建议。';
    }
    const response = await askDeepseek(question.value);
    console.log('AI回答', response);
    //console.log('提取json数据',parseAIResponse(removeThinkContent(response.data.response)));
    answer.value = response.data.response;

};
// 暴露方法给父组件
defineExpose({
    askAI,
    answer
});
//将回答中的<think></think>标签内的内容过滤掉
const removeThinkContent = (text) => {
    return text.replace(/<think>.*?<\/think>/gs, '');
};
const extractThinkContent = (text) => {
    return text.match(/<think>(.*?)<\/think>/gs)[0];
};
const ifshowthoughts = ref(true);
onMounted(() => {
    // console.log('AI监测接受数据', props.data);
    getLimit(props.projectDescription);
    calculateOverview();
    askAI();
    setInterval(() => {
        askAI();
    }, 600000);
});
//监听数据变化
watch([() => props.data, () => props.projectDescription], ([newData, newProject], [oldData, oldProject]) => {
    if (newData != oldData) {
        getLimit(props.projectDescription);
        // console.log('AI监测接受数据', props.data);
        calculateOverview();
    }
});
</script>

<style scoped>
.thoughts{
    position: absolute;
    margin-left:100px;
    margin-top: -350px;

}
.waiting {
    display: flex;
    align-items: center;
    max-height: 300px; /* 设置容器的最大高度 */
    overflow-y: auto; /* 当内容超出容器时，垂直方向显示滚动条 */
    word-break: break-word; /* 防止长单词溢出 */


    img {
        width: 16px;
        height: 16px;
        -webkit-animation: rotate 1s linear infinite;
    }
}

@-webkit-keyframes rotate {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>