import fs from 'node:fs'
import { finitePositiveResult, parsePositiveNumber } from '../src/numbers.js'

const app = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const css = fs.readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const requiredRoutes = ['path="/app"', 'path="/app/pools"', 'path="/app/positions"', 'path="/app/create"', 'path="/docs"']
const requiredCopy = ['BNB Chain', 'Dynamic fee', 'TWAP oracle', 'Range order', 'Connect wallet', 'Frontend preview']
for (const item of [...requiredRoutes, ...requiredCopy]) {
  if (!app.includes(item)) throw new Error(`Missing required app marker: ${item}`)
}
for (const item of ['@media', '.socket-mark', '.plug', '.app-shell', '.mobile-menu']) {
  if (!css.includes(item)) throw new Error(`Missing required CSS marker: ${item}`)
}
if (/eth_requestAccounts|sendTransaction|writeContract|privateKey|mnemonic/i.test(app)) {
  throw new Error('Frontend-only build must not contain wallet RPC writes or secrets')
}
if (/onClick=\{\(\)=>\{\}\}/.test(app)) {
  throw new Error('No-op click handlers are not allowed')
}
for (const item of ['routeNames', 'selectToken', 'selectPoolToken', 'value={price}', 'primary-disabled\" disabled', 'Adapter pending']) {
  if (!app.includes(item)) throw new Error(`Missing frontend safety behavior: ${item}`)
}
for (const invalid of ['', 'abc', '-1', '0', '1e309', '1e308', '0x10', 'Infinity', 'NaN']) {
  if (parsePositiveNumber(invalid) !== null) throw new Error(`Expected invalid positive number: ${invalid}`)
}
for (const valid of ['0.0001', '1', '612.40']) {
  if (parsePositiveNumber(valid) === null) throw new Error(`Expected valid positive number: ${valid}`)
}
for (const item of ['parsePositiveNumber(amount)', 'parsePositiveNumber(price)', 'disabled={i+1>step}', 'disabled={!parsedPrice}']) {
  if (!app.includes(item)) throw new Error(`Missing numeric validation behavior: ${item}`)
}
for (const item of ['disabled={sealed}', "route===i?'100%':'0%'", 'aria-label={`Amount to pay in ${pay.symbol}`}', 'href="#design-principles"', 'id="integration-boundary"']) {
  if (!app.includes(item)) throw new Error(`Missing interaction or accessibility behavior: ${item}`)
}
if (finitePositiveResult(Number.MAX_VALUE * 2) !== null) throw new Error('Overflow result must be rejected')
if (finitePositiveResult(1.25) !== 1.25) throw new Error('Finite positive result must be accepted')
console.log('Frontend structure check passed')
