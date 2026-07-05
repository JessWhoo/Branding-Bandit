
import React, { useState, useCallback } from 'react';
import { BrandBible } from '../types';
import { analyzeContrast, bestTextColor, normalizeHex } from '../utils/colorContrast';

// ─── WCAG 2.1 AA Criteria ──────────────────────────────────────────────────

type Principle = 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';

interface WcagCriterion {
  id: string;
  title: string;
  principle: Principle;
  level: 'A' | 'AA';
  description: string;
}

const WCAG_CRITERIA: WcagCriterion[] = [
  // Perceivable
  { id: '1.1.1', title: 'Non-text Content', principle: 'Perceivable', level: 'A',
    description: 'All non-text content has a text alternative: alt attributes on images, aria-label on icon buttons, captions or transcripts for media.' },
  { id: '1.2.2', title: 'Captions (Pre-recorded)', principle: 'Perceivable', level: 'A',
    description: 'Captions are provided for all pre-recorded audio in synchronized media (videos with audio tracks).' },
  { id: '1.3.1', title: 'Info and Relationships', principle: 'Perceivable', level: 'A',
    description: 'Structure conveyed visually is also conveyed programmatically: use semantic HTML (headings, lists, tables, landmark regions).' },
  { id: '1.3.3', title: 'Sensory Characteristics', principle: 'Perceivable', level: 'A',
    description: 'Instructions don\'t rely solely on shape, color, size, visual location, or sound (e.g. "click the green button").' },
  { id: '1.4.1', title: 'Use of Color', principle: 'Perceivable', level: 'A',
    description: 'Color is not the only visual means of conveying information — add icons, patterns, or text labels alongside color cues.' },
  { id: '1.4.3', title: 'Contrast (Minimum)', principle: 'Perceivable', level: 'AA',
    description: 'Text has a contrast ratio of at least 4.5:1 (3:1 for large text ≥18pt or ≥14pt bold). Use the color checker tool in this dashboard.' },
  { id: '1.4.4', title: 'Resize Text', principle: 'Perceivable', level: 'AA',
    description: 'Text can be resized to 200% via browser settings without loss of content or functionality (avoid px-locked layouts).' },
  { id: '1.4.5', title: 'Images of Text', principle: 'Perceivable', level: 'AA',
    description: 'If text can convey the information, don\'t use an image of text. Logos and essential branding are exceptions.' },
  // Operable
  { id: '2.1.1', title: 'Keyboard Accessible', principle: 'Operable', level: 'A',
    description: 'All functionality is operable via keyboard alone — no mouse-only interactions like drag-only or hover-only actions.' },
  { id: '2.1.2', title: 'No Keyboard Trap', principle: 'Operable', level: 'A',
    description: 'Keyboard focus can always be moved away from any component using standard keys (Tab, Shift+Tab, Escape).' },
  { id: '2.4.1', title: 'Bypass Blocks', principle: 'Operable', level: 'A',
    description: 'A "Skip to main content" link or ARIA landmark regions (<main>, <nav>) let keyboard users bypass repeated navigation.' },
  { id: '2.4.2', title: 'Page Titled', principle: 'Operable', level: 'A',
    description: 'The page has a meaningful <title> element that describes its topic or purpose.' },
  { id: '2.4.3', title: 'Focus Order', principle: 'Operable', level: 'A',
    description: 'Tab order is logical and follows the visual reading order — avoid positive tabindex values.' },
  { id: '2.4.4', title: 'Link Purpose', principle: 'Operable', level: 'A',
    description: 'Link purpose is clear from link text alone or surrounding context (avoid generic "click here" or "read more").' },
  { id: '2.4.6', title: 'Headings and Labels', principle: 'Operable', level: 'AA',
    description: 'Headings and form labels are descriptive and accurately label the content or field they refer to.' },
  { id: '2.4.7', title: 'Focus Visible', principle: 'Operable', level: 'AA',
    description: 'Every keyboard-focusable element has a clearly visible focus indicator (browser default or custom outline).' },
  // Understandable
  { id: '3.1.1', title: 'Language of Page', principle: 'Understandable', level: 'A',
    description: 'The <html> element has a lang attribute matching the page\'s primary language (e.g. lang="en").' },
  { id: '3.2.2', title: 'On Input', principle: 'Understandable', level: 'A',
    description: 'Changing a form field\'s value does not automatically trigger a page navigation or major context change.' },
  { id: '3.3.1', title: 'Error Identification', principle: 'Understandable', level: 'A',
    description: 'Input errors are automatically detected, identified in text, and described to the user in the error message.' },
  { id: '3.3.2', title: 'Labels or Instructions', principle: 'Understandable', level: 'A',
    description: 'Labels or instructions are provided for all user input fields (visible label or aria-label/aria-describedby).' },
  // Robust
  { id: '4.1.1', title: 'Parsing', principle: 'Robust', level: 'A',
    description: 'HTML has valid syntax: complete start/end tags, no duplicate attributes, no duplicate IDs, properly nested elements.' },
  { id: '4.1.2', title: 'Name, Role, Value', principle: 'Robust', level: 'A',
    description: 'All UI components have an accessible name, role, and state that assistive technology can read (ARIA attributes).' },
  { id: '4.1.3', title: 'Status Messages', principle: 'Robust', level: 'AA',
    description: 'Status messages are programmatically determinable via role="status", role="alert", or aria-live without receiving focus.' },
];

