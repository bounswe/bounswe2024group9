import React from "react";

function NodeBox({ text }) {
    return (
        <div>
            <div style={{ height: 60, width: '80%', background: '#45FFF9', marginLeft: '10%', marginTop: "20px", marginBottom: 30, border: '3px solid black', borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ textAlign: 'center' }}>{text}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 384 512"><path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>        </div>
    );
}

export default NodeBox;
