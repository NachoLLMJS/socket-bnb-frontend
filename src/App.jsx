import React, { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { finitePositiveResult, parsePositiveNumber } from './numbers.js'

const HOOKS = {
  dynamic: { name: 'Dynamic fee', color: '#f0a06b', bits: [1, 1, 0, 0, 1, 0], desc: 'Raises the fee when price movement accelerates, then lets it decay while the market is calm.' },
  twap: { name: 'TWAP oracle', color: '#e7db54', bits: [1, 1, 0, 0, 0, 0], desc: 'Writes observations after swaps so applications can read a time-weighted BNB price.' },
  range: { name: 'Range order', color: '#9fbaef', bits: [1, 1, 1, 1, 0, 0], desc: 'Turns one-sided liquidity into a limit-style order that fills across a chosen range.' },
  custom: { name: 'Your hook', color: '#df8ab2', bits: [1, 0, 0, 1, 0, 1], desc: 'A custom extension with explicit permissions and limits fixed when the pool is created.' },
  noop: { name: 'No-op', color: '#b8b5ad', bits: [1, 1, 0, 0, 0, 0], desc: 'A minimal hook for testing the callback path without changing swap behavior.' },
  lock: { name: 'LP lockup', color: '#a3d6b2', bits: [0, 0, 1, 1, 0, 0], desc: 'Enforces a minimum lock period around liquidity deposits and withdrawals.' }
}

const TOKENS = [
  { symbol: 'BNB', name: 'BNB', price: 612.40, color: '#f3ba2f' },
  { symbol: 'USDT', name: 'Tether USD', price: 1, color: '#26a17b' },
  { symbol: 'USDC', name: 'USD Coin', price: 1, color: '#2775ca' },
  { symbol: 'CAKE', name: 'PancakeSwap', price: 2.73, color: '#63b8bd' },
  { symbol: 'ETH', name: 'Ethereum', price: 2461.18, color: '#7b83d8' }
]

const POOLS = [
  { pair: 'BNB / USDT', fee: '0.05%', hook: 'Dynamic fee', tvl: '$12.48m', volume: '$5.31m', apr: '28.4%', color: '#f0a06b' },
  { pair: 'ETH / USDC', fee: '0.30%', hook: 'TWAP oracle', tvl: '$8.92m', volume: '$2.08m', apr: '17.8%', color: '#e7db54' },
  { pair: 'CAKE / BNB', fee: '0.30%', hook: 'Range order', tvl: '$4.16m', volume: '$1.44m', apr: '31.6%', color: '#9fbaef' },
  { pair: 'USDT / USDC', fee: '0.01%', hook: 'No hook', tvl: '$21.04m', volume: '$9.76m', apr: '8.2%', color: '#bbb8ae' },
  { pair: 'ETH / BNB', fee: '0.10%', hook: 'LP lockup', tvl: '$6.33m', volume: '$1.91m', apr: '14.1%', color: '#a3d6b2' }
]

function SocketMark({ compact = false, lit = true }) {
  return <span className={`socket-mark ${compact ? 'compact' : ''}`} aria-hidden="true">
    <i className="key-slot" />
    {[0,1,2,3,4,5].map(i => <i key={i} className={`pin pin-${i} ${lit && [0,2,4].includes(i) ? 'lit' : ''}`} />)}
    <i className="blade blade-a" /><i className="blade blade-b" />
  </span>
}

function Brand({ light = false }) {
  return <Link to="/" className={`brand ${light ? 'light' : ''}`} aria-label="Socket BNB home">
    <span>s</span><SocketMark compact /><span>cket</span><em>bnb</em>
  </Link>
}

function Plug({ hook = 'dynamic', small = false, active = true }) {
  const item = HOOKS[hook]
  return <div className={`plug ${small ? 'small' : ''} ${active ? 'active' : ''}`} style={{ '--plug': item.color }} aria-label={`${item.name} plug`}>
    <div className="plug-cable" />
    <div className="plug-body"><div className="plug-face"><SocketMark compact lit /></div></div>
  </div>
}

function NetworkBadge() {
  return <span className="network-badge"><span className="bnb-diamond">◆</span> BNB Chain</span>
}

function PreviewNotice() {
  return <div className="preview-notice"><span />Frontend preview · contract actions are safely disabled</div>
}

function WalletModal({ onClose }) {
  useEffect(() => {
    const closeOnEscape = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className="modal wallet-modal" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Connect wallet">
      <button className="modal-close" aria-label="Close wallet dialog" onClick={onClose}>×</button>
      <SocketMark />
      <h2>Connect a wallet</h2>
      <p>The wallet adapter will be connected when the BNB contracts and backend are ready.</p>
      {['MetaMask', 'Rabby', 'Binance Wallet', 'WalletConnect'].map(name => <button className="wallet-option" key={name} disabled><span className="wallet-icon">{name[0]}</span>{name}<em>Adapter pending</em></button>)}
      <small>No provider request is made in this frontend-only build.</small>
    </div>
  </div>
}

function SiteHeader({ app = false }) {
  const [menu, setMenu] = useState(false)
  const [wallet, setWallet] = useState(false)
  const location = useLocation()
  useEffect(() => setMenu(false), [location.pathname])
  return <>
    <header className={`site-header ${app ? 'app-header' : ''}`}>
      <Brand />
      {app ? <nav className={`main-nav ${menu ? 'open' : ''}`}>
        <NavLink to="/app" end>Swap</NavLink><NavLink to="/app/pools">Pools</NavLink><NavLink to="/app/positions">Positions</NavLink><NavLink to="/app/create">Create</NavLink>
      </nav> : <nav className={`main-nav ${menu ? 'open' : ''}`}>
        <a href="/#swap">How it works</a><a href="/#permissions">Permissions</a><a href="/#hooks">Hooks</a><Link to="/docs">Docs</Link>
      </nav>}
      <div className="header-actions">{app && <NetworkBadge />}{app ? <button className="dark-button" onClick={() => setWallet(true)}>Connect wallet</button> : <Link className="dark-button" to="/app">Launch app</Link>}</div>
      <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setMenu(!menu)}><i /><i /></button>
    </header>
    {wallet && <WalletModal onClose={() => setWallet(false)} />}
  </>
}

function HookTabs({ selected, onChange, expanded = false }) {
  const keys = expanded ? ['dynamic','twap','range','custom','noop','lock'] : ['dynamic','twap','range','custom']
  return <div className="hook-tabs">{keys.map(key => <button key={key} className={selected === key ? 'active' : ''} style={{ '--hook-color': HOOKS[key].color }} onClick={() => onChange(key)}><span />{HOOKS[key].name}</button>)}</div>
}

function HeroSocket({ hook }) {
  return <div className="hero-device">
    <div className="example-label"><strong>BNB / USDT</strong><span>example pool</span></div>
    <div className="wall-plate"><SocketMark /><div className="plate-caption">{HOOKS[hook].name}</div></div>
    <Plug hook={hook} />
    <div className="price-mini"><span>BNB</span><strong>$612.40</strong><em>0.05% fee</em></div>
  </div>
}

function Landing() {
  const [heroHook, setHeroHook] = useState('dynamic')
  const [swapHook, setSwapHook] = useState('empty')
  const [permissionHook, setPermissionHook] = useState('dynamic')
  const [sealed, setSealed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(28)
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setTime(t => t >= 100 ? 0 : t + 1), 90)
    return () => clearInterval(id)
  }, [playing])
  const active = HOOKS[permissionHook]
  const permissionNumber = active.bits.reduce((n, b, i) => n + b * (2 ** i), 0)
  return <div className="landing">
    <SiteHeader />
    <main>
      <section className="hero section-light" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><NetworkBadge /> programmable liquidity</div>
          <h1>One socket,<br />many plugs.</h1>
          <p>Socket BNB is a concentrated-liquidity interface for BNB Chain. Every pool can take one hook that runs around swaps and liquidity changes, inside limits fixed when the pool is created.</p>
          <div className="button-row"><Link className="dark-button large" to="/app">Launch app <span>↗</span></Link><Link className="text-link" to="/docs">Read the docs <span>→</span></Link></div>
          <small>Click a plug to change the hook.</small>
          <HookTabs selected={heroHook} onChange={setHeroHook} />
        </div>
        <HeroSocket hook={heroHook} />
      </section>

      <section className="swap-story section-dark" id="swap">
        <div className="section-heading light-heading"><div><span className="section-index">01</span><h2>Follow one swap.</h2></div><p>1 BNB for USDT in the example pool. Choose a hook to see what runs before and after the concentrated-liquidity math.</p></div>
        <div className="story-toolbar">
          {['empty','dynamic','twap','range'].map(k => <button className={swapHook === k ? 'active' : ''} key={k} onClick={() => setSwapHook(k)}>{k === 'empty' ? 'Empty' : HOOKS[k].name}</button>)}
        </div>
        <div className="swap-flow">
          {[
            ['01','Router reads the pool','The pool key tells the router which hook, fee tier and tokens belong to this route.'],
            ['02', swapHook === 'empty' ? 'Nothing before the swap' : `${HOOKS[swapHook].name} runs before`, swapHook === 'dynamic' ? 'Recent price movement can adjust this swap’s fee.' : swapHook === 'twap' ? 'The current observation is read before the price changes.' : swapHook === 'range' ? 'Open range orders are checked against the current tick.' : 'No hook call is made.'],
            ['03','The CLMM math runs','1 BNB moves the price through active liquidity. Slippage and minimum output stay visible.'],
            ['04', swapHook === 'empty' ? 'Nothing after the swap' : `${HOOKS[swapHook].name} runs after`, swapHook === 'twap' ? 'A new observation is written with the resulting price.' : swapHook === 'range' ? 'Orders crossed by the new tick update their fill state.' : swapHook === 'dynamic' ? 'Volatility state is updated for the next trade.' : 'No hook call is made.'],
            ['05','Tokens settle once','The full route either settles atomically or reverts.']
          ].map((step, i) => <article key={step[0]} className="flow-step"><span>{step[0]}</span><div className={`flow-dot ${i === 2 ? 'hot' : ''}`} /><h3>{step[1]}</h3><p>{step[2]}</p></article>)}
        </div>
        <div className="receipt"><div><span>Example swap</span><strong>1 BNB → 609.21 USDT</strong></div><div><span>Hook</span><strong>{swapHook === 'empty' ? 'No hook' : HOOKS[swapHook].name}</strong></div><div><span>Network cost</span><strong>Preview</strong></div><em>Settled example</em></div>
      </section>

      <section className="why section-light">
        <div><span className="section-index">02</span><h2>Why a<br />socket</h2><p>New liquidity ideas normally arrive as separate venues. Hooks let one pool architecture accept many kinds of behavior.</p></div>
        <div className="router-diagram"><div className="router-box">Router<br /><strong>aggregator</strong></div><div className="wire-bundle">{[0,1,2,3].map(i => <i key={i} />)}</div><div className="pool-stack">{['Dynamic fee','TWAP oracle','Range order','Your hook'].map((x,i) => <div key={x}><span style={{background:Object.values(HOOKS)[i].color}} />{x}</div>)}</div></div>
        <div className="big-number"><span>Integrations to maintain</span><strong>4</strong><i>→</i><strong>1</strong></div>
      </section>

      <section className="permissions section-cream" id="permissions">
        <div className="section-heading"><div><span className="section-index">03</span><h2>The pins are the<br />permissions.</h2></div><p>A hook can only run at the points encoded by its address and granted by the pool design. Wire a plug and inspect the resulting frontend configuration.</p></div>
        <HookTabs selected={permissionHook} onChange={k => { setPermissionHook(k); setSealed(false) }} expanded />
        <div className="permission-workbench">
          <div className="plug-inspector"><Plug hook={permissionHook} /><div className="bit-readout"><span>permissions</span>{active.bits.slice().reverse().map((b,i) => <b key={i} className={b ? 'on' : ''}>{b}</b>)}<i>=</i><strong>{permissionNumber}</strong></div><p>{active.desc}</p></div>
          <div className="permission-panel">
            <div className="panel-head"><span>Hook configuration</span><strong>{active.name}</strong></div>
            {['Before swap','After swap','Before liquidity','After liquidity','Dynamic fee','Return delta'].map((label,i) => <label className="toggle-row" key={label}><span><strong>{label}</strong><small>{i < 4 ? 'Callback point' : 'Hook power'}</small></span><input type="checkbox" checked={!!active.bits[i]} readOnly /><i /></label>)}
            <label className="range-row">Maximum fee <strong>1.00%</strong><input aria-label="Maximum fee" type="range" min="0" max="10" step=".1" defaultValue="1" disabled={sealed} /></label>
            <button className={`seal-button ${sealed ? 'sealed' : ''}`} onClick={() => setSealed(!sealed)}>{sealed ? 'Configuration sealed' : 'Seal this preview'}<span>{sealed ? '✓' : '→'}</span></button>
            <small>{sealed ? 'The visual configuration is locked until you choose another hook.' : 'No contract transaction is sent.'}</small>
          </div>
        </div>
      </section>

      <section className="hooks-section section-dark" id="hooks">
        <div className="section-heading light-heading"><div><span className="section-index">04</span><h2>Three hooks,<br />built in.</h2></div><p>See the same example afternoon through three different pieces of pool logic. Play the timeline or drag it yourself.</p></div>
        <div className="timeline"><button onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button><strong>{`${12 + Math.floor(time / 25)}:${String((time * 3) % 60).padStart(2,'0')}`}</strong><input type="range" value={time} onChange={e => setTime(Number(e.target.value))} /><span>BNB <b>${(612.4 + Math.sin(time/11)*7).toFixed(2)}</b></span></div>
        <div className="hook-card-grid">
          <HookCard kind="dynamic" time={time} />
          <HookCard kind="range" time={time} />
          <HookCard kind="twap" time={time} />
        </div>
      </section>

      <section className="bounded section-light">
        <div className="section-heading"><div><span className="section-index">05</span><h2>Bounded by<br />the pool.</h2></div><p>Every extension operates inside limits selected at pool creation. If a callback fails, the route can fail closed and choose another pool.</p></div>
        <div className="route-card"><div className="route-node">Router</div><svg viewBox="0 0 800 180" preserveAspectRatio="none"><path d="M80 90 C220 25 300 25 400 65 S590 135 720 90" /><path className="alternate" d="M80 90 C220 155 300 155 400 115 S590 45 720 90" /></svg><div className="route-pool good"><SocketMark compact />Pool A</div><div className="route-pool bad"><span>×</span>Hook failed</div><div className="route-node right">User</div></div>
        <div className="bound-grid"><article><h3>Fail closed</h3><p>An invalid fee, unauthorized delta or failed callback stops the whole route before settlement.</p></article><article><h3>Known gas boundary</h3><p>The quote can estimate the complete swap and display the expected BNB network cost.</p></article><article><h3>One hook per pool</h3><p>Pool identity, fee tier, tokens and hook stay explicit in the route preview.</p></article></div>
      </section>
    </main>
    <SiteFooter />
  </div>
}

