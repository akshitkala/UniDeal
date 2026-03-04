"use client";

import { createContext, useContext, useState } from "react";
import SellModal from "@/components/listing/SellModal";

interface SellContextType {
    openSellModal: () => void;
}

const SellContext = createContext<SellContextType | undefined>(undefined);

export function SellProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openSellModal = () => setIsOpen(true);
    const closeSellModal = () => setIsOpen(false);

    return (
        <SellContext.Provider value={{ openSellModal }}>
            {children}
            <SellModal isOpen={isOpen} onClose={closeSellModal} />
        </SellContext.Provider>
    );
}

export function useSell() {
    const context = useContext(SellContext);
    if (!context) {
        throw new Error("useSell must be used within a SellProvider");
    }
    return context;
}
