import { useState, type SetStateAction } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { supabase } from "../integrations/supabase/client";
import logo from "../assets/logo_foca.png";

type AuthMode = "login" | "register" | "forgot"

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login")

  // Estados Base
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Estados de Cadastro
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [notifyBefore, setNotifyBefore] = useState(true)
  const [notifyOnDay, setNotifyOnDay] = useState(true)
  const [notifyOverdue, setNotifyOverdue] = useState(true)

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              notify_before: notifyBefore,
              notify_on_day: notifyOnDay,
              notify_overdue: notifyOverdue
            }
          }
        })
        if (error) throw error
        alert("Conta criada com sucesso! Faça login para continuar.")
        setMode("login")

      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) throw error
        alert("Instruções de recuperação enviadas para o seu e-mail.")
      }
    } catch (error: any) {
      alert(error.message || "Ocorreu um erro.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-(--shadow-elegant) border border-border">
        <div className="flex justify-center mb-5">
          <div className="w-30 h-30 rounded-full overflow-hidden flex items-center justify-center shadow-sm">
            <img src={logo}
            alt="Foca no Controle Logo"
            className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-(image:--gradient-primary) bg-clip-text text-transparent mb-2">
            Foca no Controle
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "login" && "Bem-vindo"}
            {mode === "register" && "Crie sua conta e assuma o controle."}
            {mode === "forgot" && "Digite seu e-mail para recuperar a senha."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Campos exclusivos do Cadastro */}
          {mode === "register" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium block text-left">Nome completo</label>
                <Input
                  type="text"
                  placeholder="João Carlos"
                  value={fullName}
                  onChange={(e: { target: { value: SetStateAction<string> } }) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium block text-left">WhatsApp / Telefone</label>
                <Input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e: { target: { value: SetStateAction<string> } }) => setPhone(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium block text-left">Email</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e: { target: { value: SetStateAction<string> } }) => setEmail(e.target.value)}
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
                onChange={(e: { target: { value: SetStateAction<string> } }) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          )}

          {/* Preferências de Notificação - Exclusivas do Cadastro */}
          {mode === "register" && (
            <div className="space-y-3 pt-2">
              <label className="text-sm font-medium block text-left">Preferências de Notificação</label>
              <div className="space-y-2 bg-background/50 p-4 rounded-xl border border-border">
                <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  <input
                    type="checkbox"
                    checked={notifyBefore}
                    onChange={(e) => setNotifyBefore(e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-background accent-primary"
                  />
                  1 dia antes do vencimento
                </label>
                <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  <input
                    type="checkbox"
                    checked={notifyOnDay}
                    onChange={(e) => setNotifyOnDay(e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-background accent-primary"
                  />
                  No dia do vencimento
                </label>
                <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  <input
                    type="checkbox"
                    checked={notifyOverdue}
                    onChange={(e) => setNotifyOverdue(e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-background accent-primary"
                  />
                  Quando a conta já venceu
                </label>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full mt-6 cursor-pointer" disabled={loading}>
            {loading ? "A processar..." : (
              mode === "login" ? "Entrar" :
                mode === "register" ? "Criar conta" : "Enviar link de recuperação"
            )}
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