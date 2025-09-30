import React from "react";

// TODO Find out why the login is never expiring - especially considering I changed the exipre time to 18000 seconds...

const SessionExpiredModal = ({ onLogin, onClose }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-md p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Session Expired</h2>
        <p>Your session has expired. Please log back in to continue.</p>
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded-md mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={onLogin}
          >
            Log Back In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;