import { useEffect, useMemo, useState } from "react";
import { Button, ThemeProvider } from "@toss/tds-mobile";
import "./App.css";
import { calculateFire } from "./shared/fire";
import type { FireInput, FireResult, LabState } from "./shared/types";

const DEFAULT_INPUT: FireInput = { currentAge: 30, currentAssets: 50_000_000, monthlyInvestment: 1_500_000, annualReturn: 0.07, monthlyExpenses: 3_000_000, withdrawalRate: 0.04 };
const INITIAL_LAB: LabState = { schemaVersion: 1, xp: 0, streak: { current: 0, best: 0, lastDate: "" } };
const STORAGE_KEY = "fire-lab-v1";
const won = new Intl.NumberFormat("ko-KR");
const formatWon = (value: number) => `${won.format(Math.round(value))}원`;
const shortWon = (value: number) => value >= 100_000_000 ? `${(value / 100_000_000).toFixed(value % 100_000_000 ? 1 : 0)}억원` : value >= 10_000 ? `${won.format(Math.round(value / 10_000))}만원` : formatWon(value);
const duration = (months: number | null) => months === null ? "100년 이후" : months === 0 ? "이미 달성" : `${Math.floor(months / 12) ? `${Math.floor(months / 12)}년 ` : ""}${months % 12 ? `${months % 12}개월` : ""}`.trim();
const labStage = (p: number) => p >= 1 ? { step: 6, name: "FIRE 결정 완성", color: "#ffb229" } : p >= .75 ? { step: 5, name: "정제", color: "#8b5cf6" } : p >= .5 ? { step: 4, name: "결정 성장", color: "#4f7cff" } : p >= .25 ? { step: 3, name: "촉매 활성", color: "#22b8a7" } : p >= .1 ? { step: 2, name: "첫 반응", color: "#55c2ff" } : { step: 1, name: "시약 준비", color: "#9adfff" };

function loadSaved() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"); } catch { return null; } }

function App() {
  const [saved] = useState(loadSaved);
  const [tab, setTab] = useState<"calculator" | "lab">("calculator");
  const [input, setInput] = useState<FireInput>(saved?.input ?? DEFAULT_INPUT);
  const [lab, setLab] = useState<LabState>(saved?.lab?.schemaVersion === 1 ? saved.lab : INITIAL_LAB);
  const [result, setResult] = useState<FireResult>(() => calculateFire(input));
  const [scenarioAdd, setScenarioAdd] = useState(500_000);
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify({ input, lab })), [input, lab]);
  const scenario = useMemo(() => calculateFire({ ...input, monthlyInvestment: input.monthlyInvestment + scenarioAdd }), [input, scenarioAdd]);
  const stage = labStage(result.progress);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const checkedToday = lab.streak.lastDate === today;
  const changeInput = (key: keyof FireInput, value: number) => setInput((current) => ({ ...current, [key]: Math.max(0, value) }));
  const completeExperiment = () => {
    if (checkedToday) return;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    setLab((current) => { const next = current.streak.lastDate === yesterdayKey ? current.streak.current + 1 : 1; return { ...current, xp: current.xp + 10, streak: { current: next, best: Math.max(current.streak.best, next), lastDate: today } }; });
  };
  return <ThemeProvider><main className="app" data-testid="fire-lab">
    <header className="topbar"><div className="brand-mark">F</div><div><strong>FIRE 실험실</strong><span>경제적 자유 시뮬레이터</span></div></header>
    {tab === "calculator" ? <Calculator input={input} result={result} scenario={scenario} scenarioAdd={scenarioAdd} onInput={changeInput} onCalculate={() => setResult(calculateFire(input))} onScenario={setScenarioAdd} onStartLab={() => setTab("lab")} /> : <Lab result={result} stage={stage} lab={lab} checkedToday={checkedToday} onComplete={completeExperiment} onEdit={() => setTab("calculator")} />}
    <nav className="bottom-nav"><button className={tab === "lab" ? "active" : ""} onClick={() => setTab("lab")}><span>⚗</span>실험실</button><button className={tab === "calculator" ? "active" : ""} onClick={() => setTab("calculator")}><span>⌁</span>계산기</button></nav>
  </main></ThemeProvider>;
}

