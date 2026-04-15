import { useState, useMemo } from "react";
import stockSymbols from "./Symbols";
import "./CSS/Searchbar.css";
import debounce from "lodash/debounce";
import { Search } from "lucide-react";

export default function SearchBar({ onSearch }) {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const debouncedSearch = useMemo(() =>
        debounce((value) => {
            const upper = value.toUpperCase();
            setInput(upper);

            if (upper) {
                const filtered = stockSymbols.filter(item =>
                    item.symbol.includes(upper) ||
                    item.name.toUpperCase().includes(upper)
                );
                setSuggestions(filtered.slice(0, 8));
            } else {
                setSuggestions([]);
            }
        }, 300)
        , []);

    const handleChange = (e) => {
        debouncedSearch(e.target.value);
    };

    
    const handleSearch = (symbol) => {
        const upper = symbol.toUpperCase();
        setInput(upper);
        setSuggestions([]);

        onSearch?.(upper);
    };
    const triggerSearch = () => {
        if (!input.trim()) return;
        handleSearch(input);
    };
    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search stock symbol..."
                value={input}
                onChange={handleChange}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        triggerSearch();
                    }
                }}
            />

            <button onClick={triggerSearch} className="search-icon-btn" aria-label="Search">
                <Search size={17} />
            </button>

            {suggestions.length > 0 && (
                <ul className="suggestions">
                    {suggestions.map((item) => (
                        <li key={item.symbol} onClick={() => handleSearch(item.symbol)}>
                            <strong>{item.name}</strong> — <span>{item.symbol}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}