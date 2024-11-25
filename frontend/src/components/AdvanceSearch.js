import React, { useState, useEffect } from "react";
import "../css/AdvanceSearch.css";
import ThesisCard from "./ThesisCard";
import SearchNavbar from "./SearchNavBar";
import Footer from "./Footer"
import ChatComponent from "./ChatComponent";
const AdvanceSearch = () => {
  const [userData, setUserData] = useState(null);
  useEffect(() => {
      const storedUserData = JSON.parse(sessionStorage.getItem('user'));
      if (storedUserData) {
          setUserData(storedUserData);
      }
  }, []);
  const [searchOption, setSearchOption] = useState(""); // Tracks selected search option
  const [options, setOptions] = useState([]); // Stores dynamically fetched options
  const [loading, setLoading] = useState(false); // Tracks loading state
  const [error, setError] = useState("");
  const [searchThesisResult, setSearchThesisResult] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]); // Stores selected checkbox values

  useEffect(() => {
    if (!searchOption) return;

    const fetchOptions = async () => {
      setLoading(true);
      setError("");

      let apiUrl;
      if (searchOption === "byTitle") {
        apiUrl = "http://localhost:3001/api/searchThesis/getTitle/:";
      } else if (searchOption === "byAuthor") {
        apiUrl = "http://localhost:3001/api/searchThesis/getAuthor/:";
      } else if (searchOption === "byYear") {
        apiUrl = "http://localhost:3001/api/searchThesis/getYear/:";
      } else if (searchOption === "byKeyword") {
        apiUrl = "http://localhost:3001/api/searchThesis/getKeywords/:";
      }

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        if (searchOption === "byYear") {
          setOptions(data.map((item) => item.year));
        } else if (searchOption === "byTitle") {
          setOptions(data.map((item) => item.title));
        } else if (searchOption === "byAuthor") {
          setOptions(data.map((item) => item.firstName));
        } else if (searchOption === "byKeyword") {
          setOptions(data.map((item) => item.keywords));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [searchOption]);

  const handleCheckboxChange = async (e, value) => {
    const isChecked = e.target.checked;
    setSelectedValues((prevValues) => {
      const newValues = isChecked
        ? [...prevValues, value]
        : prevValues.filter((val) => val !== value);

      fetchResults(newValues);
      return newValues;
    });
  };

  const fetchResults = async (selected) => {
    try {
      if (selected.length === 0) {
        setSearchThesisResult([]);
        return;
      }

      const allResults = await Promise.all(
        selected.map(async (val) => {
          const response = await fetch(
            `http://localhost:3001/api/searchThesis/${searchOption}/${val}`
          );
          if (!response.ok) throw new Error("Failed to fetch data");
          return response.json();
        })
      );

      const mergedResults = allResults.flat();
      const uniqueResults = Array.from(
        new Map(mergedResults.map((item) => [item.id, item])).values()
      );
      setSearchThesisResult(uniqueResults);
    } catch (error) {
      console.error("Error fetching results:", error);
      setSearchThesisResult([]);
    }
  };

  return (
    <div>
      <SearchNavbar />
      <br></br>
      <div className="advance-search-container">
        <div className="sidebar">
          <h3>Advanced Search</h3>
          <div>
            {["byYear", "byTitle", "byAuthor", "byKeyword"].map((option) => (
              <div key={option} className="collapsible-section">
                <button
                  className="collapsible-button"
                  onClick={() => {
                    setSearchOption(option);
                    setSearchThesisResult([]);
                    setSelectedValues([]);
                  }}
                >
                  {`Search ${option.replace("by", "")}`}
                </button>
                {searchOption === option && (
                  <div className="collapsible-content">
                    {loading && <p>Loading options...</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {options.length > 0 ? (
                      options.map((item, index) => (
                        <div key={index}>
                          <input
                            type="checkbox"
                            value={item}
                            onChange={(e) => handleCheckboxChange(e, item)}
                            checked={selectedValues.includes(item)}
                          />
                          <label>{item}</label>
                        </div>
                      ))
                    ) : (
                      <p>No options available</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
<div className="advance-search-results">
        <div className="thesis-row-search">
          {searchThesisResult.length > 0 ? (
            searchThesisResult.map((thesis) => (
              <ThesisCard
                key={thesis.thesisId}
                thesis={thesis}
                isTrending={true}
              />
            ))
          ) : (
            <p>Please use filters to view data.</p>
          )}
        </div>
        </div>
      </div>
      <Footer />
      {userData && userData?.role != 'Department Admin'? <ChatComponent/>:null}
    </div>
  );
};

export default AdvanceSearch;