interface CalculatorProps { input: FireInput; result: FireResult; scenario: FireResult; scenarioAdd: number; onInput: (key: keyof FireInput, value: number) => void; onCalculate: () => void; onScenario: (value: number) => void; onStartLab: () => void; }
function Calculator({ input, result, scenario, scenarioAdd, onInput, onCalculate, onScenario, onStartLab }: CalculatorProps) {
  const reduced = result.monthsToFire !== null && scenario.monthsToFire !== null ? Math.max(0, result.monthsToFire - scenario.monthsToFire) : null;
  return <div className="page-content">
    <section className="hero"><span className="eyebrow">FIRE CALCULATOR</span><h1>나는 언제 경제적 자유를<br />달성할 수 있을까?</h1><p>현재 자산과 투자 계획으로 예상 FIRE 시점을 실험해 보세요.</p></section>
    <section className="card input-card"><Title step="STEP 1" title="나의 FIRE 조건" note="금액은 원 단위로 입력해 주세요." /><div className="input-grid">
      <NumberField label="현재 나이" value={input.currentAge} unit="세" min={18} max={70} onChange={(v) => onInput("currentAge", v)} />
      <NumberField label="현재 투자 가능 자산" value={input.currentAssets} unit="원" hint={shortWon(input.currentAssets)} onChange={(v) => onInput("currentAssets", v)} />
      <NumberField label="월 투자금" value={input.monthlyInvestment} unit="원" hint={shortWon(input.monthlyInvestment)} onChange={(v) => onInput("monthlyInvestment", v)} />
      <NumberField label="은퇴 후 월 생활비" value={input.monthlyExpenses} unit="원" hint={shortWon(input.monthlyExpenses)} min={1} onChange={(v) => onInput("monthlyExpenses", v)} />
      <RangeField label="예상 연수익률" value={input.annualReturn * 100} min={0} max={15} step={.5} onChange={(v) => onInput("annualReturn", v / 100)} />
      <RangeField label="안전 인출률" value={input.withdrawalRate * 100} min={2} max={6} step={.5} onChange={(v) => onInput("withdrawalRate", v / 100)} />
    </div><Button className="tds-primary" size="large" display="block" onClick={onCalculate}>FIRE 계산하기</Button></section>
    <section className="results-section"><Title step="STEP 2" title="예상 결과" /><div className="result-hero"><span>예상 FIRE 나이</span><strong>{result.fireAge ? `만 ${result.fireAge.years}세 ${result.fireAge.months}개월` : "100세 이후"}</strong><p>{result.monthsToFire === 0 ? "이미 FIRE 조건을 충족했어요" : `${duration(result.monthsToFire)} 뒤 · ${result.fireDate ?? "현재 조건으로 미도달"}`}</p></div><div className="stat-grid"><article><span>목표 FIRE 자산</span><strong>{shortWon(result.targetAssets)}</strong></article><article><span>현재 달성률</span><strong>{(result.progress * 100).toFixed(1)}%</strong></article></div><GrowthChart result={result} /></section>
    <section className="card scenario-card"><Title step="WHAT IF" title="조금 더 투자한다면?" /><div className="chip-row">{[100_000,300_000,500_000].map((a) => <Button key={a} size="small" display="block" variant="weak" color={scenarioAdd === a ? "primary" : "light"} onClick={() => onScenario(a)}>+{a/10_000}만원</Button>)}</div><div className="scenario-result"><div><span>변경 후 FIRE 나이</span><strong>{scenario.fireAge ? `만 ${scenario.fireAge.years}세 ${scenario.fireAge.months}개월` : "100세 이후"}</strong></div><p>{reduced && reduced > 0 ? `FIRE가 ${duration(reduced)} 빨라져요` : "현재 조건과 달성 시점이 같아요"}</p></div></section>
    <Button className="lab-cta" size="large" display="block" color="dark" onClick={onStartLab}><span>⚗</span><span className="lab-cta-copy"><strong>실험실 시작하기</strong><small>매일의 행동으로 FIRE 날짜를 앞당겨 보세요</small></span><b>›</b></Button><Disclaimer />
  </div>;
}

function Title({ step, title, note }: { step: string; title: string; note?: string }) { return <div className="section-title"><div><span>{step}</span><h2>{title}</h2></div>{note && <p>{note}</p>}</div>; }
function NumberField({ label, value, unit, hint, min=0, max, onChange }: { label:string; value:number; unit:string; hint?:string; min?:number; max?:number; onChange:(v:number)=>void }) { return <label className="field"><span>{label}</span><div className="field-control"><input type="text" inputMode="numeric" value={won.format(value)} onChange={(e)=>onChange(Number(e.target.value.replace(/\D/g,""))||0)} onBlur={()=>onChange(Math.min(max??Infinity,Math.max(min,value)))} /><b>{unit}</b></div>{hint&&<small>{hint}</small>}</label>; }
function RangeField({ label,value,min,max,step,onChange }:{label:string;value:number;min:number;max:number;step:number;onChange:(v:number)=>void}) { const display=Math.round(value*10)/10; return <label className="field range-field"><span>{label}</span><div className="range-value"><strong>{display}</strong>%</div><input type="range" value={display} min={min} max={max} step={step} onChange={(e)=>onChange(Number(e.target.value))}/><div className="range-labels"><small>{min}%</small><small>{max}%</small></div></label>; }

