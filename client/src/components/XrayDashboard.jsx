{result && (
    <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Analysis Results</h2>
            <span className={`px-4 py-2 rounded-full text-white font-bold ${
                result.prediction === 'NORMAL' ? 'bg-green-500' : 'bg-red-500'
            }`}>
                {result.prediction} DETECTED
            </span>
        </div>

        {/* DUAL VIEW GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* View 1: Original */}
            <div className="bg-gray-900 p-2 rounded-lg shadow-inner">
                <p className="text-white text-sm mb-2 text-center uppercase tracking-widest">Original X-ray View</p>
                <img 
                    src={`data:image/jpeg;base64,${result.original_base64}`} 
                    className="w-full rounded border border-gray-700"
                    alt="Original"
                />
            </div>

            {/* View 2: Grad-CAM */}
            <div className="bg-gray-900 p-2 rounded-lg shadow-inner border-2 border-blue-500">
                <p className="text-blue-400 text-sm mb-2 text-center font-bold uppercase tracking-widest">
                    AI Explanation View (Grad-CAM)
                </p>
                <img 
                    src={`data:image/jpeg;base64,${result.gradcam_base64}`} 
                    className="w-full rounded"
                    alt="Grad-CAM"
                />
            </div>
        </div>

        {/* Explainability Note for Judges */}
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 text-sm italic">
            <strong>System Note:</strong> The Grad-CAM view uses gradient-weighted activation mapping 
            to highlight the specific anatomical regions in the 12th DenseBlock that contributed 
            most to the classification of {result.prediction.toLowerCase()}.
        </div>
    </div>
)}