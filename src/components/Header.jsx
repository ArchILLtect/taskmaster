import AuthPortal from "./AuthPortal";

const Header = ({ onSettingsOpen }) => {


    return (
        <div className="bg-white">
            <div className="flex justify-end p-5 bg-gray-50 dark:bg-gray-600">
                <AuthPortal onSettingsOpen={onSettingsOpen} />
            </div>
            <div className="w-full text-center">
                <h1 className="text-4xl font-mono font-bold dark:bg-gray-900 text-gray-800 dark:text-white text-center">&lt;TaskMaster /&gt;</h1>
            </div>
        </div>
    )

}

export default Header;