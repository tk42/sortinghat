import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// こちらは、Tailwind の clsx と同じ処理を行うため、独自の関数として定義している
export function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}