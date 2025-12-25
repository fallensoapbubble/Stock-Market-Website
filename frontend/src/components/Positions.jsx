import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";
import CryptoData from './CryptoData';

function Positions() {

  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3002/allOrders")
      .then((res) => {
        setAllOrders(res.data);
        // console.log(res.data);
      })
      .catch((err) => {
        console.log("Error is ", err);
      });
  }, []);

  return ( 
    <>
      <h3 className="title">Positions ({allOrders.length})</h3>

      <div className="order-table">
        <table>
          <tr>
    
            <th>Name</th>
            <th>Avg.</th>
            <th>LTP</th>
            <th>P&L</th>
            <th>Chg.</th>
          </tr>

          {Object.entries(
      allOrders.reduce((acc, stock) => {
        // Grouping stocks by name
        if (!acc[stock.name]) {
          acc[stock.name] = { ...stock, totalQty: stock.qty };
        } else {
          acc[stock.name].qty += stock.mode === "sell" ? stock.qty : -stock.qty;
          acc[stock.name].totalQty += stock.mode === "sell" ? stock.qty : -stock.qty;
        }
        return acc;
      }, {})
    ).map(([name, stock], index) => {
      const currVal = stock.price * stock.qty;
      const avgCost = stock.price; // Assuming price is average cost per unit
      const total = currVal - avgCost * stock.qty*Math.random() * 100 - 1;
      const isProfit = total >= 0;
      const profitClass = isProfit ? "profit" : "loss";
      const dayClass = stock.isLoss ? "loss" : "profit";

      return (
        <tr key={index}>
          <td>{name}</td>
          <td>{avgCost.toFixed(2)}</td>
          <td>{stock.price.toFixed(2)}</td>
          <td className={profitClass}>{total.toFixed(2)}</td>
          <td className={dayClass}>{stock.price.toFixed(2)}</td>
        </tr>
      );
    })}
        </table>
      </div>
      <div>
        <CryptoData/>
      </div>
    </>
  );
}

export default Positions;