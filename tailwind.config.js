/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand
        primary:      '#2563EB',
        'primary-light': '#DBEAFE',
        'primary-dark':  '#1E40AF',
        secondary:    '#0D9488',
        accent:       '#7C3AED',

        // Backgrounds
        background:   '#F4F7FB',
        surface:      '#FFFFFF',
        'surface-alt':'#EEF2F7',
        border:       '#D8E0EA',
        'border-light':'#E8EDF4',

        // Text
        text:         '#0F172A',
        'text-secondary': '#334155',
        'text-muted': '#64748B',
        'text-ondark': '#F8FAFC',

        // Status
        error:        '#DC2626',
        'error-light':'#FEE2E2',
        warning:      '#D97706',
        'warning-light':'#FEF3C7',
        success:      '#16A34A',
        'success-light':'#DCFCE7',
        info:         '#0284C7',
        'info-light': '#E0F2FE',

        // Drawer
        drawer:       '#0F172A',
        'drawer-item':'#1E293B',
        'drawer-active':'#2563EB',
        'drawer-text': '#CBD5E1',
        'drawer-text-active':'#FFFFFF',
      },
      fontFamily: {
        sarabun: ['Sarabun_400Regular'],
        'sarabun-bold': ['Sarabun_700Bold'],
        'sarabun-semi': ['Sarabun_600SemiBold'],
        'sarabun-medium': ['Sarabun_500Medium'],
        'sarabun-light': ['Sarabun_300Light'],
        'sarabun-extra': ['Sarabun_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
