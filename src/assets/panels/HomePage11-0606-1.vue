<template>
  <div class="calculator-container">
    <h1>混凝土放热量与绝热温升计算器</h1>

    <!-- 操作按钮 -->
    <div class="fubiaoti-container">
      <h2>水泥矿物组成与混凝土配合比参数输入</h2>
      <h2>图表显示曲线</h2>
    </div>
    
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

            <!-- 文件上传区域 -->
            <div v-if="showImportSection" class="import-section">
              <h4>导入仪器测试结果</h4>
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

            <!-- 强度等级与地域选项 -->
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
                <input type="number" v-model.number="manualRatioInput.sandRatio2">
              </div>
              <div class="input-group">
                <label>碎石量(kg/m³):</label>
                <input type="number" v-model.number="manualRatioInput.sandRatio3">
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
      <button @click="handleCalculate">确定</button>
      <button @click="resetForm">重置</button>
    </div>
    <!-- 容重警告对话框 -->
    <div v-if="showDensityWarning" class="modal-overlay">
      <div class="modal-content">
        <p>容重不在正常范围内(2200~2500 kg/m³)，您可重新填写，也可以按照容重2350的标准，将各组分用量等比例缩放。</p>
        <div class="modal-buttons">
          <button @click="handleRescale">等比例缩放</button>
          <button @click="handleReinput">重新填写</button>
        </div>
      </div>
    </div>
  </div>
</template>

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
  { value: 'ordinary', label: '普通硅酸盐水泥（P·O 42.5）' },
  { value: 'slag', label: '普通硅酸盐水泥（P·O 52.5）' },
  { value: 'flyash', label: '中热水泥（P·MH）' },
  { value: 'composite', label: '低热水泥（P·LH）' }
]

const ratioOptions = [
  { value: 'region', label: '根据强度等级与地域生成' },
  { value: 'manual', label: '手动输入' }
]

const strengthGrades = [
  { value: 'C20', label: 'C20' },
  { value: 'C25', label: 'C25' },
  { value: 'C30', label: 'C30' },
  { value: 'C40', label: 'C40' },
  { value: 'C50', label: 'C50' }
]

const regions = [
  { value: 'dongbeidiqu', label: '东北地区' },
  { value: 'huabeidiqu', label: '华北地区' },
  { value: 'huazhongdiqu', label: '华中地区' },
  { value: 'huadongdiqu', label: '华东地区' },
  { value: 'huanandiqu', label: '华南地区' },
  { value: 'xinandiqu', label: '西南地区' }
]

// 新增：容重预设值映射表
const densityPresets = {
  'C20-dongbeidiqu': 2390,
  'C20-huabeidiqu': 2390,
  'C20-huazhongdiqu': 2380,
  'C20-huadongdiqu': 2380,
  'C20-huanandiqu': 2420,
  'C20-xinandiqu': 2420,
  
  'C25-dongbeidiqu': 2390,
  'C25-huabeidiqu': 2390,
  'C25-huazhongdiqu': 2390,
  'C25-huadongdiqu': 2390,
  'C25-huanandiqu': 2430,
  'C25-xinandiqu': 2430,
  
  'C30-dongbeidiqu': 2400,
  'C30-huabeidiqu': 2400,
  'C30-huazhongdiqu': 2390,
  'C30-huadongdiqu': 2390,
  'C30-huanandiqu': 2450,
  'C30-xinandiqu': 2400,  // 西南地区C30容重2330
  
  'C40-dongbeidiqu': 2410,
  'C40-huabeidiqu': 2410,
  'C40-huazhongdiqu': 2410,
  'C40-huadongdiqu': 2410,
  'C40-huanandiqu': 2450,
  'C40-xinandiqu': 2450,
  
  'C50-dongbeidiqu': 2440,
  'C50-huabeidiqu': 2440,
  'C50-huazhongdiqu': 2440,
  'C50-huadongdiqu': 2440,
  'C50-huanandiqu': 2440,
  'C50-xinandiqu': 2440
}

// 响应式数据
const showDensityWarning = ref(false)
const density = ref(2350) // 默认容重
const originalRatioInput = ref({}) // 保存原始输入用于重新填写

