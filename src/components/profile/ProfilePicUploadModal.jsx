import { useApp } from "../../contexts/AppContext";
import ProfilePicUploader from "../ProfilePicUploader";


const ProfilePicUploadModal = () => {
    const { setShowPicUploader } = useApp();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="relative bg-gray-200 dark:bg-gray-800 p-6 rounded shadow-md w-5/12 border-2 border-blue-300">
                    {/* Close Button */}
                    <button
                    onClick={() => setShowPicUploader(false)}
                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
                >
                    X
                </button>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-10">Pic Upload</h2>
                <ProfilePicUploader
                    onClose={() => setShowPicUploader(false)}
                />
            </div>
        </div>
    )

};

export default ProfilePicUploadModal;