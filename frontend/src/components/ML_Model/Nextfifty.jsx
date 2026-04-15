import { useState } from "react";
import "./Nifty.css";
import PredictionChart from "./PredictionChart";
import { useAuth } from "../../context/AuthContext";

export default function Nextfifty() {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();

    const handleClick = (e) => {
        e.stopPropagation();
        if (!user) { alert("Please login to view ML predictions."); return; }
        setOpen(true);
    };

    return (
        <>
            <div className="heading" onClick={handleClick}>Next 50</div>
            {open && <PredictionChart modelKey="niftynext" title="Nifty Next 50" onClose={() => setOpen(false)} />}
        </>
    );
}
