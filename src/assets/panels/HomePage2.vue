<template>
  <div class="container">
    <div class="input-section">
      <div class="title-container">
        <h1>混凝土放热量与绝热温升计算器</h1>
      </div>
      
      <div class="input-row">
        <div class="input-item">
          <label for="a">水泥用量:</label>
          <input type="number" id="a" v-model.number="a" step="0.1">
        </div>
        <div class="input-item">
          <label for="b">粉煤灰用量:</label>
          <input type="number" id="b" v-model.number="b" step="0.1">
        </div>
        <div class="input-item">
          <label for="c">矿粉用量:</label>
          <input type="number" id="c" v-model.number="c" step="0.1">
        </div>
        <div class="input-item">
          <label for="d">水用量:</label>
          <input type="number" id="d" v-model.number="d" step="0.1">
        </div>
        <div class="input-item">
          <label for="e">砂用量:</label>
          <input type="number" id="e" v-model.number="e" step="0.1">
        </div>
      </div>
      
      <div class="input-row">
        <div class="input-item">
          <label for="f">石用量:</label>
          <input type="number" id="f" v-model.number="f" step="0.1">
        </div>
        <div class="input-item">
          <label for="g">混凝土容重:</label>
          <input type="number" id="g" v-model.number="g" step="0.1">
        </div>
        <div class="input-item">
          <label for="h1">C3S%:</label>
          <input type="number" id="h1" v-model.number="h1" step="0.1">
        </div>
        <div class="input-item">
          <label for="i">C2S%:</label>
          <input type="number" id="i" v-model.number="i" step="0.1">
        </div>
        <div class="input-item">
          <label for="j">C3A%:</label>
          <input type="number" id="j" v-model.number="j" step="0.1">
        </div>
        <div class="input-item">
          <label for="k">C4A%:</label>
          <input type="number" id="k" v-model.number="k" step="0.1">
        </div>
      </div>
    </div>
    
    <div class="button-container">
      <button @click="updateCharts">绘制曲线</button>
    </div>
    
    <div class="chart-row">
      <div ref="chartContainer1" class="chart-container"></div>
      <div ref="chartContainer2" class="chart-container"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'

// 定义响应式变量
const a = ref(280)
const b = ref(40)
const c = ref(80)
const d = ref(160)
const h1 = ref(55)
const i = ref(20)
const j = ref(8)
const k = ref(10)
const e = ref(700)
const f = ref(1100)
const g = ref(2350)

// 计算属性
const snbrr = computed(() => (0.75 * h1.value + 
                              0.7 * i.value + 
                              0.78 * j.value + 
                              0.75 * k.value)/100)
// alert(snbrr.value);

const α_max = computed(() => {
  return (1.031 * d.value / a.value) / (0.194 + d.value / a.value) +
         0.3 * c.value / (a.value + b.value + c.value) +
         0.5 * b.value / (a.value + b.value + c.value)
})

const ZH1 = computed(() => a.value * h1.value / 100)
const ZH2 = computed(() => a.value * i.value / 100)
const ZH3 = computed(() => a.value * j.value / 100)
const ZH4 = computed(() => a.value * k.value / 100)

// 图表容器引用
const chartContainer1 = ref(null)
const chartContainer2 = ref(null)
let chartInstance1 = null
let chartInstance2 = null

// 初始化图表
onMounted(() => {
  if (chartContainer1.value && chartContainer2.value) {
    chartInstance1 = echarts.init(chartContainer1.value)
    chartInstance2 = echarts.init(chartContainer2.value)
    updateCharts()
  }
})

// 计算函数值并更新图表
function updateCharts() {
  const xData = Array.from({ length: 700 }, (_, i) => i + 1)
  
  // 第一个图表的数据 - 放热量曲线
  const yData1 = xData.map(x => {
    const Q_fa = b.value * 100 * α_max.value * (1 - Math.exp(-0.01 * x))
    const Q_slag = c.value * 250 * α_max.value * (1 - Math.exp(-0.015 * x))
    const Q_cem = ZH1.value * 500 * α_max.value * (1 - Math.exp(-0.04 * x)) +
                  ZH2.value * 260 * α_max.value * (1 - Math.exp(-0.005 * x)) +
                  ZH3.value * 870 * α_max.value * (1 - Math.exp(-0.08 * x)) +
                  ZH4.value * 420 * α_max.value * (1 - Math.exp(-0.01 * x))
    return Q_cem + Q_fa + Q_slag
  })

  // 第二个图表的数据 - 绝热温升曲线
  const yData2 = xData.map((x, index) => {
    const currentY1 = yData1[index]
    const mW = d.value * Math.exp(-0.04 * x)
    const brr = (a.value * snbrr.value + b.value * 0.85 + c.value * 0.80 + 
                mW * 4.18 + e.value * 0.80 + f.value * 0.85) / 
               (a.value + b.value + c.value + mW + e.value + f.value)
    return currentY1 / (brr * g.value)
  })

  // 第一个图表的配置
  const option1 = {
    title: {
      text: '混凝土放热曲线',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '时间: {b0}小时<br/>放热量: {c0} kJ/kg'
    },
    xAxis: {
      name: '时间(小时)',
      type: 'value',
      min: 0,
      max: 700
    },
    yAxis: {
      name: '放热量(kJ/kg)',
      type: 'value',
      min: 0,
      max: 140000,
      interval: 20000, // 固定步长为10

    },
    series: [{
      name: '总放热量',
      type: 'line',
      smooth: true,
      data: yData1.map((y, index) => [xData[index], y]),
      symbol: 'none',
      lineStyle: {
        width: 3,
        color: '#1890ff'
      }
    }]
  }

  // 第二个图表的配置
  const option2 = {
    title: {
      text: '混凝土绝热温升曲线',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '时间: {b0}小时<br/>温升值: {c0} °C'
    },
    xAxis: {
      name: '时间(小时)',
      type: 'value',
      min: 0,
      max: 700
    },
    yAxis: {
      name: '温升(°C)',
      type: 'value',
      min: 0,
      max: 80,
      interval: 10, // 固定步长为10

    },
    series: [{
      name: '绝热温升',
      type: 'line',
      smooth: true,
      data: yData2.map((y, i) => [xData[i], y]),
      symbol: 'none',
      lineStyle: {
        width: 3,
        color: '#ff4d4f'
      }
    }]
  }

  // 应用配置
  chartInstance1.setOption(option1)
  chartInstance2.setOption(option2)
  
  // 添加窗口大小变化监听
  const handleResize = () => {
    chartInstance1?.resize()
    chartInstance2?.resize()
  }
  
  window.addEventListener('resize', handleResize)
  
  // 组件卸载时移除监听
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
  })
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title-container {
  text-align: center;
  margin-bottom: 20px;
}

.title-container h1 {
  font-size: 24px;
  color: #333;
}

.input-section {
  margin-bottom: 20px;
}

.input-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.input-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 80px;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #40a9ff;
}

.chart-row {
  display: flex;
  gap: 20px;
  width: 100%;
}

.chart-container {
  flex: 1;
  height: 450px;
  border: 1px solid #eee;
  border-radius: 8px;
  min-width: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .chart-row {
    flex-direction: column;
  }
  
  .input-item {
    width: 100%;
    justify-content: space-between;
  }
  
  input {
    width: 120px;
  }
}
</style>