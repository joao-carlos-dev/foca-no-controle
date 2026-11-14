import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"

type AuthMode = "login" | "register" | "forgot"

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Deixamos preparado para quando conectarmos o Supabase mais para frente
    console.log({ mode, fullName, email, password })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-(--shadow-elegant) border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-(image:--gradient-primary) bg-clip-text text-transparent mb-2">
            Foca no Controle
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "login" && "Bem-vindo de volta!"}
            {mode === "register" && "Crie sua conta e assuma o controle."}
            {mode === "forgot" && "Digite seu e-mail para recuperar a senha."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <label className="text-sm font-medium block text-left">Nome completo</label>
              <Input
                type="text"
                placeholder="João Carlos"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium block text-left">Email</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mode !== "forgot" && (
            <div className="space-y-2">
              <label className="text-sm font-medium block text-left">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full mt-6 cursor-pointer">
            {mode === "login" && "Entrar"}
            {mode === "register" && "Criar conta"}
            {mode === "forgot" && "Enviar link de recuperação"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === "login" ? (
            <>
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer block w-full"
              >
                Não tem uma conta? Cadastre-se
              </button>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer block w-full"
              >
                Esqueceu a senha?
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer block w-full"
            >
              Voltar para o login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}