import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const StackedBarChart = ({ labels, surplusData, shortageData }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: "Surplus",
        data: surplusData,
        backgroundColor: "#8DB580",
        borderRadius: 6,
      },
      {
        label: "Shortage",
        data: shortageData,
        backgroundColor: "#D86A6A",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: "Quantity (kg/L/units)",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            return `${label}: ${Math.abs(context.parsed.y)} units`;
          },
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default StackedBarChart;
