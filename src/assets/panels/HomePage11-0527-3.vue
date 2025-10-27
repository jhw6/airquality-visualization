<template>
  <div class="calculator-container">
    <h1>混凝土放热量与绝热温升计算器</h1>
    
   <div class="main-content">
    <!-- 参数设置区域 -->
    <div class="parameter-section">

    <div class="parameter-row">
      <!-- 水泥矿物组成 -->
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

        <!-- 水泥类型选项 -->
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

        <!-- 手动输入区域 -->
        <div v-if="showManualInput" class="manual-input-section">
          <h4>水泥矿物组成参数</h4>
          <div class="input-group">
            <label>C3S含量(%):</label>
            <input type="number" v-model.number="manualInput.c3s" step="0.1">
          </div>
          <div class="input-group">
            <label>C2S含量(%):</label>
            <input type="number" v-model.number="manualInput.c2s" step="0.1">
          </div>
          <div class="input-group">
            <label>C3A含量(%):</label>
            <input type="number" v-model.number="manualInput.c3a" step="0.1">
          </div>
          <div class="input-group">
            <label>C4A含量(%):</label>
            <input type="number" v-model.number="manualInput.c4af" step="0.1">
          </div>
        </div>
      </div>
      
      <!-- 混凝土配合比 -->
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

        <!-- 手动输入配合比 -->
        <div v-if="showRatioManualInput" class="manual-input-section">
          <h5>配合比参数</h5>
          <div class="input-group">
            <label>水泥量(kg/m³):</label>
            <input type="number" v-model.number="manualRatioInput.cement" step="0.1">
          </div>
          <div class="input-group">
            <label>粉煤灰(kg/m³):</label>
            <input type="number" v-model.number="manualRatioInput.flyAsh" step="0.1">
          </div>
          <div class="input-group">
            <label>矿粉量(kg/m³):</label>
            <input type="number" v-model.number="manualRatioInput.slag" step="0.1">
          </div>
          <div class="input-group">
            <label>水含量(kg/m³):</label>
            <input type="number" v-model.number="manualRatioInput.water" step="0.1">
          </div>
            <div class="input-group">
            <label>砂含量(kg/m³):</label>
            <input type="number" v-model.number="manualRatioInput.sandRatio2" />
          </div>
            <div class="input-group">
            <label>碎石量(kg/m³):</label>
            <input type="number" v-model.number="manualRatioInput.sandRatio3" />
          </div>
        </div>
      </div>
    
      </div>
    </div>
  
    <div class="chart-section">
      <!-- 图表展示区域 -->
    <div class="chart-row">
        <div class="chart-column">
        <h3>绝热放热量曲线</h3>
        <div ref="heatReleaseChart" class="chart-container"></div>
    </div>
      <div class="chart-column">
        <h3>绝热温升曲线</h3>
        <div ref="temperatureRiseChart" class="chart-container"></div>
      </div>
    </div>
    </div>
  
  </div>
  
    <!-- 操作按钮 -->
    <div class="button-container">
      <button @click="calculate" :disabled="!isFormValid">确定</button>
      <button @click="resetForm">重置</button>
    </div>
  </div>

</template>

<!-- 参数设置区域 -->

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as echarts from 'echarts'

// 配置选项
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
const selectedCement = ref('manual')
const selectedCementType = ref('')
const selectedRatio = ref('manual')
const strengthGrade = ref('C30')
const region = ref('dongbeihuabei')
const uploadProgress = ref(0)
const uploadedFileName = ref('')
const fileInput = ref(null)
const showResults = ref(false)
const inputParameters = ref({})
const calculationResults = ref({})

// 手动输入参数
const manualInput = ref({
  c3s: 55,
  c2s: 20,
  c3a: 8,
  c4af: 10
})

const manualRatioInput = ref({
  cement: 280,
  flyAsh: 40,
  slag: 80,
  water: 160,
  sandRatio2:700,
  sandRatio3:1100
})



