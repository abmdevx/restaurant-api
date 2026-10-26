import { useContext } from 'react'
import { ThemeContext } from '../context/themeContext'

export function useTheme() {
  return useContext(ThemeContext)
}
