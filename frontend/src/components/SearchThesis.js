import React, { useState, useEffect } from "react";
import '../css/AdvanceSearch.css'; 
import ThesisCard from './ThesisCard';
import SearchNavbar from './SearchNavBar'
import Footer from "./Footer"
import { useLocation } from 'react-router-dom';
import ChatComponent from "./ChatComponent";

const SearchThesis = () => {

  
  const [loading, setLoading] = useState(false); // Tracks loading state
  const [error, setError] = useState(""); 
  const [suggestions, setSuggestions] = useState([]); // Dropdown data
   
  const [userData, setUserData] = useState(null);
  useEffect(() => {
      const storedUserData = JSON.parse(sessionStorage.getItem('user'));
      if (storedUserData) {
          setUserData(storedUserData);
      }
  }, []);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentThesisId = searchParams.get('query'); 

  useEffect(() => {
    if (currentThesisId.trim().length > 0) {
        const timeoutId = setTimeout(() => {
            fetchSuggestions(currentThesisId);
        }, 300); // Delay to prevent excessive calls
        return () => clearTimeout(timeoutId); // Cleanup debounce
    } else {
        // Clear suggestions if input is empty
        setSuggestions([]);
    }
}, [currentThesisId]);

const fetchSuggestions = async (term) => {
    setLoading(true);
    setError(null);
    try {
        const response = await fetch(`http://localhost:3001/api/searchThesis/${currentThesisId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch suggestions");
        }
        const data = await response.json();
        setSuggestions(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

return (
  <div>
  <div className="searchResult">
    <SearchNavbar />
    
    <div className="statistics-dashboard">
  
            <main className="statistics-dashboard-content">
            <br></br>
            <h2>Search Result</h2>
            <br></br>
                <section className="thesis-section">
                    <div className="thesis-row">
                        {suggestions.length > 0 ? (
                            suggestions.map((thesis) => (
                                <ThesisCard
                                    key={thesis.thesisId} // Ensure the key is unique
                                    thesis={thesis}
                                    isTrending={true}
                                />
                            ))
                        ) : (
                            <p>No content available.</p> // Display when no theses are found
                        )}
                    </div>
                </section>
            </main>
    </div>
    
    <Footer />
    {userData && userData?.role != 'Department Admin'? <ChatComponent/>:null}

      </div>
  </div>
);
};



export default SearchThesis;
