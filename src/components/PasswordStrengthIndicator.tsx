import React from "react";

interface PasswordStrengthProps {
  pass: string;
}

export default function PasswordStrengthIndicator({ pass }: PasswordStrengthProps) {
  if (!pass) return null;

  // Grade complexity scoring
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  let strengthHeader = "Very Weak";
  let colorClass = "bg-red-500 shadow-red-500/20";
  let listChecks = [
    { label: "At least 8 characters long", met: pass.length >= 8 },
    { label: "Contains uppercase character", met: /[A-Z]/.test(pass) },
    { label: "Contains numeric digit", met: /[0-9]/.test(pass) },
    { label: "Contains special symbol (e.g. @, #, $, !)", met: /[^A-Za-z0-9]/.test(pass) },
  ];

  if (score === 2) {
    strengthHeader = "Fair";
    colorClass = "bg-amber-500 shadow-amber-500/20";
  } else if (score === 3) {
    strengthHeader = "Strong";
    colorClass = "bg-blue-500 shadow-blue-500/20";
  } else if (score === 4) {
    strengthHeader = "Excellent";
    colorClass = "bg-emerald-500 shadow-emerald-500/20";
  }

  return (
    <div className="space-y-3.5 mt-2.5 p-4 bg-[#0A0A0A]/80 border border-[#1E1E1E] rounded-xl backdrop-blur-md">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 font-medium">Password Integrity:</span>
        <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border border-current bg-opacity-10 text-[10px] uppercase tracking-wider ${
          score <= 1 ? "text-red-400" : score === 2 ? "text-amber-400" : score === 3 ? "text-blue-400" : "text-emerald-400"
        }`}>
          {strengthHeader}
        </span>
      </div>

      {/* Grid segments */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden bg-zinc-900">
        {[1, 2, 3, 4].map((index) => {
          const filled = score >= index;
          return (
            <div
              key={index}
              className={`h-full transition-all duration-300 ${
                filled ? colorClass : "bg-neutral-800"
              }`}
            />
          );
        })}
      </div>

      {/* Quality checkpoints checklist */}
      <div className="space-y-1.5 pt-1 border-t border-[#151515]">
        {listChecks.map((chk, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
              chk.met ? "bg-emerald-400 animate-pulse" : "bg-zinc-700"
            }`} />
            <span className={`text-[11px] transition-colors duration-300 ${
              chk.met ? "text-slate-300 font-medium" : "text-slate-600"
            }`}>
              {chk.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
 