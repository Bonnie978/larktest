export default function Header() {
  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-text-primary font-medium text-[15px]">杭州智造工厂</span>
        <span className="text-border mx-1">|</span>
        <span className="text-text-tertiary text-sm">白班 08:00–16:00</span>
      </div>
      <div className="flex items-center gap-5">
        <button className="relative text-text-tertiary hover:text-text-primary transition-colors" title="通知">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-danger rounded-full"></span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
            管
          </div>
          <span className="text-sm text-text-secondary">管理员</span>
        </div>
      </div>
    </header>
  );
}
