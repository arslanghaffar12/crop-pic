import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import React ,{ Fragment } from 'react';



function App() {
  return (
    <Fragment>

    <Router>
      <Routes>
        <Route index path={"/"}  element={<Home/>} />
      </Routes>


    </Router>
    </Fragment>

    
  );
}

export default App;
