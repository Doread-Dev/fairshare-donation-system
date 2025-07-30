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

const BarChartFairness = ({ labels, data }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: "Quantity Allocated (kg)",
        data,
        backgroundColor: "#5A7D57",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        title: {
          display: true,
          text: "Quantity (kg)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Allocation: ${context.parsed.y} kg`;
          },
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarChartFairness;
