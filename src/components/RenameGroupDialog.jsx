import { useApp } from "../contexts/AppContext";



const RenameGroupDialog = ({ onClose, onRename }) => {
    const { selectedGroup, groupNewName, setGroupNewName } = useApp();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow-md w-5/12">
            <h2 className="text-lg font-bold mb-4">Rename Group</h2>
            <p>You are about to rename the group <strong>{selectedGroup.groupName}</strong>.</p>
            <input
                type="text"
                value={groupNewName}
                onChange={(e) => setGroupNewName(e.target.value)}
                placeholder="New Name"
                className="border rounded-md mr-2 placeholder:pl-2 pl-2"
            />
            <div className="flex justify-end mt-4">
                <button
                    onClick={onClose}
                    className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                >
                    Cancel
                </button>
                <button
                    onClick={onRename}
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                    Confirm
                </button>
            </div>
        </div>
    </div>
    )

};

export default RenameGroupDialog;