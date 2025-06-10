import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { RevenueChartProps, ColorScheme } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

const RevenueChart: React.FC<RevenueChartProps> = ({ revenueData, lordsPrice, totalLords }) => {
  const chartRef = useRef<ChartJS<'doughnut'> | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const colors: ColorScheme[] = [
    {
      background: 'rgba(240, 176, 96, 0.9)',
      border: '#f0b060',
      hover: 'rgba(240, 176, 96, 1)'
    },
    {
      background: 'rgba(223, 194, 150, 0.9)',
      border: '#dfc296',
      hover: 'rgba(223, 194, 150, 1)'
    },
    {
      background: 'rgba(192, 192, 192, 0.9)',
      border: '#c0c0c0',
      hover: 'rgba(192, 192, 192, 1)'
    },
    {
      background: 'rgba(166, 124, 0, 0.9)',
      border: '#a67c00',
      hover: 'rgba(166, 124, 0, 1)'
    }
  ];

  const data = {
    labels: revenueData.map(item => item.category),
    datasets: [{
      data: revenueData.map(item => item.amount),
      backgroundColor: colors.map(color => color.background),
      borderColor: colors.map(color => color.border),
      borderWidth: 3,
      hoverBorderWidth: 5,
      hoverBorderColor: '#ffffff',
      hoverBackgroundColor: colors.map(color => color.hover)
    }]
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '60%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(20, 15, 10, 0.95)',
        titleColor: '#f0b060',
        bodyColor: '#dfc296',
        borderColor: '#f0b060',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: false,
        titleFont: {
          size: 16,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
        callbacks: {
          title: function(context: TooltipItem<'doughnut'>[]) {
            return context[0].label || '';
          },
          label: function(context: TooltipItem<'doughnut'>) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const usdValue = Math.round(value * lordsPrice);
            return [
              `${value.toLocaleString()} LORDS`,
              `${percentage}% of total revenue`,
              `≈ $${usdValue.toLocaleString()} USD`
            ];
          }
        }
      }
    },
    layout: {
      padding: 20
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeOutBounce'
    },
    onHover: (event, activeElements) => {
      const target = event.native?.target as HTMLElement;
      if (target) {
        target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
      }
      if (activeElements.length > 0) {
        setHoveredSegment(activeElements[0].index);
      } else {
        setHoveredSegment(null);
      }
    }
  };

  const handleLegendHover = (index: number, isHovering: boolean): void => {
    const chart = chartRef.current;
    if (!chart) return;

    const meta = chart.getDatasetMeta(0);
    meta.data.forEach((segment, i) => {
      if (isHovering) {
        if (i === index) {
          segment.options.borderWidth = 6;
          segment.options.hoverBorderWidth = 6;
        } else {
          segment.options.backgroundColor = segment.options.backgroundColor?.toString().replace('0.9', '0.3');
        }
      } else {
        segment.options.borderWidth = 3;
        segment.options.hoverBorderWidth = 5;
        segment.options.backgroundColor = colors[i].background;
      }
    });
    chart.update('none');
  };

  const handleLegendClick = (index: number): void => {
    const chart = chartRef.current;
    if (!chart) return;

    const meta = chart.getDatasetMeta(0);
    const segment = meta.data[index] as any;
    segment.hidden = !segment.hidden;
    chart.update();
  };

  const formatUSD = (lordsAmount: number): string => {
    return Math.round(lordsAmount * lordsPrice).toLocaleString();
  };

  return (
    <div className="container">
      <h1>Season 1 Total Revenue Distribution</h1>
      
      <div className="chart-container">
        <div className="chart-wrapper">
          <div className="chart-canvas-wrapper">
            <Doughnut ref={chartRef} data={data} options={options} />
            <div className="center-text">
              <div className="total-amount">{totalLords.toLocaleString()}</div>
              <div className="total-label">TOTAL LORDS</div>
              <div className="total-usd">≈ ${Math.round(totalLords * lordsPrice).toLocaleString()} USD</div>
            </div>
          </div>
        </div>
        
        <div className="legend-container">
          {revenueData.map((item, index) => (
            <div 
              key={index}
              className="legend-item"
              onMouseEnter={() => handleLegendHover(index, true)}
              onMouseLeave={() => handleLegendHover(index, false)}
              onClick={() => handleLegendClick(index)}
            >
              <div className="legend-item-left">
                <div className={`legend-color color-${index}`}></div>
                <div className="legend-info">
                  <div className="legend-title">{item.category}</div>
                  <div className="legend-subtitle">{item.percentage}% of total revenue</div>
                </div>
              </div>
              <div className="legend-item-right">
                <div className="legend-amount">{item.amount.toLocaleString()}</div>
                <div className="legend-lords">LORDS</div>
                <div className="legend-usd">≈ ${formatUSD(item.amount)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart; 