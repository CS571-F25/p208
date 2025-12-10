import { createContext, useContext, useState, useCallback } from "react";

const HomeStateContext = createContext(null);

export function HomeStateProvider({ children }) {
    const [homeState, setHomeState] = useState(null);

    const saveHomeState = useCallback((state) => {
        setHomeState(state);
    }, []);

    const clearHomeState = useCallback(() => {
        setHomeState(null);
    }, []);

    return (
        <HomeStateContext.Provider
            value={{ homeState, saveHomeState, clearHomeState }}
        >
            {children}
        </HomeStateContext.Provider>
    );
}

export function useHomeState() {
    const ctx = useContext(HomeStateContext);
    if (!ctx) {
        throw new Error("useHomeState must be used within HomeStateProvider");
    }
    return ctx;
}
