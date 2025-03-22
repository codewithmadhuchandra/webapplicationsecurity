import { useState } from "react";

interface WebScannerProps {
  onSubmit?: () => void;
}

const WebScanner: React.FC<WebScannerProps> = ({ onSubmit }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleClick = async () => {
    setIsScanning(true); // Show overlay

    // Simulate a scan process (replace this with an actual API call)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setIsScanning(false); // Hide overlay after scan completes
    
    // If in form context, trigger the form submission
    if (onSubmit) {
      onSubmit();
    } else {
      alert("Scan Completed!"); // Only show alert if not part of a form
    }
  };

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={handleClick}
        type="button" // This doesn't submit the form directly
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
      >
        Add Web Application
      </button>

      {/* Scanning Overlay */}
      {isScanning && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800">Processing...</p>
            <p className="text-gray-600">This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebScanner; 