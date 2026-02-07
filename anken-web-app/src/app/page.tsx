import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Clock, FileText, Plus, User } from "lucide-react";

export default function Dashboard() {
  // ダミーデータ
  const myCases = [
    { id: "C001", name: "A社様 コーポレートサイト制作", status: "作業中", deadline: "2025-02-20", client: "株式会社A" },
    { id: "C002", name: "B商店 ECサイト改修", status: "作業中", deadline: "2025-02-25", client: "B商店" },
    { id: "C003", name: "Cクリニック LP制作", status: "受注", deadline: "2025-03-10", client: "医療法人C" },
  ];

  const recentActivities = [
    { id: 1, user: "佐藤 太郎", action: "作業完了報告", target: "D株式会社 キャンペーンLP", time: "1時間前" },
    { id: 2, user: "鈴木 花子", action: "請求書発行", target: "E不動産 システム保守", time: "3時間前" },
    { id: 3, user: "田中 次郎", action: "案件登録", target: "F法律事務所 サイトリニューアル", time: "昨日" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* サイドバー (仮) */}
      <aside className="hidden w-64 border-r bg-white p-6 md:block">
        <div className="flex items-center gap-2 font-bold text-xl mb-8 text-blue-600">
          <FileText className="h-6 w-6" />
          <span>Anken Tool</span>
        </div>
        <nav className="space-y-2">
          <Button variant="secondary" className="w-full justify-start">
            <User className="mr-2 h-4 w-4" />
            ダッシュボード
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            案件一覧
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            作業完了報告
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            請求書管理
          </Button>
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
            <p className="text-muted-foreground">ようこそ、テストユーザーさん。本日のタスクを確認しましょう。</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規案件登録
            </Button>
          </div>
        </header>

        {/* KPIカード */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">作業中の案件</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">先月比 +2</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今月の請求額</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥2,450,000</div>
              <p className="text-xs text-muted-foreground">目標達成率 85%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">未完了タスク</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">期限切れ 0</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* 自分の担当案件 */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>自分の担当案件</CardTitle>
              <CardDescription>
                現在進行中の案件リストです。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>案件名</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>完了予定日</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myCases.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        <div>{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.client}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.status === "作業中" ? "default" : "secondary"}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{c.deadline}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">詳細</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 新着アクティビティ */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>最近のアクティビティ</CardTitle>
              <CardDescription>
                チーム全体の動きを確認できます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.user} が {activity.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.target}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
