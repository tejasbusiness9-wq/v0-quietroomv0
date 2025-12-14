export const RainyEnvironment = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900">
      <div className="absolute inset-0 opacity-30">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-8 bg-blue-200 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
