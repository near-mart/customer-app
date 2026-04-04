import Sidebar from "./components/sidebar";

export default function AccountPage() {
    return (
        <div className=" bg-white flex flex-col lg:flex-row mt-25 rounded-2xl overflow-hidden" >
            <aside className="w-full lg:w-[320px] border-r bg-white p-5 flex flex-col shrink-0">
                <Sidebar />
            </aside>
            <main className="hidden lg:block flex-1 sm:p-6 overflow-y-auto bg-gray-50 p-4">
                dsadasdas
            </main>
        </div>
    );
}