const PRINCIPLE_META: Record<Principle, { bgClass: string; textClass: string; badgeClass: string; icon: string }> = {
  Perceivable:    { bgClass: 'bg-blue-900/30',   textClass: 'text-blue-300',   badgeClass: 'bg-blue-700/50 text-blue-200',   icon: '👁' },
  Operable:       { bgClass: 'bg-purple-900/30', textClass: 'text-purple-300', badgeClass: 'bg-purple-700/50 text-purple-200', icon: '⌨' },
  Understandable: { bgClass: 'bg-amber-900/30',  textClass: 'text-amber-300',  badgeClass: 'bg-amber-700/50 text-amber-200',  icon: '💡' },
  Robust:         { bgClass: 'bg-teal-900/30',   textClass: 'text-teal-300',   badgeClass: 'bg-teal-700/50 text-teal-200',   icon: '🔩' },
};

const PRINCIPLES: Principle[] = ['Perceivable', 'Operable', 'Understandable', 'Robust'];

// ─── Color Blindness Simulation Data ──────────────────────────────────────

const COLOR_BLINDNESS_TYPES = [
  { id: 'normal',        label: 'Normal Vision',   filterId: '',                            prevalence: 'Baseline' },
  { id: 'protanopia',    label: 'Protanopia',       filterId: 'ada-filter-protanopia',       prevalence: '~1% of men (red-blind)' },
  { id: 'deuteranopia',  label: 'Deuteranopia',     filterId: 'ada-filter-deuteranopia',     prevalence: '~1% of men (green-blind)' },
  { id: 'tritanopia',    label: 'Tritanopia',       filterId: 'ada-filter-tritanopia',       prevalence: '~0.01% (blue-blind)' },
  { id: 'achromatopsia', label: 'Achromatopsia',    filterId: 'ada-filter-achromatopsia',    prevalence: '~0.003% (no color)' },
] as const;

// ─── Small Helper Components ───────────────────────────────────────────────