// 响应式数据
const selectedCement = ref('manual')
const selectedCementType = ref('ordinary')
const selectedRatio = ref('manual')
const strengthGrade = ref('C30')
const region = ref('dongbeidiqu')
const uploadProgress = ref(0)
const uploadedFileName = ref('')
const fileInput = ref(null)

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
  sandRatio2: 700,
  sandRatio3: 1100
})

// 不同强度等级和地域的配合比预设值
const ratioPresets = {
   C20: {
    dongbeidiqu: { cement: 263, flyAsh: 53, slag: 0, water: 168, sandRatio2: 810, sandRatio3: 1097 },
    huabeidiqu:  { cement: 263, flyAsh: 53, slag: 0, water: 168, sandRatio2: 810, sandRatio3: 1097 },
    huazhongdiqu: { cement: 234, flyAsh: 76, slag: 0, water: 168, sandRatio2: 785, sandRatio3: 1117 },
    huadongdiqu:  { cement: 234, flyAsh: 76, slag: 0, water: 168, sandRatio2: 785, sandRatio3: 1117 },
    huanandiqu: { cement: 265, flyAsh: 46, slag: 0, water: 168, sandRatio2: 861, sandRatio3: 1080 },
    xinandiqu:  { cement: 265, flyAsh: 46, slag: 0, water: 168, sandRatio2: 861, sandRatio3: 1080 }
  },C25: {
    dongbeidiqu: { cement: 274, flyAsh: 65, slag: 0, water: 166, sandRatio2: 795, sandRatio3: 1090 },
    huabeidiqu:  { cement: 274, flyAsh: 65, slag: 0, water: 166, sandRatio2: 795, sandRatio3: 1090 },
    huazhongdiqu: { cement: 252, flyAsh: 78, slag: 0, water: 163, sandRatio2: 762, sandRatio3: 1134 },
    huadongdiqu: { cement: 252, flyAsh: 78, slag: 0, water: 163, sandRatio2: 762, sandRatio3: 1134 },
    huanandiqu: { cement: 286, flyAsh: 51, slag: 0, water: 166, sandRatio2: 846, sandRatio3: 1081 },
    xinandiqu: { cement: 286, flyAsh: 51, slag: 0, water: 166, sandRatio2: 846, sandRatio3: 1081 }
  },
  C30: {
    dongbeidiqu: { cement: 309, flyAsh: 77, slag: 0, water: 163, sandRatio2: 781, sandRatio3: 1070 },
    huabeidiqu:  { cement: 309, flyAsh: 77, slag: 0, water: 163, sandRatio2: 781, sandRatio3: 1070 },
    huazhongdiqu:{ cement: 298, flyAsh: 92, slag: 0, water: 169, sandRatio2: 754, sandRatio3: 1077 },
    huadongdiqu: { cement: 298, flyAsh: 92, slag: 0, water: 169, sandRatio2: 754, sandRatio3: 1077 },
    huanandiqu: { cement: 336, flyAsh: 53, slag: 0, water: 171, sandRatio2: 828, sandRatio3: 1061 },
    xinandiqu: { cement: 319, flyAsh: 60, slag: 0, water: 167, sandRatio2: 862, sandRatio3: 992 }
  },
  C40: {
    dongbeidiqu: { cement: 368, flyAsh: 68, slag: 0, water: 157, sandRatio2: 735, sandRatio3: 1082 },
    huabeidiqu: { cement: 368, flyAsh: 68, slag: 0, water: 157, sandRatio2: 735, sandRatio3: 1082 },
    huazhongdiqu: { cement: 364, flyAsh: 73, slag: 0, water: 157, sandRatio2: 734, sandRatio3: 1082 },
    huadongdiqu: { cement: 364, flyAsh: 73, slag: 0, water: 157, sandRatio2: 734, sandRatio3: 1082 },
    huanandiqu: { cement: 378, flyAsh: 52, slag: 0, water: 159, sandRatio2: 750, sandRatio3: 1111 },
    xinandiqu: { cement: 378, flyAsh: 52, slag: 0, water: 159, sandRatio2: 750, sandRatio3: 1111 }
  },
 
  C50: {
    dongbeidiqu: { cement: 428, flyAsh: 59, slag: 154, water: 0, sandRatio2: 709, sandRatio3: 1090 },
    huabeidiqu:{ cement: 428, flyAsh: 59, slag: 154, water: 0, sandRatio2: 709, sandRatio3: 1090 },
    huazhongdiqu: { cement: 428, flyAsh: 59, slag: 154, water: 0, sandRatio2: 709, sandRatio3: 1090 },
    huadongdiqu: { cement: 428, flyAsh: 59, slag: 154, water: 0, sandRatio2: 709, sandRatio3: 1090 },
    huanandiqu: { cement: 428, flyAsh: 59, slag: 154, water: 0, sandRatio2: 709, sandRatio3: 1090 },
    xinandiqu: { cement: 428, flyAsh: 59, slag: 154, water: 0, sandRatio2: 709, sandRatio3: 1090 }
  }
}

