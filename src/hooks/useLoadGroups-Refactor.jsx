
// Needs testing before implememtation

import { useEffect, useState } from "react";
import { fetchGroups, addGroup } from "../services/groupService";

const useLoadGroups = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadGroups = async () => {
            setIsLoading(true);
            try {
                const fetchedGroups = await fetchGroups();
                if (!fetchedGroups.find((g) => g.groupID === "1735400111111")) {
                    await addGroup("General");
                    const updatedGroups = await fetchGroups();
                    setGroups(updatedGroups);
                } else {
                    setGroups(fetchedGroups);
                }

                const defaultGroup =
                    fetchedGroups.find((g) => g.groupID === "1735400111111") ||
                    fetchedGroups[0];
                setSelectedGroup(defaultGroup || null);
            } catch (error) {
                console.error("Error loading groups:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadGroups();
    }, []);

    return { groups, selectedGroup, isLoading, setSelectedGroup };
};

export default useLoadGroups;