function PassBadge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
        pass ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'
      }`}
      aria-label={`${label}: ${pass ? 'pass' : 'fail'}`}
    >
      {pass ? '✓' : '✗'} {label}
    </span>
  );
}

function SectionCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 id={id} className="text-xl font-bold text-white mb-4">{title}</h2>
      {children}
    </section>
  );
}

// ─── Score Ring (SVG) ──────────────────────────────────────────────────────

function ScoreRing({ percent }: { percent: number }) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);
  const color = percent >= 80 ? '#4ade80' : percent >= 50 ? '#60a5fa' : percent >= 25 ? '#fbbf24' : '#f87171';

  return (
    <svg width="96" height="96" viewBox="0 0 80 80" aria-hidden="true" focusable={false} className="flex-shrink-0">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#374151" strokeWidth="8" />
      <circle
        cx="40" cy="40" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="40" y="36" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">{percent}%</text>
      <text x="40" y="50" textAnchor="middle" fill="#9ca3af" fontSize="8">of criteria</text>
    </svg>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────

interface AdaComplianceDashboardProps {
  brandBible: BrandBible | null;
}

export const AdaComplianceDashboard: React.FC<AdaComplianceDashboardProps> = ({ brandBible }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [fgHex, setFgHex] = useState('#ffffff');
  const [bgHex, setBgHex] = useState('#4f46e5');

  const toggleChecked = useCallback((id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalCriteria = WCAG_CRITERIA.length;
  const scorePercent = Math.round((checkedCount / totalCriteria) * 100);
  const scoreLabel = scorePercent >= 80 ? 'Strong Compliance' : scorePercent >= 50 ? 'Mostly Assessed' : scorePercent >= 25 ? 'In Progress' : 'Not Yet Assessed';

  const validFg = normalizeHex(fgHex);
  const validBg = normalizeHex(bgHex);
  const checkerResult = validFg && validBg ? analyzeContrast(validFg, validBg) : null;

  const paletteResults = brandBible?.palette.map(color => ({
    color,
    whiteText: analyzeContrast('#ffffff', color.hex),
    blackText: analyzeContrast('#000000', color.hex),
    recommended: bestTextColor(color.hex),
  }));

  const paletteAAIssues = paletteResults?.filter(r => !r.whiteText?.normalAA && !r.blackText?.normalAA).length ?? 0;

  const groupedCriteria = WCAG_CRITERIA.reduce<Record<Principle, WcagCriterion[]>>((acc, c) => {
    (acc[c.principle] = acc[c.principle] ?? []).push(c);
    return acc;
  }, {} as Record<Principle, WcagCriterion[]>);

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Hidden SVG filter definitions for color blindness simulation */}
      <svg aria-hidden="true" focusable={false} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          {/* Machado et al. (2009) color vision deficiency matrices */}
          <filter id="ada-filter-protanopia">
            <feColorMatrix type="matrix" values="0.152286 1.052583 -0.204868 0 0  0.114503 0.786281 0.099216 0 0  -0.003882 -0.048116 1.051998 0 0  0 0 0 1 0" />
          </filter>
          <filter id="ada-filter-deuteranopia">
            <feColorMatrix type="matrix" values="0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.011820 0.042940 0.968881 0 0  0 0 0 1 0" />
          </filter>
          <filter id="ada-filter-tritanopia">
            <feColorMatrix type="matrix" values="1.255528 -0.076749 -0.178779 0 0  -0.078411 0.930809 0.147602 0 0  0.004733 0.691367 0.303900 0 0  0 0 0 1 0" />
          </filter>
          <filter id="ada-filter-achromatopsia">
            <feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

      {/* ── Summary Card ─────────────────────────────────────────────────── */}
      <section aria-labelledby="ada-summary-heading" className="bg-gray-800 rounded-lg shadow-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <ScoreRing percent={scorePercent} />
          <div className="flex-1">
            <h2 id="ada-summary-heading" className="text-2xl font-bold text-white">{scoreLabel}</h2>
            <p className="text-gray-400 mt-1">
              <span className="font-semibold text-white">{checkedCount}</span> of{' '}
              <span className="font-semibold text-white">{totalCriteria}</span> WCAG 2.1 AA criteria self-assessed as compliant.
            </p>
            {brandBible && paletteResults && (
              <p className={`mt-1 text-sm font-medium ${paletteAAIssues === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                {paletteAAIssues === 0
                  ? '✓ All brand colors pass WCAG AA contrast requirements.'
                  : `⚠ ${paletteAAIssues} brand color${paletteAAIssues > 1 ? 's' : ''} fail AA contrast — see palette analysis below.`}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Self-assessment only. For a full audit, run automated tools (axe DevTools, Lighthouse) and test with screen readers (NVDA, JAWS, VoiceOver).
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex sm:flex-col gap-3 flex-wrap">
            {PRINCIPLES.map(p => {
              const meta = PRINCIPLE_META[p];
              const items = groupedCriteria[p] ?? [];
              const done = items.filter(c => checked[c.id]).length;
              return (
                <div key={p} className={`px-3 py-2 rounded-lg ${meta.bgClass} text-center min-w-[90px]`}>
                  <p className={`text-xs font-medium ${meta.textClass}`}>{p}</p>
                  <p className="text-white font-bold text-lg leading-none mt-0.5">{done}/{items.length}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Color Contrast Checker ────────────────────────────────────────── */}
      <SectionCard id="contrast-checker-heading" title="Color Contrast Checker">
        <p className="text-gray-400 text-sm mb-5">
          Test any foreground and background color combination against WCAG 2.1 AA and AAA thresholds.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs column */}
          <div className="space-y-4">
            <div>
              <label htmlFor="ada-fg-hex" className="block text-sm font-medium text-gray-300 mb-1.5">
                Foreground (text) color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={validFg ?? '#ffffff'}
                  onChange={e => setFgHex(e.target.value)}
                  className="h-10 w-14 rounded cursor-pointer border-0 bg-transparent p-0.5"
                  aria-label="Foreground color picker"
                />
                <input
                  id="ada-fg-hex"
                  type="text"
                  value={fgHex}
                  onChange={e => setFgHex(e.target.value)}
                  placeholder="#ffffff"
                  maxLength={7}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  spellCheck={false}
                />
              </div>
            </div>
            <div>
              <label htmlFor="ada-bg-hex" className="block text-sm font-medium text-gray-300 mb-1.5">
                Background color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={validBg ?? '#4f46e5'}
                  onChange={e => setBgHex(e.target.value)}
                  className="h-10 w-14 rounded cursor-pointer border-0 bg-transparent p-0.5"
                  aria-label="Background color picker"
                />
                <input
                  id="ada-bg-hex"
                  type="text"
                  value={bgHex}
                  onChange={e => setBgHex(e.target.value)}
                  placeholder="#4f46e5"
                  maxLength={7}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  spellCheck={false}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => { const tmp = fgHex; setFgHex(bgHex); setBgHex(tmp); }}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              aria-label="Swap foreground and background colors"
            >
              ⇅ Swap colors
            </button>

            {/* WCAG thresholds reference */}
            <div className="bg-gray-700/50 rounded-lg p-3 text-xs text-gray-400 space-y-1">
              <p className="font-semibold text-gray-300">WCAG 2.1 Thresholds</p>
              <p>Normal text AA: <span className="text-white font-mono">4.5:1</span> &nbsp; AAA: <span className="text-white font-mono">7:1</span></p>
              <p>Large text AA: <span className="text-white font-mono">3:1</span> &nbsp;&nbsp; AAA: <span className="text-white font-mono">4.5:1</span></p>
              <p>UI components AA: <span className="text-white font-mono">3:1</span></p>
              <p className="text-gray-500 mt-1">Large text = ≥18pt normal or ≥14pt bold</p>
            </div>
          </div>

          {/* Results column */}
          <div>
            {checkerResult && validFg && validBg ? (
              <div className="space-y-4">
                {/* Live preview */}
                <div
                  className="rounded-lg p-4 min-h-[90px] flex flex-col justify-center border border-gray-600"
                  style={{ backgroundColor: validBg }}
                  aria-label={`Preview: ${validFg} text on ${validBg} background`}
                >
                  <p style={{ color: validFg }} className="font-bold text-xl leading-tight">
                    Sample Heading (large text)
                  </p>
                  <p style={{ color: validFg }} className="text-sm mt-1">
                    Body copy — check readability at normal text size.
                  </p>
                </div>

                {/* Ratio */}
                <div className="text-center bg-gray-700 rounded-lg py-3">
                  <span className="text-4xl font-bold text-white tabular-nums">{checkerResult.ratioText}</span>
                  <p className="text-gray-400 text-sm mt-0.5">contrast ratio</p>
                </div>

                {/* Pass/fail grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-2 font-medium">Normal Text</p>
                    <div className="flex flex-wrap gap-1">
                      <PassBadge pass={checkerResult.normalAA} label="AA" />
                      <PassBadge pass={checkerResult.normalAAA} label="AAA" />
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-2 font-medium">Large Text</p>
                    <div className="flex flex-wrap gap-1">
                      <PassBadge pass={checkerResult.largeAA} label="AA" />
                      <PassBadge pass={checkerResult.largeAAA} label="AAA" />
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3 col-span-2">
                    <p className="text-gray-400 text-xs mb-2 font-medium">UI Components &amp; Focus Indicators</p>
                    <PassBadge pass={checkerResult.uiAA} label="AA (3:1 min)" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm italic text-center p-6 bg-gray-700/40 rounded-lg">
                Enter valid 6-digit hex values (e.g. #3b82f6) to see the contrast analysis.
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── Brand Palette Analysis ────────────────────────────────────────── */}
      <SectionCard id="palette-analysis-heading" title="Brand Palette Contrast Analysis">
        {!brandBible ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-5xl mb-3" aria-hidden="true">🎨</p>
            <p className="text-lg font-medium text-gray-400">No brand generated yet</p>
            <p className="text-sm mt-1">
              Use the <strong className="text-gray-300">Brand Generator</strong> tab to create a brand, then return here to analyze your palette automatically.
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-5">
              Each brand color tested as a button or section background with white and black text overlay. WCAG AA requires ≥4.5:1 for normal text and ≥3:1 for large text.
            </p>
            <div className="space-y-4">
              {paletteResults?.map(({ color, whiteText, blackText, recommended }) => (
                <div key={color.hex} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Swatch + info */}
                    <div className="flex items-center gap-3 flex-shrink-0 min-w-[180px]">
                      <div
                        className="w-14 h-14 rounded-xl shadow-lg border border-gray-600 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                        aria-label={`${color.name} color swatch`}
                      />
                      <div>
                        <p className="font-semibold text-white text-sm">{color.name}</p>
                        <p className="font-mono text-gray-400 text-xs mt-0.5">{color.hex.toUpperCase()}</p>
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{color.usage}</p>
                      </div>
                    </div>

                    {/* Contrast results */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* White text on this bg */}
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="inline-block w-3.5 h-3.5 rounded-sm border border-gray-400 bg-white flex-shrink-0" aria-hidden="true" />
                          <span className="text-xs text-gray-400 font-medium">White text on this color</span>
                        </div>
                        <p className="font-mono text-white font-bold text-base">{whiteText?.ratioText ?? 'N/A'}</p>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {whiteText && <PassBadge pass={whiteText.normalAA} label="AA Normal" />}
                          {whiteText && <PassBadge pass={whiteText.largeAA} label="AA Large" />}
                        </div>
                      </div>

                      {/* Black text on this bg */}
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="inline-block w-3.5 h-3.5 rounded-sm border border-gray-500 bg-gray-950 flex-shrink-0" aria-hidden="true" />
                          <span className="text-xs text-gray-400 font-medium">Black text on this color</span>
                        </div>
                        <p className="font-mono text-white font-bold text-base">{blackText?.ratioText ?? 'N/A'}</p>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {blackText && <PassBadge pass={blackText.normalAA} label="AA Normal" />}
                          {blackText && <PassBadge pass={blackText.largeAA} label="AA Large" />}
                        </div>
                      </div>
                    </div>

                    {/* Best text color */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                      <p className="text-xs text-gray-400">Best text</p>
                      <div
                        className="px-4 py-2 rounded-lg font-semibold text-sm shadow-md border border-gray-600"
                        style={{ backgroundColor: color.hex, color: recommended }}
                        aria-label={`Recommended text color on ${color.name}: ${recommended === '#ffffff' ? 'white' : 'black'}`}
                      >
                        {recommended === '#ffffff' ? 'White' : 'Black'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </SectionCard>

      {/* ── WCAG 2.1 AA Checklist ─────────────────────────────────────────── */}
      <SectionCard id="wcag-checklist-heading" title="WCAG 2.1 AA Self-Assessment Checklist">
        <p className="text-gray-400 text-sm mb-6">
          Check off each criterion as you verify it in your website. Pair this self-assessment with automated tools like{' '}
          <strong className="text-gray-300">axe DevTools</strong> or{' '}
          <strong className="text-gray-300">Google Lighthouse</strong> for thorough coverage.
        </p>

        <div className="space-y-6">
          {PRINCIPLES.map(principle => {
            const meta = PRINCIPLE_META[principle];
            const criteria = groupedCriteria[principle] ?? [];
            const doneCount = criteria.filter(c => checked[c.id]).length;

            return (
              <div key={principle} className={`rounded-xl p-4 ${meta.bgClass}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${meta.textClass}`}>
                    <span aria-hidden="true">{meta.icon}</span>
                    {principle}
                  </h3>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${meta.badgeClass}`}>
                    {doneCount}/{criteria.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {criteria.map(criterion => (
                    <div key={criterion.id} className="flex items-start gap-3 group">
                      <input
                        type="checkbox"
                        id={`wcag-${criterion.id}`}
                        checked={!!checked[criterion.id]}
                        onChange={() => toggleChecked(criterion.id)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                      />
                      <label htmlFor={`wcag-${criterion.id}`} className="cursor-pointer flex-1 leading-snug">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-mono text-xs bg-gray-700/80 text-gray-300 px-1.5 py-0.5 rounded font-medium">
                            {criterion.id}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            criterion.level === 'AA'
                              ? 'bg-indigo-900/70 text-indigo-300'
                              : 'bg-gray-700/80 text-gray-400'
                          }`}>
                            Level {criterion.level}
                          </span>
                          <span className={`text-sm font-semibold ${checked[criterion.id] ? 'text-gray-400 line-through' : 'text-white'}`}>
                            {criterion.title}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">{criterion.description}</p>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {checkedCount} of {totalCriteria} criteria marked compliant
          </p>
          {checkedCount > 0 && (
            <button
              type="button"
              onClick={() => setChecked({})}
              className="text-sm text-gray-500 hover:text-red-400 transition-colors"
              aria-label="Reset all checklist items"
            >
              Reset checklist
            </button>
          )}
        </div>
      </SectionCard>

      {/* ── Color Blindness Simulation ────────────────────────────────────── */}
      <SectionCard id="colorblind-sim-heading" title="Color Blindness Simulation">
        <p className="text-gray-400 text-sm mb-5">
          Approximately <strong className="text-gray-300">8% of men</strong> and{' '}
          <strong className="text-gray-300">0.5% of women</strong> have some form of color vision deficiency.
          Your brand should remain distinguishable across all simulations — use contrasting lightness values, not color differences alone.
        </p>
        {!brandBible ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-5xl mb-3" aria-hidden="true">🎨</p>
            <p className="text-lg font-medium text-gray-400">No brand generated yet</p>
            <p className="text-sm mt-1">
              Generate a brand in the <strong className="text-gray-300">Brand Generator</strong> tab to simulate your palette here.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COLOR_BLINDNESS_TYPES.map(({ id, label, filterId, prevalence }) => (
                <div key={id} className="bg-gray-700 rounded-xl p-4">
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-gray-500 text-xs mb-3">{prevalence}</p>
                  <div
                    className="flex gap-1.5 flex-wrap"
                    style={filterId ? { filter: `url(#${filterId})` } : undefined}
                    aria-label={`${label} simulation of brand color palette`}
                  >
                    {brandBible.palette.map(color => (
                      <div
                        key={color.hex}
                        className="flex-1 min-w-[28px] h-12 rounded-lg shadow-sm"
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name} (${color.hex})`}
                      />
                    ))}
                  </div>
                  <div
                    className="flex gap-1.5 flex-wrap mt-1.5"
                    style={filterId ? { filter: `url(#${filterId})` } : undefined}
                    aria-hidden="true"
                  >
                    {brandBible.palette.map(color => (
                      <p key={color.hex} className="flex-1 min-w-[28px] text-center text-xs text-gray-400 truncate"
                        style={{ fontSize: '9px' }}>
                        {color.name.split(' ')[0]}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-4">
              Simulations use Machado, Oliveira &amp; Fernandes (2009) color transformation matrices applied via SVG feColorMatrix filters.
            </p>
          </>
        )}
      </SectionCard>

      {/* ── Resources ─────────────────────────────────────────────────────── */}
      <SectionCard id="ada-resources-heading" title="ADA &amp; WCAG Resources">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'WCAG 2.1 Full Guidelines', desc: 'Official W3C specification', href: 'https://www.w3.org/TR/WCAG21/' },
            { label: 'WebAIM Contrast Checker', desc: 'Online contrast analysis tool', href: 'https://webaim.org/resources/contrastchecker/' },
            { label: 'axe DevTools (Chrome)', desc: 'Free browser accessibility auditor', href: 'https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd' },
            { label: 'WAVE Evaluation Tool', desc: 'Visual web accessibility checker', href: 'https://wave.webaim.org/' },
            { label: 'ADA.gov Web Guidance', desc: 'Official US government ADA guidance', href: 'https://www.ada.gov/resources/web-guidance/' },
            { label: 'Colour Blindness Simulator', desc: 'Coblis — per-image simulation', href: 'https://www.color-blindness.com/coblis-color-blindness-simulator/' },
          ].map(({ label, desc, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition-colors group"
              aria-label={`${label} — opens in a new tab`}
            >
              <p className="text-indigo-400 group-hover:text-indigo-300 font-medium text-sm">{label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
            </a>
          ))}
        </div>
      </SectionCard>

    </div>
  );
};
