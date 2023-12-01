import {Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges} from '@angular/core';
import {ECharts, EChartsOption} from 'echarts';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnChanges {
  @Input() xLabels!: string[];
  @Input() xName : string = "";
  @Input() yName : string = "";
  @Input() title : string = "";
  @Input() series!: any[];
  chart!: ECharts;
  chartOption!: EChartsOption;

  constructor() {
  }

  onChartInit(ec: ECharts) {
    this.chart = ec;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.xLabels = changes['xLabels'].currentValue;
    // this.data = changes['data'].currentValue;
    this.series = changes['series'].currentValue;
    this.chart.clear();
    if (this.chart != undefined) {
      this.chart.setOption(
        {
          title: {
            text: this.title
          },
          legend: {
            // data: this.series.map(item => item.name),
            position: "top"
          },
          tooltip:{},
          xAxis: {
            name: this.xName,
            nameLocation: "middle",
            nameGap: 40,
            type: 'category',
            data: this.xLabels,
          },
          yAxis: {
            name: this.yName,
            nameLocation: "middle",
            nameGap: 80,
            type: 'value',
          },
          series: this.series,
        }
      );
    }
  }


  ngOnInit(): void {
    this.chartOption = Object.assign(
      {
        xAxis: {
          name: "",
          nameLocation: "middle",
          nameGap: 40,
          type: 'category',
          data: this.xLabels,
        },
        yAxis: {
          name: "",
          nameLocation: "middle",
          nameGap: 80,
          type: 'value',
        },
        series: [
          {
            data: [],
            type: 'line',
          },
        ],
      }, this.chartOption);
  }


}
