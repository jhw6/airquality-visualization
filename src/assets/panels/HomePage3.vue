<template>
  <div class="container">
    <div class="input-section">
      <div class="title-container">
        <h1>混凝土放热量与绝热温升计算器</h1>
      </div>
      
      <div class="input-row">
        <div class="input-item">
          <label for="a">水泥用量(kg/m³):</label>
          <input type="number" id="a" v-model.number="a" step="0.1">
        </div>
        <div class="input-item">
          <label for="b">粉煤灰用量(kg/m³):</label>
          <input type="number" id="b" v-model.number="b" step="0.1">
        </div>
        <div class="input-item">
          <label for="c">矿粉用量(kg/m³):</label>
          <input type="number" id="c" v-model.number="c" step="0.1">
        </div>
        <div class="input-item">
          <label for="d">水用量(kg/m³):</label>
          <input type="number" id="d" v-model.number="d" step="0.1">
        </div>
      </div>
      
      <div class="input-row">
        <div class="input-item">
          <label for="e">砂用量(kg/m³):</label>
          <input type="number" id="e" v-model.number="e" step="0.1">
        </div>
        <div class="input-item">
          <label for="f">石用量(kg/m³):</label>
          <input type="number" id="f" v-model.number="f" step="0.1">
        </div>
        <div class="input-item">
          <label for="g">混凝土容重(kg/m³):</label>
          <input type="number" id="g" v-model.number="g" step="0.1">
        </div>
        <div class="input-item">
          <label for="h1">C3S含量(%):</label>
          <input type="number" id="h1" v-model.number="h1" step="0.1">
        </div>
      </div>
      
      <div class="input-row">
        <div class="input-item">
          <label for="i">C2S含量(%):</label>
          <input type="number" id="i" v-model.number="i" step="0.1">
        </div>
        <div class="input-item">
          <label for="j">C3A含量(%):</label>
          <input type="number" id="j" v-model.number="j" step="0.1">
        </div>
        <div class="input-item">
          <label for="k">C4AF含量(%):</label>
          <input type="number" id="k" v-model.number="k" step="0.1">
        </div>
      </div>
    </div>
    
    <div class="button-container">
      <button @click="calculateAndDraw">计算并绘制曲线</button>
    </div>
    
    <div class="chart-row">
      <div ref="chartContainer1" class="chart-container"></div>
      <div ref="chartContainer2" class="chart-container"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
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
  initCharts()
})

// 初始化图表实例
function initCharts() {
  if (chartContainer1.value && chartContainer2.value) {
    chartInstance1 = echarts.init(chartContainer1.value)
    chartInstance2 = echarts.init(chartContainer2.value)
    
    // 设置初始空图表
    const initialOption = {
      title: {
        text: '点击"计算并绘制曲线"按钮生成图表',
        left: 'center',
        top: 'center'
      },
      xAxis: { show: false },
      yAxis: { show: false }
    }
    
    chartInstance1.setOption(initialOption)
    chartInstance2.setOption(initialOption)
    
    // 添加窗口大小变化监听
    const handleResize = () => {
      chartInstance1?.resize()
      chartInstance2?.resize()
    }
    
    window.addEventListener('resize', handleResize)
    
    // 组件卸载时移除监听
    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
      chartInstance1?.dispose()
      chartInstance2?.dispose()
    })
  }
}

// 计算并绘制图表
function calculateAndDraw() {
  if (!chartInstance1 || !chartInstance2) {
    initCharts()
  }
  
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
      text: '混凝土水化放热曲线',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        return `时间: ${params[0].axisValue}小时<br/>` +
               `放热量: ${params[0].data[1].toFixed(2)} kJ/kg`
      }
    },
    grid: {
      left: '10%',
      right: '8%',
      top: '15%',
      bottom: '15%'
    },
    xAxis: {
      name: '时间(小时)',
      nameLocation: 'center',
      nameGap: 30,
      type: 'value',
      min: 0,
      max: 700,
      axisLabel: {
        formatter: '{value}'
      },
      axisLine: {
        lineStyle: {
          color: '#333'
        }
      }
    },
    yAxis: {
      name: '放热量(kJ/kg)',
      nameLocation: 'center',
      nameGap: 30,
      type: 'value',
      min: 0,
      axisLabel: {
        formatter: '{value}'
      },
      axisLine: {
        lineStyle: {
          color: '#333'
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
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
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(24, 144, 255, 0.5)' },
          { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
        ])
      }
    }]
  }

  // 第二个图表的配置
  const option2 = {
    title: {
      text: '混凝土绝热温升曲线',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        return `时间: ${params[0].axisValue}小时<br/>` +
               `温升值: ${params[0].data[1].toFixed(2)} °C`
      }
    },
    grid: {
      left: '10%',
      right: '8%',
      top: '15%',
      bottom: '15%'
    },
    xAxis: {
      name: '时间(小时)',
      nameLocation: 'center',
      nameGap: 30,
      type: 'value',
      min: 0,
      max: 700,
      axisLabel: {
        formatter: '{value}'
      },
      axisLine: {
        lineStyle: {
          color: '#333'
        }
      }
    },
    yAxis: {
      name: '温升(°C)',
      nameLocation: 'center',
      nameGap: 30,
      type: 'value',
      min: 0,
      axisLabel: {
        formatter: '{value}'
      },
      axisLine: {
        lineStyle: {
          color: '#333'
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
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
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255, 77, 79, 0.5)' },
          { offset: 1, color: 'rgba(255, 77, 79, 0.1)' }
        ])
      }
    }]
  }

  // 应用配置
  chartInstance1.setOption(option1, true)
  chartInstance2.setOption(option2, true)
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.title-container {
  text-align: center;
  margin-bottom: 30px;
}

.title-container h1 {
  font-size: 24px;
  color: #333;
  font-weight: bold;
  margin-bottom: 10px;
}

.input-section {
  margin-bottom: 30px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  gap: 8px;
  min-width: 200px;
}

label {
  font-size: 14px;
  color: #555;
  white-space: nowrap;
}

input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #1890ff;
  outline: none;
}

.button-container {
  display: flex;
  justify-content: center;
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
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

button:active {
  transform: translateY(0);
}

.chart-row {
  display: flex;
  gap: 20px;
  width: 100%;
}

.chart-container {
  flex: 1;
  height: 500px;
  border: 1px solid #eee;
  border-radius: 8px;
  min-width: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
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
  
  .chart-container {
    height: 400px;
  }
}
</style>