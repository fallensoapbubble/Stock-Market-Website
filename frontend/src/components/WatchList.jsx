import React, { useState, useContext } from "react";
import { Tooltip, Grow, TextField, CircularProgress } from "@mui/material";
import { useMarket } from "../context/MarketContext";
import GeneralContext from "./GeneralContext";
import DoughnutChart from "./DoughnoutChart";
import MarketDepth from "./MarketDepth";

function WatchList() {
  const { watchlist, loading, searchResults, searchStocks, addToWatchlist } = useMarket();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      searchStocks(query);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleAddStock = async (stock) => {
    await addToWatchlist({ symbol: stock.symbol, exchange: stock.exchange });
    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Prepare chart data
  const labels = watchlist.map((stock) => stock.symbol);
  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: watchlist.map((stock) => stock.ltp || 0),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="watchlist-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <span className="counts"> {watchlist.length} / 50</span>
        
        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderTop: 'none',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000
          }}>
            {searchResults.map((stock, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
                onClick={() => handleAddStock(stock)}
              >
                <span>{stock.symbol} - {stock.name}</span>
                <span>₹{stock.ltp?.toFixed(2) || 'N/A'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ul className="list">
        {watchlist.map((stock, idx) => {
          return <WatchListItem key={stock._id || idx} stockvar={stock} />;
        })}
      </ul>
      
      {watchlist.length > 0 && <DoughnutChart data={data} />}
    </div>
  );
}

export default WatchList;

const WatchListItem = ({ stockvar }) => {
  const [showWatchListActions, setWatchListActions] = useState(false);

  const showOption = () => {
    setWatchListActions(true);
  };

  const vanishOptions = () => {
    setWatchListActions(false);
  };

  const isDown = stockvar.change < 0;
  const changePercent = stockvar.changePercent || 0;

  return (
    <li onMouseEnter={showOption} onMouseLeave={vanishOptions}>
      <div className="item">
        <p className={isDown ? "down" : "up"}>{stockvar.symbol}</p>
        {!showWatchListActions && (
          <div className="itemInfo">
            <span className="percent">{changePercent.toFixed(2)}%</span>
            &nbsp;
            {isDown ? (
              <i className="fa fa-arrow-down down"></i>
            ) : (
              <i className="fa fa-arrow-up up"></i>
            )}
            &nbsp;
            <span className="price">₹{stockvar.ltp?.toFixed(2) || 'N/A'}</span>
          </div>
        )}
      </div>
      {showWatchListActions && (
        <WatchListActions uid={stockvar.symbol} />
      )}
    </li>
  );
};

const WatchListActions = ({ uid }) => {
  const { openBuyWindow, setUID, openSellWindow } = useContext(GeneralContext);
  const [showMarketDepth, setShowMarketDepth] = useState(false);
  const { watchlist } = useMarket();

  const stockData = watchlist.find(stock => stock.symbol === uid);

  return (
    <>
      <span className="actions">
        <span>
          <Tooltip
            title="Buy (B) - Place a buy order for this stock"
            placement="top"
            arrow
            TransitionComponent={Grow}
          >
            <button
              className="buy"
              onClick={() => {
                openBuyWindow(uid);
                setUID(uid);
              }}
            >
              B
            </button>
          </Tooltip>
          <Tooltip
            title="Sell (S) - Place a sell order for this stock"
            placement="top"
            arrow
            TransitionComponent={Grow}
          >
            <button
              className="sell"
              onClick={() => {
                openSellWindow(uid);
                setUID(uid);
              }}
            >
              S
            </button>
          </Tooltip>
          <Tooltip
            title="Market Depth - View bid/offer prices and order book"
            placement="top"
            arrow
            TransitionComponent={Grow}
          >
            <button 
              className="action"
              onClick={() => setShowMarketDepth(true)}
            >
              <i className="fa fa-list-alt" aria-hidden="true"></i>
            </button>
          </Tooltip>
          <Tooltip 
            title="Chart & Analytics - View price charts and technical analysis" 
            placement="top" 
            arrow 
            TransitionComponent={Grow}
          >
            <button className="action">
              <i className="fa fa-bar-chart" aria-hidden="true"></i>
            </button>
          </Tooltip>
          <Tooltip 
            title="Stock Info - Company details, fundamentals, and news" 
            placement="top" 
            arrow 
            TransitionComponent={Grow}
          >
            <button className="icon">
              <i className="fa fa-info-circle" aria-hidden="true"></i>
            </button>
          </Tooltip>
        </span>
      </span>
      
      {/* Market Depth Dialog */}
      <MarketDepth 
        open={showMarketDepth}
        onClose={() => setShowMarketDepth(false)}
        symbol={uid}
        stockData={stockData}
      />
    </>
  );
};
