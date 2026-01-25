import React, { useEffect, useState, useMemo } from 'react';
// FIX: Added 'Card' to the import list to resolve 'Cannot find name' errors.
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { GoogleGenAI } from '@google/genai';

interface ChartData {
    name: string;
    value: number;
}

interface AIGeneratedCategoryChartProps {
    data: ChartData[];
}

// Ensure the API key is available from environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });


const AIGeneratedCategoryChart: React.FC<AIGeneratedCategoryChartProps> = ({ data }) => {
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    
    const memoizedData = useMemo(() => data, [data]);

    useEffect(() => {
        const generateImagesSequentially = async () => {
            if (!API_KEY) return;

            for (const item of memoizedData) {
                // Skip if image already exists or is currently being fetched
                if (imageUrls[item.name] || loadingStates[item.name]) {
                    continue;
                }

                setLoadingStates(prev => ({ ...prev, [item.name]: true }));

                try {
                    const prompt = `A vibrant, artistic photo representing the '${item.name}' category in a Moroccan marketplace. Modern, clean, professional product photography style. Centered object. No text.`;
                    
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: { parts: [{ text: prompt }] },
                    });

                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData) {
                             const base64String = part.inlineData.data;
                             const imageUrl = `data:image/png;base64,${base64String}`;
                             setImageUrls(prev => ({ ...prev, [item.name]: imageUrl }));
                             break; 
                        }
                    }
                } catch (error) {
                    console.error(`Error generating image for ${item.name}:`, error);
                } finally {
                    setLoadingStates(prev => ({ ...prev, [item.name]: false }));
                    // Add a 1.5-second delay to respect API rate limits
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }
        };

        generateImagesSequentially();
    }, [memoizedData, imageUrls, loadingStates]);

    const maxValue = Math.max(...data.map(item => item.value), 0);

    return (
        <>
            <CardHeader>
                <CardTitle>Répartition par Catégorie (Assistée par IA)</CardTitle>
                <CardDescription>Visualisation du nombre d'articles par catégorie avec des images générées par Gemini.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((item) => (
                        <Card key={item.name} className="overflow-hidden">
                            <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                {loadingStates[item.name] && <i className="fa-solid fa-spinner fa-spin text-3xl text-gray-400"></i>}
                                {!loadingStates[item.name] && !imageUrls[item.name] && <i className="fa-solid fa-image text-3xl text-gray-400"></i>}
                                {imageUrls[item.name] && <img src={imageUrls[item.name]} alt={item.name} className="w-full h-full object-cover" />}
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-baseline mb-2">
                                    <h4 className="font-semibold text-text-main dark:text-secondary truncate">{item.name}</h4>
                                    <span className="text-lg font-bold text-primary">{item.value}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div
                                        className="bg-gradient-to-r from-primary to-accent h-2.5 rounded-full"
                                        style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </>
    );
};

export default AIGeneratedCategoryChart;