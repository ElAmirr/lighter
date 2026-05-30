import BottomNav from '@/components/layout/BottomNav';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <div className="flex flex-col flex-1 pb-[76px] w-full">
                {children}
            </div>
            <BottomNav />
        </>
    );
}
