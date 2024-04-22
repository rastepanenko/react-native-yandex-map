import { useState } from "react";
import { IUseLemonsProvider } from "../types/Types";

export default function useLemons() {
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const updateLemons = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('https://raw.githubusercontent.com/fullstackPrincess/test/main/data.json');
            const json = await response.json();
            return json;
          } catch (error) {
            setErrorMessage((error as Error).message);
          } finally {
            setIsLoading(false);
          }
    }

    return {
        updateLemons,
        errorMessage,
        isLoading,
    } as unknown as IUseLemonsProvider;
}