import { InputHTMLAttributes, forwardRef } from "react"
import clsx from "clsx"

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">{label}</label>
        <input
          ref={ref}
          className={clsx(
            "h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition",
            "placeholder:text-white/30",
            "focus:border-white/20 focus:bg-white/[0.07] focus:ring-2 focus:ring-white/10",
            error && "border-red-400/40 focus:border-red-400/50 focus:ring-red-400/10",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : null}
      </div>
    )
  }
)

AuthInput.displayName = "AuthInput"

export default AuthInput