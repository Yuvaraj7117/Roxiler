import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import the CSS file
import Chart from './Chart.jsx';

const App = () => {
  const [transactionsData, setTransactionsData] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [soldProducts, setSoldProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('3'); // Default to March (value '3')
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of transactions per page

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:2000/transactions');
        console.log('Full response:', response); // Log the full response
        console.log('Fetched data:', response.data); // Log the fetched data

        // Assuming response.data is the correct array of transactions, if not adjust this accordingly
        let data = response.data;

        // Example of adjusting for different response structures
        if (!Array.isArray(data)) {
          // If data is an object containing the transactions array, adjust this accordingly
          // For example, if the API response is { transactions: [...] }
          if (data.transactions && Array.isArray(data.transactions)) {
            data = data.transactions;
          } else {
            console.error('Data is not an array and does not contain transactions array');
            return;
          }
        }

        setTransactionsData(data);
        filterTransactions(selectedMonth, data); // Filter initial transactions
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedMonth]);

  // Function to filter transactions based on month and search term
  const filterTransactions = (month, data) => {
    if (!Array.isArray(data)) {
      console.error('Data is not an array:', data); // Log the incorrect data
      return;
    }

    var filteredData = data.filter(transaction => {
      const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
      return month === 'all' || transactionMonth.toString() === month;
    });
    setFilteredTransactions(filteredData);

    filteredData = filteredData.filter(transaction => transaction.sold);

    setSoldProducts(filteredData);
  };

  // Function to handle month selection change
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
  };

  // Function to handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    // Example: Implement search filtering if needed
  };

  // Pagination logic
  const indexOfLastTransaction = currentPage * itemsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  // Function to calculate total sales amount
  const calculateTotalSales = () => {
    return soldProducts.reduce((total, transaction) => {
      return total + transaction.price;
    }, 0);
  };

  // Function to count sold products
  const countSoldProducts = () => {
    return soldProducts.length;
  };

  // Function to handle pagination
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="main-container">
      <h1 className="page-title">Products</h1>
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select value={selectedMonth} onChange={handleMonthChange} className='month-select'>
          <option value="all">All Months</option>
          <option value="1">Jan</option>
          <option value="2">Feb</option>
          <option value="3">Mar</option>
          <option value="4">Apr</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">Aug</option>
          <option value="9">Sep</option>
          <option value="10">Oct</option>
          <option value="11">Nov</option>
          <option value="12">Dec</option>
        </select>
      </div>
      {loading ? (
        <p className="loading">Please wait while Loading...</p>
      ) : (
        <>
          <table className="transactions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Price</th>
                <th>Category</th>
                <th>Sold</th>
                <th>Date of Sale</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.title}</td>
                  <td>{transaction.description}</td>
                  <td>${transaction.price}</td>
                  <td>{transaction.category}</td>
                  <td>{transaction.sold ? 'Yes' : 'No'}</td>
                  <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                  <td><img src={transaction.image} alt={transaction.title} className="transaction-image" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination section */}
          <div className="pagination">
            {filteredTransactions.length > itemsPerPage && (
              <ul className="pagination-list">
                <li>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                  >
                    Previous
                  </button>
                </li>
                <li>
                  <span className="pagination-current">
                    Page {currentPage} of {Math.ceil(filteredTransactions.length / itemsPerPage)}
                  </span>
                </li>
                <li>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={indexOfLastTransaction >= filteredTransactions.length}
                    className={`pagination-button ${indexOfLastTransaction >= filteredTransactions.length ? 'disabled' : ''}`}
                  >
                    Next
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Summary card */}
          <div className="summary-card">
            <div className="summary">
              <h2 className="summary-title">Total</h2>
              <div className="summary-box">
                <p>Total Sales: ${calculateTotalSales().toFixed(2)}</p>
              </div>
              <div className="summary-box">
                <p>Sold Products: {countSoldProducts()}</p>
              </div>
              <div className="summary-box">
                <p>Unsold Products: {filteredTransactions.length - countSoldProducts()}</p>
              </div>
            </div>
          </div>

          {/* Chart component */}
          <Chart month={selectedMonth} transactions={soldProducts} />
        </>
      )}
    </div>
  );
};

export default App;
