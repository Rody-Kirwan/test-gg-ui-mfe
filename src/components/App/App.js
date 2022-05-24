import logo from './logo.svg';
import './App.css';
import { core1 } from '../../core/core';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Test Migration
        </a>
        <div>UPDATE App.js</div>
        <div>Update after ejecting MFE</div>
        <div>Updating all files in App</div>
        <div>Test Diff</div>
        <div>Change app.js</div>
        <div>{core1()}</div>
      </header>
    </div>
  );
}

export default App;
