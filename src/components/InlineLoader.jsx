import React from "react";
import LoadingSpinner from "./LoadingSpinner";

const InlineLoader = ({ message = "Loading..." }) => (
  <div className="flex items-center space-x-2">
    <LoadingSpinner size="40px" />
    <span>{message}</span>
  </div>
);

export default InlineLoader;