import { useState, useEffect, type ChangeEvent } from "react"
import { Input } from "./input"

interface MoneyInputProps {
  value: number
  onChange: (value: number) => void
}

export function MoneyInput({ value, onChange }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState("")

  // Sincroniza o valor inicial ou as limpezas do formulário
  useEffect(() => {
    if (value === 0) {
      setDisplayValue("")
      return
    }
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
    
    setDisplayValue(formatted)
  }, [value])

  const handleFormat = (e: ChangeEvent<HTMLInputElement>) => {
    // Remove tudo o que não for número (ex: R$, pontos e vírgulas)
    const rawValue = e.target.value.replace(/\D/g, "")
    
    if (!rawValue) {
      onChange(0)
      setDisplayValue("")
      return
    }

    // Divide por 100 para colocar os cêntimos no sítio certo (ex: 1500 vira 15.00)
    const numericValue = Number(rawValue) / 100
    onChange(numericValue)
    
    // Formata visualmente para R$
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue)
    
    setDisplayValue(formatted)
  }

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleFormat}
      placeholder="R$ 0,00"
    />
  )
}