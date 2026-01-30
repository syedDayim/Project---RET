export interface Roommate {
  id: string
  name: string
  addedAt: string
}

export interface Expense {
  id: string
  paidBy: string // roommate id
  amount: number
  currency: string
  involved: string[] // roommate ids (including payer)
  note?: string
  createdAt: string
}

export interface Debt {
  from: string // roommate id who owes
  to: string // roommate id who is owed
  amount: number
}
