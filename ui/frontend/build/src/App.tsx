import React from 'react'
import './App.css'

// Todo - import components here
import HeaderDisplay from './components/headerDisplay';
import CreationPanel from './components/creationPanel';
import DisplayPanel from './components/displayPanel';
import FooterDisplay from './components/footerDisplay';

function App() {
  
  console.log('App render');

  return (
    <div className="App">
      <header className="header-layout">
        <HeaderDisplay></HeaderDisplay>
      </header>
      <nav className="create-layout">
        <CreationPanel></CreationPanel>
      </nav>
      <main className="display-layout">
        <DisplayPanel></DisplayPanel>
      </main>
      <footer className="footer-layout">
        <FooterDisplay></FooterDisplay>
      </footer>
    </div>
  )
}

export default App
