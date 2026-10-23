import { useEffect, useState } from "react";
import { Check, Copy, Loader2, RefreshCw, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clinicAPI } from "@/lib/api";

/** Doctor-only: share the clinic join code and manage receptionists who joined with it. */
export function TeamSettings({ joinCode: initialCode }: { joinCode?: string }) {
  const [joinCode, setJoinCode] = useState(initialCode);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setJoinCode(initialCode), [initialCode]);

  const load = () =>
    clinicAPI.getStaff()
      .then(({ data }) => setStaff(data))
      .catch(() => setError("Couldn't load your team."))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const copy = async () => {
    if (!joinCode) return;
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const regenerate = async () => {
    if (!confirm("Generate a new code? The old code will stop working (existing staff stay).")) return;
    setBusy("code");
    try {
      const { data } = await clinicAPI.regenerateJoinCode();
      setJoinCode(data.joinCode);
    } catch {
      setError("Couldn't generate a new code.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (member: any) => {
    if (!confirm(`Remove ${member.name} from your clinic? They will lose access to your patients.`)) return;
    setBusy(member.id);
    try {
      await clinicAPI.removeStaff(member.id);
      setStaff((s) => s.filter((m) => m.id !== member.id));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Couldn't remove this staff member.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Add your receptionist so they can manage the queue, appointments and billing.</p>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
        <p className="text-sm font-semibold text-slate-800">Clinic code</p>
        <p className="text-xs text-slate-500 mt-0.5 mb-3">
          Your receptionist signs up as "Receptionist" and enters this code. Share it only with your staff.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-2xl font-bold tracking-[0.25em] text-emerald-800 bg-white border border-emerald-200 rounded-xl px-4 py-2">
            {joinCode || "········"}
          </span>
          <Button variant="outline" onClick={copy} className="gap-2 bg-white">
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />} {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="ghost" onClick={regenerate} disabled={busy === "code"} className="gap-2 text-slate-500">
            <RefreshCw className={`w-4 h-4 ${busy === "code" ? "animate-spin" : ""}`} /> New code
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}

      <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
        ) : staff.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium text-slate-900 truncate">{m.name}</p>
              <p className="text-xs text-slate-500 truncate">{m.email} · {m.role === "RECEPTIONIST" ? "Receptionist" : m.role === "DOCTOR" ? "Doctor" : m.role}</p>
            </div>
            {m.role === "RECEPTIONIST" && (
              <button
                onClick={() => remove(m)}
                disabled={busy === m.id}
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                aria-label={`Remove ${m.name}`}
              >
                {busy === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        ))}
        {!loading && staff.length <= 1 && (
          <div className="flex items-center gap-3 p-4 text-sm text-slate-500">
            <Users className="w-4 h-4" /> No receptionist yet — share the code above.
          </div>
        )}
      </div>
    </div>
  );
}
