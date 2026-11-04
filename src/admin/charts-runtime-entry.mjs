/** Apache ECharts 6.1.0, selected modules only. Built and served locally; no CDN. */
import {use,init,dispose,getInstanceByDom,version} from 'echarts/core';
import {LineChart,BarChart,PieChart,FunnelChart,ScatterChart,HeatmapChart} from 'echarts/charts';
import {GridComponent,TooltipComponent,AxisPointerComponent,LegendComponent,DataZoomComponent,BrushComponent,VisualMapComponent,DatasetComponent,AriaComponent,ToolboxComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
use([LineChart,BarChart,PieChart,FunnelChart,ScatterChart,HeatmapChart,GridComponent,TooltipComponent,AxisPointerComponent,LegendComponent,DataZoomComponent,BrushComponent,VisualMapComponent,DatasetComponent,AriaComponent,ToolboxComponent,CanvasRenderer]);
export {init,dispose,getInstanceByDom,version};
