import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, StickyNote, HelpCircle } from "lucide-react";

export function AssistPanel() {
    return (
        <div className="flex h-full flex-col border-l bg-muted/10">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    アシストパネル
                </h3>
            </div>
            <div className="flex-1 overflow-hidden p-4">
                <Tabs defaultValue="chat" className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="chat">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            チャット
                        </TabsTrigger>
                        <TabsTrigger value="memo">
                            <StickyNote className="h-4 w-4 mr-2" />
                            メモ
                        </TabsTrigger>
                    </TabsList>
                    <div className="flex-1 mt-4 overflow-auto">
                        <TabsContent value="chat" className="h-full mt-0">
                            <Card className="h-full border-dashed shadow-none">
                                <CardHeader className="p-4">
                                    <CardTitle className="text-sm text-muted-foreground">プロジェクトチャット</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 text-sm text-muted-foreground text-center">
                                    ここに案件に関するチャットが表示されます。
                                    (未実装)
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="memo" className="h-full mt-0">
                            <Card className="h-full border-dashed shadow-none">
                                <CardHeader className="p-4">
                                    <CardTitle className="text-sm text-muted-foreground">自分用メモ</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 text-sm text-muted-foreground">
                                    <textarea
                                        className="w-full h-full min-h-[200px] resize-none bg-transparent border-none focus:outline-none"
                                        placeholder="ここに作業メモを残せます..."
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
