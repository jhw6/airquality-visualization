<template>
  <div class="container">
    <div class="input-section">
      <div class="input-row">
        <!-- <div class="input-item" >
          <label style="font-size: larger;">混凝土放热量与绝热温升计算器</label>
        </div> -->
        <div class="input-row" style="display: flex; justify-content: center; width: 100%;">
        <div class="input-item">
          <label style="font-size: larger;">混凝土放热量与绝热温升计算器</label>
        </div>
        </div>
      </div>
      <div class="input-row" style="display: flex; gap: 10px; flex-wrap: wrap;">
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
      <div class="input-row" style="display: flex; gap: 10px; flex-wrap: wrap;">
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
    <!-- <button @click="updateCharts">绘制曲线</button> -->

    <div style="display: flex; justify-content: center; width: 100%;">
        <div>
          <button @click="updateCharts">绘制曲线</button>
        </div>
    </div>
    <div class="chart-row">
      <div ref="chartContainer1" class="chart-container"></div>
      <div ref="chartContainer2" class="chart-container"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
const snbrr = ref(0.75*h1+0.7*i+0.78*j+0.75*k)
const mW = ref(d.value* Math.exp(-0.04 * x))

const brr = ref((a.value*snbrr.value+b.value*0.85+
c.value*0.80+ref(d.value* Math.exp(-0.04 * x))*4.18+e.value*0.80+f.value*0.85)
/(a.value+b.value+c.value+ref(d.value* Math.exp(-0.04 * x))+e.value+f.value))

const α_max = ref(
  (1.031 * d.value / a.value) / (0.194 + d.value / a.value) +
  0.3 * c.value / (a.value + b.value + c.value) +
  0.5 * b.value / (a.value + b.value + c.value)
)
const ZH1 = ref(a.value * h1.value / 100)
const ZH2 = ref(a.value * i.value / 100)
const ZH3 = ref(a.value * j.value / 100)
const ZH4 = ref(a.value * k.value / 100)

// 图表容器引用
const chartContainer1 = ref(null)
const chartContainer2 = ref(null)
let chartInstance1 = null
let chartInstance2 = null

// 初始化图表
onMounted(() => {
  chartInstance1 = echarts.init(chartContainer1.value)
  chartInstance2 = echarts.init(chartContainer2.value)
  updateCharts()
})

// 计算函数值并更新图表
function updateCharts() {
  const xData = Array.from({ length: 672 }, (_, i) => 1 * (i + 1))
  
  // 第一个图表的数据
  const yData1 = xData.map(x => {
    const Q_fa = b.value * 100 * α_max.value * (1 - Math.exp(-0.01 * x))
    const Q_slag = c.value * 250 * α_max.value * (1 - Math.exp(-0.015 * x))
    const Q_cem = ZH1.value * 500 * α_max.value * (1 - Math.exp(-0.04 * x)) +
                  ZH2.value * 260 * α_max.value * (1 - Math.exp(-0.005 * x)) +
                  ZH3.value * 870 * α_max.value * (1 - Math.exp(-0.08 * x)) +
                  ZH4.value * 420 * α_max.value * (1 - Math.exp(-0.01 * x))
    return Q_cem + Q_fa + Q_slag
  })

  // // 第二个图表的数据（可以与第一个不同）
  // const yData2 = xData.map(x => {
  //   // 这里可以修改为不同的计算公式
  //   return yData1.map(y => y / (1.04 * 2350));
  // })
  // 修复yData2计算
  const yData2 = yData1.map(y => y / (1.04 * 2350));

  // 确保图表实例存在
  if (!chartInstance2) {
    chartInstance2 = echarts.init(chartContainer2.value);
  }

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
      max: 672
    },
    yAxis: {
      name: '放热量(kJ/kg)',
      type: 'value'
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
      formatter: '时间: {b0}小时<br/>放热量: {c0} kJ/kg'
    },
    xAxis: {
      name: '时间(小时)',
      type: 'value',
      min: 0,
      max: 672
    },
    yAxis: {
      name: '放热量(kJ/kg)',
      type: 'value'
    },
    series: [{
      name: '水泥水化放热',
      type: 'line',
      smooth: true,
      data:  yData2.map((y, i) => [xData[i], y]),
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
  window.addEventListener('resize', () => {
    chartInstance1.resize()
    chartInstance2.resize()
  })
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.input-section {
  margin-bottom: 20px;
}

.input-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
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

button {
  padding: 8px 15px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
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
  height: 400px;
  border: 1px solid #eee;
  border-radius: 4px;
  min-width: 0; /* 防止flex容器溢出 */
}
</style>