import React, { useState, useEffect } from 'react';

const IoT: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [waterLevel, setWaterLevel] = useState(72);

    // Simulate sensor data changes
    useEffect(() => {
        const interval = setInterval(() => {
            setWaterLevel(prev => {
                const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
                return Math.min(100, Math.max(0, prev + change));
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const togglePump = () => {
        setIsRunning(!isRunning);
    };

    return (
        <main className="pt-24 pb-12 flex flex-col items-center justify-center min-h-screen">
            <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-lg text-center border border-gray-100">
                <h2 className="text-2xl font-bold mb-8 text-gray-800">Smart Pump Control</h2>

                <div className="mb-10">
                    <div className="flex justify-between text-sm mb-2 text-gray-600 font-medium"><span>Water Level</span><span>{waterLevel}%</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                            className="bg-blue-500 h-6 rounded-full transition-all duration-1000"
                            style={{ width: `${waterLevel}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <button
                        onClick={togglePump}
                        className={`w-40 h-40 rounded-full flex items-center justify-center shadow-inner transition-all duration-300 mb-6 hover:scale-105 ${isRunning ? 'bg-green-500 shadow-xl' : 'bg-gray-200'}`}
                    >
                        <i className="fas fa-power-off text-5xl text-white"></i>
                    </button>
                    <p className={`text-xl font-bold ${isRunning ? 'text-green-600' : 'text-gray-400'}`}>
                        {isRunning ? "PUMP IS RUNNING" : "PUMP IS OFF"}
                    </p>
                </div>
            </div>
        </main>
    );
};

export default IoT;
