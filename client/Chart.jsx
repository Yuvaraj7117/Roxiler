import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns'; // Adapter for Date-fns library
import './Chart.css';


ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Chart = ({ month, transactions }) => {
  const [chartData, setChartData] = useState({
    labels: [], // Ensure initial labels array is defined
    datasets: [{
      label: 'Quantity Sold',
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
      hoverBorderColor: 'rgba(75, 192, 192, 1)',
      data: [] // Ensure initial data array is defined
    }]
  });

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      prepareChartData(transactions, month);
    }
  }, [transactions, month]);

  // Function to prepare chart data based on filtered transactions and selected month
  const prepareChartData = (transactions, selectedMonth) => {
    // Filter transactions based on the selected month and sold status
    const filteredData = transactions.filter(transaction => {
      const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
      return transactionMonth.toString() === selectedMonth && transaction.sold;
    });

    // Calculate quantity by price range
    const priceRanges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 1000 },
    ];

    const quantityByPriceRange = new Array(priceRanges.length).fill(0);

    filteredData.forEach(transaction => {
      const price = transaction.price;
      for (let i = 0; i < priceRanges.length; i++) {
        if (price >= priceRanges[i].min && price <= priceRanges[i].max) {
          quantityByPriceRange[i]++;
          break;
        }
      }
    });

    const updatedChartData = {
      labels: priceRanges.map(range => `${range.min}-${range.max}`),
      datasets: [{
        ...chartData.datasets[0], // Retain other properties of datasets (if any)
        data: quantityByPriceRange
      }]
    };

    setChartData(updatedChartData);
  };

  return (
    <div className="chart-container" style={{marginBottom: 40}}>
      <h2>Products Sold by Price Range</h2>
      {chartData.labels.length > 0 ? ( // Conditionally render to avoid initial undefined errors
        <Bar
          data={chartData}
          options={{
            maintainAspectRatio: false,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Price Range'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Quantity Sold'
                },
                beginAtZero: true,
                min: 0,
              }
            }
          }}
        />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default Chart;