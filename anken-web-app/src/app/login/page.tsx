import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error: string }>;
}) {
    const { error } = await searchParams;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
            {error && (
                <div className="mb-4 w-full max-w-md rounded-md bg-red-50 p-4 text-sm text-red-500 border border-red-200">
                    {error}
                </div>
            )}
            <Tabs defaultValue="login" className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">ログイン</TabsTrigger>
                    <TabsTrigger value="signup">新規登録</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle>ログイン</CardTitle>
                            <CardDescription>
                                メールアドレスとパスワードを入力してログインしてください。
                            </CardDescription>
                        </CardHeader>
                        <form>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">メールアドレス</Label>
                                    <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">パスワード</Label>
                                    <Input id="password" name="password" type="password" required />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button formAction={login} className="w-full">ログイン</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
                <TabsContent value="signup">
                    <Card>
                        <CardHeader>
                            <CardTitle>新規登録</CardTitle>
                            <CardDescription>
                                新しいアカウントを作成します。
                            </CardDescription>
                        </CardHeader>
                        <form>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">メールアドレス</Label>
                                    <Input id="signup-email" name="email" type="email" placeholder="name@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">パスワード</Label>
                                    <Input id="signup-password" name="password" type="password" required />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button formAction={signup} className="w-full">アカウント作成</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
