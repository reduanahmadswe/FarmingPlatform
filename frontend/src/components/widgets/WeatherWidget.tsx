import React, { useState, useEffect } from 'react';

interface WeatherData {
    temp: number;
    humidity: number;
    condition: string;
    icon: string;
    locationName: string;
}

interface WeatherWidgetProps {
    className?: string; // Allow custom classes like sticky positioning
    compact?: boolean; // For smaller dashboard view
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className = '', compact = false }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                fetchWeather,
                (err) => {
                    console.error("Geolocation error:", err);
                    // Fallback to a default location (e.g., Bogura)
                    fetchWeather({ coords: { latitude: 24.8481, longitude: 89.3730 } } as any);
                }
            );
        } else {
            // Default fallback
            fetchWeather({ coords: { latitude: 24.8481, longitude: 89.3730 } } as any);
        }
    }, []);

    const fetchWeather = async (position: GeolocationPosition) => {
        try {
            const { latitude, longitude } = position.coords;

            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`
            );
            const weatherData = await weatherRes.json();

            let locationName = "Local Area";
            try {
                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
                    {
                        headers: {
                            'User-Agent': 'FarmingPlatform/1.0'
                        }
                    }
                );
                const geoData = await geoRes.json();
                locationName = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || geoData.address?.state || "Local Area";
            } catch (e) {
                console.error("Reverse geocoding failed:", e);
                locationName = "Local Area";
            }

            const current = weatherData.current;
            const wmoCode = current.weather_code;
            const { condition, icon } = getWeatherDescription(wmoCode);

            setWeather({
                temp: Math.round(current.temperature_2m),
                humidity: current.relative_humidity_2m,
                condition,
                icon,
                locationName
            });
            setLoading(false);
        } catch (err) {
            console.error("Weather fetch failed:", err);
            setLoading(false);
        }
    };

    const getWeatherDescription = (code: number): { condition: string, icon: string } => {
        if (code === 0) return { condition: 'Clear Sky', icon: 'fa-sun' };
        if (code >= 1 && code <= 3) return { condition: 'Partly Cloudy', icon: 'fa-cloud-sun' };
        if (code >= 45 && code <= 48) return { condition: 'Foggy', icon: 'fa-smog' };
        if (code >= 51 && code <= 55) return { condition: 'Drizzle', icon: 'fa-cloud-rain' };
        if (code >= 61 && code <= 67) return { condition: 'Rain', icon: 'fa-umbrella' };
        if (code >= 71 && code <= 77) return { condition: 'Snow', icon: 'fa-snowflake' };
        if (code >= 80 && code <= 99) return { condition: 'Storm', icon: 'fa-bolt' };
        return { condition: 'Cloudy', icon: 'fa-cloud' };
    };

    if (loading) {
        return (
            <div className={`bg-gradient-to-br from-brand-dark to-brand-light text-white shadow-md relative overflow-hidden flex items-center justify-center animate-pulse ${compact ? 'rounded-xl p-4 h-full' : 'rounded-2xl p-6 h-48'} ${className}`}>
                <i className="fas fa-satellite-dish text-2xl opacity-50 animate-bounce"></i>
            </div>
        );
    }

    if (!weather) return null;

    if (compact) {
        return (
            <div className={`bg-gradient-to-br from-brand-dark to-brand-light rounded-xl p-4 text-white shadow-md relative overflow-hidden ${className}`}>
                <div className="relative z-10">
                    <h3 className="font-bold text-sm opacity-90">Weather</h3>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-2xl font-bold">{weather.temp}°C</p>
                        <i className={`fas ${weather.icon} text-3xl opacity-90`}></i>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gradient-to-br from-brand-dark to-brand-light rounded-2xl p-6 text-white shadow-lg relative overflow-hidden ${className}`}>
            <div className="relative z-10">
                <h3 className="font-bold text-lg opacity-90 border-b border-green-400 pb-2 mb-3">Live Weather</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-5xl font-bold">{weather.temp}°C</p>
                        <p className="text-sm font-medium mt-1 truncate max-w-[120px]" title={weather.locationName}>{weather.locationName}</p>
                        <p className="text-xs opacity-80 mt-2 bg-white/20 inline-block px-2 py-1 rounded">{weather.condition}</p>
                    </div>
                    <div className="text-center">
                        <i className={`fas ${weather.icon} text-6xl opacity-90 mb-2`}></i>
                        <p className="text-xs">Humidity: {weather.humidity}%</p>
                    </div>
                </div>
            </div>
            <i className={`fas ${weather.icon} absolute -bottom-6 -right-6 text-9xl text-white opacity-10 transform rotate-45`}></i>
        </div>
    );
};

export default WeatherWidget;
