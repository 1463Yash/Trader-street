import { useEffect, useState } from "react";
import "./CSS/Vlogs.css";
import { X } from 'lucide-react';
import axios from "axios"
export default function Vlogs({ open, setOpen }) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("stock market");
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [reason,setReason]=useState("");
    const [valid,setValid]=useState(false);
    const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
    const fetchVideos = async (searchQuery) => {
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:3000/validate", {
                query: searchQuery
            });

            const { reason, valid } = res.data;
            setReason(reason);
            setValid(valid);
            console.log(reason, valid);

            if (valid) {
                const ytRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=12&key=${API_KEY}`
                );
                const data = await ytRes.json();
                setVideos(data.items || []);
                if (data.items && data.items.length > 0) {
                    setSelectedVideo(data.items[0].id.videoId);
                }
            } else {
                setVideos([]);
            }
        } catch (err) {
            console.error("Error in fetching validation data or videos", err);
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos(query);
    }, []);

    const handleSearch = (e) => {
        e  .preventDefault();
        fetchVideos(query);
    };
    return (
        <>
            <div className="close-btn" onClick={() => setOpen(false)}><X size={28} />
            </div>
            <div className="vlogs-container">
                {/* Search input */}
                <form onSubmit={handleSearch} className="vlogs-search-form">
                    <input
                        type="text"
                        placeholder="Search stock market videos..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit">Search</button>
                </form>

                {/* Main player */}
                {selectedVideo && (
                    <div className="main-player">
                        <iframe
                            width="100%"
                            height="200"
                            src={`https://www.youtube.com/embed/${selectedVideo}`}
                            title="YouTube video player"
                            sandbox="allow-scripts allow-same-origin allow-presentation"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>

                    </div>
                )}

                {/* Recommended videos */}
                <h2>Recommended</h2>
                <div className="vlogs-list">
                    {loading ? Array(11).fill(0).map((_, i) => <div key={i} className="skeleton"></div>)
                        : videos.map((video) => (
                            <div
                                key={video.id.videoId}
                                className="vlog-card"
                                onClick={() => setSelectedVideo(video.id.videoId)}>
                                <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} />
                                <p>{video.snippet.title}</p>
                            </div>
                        ))}
                    {!valid && (
                        <div className="warning-box">
                            <h3>⚠️ Invalid Search Query</h3>
                            <p>
                                We noticed that your search query
                                <span className="query-text"> "{query}" </span>
                                does not appear to be related to stocks, trading, or the financial market.
                            </p>
                            <p>
                                Please refine your search to include financial terms such as company names
                                (e.g., "Reliance stock price"), market indices (e.g., "Nifty 50 today"),
                                or investment topics (e.g., "mutual fund performance").
                            </p>
                            <p>
                                Providing a clear and finance-related query will help us fetch the most
                                relevant market videos and insights for you.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};