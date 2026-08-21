import React from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'neutral' | 'accent' | 'positive' | 'negative' | 'warning';
  };
  breadcrumb?: {
    parent: string;
    current: string;
    onParentClick?: () => void;
  };
  onBack?: () => void;
  actions?: React.ReactNode;
  search?: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    count?: number;
    total?: number;
  };
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  breadcrumb,
  onBack,
  actions,
  search,
  children
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      width: '100%'
    }}>
      {/* Top Bar with Breadcrumb / Back button if present */}
      {(onBack || breadcrumb) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onBack && (
            <button
              onClick={onBack}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                padding: 0
              }}
              title="Go Back"
            >
              <ArrowLeft size={14} />
            </button>
          )}

          {breadcrumb && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span
                onClick={breadcrumb.onParentClick}
                style={{
                  color: 'var(--text-secondary)',
                  cursor: breadcrumb.onParentClick ? 'pointer' : 'default',
                  fontWeight: 500
                }}
              >
                {breadcrumb.parent}
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>/</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {breadcrumb.current}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Title, Subtitle, In-Header Search & Action Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 'var(--space-3)'
      }}>
        {/* Left: Title & Subtitle */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              {title}
            </h1>
            {badge && (
              <span className={`badge badge-${badge.variant || 'neutral'}`} style={{ fontSize: 10 }}>
                {badge.text}
              </span>
            )}
          </div>
          {subtitle && (
            <p style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginTop: 4,
              marginBottom: 0,
              lineHeight: 1.4
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Optional Search Input & Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}>
          {search && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '0 8px',
              height: 30,
              transition: 'border-color 150ms ease, box-shadow 150ms ease'
            }}>
              <Search size={13} style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder={search.placeholder || 'Search...'}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: 11.5,
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  width: 170
                }}
              />
              {search.value && (
                <button
                  onClick={() => search.onChange('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--text-tertiary)'
                  }}
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
              {search.count !== undefined && (
                <span className="mono text-muted" style={{ fontSize: 10, borderLeft: '1px solid var(--border-subtle)', paddingLeft: 6 }}>
                  {search.count}{search.total !== undefined ? `/${search.total}` : ''}
                </span>
              )}
            </div>
          )}

          {actions}
        </div>
      </div>

      {/* Optional In-Header Sub-Content (Filter tabs, Summary Metrics, etc.) */}
      {children}
    </div>
  );
};
