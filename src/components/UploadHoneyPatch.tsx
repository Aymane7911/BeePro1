import React, { useState } from 'react';
import ipfsClient from '../ipfs';

interface Props {
  sendToContract: (cid: string) => Promise<void>;
}

const UploadHoneyPatch: React.FC<Props> = ({ sendToContract }) => {
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const result = await ipfsClient.add(file);
      const uploadedCid = result.path;
      setCid(uploadedCid);

      await sendToContract(uploadedCid);
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Upload HoneyPatch Certificate or Metadata</h3>
      <input
        type="file"
        accept=".pdf,.json,.jpg,.png"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
          }
        }}
      />
      <button onClick={handleUpload} disabled={loading || !file}>
        {loading ? 'Uploading…' : 'Upload to IPFS'}
      </button>

      {cid && (
        <div>
          <p>
            ✅ Uploaded! CID:&nbsp;
            <a href={`https://ipfs.io/ipfs/${cid}`} target="_blank" rel="noopener noreferrer">
              {cid}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadHoneyPatch;
