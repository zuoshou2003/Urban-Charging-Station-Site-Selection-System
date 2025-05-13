import { geoCoordMap, data } from '../data/output.js';
import h337 from 'heatmap.js';
import { useEffect } from 'react';

function Heatmap() {
  useEffect(() => {
    // 添加一些调试日志来确认数据是否正确加载
    console.log('Loaded data:', data);
    console.log('Loaded coordinates:', geoCoordMap);

    const heatmapData = data.map(item => {
      const coordinates = geoCoordMap[item.name];
      return {
        x: coordinates[0],  // 经度 (118.xx - 119.xx)
        y: coordinates[1],  // 纬度 (31.xx - 32.xx)
        value: item.value   // 393 到 3275 之间的值
      };
    });

    const heatmapInstance = h337.create({
      container: document.querySelector('.heatmap'),
      radius: 10,          // 进一步减小热力点半径
      maxOpacity: 0.8,
      minOpacity: 0.3,
      blur: 0.65,
      gradient: {
        '0.2': 'blue',
        '0.5': 'yellow',
        '0.8': 'red'
      }
    });

    // 设置数据前先打印确认
    console.log('Processed heatmap data:', heatmapData);

    heatmapInstance.setData({
      max: 3275, // 直接使用已知的最大值
      min: 393,  // 直接使用已知的最小值
      data: heatmapData
    });
  }, []);

  return (
    <div className="heatmap" style={{ 
      width: '100%', 
      height: '600px',
      position: 'relative',
      backgroundColor: '#f5f5f5'
    }}>
    </div>
  );
}

export default Heatmap; 