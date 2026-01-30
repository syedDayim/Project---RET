import type { Expense, Roommate, Debt } from '../types'

/**
 * For each expense: paidBy paid `amount`, split among `involved`.
 * Each involved person owes paidBy (amount / involved.length); payer's share is 0.
 * Then net debts between each pair into a single "who owes whom" list.
 */
export function computeDebts(expenses: Expense[], roommates: Roommate[]): Debt[] {
  const idToName = new Map(roommates.map((r) => [r.id, r.name]))
  // net[from][to] = amount that "from" owes "to"
  const net: Map<string, Map<string, number>> = new Map()

  function addDebt(from: string, to: string, amount: number): void {
    if (from === to || amount <= 0) return
    if (!net.has(from)) net.set(from, new Map())
    const m = net.get(from)!
    m.set(to, (m.get(to) ?? 0) + amount)
  }

  for (const e of expenses) {
    const share = e.amount / e.involved.length
    for (const id of e.involved) {
      if (id !== e.paidBy) addDebt(id, e.paidBy, share)
    }
  }

  // For each pair (A,B), keep only net: A owes B (x) and B owes A (y) -> one debt of |x-y|
  const seen = new Set<string>()
  const debts: Debt[] = []

  for (const [from, toMap] of net) {
    for (const [to, amount] of toMap) {
      if (amount <= 0) continue
      const pairKey = [from, to].sort().join('|')
      if (seen.has(pairKey)) continue
      seen.add(pairKey)

      const reverse = net.get(to)?.get(from) ?? 0
      const netAmount = amount - reverse
      if (netAmount === 0) continue

      const [debtor, creditor, amt] =
        netAmount > 0 ? [from, to, netAmount] : [to, from, -netAmount]
      if (idToName.has(debtor) && idToName.has(creditor)) {
        debts.push({ from: debtor, to: creditor, amount: amt })
      }
    }
  }

  return debts
}
