import React from 'react';
import Web3 from 'web3';
import UploadHoneyPatch from '../components/UploadHoneyPatch';
import HoneyPatchABI from '../abi/HoneyPatch.json';

const contractAddress = '0x...'; // Replace with actual address

const Upload: React.FC = () => {
  const sendToContract = async (cid: string) => {
    const web3 = new Web3((window as any).ethereum);
    const accounts = await web3.eth.requestAccounts();
    const contract = new web3.eth.Contract(HoneyPatchABI as any, contractAddress);
    await contract.methods.storeMetadataCID(1, cid).send({ from: accounts[0] });
  };

  return (
    <div>
      <h2>📤 Upload Honey Certification</h2>
      <UploadHoneyPatch sendToContract={sendToContract} />
    </div>
  );
};

export default Upload;