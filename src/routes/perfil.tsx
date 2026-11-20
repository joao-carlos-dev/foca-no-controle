import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, User } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../hooks/use-auth";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";




export default function Perfil() {

  const EMAIL_FREQUENCIES = [
    { value: "on_day", label: "Apenas no dia do vencimento" },
    { value: "1_day_before", label: "1 dia antes e no dia do vencimento" },
    { value: "2_days_before", label: "2 dias antes, 1 dia antes e no dia (padrão)" },
    { value: "3_days_before", label: "3 dias antes e no dia do vencimento" },
    { value: "weekly", label: "Resumo semanal (toda segunda-feira)" },
  ];
  const [emailFrequency, setEmailFrequency] = useState("2_days_before");

  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyCsv, setNotifyCsv] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, notify_email, notify_csv, email_frequency")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setNotifyEmail(data.notify_email ?? true);
        setNotifyCsv(data.notify_csv ?? true);
        setEmailFrequency(data.email_frequency || "2_days_before");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSavedMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim(),
        notify_email: notifyEmail,
        notify_csv: notifyCsv,
        email_frequency: emailFrequency,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Erro ao salvar alterações.");
      return;
    }

    setSavedMessage("Alterações salvas com sucesso!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };



  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl space-y-6">
        {/* Topo: Voltar e Sair */}
        <header className="flex items-center justify-between px-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </header>

        {/* Card Principal */}
        <form
          onSubmit={handleSave}
          className="bg-card/40 rounded-3xl border border-border/50 p-6 sm:p-8 space-y-6 shadow-sm"
        >
          {/* Cabeçalho do Perfil */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/30 flex items-center justify-center text-foreground shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">
                Meu perfil
              </h1>
              <p className="text-sm text-muted-foreground">
                {user?.email || ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Carregando dados do perfil...
            </div>
          ) : (
            <div className="space-y-5">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Nome
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-background/60 rounded-xl h-11"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  WhatsApp
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 48991268854"
                  className="bg-background/60 rounded-xl h-11"
                />
                <p className="text-xs text-muted-foreground pt-0.5">
                  Será usado para lembretes via WhatsApp (em breve).
                </p>
              </div>

              {/* Toggle 1: Lembretes por email + Frequência */}
              <div className="p-4 rounded-2xl border border-border/50 bg-background/30 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      Receber lembretes por email
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Avisos automáticos das suas contas (sempre ao meio-dia).
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyEmail}
                    onClick={() => setNotifyEmail(!notifyEmail)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${notifyEmail ? "bg-primary" : "bg-muted"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${notifyEmail ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>

                {notifyEmail && (
                  <div className="pt-3 border-t border-border/40 space-y-1.5 animate-in fade-in duration-200">
                    <label className="text-xs font-medium text-muted-foreground">
                      Frequência dos avisos
                    </label>
                    <select
                      value={emailFrequency}
                      onChange={(e) => setEmailFrequency(e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-xl border border-border bg-background/80 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                    >
                      {EMAIL_FREQUENCIES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Toggle 2: CSV mensal por email */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-border/50 bg-background/30">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    Receber CSV mensal por email
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Envio automático no último dia de cada mês às 17h.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifyCsv}
                  onClick={() => setNotifyCsv(!notifyCsv)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${notifyCsv ? "bg-primary" : "bg-muted"
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${notifyCsv ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>

              {savedMessage && (
                <p className="text-xs font-medium text-income text-center">
                  {savedMessage}
                </p>
              )}

              {/* Botão Salvar */}
              <Button
                type="submit"
                disabled={saving}
                className="w-full h-11 rounded-xl font-semibold cursor-pointer"
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}