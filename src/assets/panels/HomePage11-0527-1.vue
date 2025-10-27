<template>
  <div class="calculator-container">
    <h1>混凝土放热量与绝热温升计算器</h1>
    
    <!-- 参数设置区域 -->
    <div class="parameter-row">
      <!-- 水泥矿物组成选择 -->
      <div class="parameter-column">
        <h3>水泥矿物组成</h3>
        <div class="radio-group">
          <div v-for="item in cementOptions" :key="item.value" class="radio-item">
            <input 
              type="radio" 
              :id="'cement_'+item.value" 
              :value="item.value" 
              v-model="selectedCement"
              @change="handleCementChange"
            />
            <label :for="'cement_'+item.value">{{ item.label }}</label>
          </div>
        </div>
        
        <!-- 水泥类型选项（仅当选择"根据水泥类型生成"时显示） -->
        <div v-if="showCementTypeOptions" class="sub-options">
          <h4>选择水泥类型</h4>
          <div class="radio-group">
            <div v-for="type in cementTypes" :key="type.value" class="radio-item">
              <input 
                type="radio" 
                :id="'type_'+type.value" 
                :value="type.value" 
                v-model="selectedCementType"
              />
              <label :for="'type_'+type.value">{{ type.label }}</label>
            </div>
          </div>
        </div>
        
        <!-- 文件上传区域（仅当选择"导入仪器测试结果"时显示） -->
        <div v-if="showImportSection" class="import-section">
          <h3>导入仪器测试结果</h3>
          <input 
            type="file" 
            @change="handleFileUpload" 
            accept=".csv,.xlsx,.xls" 
            ref="fileInput"
          />
          <div v-if="uploadProgress > 0" class="progress-container">
            <div class="progress-bar" :style="{width: uploadProgress + '%'}"></div>
            <span class="progress-text">{{ uploadProgress }}%</span>
          </div>
          <p v-if="uploadedFileName" class="file-name">已上传文件: {{ uploadedFileName }}</p>
        </div>
        
        <!-- 手动输入区域（仅当选择"手动输入"时显示） 手动输入手动输入手动输入手动输入手动输入手动输入手动输入-->
        <div v-if="showManualInput" class="manual-input-section">
          <h3>水泥矿物的组成</h3>
          <div class="input-group">
            <label>硅酸三钙(%):</label>
            <input type="number" v-model.number="manualInput.cementAmount" />
          </div>
          <div class="input-group">
            <label>硅酸二钙(%):</label>
            <!-- <input type="number" step="0.01" v-model.number="manualInput.waterCementRatio" /> -->
            <input type="number" v-model.number="manualInput.waterCementRatio" />
          </div>
          <div class="input-group">
            <label>铝酸三钙 (%):</label>
            <input type="number" v-model.number="manualInput.mineralAdmixtureRatio" />
          </div>
          <div class="input-group">
            <label>铁铝酸四钙 (%):</label>
            <!-- <input type="text" v-model="manualInput.textVariable" placeholder="" /> -->
            <input type="number" v-model.number="manualInput.cementAmount1" />
          </div>
        </div>
      </div>
      
      <!-- 混凝土配合比选择 -->
      <div class="parameter-column">
        <h3>混凝土配合比</h3>
        <div class="radio-group">
          <div v-for="item in ratioOptions" :key="item.value" class="radio-item">
            <input 
              type="radio" 
              :id="'ratio_'+item.value" 
              :value="item.value" 
              v-model="selectedRatio"
            />
            <label :for="'ratio_'+item.value">{{ item.label }}</label>
          </div>
        </div>
        
        <!-- 强度等级与地域选项（仅当选择"根据强度等级与地域生成"时显示） -->
        <div v-if="showRegionOptions" class="sub-options">
          <h4>强度等级与地域</h4>
          <div class="input-group">
            <label>强度等级：</label>
            <select v-model="strengthGrade">
              <option v-for="grade in strengthGrades" :value="grade.value" :key="grade.value">
                {{ grade.label }}
              </option>
            </select>
          </div>
          <div class="input-group">
            <label>地域：</label>
            <select v-model="region">
              <option v-for="area in regions" :value="area.value" :key="area.value">
                {{ area.label }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- 配合比手动输入区域（仅当选择"手动输入"时显示） -->
        <div v-if="showRatioManualInput" class="manual-input-section">
          <h3>手动输入配合比</h3>
          <div class="input-group">
            <label>水泥:</label>
            <input type="number" v-model.number="manualRatioInput.sandRatio" />
          </div>
          <div class="input-group">
            <label>粉煤灰:</label>
            <input type="number" v-model.number="manualRatioInput.coarseAggregateRatio" />
          </div>
          <div class="input-group">
            <label>磨细矿渣粉:</label>
            <!-- <input type="number" step="0.01" v-model.number="manualRatioInput.admixtureRatio" /> -->
            <input type="number" v-model.number="manualRatioInput.admixtureRatio" />
          </div>
          <div class="input-group">
            <label>水:</label>
            <input type="number" v-model.number="manualRatioInput.sandRatio1" />
          </div>
            <div class="input-group">
            <label>砂:</label>
            <input type="number" v-model.number="manualRatioInput.sandRatio2" />
          </div>
            <div class="input-group">
            <label>碎石:</label>
            <input type="number" v-model.number="manualRatioInput.sandRatio3" />
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="button-container">
      <button @click="submitForm" :disabled="!isFormValid">确定</button>
      <button @click="resetForm">重置</button>
    </div>

    
    <!-- 结果显示区域 
    <div v-if="showResults" class="results-section">
      <h2>计算结果</h2>
      <div class="result-item">
        <h3>输入参数</h3>
        <pre>{{ inputParameters }}</pre>
      </div>
      <div class="result-item">
        <h3>计算结果</h3>
        <pre>{{ calculationResults }}</pre>
      </div>
      <div class="result-item">
        <h3>TEXT变量</h3>
        <p>{{ manualInput.textVariable || '未输入TEXT变量' }}</p>
      </div>
    </div>-->

    <!-- 图表展示区域 -->
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
import { ref, computed, onMounted } from 'vue'
import * as echarts from 'echarts'

// 选项配置
const cementOptions = [
  { value: 'import', label: '导入仪器测试结果' },
  { value: 'generate', label: '根据水泥类型生成' },
  { value: 'manual', label: '手动输入' }
]

const cementTypes = [
  { value: 'ordinary', label: '普通硅酸盐水泥' },
  { value: 'slag', label: '矿渣硅酸盐水泥' },
  { value: 'flyash', label: '粉煤灰硅酸盐水泥' },
  { value: 'composite', label: '复合硅酸盐水泥' }
]

const ratioOptions = [
  { value: 'region', label: '根据强度等级与地域生成' },
  { value: 'manual', label: '手动输入' }
]

const strengthGrades = [
  { value: 'C25', label: 'C25' },
  { value: 'C30', label: 'C30' },
  { value: 'C35', label: 'C35' },
  { value: 'C40', label: 'C40' },
  { value: 'C45', label: 'C45' },
  { value: 'C50', label: 'C50' }
]

const regions = [
  { value: 'dongbeihuabei', label: '东北华北' },
  { value: 'xibeidiqu', label: '西北地区' },
  { value: 'huazhongdiqu', label: '华中地区' },
  { value: 'huadongdiqu', label: '华东地区' },
  { value: 'huanandiqu', label: '华南地区' },
  { value: 'xinandiqu', label: '西南地区' }
]

// 响应式数据
const selectedCement = ref('')
const selectedCementType = ref('')
const selectedRatio = ref('')
const strengthGrade = ref('C30')
const region = ref('dongbeihuabei')
const uploadProgress = ref(0)
const uploadedFileName = ref('')
const fileInput = ref(null)
const showResults = ref(false)
const inputParameters = ref({})
const calculationResults = ref({})

// 手动输入数据
const manualInput = ref({
  cementAmount: 55,
  waterCementRatio: 20,
  mineralAdmixtureRatio: 8,
  cementAmount1: 10
})

const manualRatioInput = ref({
  sandRatio: 280,
  coarseAggregateRatio: 40,
  admixtureRatio: 80,
  sandRatio1: 160,
  sandRatio2: 700,
  sandRatio3: 1100,
})

// 计算属性
const showCementTypeOptions = computed(() => selectedCement.value === 'generate')
const showRegionOptions = computed(() => selectedRatio.value === 'region')
const showImportSection = computed(() => selectedCement.value === 'import')
const showManualInput = computed(() => selectedCement.value === 'manual')
const showRatioManualInput = computed(() => selectedRatio.value === 'manual')

const isFormValid = computed(() => {
  // 验证表单是否完整
  if (!selectedCement.value || !selectedRatio.value) return false
  
  if (selectedCement.value === 'generate' && !selectedCementType.value) return false
  if (selectedRatio.value === 'region' && (!strengthGrade.value || !region.value)) return false
  if (selectedCement.value === 'import' && !uploadedFileName.value) return false
  
  // 验证手动输入数据
  if (selectedCement.value === 'manual') {
    if (isNaN(manualInput.value.cementAmount) || manualInput.value.cementAmount <= 0) return false
    if (isNaN(manualInput.value.waterCementRatio) || manualInput.value.waterCementRatio <= 0) return false
    if (isNaN(manualInput.value.mineralAdmixtureRatio) || manualInput.value.mineralAdmixtureRatio < 0) return false
  }
  
  if (selectedRatio.value === 'manual') {
    if (isNaN(manualRatioInput.value.sandRatio) || manualRatioInput.value.sandRatio <= 0) return false
    if (isNaN(manualRatioInput.value.coarseAggregateRatio) || manualRatioInput.value.coarseAggregateRatio <= 0) return false
    if (isNaN(manualRatioInput.value.admixtureRatio) || manualRatioInput.value.admixtureRatio < 0) return false
  }
  
  return true
})

// 图表引用
const heatReleaseChart = ref(null)
const temperatureRiseChart = ref(null)
let heatReleaseChartInstance = null
let temperatureRiseChartInstance = null

// 处理方法
const handleCementChange = () => {
  // 切换水泥选项时重置相关数据
  selectedCementType.value = ''
  uploadedFileName.value = ''
  uploadProgress.value = 0
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  uploadedFileName.value = file.name
  uploadProgress.value = 0
  
  // 模拟文件上传过程
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      // 这里可以添加实际的文件处理逻辑
      console.log('文件上传完成:', file.name)
    }
  }, 300)
}

