import { useEffect } from "react";
import { fetchGroups, addGroup } from "../services/groupService";

const useLoadGroups = (setGroups, setSelectedGroup, setLoading) => {
    useEffect(() => {
        const loadGroups = async () => {
            setLoading(true);
            try {
                const fetchedGroups = await fetchGroups();
                if (!fetchedGroups.find(g => g.groupID === "1735400111111")) {
                    await addGroup("General");
                    const updatedGroups = await fetchGroups();
                    setGroups(updatedGroups);
                } else {
                    setGroups(fetchedGroups);
                }

                const defaultGroup =
                    fetchedGroups.find(g => g.groupID === "1735400111111") ||
                    fetchedGroups[0];
                setSelectedGroup(defaultGroup || null);
            } catch (error) {
                console.error("Error loading groups:", error);
            } finally {
                setLoading(false);
            }
        };

        loadGroups();
    }, [setGroups, setSelectedGroup, setLoading]);
};

export default useLoadGroups;