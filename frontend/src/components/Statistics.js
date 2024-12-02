import React, { useRef, useEffect, useState } from 'react';
import Footer from './Footer';
import '../css/Statistics.css';
import SearchNavbar from './SearchNavBar';
import ChatComponent from './ChatComponent';
import Chat from './Chat';
import { Pie, Line, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-adapter-date-fns';
import { format, parseISO, startOfDay, subDays } from 'date-fns';  // For date handling on the time scale
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,  // Only include Tooltip once here
    Legend,
    TimeScale,
    ArcElement,
    Colors,
} from 'chart.js';

// Register necessary Chart.js components
Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,  // No need to declare Tooltip again
    Legend,
    TimeScale,
    ArcElement,
    ChartDataLabels
);

function CategoryBlock({ onSelectCategory }) {

    return (
        <fieldset className='dashboardfs'>
            <div className='VerificationDashboard'>
                &nbsp;
                &nbsp;&nbsp;
                &nbsp;
                <div className='buttons'>

                    <button className="button-85" onClick={() => onSelectCategory('Most Recent')}>
                        Most Liked Authors
                    </button>
                    &nbsp;&nbsp;
                    <button className="button-85" onClick={() => onSelectCategory('Most Liked')}>
                        Publications in last 7 days
                    </button>
                    &nbsp;&nbsp;
                    <button className="button-85" onClick={() => onSelectCategory('Most Downloads')}>
                        Most Discussed Keywords
                    </button>
                    &nbsp;&nbsp;

                </div>
            </div>
        </fieldset>
    );
}

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function MostDiscussed() {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3001/api/getmostdiscusseddetails")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("API Data:", data);

                if (data && Array.isArray(data) && data.length > 0) {
                    // Sort the data by count in descending order
                    const sortedData = data.sort((a, b) => b.count - a.count);
                    const topKeywords = sortedData.slice(0, 5); // Take the top 5 items
                    const otherKeywords = sortedData.slice(5); // Take the rest

                    // Calculate the sum of the 'others'
                    const othersCount = otherKeywords.reduce((sum, item) => sum + (item.count || 0), 0);

                    const labels = topKeywords.map(item => item.keyword || "Unknown");
                    const discussionCounts = topKeywords.map(item => item.count || 0);

                    if (otherKeywords.length > 0) {
                        labels.push("Others");
                        discussionCounts.push(othersCount);
                    }

                    setChartData({
                        labels,
                        datasets: [
                            {
                                label: "Discussion Counts",
                                data: discussionCounts,
                                backgroundColor: [
                                    '#4169E1', // Dusky Blue
                                    '#FF6E7F', // Soft Coral Red
                                    '#48D1CC', // Muted Turquoise
                                    '#9370DB', // Lavender Purple
                                    '#FFB347', // Peach Orange
                                    '#9CAD60'  // Sage Green
                                ],
                                borderColor: 'rgba(0, 0, 0, 0.3)',
                                borderWidth: 1,
                            },
                        ],
                    });

                } else {
                    console.warn("No valid data available for the chart");
                    setChartData(null);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                setChartData(null);
            });
    }, []);


    const options = {
        plugins: {
            datalabels: {
                display: true,
                color: "white", // Set the count color to white
                font: {
                    weight: "bold",
                    size: 14,
                },
                formatter: (value) => value, // Display the count
            },
        },
    };

    return (
        <div className="statistics-dashboard">
            <main className="statistics-dashboard-content">
                <section className="thesis-section">
                    <h2>Most Discussed Keywords</h2>
                    {chartData ? (
                        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                            <Pie data={chartData} options={options} />
                        </div>
                    ) : (
                        <p>Loading chart data or no data available.</p>
                    )}
                </section>
            </main>
        </div>
    );
}

