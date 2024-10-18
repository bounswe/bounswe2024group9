import React from 'react';
import ReactDOM from 'react-dom';
import CodeExecution from './components/code-execution';
import './styles/globals.css';

ReactDOM.render(
  <React.StrictMode>
    <CodeExecution />
  </React.StrictMode>,
  document.getElementById('root') // Make sure you have a div with id 'root' in your HTML
);
