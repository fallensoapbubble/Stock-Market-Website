import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CryptoData = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.coincap.io/v2/assets');
        setCryptoData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p style={{ textAlign: 'center', fontSize: '24px', marginTop: '20px' }}>Loading...</p>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '20px', fontSize: '36px' }}>
        Top Cryptocurrencies
      </h1>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {cryptoData.slice(0, 10).map((crypto, index) => (
          <li
            key={crypto.id}
            style={{
              backgroundColor: '#f5f5f5',
              margin: '10px 0',
              padding: '15px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              animation: `fadeIn 0.5s ease ${index * 0.1}s`,
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{crypto.name} ({crypto.symbol})</div>
            <div style={{ fontSize: '18px', color: '#007BFF' }}>
            ₹{(parseFloat(crypto.priceUsd).toFixed(2)*85).toFixed(2)}
            </div>
          </li>
        ))}
      </ul>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default CryptoData;
