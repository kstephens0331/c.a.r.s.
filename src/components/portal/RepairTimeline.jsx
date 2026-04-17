import { CheckCircle, Clock, Circle } from 'lucide-react';

const STATUSES = [
  { key: 'Estimate Scheduled', label: 'Estimate Scheduled', icon: '📋' },
  { key: 'Parts Ordered', label: 'Parts Ordered', icon: '📦' },
  { key: 'Parts Received', label: 'Parts Received', icon: '✅' },
  { key: 'Repairs Started', label: 'Repairs Started', icon: '🔧' },
  { key: 'Paint', label: 'Paint Shop', icon: '🎨' },
  { key: 'Quality Check', label: 'Quality Check', icon: '🔍' },
  { key: 'Ready for Pickup', label: 'Ready for Pickup', icon: '🚗' },
  { key: 'Complete', label: 'Complete', icon: '🏁' },
];

export default function RepairTimeline({ currentStatus }) {
  const currentIndex = STATUSES.findIndex(s => s.key === currentStatus);

  return (
    <div className="relative">
      {/* Desktop Timeline */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between relative">
          {/* Progress bar background */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />
          {/* Progress bar filled */}
          <div
            className="absolute top-5 left-0 h-1 bg-green-500 rounded-full transition-all duration-500"
            style={{
              width: currentIndex >= 0
                ? `${(currentIndex / (STATUSES.length - 1)) * 100}%`
                : '0%'
            }}
          />

          {STATUSES.map((status, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div key={status.key} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
                {/* Status circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-brandRed text-white ring-4 ring-brandRed/30 animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>

                {/* Label */}
                <span className={`mt-2 text-xs text-center max-w-[80px] leading-tight ${
                  isCompleted
                    ? 'text-green-600 font-medium'
                    : isCurrent
                      ? 'text-brandRed font-bold'
                      : 'text-gray-400'
                }`}>
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Timeline (vertical) */}
      <div className="md:hidden space-y-0">
        {STATUSES.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === STATUSES.length - 1;

          return (
            <div key={status.key} className="flex items-start">
              {/* Connector + Circle */}
              <div className="flex flex-col items-center mr-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-brandRed text-white ring-4 ring-brandRed/30'
                      : 'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-8 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>

              {/* Label */}
              <div className="pt-1 pb-4">
                <span className={`text-sm ${
                  isCompleted
                    ? 'text-green-600'
                    : isCurrent
                      ? 'text-brandRed font-bold'
                      : 'text-gray-400'
                }`}>
                  {status.icon} {status.label}
                  {isCurrent && <span className="ml-2 text-xs bg-brandRed/10 text-brandRed px-2 py-0.5 rounded-full">Current</span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