function ThesesLast7Days() {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            label: 'Number of Published Theses',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            tension: 0.1
        }]
    });
    const chartRef = useRef(null);

    useEffect(() => {
        // Generate labels for the last 7 days
        let dates = [];
        for (let i = 6; i >= 0; i--) {
            dates.push(format(subDays(startOfDay(new Date()), i), 'yyyy-MM-dd'));
        }

        fetch("http://localhost:3001/api/thesis-last-7-days")
            .then(response => response.json())
            .then(data => {
                // Create a map of date to count, normalizing dates to 'yyyy-MM-dd'
                let dataMap = new Map(data.map(item => [
                    format(parseISO(item.date), 'yyyy-MM-dd'), item.count
                ]));
                let dataCounts = dates.map(date => dataMap.get(date) || 0);

                setChartData(prevState => ({
                    ...prevState,
                    labels: dates,
                    datasets: [{
                        ...prevState.datasets[0],
                        data: dataCounts
                    }]
                }));
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    useEffect(() => {
        if (document.getElementById('thesisChart')) {
            const ctx = document.getElementById('thesisChart').getContext('2d');
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day',
                                tooltipFormat: 'PP'
                            },
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Thesis Published'
                            },
                            ticks: {
                                stepSize: 1,  // Only allow whole numbers
                                precision: 0  // Avoid decimals in the ticks
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true
                        },
                        tooltip: {
                            enabled: true
                        },
                        datalabels: {
                            display: false
                        }
                    },
                    elements: {
                        point: {
                            radius: 4  // Hides the point markers
                        }
                    }
                }
            });
        }
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [chartData]);

    return (
        <div className="statistics-dashboard">
            <main className="statistics-dashboard-content">
                <section className="thesis-section">
                    <h2>Thesis Published in the Last 7 Days</h2>
                    <div style={{ width: '600px', height: '400px', margin: '0px auto' }}>
                        <canvas id="thesisChart"></canvas>
                    </div>
                </section>
            </main>
        </div>
    );
}

