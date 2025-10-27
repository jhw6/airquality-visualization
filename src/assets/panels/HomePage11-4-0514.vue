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
        
        <!-- 水泥类型选项（仅当选择"根据水泥类型生成"时显示） 选择水泥类型选择水泥类型选择水泥类型选择水泥类型选择水泥类型-->
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
              <!-- 文件上传区域（仅当选择"导入仪器测试结果"时显示） 导入仪器测试结果导入仪器测试结果导入仪器测试结果-->
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
      </div>
    </div>

  

    <!-- 操作按钮 -->
    <div class="button-container">
      <button @click="submitForm" :disabled="!isFormValid">确定</button>
      <button @click="resetForm">重置</button>
    </div>

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
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()

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
  { value: 'manual1', label: '手动输入' }
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
  // { value: 'north', label: '北方地区' },
  // { value: 'south', label: '南方地区' },
  // { value: 'central', label: '中部地区' }
    { value:'dongbeihuabei', label: '东北华北'},
    { value:'xibeidiqu', label: '西北地区'},
    { value:'huazhongdiqu', label: '华中地区'},
    { value:'huadongdiqu', label: '华东地区'},
    { value:'huanandiqu', label: '华南地区'},
    { value:'xinandiqu',label:'西南地区'}

]

// 响应式数据
const selectedCement = ref('')
const selectedCementType = ref('')
const selectedRatio = ref('')
const strengthGrade = ref('C30')
const region = ref('north')
const uploadProgress = ref(0)
const uploadedFileName = ref('')
const fileInput = ref(null)

// 计算属性
const showCementTypeOptions = computed(() => selectedCement.value === 'generate')
const showRegionOptions = computed(() => selectedRatio.value === 'region')
const showImportSection = computed(() => selectedCement.value === 'import')
const isFormValid = computed(() => {
  // 验证表单是否完整
  if (!selectedCement.value || !selectedRatio.value) return false
  if (selectedCement.value === 'generate' && !selectedCementType.value) return false
  if (selectedRatio.value === 'region' && (!strengthGrade.value || !region.value)) return false
  if (selectedCement.value === 'import' && !uploadedFileName.value) return false
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
  
  // 生成模拟数据
  const data = generateData()
  
  // 更新图表
  updateCharts(data)
  
  // 根据选择跳转到不同页面
  if (selectedCement.value === 'import' && selectedRatio.value === 'region') {
    // 跳转到仪器测试结果+强度地域页面
    router.push({
      name: 'InstrumentRegionResult',
      query: {
        strength: strengthGrade.value,
        region: region.value,
        fileName: uploadedFileName.value
      }
    })
  } else if (selectedCement.value === 'generate' && selectedRatio.value === 'region') {
    // 跳转到水泥类型+强度地域页面
    router.push({
      name: 'CementRegionResult',
      query: {
        cementType: selectedCementType.value,
        strength: strengthGrade.value,
        region: region.value
      }
    })
  }
}

const resetForm = () => {
  selectedCement.value = ''
  selectedCementType.value = ''
  selectedRatio.value = ''
  strengthGrade.value = 'C30'
  region.value = 'north'
  uploadProgress.value = 0
  uploadedFileName.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
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
  }
  
  // 强度等级影响系数
  let strengthFactor = 1.0
  switch (strengthGrade.value) {
    case 'C20': strengthFactor = 0.9; break
    case 'C30': strengthFactor = 1.0; break
    case 'C40': strengthFactor = 1.1; break
    case 'C50': strengthFactor = 1.2; break
  }
  
  // 地域影响系数
  let regionFactor = 1.0
  switch (region.value) {
    case 'north': regionFactor = 1.1; break
    case 'south': regionFactor = 0.9; break
    case 'central': regionFactor = 1.0; break
  }
  
  // 生成7个时间点的数据
  for (let i = 0; i < 7; i++) {
    const timeFactor = 1 + i * 0.15
    heatData.push(Math.round(baseValue * strengthFactor * regionFactor * timeFactor))
    tempData.push(Math.round(baseValue * strengthFactor * regionFactor * 0.8 * timeFactor))
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
  width: 80px;
  font-size: 14px;
}

.input-group select {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.import-section {
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