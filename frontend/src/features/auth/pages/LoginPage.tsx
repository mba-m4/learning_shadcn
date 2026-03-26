import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, status, error, accessToken } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? '/'

  useEffect(() => {
    if (accessToken) {
      navigate(from, { replace: true })
    }
  }, [accessToken, from, navigate])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const success = await login(username, password)
    if (success) {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="gradient-mesh flex min-h-screen items-center justify-center px-6 py-16">
      <div className="rounded-xl border border-border bg-card shadow-sm w-full max-w-4xl overflow-hidden">
        <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_1fr] lg:p-10">
          <div className="space-y-6">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/80">
              Risk Check System
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">
              作業の安全を
              <br />
              <span className="text-gradient">未来志向</span>で管理する
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              作業前のリスク評価と現場コメントを、チーム全体で同期します。
            </p>
            <div className="grid gap-3 text-sm">
              <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 transition-all hover:border-primary/30 hover:bg-muted/50">
                <span className="font-medium text-foreground">リーダー:</span>{' '}
                <span className="text-muted-foreground">作業作成 / リスク生成</span>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 transition-all hover:border-primary/30 hover:bg-muted/50">
                <span className="font-medium text-foreground">作業者:</span>{' '}
                <span className="text-muted-foreground">作業確認 / コメント入力</span>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 transition-all hover:border-primary/30 hover:bg-muted/50">
                <span className="font-medium text-foreground">安全管理:</span>{' '}
                <span className="text-muted-foreground">状況のレビュー</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl">ログイン</CardTitle>
              <CardDescription className="text-base">
                役割に応じた画面にアクセスします。
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">ユーザー名</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="leader"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">パスワード</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={status === 'loading'}>
                  {status === 'loading' ? '送信中...' : 'ログイン'}
                </Button>
              </form>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  )
}
