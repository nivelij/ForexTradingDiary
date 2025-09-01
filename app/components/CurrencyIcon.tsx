import Image from "next/image"

interface CurrencyIconProps {
  currencyPair: string
  className?: string
  size?: number
}

export function CurrencyIcon({ currencyPair, className = "", size = 24 }: CurrencyIconProps) {
  const iconPath = `/svg/${currencyPair}.svg`
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Image
        src={iconPath}
        alt={`${currencyPair} icon`}
        width={size}
        height={size}
        className="object-contain"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )
}