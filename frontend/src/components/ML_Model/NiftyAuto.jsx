import { useState } from "react";
import "./Nifty.css";
import PredictionChart from "./PredictionChart";
import { useAuth } from "../../context/AuthContext";

export default function NiftyAuto() {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();

    const handleClick = (e) => {
        e.stopPropagation();
        if (!user) { alert("Please login to view ML predictions."); return; }
        setOpen(true);
    };

    return (
        <>
            <div className="heading" onClick={handleClick}>Nifty Auto</div>
            {open && <PredictionChart modelKey="niftyauto" title="Nifty Auto" onClose={() => setOpen(false)} />}
        </>
    );
}
