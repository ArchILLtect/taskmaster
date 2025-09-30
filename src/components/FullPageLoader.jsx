import React from "react";
import LoadingSpinner from "./LoadingSpinner";

const FullPageLoader = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="text-center">
      <LoadingSpinner size="150px" />
      <p className="mt-4 text-white text-lg">{message}</p>
    </div>
  </div>
);

export default FullPageLoader;