import { useState, useEffect } from "react";

const Summary = () => {
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    const socket = new WebSocket(
      "wss://ws.finnhub.io?token=crhu8l1r01qjv9rljeogcrhu8l1r01qjv9rljep0"
    );

    // Connection opened -> Subscribe to symbols
    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ type: "subscribe", symbol: "AAPL" }));
      socket.send(JSON.stringify({ type: "subscribe", symbol: "BINANCE:BTCUSDT" }));
      socket.send(JSON.stringify({ type: "subscribe", symbol: "TSLA" }));       // Tesla
      socket.send(JSON.stringify({ type: "subscribe", symbol: "GOOGL" }));      // Alphabet (Google)
      socket.send(JSON.stringify({ type: "subscribe", symbol: "AMZN" }));       // Amazon
      socket.send(JSON.stringify({ type: "subscribe", symbol: "MSFT" }));       // Microsoft
      socket.send(JSON.stringify({ type: "subscribe", symbol: "FB" }));         // Meta (Facebook)
    });
    

    // Listen for messages
    socket.addEventListener("message", (event) => {
      const messageData = JSON.parse(event.data);

      if (messageData.type === "trade") {
        // Assuming we want to display the latest trade data
        setLiveData(messageData.data[0]); // Using the first trade data from the array
      }
    });

    // Cleanup the WebSocket connection when component unmounts
    return () => socket.close();
  }, []);

  return (
    <>
      <div className="username">
        <h6>Hi, User!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>3.74k</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>0</span>{" "}
            </p>
            <p>
              Opening balance <span>3.74k</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings (13)</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className="profit">
              1.55k <small>+5.20%</small>{" "}
            </h3>
            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>31.43k</span>{" "}
            </p>
            <p>
              Investment <span>29.88k</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />

        <div className="second">
          {liveData ? (
            <div>
              <p
                style={{
                  fontWeight: "bold",
                  fontSize: "1.2em",
                  marginBottom: "5px",
                  color: "#1a73e8",
                }}
              >
                Live Data:
              </p>
              <p style={{ fontSize: "1.1em", marginBottom: "5px" }}>
                <span style={{ color: "#4caf50", fontWeight: "bold" }}>
                  Symbol:{" "}
                </span>
                <span style={{ color: "#1a73e8" }}>{liveData.s}</span>
              </p>
              <p style={{ fontSize: "1.1em", marginBottom: "5px" }}>
                <span style={{ color: "#4caf50", fontWeight: "bold" }}>
                  Price:{" "}
                </span>
                <span style={{ color: "#d32f2f", fontWeight: "bold" }}>
                  {liveData.p}
                </span>
              </p>
              <p style={{ fontSize: "1.1em", marginBottom: "5px" }}>
                <span style={{ color: "#4caf50", fontWeight: "bold" }}>
                  Volume:{" "}
                </span>
                <span style={{ color: "#1a73e8" }}>{liveData.v}</span>
              </p>
              <p style={{ fontSize: "1.1em", marginBottom: "5px" }}>
                <span style={{ color: "#4caf50", fontWeight: "bold" }}>
                  Time:{" "}
                </span>
                <span style={{ color: "#1a73e8" }}>
                  {new Date(liveData.t).toLocaleTimeString()}
                </span>
              </p>
            </div>
          ) : (
            <p style={{ color: "#757575", fontStyle: "italic" }}>
              Waiting for live data...
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Summary;
