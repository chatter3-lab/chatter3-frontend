import React from 'react';

const shimmer = `@keyframes shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}`;
const baseStyle = { background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.5s infinite', borderRadius: 6 };

export function SkeletonText({ lines = 3, style = {} }) {
  return (
    <div style={style}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ ...baseStyle, height: 12, marginBottom: 8, width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
      <style>{shimmer}</style>
    </div>
  );
}

export function SkeletonCircle({ size = 40, style = {} }) {
  return <div style={{ ...baseStyle, width: size, height: size, borderRadius: '50%', ...style }}><style>{shimmer}</style></div>;
}

export function SkeletonCard({ style = {} }) {
  return (
    <div style={{ padding: '1rem', background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', ...style }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <SkeletonCircle size={40} />
        <div style={{ flex: 1 }}><SkeletonText lines={1} /><SkeletonText lines={1} style={{ marginTop: 4 }} /></div>
      </div>
      <SkeletonText lines={2} />
      <style>{shimmer}</style>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
      <SkeletonCard />
      <style>{shimmer}</style>
    </div>
  );
}
