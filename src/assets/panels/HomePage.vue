<!-- <template>
  <div class="container">
    <div class="input-group">
      <div class="input-item">
        <label for="a">水泥用量a:</label>
        <input type="number" id="a" v-model.number="a" step="0.1">
      </div>
      <div class="input-item">
        <label for="b">粉煤灰用量b:</label>
        <input type="number" id="b" v-model.number="b" step="0.1">
      </div>
      <div class="input-item">
        <label for="c">矿粉用量c:</label>
        <input type="number" id="c" v-model.number="c" step="0.1">
      </div>
      <div class="input-item">
        <label for="d">水用量d:</label>
        <input type="number" id="d" v-model.number="d" step="0.1">
      </div>
      <div class="input-item">
        <label for="e">砂用量e:</label>
        <input type="number" id="e" v-model.number="e" step="0.1">
      </div>
      <div class="input-item">
        <label for="f">石用量f:</label>
        <input type="number" id="f" v-model.number="f" step="0.1">
      </div>
      <div class="input-item">
        <label for="g">混凝土容重g:</label>
        <input type="number" id="g" v-model.number="g" step="0.1">
      </div>
      <div class="input-item">
        <label for="h">C3S%:</label>
        <input type="number" id="h" v-model.number="h" step="0.1">
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
      <button @click="updateChart">绘制曲线</button>
    </div>
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template> -->

<template>
  <!-- <div ref="chartContainer" class="chart-container"></div> -->
  <div class="container">
    <div class="input-section">
      <div class="input-row">
        <div class="input-item">
          <label style="font-size: larger;">混凝土放热量与绝热温升计算器</label>
        </div>
      </div>
      <div class="input-row" style="display: flex; gap: 10px; flex-wrap: wrap;">
        <div class="input-item">
          <label for="a">水泥用量a:</label>
          <input type="number" id="a" v-model.number="a" step="0.1">
        </div>
        <div class="input-item">
          <label for="b">粉煤灰用量b:</label>
          <input type="number" id="b" v-model.number="b" step="0.1">
        </div>
        <div class="input-item">
          <label for="c">矿粉用量c:</label>
          <input type="number" id="c" v-model.number="c" step="0.1">
        </div>
        <div class="input-item">
          <label for="d">水用量d:</label>
          <input type="number" id="d" v-model.number="d" step="0.1">
        </div>
        <div class="input-item">
          <label for="e">砂用量e:</label>
          <input type="number" id="e" v-model.number="e" step="0.1">
        </div>
      </div>
      <div class="input-row" style="display: flex; gap: 10px; flex-wrap: wrap;">
        <div class="input-item">
          <label for="f">石用量f:</label>
          <input type="number" id="f" v-model.number="f" step="0.1">
        </div>
        <div class="input-item">
          <label for="g">混凝土容重g:</label>
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
    <button @click="updateChart">绘制曲线</button>
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>
<script setup>
import { ref, onMounted, h } from 'vue'
import * as echarts from 'echarts'

// 定义响应式变量
const a = ref(280)
const b = ref(40)
// const e = ref(2.71828)
const c = ref(80)
const d = ref(160)
const h1 = ref(55)
const i = ref(20)
const j = ref(8)
const k = ref(10)
const e = ref(700)
const f = ref(1100)
const g = ref(2350)

// const Q_C3S = ref(2655.97)
// const Q_C2S = ref(63.88)
// const Q_C3A = ref(1318.05)
// const Q_C4AF = ref(102.94)

// snfr = Q_C3S.value + Q_C2S.value + Q_C3A.value+Q_C4AF.value;
// const snfr = ref(Q_C3S.value + Q_C2S.value + Q_C3A.value + Q_C4AF.value);
// Q_fa(t)=α_max*m_fa*Q_fa*(1-e^(-1*k_h,fa*t))
// const snfr = ref(4140.84)
// const fmhfr = ref(35.01)
// const kffr = ref(261.94)
const α_max=ref((1.031*d.value/a.value)/(0.194+d.value/a.value)
              +0.3*c.value/(a.value+b.value+c.value)
              +0.5*b.value/(a.value+b.value+c.value))
const ZH1=ref(a.value*h1.value/100)
const ZH2=ref(a.value*i.value/100)
const ZH3=ref(a.value*j.value/100)
const ZH4=ref(a.value*k.value/100)
const chartContainer = ref(null)
let chartInstance = null

// 初始化图表
onMounted(() => {
  chartInstance = echarts.init(chartContainer.value)
  updateChart()
})

// 计算函数值并更新图表
function updateChart() {
  // // 生成x轴数据 (0到50，步长0.5)
  // const xData = []
  // for (let x = 0.5; x < 50; x += 0.5) {
  //   xData.push(x)
  // }

  // // const Q_fa =40*100*0.88(1-e^(-1*0.01*x))
  // const Q_fa = 40 * 100 * 0.88 * (1 - Math.exp(-1 * 0.01 * x));
  // // const Q_fa =xData.map(x =>40*100*0.88(1-e^(-1*0.01*x)))

  
  // // 计算y值 s = a*x + b
  // // const yData = xData.map(x => snfr.value * x + fmhfr.value+kffr.value)
  // const yData = xData.map(x => snfr.value + Q_fa+kffr.value)
  const xData = Array.from({ length: 672 }, (_, i) => 1 * (i + 1));
  const yData = xData.map(x => {
    const Q_fa = b.value * 100 * α_max.value * (1 - Math.exp(-0.01 * x));
    const Q_slag =c.value*250*α_max.value* (1 - Math.exp(-0.015 * x))
    // const Q_slag =80*250*0.88* (1 - Math.exp(-0.015 * x))

    const Q_cem= ZH1.value*500*α_max.value* (1 - Math.exp(-0.04 * x)) 
                  + ZH2.value*260*α_max.value* (1 - Math.exp(-0.005 * x)) 
                  + ZH3.value*870*α_max.value* (1 - Math.exp(-0.08 * x)) 
                  + ZH4.value*420*α_max.value* (1 - Math.exp(-0.01 * x)) 
    // const Q_cem= 154*500*α_max.value* (1 - Math.exp(-0.04 * x)) 
    //               + 56*260*α_max.value* (1 - Math.exp(-0.005 * x)) 
    //               + 22.4*870*α_max.value* (1 - Math.exp(-0.08 * x)) 
    //               + 28*420*α_max.value* (1 - Math.exp(-0.01 * x)) 
    return Q_cem + Q_fa + Q_slag;
  });

  // 图表配置
  const option = {
    title: {
      // text: `函数曲线: s = ${a.value}x + ${b.value}`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: 'x: {b0}<br/>s: {c0}'
    },
    xAxis: {
      name: 'x',
      type: 'value',
      min: 0,
      max: 672
    },
    yAxis: {
      name: 's',
      type: 'value'
    },
    series: [{
      name: '函数曲线',
      type: 'line',
      smooth: true,
      data: yData.map((y, index) => [xData[index], y]),
      symbol: 'none', // 不显示点标记
      lineStyle: {
        width: 3,
        color: '#1890ff'
      }
    }]
  }

  // 应用配置
  chartInstance.setOption(option)
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-group {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
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
}

button:hover {
  background-color: #40a9ff;
}

.chart-container {
  width: 100%;
  height: 400px;
  border: 1px solid #eee;
  border-radius: 4px;
}
</style>