function GrowthChart({ result }: { result: FireResult }) {
  const points=result.projectedAssets, max=Math.max(result.targetAssets,...points.map(p=>p.assets),1);
  const path=points.map((p,i)=>`${i===0?"M":"L"}${(points.length===1?16:16+i/(points.length-1)*288).toFixed(1)},${(142-p.assets/max*112).toFixed(1)}`).join(" ");
  const targetY=142-result.targetAssets/max*112;
  return <div className="chart-card"><div><strong>자산 성장 예상</strong><span>월 복리 기준</span></div><svg viewBox="0 0 320 165" role="img" aria-label="예상 자산 성장 그래프">{[30,67,104,142].map(y=><line key={y} x1="16" y1={y} x2="304" y2={y} className="grid-line"/>)}<line x1="16" y1={targetY} x2="304" y2={targetY} className="target-line"/><text x="20" y={Math.max(14,targetY-5)}>목표 {shortWon(result.targetAssets)}</text><path d={`${path} L304,142 L16,142 Z`} className="area"/><path d={path} className="line"/></svg><div className="chart-axis"><span>현재 만 {Math.floor(points[0]?.age??0)}세</span><span>{result.fireAge?`만 ${result.fireAge.years}세`:"100년 후"}</span></div></div>;
}

function Lab({result,stage,lab,checkedToday,onComplete,onEdit}:{result:FireResult;stage:ReturnType<typeof labStage>;lab:LabState;checkedToday:boolean;onComplete:()=>void;onEdit:()=>void}) {
  const h=Math.max(7,result.progress*72);
  return <div className="page-content lab-page"><section className="lab-heading"><span className="eyebrow">MY FIRE LAB</span><h1>오늘도 한 번,<br/>경제적 자유에 가까워져요</h1><Button size="small" variant="weak" color="light" onClick={onEdit}>조건 수정</Button></section><section className="flask-card"><div className="lab-status"><span>실험 단계 {stage.step}/6</span><strong>{stage.name}</strong><small>FIRE 달성률 {(result.progress*100).toFixed(1)}%</small></div><div className="flask-wrap"><div className="bubble b1"/><div className="bubble b2"/><div className="bubble b3"/><svg className="flask" viewBox="0 0 180 220"><defs><clipPath id="flaskClip"><path d="M70 18h40v61l45 89c10 20-2 36-24 36H49c-22 0-34-16-24-36l45-89V18Z"/></clipPath></defs><path d="M70 18h40v61l45 89c10 20-2 36-24 36H49c-22 0-34-16-24-36l45-89V18Z" className="flask-glass"/><rect x="15" y={204-h*1.85} width="150" height={h*1.85} fill={stage.color} clipPath="url(#flaskClip)" className="liquid"/><path d="M63 18h54" className="flask-rim"/><circle cx="72" cy="166" r="5" fill="#fff" opacity=".7"/><circle cx="115" cy="181" r="3" fill="#fff" opacity=".55"/></svg></div><div className="progress-track"><div style={{width:`${result.progress*100}%`,background:stage.color}}/></div><p>목표 {shortWon(result.targetAssets)} 중 <strong>{shortWon(Math.min(result.targetAssets,result.projectedAssets[0]?.assets??0))}</strong></p></section><section className="lab-metrics"><article><span>🔥</span><strong>{lab.streak.current}일</strong><small>연속 실험</small></article><article><span>⚡</span><strong>{lab.xp} XP</strong><small>연구 점수</small></article><article><span>📅</span><strong>{duration(result.monthsToFire)}</strong><small>FIRE까지</small></article></section><section className="card quest-card"><div><span className="quest-label">오늘의 실험 · 10초</span><h2>소비 한 번 멈추고<br/>투자할 금액을 지켜냈나요?</h2><p>작은 선택도 꾸준히 기록하면 변화가 보여요.</p></div><Button className={checkedToday?"complete":""} size="large" display="block" onClick={onComplete} disabled={checkedToday}>{checkedToday?"오늘 실험 완료 ✓":"오늘 실험 완료"}</Button></section><Disclaimer/></div>;
}
function Disclaimer(){return <p className="disclaimer">본 결과는 입력값을 기반으로 한 단순 시뮬레이션이며 실제 투자수익이나 은퇴 가능 시점을 보장하지 않습니다. 투자 및 재무 의사결정은 개인의 상황을 고려해 판단해야 합니다.</p>;}
export default App;