function HookCard({ kind, time }) {
  const item = HOOKS[kind]
  const values = Array.from({length: 18}, (_,i) => 34 + Math.sin(i*.74 + time/19) * (kind === 'dynamic' ? 15 : 7) + i*.5)
  const points = values.map((v,i) => `${i*(100/17)},${75-v}`).join(' ')
  return <article className="hook-card" style={{'--hook':item.color}}><header><span /><h3>{item.name}</h3><small>{kind === 'dynamic' ? 'before + after swap' : kind === 'range' ? 'liquidity + swap' : 'after swap observations'}</small></header><svg viewBox="0 0 100 60" preserveAspectRatio="none"><polyline points={points} /></svg><div className="card-metric"><strong>{kind === 'dynamic' ? `${(.05 + time/500).toFixed(2)}%` : kind === 'range' ? `$${(596 + time/3).toFixed(1)}` : `${(610 + time/9).toFixed(2)}`}</strong><span>{kind === 'dynamic' ? 'current fee' : kind === 'range' ? 'order trigger' : '30 min TWAP'}</span></div></article>
}

function SiteFooter() {
  return <footer className="site-footer"><div className="footer-top"><div><Brand light /><p>A frontend concept for programmable concentrated liquidity on BNB Chain.</p><Link className="light-button" to="/app">Launch app</Link></div><div className="footer-links"><div><strong>App</strong><Link to="/app">Swap</Link><Link to="/app/pools">Pools</Link><Link to="/app/positions">Positions</Link><Link to="/app/create">Create a pool</Link></div><div><strong>Developers</strong><Link to="/docs">Documentation</Link><Link to="/docs">Write a hook</Link><Link to="/docs">Routing</Link><Link to="/docs">Addresses</Link></div><div><strong>Resources</strong><a href="#permissions">Permissions</a><a href="#hooks">Hooks</a><Link to="/docs">Security model</Link></div></div></div><div className="footer-word"><span>s</span><SocketMark /><span>cket</span></div><div className="footer-bottom"><span>Frontend preview · October 2026</span><span>BNB Chain concept</span></div></footer>
}

