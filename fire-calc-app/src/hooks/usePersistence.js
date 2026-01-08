import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const usePersistence = (defaultState) => {
    const { user } = useAuth();
    const [data, setData] = useState({ scenarios: { "default": defaultState }, activeId: "default" });
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // 1. LOAD DATA (Switch strategy based on User)
    useEffect(() => {
        const load = async () => {
            setIsDataLoaded(false);
            
            if (user) {
                // ... (Cloud Logic remains the same) ...
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        setData(docSnap.data());
                    } else {
                        // Merge logic...
                        const local = localStorage.getItem("fireCalcScenarios_v1");
                        if (local) {
                            const parsed = JSON.parse(local);
                            await setDoc(docRef, parsed); 
                            setData(parsed);
                        } else {
                            await setDoc(docRef, { scenarios: { "default": defaultState }, activeId: "default" });
                        }
                    }
                } catch (e) {
                    console.error("Firestore Read Error", e);
                }
            } else {
                // LOCAL STRATEGY
                const saved = localStorage.getItem("fireCalcScenarios_v1");
                if (saved) {
                    setData(JSON.parse(saved));
                } else {
                 
                    setData({ scenarios: { "default": defaultState }, activeId: "default" });
                }
            }
            setIsDataLoaded(true);
        };
        load();
    }, [user]); // Re-run when user logs in/out

    const saveData = async (newData) => {
        setData(newData); // Optimistic Update
        
        if (user) {
            try {
                const docRef = doc(db, "users", user.uid);
                await setDoc(docRef, newData, { merge: true });
            } catch (e) {
                console.error("Cloud Save Error", e);
            }
        } else {
            localStorage.setItem("fireCalcScenarios_v1", JSON.stringify(newData));
        }
    };

    return { data, saveData, isDataLoaded };
};
