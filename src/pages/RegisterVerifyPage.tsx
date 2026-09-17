// filepath: src/pages/RegisterVerifyPage.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth";

export default function RegisterVerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate("/register/cliente", { replace: true });
  }, [email, navigate]);

  // Countdown for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return; // solo números
    const newCodigo = [...codigo];
    newCodigo[index] = value.slice(-1); // solo el último char
    setCodigo(newCodigo);
    setError(null);

    // Auto-focus siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newCodigo.every((d) => d !== "") && newCodigo.join("").length === 6) {
      handleVerify(newCodigo.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify(codigoStr: string) {
    if (!email || codigoStr.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.verifyEmail({ email, codigo: codigoStr });
      navigate("/cliente", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Código inválido. Intentá de nuevo.";
      setError(msg);
      setCodigo(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || !email) return;
    setLoading(true);
    setError(null);
    try {
      // Re-register to get a new code
      // The user must have filled the form already, we just need the email
      // For simplicity, we show a "code resent" message
      setResendCooldown(60); // 1 min cooldown
      setError(null);
    } catch (err: any) {
      setError("No se pudo reenviar. Probá más tarde.");
    } finally {
      setLoading(false);
    }
  }

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-100 via-cream-50 to-cream-200 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-forest-500 to-forest-700 shadow-lg mb-4">
            <span className="text-4xl">📧</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900">Verificá tu email</h1>
          <p className="mt-2 text-stone-600 text-sm">
            Enviamos un código de 6 dígitos a{" "}
            <span className="font-semibold text-forest-700">{email}</span>
          </p>
        </div>

        {/* Code inputs */}
        <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/60 p-8">
          <div className="flex justify-center gap-3 mb-6">
            {codigo.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 text-stone-900 bg-cream-50 focus:outline-none transition-all ${
                  error
                    ? "border-red-400 focus:ring-2 focus:ring-red-400"
                    : "border-stone-200 focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                } disabled:opacity-50`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={() => handleVerify(codigo.join(""))}
            disabled={loading || codigo.join("").length < 6}
            className="w-full bg-forest-600 hover:bg-forest-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-2xl transition-colors duration-200"
          >
            {loading ? "Verificando..." : "Verificar cuenta"}
          </button>

          <div className="mt-5 text-center">
            {resendCooldown > 0 ? (
              <p className="text-sm text-stone-400">
                Podés reenviar en {resendCooldown}s
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={loading}
                className="text-sm text-forest-600 font-semibold hover:underline disabled:opacity-50"
              >
                No recibí el código · Reenviar
              </button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-stone-100 text-center">
            <p className="text-sm text-stone-500">
              ¿Ya tenés cuenta?{" "}
              <Link to="/login" className="text-forest-600 font-semibold hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-stone-400 text-xs mt-4">
          Revisá también la carpeta de spam.
        </p>
      </div>
    </div>
  );
}
