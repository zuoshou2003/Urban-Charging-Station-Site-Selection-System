<template>
  <div class="data-manager">
    <el-dialog v-model="visible" title="数据管理" width="600px">
      <div class="data-filter">
        <el-select v-model="dataType" placeholder="数据类型" @change="loadData">
          <el-option label="充电站" value="charging-stations"></el-option>
          <el-option label="停车场" value="parking-lots"></el-option>
          <el-option label="推荐选址" value="recommendations"></el-option>
          <el-option label="全部数据" value="all"></el-option>
        </el-select>
        <el-button type="primary" @click="loadData" size="small">刷新数据</el-button>
      </div>
      <el-table :data="pointData" height="400" v-loading="loading">
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="type" label="类型"></el-table-column>
        <el-table-column prop="lat" label="纬度"></el-table-column>
        <el-table-column prop="lng" label="经度"></el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button @click="locatePoint(scope.row)" type="success" size="small">
              <el-icon><Location /></el-icon>定位
            </el-button>
            <el-button @click="editPoint(scope.row)" type="primary" size="small">编辑</el-button>
            <el-button @click="deletePoint(scope.row)" type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import { Location } from '@element-plus/icons-vue'

export default {
  name: 'DataManager',
  components: {
    Location
  },
  data() {
    return {
      visible: false,
      pointData: [],
      dataType: 'charging-stations',
      loading: false
    }
  },
  watch: {
    visible(val) {
      // 当对话框显示时，自动加载数据
      if (val) {
        this.loadData()
      }
    }
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        if (this.dataType === 'all') {
          // 加载全部数据
          await this.loadAllData()
        } else {
          // 加载指定类型数据
          const response = await axios.get(`http://localhost:3000/api/${this.dataType}`)
          if (response.data) {
            this.pointData = response.data.map(item => ({
              id: item.id,
              name: item.name,
              type: this.getTypeFromDataType(this.dataType),
              lat: item.latitude,
              lng: item.longitude,
              address: item.address || '暂无地址'
            }))
          }
        }
        console.log(`已加载${this.pointData.length}条数据`)
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败，请检查后端服务是否正常运行')
      } finally {
        this.loading = false
      }
    },
    
    getTypeFromDataType(dataType) {
      switch(dataType) {
        case 'charging-stations': return '充电站';
        case 'parking-lots': return '停车场';
        case 'recommendations': return '推荐选址';
        default: return '未知';
      }
    },
    
    async loadAllData() {
      try {
        // 加载充电站数据
        const chargingResponse = await axios.get('http://localhost:3000/api/charging-stations')
        let chargingData = []
        if (chargingResponse.data) {
          chargingData = chargingResponse.data.map(item => ({
            id: item.id,
            name: item.name,
            type: '充电站',
            lat: item.latitude,
            lng: item.longitude,
            address: item.address || '暂无地址'
          }))
        }
        
        // 加载停车场数据
        const parkingResponse = await axios.get('http://localhost:3000/api/parking-lots')
        let parkingData = []
        if (parkingResponse.data) {
          parkingData = parkingResponse.data.map(item => ({
            id: item.id,
            name: item.name,
            type: '停车场',
            lat: item.latitude,
            lng: item.longitude,
            address: item.address || '暂无地址',
            capacity: item.capacity,
            available_spaces: item.available_spaces
          }))
        }
        
        // 加载推荐选址数据
        const recommendResponse = await axios.get('http://localhost:3000/api/recommendations')
        let recommendData = []
        if (recommendResponse.data) {
          recommendData = recommendResponse.data.map(item => ({
            id: item.id,
            name: item.name,
            type: '推荐选址',
            lat: item.latitude,
            lng: item.longitude,
            notes: item.notes || ''
          }))
        }
        
        // 合并数据
        this.pointData = [...chargingData, ...parkingData, ...recommendData]
      } catch (error) {
        console.error('加载全部数据失败:', error)
        throw error
      }
    },
    locatePoint(point) {
      // 定位到指定点位
      this.$emit('locate', { 
        lat: point.lat, 
        lng: point.lng, 
        name: point.name,
        type: point.type,
        address: point.address 
      })
      this.visible = false // 关闭对话框
    },
    editPoint(point) {
      // 编辑点位
      console.log('Edit point:', point)
    },
    deletePoint(point) {
      // 删除点位
      console.log('Delete point:', point)
      
      // 确认删除
      this.$confirm(`确定要删除 ${point.name || '此点位'} 吗？`, '删除点位', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 确定删除点位
        let apiUrl = '';
        
        // 确定API端点
        if (point.type === '充电站') {
          apiUrl = `http://localhost:3000/api/charging-stations/${point.id}`;
        } else if (point.type === '停车场') {
          apiUrl = `http://localhost:3000/api/parking-lots/${point.id}`;
        } else if (point.type === '推荐选址') {
          apiUrl = `http://localhost:3000/api/recommendations/${point.id}`;
        } else {
          this.$message.error('未知点位类型，无法删除');
          return;
        }
        
        // 打印完整的请求信息用于调试
        console.log('删除请求URL:', apiUrl);
        console.log('删除点位ID:', point.id);
        console.log('点位完整数据:', point);
        
        // 发送删除请求
        axios.delete(apiUrl)
          .then(response => {
            console.log('点位数据已从后端删除:', response.data);
            this.handleSuccessfulDelete(point);
          })
          .catch(error => {
            console.error('从后端删除点位数据失败:', error);
            
            // 检查并输出详细错误信息
            if (error.response) {
              console.error('错误状态码:', error.response.status);
              console.error('错误数据:', error.response.data);
            }
            
            // 如果是404错误(点位不存在)，仍然从UI中删除点位
            if (error.response && error.response.status === 404) {
              this.$message.warning(`该点位 (ID: ${point.id}) 在后端不存在，将仅从界面移除`);
              this.handleSuccessfulDelete(point);
            } else {
              // 如果是其他错误，询问用户是否仍要从界面中删除
              this.$confirm('连接后端服务失败，是否仍然从界面中删除该点位？', '提示', {
                confirmButtonText: '是',
                cancelButtonText: '否',
                type: 'warning'
              }).then(() => {
                this.handleSuccessfulDelete(point);
              }).catch(() => {
                this.$message.info('操作已取消');
              });
            }
          });
      }).catch(() => {
        // 用户取消删除，不做处理
        this.$message.info('已取消删除');
      });
    },
    
    // 处理成功删除的逻辑
    handleSuccessfulDelete(point) {
      this.$message.success(`成功删除点位: ${point.name || ''}`);
      
      // 从表格数据中移除该点位
      const index = this.pointData.findIndex(item => item.id === point.id);
      if (index !== -1) {
        this.pointData.splice(index, 1);
      }
      
      // 触发刷新地图的事件
      this.$emit('point-deleted', point);
    }
  }
}
</script>

<style scoped>
.data-filter {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
}
</style> 