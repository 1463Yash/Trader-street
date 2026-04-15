import { useState } from "react";
import "./Nifty.css";
import PredictionChart from "./PredictionChart";
import { useAuth } from "../../context/AuthContext";

export default function NiftyIT() {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();

    const handleClick = (e) => {
        e.stopPropagation();
        if (!user) { alert("Please login to view ML predictions."); return; }
        setOpen(true);
    };

    return (
        <>
            <div className="heading" onClick={handleClick}>Nifty IT</div>
            {open && <PredictionChart modelKey="niftyit" title="Nifty IT" onClose={() => setOpen(false)} />}
        </>
    );
}
