import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VisualizerContextType {
    analyser: AnalyserNode | undefined;
    setAnalyser: (analyser: AnalyserNode | undefined) => void;
}

const VisualizerContext = createContext<VisualizerContextType | undefined>(undefined);

export const VisualizerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [analyser, setAnalyser] = useState<AnalyserNode | undefined>(undefined);

    return (
        <VisualizerContext.Provider value={{ analyser, setAnalyser }}>
            {children}
        </VisualizerContext.Provider>
    );
};

export const useVisualizer = () => {
    const context = useContext(VisualizerContext);
    if (context === undefined) {
        throw new Error('useVisualizer must be used within a VisualizerProvider');
    }
    return context;
};