// 计算属性（来自3.txt的核心算法）
const snbrr = computed(() => 
  (0.75 * manualInput.value.c3s + 
   0.7 * manualInput.value.c2s + 
   0.78 * manualInput.value.c3a + 
   0.75 * manualInput.value.c4af) / 100)

const α_max = computed(() => {
  const a = manualRatioInput.value.cement
  const d = manualRatioInput.value.water
  const c = manualRatioInput.value.slag
  const b = manualRatioInput.value.flyAsh
  
  return (1.031 * d / a) / (0.194 + d / a) +
         0.3 * c / (a + b + c) +
         0.5 * b / (a + b + c)
})

const ZH = computed(() => ({
  c3s: manualRatioInput.value.cement * manualInput.value.c3s / 100,
  c2s: manualRatioInput.value.cement * manualInput.value.c2s / 100,
  c3a: manualRatioInput.value.cement * manualInput.value.c3a / 100,
  c4af: manualRatioInput.value.cement * manualInput.value.c4af / 100
}))

// 图表实例
const heatReleaseChart = ref(null)
const temperatureRiseChart = ref(null)
let heatChartInstance = null
let tempChartInstance = null

// 表单验证
const isFormValid = computed(() => {
  return Object.values(manualInput.value).every(v => v > 0) && 
         Object.values(manualRatioInput.value).every(v => v > 0)
})

// 图表初始化
onMounted(() => {
  heatChartInstance = echarts.init(heatReleaseChart.value)
  tempChartInstance = echarts.init(temperatureRiseChart.value)
  
  window.addEventListener('resize', () => {
    heatChartInstance?.resize()
    tempChartInstance?.resize()
  })
})

// 核心计算逻辑
const generateChartData = () => {
  const xData = Array.from({ length: 700 }, (_, i) => i + 1)
  
  // 放热量计算
  const yData1 = xData.map(x => {
    const Q_fa = manualRatioInput.value.flyAsh * 100 * α_max.value * (1 - Math.exp(-0.01 * x))
    const Q_slag = manualRatioInput.value.slag * 250 * α_max.value * (1 - Math.exp(-0.015 * x))
    const Q_cem = 
      ZH.value.c3s * 500 * α_max.value * (1 - Math.exp(-0.04 * x)) +
      ZH.value.c2s * 260 * α_max.value * (1 - Math.exp(-0.005 * x)) +
      ZH.value.c3a * 870 * α_max.value * (1 - Math.exp(-0.08 * x)) +
      ZH.value.c4af * 420 * α_max.value * (1 - Math.exp(-0.01 * x))
    
    return Q_cem + Q_fa + Q_slag
  })

  // 绝热温升计算
  const density = 2350 // 默认容重
  const yData2 = xData.map((x, index) => {
    const currentY1 = yData1[index]
    const mW = manualRatioInput.value.water * Math.exp(-0.04 * x)
    const brr = (manualRatioInput.value.cement * snbrr.value + 
                manualRatioInput.value.flyAsh * 0.85 + 
                manualRatioInput.value.slag * 0.80 + 
                manualRatioInput.value.sandRatio2 * 0.80+
                manualRatioInput.value.sandRatio3 * 0.85+
                mW * 4.18) / 
               (manualRatioInput.value.cement + 
                manualRatioInput.value.flyAsh + 
                manualRatioInput.value.slag + 
                manualRatioInput.value.sandRatio2+
                manualRatioInput.value.sandRatio3+
                mW)
    return currentY1 / (brr * density)
  })

  return { xData, yData1, yData2 }
}

