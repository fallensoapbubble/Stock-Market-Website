import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NewsDisplay = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
          params: {
            apiKey: '792fa9fed6c743d3a526c595cfcf5c39',
            country: 'us',
            pageSize: 5
          }
        });
        setArticles(response.data.articles);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch news');
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <p style={{ textAlign: 'center', fontSize: '18px' }}>Loading news...</p>;
  }

  if (error) {
    return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Top News</h2>
      {articles.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {articles.map((article, index) => (
            <li key={index} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              marginBottom: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                {article.urlToImage && (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: '20px', color: '#007BFF' }}>{article.title}</h3>
                  <p style={{ margin: '0', fontSize: '14px', color: '#555' }}>{article.description}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: 'center' }}>No news available.</p>
      )}
    </div>
  );
};

export default NewsDisplay;
