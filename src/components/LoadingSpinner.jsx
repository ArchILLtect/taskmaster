import React from "react";
import loadingIcon from "../assets/loading.svg"; // Ensure correct path

const LoadingSpinner = ({ size = "120px", className = "" }) => (
  <img
    src={loadingIcon}
    alt="Loading..."
    width={size}
    height={size}
    className={`animate-spin ${className}`} // Add CSS class for optional styling
  />
);

export default LoadingSpinner;