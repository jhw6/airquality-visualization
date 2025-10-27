<template>
    <div>
        <div class="font-bold">预警信息</div>
        <div v-if="ifShow">
            <div v-if="dangerList.length==0" class="text-center text-2xl font-bold text-slate-300 flex  items-center justify-center">
                <img src="../assets/images/safe.png" alt="empty" class="w-20 h-20" />
                暂无预警信息
        </div>
        <div v-else class="flex  items-center justify-center">
            <img src="../assets/images/warning.png" alt="warning" class="w-20 h-20 mr-4" />
            <div  class="flex flex-col justify-between">
                <div class="text-2xl mr-2 font-bold">异常指标数：{{ dangerList.length }}</div>
                <div v-for="item in dangerList" :key="item.id" class="text-slate-300">{{ item}} </div>
            </div>
        </div>
        </div>
        
    </div>
</template>

<script setup>
import { onMounted,ref,watch } from 'vue';
//属性参数
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
const dangerList=ref([]);
//定义响应式数据
const ifShow=ref(false);
const dataLength=ref(0);
const H2S=ref([]);
const CH2O=ref([]);
const TVOC=ref([]);
const PM2_5=ref([]);
const O2=ref([]);
const temperature=ref([]);
const humidity=ref([]);
const CO=ref([]);
const CH4=ref([]);
const PM2_5Mean=ref(0);//24小时平均值
const O2Mean=ref(0);//24小时平均值
const temperatureMax=ref(0);
const humidityMax=ref(0);
const H2SMax=ref(0); 
const CH2OMean=ref(0); //8小时平均值
const TVOCMean=ref(0); //8小时平均值
const COMax=ref(0);
const CH4Max=ref(0);
const past8HoursData=ref([]);
const past24HoursData=ref([]);
const lastTime=ref('');
const temperatureMaxLimit=ref(35);
const humidityMaxLimit=ref(70);
const H2SMaxLimit=ref(5000);
const CH2OMeanLimit=ref(0.1);
const TVOCMeanLimit=ref(0.6);
const COMaxLimit=ref(24);
const CH4MaxLimit=ref(5000);

const getLimit=(projectDescription)=>{
    switch(projectDescription){
        case '施工场地':
            temperatureMaxLimit.value=35;
            humidityMaxLimit.value=100;
            H2SMaxLimit.value=5000;
            CH2OMeanLimit.value=0.1;
            TVOCMeanLimit.value=0.6;
            COMaxLimit.value=24;
            CH4MaxLimit.value=5000;
            break;
        case '运动场馆':
            temperatureMaxLimit.value=28;
            humidityMaxLimit.value=70;
            H2SMaxLimit.value=1000;
            CH2OMeanLimit.value=0.1;
            TVOCMeanLimit.value=0.6;
            COMaxLimit.value=5;
            CH4MaxLimit.value=5000;
            break;
        case '危化品仓库':
            temperatureMaxLimit.value=30;
            humidityMaxLimit.value=80;
            H2SMaxLimit.value=5000;
            CH2OMeanLimit.value=0.5;
            TVOCMeanLimit.value=1;
            COMaxLimit.value=30;
            CH4MaxLimit.value=5000;
            break;
        default:
            temperatureMaxLimit.value=35;
            humidityMaxLimit.value=100;
            H2SMaxLimit.value=5000;
            CH2OMeanLimit.value=0.1;
            TVOCMeanLimit.value=0.6;
            COMaxLimit.value=24;
            CH4MaxLimit.value=5000;
    }
};
defineExpose({
    ifShow
});

// 计算数据总览
const calculateOverview = () => {
    dangerList.value=[];
    if (props.data && props.data.response) {
        dataLength.value = props.data.response.length;
        lastTime.value = props.data.response[dataLength.value - 1].record_date+' '+props.data.response[dataLength.value - 1].record_time;
        //const lastTimeStamp=new Date(lastTime.value).getTime();
        //console.log('lastTimeStamp',lastTimeStamp);
        past8HoursData.value=[];//过去8小时数据
        past24HoursData.value=[];//过去24小时数据
        props.data.response.forEach(item => {
            const currentTime=item.record_date+' '+item.record_time;
            const currentTimeStamp=new Date(currentTime).getTime();
            
            const lastTimeStamp=new Date(lastTime.value).getTime();
            if(lastTimeStamp-currentTimeStamp<=8*60*60*1000){
                past8HoursData.value.push(item);
            }
            if(lastTimeStamp-currentTimeStamp<=24*60*60*1000){
                past24HoursData.value.push(item);
            }
        });
        //console.log('过去8小时数据',past8HoursData.value);
        //console.log('过去24小时数据',past24HoursData.value);
        H2S.value = past24HoursData.value.map(item =>item.H2S); 
        CH2O.value = past8HoursData.value.map(item =>item.CH2O); 
        TVOC.value = past8HoursData.value.map(item =>item.TVOC); 
        PM2_5.value = past24HoursData.value.map(item =>item.PM2_5); 
        O2.value = past24HoursData.value.map(item =>item.O2); 
        temperature.value = past24HoursData.value.map(item =>item.temperature); 
        humidity.value = past24HoursData.value.map(item =>item.humidity); 
        CO.value = past24HoursData.value.map(item =>item.CO); 
        CH4.value = past24HoursData.value.map(item =>item.CH4); 
        PM2_5Mean.value = PM2_5.value.reduce((a,b)=>a+b)/PM2_5.value.length;//24小时平均值
        O2Mean.value = O2.value.reduce((a,b)=>a+b)/O2.value.length;//24小时平均值
        temperatureMax.value = Math.max(...temperature.value);//24小时最大值
        humidityMax.value = Math.max(...humidity.value);//24小时最大值
        H2SMax.value = Math.max(...H2S.value);//24小时最大值
        CH2OMean.value = CH2O.value.reduce((a,b)=>a+b)/CH2O.value.length;//8小时平均值
        TVOCMean.value = TVOC.value.reduce((a,b)=>a+b)/TVOC.value.length;//8小时平均值
        COMax.value = Math.max(...CO.value);//24小时最大值
        CH4Max.value = Math.max(...CH4.value);//24小时最大值
        if(PM2_5Mean.value>75){
            dangerList.value.push('PM2.5浓度超标');
        }
        if(O2Mean.value>150){
            dangerList.value.push('O2浓度超标');
        }
        if(temperatureMax.value>35){
            dangerList.value.push('温度过高');
        }
        if(H2SMax.value>H2SMaxLimit.value){
            dangerList.value.push('二氧化碳浓度超标');
        }
        if(CH2OMean.value>CH2OMeanLimit.value){
            //console.log('CH2OMean',CH2OMean.value);
            dangerList.value.push('甲醛浓度超标');
        }
        if(TVOCMean.value>TVOCMeanLimit.value){
            //console.log('TVOCMean',TVOCMean.value);
            dangerList.value.push('TVOC浓度超标');
        }
        if(COMax.value>COMaxLimit.value){
            dangerList.value.push('一氧化碳浓度超标');
        }
        if(CH4Max.value>CH4MaxLimit.value){
            dangerList.value.push('甲烷浓度超标');
        }
    }
};


onMounted(() => {
    getLimit(props.projectDescription);
    calculateOverview();
});

//监听数据变化
watch(() => props.data, () => {
    getLimit(props.projectDescription);
    calculateOverview();
});

</script>   

<style scoped>

</style>