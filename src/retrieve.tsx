import React from "react";

export default function RetrievePage() {
  const ipfsHash = "YOUR_HASH_FROM_UPLOAD"; // replace with dynamic data

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Retrieve Document</h1>

      <a
        href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        View Document on IPFS
      </a>
    </div>
  );
}
