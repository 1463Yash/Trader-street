import { useEffect, useState } from "react";
import "./CSS/Asidevlogs.css";
import Vlogs from "./Vlogs";
import "./CSS/Asidevlogs.css";
export default function MarketVlogsSidebar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                className="market-vlogs-btn"
                onClick={() => setOpen(!open)}
            >
                Market Vlogs
            </button>

            <aside className={`vlogs-sidebar ${open ? "open" : ""}`}>
          
                <Vlogs open={open} setOpen={setOpen}/>
            </aside>
        </>
    );
}