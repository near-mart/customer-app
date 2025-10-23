import MobileHeader from './mobile-header'
import DesktopHeader from './desktop-header'

export default function Header() {

    return (
        <div>
            <header
                // className="sticky top-0 z-102 bg-white"
                className="fixed top-0 z-[102] w-full backdrop-blur-md bg-white/90 border-b border-gray-200 "

                style={{ background: 'linear-gradient(#33289e6b, rgb(255, 255, 255))' }}
            >
                {/* ---------------- MOBILE VIEW ---------------- */}
                <MobileHeader />

                {/* ---------------- DESKTOP VIEW (UNCHANGED) ---------------- */}
                <DesktopHeader />
            </header >
        </div >
    )
}