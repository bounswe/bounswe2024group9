import React from "react";

function NodeBox({ text }) {
    return (
        <div>
            <div style={{ height: 60, width: '80%', background: '#45FFF9', marginLeft: '10%', marginBottom: 30, border: '3px solid black', borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ textAlign: 'center' }}>{text}</span>
            </div>
            <img src="./background.jpg" alt="Down Arrow" style={{  height: 40, width: 40 }} />
        </div>
    );
}

export default NodeBox;
