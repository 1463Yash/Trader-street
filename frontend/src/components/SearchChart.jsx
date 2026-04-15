import { useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "./SearchBar";
import MultiSymbolCharts from "./Charts";

export default function SeaechChart(){
    
    const defaultSymbols = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"];
    const [searchSymbols, setSearchSymbols] = useState([]);
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = (symbol) => {
        if (!symbol) return;
        setSearchSymbols(prev => [...prev, symbol]);  
    };
 
    useEffect(() => {
        const symbols = [...defaultSymbols, ...searchSymbols];
        if (symbols.length === 0) return;

        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await axios.get(
                    "http://localhost:3000/search?symbol=" + symbols.join(","),
                    { signal: controller.signal }
                );

                const dataObj = {};
                symbols.forEach(sym => {
                    const formatted = res.data.map(item => {
                        const close = item[`Close_${sym}`];
                        if (!item.Date || close == null) return null;
                        return { x: new Date(item.Date), y: close };
                    }).filter(Boolean);

                    dataObj[sym] = formatted;
                });

                setChartData(dataObj);

            } catch (err) {
                if (err.name !== "CanceledError") {
                    console.error(err);
                    setError("Failed to fetch stock data");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [searchSymbols]);

    const allSymbols = [...defaultSymbols, ...searchSymbols];
    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1 style={{ textAlign: "center" }}>📈 Stock Chart Viewer</h1>
            <SearchBar onSearch={handleSearch} />
            {loading && <p style={{ textAlign: "center" }}>Loading data...</p>}
            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
            {allSymbols.length > 0 && !loading && !error && (
                <MultiSymbolCharts symbols={allSymbols} chartData={chartData} />
            )}
        </div>
    );
};