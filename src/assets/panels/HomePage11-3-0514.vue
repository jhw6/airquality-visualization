<template>
  <div class="calculator-container">
    <h1>混凝土放热量与绝热温升计算器</h1>
    
    <!-- 第一行：参数设置 -->
    <div class="parameter-row">
      <!-- 水泥矿物组成 -->
      <div class="parameter-column">
        <h3>水泥矿物组成</h3>
        <div class="checkbox-group">
          <div v-for="item in cementOptions" :key="item.value">
            <input 
              type="checkbox" 
              :value="item.value" 
              v-model="selectedCement" 
              @change="handleCementSelect(item.value)"
            />
            <label>{{ item.label }}</label>
          </div>
        </div>
      </div>
      
      <!-- 混凝土配合比 -->
      <div class="parameter-column">
        <h3>混凝土配合比</h3>
        <div class="checkbox-group">
          <div v-for="item in ratioOptions" :key="item.value">
            <input 
              type="checkbox" 
              :value="item.value" 
              v-model="selectedRatio" 
              @change="handleRatioSelect(item.value)"
            />
            <label>{{ item.label }}</label>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showImportSection && selectedCement === 'import'" class="import-section">
      <h3>导入仪器测试结果</h3>
      <input type="file" @change="handleFileUpload" accept=".csv,.xlsx,.xls" />
      <div v-if="uploadProgress > 0" class="progress-bar">
        <div class="progress" :style="{width: uploadProgress + '%'}"></div>
      </div>
    </div>
    
    <div v-if="showRegionInput && selectedRatio === 'region'" class="region-input">
      <h3>强度等级与地域设置</h3>
      
      <div class="input-group">
        <label>强度等级：</label>
        <select v-model="strengthGrade">
          <option value="C25">C25</option>
          <option value="C30">C30</option>
          <option value="C35">C35</option>
          <option value="C40">C40</option>
          <option value="C45">C45</option>
          <option value="C50">C50</option>
        </select>
      </div>      
      <div class="input-group">
        <label>地域：</label>
        <select v-model="region">
          <option value="dongbeihuabei">东北华北</option>
          <option value="xibeidiqu">西北地区</option>
          <option value="huazhongdiqu">华中地区</option>
          <option value="huadongdiqu">华东地区</option>
          <option value="huanandiqu">华南地区</option>
          <option value="xinandiqu">西南地区</option>
        </select>
      </div>
    </div>

    <div class="button-container">
      <button @click="calculateAndDraw">确定</button>
      <button @click="resetSelection">重置</button>
    </div>

    <!-- 第二行：图表展示 --> 
    <div class="chart-row">
      <div class="chart-column">
        <h3>绝热条件下单方混凝土放热量</h3>
        <div ref="heatReleaseChart" class="chart-container"></div>
      </div>
      <div class="chart-column">
        <h3>混凝土绝热温升</h3>
        <div ref="temperatureRiseChart" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()

// 选项配置
const cementOptions = [
  { value: 'import', label: '导入仪器测试结果' },
  { value: 'generate', label: '根据水泥类型生成' },
  { value: 'manual', label: '手动输入I' }
]

const ratioOptions = [
  { value: 'region', label: '根据强度等级与地域生成' },
  { value: 'manual', label: '手动输入II' }
]

// 响应式数据
const selectedCement = ref('')
const selectedRatio = ref('')
const strengthGrade = ref('C30')
const region = ref('north')
const uploadProgress = ref(0)
const uploadedFileData = ref(null)

// 计算属性
const showImportSection = computed(() => selectedCement.value === 'import')
const showRegionInput = computed(() => selectedRatio.value === 'region')

// 图表引用
const heatReleaseChart = ref(null)
const temperatureRiseChart = ref(null)
let heatReleaseChartInstance = null
let temperatureRiseChartInstance = null

// 处理方法
const handleCementSelect = (value) => {
  if (selectedCement.value === value) {
    selectedCement.value = ''
  } else {
    selectedCement.value = value
  }
}

const handleRatioSelect = (value) => {
  if (selectedRatio.value === value) {
    selectedRatio.value = ''
  } else {
    selectedRatio.value = value
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 模拟上传过程
  uploadProgress.value = 0
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      // 这里可以添加实际的文件处理逻辑
      processUploadedFile(file)
    }
  }, 200)
}

const processUploadedFile = (file) => {
  // 实际应用中这里应该解析文件内容
  console.log('处理上传的文件:', file.name)
  uploadedFileData.value = {
    fileName: file.name,
    content: "模拟的文件内容" // 实际应用中应该是解析后的数据
  }
}

const calculateAndDraw = () => {
  if (!selectedCement.value || !selectedRatio.value) {
    alert('请选择水泥矿物组成和混凝土配合比选项')
    return
  }
  
  // 根据选择生成不同的数据
  const data = generateData()
  
  // 更新图表
  updateCharts(data)
  
  // 根据选择跳转到不同页面
  if (selectedCement.value === 'import' && selectedRatio.value === 'region') {
    router.push({
      name: 'InstrumentResult',
      query: {
        strength: strengthGrade.value,
        region: region.value,
        fileName: uploadedFileData.value?.fileName || ''
      }
    })
  } else if (selectedRatio.value === 'region') {
    router.push({
      name: 'RegionResult',
      query: {
        strength: strengthGrade.value,
        region: region.value
      }
    })
  }
}

const resetSelection = () => {
  selectedCement.value = ''
  selectedRatio.value = ''
  strengthGrade.value = 'C30'
  region.value = 'north'
  uploadProgress.value = 0
  uploadedFileData.value = null
}

const generateData = () => {
  // 根据选择生成不同的数据
  let heatData = []
  let tempData = []
  
  // 模拟数据生成逻辑
  const baseValue = selectedCement.value === 'import' ? 
    (uploadedFileData.value ? 100 : 80) : 
    (selectedCement.value === 'generate' ? 120 : 90)
  
  const ratioFactor = selectedRatio.value === 'region' ? 
    (region.value === 'north' ? 1.2 : region.value === 'south' ? 0.9 : 1) : 
    1
  
  for (let i = 0; i < 7; i++) {
    heatData.push(Math.round(baseValue * ratioFactor * (1 + i * 0.15)))
    tempData.push(Math.round(baseValue * ratioFactor * 0.8 * (1 + i * 0.1)))
  }
  
  return {
    heatData,
    tempData
  }
}

const updateCharts = (data) => {
  const timeData = ['0h', '12h', '24h', '36h', '48h', '72h', '96h']
  
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
      data: data.heatData,
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
      data: data.tempData,
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

onMounted(() => {
  // 初始化图表
  heatReleaseChartInstance = echarts.init(heatReleaseChart.value)
  temperatureRiseChartInstance = echarts.init(temperatureRiseChart.value)
  
  // 窗口大小变化时重新调整图表大小
  window.addEventListener('resize', () => {
    heatReleaseChartInstance.resize()
    temperatureRiseChartInstance.resize()
  })
})
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
  flex-direction: column;
}

.checkbox-group div {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.checkbox-group input[type="checkbox"] {
  margin-right: 8px;
}

.import-section, .region-input {
  margin: 20px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #eaeaea;
}

.input-group {
  margin: 10px 0;
  display: flex;
  align-items: center;
}

.input-group label {
  width: 100px;
}

.input-group select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.progress-bar {
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin-top: 10px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 16px;
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

button:hover {
  background-color: #40a9ff;
}

.chart-row {
  display: flex;
  justify-content: space-between;
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