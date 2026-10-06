import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface AdminTwoFactorProps {
  onVerified: () => void;
  onCancel: () => void;
}

type Mode = "loading" | "enroll" | "verify";

const AdminTwoFactor = ({ onVerified, onCancel }: AdminTwoFactorProps) => {
  const [mode, setMode] = useState<Mode>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const prepare = async () => {
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      if (!active) return;
      if (listError) {
        setError("Could not load two-factor settings.");
        return;
      }

      const verified = data.totp.find((factor) => factor.status === "verified");
      if (verified) {
        setFactorId(verified.id);
        setMode("verify");
        return;
      }

      // Remove abandoned, never-verified enrollments before starting a fresh one.
      for (const factor of data.all.filter((f) => f.status !== "verified")) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }

      const { data: enrolled, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `OOR Admin ${Date.now()}`,
      });
      if (!active) return;
      if (enrollError || !enrolled) {
        setError("Could not start two-factor setup.");
        return;
      }
      setFactorId(enrolled.id);
      setQrCode(enrolled.totp.qr_code);
      setSecret(enrolled.totp.secret);
      setMode("enroll");
    };
    prepare();
    return () => { active = false; };
  }, []);

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!factorId || code.length !== 6) return;
    setSubmitting(true);
    setError(null);
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setSubmitting(false);
    if (verifyError) {
      setError("Invalid code. Try again.");
      setCode("");
      return;
    }
    onVerified();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-bold text-foreground">
          {mode === "enroll" ? "Set up two-factor authentication" : "Two-factor verification"}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {mode === "enroll"
            ? "Scan this QR code with Google Authenticator, Microsoft Authenticator or a similar app, then enter the 6-digit code."
            : "Enter the 6-digit code from your authenticator app."}
        </p>
      </div>

      {mode === "loading" && !error && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {mode === "enroll" && qrCode && (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-xl bg-foreground p-3">
            <img src={qrCode} alt="Two-factor QR code" className="w-44 h-44" />
          </div>
          {secret && (
            <p className="text-xs text-muted-foreground text-center break-all font-mono">
              Manual key: {secret}
            </p>
          )}
        </div>
      )}

      {mode !== "loading" && (
        <form onSubmit={handleVerify} className="flex flex-col items-center gap-4">
          <InputOTP maxLength={6} value={code} onChange={setCode} autoFocus>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <Button type="submit" className="w-full" disabled={submitting || code.length !== 6}>
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify"}
          </Button>
        </form>
      )}

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <button type="button" onClick={onCancel} className="w-full text-sm text-muted-foreground hover:text-foreground">
        Cancel and sign out
      </button>
    </div>
  );
};

export default AdminTwoFactor;