// 计算属性
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

// 显示控制
const showManualInput = computed(() => selectedCement.value === 'manual')
const showRatioManualInput = computed(() => selectedRatio.value === 'manual')
const showCementTypeOptions = computed(() => selectedCement.value === 'generate')
const showRegionOptions = computed(() => selectedRatio.value === 'region')
const showImportSection = computed(() => selectedCement.value === 'import')

// 表单验证
const isFormValid = computed(() => {
  // 手动输入模式需要验证所有输入值
  if (selectedCement.value === 'manual') {
    const cementValid = Object.values(manualInput.value).every(v => v > 0)
    
    if (selectedRatio.value === 'manual') {
      return cementValid && Object.values(manualRatioInput.value).every(v => v > 0)
    }
    return cementValid
  }
  // 其他模式只需要验证必填项
  return true
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

  // 绝热温升计算 - 使用计算得到的容重density.value
  const yData2 = xData.map((x, index) => {
    const currentY1 = yData1[index]
    const mW = manualRatioInput.value.water * Math.exp(-0.04 * x)
    const brr = (manualRatioInput.value.cement * snbrr.value + 
                manualRatioInput.value.flyAsh * 0.85 + 
                manualRatioInput.value.slag * 0.80 + 
                manualRatioInput.value.sandRatio2 * 0.80 +
                manualRatioInput.value.sandRatio3 * 0.85 +
                mW * 4.18) / 
               (manualRatioInput.value.cement + 
                manualRatioInput.value.flyAsh + 
                manualRatioInput.value.slag + 
                manualRatioInput.value.sandRatio2 +
                manualRatioInput.value.sandRatio3 +
                mW)
    return currentY1 / (brr * density.value)
  })

  return { xData, yData1, yData2 }
}

// 计算容重
const calculateDensity = () => {
  

  // 情况1：根据地域和等级生成配合比
  if (selectedRatio.value === 'region') {
    const key = `${strengthGrade.value}-${region.value}`
    density.value = densityPresets[key] // 使用预设值或默认值
    //density.value = densityPresets[key] || 2350 // 使用预设值或默认值

    return true
  }
  if(selectedRatio.value === 'manual') {
    // 情况2：手动输入配合比
      const { cement, flyAsh, slag, water, sandRatio2, sandRatio3 } = manualRatioInput.value
      const sum = cement + flyAsh + slag + water + sandRatio2 + sandRatio3
      
      // 保存原始输入值
      originalRatioInput.value = {...manualRatioInput.value}
      
      // 检查是否在正常范围
      if (sum >= 2200 && sum <= 2500) {
        // 在范围内：容重 = 各项之和 * 0.98 向下取整到10kg/m³
        const rawDensity = sum * 0.98
        density.value = Math.floor(rawDensity / 10) * 10
        return true
      }
      
      // 不在范围内：显示警告对话框
      showDensityWarning.value = true
      return false
  }
  
}

// 处理等比例缩放
const handleRescale = () => {
  const { cement, flyAsh, slag, water, sandRatio2, sandRatio3 } = originalRatioInput.value
  const sum = cement + flyAsh + slag + water + sandRatio2 + sandRatio3
  
  // 计算缩放比例
  const scale = 2400 / sum
  
  // 等比例缩放各项参数
  manualRatioInput.value.cement = Math.round(cement * scale * 10) / 10
  manualRatioInput.value.flyAsh = Math.round(flyAsh * scale * 10) / 10
  manualRatioInput.value.slag = Math.round(slag * scale * 10) / 10
  manualRatioInput.value.water = Math.round(water * scale * 10) / 10
  manualRatioInput.value.sandRatio2 = Math.round(sandRatio2 * scale * 10) / 10
  manualRatioInput.value.sandRatio3 = Math.round(sandRatio3 * scale * 10) / 10
  
  // 设置容重为2350
  density.value = 2350
  
  // 关闭对话框并更新图表
  showDensityWarning.value = false
  updateCharts()
}

// 处理重新填写
const handleReinput = () => {
  // 恢复原始输入值
  manualRatioInput.value = {...originalRatioInput.value}
  showDensityWarning.value = false
}

// 处理计算
// const handleCalculate = () => {
//   if (!isFormValid.value) {
//     alert('请填写完整的参数信息')
//     return
//   }

//   // 计算容重
//   const densityValid = calculateDensity()
  
//   // 如果容重计算有效（不需要用户选择）则更新图表
//   if (densityValid) {
//     updateCharts()
//   }
// }
// 修改后的 handleCalculate 函数
const handleCalculate = () => {
  if (!isFormValid.value) {
    alert('请填写完整的参数信息')
    return
  }

  // 模式1: 手动输入水泥矿物组成 + 手动输入配合比
  if (selectedCement.value === 'manual' && selectedRatio.value === 'manual') {
    if (calculateDensity()) {
      updateCharts();
    }
    return;
  }

  // 模式2: 手动输入水泥矿物组成 + 根据强度等级与地域生成配合比
  if (selectedCement.value === 'manual' && selectedRatio.value === 'region') {
    const preset = ratioPresets[strengthGrade.value]?.[region.value];
    if (!preset) {
      alert('该强度等级或地域暂无预设配合比');
      return;
    }
    // 更新配合比输入值
    manualRatioInput.value = { ...preset };
    // 计算容重（使用预设容重）
    if (calculateDensity()) {
      updateCharts();
    }
    return;
  }

  // 模式3: 根据水泥类型生成矿物组成
  if (selectedCement.value === 'generate') {
    // 根据水泥类型设置默认值
    switch(selectedCementType.value) {
      case 'ordinary':
        manualInput.value = { c3s: 55, c2s: 20, c3a: 10, c4af: 8 };
        break;
      case 'slag':
        manualInput.value = { c3s: 60, c2s: 15, c3a: 12, c4af: 8 };
        break;
      case 'flyash':
        manualInput.value = { c3s: 50, c2s: 30, c3a: 5, c4af: 12 };
        break;
      case 'composite':
        manualInput.value = { c3s: 45, c2s: 40, c3a: 4, c4af: 15 };
        break;
    }
    // 如果是手动输入配合比，则直接计算；如果是根据地域生成，则还需要设置配合比
    if (selectedRatio.value === 'manual') {
      if (calculateDensity()) {
        updateCharts();
      }
    } else if (selectedRatio.value === 'region') {
      const preset = ratioPresets[strengthGrade.value]?.[region.value];
      if (!preset) {
        alert('该强度等级或地域暂无预设配合比');
        return;
      }
      manualRatioInput.value = { ...preset };
      if (calculateDensity()) {
        updateCharts();
      }
    }
    return;
  }

  // 模式4: 导入文件
  if (selectedCement.value === 'import') {
    if (!uploadedFileName.value) {
      alert('请先上传文件');
      return;
    }
    // 模拟从文件读取数据
    manualInput.value = { c3s: 52, c2s: 22, c3a: 7, c4af: 11 };
    // 根据配合比输入方式处理
    if (selectedRatio.value === 'manual') {
      if (calculateDensity()) {
        updateCharts();
      }
    } else if (selectedRatio.value === 'region') {
      const preset = ratioPresets[strengthGrade.value]?.[region.value];
      if (!preset) {
        alert('该强度等级或地域暂无预设配合比');
        return;
      }
      manualRatioInput.value = { ...preset };
      if (calculateDensity()) {
        updateCharts();
      }
    }
  }
}

// 更新图表
// 更新图表
const updateCharts = () => {
  const { xData, yData1, yData2 } = generateChartData()

  const heatOption = {
    tooltip: {
      trigger: 'axis',
      formatter: params => `时间: ${(params[0].axisValue/24).toFixed(1)}天<br/>放热量: ${params[0].data[1].toFixed(2)} kJ/kg`
    },
    xAxis: {
      name: '天',
      type: 'value',
      min: 0,
      max: 700,
      // 关键修改：设置每2天显示一个标签
      axisLabel: {
        interval: 48, // 48小时 = 2天
        formatter: function(value) {
          // 将小时转换为天，保留1位小数
          return (value / 24).toFixed(0) + '';
        },
        padding: [0, 0, 100, 0],

      }
    },
    yAxis: { 
      name: '放热量(kJ/kg)', 
      type: 'value',
      axisLabel: {
        align: 'right',
        padding: [0, 0, 0, 20],
        offset: 100000000,
        margin: 0.5
      }
    },
    series: [{
      data: xData.map((x, i) => [x, yData1[i]]),
      type: 'line',
      smooth: true,
      offset: 100,
      lineStyle: { width: 2, color: '#1890ff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(24,144,255,0.5)' },
          { offset: 1, color: 'rgba(24,144,255,0.1)' }
        ])
      }
    }]
  };

  const tempOption = {
    tooltip: {
      trigger: 'axis',
      formatter: params => `时间: ${(params[0].axisValue/24).toFixed(1)}天<br/>温升: ${params[0].data[1].toFixed(2)}°C`
    },
    xAxis: {
      name: '天',
      type: 'value',
      min: 0,
      max: 700,
      // 关键修改：设置每2天显示一个标签
      axisLabel: {
        interval: 48, // 48小时 = 2天
        formatter: function(value) {
          // 将小时转换为天，保留1位小数
          return (value / 24).toFixed(0) + '';
        }
      }
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
  };

  if (heatChartInstance) {
    heatChartInstance.setOption(heatOption);
  }
  if (tempChartInstance) {
    tempChartInstance.setOption(tempOption);
  }
}


