import React from "react";
import { Link } from "react-router-dom";
import AdDisplay from "./AdDisplay";
import NewsDisplay from "./NewsDisplay";

const Apps = () => {
  return (
  <>
        <div className="funds">
        <p>Instant, zero-cost fund transfers with UPI </p>
        <Link className="btn btn-green" to={"https://vision.axisbank.com/applications/672ca4e56a2dc3a9791b78ed/ekyc/verification"}>Add funds</Link>
        <Link className="btn btn-blue" to={"https://vision.axisbank.com/applications/672ca4e56a2dc3a9791b78ed/ekyc/verification"}>Withdraw</Link>
      </div>
      <br />
      <br />
      <br />
      <AdDisplay/>
      <NewsDisplay/>

  </>
  );
};

export default Apps;