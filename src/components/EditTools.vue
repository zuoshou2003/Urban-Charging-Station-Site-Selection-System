<template>
  <div class="edit-tools">
    <el-card class="tool-panel">
      <template #header>
        <div class="tool-header">
          <span>编辑工具</span>
        </div>
      </template>
      <el-button-group>
        <el-button @click="activateTool('point')" :type="currentTool === 'point' ? 'primary' : ''">
          添加点位
        </el-button>
        <el-button @click="activateTool('polygon')" :type="currentTool === 'polygon' ? 'primary' : ''">
          绘制多边形
        </el-button>
        <el-button @click="activateTool('circle')" :type="currentTool === 'circle' ? 'primary' : ''">
          绘制圆形
        </el-button>
      </el-button-group>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'EditTools',
  data() {
    return {
      currentTool: null
    }
  },
  methods: {
    activateTool(tool) {
      this.currentTool = tool
      this.$emit('tool-changed', tool)
    }
  }
}
</script>

<style scoped>
.edit-tools {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

.tool-panel {
  width: 300px;
}
</style> 