const submitForm = () => {
  if (!isFormValid.value) return
  
  // 收集输入参数
  collectInputParameters()
  
  // 执行计算
  performCalculations()
  
  // 生成模拟数据
  const data = generateData()
  
  // 更新图表
  updateCharts(data)
  
  // 显示结果
  showResults.value = true
}

const resetForm = () => {
  selectedCement.value = ''
  selectedCementType.value = ''
  selectedRatio.value = ''
  strengthGrade.value = 'C30'
  region.value = 'dongbeihuabei'
  uploadProgress.value = 0
  uploadedFileName.value = ''
  showResults.value = false
  
  // 重置手动输入
  manualInput.value = {
    cementAmount: 55,
    waterCementRatio: 20,
    mineralAdmixtureRatio: 8,
    cementAmount1: 10
  }
  
  manualRatioInput.value = {
      sandRatio: 280,
      coarseAggregateRatio: 40,
      admixtureRatio: 80,
      sandRatio1: 160,
      sandRatio2: 700,
      sandRatio3: 1100,
  }
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const collectInputParameters = () => {
  inputParameters.value = {
    cementOption: selectedCement.value,
    ratioOption: selectedRatio.value,
    cementType: selectedCementType.value,
    strengthGrade: strengthGrade.value,
    region: region.value,
    manualInput: selectedCement.value === 'manual' ? manualInput.value : null,
    manualRatioInput: selectedRatio.value === 'manual' ? manualRatioInput.value : null,
    uploadedFile: uploadedFileName.value
  }
}

const performCalculations = () => {
  // 这里应该是实际的计算逻辑
  // 这里只是模拟计算结果
  calculationResults.value = {
    heatRelease: {
      maxValue: 350,
      timeToMax: 72,
      curveType: 'exponential'
    },
    temperatureRise: {
      maxValue: 45.5,
      timeToMax: 96,
      curveType: 'logarithmic'
    },
    textVariable: manualInput.value.textVariable
  }
}

const generateData = () => {
  // 根据选择生成不同的模拟数据
  let heatData = []
  let tempData = []
  
  // 基础值根据水泥类型确定
  let baseValue = 100 // 默认值
  if (selectedCement.value === 'generate') {
    switch (selectedCementType.value) {
      case 'ordinary': baseValue = 120; break
      case 'slag': baseValue = 110; break
      case 'flyash': baseValue = 100; break
      case 'composite': baseValue = 90; break
    }
  } else if (selectedCement.value === 'import') {
    baseValue = 105 // 导入文件时的基准值
  } else if (selectedCement.value === 'manual') {
    // 根据手动输入计算基础值
    baseValue = manualInput.value.cementAmount * 0.3 + 
               (1 - manualInput.value.mineralAdmixtureRatio / 100) * 20
  }
  
  // 强度等级影响系数
  let strengthFactor = 1.0
  switch (strengthGrade.value) {
    case 'C25': strengthFactor = 0.9; break
    case 'C30': strengthFactor = 1.0; break
    case 'C35': strengthFactor = 1.1; break
    case 'C40': strengthFactor = 1.2; break
    case 'C45': strengthFactor = 1.3; break
    case 'C50': strengthFactor = 1.4; break
  }
  
  // 地域影响系数
  let regionFactor = 1.0
  switch (region.value) {
    case 'dongbeihuabei': regionFactor = 1.1; break
    case 'xibeidiqu': regionFactor = 0.9; break
    case 'huazhongdiqu': regionFactor = 1.0; break
    case 'huadongdiqu': regionFactor = 1.05; break
    case 'huanandiqu': regionFactor = 0.95; break
    case 'xinandiqu': regionFactor = 0.98; break
  }
  
  // 配合比影响系数
  let ratioFactor = 1.0
  if (selectedRatio.value === 'manual') {
    ratioFactor = manualRatioInput.value.sandRatio * 0.01 + 
                 manualRatioInput.value.coarseAggregateRatio * 0.005 +
                 manualRatioInput.value.admixtureRatio * 0.1
  }
  
  // 生成7个时间点的数据----图标生成区域---------------------------------------------------------------------------------图标生成区域
  for (let i = 0; i < 8; i++) {
    const timeFactor = 1 + i * 1.65
    heatData.push(Math.round(baseValue * strengthFactor * regionFactor * ratioFactor * timeFactor))
    tempData.push(Math.round(baseValue * strengthFactor * regionFactor * ratioFactor * 0.8 * timeFactor))
  }
  
  return {
    heatData,
    tempData,
    timeLabels: ['0h', '12h', '24h', '36h', '48h', '72h', '96h']
  }
}

const updateCharts = (data) => {
  // 设置放热量图表选项
  const heatReleaseOption = {
    tooltip: {
      trigger: 'axis',
      formatter: '时间: {b0}<br/>放热量: {c0} kJ/m³'
    },
    xAxis: {
      type: 'category',
      data: data.timeLabels,
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
      data: data.timeLabels,
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

// 初始化图表
onMounted(() => {
  heatReleaseChartInstance = echarts.init(heatReleaseChart.value)
  temperatureRiseChartInstance = echarts.init(temperatureRiseChart.value)
  
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
  font-family: 'Arial', sans-serif;
  color: #333;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 28px;
}

.parameter-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 20px;
}

.parameter-column {
  flex: 1;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

h3 {
  margin-bottom: 15px;
  color: #3498db;
  font-size: 18px;
}

h4 {
  margin: 15px 0 10px;
  color: #2980b9;
  font-size: 16px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-item {
  display: flex;
  align-items: center;
}

.radio-item input[type="radio"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
}

.sub-options {
  margin-top: 15px;
  padding: 15px;
  background-color: #e8f4fc;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.input-group {
  margin: 10px 0;
  display: flex;
  align-items: center;
}

.input-group label {
  width: 120px;
  font-size: 14px;
}

.input-group input,
.input-group select {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.import-section,
.manual-input-section {
  margin: 20px 0;
  padding: 20px;
  background-color: #f0f8ff;
  border-radius: 8px;
  border: 1px dashed #3498db;
}

.progress-container {
  margin-top: 10px;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s;
}

.progress-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.file-name {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
}

button {
  padding: 12px 24px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  min-width: 120px;
}

button:hover {
  background-color: #2980b9;
}

button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.results-section {
  margin: 30px 0;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.result-item {
  margin-bottom: 20px;
}

.result-item h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.result-item pre {
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
  overflow-x: auto;
}

.chart-row {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.chart-column {
  flex: 1;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>