// 更新图表
const updateCharts = () => {
  const { xData, yData1, yData2 } = generateChartData()

  const heatOption = {
    tooltip: {
      trigger: 'axis',
      formatter: params => `时间: ${params[0].axisValue}小时<br/>放热量: ${params[0].data[1].toFixed(2)} kJ/kg`
    },
    xAxis: {
      name: '时间(小时)',
      type: 'value',
      min: 0,
      max: 700
    },
    yAxis: { name: '放热量(kJ/kg)', type: 'value' },
    series: [{
      data: xData.map((x, i) => [x, yData1[i]]),
      type: 'line',
      smooth: true,
      lineStyle: { width: 2, color: '#1890ff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(24,144,255,0.5)' },
          { offset: 1, color: 'rgba(24,144,255,0.1)' }
        ])
      }
    }]
  }

  const tempOption = {
    tooltip: {
      trigger: 'axis',
      formatter: params => `时间: ${params[0].axisValue}小时<br/>温升: ${params[0].data[1].toFixed(2)}°C`
    },
    xAxis: {
      name: '时间(小时)',
      type: 'value',
      min: 0,
      max: 700
    },
    yAxis: { name: '温升(°C)', type: 'value' },
    series: [{
      data: xData.map((x, i) => [x, yData2[i]]),
      type: 'line',
      smooth: true,
      lineStyle: { width: 2, color: '#ff4d4f' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255,77,79,0.5)' },
          { offset: 1, color: 'rgba(255,77,79,0.1)' }
        ])
      }
    }]
  }

  heatChartInstance.setOption(heatOption)
  tempChartInstance.setOption(tempOption)
}

// 主计算函数
const calculate = () => {
  if (!isFormValid.value) return
  updateCharts()
}

// 重置表单
const resetForm = () => {
  manualInput.value = {
    c3s: 55,
    c2s: 20,
    c3a: 8,
    c4af: 10
  }
  manualRatioInput.value = {
      cement: 280,
      flyAsh: 40,
      slag: 80,
      water: 160,
      sandRatio2:700,
      sandRatio3:1100
  }
  heatChartInstance?.clear()
  tempChartInstance?.clear()
}

// 显示控制
const showManualInput = computed(() => selectedCement.value === 'manual')
const showRatioManualInput = computed(() => selectedRatio.value === 'manual')

const showCementTypeOptions = computed(() => selectedCement.value === 'generate')
const showRegionOptions = computed(() => selectedRatio.value === 'region')
const showImportSection = computed(() => selectedCement.value === 'import')
// const showManualInput = computed(() => selectedCement.value === 'manual')
// const showRatioManualInput = computed(() => selectedRatio.value === 'manual')
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 28px;
    white-space: nowrap; /* 关键属性：禁止文本换行 */

}

h3 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 20px;
    white-space: nowrap; /* 关键属性：禁止文本换行 */

}
h4 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 20px;
  white-space: nowrap; /* 关键属性：禁止文本换行 */
  /* 核心偏移代码 */
  position: relative;
  top: 27px; /* 向下偏移 20px */
}
h5 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 20px;
  white-space: nowrap; /* 关键属性：禁止文本换行 */
  /* 核心偏移代码 */
  position: relative;
  top: 50px; /* 向下偏移 20px */
}

.main-content {
  display: flex;
  gap: 2rem;         /* 两栏间距 */
  margin-bottom: 2rem;
  justify-content: center;  /* 主轴居中 */
  margin-left: -500px; /* 向左整体偏移 20px */

}

.parameter-section,
.chart-section {
  flex: 1;
  min-width: 600px;
  background: #f6f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}


.calculator-container {
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.parameter-row {
  display: flex;
  gap: 20px;
  margin: 30px 0;
}


.parameter-column {
  flex: 1;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.input-group {
  margin: 15px 0;
  vertical-align: middle; /* 行内元素对齐方式 */
  position: relative;
  top: 35px; /* 向下偏移5像素 */
}
.input-group label {
  width: 20px;
  font-size: 14px;
  color: #0b0b0bec;
}

.input-group input {
  width: 55px; /* 固定宽度 */
  border: 1px solid #ddd;
  /*flex: 1;
  padding: 8px 12px;
  
  border-radius: 4px;*/
}

.chart-row {
  display: flex;
  gap: 1.5rem;
  height: 100%;
}


.chart-column {
  flex: 1;
  min-width: 500px;
  max-width: 600px;
  padding: 15px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.chart-container {
  height: 400px;
  width: 100%; /* 添加宽度约束 */

}


.button-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
}

button {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #2980b9;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
</style>