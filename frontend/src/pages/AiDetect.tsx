import React, { useState } from 'react';

const AiDetect: React.FC = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<{
        disease: string;
        confidence: string;
        solution: string;
    } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                setAnalyzing(true);
                setResult(null);

                const file = e.target.files[0];
                const toDataUrl = (f: File) => new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(f);
                });
                const dataUrl = await toDataUrl(file);

                const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai/detect`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: dataUrl })
                });
                const json = await resp.json();
                if (resp.ok) {
                    const diseaseBn = json.topLabel ? json.topLabel : 'অজানা';
                    const confPct = json.confidence ? Math.round(parseFloat(json.confidence) * 100) : 0;
                    const solutionBn = json.advice || 'পরিষ্কার পানি দিয়ে পাতা ধুয়ে নিন, আক্রান্ত অংশ সরিয়ে ফেলুন এবং পর্যবেক্ষণ করুন।';
                    setResult({
                        disease: `${diseaseBn} শনাক্ত হয়েছে`,
                        confidence: `নির্ভুলতা: ${confPct}%`,
                        solution: `সমাধান: ${solutionBn}`
                    });
                } else {
                    setResult({
                        disease: 'বিশ্লেষণ ব্যর্থ',
                        confidence: 'নির্ভুলতা: 0%',
                        solution: 'সার্ভার সমস্যা বা ইমেজ সাপোর্ট নয়। পরে আবার চেষ্টা করুন।'
                    });
                }
            } catch {
                setResult({
                    disease: 'বিশ্লেষণ ব্যর্থ',
                    confidence: 'নির্ভুলতা: 0%',
                    solution: 'ইন্টারনেট বা সার্ভার সমস্যা। পরে আবার চেষ্টা করুন।'
                });
            } finally {
                setAnalyzing(false);
            }
        }
    };

    return (
        <main className="pt-24 pb-12 flex flex-col items-center min-h-screen">
            <div className="w-full max-w-2xl bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-4 text-brand-dark flex items-center"><i className="fas fa-magic mr-3"></i>Crop Disease Doctor</h2>
                <p className="mb-8 text-gray-600">Upload a clear photo of the affected leaf to detect diseases instantly. Uses a free Hugging Face model when available.</p>

                <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition cursor-pointer group"
                    onClick={() => document.getElementById('fileInput')?.click()}
                >
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white transition">
                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 group-hover:text-brand-dark"></i>
                    </div>
                    <p className="font-semibold text-gray-700">Click to upload or drag image</p>
                    <p className="text-xs text-gray-400 mt-2">Supports JPG, PNG</p>
                    <input
                        type="file"
                        className="hidden"
                        id="fileInput"
                        onChange={handleFileUpload}
                        accept="image/png, image/jpeg"
                    />
                </div>

                {/* Result Area */}
                {result && (
                    <div id="resultArea" className="mt-8 border-t pt-6 animate-fade-in">
                        <div className="flex items-start space-x-4 bg-red-50 p-5 rounded-xl border border-red-100">
                            <div className="bg-white p-2 rounded-full text-red-600 shadow-sm"><i className="fas fa-exclamation-triangle text-xl"></i></div>
                            <div>
                                <h3 className="font-bold text-lg text-red-700">{result.disease}</h3>
                                <p className="text-xs text-gray-500 font-bold tracking-wide uppercase mb-2">{result.confidence}</p>
                                <div className="mt-2 text-sm text-gray-700">
                                    <span className="font-bold">Advice:</span> {result.solution}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => document.getElementById('fileInput')?.click()}
                    className={`mt-8 w-full bg-brand-dark text-white py-3 rounded-lg font-bold hover:bg-green-800 transition shadow ${analyzing ? 'opacity-75 cursor-wait' : ''}`}
                    disabled={analyzing}
                >
                    {analyzing ? "Analyzing..." : (result ? "Select Another Image" : "Select Image")}
                </button>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </main>
    );
};

export default AiDetect;
