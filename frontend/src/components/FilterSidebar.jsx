import React from 'react';

function SectionLabel({ label, icon }) {
    return (
        <div className="flex items-center space-x-2 mb-3">
            {icon && <span className="text-[#E5C878] opacity-80">{icon}</span>}
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">{label}</h3>
        </div>
    );
}

function Divider() {
    return <div className="h-px my-4" style={{ background: 'rgba(255,255,255,0.05)' }} />;
}

export default function FilterSidebar({
    marketplaces = [],
    selectedMarketplaces = [],
    setSelectedMarketplaces = () => {},
    maxPriceLimit = 250000,
    priceRange = 250000,
    setPriceRange = () => {},
    sortBy = 'default',
    setSortBy = () => {},
    verifiedOnly = false,
    setVerifiedOnly = () => {},
    inBudgetOnly = false,
    setInBudgetOnly = () => {},
    hasBudget = false,
}) {
    const toggleMarketplace = (store) => {
        setSelectedMarketplaces(
            selectedMarketplaces.includes(store)
                ? selectedMarketplaces.filter(s => s !== store)
                : [...selectedMarketplaces, store]
        );
    };

    const activeFilterCount = [
        verifiedOnly,
        inBudgetOnly,
        selectedMarketplaces.length > 0,
        priceRange < maxPriceLimit,
        sortBy !== 'default',
    ].filter(Boolean).length;

    const clearAll = () => {
        setSelectedMarketplaces([]);
        setPriceRange(maxPriceLimit);
        setSortBy('default');
        setVerifiedOnly(false);
        setInBudgetOnly(false);
    };

    const sortOptions = [
        { id: 'default', label: 'Relevance' },
        { id: 'price-asc', label: 'Price ↑' },
        { id: 'price-desc', label: 'Price ↓' },
    ];

    return (
        <div className="space-y-1 text-white">

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-[#E5C878]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <h2 className="text-sm font-bold text-white font-display">
                        Filters
                    </h2>
                    {activeFilterCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-[#09090B] bg-gradient-to-b from-[#F5E6B3] to-[#E5C878]">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                {activeFilterCount > 0 && (
                    <button onClick={clearAll}
                        className="text-[10px] text-zinc-400 hover:text-[#F3E5AB] transition-colors font-medium">
                        Clear all
                    </button>
                )}
            </div>

            <Divider />

            <div>
                <SectionLabel label="Sort By" />
                <div className="flex flex-wrap gap-1.5">
                    {sortOptions.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setSortBy(opt.id)}
                            className="flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg transition-all duration-200"
                            style={sortBy === opt.id ? {
                                background: 'rgba(229, 200, 120, 0.15)',
                                border: '1px solid rgba(229, 200, 120, 0.4)',
                                color: '#F3E5AB',
                            } : {
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                color: '#a1a1aa',
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <Divider />

            <div>
                <SectionLabel label="Max Price" />
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-zinc-500 font-mono">₹0</span>
                        <span className="text-sm font-bold text-[#F3E5AB] font-display">
                            ₹{Number(priceRange).toLocaleString('en-IN')}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={maxPriceLimit}
                        step={1}
                        value={priceRange}
                        onChange={e => setPriceRange(Number(e.target.value))}
                    />
                </div>
            </div>

            <Divider />

            {marketplaces.length > 0 && (
                <div>
                    <SectionLabel label="Marketplace" />
                    <div className="space-y-1.5">
                        {marketplaces.map(store => {
                            const active = selectedMarketplaces.includes(store);
                            return (
                                <button
                                    key={store}
                                    onClick={() => toggleMarketplace(store)}
                                    className="w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200"
                                    style={active ? {
                                        background: 'rgba(229, 200, 120, 0.12)',
                                        border: '1px solid rgba(229, 200, 120, 0.35)',
                                        color: '#F3E5AB',
                                    } : {
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        color: '#a1a1aa',
                                    }}
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className="h-5 w-5 rounded flex items-center justify-center text-[9px] font-black shrink-0"
                                            style={active
                                                ? { background: 'rgba(229, 200, 120, 0.25)', color: '#F3E5AB', border: '1px solid rgba(229, 200, 120, 0.4)' }
                                                : { background: 'rgba(255,255,255,0.04)', color: '#71717a', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            {store.charAt(0)}
                                        </div>
                                        <span>{store}</span>
                                    </div>
                                    {active && (
                                        <svg className="w-3.5 h-3.5 text-[#E5C878]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {marketplaces.length > 0 && <Divider />}

            <div className="space-y-2.5">
                <SectionLabel label="Quick Filters" />

                <button
                    onClick={() => setVerifiedOnly(v => !v)}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={verifiedOnly ? {
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.12))',
                        border: '1px solid rgba(16,185,129,0.3)',
                        color: '#34d399',
                    } : {
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        color: '#a1a1aa',
                    }}
                >
                    <div className="flex items-center space-x-2">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Verified listings only</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${verifiedOnly ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                        <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform shadow-sm ${verifiedOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                </button>

                {hasBudget && (
                    <button
                        onClick={() => setInBudgetOnly(v => !v)}
                        className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200"
                        style={inBudgetOnly ? {
                            background: 'rgba(229, 200, 120, 0.12)',
                            border: '1px solid rgba(229, 200, 120, 0.35)',
                            color: '#F3E5AB',
                        } : {
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            color: '#a1a1aa',
                        }}
                    >
                        <div className="flex items-center space-x-2">
                            <svg className="w-3.5 h-3.5 shrink-0 text-[#E5C878]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span>Within budget only</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full transition-colors relative ${inBudgetOnly ? 'bg-[#E5C878]' : 'bg-zinc-700'}`}>
                            <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-[#09090B] transition-transform shadow-sm ${inBudgetOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}