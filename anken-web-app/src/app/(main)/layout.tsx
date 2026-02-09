import { ResizableLayout } from "@/components/layout/resizable-layout";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ResizableLayout>{children}</ResizableLayout>;
}