const handleManualCase = () => {
      if (selectedCement.value === 'manual' && selectedRatio.value === 'manual') {
        updateCharts()
        return true // 在函数内部使用return
      }
      return false
    }

    // 在handleCalculat中调用
handleManualCase();

  // 模式2: 手动输入水泥矿物组成 + 根据强度等级与地域生成配合比
  if (selectedCement.value === 'manual' && selectedRatio.value === 'region') {
    // 根据强度等级和地域设置配合比
    const preset = ratioPresets[strengthGrade.value]?.[region.value]
    
    const handleRegionCase = () => {
      if (selectedCement.value === 'manual' && selectedRatio.value === 'region') {
        const preset = ratioPresets[strengthGrade.value]?.[region.value]
        if (!preset) {
          alert('该强度等级或地域暂无预设配合比')
          return true // ✅ 在函数体内
        }
        manualRatioInput.value = { ...preset }
        updateCharts()
        return true
      }
      return false
    }

    // 在 handleCalculat中调用
    handleRegionCase();


  }

  // 其他模式的处理逻辑
  if (selectedCement.value === 'generate') {
    // 根据水泥类型设置默认值
    switch(selectedCementType.value) {
      case 'ordinary':
        manualInput.value = { c3s: 55, c2s: 20, c3a: 8, c4af: 10 }
        break
      case 'slag':
        manualInput.value = { c3s: 45, c2s: 30, c3a: 6, c4af: 12 }
        break
      case 'flyash':
        manualInput.value = { c3s: 50, c2s: 25, c3a: 5, c4af: 8 }
        break
      case 'composite':
        manualInput.value = { c3s: 48, c2s: 28, c3a: 7, c4af: 9 }
        break
    }
  }

  /*
  // 如果是导入文件模式
  if (selectedCement.value === 'import') {
    // 这里可以添加文件导入后的处理逻辑
    if (!uploadedFileName.value) {
      alert('请先上传文件')
      return
    }
    // 模拟从文件读取数据
    manualInput.value = { c3s: 52, c2s: 22, c3a: 7, c4af: 11 }
  }
    */
   // 修改后（正确）
