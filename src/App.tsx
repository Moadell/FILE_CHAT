import React from 'react';
import Chatbox from './components/chatbox';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <Chatbox />
    </div>
  );
};

export default App;
