import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const PieChart = ({ labels, data }) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          "#5A7D57",
          "#8DB580",
          "#C1D8B3",
          "#D9E8D5",
          "#F0F7EE",
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: {
            family: "Inter, sans-serif",
          },
        },
      },
    },
    cutout: "65%",
  };

  return <Doughnut data={chartData} options={options} />;
};

export default PieChart;