const handleImportCase = () => {
  if (selectedCement.value === 'import') {
    if (!uploadedFileName.value) {
      alert('请先上传文件')
      return true // ✅ 在函数体内
    }
    // 模拟从文件读取数据
    return true
  }
  return false
}

// 在 handleCalculate 中调用
//if (handleImportCase()) return
if (!handleImportCase())

  // 最后更新图表
  updateCharts()
//}

// 重置表单
const resetForm = () => {
  selectedCement.value = 'manual'
  selectedRatio.value = 'manual'
  selectedCementType.value = 'ordinary'
  strengthGrade.value = 'C30'
  region.value = 'dongbeidiqu'
  uploadProgress.value = 0
  uploadedFileName.value = ''
  
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
    sandRatio2: 700,
    sandRatio3: 1100
  }
  
  if (heatChartInstance && tempChartInstance) {
    heatChartInstance.clear()
    tempChartInstance.clear()
  }
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 文件上传处理
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  uploadedFileName.value = file.name
  uploadProgress.value = 0
  
  // 模拟上传过程
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      // 这里可以添加实际的文件处理逻辑
    }
  }, 200)
}
</script>

<style scoped>
/* 新增对话框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
}

.modal-content p {
  margin-bottom: 1.5rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-buttons button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.modal-buttons button:first-child {
  background-color: #1890ff;
  color: white;
}

.modal-buttons button:last-child {
  background-color: #f5f5f5;
  color: #333;
}


h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #0b0b0bec;
  font-size: 20px;
  white-space: nowrap;
}
h2 {
  text-align: center;
  margin-bottom: 1px;
  color: #0b0b0bec;
  font-size: 18px;
  white-space: nowrap;
}
h3 {
  text-align: center;
  margin-bottom: 30px;
  color: #0b0b0bec;
  font-size: 15px;
  white-space: nowrap;
}

h4 {
  text-align: center;
  margin-bottom: 30px;
  color: #0b0b0bec;
  font-size: 15px;
  white-space: nowrap;
  position: relative;
  top: 27px;
}

h5 {
  text-align: center;
  margin-bottom: 30px;
  color: #0b0b0bec;
  font-size: 15px;
  white-space: nowrap;
  position: relative;
  top: 50px;
}

.main-content {
  display: flex;
  flex-direction: row; /* 改为垂直布局 */
  gap: 1rem; /* 减小间距 */
  margin-bottom: 1rem;
  align-items: center; /* 居中对齐 */
  width: 100%; /* 确保宽度适应 */
  max-width: 1500px; /* 限制最大宽度 */
  margin: 0 auto; /* 水平居中 */
  margin-left: -600px; /* 从-500px调整为更小的负值 */
}

