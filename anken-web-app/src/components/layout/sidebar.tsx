import { Button } from "@/components/ui/button";
import { FileText, User, CheckCircle2, Home } from "lucide-react";
import Link from "next/link";

export function Sidebar() {
    return (
        <div className="flex h-full flex-col border-r bg-muted/10">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <FileText className="h-6 w-6" />
                    <span className="">Anken Tool</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                            <Home className="h-4 w-4" />
                            ダッシュボード
                        </Button>
                    </Link>
                    <Link href="/cases">
                        <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                            <FileText className="h-4 w-4" />
                            案件一覧
                        </Button>
                    </Link>
                    <Link href="/report">
                        <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                            <CheckCircle2 className="h-4 w-4" />
                            作業完了報告
                        </Button>
                    </Link>
                    <Link href="/invoices">
                        <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                            <FileText className="h-4 w-4" />
                            請求書管理
                        </Button>
                    </Link>
                </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                <Button variant="outline" className="w-full justify-start gap-2">
                    <User className="h-4 w-4" />
                    ユーザー設定
                </Button>
            </div>
        </div>
    );
}
