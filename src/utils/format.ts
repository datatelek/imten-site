// Утилиты форматирования цифр и валют

export function formatRub(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return value.toFixed(digits).replace(".", ",") + " %";
}
