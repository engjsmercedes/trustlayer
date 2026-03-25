export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center"><span className="text-white text-sm font-semibold">T</span></div>
            <span className="text-lg font-semibold text-gray-900">TrustLayer</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
