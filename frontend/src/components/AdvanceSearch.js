import React, { useState, useEffect } from "react";
import '../css/AdvanceSearch.css'; 

const AdvanceSearch = () => {
  const [searchOption, setSearchOption] = useState(""); // Tracks selected search option
  const [options, setOptions] = useState([]); // Stores dynamically fetched options
  const [loading, setLoading] = useState(false); // Tracks loading state
  const [error, setError] = useState(""); 
  const [searchThesisResult,setSearchThesisResult] = useState('');
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
    }
    else if (searchOption === "byKeyword") {
      apiUrl = "http://localhost:3001/api/searchThesis/getKeywords/:";
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();

      // Process API response based on the selected option
      if (searchOption === "byYear") {
        setOptions(data.map(item => item.year)); // Extract year values
      } else if (searchOption === "byTitle") {
        setOptions(data.map(item => item.title)); // Extract title values
      } else if (searchOption === "byAuthor") {
        setOptions(data.map(item => item.studentId)); // Extract studentId values
      }
      else if (searchOption == "byKeyword"){
        setOptions(data.map(item => item.keywords))
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
  console.log("Previous state:", selectedValues);
  setSelectedValues((prevValues) => {
    const newValues = isChecked
      ? [...prevValues, value] // Add value if checked
      : prevValues.filter((val) => val !== value); // Remove value if unchecked

    // Re-fetch results for all selected values
    console.log("newValues ",newValues)
    fetchResults(newValues);
    console.log("Updated state:", newValues);
    console.log("after searchThesisResult: ",searchThesisResult)
    return newValues;
  });
};

// Helper function to fetch results for all selected values
const fetchResults = async (selected) => {
  try {
    if (selected.length === 0) {
      setSearchThesisResult([]); // No values selected, clear results
      return;
    }

    // Fetch results for all selected values and merge them
    const allResults = await Promise.all(
      selected.map(async (val) => {
        const response = await fetch(
          `http://localhost:3001/api/searchThesis/${searchOption}/${val}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        return data; // Return the fetched data
      })
    );

    // Merge results into a single array (or deduplicate if necessary)
    const mergedResults = allResults.flat();
    const uniqueResults = Array.from(
      new Map(mergedResults.map((item) => [item.id, item])).values()
    );
    setSearchThesisResult(uniqueResults);
  } catch (error) {
    console.error("Error fetching results:", error);
    setSearchThesisResult([]); // Fallback to an empty array on error
  }
};

return (
  <div>
  <div className="searchResult">
    <h1>Advanced Search</h1>

    {/* Search Type Selection */}
    <div>
      <h3>Select Search By:</h3>
      <button onClick={() => {setSearchOption("byYear"); setSearchThesisResult([]); setSelectedValues([]);}}>By Year</button>
      <button onClick={() => {setSearchOption("byTitle"); setSearchThesisResult([]); setSelectedValues([]);}}>By Title</button>
      <button onClick={() => {setSearchOption("byAuthor"); setSearchThesisResult([]); setSelectedValues([]);}}>By Author</button>
      <button onClick={() => {setSearchOption("byKeyword"); setSearchThesisResult([]); setSelectedValues([]);}}>By Keyword</button>
    </div>

    {/* Loading and Error Handling */}
    {loading && <p>Loading options...</p>}
    {error && <p style={{ color: "red" }}>{error}</p>}

    

    {options.length > 0 && (
          <div>
            
            {options.map((option, index) => (
                <div key={index}>
                    <input
                    type="checkbox"
                    value={option}
                    onChange={(e) => handleCheckboxChange(e,option)}
                    checked={selectedValues.includes(option)}
                    />
                    <label>{option}</label>
                </div>
            ))}
            
            
          </div>
        )}

    <br></br>
    <br></br>
    
    <br></br>
    <h4>Search Result</h4>
    <br></br>
    {Array.isArray(searchThesisResult) && searchThesisResult.length > 0 ? (
                  searchThesisResult.map(thesis => (
                      <div key={thesis.id} >
                          <div>
                              <p><strong>ID:</strong> {thesis.id} </p>
                              <p><strong>Title:</strong> {thesis.title}</p>
                              <p><strong>Author:</strong> {thesis.studentId}</p>
                              <p><strong>Keywords:</strong> {thesis.thesisKeywords}</p>
                              <p><strong>Year:</strong> {new Date(thesis.submittedDatetime).getFullYear()}</p>

                          </div>
                          <br></br>
                         
                      </div>
                      
                  ))
              ) : (
                  <p>Select any option to search </p>
              )}
              <br></br>
      </div>
  </div>
);
};



export default AdvanceSearch;
