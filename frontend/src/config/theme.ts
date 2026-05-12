export const THEME_MODE: 'light' | 'dark' = 'dark';

export const theme = {
  bg: {
    primary: 'bg-[#020817]',
    secondary: 'bg-slate-950/70',
    tertiary: 'bg-slate-900/70',
    card: 'glass-card',
    hover: 'hover:bg-slate-800/70',
  },
  text: {
    primary: 'text-slate-100',
    secondary: 'text-slate-400',
    tertiary: 'text-slate-500',
    muted: 'text-slate-400',
  },
  border: {
    primary: 'border-slate-800',
    secondary: 'border-slate-700',
    hover: 'hover:border-cyan-500/30',
  },
  input: {
    bg: 'bg-slate-900/70',
    border: 'border-slate-700',
    text: 'text-slate-100',
    placeholder: 'placeholder-slate-500',
    focus: 'focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10',
  },
  button: {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700',
    ghost: 'hover:bg-slate-800/60 text-slate-300',
  },
  status: {
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
    high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
    medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-300' },
    low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300' },
    success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    info: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  },
  table: {
    header: 'bg-slate-900 text-slate-300',
    row: 'bg-transparent',
    rowHover: 'hover:bg-slate-800/50',
    border: 'border-slate-800',
  },
  chart: {
    grid: '#1e293b',
    text: '#94a3b8',
    tooltip: { bg: 'bg-slate-900', border: 'border-slate-700', text: 'text-slate-100' },
  },
};
