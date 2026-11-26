import type { RefObject } from 'react';
import type { Period } from '../types';
import type { ChartColumn } from '../chartData';
import { formatEntryCount } from '../format';

type Props = {
  period: Period;
  onPeriodChange: (period: Period) => void;
  safeChartOffset: number;
  minChartOffset: number;
  onOffsetChange: (offset: number) => void;
  chartTitle: string;
  chartTotal: number;
  chartData: ChartColumn[];
  scrollRef: RefObject<HTMLDivElement | null>;
  chartSelection: string | null;
  onToggleSelection: (key: string) => void;
};

// "Месяц / Год" switch and the "Динамика" chart with month/year arrows.
export function DynamicsChart({
  period, onPeriodChange, safeChartOffset, minChartOffset, onOffsetChange, chartTitle, chartTotal, chartData, scrollRef, chartSelection, onToggleSelection,
}: Props) {
  return (
    <>
      <section className="period-switch">
        {(['Месяц', 'Год'] as Period[]).map((item) => (
          <button
            key={item}
            className={period === item ? 'period active' : 'period'}
            onClick={() => onPeriodChange(item)}
          >
            {item}
          </button>
        ))}
      </section>

      <section className="chart-card">
        <div className="section-heading">
          <div>
            <p className="muted chart-caption">
              Количество записей
              {safeChartOffset !== 0 && <button type="button" className="chart-today-button" onClick={() => onOffsetChange(0)}>К текущему</button>}
            </p>
            <div className="chart-nav">
              <button type="button" aria-label={period === 'Месяц' ? 'Предыдущий месяц' : 'Предыдущий год'} disabled={safeChartOffset <= minChartOffset} onClick={() => onOffsetChange(safeChartOffset - 1)}>‹</button>
              <h2>{chartTitle}</h2>
              <button type="button" aria-label={period === 'Месяц' ? 'Следующий месяц' : 'Следующий год'} disabled={safeChartOffset >= 0} onClick={() => onOffsetChange(safeChartOffset + 1)}>›</button>
            </div>
          </div>
          <span className="total">{formatEntryCount(chartTotal)}</span>
        </div>
        <div ref={scrollRef} className={`chart ${period === 'Месяц' ? 'month-chart' : 'year-chart'}`}>
          {chartData.map((item, index) => (
            <div
              className={`chart-column${chartSelection === item.key ? ' selected' : ''}`}
              key={`${period}-${item.label}-${index}`}
              role="button"
              tabIndex={0}
              aria-pressed={chartSelection === item.key}
              aria-label={`Показать записи: ${item.key}`}
              onClick={() => onToggleSelection(item.key)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onToggleSelection(item.key); } }}
            >
              <span className="bar-count">{item.count}</span>
              <div className="bar-area">
                <div
                  className={`bar ${item.count === 0 ? 'empty' : ''}`}
                  style={{ height: `${item.count === 0 ? 4 : item.count * (period === 'Год' ? 5 : 16) + 4}px` }}
                />
              </div>
              <span className="bar-day">{item.label}</span>
              {period === 'Месяц' && <span className="bar-date">{item.date}</span>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
