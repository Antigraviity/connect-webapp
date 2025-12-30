"use client";

export default function PrivacySettings() {
    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 font-primary">Data & Privacy Control</h1>
                <p className="text-gray-500 mt-1">Take control of your personal data and privacy settings.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6 font-primary">Privacy Settings</h2>

                <div className="space-y-4">
                    {[
                        { label: "Personalized Advertising", desc: "Allow us to use your purchase history for better recommendations." },
                        { label: "Public Profile Analytics", desc: "Show how many times recruiters viewed your job profile." },
                        { label: "Location History", desc: "Save frequent service locations for faster booking." }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 border border-gray-100 rounded-3xl whitespace-normal">
                            <div className="max-w-[80%]">
                                <h4 className="font-bold text-gray-900">{item.label}</h4>
                                <p className="text-sm text-gray-500 leading-tight">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-red-50 rounded-3xl border border-red-100 mt-8">
                    <h4 className="font-bold text-red-900 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-700 mb-4">Permanently remove all your data, resumes, and order history. This action cannot be undone.</p>
                    <button className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all">
                        Request Deletion
                    </button>
                </div>
            </div>
        </div>
    );
}
