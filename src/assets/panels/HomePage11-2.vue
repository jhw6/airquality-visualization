<template>
  <div class="calculator-container">
    <h1>混凝土放热量与绝热温升计算器</h1>
    
    <!-- 第一行：参数设置 -->
    <div class="parameter-row">
      <!-- 水泥矿物组成 -->
      <div class="parameter-column">
        <h3>水泥矿物组成</h3>

        <div class="checkbox-group">
          <div v-for="item in options" :key="item">
            <input type="checkbox" :value="item" v-model="selectedItems" 
            @change="handleCementSelect(item.value)"/>
            <label>{{ item }}</label>
            
        
        <!-- <div class="radio-group">
          <div v-for="item in options" :key="item">
            <input 
              type="radio" 
              :id="item" 
              :value="item" 
              v-model="selectedItem"
            />
            <label :for="item">{{ item }}</label> -->
          
          </div>
        </div>
      </div>
      <!-- 混凝土配合比 -->
      <div class="parameter-column">
        <h3>混凝土配合比</h3>

        <div class="checkbox-group">
          <div v-for="item in options1" :key="item">
            <input type="checkbox" :value="item" v-model="selectedItems" />
            <label>{{ item }}</label>

        <!-- <div class="radio-group">
          <div v-for="item in options1" :key="item">
            <input 
              type="radio" 
              :id="item" 
              :value="item" 
              v-model="selectedItem"
            />
            <label :for="item">{{ item }}</label> -->

          </div>
        </div>
      </div>
    </div>
    
    <p>已选：{{ selectedItems }}</p>


    <div class="button-container">
      <button @click="calculateAndDraw">确定</button>
      <button @click="calculateAndDraw">重置</button>
    </div>

    <!-- 第二行：图表展示 --> 
    <div class="chart-row">
      <!-- 绝热条件下单方混凝土放热量 -->
      <div class="chart-column">
        <h3>绝热条件下单方混凝土放热量</h3>
        <div ref="heatReleaseChart" class="chart-container"></div>
      </div>
      <!-- 混凝土绝热温升 -->
      <div class="chart-column">
        <h3>混凝土绝热温升</h3>
        <div ref="temperatureRiseChart" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
// import { ref } from 'vue';
const options = ['导入仪器测试结果', '根据水泥类型生成', '手动输入I'];
const options1 = ['根据强度等级与地域生成', '手动输入II'];

const selectedItems = ref([]);

// 水泥矿物组成选项 - 现在使用数组来存储多个选择
const selectedCement = ref(['type1']); // 初始值设为数组，包含默认选项

// 混凝土配合比选项 - 现在使用数组来存储多个选择
const concreteRatio = ref(['ratio1'])

// 图表DOM引用
const heatReleaseChart = ref(null)
const temperatureRiseChart = ref(null)

// 初始化图表
let heatReleaseChartInstance = null
let temperatureRiseChartInstance = null

onMounted(() => {
  // 初始化放热量图表
  heatReleaseChartInstance = echarts.init(heatReleaseChart.value)
  
  // 初始化温升图表
  temperatureRiseChartInstance = echarts.init(temperatureRiseChart.value)
  
  // 窗口大小变化时重新调整图表大小
  window.addEventListener('resize', () => {
    heatReleaseChartInstance.resize()
    temperatureRiseChartInstance.resize()
  })
})

// 更新图表数据
const updateCharts = () => {
  // 模拟数据 - 实际应用中应根据选择的参数计算
  const timeData = ['0h', '12h', '24h', '36h', '48h', '72h', '96h']
  
  // 根据选择的水泥类型和配合比生成不同的数据
  let heatData = []
  let tempData = []
  
  // ... (省略数据生成逻辑)
  
  // 设置放热量图表选项
  const heatReleaseOption = {
    tooltip: {
      trigger: 'axis',
      formatter: '时间: {b0}<br/>放热量: {c0} kJ/m³'
    },
    xAxis: {
      type: 'category',
      data: timeData,
      name: '时间'
    },
    yAxis: {
      type: 'value',
      name: '放热量 (kJ/m³)'
    },
    series: [{
      data: heatData,
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(58, 77, 233, 0.8)' },
          { offset: 1, color: 'rgba(58, 77, 233, 0.1)' }
        ])
      },
      itemStyle: {
        color: '#3a4de9'
      }
    }]
  }
  
  // 设置温升图表选项
  const temperatureRiseOption = {
    tooltip: {
      trigger: 'axis',
      formatter: '时间: {b0}<br/>温升: {c0} °C'
    },
    xAxis: {
      type: 'category',
      data: timeData,
      name: '时间'
    },
    yAxis: {
      type: 'value',
      name: '温升 (°C)'
    },
    series: [{
      data: tempData,
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255, 99, 71, 0.8)' },
          { offset: 1, color: 'rgba(255, 99, 71, 0.1)' }
        ])
      },
      itemStyle: {
        color: 'tomato'
      }
    }]
  }
  
  // 应用图表选项
  heatReleaseChartInstance.setOption(heatReleaseOption)
  temperatureRiseChartInstance.setOption(temperatureRiseOption)
}

// 计算并绘制图表
const calculateAndDraw = () => {
  console.log('计算并绘制图表')
  updateCharts()
}
</script>

<style scoped>
.calculator-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  font-size: 24px;
  text-align: center;
  margin-bottom: 30px;
  color: #333333;
}

.parameter-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.parameter-column {
  width: 48%;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h3 {
  margin-bottom: 15px;
  color: #409eff;
}

.checkbox-group {
  display: flex;
  flex-direction: column; /* 使子元素垂直排列 */
}

.el-checkbox {
  margin-bottom: 10px; /* 设置每个checkbox之间的间距 */
  border: 1px solid #dcdcdc; /* 添加边框 */
  padding: 10px; /* 添加内边距 */
  border-radius: 4px; /* 设置边框圆角 */
}

/* 选中状态下的样式 */
.el-checkbox.is-checked {
  border-color: #409EFF; /* 选中时的边框颜色 */
  background-color: #ecf5ff; /* 选中时的背景颜色 */
}

/* 鼠标悬停时的样式 */
.el-checkbox:hover {
  border-color: #409EFF; /* 悬停时的边框颜色 */
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 16px;            /* 设置按钮之间的间距为16px */
  margin-bottom: 30px;
}

button {
  padding: 12px 24px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.chart-row {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.chart-column {
  width: 48%;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>