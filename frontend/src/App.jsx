import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Signup from "./pages/Signup/Signup";
import Transcriptions from "./components/Transcript/Transcriptions";
import "./index.css";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { LoaderProvider } from "./components/Loader/LoaderContext";
import Loader from "./components/Loader/Loader";
// import RealTimeTranscription from "./components/RealTime/Realtime";

function App() {
  return (
    <LoaderProvider>
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
             <Home/>
            </ProtectedRoute>
          }
        />
        <Route path="/transcriptions" element={<Transcriptions />} />
      </Routes>
      {/* <Loader /> Ensure the loader is rendered at the top level */}
    </Router>

    </LoaderProvider>
   
  );
}

export default App;