.parameter-section
 {
  flex: 1;
  min-width: 600px;
  height: 470px;
  background: #f9f8f8ec;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chart-section {
  flex: 1;
  min-width: 850px;
  height: 470px;
  background: #f9f8f8ec;
  padding: 1rem;
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
  gap: 1px;
  margin: 1px 0;
  height: 450px; /* 设置固定高度 */
  width: 600px;
}

.parameter-column {
  flex: 1;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.input-group {
  margin: 5px 0;
  vertical-align: middle;
  position: relative;
  top: 35px;
}

.input-group label {
  width: 20px;
  font-size: 14px;
  color: #0b0b0bec;
}

.input-group input,
.input-group select {
  width: 55px;
  border: 1px solid #ddd;
  margin: 0 20px; /* 左右各10px间距 */

}

.chart-row {
  display: flex;
  gap: 1rem;
  height: 100%;
  height: 450px; /* 设置固定高度 */
  width: 800px; /* 设置固定宽度 */


}

.chart-column {
  flex: 1;
  min-width: 400px;
  max-width: 700px;
  padding: 15px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.chart-container {
  height: 415px;
  width: 100%;
  min-width: 0; /* 防止 flex 布局压缩 */
  overflow: visible; /* 允许内容溢出 */

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

.fubiaoti-container {
  display: flex;
  justify-content: center;
  gap: 500px;
  margin: 1px 0;
  margin-left: -200px; /* 向左偏移200px */
}
.progress-container {
  margin-top: 10px;
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: #52c41a;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #333;
  font-size: 12px;
}

.file-name {
  margin-top: 10px; 
  font-size: 12px;
  color: #666;
}
</style>