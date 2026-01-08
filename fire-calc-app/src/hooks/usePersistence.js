import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const usePersistence = (defaultState) => {
    const { user } = useAuth();
    const [data, setData] = useState({ scenarios: { "default": defaultState }, activeId: "default" });
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        const load = async () => {
            setIsDataLoaded(false);
            
            if (user) {
                // CLOUD STRATEGY
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        setData(docSnap.data());
                    } else {
                        // MERGE STRATEGY: First login uploads local data
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
                }
            }
            setIsDataLoaded(true);
        };
        load();
    }, [user]);

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
