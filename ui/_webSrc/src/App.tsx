import React, {useEffect} from 'react'
import { useQuery } from '@tanstack/react-query'

import './App.css'


const HEALTH_PING_INTERVAL = 5000; // 5 seconds

const loadModifications = async () => {
  const response = await fetch('/modifiers.json')
  const data = await response.text();
  return data;
}

const healthPing = async () => {
  let response = await fetch('/ping')
  const data = await response.json();
  console.log('healthPing', data);
  return data;
}

function App() {

  console.log("APP RENDER");

  // doing this here for the time being, to show the data getting loaded
  // but this will be moved to the image modification panel when it is created
  const modifications = useQuery(['modifications'], loadModifications);

  useEffect(() => {
    console.log('modification data', modifications.data);
  }, [modifications]);

  // doing this here for the time being, to show the data getting loaded
  // but this will be moved to the status display when it is created
  const health = useQuery(['health'], healthPing, {refetchInterval: HEALTH_PING_INTERVAL});
  useEffect(() => {
    console.log('health data', health.data);
  }, [health]);

  return (
    <div className="App">
      <header className="Header">
        <h1>Stable Diffusion</h1>
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
