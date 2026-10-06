'use client';

import React, { useState } from 'react';
import { VerdictType, MessageTones } from '@/lib/types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  MessageSquare, 
  Check, 
  Activity,
  Flame,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  History
} from 'lucide-react';

interface AuthenticityMeterProps {
  score: number;
  verdict: VerdictType;
  humanVerdict: string;
  verdictLabel: string;
  verdictDescription: string;
  confidenceScore: number;
  forwardRisk?: 'low' | 'medium' | 'high';
  forwardRiskLabel?: string;
  familyMessage: string;
  messageTones?: MessageTones;
}

export const AuthenticityMeter: React.FC<AuthenticityMeterProps> = ({
  score,
  verdict,
  humanVerdict,
  verdictLabel,
  verdictDescription,
  confidenceScore,
  forwardRisk = 'high',
  forwardRiskLabel,
  familyMessage,
  messageTones,
}) => {
  const [selectedTone, setSelectedTone] = useState<'mom' | 'witty' | 'polite' | 'direct'>('mom');
  const [copied, setCopied] = useState(false);
  const [showToneBox, setShowToneBox] = useState(false);

  const isAuthentic = verdict === 'authentic' || score >= 75;
  const isOutOfContext = verdict === 'out_of_context';
  const isManipulated = verdict === 'manipulated' || (score >= 35 && score < 75);

  const colorConfig = isOutOfContext
    ? {
        stroke: '#F97316', // Orange
        badgeBg: 'bg-orange-950/80',
        badgeBorder: 'border-orange-500/40',
        badgeText: 'text-orange-400',
        glow: 'shadow-orange-500/20',
        icon: History,
      }
    : isAuthentic
    ? {
        stroke: '#10B981', // Emerald
        badgeBg: 'bg-emerald-950/80',
        badgeBorder: 'border-emerald-500/40',
        badgeText: 'text-emerald-400',
        glow: 'shadow-emerald-500/20',
        icon: ShieldCheck,
      }
    : isManipulated
    ? {
        stroke: '#F59E0B', // Amber
        badgeBg: 'bg-amber-950/80',
        badgeBorder: 'border-amber-500/40',
        badgeText: 'text-amber-400',
        glow: 'shadow-amber-500/20',
        icon: AlertTriangle,
      }
    : {
        stroke: '#F43F5E', // Rose/Red
        badgeBg: 'bg-rose-950/80',
        badgeBorder: 'border-rose-500/40',
        badgeText: 'text-rose-400',
        glow: 'shadow-rose-500/20',
        icon: Flame,
      };

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const Icon = colorConfig.icon;

  const activeMessage = messageTones
    ? messageTones[selectedTone]
    : familyMessage;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(activeMessage)}`;

  return (
    <div className={`p-6 sm:p-7 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] shadow-2xl ${colorConfig.glow} flex flex-col md:flex-row items-center gap-6 relative overflow-hidden`}>
      
      {/* Ambient background glow */}
      <div 
        className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: colorConfig.stroke }}
      />

      {/* Radial Gauge */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-white/[0.05]"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={colorConfig.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${colorConfig.stroke})` }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-white tracking-tighter">
            {score}
            <span className="text-base font-normal text-slate-400">%</span>
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
            Trust Score
          </span>
        </div>
      </div>

      {/* Verdict & Details */}
      <div className="flex-1 text-center md:text-left space-y-3 w-full">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${colorConfig.badgeBg} ${colorConfig.badgeText} border ${colorConfig.badgeBorder} shadow-sm`}>
            <Icon className="w-3.5 h-3.5" />
            {verdictLabel}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-white/[0.03] text-slate-300 border border-white/[0.08]">
            <Activity className="w-3 h-3 text-blue-400" />
            Confidence: <strong className="text-white">{confidenceScore}%</strong>
          </span>

          {forwardRiskLabel && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono border ${
              forwardRisk === 'high'
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                : forwardRisk === 'medium'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
            }`}>
              <span>{forwardRisk === 'high' ? '🛑' : forwardRisk === 'medium' ? '⚠️' : '✅'}</span>
              <span>{forwardRiskLabel}</span>
            </span>
          )}
        </div>

        {/* Primary Human Verdict Headline */}
        <h3 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
          {humanVerdict}
        </h3>

        {/* Supporting Forensic Subtext */}
        <p className="text-xs text-slate-400 font-mono leading-relaxed">
          <span className="text-slate-500 font-semibold uppercase tracking-wider block sm:inline sm:mr-1">
            Forensic Proof:
          </span>
          {verdictDescription}
        </p>

        {/* Tone Selector & WhatsApp Share Box */}
        <div className="pt-2 space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <button
              onClick={() => setShowToneBox(!showToneBox)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium shadow-sm transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share Fact-Check to WhatsApp</span>
              {showToneBox ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </button>
          </div>

          {/* Collapsible Tone Selector Card */}
          {showToneBox && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] text-xs font-mono space-y-3 animate-fadeIn backdrop-blur-md">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Select WhatsApp Tone:
                </span>
                
                {/* 4 Tone Pills */}
                <div className="flex flex-wrap items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.06]">
                  <button
                    onClick={() => setSelectedTone('mom')}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                      selectedTone === 'mom'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    👩‍👧 Mom / Parents
                  </button>
                  <button
                    onClick={() => setSelectedTone('witty')}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                      selectedTone === 'witty'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    😂 Witty
                  </button>
                  <button
                    onClick={() => setSelectedTone('polite')}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                      selectedTone === 'polite'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    😇 Polite
                  </button>
                  <button
                    onClick={() => setSelectedTone('direct')}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                      selectedTone === 'direct'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    👔 Direct
                  </button>
                </div>
              </div>

              {/* Message Display */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-200 leading-relaxed text-xs italic">
                "{activeMessage}"
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-lg text-xs font-medium border border-white/[0.08] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <span>Copy Text</span>
                  )}
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Send to WhatsApp</span>
                </a>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