function StudentLikesBarGraph() {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        // Fetch the aggregated data from the backend
        fetch("http://localhost:3001/api/student-likes")
            .then(response => response.json())
            .then(data => {
                // Sort data by likes in descending order and slice the top 7
                const sortedData = data.sort((a, b) => b.totalLikes - a.totalLikes).slice(0, 7);
                const labels = sortedData.map(item => item.firstName + ' ' + item.lastName);
                const likes = sortedData.map(item => item.totalLikes);

                setChartData({
                    labels: labels,
                    datasets: [{
                        label: 'Total Likes Received',
                        data: likes,
                        backgroundColor: 'rgba(75, 192, 192, 0.8)', // Setting the bar background color to white
                        borderColor: 'rgba(0, 0, 0, 0.1)', // Optional: adding border color for clarity
                        borderWidth: 1
                    }]
                });
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }, []);

    return (
        <div className="statistics-dashboard">
            <main className="statistics-dashboard-content">
                <section className="thesis-section">
                    <h2>Total Likes Received by Students</h2>
                    <div id="thesisChart" style={{ padding: '20px' }}>
                        {chartData.labels.length > 0 ? (
                            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                                <Bar data={chartData} options={{
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                precision: 0,
                                                color: 'black'  // Ensuring the ticks are visible against a white background
                                            },
                                            title: {
                                                display: true,
                                                text: 'Number of Likes'
                                            },
                                            grid: {
                                                color: 'rgba(0, 0, 0, 0.1)',
                                                display: false  // Light grid lines for minimal visual impact
                                            }
                                        },
                                        x: {
                                            ticks: {
                                                color: 'black'  // Ensuring the ticks are visible against a white background
                                            },
                                            title: {
                                                display: true,
                                                text: 'Student Names'
                                            },
                                            grid: {
                                                color: 'rgba(0, 0, 0, 0.1)',
                                                display: false  // Light grid lines for minimal visual impact
                                            }
                                        }
                                    },
                                    plugins: {
                                        legend: {
                                            labels: {
                                                color: 'black'  // Legend labels color
                                            }
                                        },
                                        tooltip: {
                                            enabled: true
                                        },
                                        datalabels: {
                                            display: false
                                        }
                                    },
                                    style: {
                                        height: '400px',
                                        width: '600px',
                                    }
                                }} />
                            </div>
                        ) : (
                            <p>Loading chart data or no data available.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

// function MostRecent() {
//     const [theses, setTheses] = useState([]);
//     const location = useLocation();
//     const queryParams = new URLSearchParams(location.search);
//     const searchTerm = queryParams.get('query')?.toLowerCase() || '';

//     useEffect(() => {
//         fetch('http://localhost:3001/api/getmostrecentdetails')
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 // Assuming the backend returns an array of theses
//                 const filteredData = data.filter(thesis =>
//                     thesis.title.toLowerCase().includes(searchTerm) ||
//                     (thesis.authors && thesis.authors.toLowerCase().includes(searchTerm)) ||
//                     (thesis.keywords && thesis.keywords.toLowerCase().includes(searchTerm))
//                 ).slice(0, 4); // Limit to top 4 most recent theses, adjust as needed
//                 setTheses(filteredData);
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 setTheses([]); // Ensure the state is set to an empty array on error
//             });
//     }, [searchTerm]);

//     return (
//         <div className="statistics-dashboard">
//             <main className="statistics-dashboard-content">
//                 <section className="thesis-section">
//                     <h2>The Most Recent</h2>
//                     <div className="thesis-row">
//                         {theses.length > 0 ? (
//                             theses.map((thesis) => (
//                                 <ThesisCard
//                                     key={thesis.thesisId} // Ensure the key is unique
//                                     thesis={thesis}
//                                     isTrending={true}
//                                 />
//                             ))
//                         ) : (
//                             <p>No content available.</p> // Display when no theses are found
//                         )}
//                     </div>
//                 </section>
//             </main>
//         </div>
//     );
// }

// function MostDownloaded() {
//     const [theses, setTheses] = useState([]);
//     const location = useLocation();
//     const queryParams = new URLSearchParams(location.search);
//     const searchTerm = queryParams.get('query')?.toLowerCase() || '';

//     useEffect(() => {
//         fetch('http://localhost:3001/api/gettopdownloadeddetails')
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 // Assuming the backend returns an array of theses
//                 const filteredData = data.filter(thesis =>
//                     thesis.title.toLowerCase().includes(searchTerm) ||
//                     (thesis.authors && thesis.authors.toLowerCase().includes(searchTerm)) ||
//                     (thesis.keywords && thesis.keywords.toLowerCase().includes(searchTerm))
//                 ).slice(0, 4); // Limit to top 4 most recent theses, adjust as needed
//                 setTheses(filteredData);
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 setTheses([]); // Ensure the state is set to an empty array on error
//             });
//     }, [searchTerm]);

//     return (
//         <div className="statistics-dashboard">
//             <main className="statistics-dashboard-content">
//                 <section className="thesis-section">
//                     <h2>The Most Downloaded</h2>
//                     <div className="thesis-row">
//                         {theses.length > 0 ? (
//                             theses.map((thesis) => (
//                                 <ThesisCard
//                                     key={thesis.thesisId} // Ensure the key is unique
//                                     thesis={thesis}
//                                     isTrending={true}
//                                 />
//                             ))
//                         ) : (
//                             <p>No content available.</p> // Display when no theses are found
//                         )}
//                     </div>
//                 </section>
//             </main>
//         </div>
//     );
// }

// function MostLiked() {
//     const [theses, setTheses] = useState([]);
//     const location = useLocation();
//     const queryParams = new URLSearchParams(location.search);
//     const searchTerm = queryParams.get('query')?.toLowerCase() || '';

//     useEffect(() => {
//         fetch('http://localhost:3001/api/gettopthesisdetails')
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 // Assuming the backend returns an array of theses
//                 const filteredData = data.filter(thesis =>
//                     thesis.title.toLowerCase().includes(searchTerm) ||
//                     (thesis.authors && thesis.authors.toLowerCase().includes(searchTerm)) ||
//                     (thesis.keywords && thesis.keywords.toLowerCase().includes(searchTerm))
//                 ).slice(0, 5); // Limit to top 4 most recent theses, adjust as needed
//                 setTheses(filteredData);
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 setTheses([]); // Ensure the state is set to an empty array on error
//             });
//     }, [searchTerm]);

//     return (
//         <div className="statistics-dashboard">
//             <main className="statistics-dashboard-content">
//                 <section className="thesis-section">
//                     <h2>The Most Liked</h2>
//                     <div className="thesis-row">
//                         {theses.length > 0 ? (
//                             theses.map((thesis) => (
//                                 <ThesisCard
//                                     key={thesis.thesisId} // Ensure the key is unique
//                                     thesis={thesis}
//                                     isTrending={true}
//                                 />
//                             ))
//                         ) : (
//                             <p>No content available.</p> // Display when no theses are found
//                         )}
//                     </div>
//                 </section>
//             </main>
//         </div>
//     );
// }

const Statistics = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        const storedUserData = JSON.parse(sessionStorage.getItem('user'));
        if (storedUserData) {
            setUserData(storedUserData);
        }
    }, []);
    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
    };

    return (
        <div className="FullPage">
            <SearchNavbar />
            <br></br>
            <CategoryBlock onSelectCategory={handleSelectCategory} />
            {selectedCategory === 'Most Recent' && <StudentLikesBarGraph />}
            {selectedCategory === 'Most Liked' && <ThesesLast7Days />}
            {selectedCategory === 'Most Downloads' && <MostDiscussed />}
            <Footer />
            {userData && userData?.role != 'Department Admin' ? <ChatComponent /> : null}
        </div>
    );
};




export default Statistics;
