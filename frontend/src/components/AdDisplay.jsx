import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdDisplay = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Replace 'https://api.example.com/ads' with your actual API endpoint
    axios.get('https://api.example.com/ads')
      .then(response => {
        setAds(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch ads');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading ads...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Advertisements</h2>
      {ads.length > 0 ? (
        <ul>
          {ads.map((ad, index) => (
            <li key={index}>
              <h3>{ad.title}</h3>
              <p>{ad.description}</p>
              {ad.image && <img src={ad.image} alt={ad.title} style={{ maxWidth: '100%' }} />}
            </li>
          ))}
        </ul>
      ) : (
        <p>No ads available.</p>
      )}
    </div>
  );
};

export default AdDisplay;
