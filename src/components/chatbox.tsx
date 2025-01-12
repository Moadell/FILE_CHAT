import React, { useState } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const Chatbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null); // To store the session ID


  const handleFileUpload = () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', sessionId || '20'); // Pass the session ID if available

      // Send the file to the upload endpoint
      fetch('http://127.0.0.1:8000/api/upload/', {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.session_id) {
            setSessionId(data.session_id); // Store session ID on successful upload
            const botMessage: Message = {
              text: `File uploaded successfully! Session ID: ${data.session_id}`,
              sender: 'bot',
            };
            setMessages([...messages, botMessage]);
          } else {
            throw new Error('No session_id returned');
          }
        })
        .catch((err) => console.error('Error uploading file:', err));
    }
  };

  const handleSendText = () => {
    if (question) {
      const newMessage: Message = { text: question, sender: 'user' };
      setMessages([...messages, newMessage]);

      // Here, send the question to the backend to get a response (e.g., Groq or any other service)
      fetch('http://127.0.0.1:8000/api/question/', {
        method: 'POST',
        body: JSON.stringify({ 'question':question , 'session_id': sessionId ||'' }),
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => res.json())
        .then((data) => {
            console.log(data, "data");
          const botMessage: Message = { text: data.answer, sender: 'bot' };
          setMessages([...messages, newMessage, botMessage]);
          setQuestion(''); // Clear the input field
        })
        .catch((err) => console.error(err));
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
    if (!SpeechRecognition) {
      console.error('SpeechRecognition is not supported in this browser');
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // Adjust language as needed
  
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript; // Get the first result's transcript
      console.log('Recognized speech:', transcript);
  
     if(transcript){
        setQuestion(transcript);
        //handleSendText();
     }
    };
  
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };
  
    recognition.onend = () => {
      console.log('Speech recognition ended');
    };
  
    recognition.start();
  };
  
  

  return (
    <div className="max-w-[80%] h-[80%] mx-auto p-4 border rounded-lg shadow-lg space-y-4">
      <div className="h-96 overflow-y-auto border p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <p className="font-semibold">{msg.sender === 'user' ? 'You' : 'Bot'}:</p>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      
      {/* File Upload */}
      <div>
        <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="border p-2" />
        {file && <p className="text-sm text-gray-500">Uploaded file: {file.name}</p>}
        <button
          onClick={handleFileUpload}
          className="bg-blue-500 text-white p-2 rounded mt-2"
        >
          Upload File
        </button>
      </div>

      {/* Text Input */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question"
          className="flex-1 border p-2"
        />
        <button onClick={handleSendText} className="bg-blue-500 text-white p-2 rounded">Send</button>
      </div>

      {/* Voice Input Button */}
      <button
        onClick={startVoiceRecognition}
        className="bg-green-500 text-white p-2 rounded mt-2"
      >
        🎤 Ask with Voice
      </button>
    </div>
  );
};

export default Chatbox;
