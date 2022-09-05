import React, {useEffect} from 'react'
import { useQuery } from '@tanstack/react-query';

import './App.css';

import StatusDisplay from './components/statusDisplay';

const loadModifications = async () => {
  const response = await fetch('/modifiers.json')
  const data = await response.text();
  return data;
}
function App() {

  console.log("APP RENDER");
  // doing this here for the time being, to show the data getting loaded
  // but this will be moved to the image modification panel when it is created
  const modifications = useQuery(['modifications'], loadModifications);
  // useEffect(() => {
  //   console.log('modification data', modifications.data);
  // }, [modifications]);

  return (
    <div className="App">
      <header className="Header">
        {/* TODO get version from single source of truth */}
        <h1>Stable Diffusion UI v2.1.0</h1>
        <StatusDisplay></StatusDisplay>
      </header>
      <nav className="Create">
      </nav>
      <main className="Display">
      </main>
      <footer className="Footer">
      </footer>
    </div>
  )
}

export default App
