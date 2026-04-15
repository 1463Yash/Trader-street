import "./CSS/Footer.css";
import { Github, Twitter, Linkedin, TrendingUp, Mail } from "lucide-react";

const MARKETS = [
    { label: "Nifty 50",     query: "Nifty 50 index today" },
    { label: "Nifty Bank",   query: "Nifty Bank index today" },
    { label: "Nifty IT",     query: "Nifty IT index today" },
    { label: "Nifty Auto",   query: "Nifty Auto index today" },
    { label: "Nifty Next 50",query: "Nifty Next 50 index today" },
];

export default function Footer({ onNewsSearch }) {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-inner">

                {/* Brand */}
                <div className="footer-brand">
                    <div className="footer-logo">Trader's Street</div>
                    <p className="footer-tagline">
                        AI-powered stock market analytics & LSTM-based index predictions for Indian markets.
                    </p>
                    <div className="footer-social">
                        <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
                        <a href="#" aria-label="LinkedIn"><Linkedin size={18} /></a>
                        <a href="#" aria-label="GitHub"><Github size={18} /></a>
                    </div>
                </div>

                {/* Markets */}
                <div className="footer-col">
                    <h4>Markets</h4>
                    <ul>
                        {MARKETS.map(m => (
                            <li
                                key={m.label}
                                className="footer-link-item"
                                onClick={() => onNewsSearch?.(m.query)}
                                title={`View ${m.label} news`}
                            >
                                <TrendingUp size={13} /> {m.label}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Features */}
                <div className="footer-col">
                    <h4>Features</h4>
                    <ul>
                        <li>ML Predictions</li>
                        <li>Stock Charts</li>
                        <li>Watchlist</li>
                        <li>Market Vlogs</li>
                        <li>Live News Ticker</li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="footer-col">
                    <h4>Contact</h4>
                    <ul>
                        <li><Mail size={13} /> yashmangla118@gmail.com</li>
                        <li><Github size={13} /> github.com/trader-street</li>
                    </ul>
                    <div className="footer-disclaimer">
                        <strong>Disclaimer:</strong> Predictions are for educational purposes only. Not financial advice.
                    </div>
                </div>

            </div>

            {/* Bottom bar */}
            <div className="footer-bottom">
                <span>© {year} Trader's Street. All rights reserved.</span>
                <div className="footer-bottom-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Use</a>
                    <a href="#">Disclaimer</a>
                </div>
                <span className="footer-made">Made with ❤️ by Yash Mangla</span>
            </div>
        </footer>
    );
}
