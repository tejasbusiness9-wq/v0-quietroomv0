export const CoffeeShopEnvironment = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-amber-100 via-orange-200 to-amber-300">
      {/* Add warm coffee shop ambiance with overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 via-transparent to-orange-100/10" />

      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/4 w-96 h-full bg-gradient-to-b from-yellow-200/10 to-transparent blur-3xl" />
      <div className="absolute top-0 right-1/3 w-80 h-full bg-gradient-to-b from-orange-200/10 to-transparent blur-3xl" />
    </div>
  )
}