function TokenButton({ token, onClick }) {
  return <button className="token-button" onClick={onClick}><i style={{background: token.color}}>{token.symbol[0]}</i><span>{token.symbol}<small>{token.name}</small></span><b>⌄</b></button>
}

function TokenModal({ onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const shown = TOKENS.filter(t => `${t.symbol} ${t.name}`.toLowerCase().includes(search.toLowerCase()))
  useEffect(() => {
    const closeOnEscape = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal token-modal" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Select a token"><button className="modal-close" aria-label="Close token dialog" onClick={onClose}>×</button><h2>Select a token</h2><input autoFocus placeholder="Search name or symbol" value={search} onChange={e => setSearch(e.target.value)} />{shown.map(t => <button className="token-option" key={t.symbol} onClick={() => onSelect(t)}><i style={{background:t.color}}>{t.symbol[0]}</i><span><strong>{t.symbol}</strong><small>{t.name}</small></span><em>${t.price.toLocaleString()}</em></button>)}</div></div>
}

function AppLayout({ children }) {
  return <div className="app-page"><SiteHeader app /><PreviewNotice /><main className="app-shell">{children}</main><footer className="app-footer"><Brand /><span>Frontend preview · no contracts connected</span><Link to="/docs">Documentation</Link></footer></div>
}

function SwapApp() {
  const [pay, setPay] = useState(TOKENS[0]); const [receive, setReceive] = useState(TOKENS[1]); const [amount, setAmount] = useState('1'); const [selecting, setSelecting] = useState(null); const [slippage, setSlippage] = useState(false); const [route, setRoute] = useState(0)
  const parsedAmount = parsePositiveNumber(amount)
  const quoteNumber = finitePositiveResult(parsedAmount ? parsedAmount * pay.price / receive.price * .995 : 0) || 0
  const fiatValue = finitePositiveResult(parsedAmount ? parsedAmount * pay.price : 0) || 0
  const receiveFiatValue = finitePositiveResult(quoteNumber ? quoteNumber * receive.price : 0) || 0
  const minimumReceived = finitePositiveResult(quoteNumber ? quoteNumber * .995 : 0) || 0
  const amountInvalid = Boolean(amount) && (!parsedAmount || !quoteNumber || !fiatValue || !receiveFiatValue || !minimumReceived)
  const quote = quoteNumber ? quoteNumber.toLocaleString('en-US',{maximumFractionDigits:6}) : ''
  const switchTokens = () => { setPay(receive); setReceive(pay) }
  const routeNames = [`${pay.symbol} / ${receive.symbol} · Dynamic fee`, `${pay.symbol} / ${receive.symbol} · No hook`]
  const selectToken = (side, token) => {
    if (side === 'pay') {
      if (token.symbol === receive.symbol) setReceive(pay)
      setPay(token)
    } else {
      if (token.symbol === pay.symbol) setPay(receive)
      setReceive(token)
    }
    setSelecting(null)
  }
  return <AppLayout><div className="swap-app-grid">
    <section className="trade-card"><header><div><span>Trade</span><h1>Swap</h1></div><button className="slippage" onClick={() => setSlippage(!slippage)}>⚙ {slippage ? 'Auto · 0.5%' : '0.5% slippage'}</button></header>
      <div className={`asset-input ${amountInvalid ? 'invalid' : ''}`}><label>You pay <span>Balance —</span></label><div><input aria-label={`Amount to pay in ${pay.symbol}`} inputMode="decimal" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" aria-invalid={amountInvalid ? 'true' : 'false'} /><TokenButton token={pay} onClick={() => setSelecting('pay')} /></div><small>{amountInvalid ? 'Enter a supported positive decimal amount' : fiatValue ? `≈ $${fiatValue.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}` : '$0.00'}</small></div>
      <button className="switch-button" onClick={switchTokens}>↓</button>
      <div className="asset-input receive"><label>You receive <span>Balance —</span></label><div><input aria-label={`Estimated amount received in ${receive.symbol}`} readOnly value={amountInvalid ? '' : quote} placeholder="0" /><TokenButton token={receive} onClick={() => setSelecting('receive')} /></div><small>{!amountInvalid && receiveFiatValue ? `≈ $${receiveFiatValue.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}` : '$0.00'}</small></div>
      <div className="price-line"><span>1 {pay.symbol}</span><strong>{(pay.price/receive.price).toLocaleString(undefined,{maximumFractionDigits:5})} {receive.symbol}</strong></div>
      <button className="primary-disabled" disabled>Connect wallet to continue</button><small className="safe-note">This control will call the wallet adapter after contracts are connected.</small>
    </section>
    <aside className="route-panel"><header><span>Best route</span><b>Frontend quote</b></header><div className="route-visual"><div className="route-token" style={{background:pay.color}}>{pay.symbol[0]}</div><div className="route-line"><span style={{width:`${45 + route*12}%`}} /></div><div className="route-token" style={{background:receive.color}}>{receive.symbol[0]}</div></div><div className="route-choice">{routeNames.map((name,i)=><button key={name} className={route===i?'active':''} onClick={()=>setRoute(i)}><i /> <span>{name}<small>{i===0?'0.05% fee · best price':'0.30% fee · alternate'}</small></span><b>{route===i?'100%':'0%'}</b></button>)}</div><dl><div><dt>Minimum received</dt><dd>{!amountInvalid && minimumReceived ? minimumReceived.toLocaleString('en-US',{maximumFractionDigits:6}) : '—'} {receive.symbol}</dd></div><div><dt>Price impact</dt><dd>&lt; 0.01%</dd></div><div><dt>Network cost</dt><dd>Available after RPC</dd></div></dl></aside>
  </div>{selecting && <TokenModal onClose={()=>setSelecting(null)} onSelect={token=>selectToken(selecting,token)} />}</AppLayout>
}

function PoolsApp() {
  const [query,setQuery]=useState(''); const [hook,setHook]=useState('All hooks')
  const filtered=POOLS.filter(p=>(p.pair+p.hook).toLowerCase().includes(query.toLowerCase())&&(hook==='All hooks'||p.hook===hook))
  return <AppLayout><section className="list-page"><div className="page-title"><div><span>Discover</span><h1>Pools</h1><p>Explore concentrated-liquidity pools and the hook attached to each market.</p></div><Link className="dark-button large" to="/app/create">Create pool <span>＋</span></Link></div><div className="pool-stats"><article><span>Total value locked</span><strong>$52.93m</strong><small>Example interface data</small></article><article><span>24h volume</span><strong>$20.50m</strong><small>Example interface data</small></article><article><span>Active pools</span><strong>128</strong><small>Indexer pending</small></article></div><div className="filters"><input placeholder="Search token or pool" value={query} onChange={e=>setQuery(e.target.value)} /><select value={hook} onChange={e=>setHook(e.target.value)}>{['All hooks','Dynamic fee','TWAP oracle','Range order','No hook','LP lockup'].map(x=><option key={x}>{x}</option>)}</select></div><div className="pool-table"><div className="pool-row pool-head"><span>Pool</span><span>Hook</span><span>TVL</span><span>24h volume</span><span>APR</span><span /></div>{filtered.map(p=><div className="pool-row" key={p.pair}><span className="pair"><i style={{background:p.color}} /><strong>{p.pair}</strong><small>{p.fee}</small></span><span><b className="hook-pill" style={{'--pill':p.color}}>{p.hook}</b></span><span>{p.tvl}</span><span>{p.volume}</span><span>{p.apr}</span><span><button disabled title="Pool details require the indexer">Preview</button></span></div>)}</div></section></AppLayout>
}

function PositionsApp() {
  const [tab,setTab]=useState('Active')
  const [wallet,setWallet]=useState(false)
  return <AppLayout><section className="list-page positions-page"><div className="page-title"><div><span>Portfolio</span><h1>Positions</h1><p>Your liquidity, fees and hook-specific position state in one place.</p></div><button className="dark-button large" onClick={()=>setWallet(true)}>Connect wallet</button></div><div className="position-summary"><div className="portfolio-ring"><SocketMark /><span>Portfolio value</span><strong>—</strong></div><dl><div><dt>Unclaimed fees</dt><dd>—</dd></div><div><dt>Active positions</dt><dd>—</dd></div><div><dt>Range orders</dt><dd>—</dd></div></dl></div><div className="tab-row">{['Active','Closed','Range orders'].map(t=><button className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div><div className="empty-state"><div className="empty-socket"><SocketMark lit={false}/><Plug hook={tab==='Range orders'?'range':'dynamic'} small active={false}/></div><h2>Connect to view {tab.toLowerCase()}</h2><p>Position reads will appear here once a wallet and BNB indexer are connected.</p><button className="dark-button large" onClick={()=>setWallet(true)}>Connect wallet</button></div></section>{wallet&&<WalletModal onClose={()=>setWallet(false)}/>}</AppLayout>
}

function CreatePoolApp() {
  const [step,setStep]=useState(1); const [a,setA]=useState(TOKENS[0]); const [b,setB]=useState(TOKENS[1]); const [hook,setHook]=useState('dynamic'); const [selecting,setSelecting]=useState(null); const [fee,setFee]=useState('.30'); const [price,setPrice]=useState('612.40')
  const parsedPrice = parsePositiveNumber(price)
  const selectPoolToken = (side, token) => {
    if (side === 'a') {
      if (token.symbol === b.symbol) setB(a)
      setA(token)
    } else {
      if (token.symbol === a.symbol) setA(b)
      setB(token)
    }
    setSelecting(null)
  }
  return <AppLayout><section className="create-page"><div className="create-title"><span>New market</span><h1>Create a pool</h1><p>Configure the market, hook and initial price. Deployment stays disabled until contracts are connected.</p></div><div className="stepper">{['Tokens','Fee + hook','Review'].map((x,i)=><button key={x} disabled={i+1>step} className={step===i+1?'active':step>i+1?'done':''} onClick={()=>setStep(i+1)}><i>{step>i+1?'✓':i+1}</i><span>{x}</span></button>)}</div><div className="create-grid"><div className="create-card">
    {step===1&&<><header><span>Step 1</span><h2>Choose the pair</h2></header><div className="token-pair-select"><TokenButton token={a} onClick={()=>setSelecting('a')} /><span>＋</span><TokenButton token={b} onClick={()=>setSelecting('b')} /></div><label className={`form-label ${price && !parsedPrice ? 'invalid' : ''}`}>Starting price <span>{b.symbol} per {a.symbol}</span><input inputMode="decimal" min="0" value={price} aria-invalid={price && !parsedPrice ? 'true' : 'false'} onChange={event=>setPrice(event.target.value)} />{price && !parsedPrice && <small>Enter a finite positive price</small>}</label><button className="dark-button wide" disabled={!parsedPrice} onClick={()=>setStep(2)}>Continue <span>→</span></button></>}
    {step===2&&<><header><span>Step 2</span><h2>Set fee and hook</h2></header><div className="fee-options">{['.01','.05','.30','1.00'].map(f=><button key={f} className={fee===f?'active':''} onClick={()=>setFee(f)}><strong>{f}%</strong><small>{f==='.05'?'Recommended':'Fee tier'}</small></button>)}</div><HookTabs selected={hook} onChange={setHook} expanded /><div className="selected-hook"><Plug hook={hook} small/><div><strong>{HOOKS[hook].name}</strong><p>{HOOKS[hook].desc}</p></div></div><button className="dark-button wide" onClick={()=>setStep(3)}>Review configuration <span>→</span></button></>}
    {step===3&&<><header><span>Step 3</span><h2>Review the pool</h2></header><div className="review-socket"><div><SocketMark /><Plug hook={hook} small /></div><strong>{a.symbol} / {b.symbol}</strong><span>{fee}% · {HOOKS[hook].name}</span></div><dl className="review-list"><div><dt>Network</dt><dd>BNB Chain</dd></div><div><dt>Starting price</dt><dd>{parsedPrice?.toLocaleString('en-US',{maximumFractionDigits:18})} {b.symbol} per {a.symbol}</dd></div><div><dt>Hook permissions</dt><dd>{HOOKS[hook].bits.join('')}</dd></div><div><dt>Deployment</dt><dd>Contracts pending</dd></div></dl><button className="primary-disabled" disabled>Connect contracts to deploy</button><small className="safe-note">No transaction can be sent from this frontend preview.</small></>}
  </div><aside className="creation-preview"><span>Pool preview</span><div className="preview-plate"><SocketMark /><Plug hook={hook}/></div><h3>{a.symbol} / {b.symbol}</h3><p>{fee}% fee · {HOOKS[hook].name}</p><div className="preview-bits">{HOOKS[hook].bits.map((bit,i)=><i className={bit?'on':''} key={i}>{bit}</i>)}</div></aside></div>{selecting&&<TokenModal onClose={()=>setSelecting(null)} onSelect={token=>selectPoolToken(selecting,token)}/>}</section></AppLayout>
}

function Docs() {
  const [topic,setTopic]=useState('Introduction')
  const topics=['Introduction','How it works','Hooks and permissions','Dynamic fee','TWAP oracle','Range order','Create a pool','Route a swap','Security boundary']
  return <div className="docs-page"><SiteHeader app/><PreviewNotice/><div className="docs-layout"><aside className="docs-sidebar"><span>Socket BNB docs</span>{topics.map(t=><button key={t} className={topic===t?'active':''} onClick={()=>setTopic(t)}>{t}</button>)}</aside><article className="docs-article"><span className="docs-kicker">Documentation · BNB Chain</span><h1>{topic}</h1><p className="lead">{topic==='Introduction'?'A frontend specification for concentrated-liquidity pools with one explicit extension hook per market.':`Product and integration notes for ${topic.toLowerCase()} in the Socket BNB interface.`}</p><div className="docs-callout"><strong>Frontend status</strong><p>This build contains complete product flows and deterministic interface data. Contract addresses, RPC reads, indexer responses and wallet writes have not been connected.</p></div><h2 id="design-principles">Design principles</h2><p>Every pool exposes its token pair, fee tier and hook before a user signs. The interface keeps extension behavior visible throughout quoting, liquidity management and pool creation.</p><ul><li>One hook identity is shown for each pool.</li><li>Permission flags are readable before deployment.</li><li>Unavailable writes fail closed instead of producing fake success.</li><li>BNB network fees and transaction state remain pending until live RPC data exists.</li></ul><h2 id="integration-boundary">Integration boundary</h2><div className="code-block"><span>PoolKey</span><pre>{`{
  currency0: "0x…",
  currency1: "0x…",
  fee: 3000,
  tickSpacing: 60,
  hooks: "0x…"
}`}</pre></div><p>The future backend should provide token metadata, indexed pools, position state and historical charts. The future wallet layer should be user-initiated and should never request accounts during initial page load.</p><h2 id="next-implementation-step">Next implementation step</h2><p>Connect read-only BNB Chain RPC calls first, then add quoting and simulation. Contract writes should only be enabled after addresses, ABIs, chain configuration and transaction error states have been verified.</p></article><aside className="docs-toc"><strong>On this page</strong><a href="#design-principles">Design principles</a><a href="#integration-boundary">Integration boundary</a><a href="#next-implementation-step">Next implementation step</a></aside></div></div>
}

function NotFound(){return <div className="not-found"><SocketMark/><h1>Nothing plugged in here.</h1><Link className="dark-button large" to="/">Back home</Link></div>}

export default function App(){
  return <Routes><Route path="/" element={<Landing/>}/><Route path="/app" element={<SwapApp/>}/><Route path="/app/pools" element={<PoolsApp/>}/><Route path="/app/positions" element={<PositionsApp/>}/><Route path="/app/create" element={<CreatePoolApp/>}/><Route path="/docs" element={<Docs/>}/><Route path="*" element={<NotFound/>}/></Routes>
}
