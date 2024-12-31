import { useApp } from "../contexts/AppContext";

const RenameGroupDialog = ({ onClose, onRename }) => {
    const { selectedGroup, groupNewName, setGroupNewName } = useApp();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded shadow-md w-5/12">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Rename Group</h2>
                <p className="text-gray-800 dark:text-gray-200">You are about to rename the group <strong>{selectedGroup.groupName}</strong>.</p>
                <input
                    id="groupNewName"
                    type="text"
                    value={groupNewName}
                    onChange={(e) => setGroupNewName(e.target.value)}
                    placeholder="New Name"
                    className="border rounded-md mr-2 placeholder:pl-2 pl-2"
                />
                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="mr-2 px-4 py-2 bg-gray-500 text-gray-200 rounded-md"
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