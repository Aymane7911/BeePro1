import React from 'react';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div>
      <h1>🐝 Welcome to HoneyPatch</h1>
      <p>Use this app to upload and certify your honey batches.</p>
      <Link href="/upload">
        <button>Upload Certificate</button>
      </Link>
    </div>
  );
};

export default Home;
