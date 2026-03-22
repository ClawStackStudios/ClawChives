import { createContext, useContext, useEffect, useState } from "react"
import { flushSync } from "react-dom"

export type Theme = "dark" | "light" | "auto"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme, clientX?: number, clientY?: number) => void
}

const initialState: ThemeProviderState = {
  theme: "auto",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "auto",
  storageKey = "cc_theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (sessionStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    updateDomTheme(theme)
  }, [theme]) // Update DOM whenever theme changes

  const updateDomTheme = (newTheme: Theme) => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    if (newTheme === "auto") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(newTheme)
    }
  }

  const setThemeWithTransition = async (newTheme: Theme, clientX?: number, clientY?: number) => {
    sessionStorage.setItem(storageKey, newTheme)

    // Fallback if no view transition support or no coordinates
    // @ts-ignore
    if (!document.startViewTransition || clientX === undefined || clientY === undefined) {
      updateDomTheme(newTheme)
      setThemeState(newTheme)
      return
    }

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        updateDomTheme(newTheme)
        setThemeState(newTheme)
      })
    })

    await transition.ready

    const right = window.innerWidth - clientX
    const bottom = window.innerHeight - clientY
    const maxRadius = Math.hypot(Math.max(clientX, right), Math.max(clientY, bottom))

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${clientX}px ${clientY}px)`,
          `circle(${maxRadius}px at ${clientX}px ${clientY}px)`,
        ],
      },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  }

  const value = {
    theme,
    setTheme: setThemeWithTransition,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
